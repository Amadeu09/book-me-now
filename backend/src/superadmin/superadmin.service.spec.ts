import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SuperAdminService } from './superadmin.service';
import { SuperAdminStrategy } from './strategies/superadmin.strategy';
import { clauSuperAdmin } from './superadmin.constants';
import { hashToken } from '../common/utils/token.utils';

const JWT_SECRET = 'un-secret-de-proves-prou-llarg-per-a-jwt-0123456789';

function config(extra: Record<string, string> = {}) {
  const valors: Record<string, string> = { JWT_SECRET, APP_URL: 'https://app.test', ...extra };
  return { get: (k: string) => valors[k], getOrThrow: (k: string) => valors[k] } as any;
}

describe('SuperAdmin', () => {
  let prisma: any;
  let email: any;
  let sessionCache: any;
  let blacklist: any;
  let service: SuperAdminService;
  const jwt = new JwtService({});

  beforeEach(() => {
    prisma = {
      superAdmin: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      empresa: { findUnique: jest.fn(), update: jest.fn() },
      usuari: { updateMany: jest.fn(), findMany: jest.fn().mockResolvedValue([{ id: 11 }, { id: 12 }]) },
      invitacio: { create: jest.fn(), updateMany: jest.fn() },
      registreAccio: { create: jest.fn() },
      $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(prisma)),
    };
    email = { send: jest.fn().mockResolvedValue({ ok: true }) };
    sessionCache = { invalidateUser: jest.fn() };
    blacklist = { addToBlacklist: jest.fn(), isBlacklisted: jest.fn().mockResolvedValue(false) };
    service = new SuperAdminService(prisma, jwt, email, sessionCache, blacklist, config());
  });

  describe('aïllament dels tokens', () => {
    it('la clau del superadmin és diferent de la dels usuaris', () => {
      expect(clauSuperAdmin(JWT_SECRET)).not.toBe(JWT_SECRET);
    });

    it("un token de superadmin no valida amb la clau d'empresa, ni a l'inrevés", () => {
      const tokenSuper = jwt.sign({ sub: 1, tipus: 'superadmin' }, { secret: clauSuperAdmin(JWT_SECRET) });
      const tokenEmpresa = jwt.sign({ sub: 1, rol: 'ADMIN_GENERAL' }, { secret: JWT_SECRET });
      expect(() => jwt.verify(tokenSuper, { secret: JWT_SECRET })).toThrow();
      expect(() => jwt.verify(tokenEmpresa, { secret: clauSuperAdmin(JWT_SECRET) })).toThrow();
    });

    it("l'estratègia rebutja tokens sense tipus superadmin", async () => {
      const estrategia = new SuperAdminStrategy(config(), prisma, blacklist);
      await expect(estrategia.validate({ headers: {} }, { sub: 1, email: 'a@b.c', tipus: 'altre' } as any)).rejects.toThrow(UnauthorizedException);
    });

    it("l'estratègia rebutja tokens emesos abans d'un canvi de contrasenya", async () => {
      const estrategia = new SuperAdminStrategy(config(), prisma, blacklist);
      prisma.superAdmin.findUnique.mockResolvedValue({ id: 1, email: 'a@b.c', credencialsCanviades: new Date() });
      const fa1h = Math.floor(Date.now() / 1000) - 3600;
      await expect(estrategia.validate({ headers: {} }, { sub: 1, email: 'a@b.c', tipus: 'superadmin', iat: fa1h })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('rebutja una contrasenya incorrecta', async () => {
      prisma.superAdmin.findUnique.mockResolvedValue({ id: 1, email: 'a@b.c', hash: await bcrypt.hash('bona-Contrasenya1', 4) });
      await expect(service.login('a@b.c', 'dolenta')).rejects.toThrow(UnauthorizedException);
    });

    it('rebutja un email desconegut amb el mateix error', async () => {
      prisma.superAdmin.findUnique.mockResolvedValue(null);
      await expect(service.login('ningu@b.c', 'x')).rejects.toThrow(UnauthorizedException);
    });

    it('emet un token de superadmin i ho registra', async () => {
      prisma.superAdmin.findUnique.mockResolvedValue({ id: 1, email: 'a@b.c', hash: await bcrypt.hash('bona-Contrasenya1', 4) });
      const res = await service.login('a@b.c', 'bona-Contrasenya1');
      const payload = jwt.verify(res.token, { secret: clauSuperAdmin(JWT_SECRET) }) as any;
      expect(payload.tipus).toBe('superadmin');
      expect(prisma.registreAccio.create).toHaveBeenCalledWith({ data: { superAdminId: 1, accio: 'LOGIN', detall: undefined } });
    });
  });

  describe('empreses', () => {
    it('en desactivar una empresa, tanca a l\'instant les sessions dels seus usuaris', async () => {
      prisma.empresa.findUnique.mockResolvedValue({ id: 5, nom: 'Nord', activa: true });
      await service.canviarEstatEmpresa(5, false, 1);
      expect(prisma.empresa.update).toHaveBeenCalledWith({ where: { id: 5 }, data: { activa: false } });
      expect(prisma.usuari.updateMany).toHaveBeenCalledWith({ where: { empresaId: 5 }, data: { credencialsCanviades: expect.any(Date) } });
      expect(sessionCache.invalidateUser).toHaveBeenCalledWith(11);
      expect(sessionCache.invalidateUser).toHaveBeenCalledWith(12);
    });
  });

  describe('invitacions', () => {
    it('desa només el hash del token i retorna l\'enllaç amb el token', async () => {
      prisma.invitacio.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 3, ...data, usadaAt: null, revocada: false, empresaId: null, createdAt: new Date() }));
      const res = await service.crearInvitacio({ email: 'Nou@Negoci.cat' }, 1);
      const token = new URL(res.enllac).searchParams.get('invitacio')!;
      const desat = prisma.invitacio.create.mock.calls[0][0].data;
      expect(desat.tokenHash).toBe(hashToken(token));
      expect(desat.email).toBe('nou@negoci.cat');
      expect(JSON.stringify(res.invitacio)).not.toContain(desat.tokenHash);
      expect(res.invitacio.estat).toBe('PENDENT');
    });

    it("no deixa enviar-la per correu sense email", async () => {
      await expect(service.crearInvitacio({ enviarEmail: true }, 1)).rejects.toThrow(BadRequestException);
    });

    it('no es pot revocar una invitació ja usada', async () => {
      prisma.invitacio.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.revocarInvitacio(3, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('alta per variable d\'entorn', () => {
    it("crea el superadmin de SUPERADMIN_EMAIL i li envia l'enllaç", async () => {
      service = new SuperAdminService(prisma, jwt, email, sessionCache, blacklist, config({ SUPERADMIN_EMAIL: 'Jo@BookMeNow.org' }));
      prisma.superAdmin.findUnique.mockResolvedValue(null);
      await service.onApplicationBootstrap();
      expect(prisma.superAdmin.create).toHaveBeenCalledWith({ data: { email: 'jo@bookmenow.org', hash: expect.any(String) } });
      expect(email.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'jo@bookmenow.org' }));
    });

    it('no fa res si ja existeix', async () => {
      service = new SuperAdminService(prisma, jwt, email, sessionCache, blacklist, config({ SUPERADMIN_EMAIL: 'jo@bookmenow.org' }));
      prisma.superAdmin.findUnique.mockResolvedValue({ id: 1 });
      await service.onApplicationBootstrap();
      expect(prisma.superAdmin.create).not.toHaveBeenCalled();
      expect(email.send).not.toHaveBeenCalled();
    });
  });
});
