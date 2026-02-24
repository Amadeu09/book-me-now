import { Test, TestingModule } from '@nestjs/testing';
import { ValoracionsService } from './valoracions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateValoracioDto, UpdateValoracioDto } from './dto/valoracions.dto';
import { ValoracioTipus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('ValoracionsService', () => {
    let service: ValoracionsService;
    let prisma: PrismaService;

    const mockPrismaService = {
        treballador: { findUnique: jest.fn() },
        empresa: { findUnique: jest.fn() },
        valoracio: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ValoracionsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<ValoracionsService>(ValoracionsService);
        prisma = module.get<PrismaService>(PrismaService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create TREBALLADOR via prisma properly', async () => {
            const dto: CreateValoracioDto = { id: 1, tipusValoracio: ValoracioTipus.TREBALLADOR, valoracio: 5, nomClient: 'Test', comentari: 'test', idServeis: 1 };
            mockPrismaService.treballador.findUnique.mockResolvedValue({ id: 1, empresaId: 10 });
            mockPrismaService.valoracio.create.mockResolvedValue('created');

            const result = await service.create(dto);
            expect(prisma.treballador.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prisma.valoracio.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    empresaId: 10,
                    treballadorId: 1,
                    tipus: ValoracioTipus.TREBALLADOR,
                    puntuacio: 5,
                    nomClient: 'Test',
                })
            });
            expect(result).toBe('created');
        });

        it('should throw NotFound if TREBALLADOR does not exist', async () => {
            const dto: CreateValoracioDto = { id: 1, tipusValoracio: ValoracioTipus.TREBALLADOR, valoracio: 5, nomClient: 'Test', comentari: 'test', idServeis: 1 };
            mockPrismaService.treballador.findUnique.mockResolvedValue(null);
            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });

        it('should create SALA via prisma properly', async () => {
            const dto: CreateValoracioDto = { id: 2, tipusValoracio: ValoracioTipus.SALA, valoracio: 4, nomClient: 'Marta', comentari: 'test', idServeis: 1 };
            mockPrismaService.empresa.findUnique.mockResolvedValue({ id: 2 });
            mockPrismaService.valoracio.create.mockResolvedValue('created');

            const result = await service.create(dto);
            expect(prisma.empresa.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(prisma.valoracio.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    empresaId: 2,
                    treballadorId: null,
                    tipus: ValoracioTipus.SALA,
                    puntuacio: 4,
                    nomClient: 'Marta',
                })
            });
            expect(result).toBe('created');
        });

        it('should throw NotFound if SALA does not exist', async () => {
            const dto: CreateValoracioDto = { id: 2, tipusValoracio: ValoracioTipus.SALA, valoracio: 4, nomClient: 'Marta', comentari: 'test', idServeis: 1 };
            mockPrismaService.empresa.findUnique.mockResolvedValue(null);
            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return all valoracions', async () => {
            mockPrismaService.valoracio.findMany.mockResolvedValue(['all']);
            expect(await service.findAll()).toEqual(['all']);
        });
    });

    describe('findOne', () => {
        it('should throw if not found', async () => {
            mockPrismaService.valoracio.findUnique.mockResolvedValue(null);
            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });

        it('should return the valoracio if found', async () => {
            mockPrismaService.valoracio.findUnique.mockResolvedValue('one');
            expect(await service.findOne(1)).toBe('one');
        });
    });

    describe('update', () => {
        it('should throw if not found', async () => {
            mockPrismaService.valoracio.findUnique.mockResolvedValue(null);
            await expect(service.update(1, { valoracio: 3 })).rejects.toThrow(NotFoundException);
        });

        it('should call update and return the result if found', async () => {
            mockPrismaService.valoracio.findUnique.mockResolvedValue({ id: 1 });
            mockPrismaService.valoracio.update.mockResolvedValue('updated');
            expect(await service.update(1, { valoracio: 3, comentari: 'ok' })).toBe('updated');
        });
    });

    describe('remove', () => {
        it('should throw if not found', async () => {
            mockPrismaService.valoracio.findUnique.mockResolvedValue(null);
            await expect(service.remove(1)).rejects.toThrow(NotFoundException);
        });

        it('should call delete and return result if found', async () => {
            mockPrismaService.valoracio.findUnique.mockResolvedValue({ id: 1 });
            mockPrismaService.valoracio.delete.mockResolvedValue('deleted');
            expect(await service.remove(1)).toBe('deleted');
        });
    });
});
