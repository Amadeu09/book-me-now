import * as webpush from 'web-push';
import { AvisosService } from './avisos.service';
import { textAvis } from './avisos.textos';

jest.mock('web-push', () => ({ setVapidDetails: jest.fn(), sendNotification: jest.fn(), generateVAPIDKeys: jest.fn(() => ({ publicKey: 'pub-gen', privateKey: 'priv-gen' })) }));

const config = (vals: Record<string, string>) => ({ get: (k: string) => vals[k] }) as any;
const espera = () => new Promise((r) => setImmediate(r));

describe('AvisosService', () => {
  let prisma: any;
  let email: any;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = {
      usuari: {
        findMany: jest.fn().mockResolvedValue([
          { id: 1, email: 'admin@n.cat', idioma: 'ca', subscripcionsPush: [{ id: 10, endpoint: 'https://push/a', p256dh: 'p', auth: 'a' }] },
          { id: 2, email: 'pep@n.cat', idioma: 'es', subscripcionsPush: [{ id: 11, endpoint: 'https://push/b', p256dh: 'p', auth: 'a' }] },
        ]),
      },
      notificacio: { createMany: jest.fn() },
      pushSubscripcio: { deleteMany: jest.fn() },
      clauVapid: { findUnique: jest.fn().mockResolvedValue(null), createMany: jest.fn() },
    };
    email = { sendInBackground: jest.fn() };
  });

  const avis = {
    tipus: 'RESERVA_NOVA' as const,
    reservaId: 9,
    empresaId: 3,
    treballadorId: 4,
    clientNom: 'Laura',
    serveiNom: 'Tall',
    dataHora: new Date('2026-12-01T09:00:00Z'),
  };

  it('crea un avís a la campana per a cada destinatari, en el seu idioma', async () => {
    const service = new AvisosService(prisma, email, config({}));
    service.avisarNegoci(avis);
    await espera();
    const dades = prisma.notificacio.createMany.mock.calls[0][0].data;
    expect(dades).toHaveLength(2);
    expect(dades[0]).toMatchObject({ usuariId: 1, titol: 'Nova reserva', reservaId: 9 });
    expect(dades[1]).toMatchObject({ usuariId: 2, titol: 'Nueva reserva' });
  });

  it('busca els administradors i el treballador assignat de la mateixa empresa', async () => {
    const service = new AvisosService(prisma, email, config({}));
    service.avisarNegoci(avis);
    await espera();
    expect(prisma.usuari.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { empresaId: 3, OR: [{ rol: 'ADMIN_GENERAL' }, { treballador: { id: 4 } }] },
    }));
  });

  it('envia un email per idioma', async () => {
    const service = new AvisosService(prisma, email, config({}));
    service.avisarNegoci(avis);
    await espera();
    expect(email.sendInBackground).toHaveBeenCalledTimes(2);
  });

  it('sense claus VAPID no intenta enviar push', async () => {
    const service = new AvisosService(prisma, email, config({}));
    service.avisarNegoci(avis);
    await espera();
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });

  it('amb claus VAPID envia push i esborra les subscripcions caducades', async () => {
    (webpush.sendNotification as jest.Mock)
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce({ statusCode: 410 });
    const service = new AvisosService(prisma, email, config({ VAPID_PUBLIC_KEY: 'pub', VAPID_PRIVATE_KEY: 'priv' }));
    service.avisarNegoci(avis);
    await espera();
    await espera();
    expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
    expect(prisma.pushSubscripcio.deleteMany).toHaveBeenCalledWith({ where: { id: 11 } });
  });

  it('sense claus enlloc, les genera i les desa una sola vegada', async () => {
    prisma.clauVapid.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1, publica: 'pub-gen', privada: 'priv-gen' });
    const service = new AvisosService(prisma, email, config({}));
    await service.onModuleInit();
    expect(prisma.clauVapid.createMany).toHaveBeenCalledWith({ data: [{ id: 1, publica: 'pub-gen', privada: 'priv-gen' }], skipDuplicates: true });
    expect(service.clauPublica).toBe('pub-gen');
  });

  it('fa servir les claus desades si ja existeixen', async () => {
    prisma.clauVapid.findUnique.mockResolvedValue({ id: 1, publica: 'pub-bd', privada: 'priv-bd' });
    const service = new AvisosService(prisma, email, config({}));
    await service.onModuleInit();
    expect(prisma.clauVapid.createMany).not.toHaveBeenCalled();
    expect(service.clauPublica).toBe('pub-bd');
  });

  it('un error intern no es propaga', async () => {
    prisma.usuari.findMany.mockRejectedValue(new Error('bd'));
    const service = new AvisosService(prisma, email, config({}));
    expect(() => service.avisarNegoci(avis)).not.toThrow();
    await espera();
  });
});

describe('textAvis', () => {
  it('mostra abans i ara quan la cita es canvia', () => {
    const t = textAvis({
      tipus: 'RESERVA_CANVIADA', clientNom: null, serveiNom: 'Tall',
      dataAnterior: new Date('2026-12-01T09:00:00Z'), dataHora: new Date('2026-12-02T09:00:00Z'),
    }, 'ca');
    expect(t.titol).toBe('Cita canviada pel client');
    expect(t.cos).toContain('Un client · Tall');
    expect(t.cos).toContain('→');
  });
});
