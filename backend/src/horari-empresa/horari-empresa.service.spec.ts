import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { HorariEmpresaService } from './horari-empresa.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

describe('HorariEmpresaService.substituirDia', () => {
    const admin = { userId: 1, empresaId: 7, rol: 'ADMIN_GENERAL' } as CurrentUserData;
    let tx: any;
    let prisma: any;
    let service: HorariEmpresaService;

    beforeEach(() => {
        tx = {
            horariEmpresa: {
                deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
                createMany: jest.fn().mockResolvedValue({ count: 2 }),
                findMany: jest.fn().mockResolvedValue([]),
            },
        };
        prisma = { $transaction: jest.fn((fn: (t: unknown) => unknown) => fn(tx)) };
        service = new HorariEmpresaService(prisma);
    });

    it('substitueix els trams del dia ordenats', async () => {
        await service.substituirDia(7, 2, { trams: [{ iniciMin: 960, fiMin: 1200 }, { iniciMin: 540, fiMin: 840 }] }, admin);
        expect(tx.horariEmpresa.deleteMany).toHaveBeenCalledWith({ where: { empresaId: 7, dow: 2 } });
        expect(tx.horariEmpresa.createMany).toHaveBeenCalledWith({
            data: [
                { empresaId: 7, dow: 2, iniciMin: 540, fiMin: 840 },
                { empresaId: 7, dow: 2, iniciMin: 960, fiMin: 1200 },
            ],
        });
    });

    it('una llista buida tanca el dia', async () => {
        await service.substituirDia(7, 6, { trams: [] }, admin);
        expect(tx.horariEmpresa.deleteMany).toHaveBeenCalled();
        expect(tx.horariEmpresa.createMany).not.toHaveBeenCalled();
    });

    it('rebutja trams solapats', async () => {
        await expect(service.substituirDia(7, 0, { trams: [{ iniciMin: 540, fiMin: 900 }, { iniciMin: 840, fiMin: 1000 }] }, admin))
            .rejects.toBeInstanceOf(BadRequestException);
    });

    it('rebutja un tram amb inici posterior a la fi', async () => {
        await expect(service.substituirDia(7, 0, { trams: [{ iniciMin: 900, fiMin: 540 }] }, admin))
            .rejects.toBeInstanceOf(BadRequestException);
    });

    it('no deixa modificar una altra empresa ni a empleats', async () => {
        await expect(service.substituirDia(8, 0, { trams: [] }, admin)).rejects.toBeInstanceOf(ForbiddenException);
        await expect(service.substituirDia(7, 0, { trams: [] }, { ...admin, rol: 'EMPLEAT' } as CurrentUserData))
            .rejects.toBeInstanceOf(ForbiddenException);
    });
});
