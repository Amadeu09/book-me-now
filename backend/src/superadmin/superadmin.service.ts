import { BadRequestException, Injectable, Logger, NotFoundException, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SessionCacheService } from '../auth/session-cache.service';
import { TokenBlacklistService } from '../auth/token-blacklist.service';
import { hashToken, nouToken } from '../common/utils/token.utils';
import { esc, plantillaEmail } from '../common/utils/email-plantilla';
import { normalitzarPaginacio } from '../common/utils/paginacio.utils';
import { SUPERADMIN_DURADA_S, clauSuperAdmin } from './superadmin.constants';
import { CrearInvitacioDto } from './dto/superadmin.dto';

// Mateix cost que un hash real: el temps de resposta no revela si l'email existeix
const HASH_FICTICI = '$2b$10$Bkn2RD4V8ZAKCGGqmEj/2ejrSOmc1xedPvFfoJMOzPnKzvCw1QHMW';
const RESET_DURADA_MS = 60 * 60 * 1000;
const ALTA_DURADA_MS = 48 * 60 * 60 * 1000;

export type EstatInvitacio = 'PENDENT' | 'USADA' | 'CADUCADA' | 'REVOCADA';

@Injectable()
export class SuperAdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperAdminService.name);
  private readonly appUrl: string;
  private readonly clau: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
    private readonly sessionCache: SessionCacheService,
    private readonly blacklist: TokenBlacklistService,
    config: ConfigService,
  ) {
    this.appUrl = (config.get<string>('APP_URL') ?? 'https://app.bookmenow.org').replace(/\/$/, '');
    this.clau = clauSuperAdmin(config.getOrThrow<string>('JWT_SECRET'), config.get<string>('SUPERADMIN_JWT_SECRET'));
    this.emailAlta = config.get<string>('SUPERADMIN_EMAIL')?.trim().toLowerCase();
  }

  private readonly emailAlta?: string;

  /**
   * L'únic camí per crear un superadmin: la variable d'entorn SUPERADMIN_EMAIL.
   * Si encara no existeix, es crea sense contrasenya usable i s'envia un enllaç per posar-la.
   */
  async onApplicationBootstrap() {
    if (!this.emailAlta) return;
    try {
      const existent = await this.prisma.superAdmin.findUnique({ where: { email: this.emailAlta } });
      if (existent) return;
      await this.prisma.superAdmin.create({
        data: { email: this.emailAlta, hash: await bcrypt.hash(nouToken(), 10) },
      });
      this.logger.log('Superadmin creat a partir de SUPERADMIN_EMAIL; enviant enllaç per posar la contrasenya');
      await this.enviarEnllacContrasenya(this.emailAlta, ALTA_DURADA_MS, true);
    } catch (e) {
      this.logger.error(`No s'ha pogut preparar el superadmin: ${(e as Error).message}`);
    }
  }

  /* ── Accés ─────────────────────────────────────────── */

  async login(email: string, password: string) {
    const admin = await this.prisma.superAdmin.findUnique({ where: { email: email.trim().toLowerCase() } });
    const ok = await bcrypt.compare(password, admin?.hash ?? HASH_FICTICI);
    if (!admin || !ok) {
      this.logger.warn('Intent fallit d\'accés de superadmin');
      throw new UnauthorizedException('Credencials invàlides');
    }
    const token = this.jwt.sign(
      { sub: admin.id, email: admin.email, tipus: 'superadmin' },
      { secret: this.clau, expiresIn: SUPERADMIN_DURADA_S },
    );
    await this.registrar(admin.id, 'LOGIN');
    return { token, email: admin.email, caducaEn: SUPERADMIN_DURADA_S };
  }

  async logout(token: string, superAdminId: number) {
    await this.blacklist.addToBlacklist(token, new Date(Date.now() + SUPERADMIN_DURADA_S * 1000));
    await this.registrar(superAdminId, 'LOGOUT');
  }

  /** Sempre respon igual, existeixi o no l'email. */
  async recuperar(email: string) {
    const net = email.trim().toLowerCase();
    const admin = await this.prisma.superAdmin.findUnique({ where: { email: net } });
    if (admin) await this.enviarEnllacContrasenya(net, RESET_DURADA_MS, false);
  }

  async establirContrasenya(token: string, password: string) {
    const admin = await this.prisma.superAdmin.findUnique({ where: { resetToken: hashToken(token) } });
    if (!admin || !admin.resetTokenExpiry || admin.resetTokenExpiry < new Date()) {
      throw new BadRequestException("L'enllaç no és vàlid o ha caducat");
    }
    await this.prisma.superAdmin.update({
      where: { id: admin.id },
      data: {
        hash: await bcrypt.hash(password, 12),
        resetToken: null,
        resetTokenExpiry: null,
        // Tanca qualsevol sessió oberta amb la contrasenya anterior
        credencialsCanviades: new Date(),
      },
    });
    await this.registrar(admin.id, 'CONTRASENYA_CANVIADA');
  }

  private async enviarEnllacContrasenya(email: string, duradaMs: number, alta: boolean) {
    const token = nouToken();
    await this.prisma.superAdmin.update({
      where: { email },
      data: { resetToken: hashToken(token), resetTokenExpiry: new Date(Date.now() + duradaMs) },
    });
    const url = `${this.appUrl}/superadmin/contrasenya?token=${token}`;
    const res = await this.email.send({
      to: email,
      subject: alta ? 'Activa el teu accés de superadmin a BookMeNow' : 'Restableix la contrasenya de superadmin',
      html: plantillaEmail({
        titol: alta ? "Activa el teu accés d'administració" : 'Restableix la contrasenya',
        cos: `<p>Fes servir aquest enllaç per posar la contrasenya del panell d'administració de BookMeNow. Caduca en ${alta ? '48 hores' : '1 hora'}.</p><p>Si no ho has demanat tu, ignora aquest correu.</p>`,
        boto: { text: 'Posar la contrasenya', url },
      }),
    });
    if (!res.ok) this.logger.error(`No s'ha pogut enviar l'enllaç de contrasenya del superadmin: ${res.error}`);
  }

  /* ── Empreses ──────────────────────────────────────── */

  async llistarEmpreses(cerca: string | undefined, page?: number, rows?: number) {
    const { page: pagina, rows: mida } = normalitzarPaginacio(page ?? 1, rows ?? 20, 20);
    const skip = (pagina - 1) * mida;
    const q = cerca?.trim();
    const where: Prisma.EmpresaWhereInput = q
      ? { OR: [{ nom: { contains: q, mode: 'insensitive' } }, { ubicacio: { contains: q, mode: 'insensitive' } }, { usuaris: { some: { email: { contains: q, mode: 'insensitive' } } } }] }
      : {};
    const fa30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [total, empreses] = await Promise.all([
      this.prisma.empresa.count({ where }),
      this.prisma.empresa.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: mida,
        select: {
          id: true, nom: true, tipo: true, ubicacio: true, activa: true, createdAt: true,
          usuaris: { where: { rol: 'ADMIN_GENERAL' }, select: { email: true }, take: 3, orderBy: { id: 'asc' } },
          _count: { select: { usuaris: true, treballadors: true } },
        },
      }),
    ]);
    const reserves = await this.prisma.reserva.groupBy({
      by: ['empresaId'],
      where: { empresaId: { in: empreses.map(e => e.id) }, createdAt: { gte: fa30 } },
      _count: { _all: true },
    });
    const perEmpresa = new Map(reserves.map(r => [r.empresaId, r._count._all]));
    return {
      data: empreses.map(({ usuaris, _count, ...e }) => ({
        ...e,
        admins: usuaris.map(u => u.email),
        usuaris: _count.usuaris,
        treballadors: _count.treballadors,
        reserves30d: perEmpresa.get(e.id) ?? 0,
      })),
      total,
      page: pagina,
      totalPages: Math.max(1, Math.ceil(total / mida)),
    };
  }

  async canviarEstatEmpresa(id: number, activa: boolean, superAdminId: number) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id }, select: { id: true, nom: true, activa: true } });
    if (!empresa) throw new NotFoundException('Empresa no trobada');
    if (empresa.activa === activa) return { id, activa };

    await this.prisma.$transaction(async (tx) => {
      await tx.empresa.update({ where: { id }, data: { activa } });
      // En desactivar, totes les sessions dels seus usuaris deixen de valer a l'instant
      if (!activa) await tx.usuari.updateMany({ where: { empresaId: id }, data: { credencialsCanviades: new Date() } });
    });
    if (!activa) {
      const usuaris = await this.prisma.usuari.findMany({ where: { empresaId: id }, select: { id: true } });
      usuaris.forEach(u => this.sessionCache.invalidateUser(u.id));
    }
    await this.registrar(superAdminId, activa ? 'EMPRESA_ACTIVADA' : 'EMPRESA_DESACTIVADA', { empresaId: id, nom: empresa.nom });
    return { id, activa };
  }

  /* ── Invitacions ───────────────────────────────────── */

  async crearInvitacio(dto: CrearInvitacioDto, superAdminId: number) {
    const email = dto.email?.trim().toLowerCase() || null;
    if (dto.enviarEmail && !email) throw new BadRequestException("Per enviar-la per correu cal indicar l'email");
    const token = nouToken();
    const dies = dto.dies ?? 7;
    const invitacio = await this.prisma.invitacio.create({
      data: {
        tokenHash: hashToken(token),
        email,
        nomEmpresa: dto.nomEmpresa?.trim() || null,
        caduca: new Date(Date.now() + dies * 24 * 60 * 60 * 1000),
        creadaPerId: superAdminId,
      },
    });
    const enllac = `${this.appUrl}/register?invitacio=${token}`;

    let emailEnviat = false;
    if (dto.enviarEmail && email) {
      const res = await this.email.send({
        to: email,
        subject: 'Et convidem a BookMeNow',
        html: plantillaEmail({
          titol: 'Et convidem a BookMeNow',
          cos: `<p>Ja pots crear el compte${invitacio.nomEmpresa ? ` de <b>${esc(invitacio.nomEmpresa)}</b>` : ' del teu negoci'} a BookMeNow i començar a rebre reserves online.</p><p>L'enllaç és personal i caduca en ${dies} ${dies === 1 ? 'dia' : 'dies'}.</p>`,
          boto: { text: 'Crear el compte', url: enllac },
          peu: 'Si no esperaves aquest correu, pots ignorar-lo.',
        }),
      });
      emailEnviat = res.ok;
    }

    await this.registrar(superAdminId, 'INVITACIO_CREADA', { invitacioId: invitacio.id, email, nomEmpresa: invitacio.nomEmpresa, dies, emailEnviat });
    return { invitacio: this.ambEstat(invitacio), enllac, emailEnviat };
  }

  async llistarInvitacions(page?: number, rows?: number) {
    const { page: pagina, rows: mida } = normalitzarPaginacio(page ?? 1, rows ?? 20, 20);
    const skip = (pagina - 1) * mida;
    const [total, invitacions] = await Promise.all([
      this.prisma.invitacio.count(),
      this.prisma.invitacio.findMany({ orderBy: { createdAt: 'desc' }, skip, take: mida }),
    ]);
    const empreses = await this.prisma.empresa.findMany({
      where: { id: { in: invitacions.map(i => i.empresaId).filter((x): x is number => x !== null) } },
      select: { id: true, nom: true },
    });
    const noms = new Map(empreses.map(e => [e.id, e.nom]));
    return {
      data: invitacions.map(i => ({ ...this.ambEstat(i), empresaNom: i.empresaId ? noms.get(i.empresaId) ?? null : null })),
      total,
      page: pagina,
      totalPages: Math.max(1, Math.ceil(total / mida)),
    };
  }

  async revocarInvitacio(id: number, superAdminId: number) {
    const res = await this.prisma.invitacio.updateMany({ where: { id, usadaAt: null, revocada: false }, data: { revocada: true } });
    if (res.count === 0) throw new BadRequestException('La invitació no existeix o ja no es pot revocar');
    await this.registrar(superAdminId, 'INVITACIO_REVOCADA', { invitacioId: id });
    return { id, revocada: true };
  }

  private ambEstat<T extends { tokenHash: string; usadaAt: Date | null; revocada: boolean; caduca: Date }>(i: T) {
    const { tokenHash: _ocult, ...resta } = i;
    const estat: EstatInvitacio = i.usadaAt ? 'USADA' : i.revocada ? 'REVOCADA' : i.caduca < new Date() ? 'CADUCADA' : 'PENDENT';
    return { ...resta, estat };
  }

  /* ── Registre d'accions ────────────────────────────── */

  async llistarRegistre(page?: number, rows?: number) {
    const { page: pagina, rows: mida } = normalitzarPaginacio(page ?? 1, rows ?? 20, 20);
    const skip = (pagina - 1) * mida;
    const [total, data] = await Promise.all([
      this.prisma.registreAccio.count(),
      this.prisma.registreAccio.findMany({ orderBy: { createdAt: 'desc' }, skip, take: mida, include: { superAdmin: { select: { email: true } } } }),
    ]);
    return { data, total, page: pagina, totalPages: Math.max(1, Math.ceil(total / mida)) };
  }

  async registrar(superAdminId: number, accio: string, detall?: Prisma.InputJsonValue) {
    try {
      await this.prisma.registreAccio.create({ data: { superAdminId, accio, detall } });
    } catch (e) {
      this.logger.error(`No s'ha pogut registrar l'acció ${accio}: ${(e as Error).message}`);
    }
  }
}
