import { Test, TestingModule } from '@nestjs/testing';
import { AbsenciesService } from './absencies.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
    usuari: {
        findUnique: jest.fn(),
    },
    treballador: {
        findUnique: jest.fn(),
    },
    absencia: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

describe('AbsenciesService', () => {
    let service: AbsenciesService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AbsenciesService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<AbsenciesService>(AbsenciesService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an absencia regarding user permissions and business logic', async () => {
            const empresaId = 1;
            const userId = 1;
            const dto = {
                treballadorId: 10,
                inici: '2023-01-01',
                fi: '2023-01-02',
                tipus: 'VACANCES' as any,
                motiu: 'Vacances',
            };

            // Mock user (admin logic found in service)
            mockPrismaService.usuari.findUnique.mockResolvedValue({ id: userId, rol: 'ADMIN_GENERAL' });
            // Mock treballador
            mockPrismaService.treballador.findUnique.mockResolvedValue({ id: 10, empresaId: 1 });
            // Mock create
            mockPrismaService.absencia.create.mockResolvedValue({ id: 100, ...dto });

            const result = await service.create(empresaId, dto, userId);

            expect(result).toBeDefined();
            expect(mockPrismaService.usuari.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
            expect(mockPrismaService.treballador.findUnique).toHaveBeenCalledWith({ where: { id: dto.treballadorId } });
            expect(mockPrismaService.absencia.create).toHaveBeenCalled();
        });

        it('should throw ForbiddenException if user is not ADMIN_GENERAL', async () => {
            mockPrismaService.usuari.findUnique.mockResolvedValue({ id: 1, rol: 'USER' });

            await expect(service.create(1, { treballadorId: 1, tipus: 'VACANCES' as any, inici: 'd', fi: 'd' }, 1))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if treballador does not exist', async () => {
            mockPrismaService.usuari.findUnique.mockResolvedValue({ id: 1, rol: 'ADMIN_GENERAL' });
            mockPrismaService.treballador.findUnique.mockResolvedValue(null);

            await expect(service.create(1, { treballadorId: 1, tipus: 'VACANCES' as any, inici: 'd', fi: 'd' }, 1))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if treballador is from another empresa', async () => {
            mockPrismaService.usuari.findUnique.mockResolvedValue({ id: 1, rol: 'ADMIN_GENERAL' });
            mockPrismaService.treballador.findUnique.mockResolvedValue({ id: 1, empresaId: 999 });

            await expect(service.create(1, { treballadorId: 1, tipus: 'VACANCES' as any, inici: 'd', fi: 'd' }, 1))
                .rejects.toThrow(ForbiddenException);
        });
    });

    describe('update', () => {
        it('should update an absencia', async () => {
            const empresaId = 1;
            const absenciaId = 100;
            const userId = 1;
            const dto = { motiu: 'Malaltia' };

            mockPrismaService.usuari.findUnique.mockResolvedValue({ id: userId, rol: 'ADMIN_GENERAL' });
            mockPrismaService.absencia.findUnique.mockResolvedValue({
                id: absenciaId,
                treballador: { empresaId: 1 }
            });
            mockPrismaService.absencia.update.mockResolvedValue({ id: absenciaId, ...dto });

            const result = await service.update(empresaId, absenciaId, dto, userId);
            expect(result.motiu).toBe('Malaltia');
        });

        it('should throw NotFoundException if absencia not found', async () => {
            mockPrismaService.usuari.findUnique.mockResolvedValue({ id: 1, rol: 'ADMIN_GENERAL' });
            mockPrismaService.absencia.findUnique.mockResolvedValue(null);

            await expect(service.update(1, 100, {}, 1)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if absencia belongs to another empresa', async () => {
            mockPrismaService.usuari.findUnique.mockResolvedValue({ id: 1, rol: 'ADMIN_GENERAL' });
            mockPrismaService.absencia.findUnique.mockResolvedValue({
                id: 100,
                treballador: { empresaId: 999 }
            });

            await expect(service.update(1, 100, {}, 1)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('remove', () => {
        it('should remove an absencia', async () => {
            mockPrismaService.usuari.findUnique.mockResolvedValue({ id: 1, rol: 'ADMIN_GENERAL' });
            mockPrismaService.absencia.findUnique.mockResolvedValue({
                id: 100,
                treballador: { empresaId: 1 }
            });
            mockPrismaService.absencia.delete.mockResolvedValue({ id: 100 });

            const result = await service.remove(1, 100, 1);
            expect(result).toBeDefined();
        });

        it('should throw ForbiddenException if user not authorized', async () => {
            mockPrismaService.usuari.findUnique.mockResolvedValue({ id: 1, rol: 'USER' });
            await expect(service.remove(1, 100, 1)).rejects.toThrow(ForbiddenException);
        });
    });
});
