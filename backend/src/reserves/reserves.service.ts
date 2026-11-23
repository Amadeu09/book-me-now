import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservaDto, ModificarReservaGestioDto } from './dto/reserves.dto';
import { Prisma, ReservaEstat } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { getRotacioIdx } from '../common/utils/horari.utils';
import { AvisosService } from '../avisos/avisos.service';
import { escapeHtml } from '../common/utils/html.utils';

/** Espai de noms dels advisory locks de reserves. */
const LOCK_NS_RESERVES = 1001;

/** Rang màxim de dies que es pot demanar d'una vegada a l'agenda. */
const MAX_DIES_RANG = 62;

/** Parseja una data YYYY-MM-DD (hora local) o llança 400. */
function parseDataDia(valor: string | undefined, camp: string): Date {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new BadRequestException(`'${camp}' ha de tenir el format YYYY-MM-DD`);
  }
  const [any, mes, dia] = valor.split('-').map(Number);
  const data = new Date(any, mes - 1, dia);
  if (isNaN(data.getTime()) || data.getMonth() !== mes - 1) {
    throw new BadRequestException(`'${camp}' no és una data vàlida`);
  }
  return data;
}

/** Rang [inici 00:00, fi 23:59:59.999] validat. */
function parseRangDies(inici: string | undefined, fi: string | undefined): { desde: Date; fins: Date } {
  const desde = parseDataDia(inici, 'inici');
  const fins = parseDataDia(fi, 'fi');
  fins.setHours(23, 59, 59, 999);
  if (fins < desde) throw new BadRequestException("'fi' no pot ser anterior a 'inici'");
  if ((fins.getTime() - desde.getTime()) / 86_400_000 > MAX_DIES_RANG) {
    throw new BadRequestException(`El rang no pot superar ${MAX_DIES_RANG} dies`);
  }
  return { desde, fins };
}

function normalitzarEmail(email?: string | null): string | null {
  const net = email?.trim().toLowerCase();
  return net ? net : null;
}

function formatarDataHora(data: Date): { dia: string; hora: string } {
  return {
    dia: data.toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Madrid' }),
    hora: data.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }),
  };
}

@Injectable()
export class ReservesService {
  private readonly logger = new Logger(ReservesService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private email: EmailService,
    private readonly avisos: AvisosService,
  ) { }

  private get portalUrl(): string {
    return this.config.get<string>('PORTAL_URL', 'http://localhost:3002');
  }

  /**
   * Client de la reserva, dins la transacció.
   * - Sense email: sempre un client nou.
   * - Amb email: es reutilitza el client existent de l'empresa. Només el personal
   *   (`actualitzarDades`) pot canviar-ne el nom i el telèfon; una reserva pública no
   *   pot sobreescriure les dades d'un client que ja existeix.
   */
  private async resoldreClient(
    tx: Prisma.TransactionClient,
    empresaId: number,
    dades: { nom: string; email: string | null; telefon?: string | null },
    actualitzarDades: boolean,
  ) {
    if (!dades.email) {
      return tx.client.create({
        data: { nom: dades.nom, email: null, telefon: dades.telefon ?? null, empresaId },
      });
    }
    return tx.client.upsert({
      where: { email_empresaId: { email: dades.email, empresaId } },
      update: actualitzarDades ? { nom: dades.nom, telefon: dades.telefon ?? null } : {},
      create: { nom: dades.nom, email: dades.email, telefon: dades.telefon ?? null, empresaId },
    });
  }

  private async checkSlotAvailable(
    treballadorId: number,
    empresaId: number,
    serveiDuradaMin: number,
    dataHoraInici: Date,
  ): Promise<void> {
    const dayStart = new Date(dataHoraInici); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dataHoraInici); dayEnd.setHours(23, 59, 59, 999);

    const empresaAbsence = await this.prisma.absenciaEmpresa.findFirst({
      where: { empresaId, inici: { lte: dayEnd }, fi: { gte: dayStart } },
    });
    if (empresaAbsence) throw new ConflictException('No hi ha disponibilitat per a aquest horari');

    const workerAbsence = await this.prisma.absencia.findFirst({
      where: { treballadorId, estat: 'APROVADA', inici: { lte: dayEnd }, fi: { gte: dayStart } },
    });
    if (workerAbsence) throw new ConflictException('No hi ha disponibilitat per a aquest horari');

    const treballadorAmbPlantilla = await this.prisma.treballador.findUnique({
      where: { id: treballadorId },
      include: {
        plantilla: { include: { rotacions: { include: { dies: { include: { trams: true } } } } } },
      },
    });

    const plantilla = treballadorAmbPlantilla?.plantilla;
    if (!plantilla || !plantilla.rotacions?.length) {
      throw new ConflictException('No hi ha disponibilitat per a aquest horari');
    }

    let dow = dataHoraInici.getDay();
    if (dow === 0) dow = 7;

    const rotacionsOrdenades = [...plantilla.rotacions].sort((a, b) => a.index - b.index);
    const refDate = new Date(treballadorAmbPlantilla.dataIniciRotacio ?? dataHoraInici);
    refDate.setHours(0, 0, 0, 0);
    const rotacioIdx = getRotacioIdx(rotacionsOrdenades, refDate, dataHoraInici);
    const rotacio = rotacionsOrdenades[rotacioIdx];

    if (!rotacio) throw new ConflictException('No hi ha disponibilitat per a aquest horari');

    const diaRotacio = rotacio.dies?.find(d => d.dow === dow);
    if (!diaRotacio || diaRotacio.esDescans || !diaRotacio.trams?.length) {
      throw new ConflictException('No hi ha disponibilitat per a aquest horari');
    }

    const slotStartMin = dataHoraInici.getHours() * 60 + dataHoraInici.getMinutes();
    const slotEndMin = slotStartMin + serveiDuradaMin;

    const withinTram = diaRotacio.trams.some(t => slotStartMin >= t.iniciMin && slotEndMin <= t.fiMin);
    if (!withinTram) throw new ConflictException('No hi ha disponibilitat per a aquest horari');
  }

  /**
   * Bloqueja el treballador dins la transacció i comprova que no hi hagi cap reserva
   * (no cancel·lada) solapada. El lock evita dobles reserves amb peticions simultànies.
   */
  private async assertSenseSolapament(
    tx: Prisma.TransactionClient,
    treballadorId: number,
    inici: Date,
    fi: Date,
    excloureReservaId?: number,
  ): Promise<void> {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${LOCK_NS_RESERVES}::int, ${treballadorId}::int)`;

    const dayStart = new Date(inici); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(inici); dayEnd.setHours(23, 59, 59, 999);

    const existents = await tx.reserva.findMany({
      where: {
        treballadorId,
        dataHora: { gte: dayStart, lte: dayEnd },
        estat: { not: 'CANCELLADA' },
        ...(excloureReservaId !== undefined && { id: { not: excloureReservaId } }),
      },
      include: { servei: { select: { duradaMin: true } } },
    });

    const solapada = existents.some((r) => {
      const rFi = new Date(r.dataHora.getTime() + r.servei.duradaMin * 60 * 1000);
      return r.dataHora < fi && rFi > inici;
    });

    if (solapada) throw new ConflictException('Aquest horari ja no està disponible');
  }

  /** Reserves fetes pel client (portal o enllaç): ni en el passat ni més enllà de diasAntesReserva. */
  private async checkFinestraClient(empresaId: number, dataHoraInici: Date): Promise<void> {
    if (dataHoraInici <= new Date()) {
      throw new BadRequestException('No es pot reservar una hora ja passada');
    }
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { diasAntesReserva: true },
    });
    const limit = new Date();
    limit.setHours(0, 0, 0, 0);
    limit.setDate(limit.getDate() + (empresa?.diasAntesReserva ?? 14));
    if (dataHoraInici >= limit) {
      throw new BadRequestException('Aquesta data encara no està disponible per reservar');
    }
  }

  private async createReservaInternal(
    dto: CreateReservaDto,
    options: { checkActiu: boolean; esClient: boolean; empresaIdUsuari?: number },
  ): Promise<any> {
    const servei = await this.prisma.servei.findUnique({ where: { id: dto.idServei } });
    if (!servei || (options.checkActiu && !servei.actiu)) throw new NotFoundException('Servei no trobat');

    const treballador = await this.prisma.treballador.findUnique({
      where: { id: dto.idTreballador },
      include: { empresa: { select: { activa: true } } },
    });
    if (!treballador || (options.checkActiu && !treballador.actiu)) throw new NotFoundException('Treballador no trobat');
    if (options.checkActiu && !treballador.empresa.activa) throw new NotFoundException('Empresa no trobada');
    if (servei.empresaId !== treballador.empresaId) throw new NotFoundException('Servei no trobat');
    if (options.empresaIdUsuari !== undefined && treballador.empresaId !== options.empresaIdUsuari) {
      throw new ForbiddenException('El treballador no pertany a la teva empresa');
    }

    const treballadorServei = await this.prisma.treballadorServei.findUnique({
      where: { treballadorId_serveiId: { treballadorId: dto.idTreballador, serveiId: dto.idServei } },
    });
    if (!treballadorServei) throw new ForbiddenException('El treballador no ofereix aquest servei');

    const email = normalitzarEmail(dto.email);
    if (options.esClient && !email) throw new BadRequestException("L'email és obligatori per reservar");

    const dataHoraInici = new Date(`${dto.data}T${dto.hora}:00`);

    if (isNaN(dataHoraInici.getTime())) throw new BadRequestException(`Data o hora invàlida: "${dto.data}T${dto.hora}"`);

    const dataHoraFinal = new Date(dataHoraInici.getTime() + servei.duradaMin * 60 * 1000);

    if (options.esClient) await this.checkFinestraClient(treballador.empresaId, dataHoraInici);
    await this.checkSlotAvailable(dto.idTreballador, treballador.empresaId, servei.duradaMin, dataHoraInici);

    const tokenValoracio = email ? randomUUID() : null;

    const reserva = await this.prisma.$transaction(async (tx) => {
      await this.assertSenseSolapament(tx, dto.idTreballador, dataHoraInici, dataHoraFinal);

      const client = await this.resoldreClient(
        tx,
        treballador.empresaId,
        { nom: dto.nom, email, telefon: dto.telefon },
        !options.esClient,
      );

      const tokenGestio = email ? randomUUID() : null;

      return tx.reserva.create({
        data: {
          treballadorId: dto.idTreballador,
          dataHora: dataHoraInici,
          empresaId: treballador.empresaId,
          serveiId: dto.idServei,
          clientId: client.id,
          clientEmail: email,
          clientNom: dto.nom,
          observacions: dto.observacions,
          estat: 'CONFIRMADA',
          tokenGestio,
          tokenValoracio,
        },
        include: { servei: true, treballador: true },
      });
    });

    if (email) {
      this.enviarEmailConfirmacio(reserva, { ...dto, email }, dataHoraInici, reserva.tokenGestio);
      // L'email post-cita l'envia EmailPostCitaService quan acaba la cita.
    }

    // Reserva feta pel client des del portal: avisem el negoci
    if (options.esClient) {
      this.avisos.avisarNegoci({
        tipus: 'RESERVA_NOVA',
        reservaId: reserva.id,
        empresaId: reserva.empresaId,
        treballadorId: reserva.treballadorId,
        clientNom: reserva.clientNom,
        serveiNom: reserva.servei.nom,
        dataHora: reserva.dataHora,
      });
    }

    return reserva;
  }

  async create(dto: CreateReservaDto, user: CurrentUserData) {
    return this.createReservaInternal(dto, { checkActiu: false, esClient: false, empresaIdUsuari: user.empresaId });
  }

  async createPublic(dto: CreateReservaDto) {
    return this.createReservaInternal(dto, { checkActiu: true, esClient: true });
  }

  async delete(idReserva: number, user: CurrentUserData) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: idReserva },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no trobada');
    }

    if (reserva.empresaId !== user.empresaId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.reserva.delete({
      where: { id: idReserva },
    });
  }

  async update(idReserva: number, dto: CreateReservaDto, user: CurrentUserData) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: idReserva },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no trobada');
    }

    if (reserva.empresaId !== user.empresaId) {
      throw new ForbiddenException('Access denied');
    }

    const servei = await this.prisma.servei.findUnique({
      where: { id: dto.idServei },
    });

    if (!servei) {
      throw new NotFoundException('Servei no trobat');
    }

    const treballador = await this.prisma.treballador.findUnique({
      where: { id: dto.idTreballador },
    });

    if (!treballador) {
      throw new NotFoundException('Treballador no trobat');
    }

    if (treballador.empresaId !== user.empresaId || servei.empresaId !== user.empresaId) {
      throw new ForbiddenException('El treballador o el servei no pertanyen a la teva empresa');
    }

    const treballadorServei = await this.prisma.treballadorServei.findUnique({
      where: { treballadorId_serveiId: { treballadorId: dto.idTreballador, serveiId: dto.idServei } },
    });
    if (!treballadorServei) throw new ForbiddenException('El treballador no ofereix aquest servei');

    const dataHoraInici = new Date(`${dto.data}T${dto.hora}:00`);
    if (isNaN(dataHoraInici.getTime())) throw new BadRequestException('Data o hora invàlida');

    const dataHoraFinal = new Date(dataHoraInici.getTime() + servei.duradaMin * 60 * 1000);

    await this.checkSlotAvailable(
      dto.idTreballador,
      treballador.empresaId,
      servei.duradaMin,
      dataHoraInici,
    );

    return this.prisma.$transaction(async (tx) => {
      await this.assertSenseSolapament(tx, dto.idTreballador, dataHoraInici, dataHoraFinal, idReserva);

      const email = normalitzarEmail(dto.email);
      // Si no canvia l'email ni el nom, es manté el mateix client (abans, sense email,
      // la reserva acabava assignada al primer client de l'empresa).
      const client = !email && reserva.clientId !== null && reserva.clientNom === dto.nom
        ? { id: reserva.clientId }
        : await this.resoldreClient(tx, treballador.empresaId, { nom: dto.nom, email, telefon: dto.telefon }, true);

      return tx.reserva.update({
        where: { id: idReserva },
        data: {
          treballadorId: dto.idTreballador,
          dataHora: dataHoraInici,
          empresaId: treballador.empresaId,
          serveiId: dto.idServei,
          clientId: client.id,
          clientEmail: email,
          clientNom: dto.nom,
          observacions: dto.observacions,
        },
      });
    });
  }

  async updateEstado(idReserva: number, nouEstat: ReservaEstat, user: CurrentUserData) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: idReserva },
      include: {
        servei: { select: { nom: true } },
        empresa: { select: { nom: true } },
      },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no trobada');
    }

    if (reserva.empresaId !== user.empresaId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.reserva.update({
      where: { id: idReserva },
      data: { estat: nouEstat },
    });

    if (nouEstat === 'CANCELLADA' && reserva.estat !== 'CANCELLADA' && reserva.clientEmail) {
      this.enviarEmailCancellacio(reserva);
    }

    return updated;
  }

  private enviarEmailCancellacio(reserva: {
    empresaId: number;
    clientNom?: string | null;
    clientEmail: string;
    dataHora: Date;
    servei: { nom: string };
    empresa: { nom: string };
  }): void {
    const portalUrl = this.portalUrl;
    const { dia: dataFormatada, hora: horaFormatada } = formatarDataHora(reserva.dataHora);

    this.email.sendInBackground({
      tipus: 'CANCELLACIO_CLIENT',
      empresaId: reserva.empresaId,
      to: reserva.clientEmail,
      subject: `Reserva cancel·lada — ${reserva.empresa.nom}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;">
          <h2 style="color:#6366F1;margin:0 0 4px">BookMeNow</h2>
          <p style="color:#6B7280;font-size:13px;margin:0 0 24px">${escapeHtml(reserva.empresa.nom)}</p>
          <h3 style="color:#0F172A;margin:0 0 12px">La teva reserva ha estat cancel·lada</h3>
          <p style="color:#334155;font-size:15px;">Hola ${escapeHtml(reserva.clientNom)},</p>
          <p style="color:#334155;font-size:15px;">Lamentem informar-te que la teva cita ha estat cancel·lada per l'empresa:</p>
          <div style="background:#F8F9FB;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;color:#334155;font-size:14px;"><strong>Servei:</strong> ${escapeHtml(reserva.servei.nom)}</p>
            <p style="margin:4px 0;color:#334155;font-size:14px;"><strong>Data:</strong> ${dataFormatada}</p>
            <p style="margin:4px 0;color:#334155;font-size:14px;"><strong>Hora:</strong> ${horaFormatada}</p>
          </div>
          <p style="color:#334155;font-size:15px;">Si vols tornar a reservar, pots fer-ho des del nostre portal:</p>
          <a href="${portalUrl}" style="display:inline-block;margin:8px 0 16px;padding:12px 24px;background:#6366F1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
            Fer nova reserva
          </a>
          <p style="color:#9CA3AF;font-size:12px;margin-top:16px;">Disculpa les molèsties.</p>
        </div>
      `,
    });
  }

  async findAllByTreballador(idTreballador: number, currentUserEmpresaId: number, currentUserId: number, inici?: string, fi?: string) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    let treballador;
    if (user.rol === 'EMPLEAT') {
      treballador = await this.prisma.treballador.findFirst({
        where: { idUsuari: currentUserId },
      });
    } else {
      // Només per id de treballador: abans també s'acceptava l'id d'usuari, i com que
      // són seqüències diferents el mateix número podia correspondre a dues persones.
      treballador = await this.prisma.treballador.findFirst({
        where: { id: idTreballador, empresaId: currentUserEmpresaId },
      });
    }

    if (!treballador) {
      throw new NotFoundException('Treballador no trobat');
    }

    if (treballador.empresaId !== currentUserEmpresaId) {
      throw new ForbiddenException('No pots veure les reserves d\'un treballador d\'una altra empresa');
    }

    let dateFilter = {};
    if (inici || fi) {
      const { desde, fins } = parseRangDies(inici, fi);
      dateFilter = { dataHora: { gte: desde, lte: fins } };
    }

    const reserves = await this.prisma.reserva.findMany({
      where: {
        treballadorId: treballador.id,
        ...dateFilter
      },
      include: {
        servei: true,
        treballador: true,
        client: true,
      },
    });
    return reserves;
  }

  async findAllBySetmana(empresaId: number, inici: string, fi: string, currentUserId: number, treballadorId?: string) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.empresaId !== empresaId || user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Sense permisos per veure totes les reserves de l\'empresa');
    }

    const { desde: dataInici, fins: dataFi } = parseRangDies(inici, fi);

    const idTreballador = treballadorId ? Number(treballadorId) : undefined;
    if (idTreballador !== undefined && !Number.isInteger(idTreballador)) {
      throw new BadRequestException("'treballadorId' ha de ser un número");
    }

    if (idTreballador !== undefined) {
      const userBooking = await this.prisma.treballador.findUnique({
        where: { id: idTreballador },
      });

      if (!userBooking) {
        throw new NotFoundException('Treballador no trobat');
      }

      if (userBooking.empresaId !== empresaId) {
        throw new ForbiddenException('No pots veure les reserves d\'un treballador d\'una altra empresa');
      }
    }

    const reserves = await this.prisma.reserva.findMany({
      where: {
        ...(idTreballador !== undefined && { treballadorId: idTreballador }),
        empresaId: empresaId,
        dataHora: {
          gte: dataInici,
          lte: dataFi,
        },
      },
      include: {
        servei: true,
        treballador: true,
        client: true,
      },
    });

    return reserves;
  }

  private enviarEmailConfirmacio(
    reserva: { empresaId: number; servei: { nom: string; duradaMin: number } },
    dto: { nom: string; email: string },
    dataHoraInici: Date,
    tokenGestio: string | null,
    assumpte = 'Reserva confirmada',
  ): void {
    const { dia: dataFormatada, hora: horaFormatada } = formatarDataHora(dataHoraInici);
    const gestioLink = tokenGestio ? `${this.portalUrl}/reserva/${tokenGestio}` : null;

    this.email.sendInBackground({
      tipus: assumpte === 'Reserva modificada' ? 'MODIFICACIO_CLIENT' : 'CONFIRMACIO_CLIENT',
      empresaId: reserva.empresaId,
      to: dto.email,
      subject: assumpte,
      html: `
        <h2>La teva reserva ha estat confirmada!</h2>
        <p>Hola ${escapeHtml(dto.nom)},</p>
        <p>Et confirmem la teva cita amb els detalls següents:</p>
        <ul>
          <li><strong>Servei:</strong> ${escapeHtml(reserva.servei.nom)}</li>
          <li><strong>Data:</strong> ${dataFormatada}</li>
          <li><strong>Hora:</strong> ${horaFormatada}</li>
          <li><strong>Durada:</strong> ${reserva.servei.duradaMin} minuts</li>
        </ul>
        ${gestioLink ? `
        <p>Pots gestionar la teva cita (modificar o cancel·lar) des d'aquest enllaç:</p>
        <a href="${gestioLink}" style="display:inline-block;padding:12px 24px;background:#7C3AED;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Gestionar la meva cita
        </a>
        <p style="font-size:12px;color:#9CA3AF;margin-top:8px;">O copia aquest enllaç: ${gestioLink}</p>
        ` : ''}
      `,
    });
  }

  async getReservaByToken(token: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { tokenGestio: token },
      // El token de valoració només s'ha de rebre per email quan la cita ha passat
      omit: { tokenValoracio: true, tokenValoracioUsat: true, emailPostCitaEnviat: true },
      include: {
        servei: true,
        treballador: { select: { id: true, nom: true, Usuari: { select: { fotoPerfil: true } } } },
        empresa: { select: { id: true, nom: true, fotoPerfil: true, ubicacio: true } },
      },
    });

    if (!reserva) throw new NotFoundException('Reserva no trobada');
    return reserva;
  }

  async cancellarReservaByToken(token: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { tokenGestio: token },
      include: { servei: { select: { nom: true } } },
    });
    if (!reserva) throw new NotFoundException('Reserva no trobada');
    if (reserva.estat === 'CANCELLADA') throw new BadRequestException('La reserva ja està cancel·lada');
    if (reserva.dataHora < new Date()) throw new BadRequestException('No es pot cancel·lar una cita ja passada');

    const actualitzada = await this.prisma.reserva.update({
      where: { tokenGestio: token },
      data: { estat: 'CANCELLADA' },
      omit: { tokenValoracio: true },
    });

    this.avisarNegoci(reserva, 'cancel·lada', reserva.dataHora);
    return actualitzada;
  }

  async modificarReservaByToken(token: string, dto: ModificarReservaGestioDto) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { tokenGestio: token },
      include: { servei: true },
    });
    if (!reserva) throw new NotFoundException('Reserva no trobada');
    if (reserva.estat === 'CANCELLADA') throw new BadRequestException('No es pot modificar una reserva cancel·lada');
    if (reserva.dataHora < new Date()) throw new BadRequestException('No es pot modificar una cita ja passada');

    const dataHoraInici = new Date(`${dto.data}T${dto.hora}:00`);

    if (isNaN(dataHoraInici.getTime())) throw new BadRequestException('Data o hora invàlida');
    if (reserva.treballadorId === null) throw new BadRequestException('Aquesta reserva no es pot modificar en línia');

    const dataHoraFinal = new Date(dataHoraInici.getTime() + reserva.servei.duradaMin * 60 * 1000);

    await this.checkFinestraClient(reserva.empresaId, dataHoraInici);
    await this.checkSlotAvailable(reserva.treballadorId, reserva.empresaId, reserva.servei.duradaMin, dataHoraInici);

    const actualitzada = await this.prisma.$transaction(async (tx) => {
      await this.assertSenseSolapament(tx, reserva.treballadorId, dataHoraInici, dataHoraFinal, reserva.id);

      return tx.reserva.update({
        where: { tokenGestio: token },
        data: { dataHora: dataHoraInici },
        omit: { tokenValoracio: true },
        include: { servei: true, treballador: true, empresa: { select: { id: true, nom: true, fotoPerfil: true, ubicacio: true } } },
      });
    });

    this.avisarNegoci(reserva, 'canviada', reserva.dataHora, dataHoraInici);
    if (reserva.clientEmail) {
      this.enviarEmailConfirmacio(
        { empresaId: reserva.empresaId, servei: reserva.servei },
        { nom: reserva.clientNom ?? '', email: reserva.clientEmail },
        dataHoraInici,
        token,
        'Reserva modificada',
      );
    }
    return actualitzada;
  }

  /**
   * Avisa els administradors de l'empresa i el treballador assignat quan el client
   * cancel·la o canvia la cita des del seu enllaç.
   */
  private avisarNegoci(
    reserva: { id: number; empresaId: number; treballadorId: number | null; clientNom: string | null; servei: { nom: string } },
    accio: 'cancel·lada' | 'canviada',
    dataAnterior: Date,
    dataNova?: Date,
  ): void {
    this.avisos.avisarNegoci({
      tipus: accio === 'cancel·lada' ? 'RESERVA_CANCELLADA' : 'RESERVA_CANVIADA',
      reservaId: reserva.id,
      empresaId: reserva.empresaId,
      treballadorId: reserva.treballadorId,
      clientNom: reserva.clientNom,
      serveiNom: reserva.servei.nom,
      dataHora: dataNova ?? dataAnterior,
      dataAnterior: dataNova ? dataAnterior : undefined,
    });
  }
}
