import { EmailService } from './email.service';

const enviaResend = jest.fn();
jest.mock('resend', () => ({ Resend: jest.fn().mockImplementation(() => ({ emails: { send: enviaResend } })) }));

const config = (vals: Record<string, string>) => ({ get: (k: string) => vals[k] }) as any;

describe('EmailService: comptador de quota', () => {
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    enviaResend.mockResolvedValue({ error: null });
    prisma = {
      correuEnviat: { create: jest.fn(), aggregate: jest.fn().mockResolvedValue({ _sum: { destinataris: 10 } }) },
      avisQuota: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
      superAdmin: { findMany: jest.fn().mockResolvedValue([{ email: 'jo@bookmenow.org' }]) },
    };
  });

  it('desa cada enviament amb el tipus, l\'empresa i un correu per destinatari', async () => {
    const service = new EmailService(config({ RESEND_API_KEY: 'k' }), prisma);
    await service.send({ to: ['a@b.c', 'd@e.f'], subject: 'x', html: 'y', tipus: 'AVIS_NEGOCI', empresaId: 3 });
    expect(prisma.correuEnviat.create).toHaveBeenCalledWith({
      data: { tipus: 'AVIS_NEGOCI', empresaId: 3, destinataris: 2, ok: true, error: null },
    });
    // El tipus i l'empresa no s'envien a Resend
    expect(enviaResend.mock.calls[0][0]).not.toHaveProperty('tipus');
  });

  it('també desa els que fallen, sense comptar-los per a la quota', async () => {
    enviaResend.mockResolvedValue({ error: { name: 'daily_quota_exceeded', message: 'quota' } });
    const service = new EmailService(config({ RESEND_API_KEY: 'k' }), prisma);
    await service.send({ to: 'a@b.c', subject: 'x', html: 'y', tipus: 'POST_CITA' });
    expect(prisma.correuEnviat.create).toHaveBeenCalledWith({ data: expect.objectContaining({ ok: false, error: 'quota' }) });
    expect(prisma.avisQuota.createMany).not.toHaveBeenCalled();
  });

  it('per sota del 80 % no avisa', async () => {
    const service = new EmailService(config({ RESEND_API_KEY: 'k' }), prisma);
    await service.send({ to: 'a@b.c', subject: 'x', html: 'y' });
    expect(prisma.avisQuota.createMany).not.toHaveBeenCalled();
  });

  it('en passar del 80 % del límit diari del pla gratuït, avisa el superadmin un sol cop', async () => {
    prisma.correuEnviat.aggregate.mockResolvedValue({ _sum: { destinataris: 81 } });
    const service = new EmailService(config({ RESEND_API_KEY: 'k' }), prisma);
    await service.send({ to: 'a@b.c', subject: 'x', html: 'y' });
    expect(prisma.avisQuota.createMany).toHaveBeenCalledWith({ data: [{ clau: expect.stringMatching(/^free:dia:\d{4}-\d{2}-\d{2}:80$/) }], skipDuplicates: true });
    const alerta = enviaResend.mock.calls.find((c) => String(c[0].subject).includes('81%'));
    expect(alerta?.[0].to).toEqual(['jo@bookmenow.org']);
  });

  it('si ja s\'havia avisat aquest període, no torna a enviar l\'alerta', async () => {
    prisma.correuEnviat.aggregate.mockResolvedValue({ _sum: { destinataris: 90 } });
    prisma.avisQuota.createMany.mockResolvedValue({ count: 0 });
    const service = new EmailService(config({ RESEND_API_KEY: 'k' }), prisma);
    await service.send({ to: 'a@b.c', subject: 'x', html: 'y' });
    expect(enviaResend).toHaveBeenCalledTimes(1);
  });

  it('amb el pla Pro no hi ha límit diari: només mira el mensual', async () => {
    prisma.correuEnviat.aggregate.mockResolvedValue({ _sum: { destinataris: 500 } });
    const service = new EmailService(config({ RESEND_API_KEY: 'k', RESEND_PLA: 'pro' }), prisma);
    await service.send({ to: 'a@b.c', subject: 'x', html: 'y' });
    expect(prisma.avisQuota.createMany).not.toHaveBeenCalled();
  });

  it('sense clau de Resend no envia ni registra res', async () => {
    const service = new EmailService(config({}), prisma);
    const r = await service.send({ to: 'a@b.c', subject: 'x', html: 'y' });
    expect(r.ok).toBe(false);
    expect(prisma.correuEnviat.create).not.toHaveBeenCalled();
  });
});
