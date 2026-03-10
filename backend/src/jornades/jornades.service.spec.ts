import { Test, TestingModule } from '@nestjs/testing';
import { JornadesService } from './jornades.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateJornadaPlantillaDto } from './dto/jornada-plantilla.dto';

const mockPrismaService = {
    empresa: {
        findUnique: jest.fn(),
    },
    jornadaPlantilla: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
    },
};

describe('JornadesService', () => {
    let service: JornadesService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JornadesService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<JornadesService>(JornadesService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a jornada plantilla', async () => {
            const empresaId = 1;
            const dto: CreateJornadaPlantillaDto = {
                nom: 'Test',
                activa: true,
                rotacions: [],
                empresaId: 1,
            };
            const userRol = 'ADMIN_GENERAL';

            mockPrismaService.empresa.findUnique.mockResolvedValue({ id: empresaId });
            mockPrismaService.jornadaPlantilla.create.mockResolvedValue({ id: 1, ...dto });

            const result = await service.create(empresaId, dto, empresaId, userRol as any);

            expect(result).toBeDefined();
            expect(mockPrismaService.jornadaPlantilla.create).toHaveBeenCalled();
        });

        it('should throw ForbiddenException if user not in empresa', async () => {
            const empresaId = 1;
            const userEmpresaId = 2;
            const dto: CreateJornadaPlantillaDto = { nom: 'Test', rotacions: [], empresaId: 1 };

            await expect(service.create(empresaId, dto, userEmpresaId, 'TREBALLADOR' as any))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if empresa not found', async () => {
            mockPrismaService.empresa.findUnique.mockResolvedValue(null);

            await expect(service.create(1, { nom: 't', rotacions: [], empresaId: 1 }, 1, 'ADMIN_GENERAL' as any))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return all plantilles for an empresa', async () => {
            const empresaId = 1;
            mockPrismaService.empresa.findUnique.mockResolvedValue({ id: empresaId });
            mockPrismaService.jornadaPlantilla.findMany.mockResolvedValue([]);

            const result = await service.findAll(empresaId, empresaId, 'ADMIN_GENERAL' as any);

            expect(result).toEqual([]);
            expect(mockPrismaService.jornadaPlantilla.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { empresaId },
            }));
        });

        it('should throw ForbiddenException if user not in empresa', async () => {
            await expect(service.findAll(1, 2, 'TREBALLADOR' as any))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if empresa not found', async () => {
            mockPrismaService.empresa.findUnique.mockResolvedValue(null);
            await expect(service.findAll(1, 1, 'ADMIN_GENERAL' as any))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('getJornadesPaginadas', () => {
        it('should return paginated plantilles for an empresa', async () => {
            const empresaId = 1;
            mockPrismaService.empresa.findUnique.mockResolvedValue({ id: empresaId });
            mockPrismaService.jornadaPlantilla.count.mockResolvedValue(5);
            mockPrismaService.jornadaPlantilla.findMany.mockResolvedValue([]);

            const result = await service.getJornadesPaginadas(empresaId, empresaId, 'ADMIN_GENERAL' as any, 1, 2);

            expect(result).toEqual({
                data: [],
                total: 5,
                page: 1,
                rows: 2,
                totalPages: 3,
            });
            expect(mockPrismaService.jornadaPlantilla.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { empresaId },
                skip: 0,
                take: 2,
            }));
            expect(mockPrismaService.jornadaPlantilla.count).toHaveBeenCalledWith({
                where: { empresaId },
            });
        });

        it('should throw ForbiddenException if user not in empresa', async () => {
            await expect(service.getJornadesPaginadas(1, 2, 'TREBALLADOR' as any))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if empresa not found', async () => {
            mockPrismaService.empresa.findUnique.mockResolvedValue(null);
            await expect(service.getJornadesPaginadas(1, 1, 'ADMIN_GENERAL' as any))
                .rejects.toThrow(NotFoundException);
        });
    });
});
