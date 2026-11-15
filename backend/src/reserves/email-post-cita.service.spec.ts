import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailPostCitaService } from './email-post-cita.service';
import { PrismaService } from '../prisma/prisma.service';

const send = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send } })),
}));

describe('EmailPostCitaService', () => {
  let service: EmailPostCitaService;
  const prisma = {
    reserva: { findMany: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
  };

  const reserva = (minutsEnrere: number, duradaMin = 30) => ({
    id: 1,
    dataHora: new Date(Date.now() - minutsEnrere * 60 * 1000),
    clientEmail: 'client@example.com',
    clientNom: '<b>Anna</b>',
    tokenValoracio: 'tok-1',
    servei: { nom: 'Massatge', duradaMin },
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        EmailPostCitaService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn((_k: string, def?: string) => def ?? 'x') } },
      ],
    }).compile();
    service = module.get(EmailPostCitaService);
  });

  it('envia i marca les cites acabades, escapant el nom', async () => {
    prisma.reserva.findMany.mockResolvedValue([reserva(60)]);
    prisma.reserva.updateMany.mockResolvedValue({ count: 1 });
    send.mockResolvedValue({ data: { id: 'e1' }, error: null });

    await service.enviarPendents();

    expect(prisma.reserva.updateMany).toHaveBeenCalledWith({
      where: { id: 1, emailPostCitaEnviat: false },
      data: { emailPostCitaEnviat: true },
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].html).toContain('&lt;b&gt;Anna&lt;/b&gt;');
    expect(prisma.reserva.update).not.toHaveBeenCalled();
  });

  it('no envia si la cita encara no ha acabat', async () => {
    prisma.reserva.findMany.mockResolvedValue([reserva(10, 30)]);

    await service.enviarPendents();

    expect(prisma.reserva.updateMany).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('no envia si una altra instància ja ha reclamat la reserva', async () => {
    prisma.reserva.findMany.mockResolvedValue([reserva(60)]);
    prisma.reserva.updateMany.mockResolvedValue({ count: 0 });

    await service.enviarPendents();

    expect(send).not.toHaveBeenCalled();
  });

  it('desmarca la reserva si Resend falla, per reintentar-ho', async () => {
    prisma.reserva.findMany.mockResolvedValue([reserva(60)]);
    prisma.reserva.updateMany.mockResolvedValue({ count: 1 });
    send.mockResolvedValue({ data: null, error: { message: 'rate limit' } });

    await service.enviarPendents();

    expect(prisma.reserva.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { emailPostCitaEnviat: false },
    });
  });
});
