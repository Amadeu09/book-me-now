import { Test, TestingModule } from '@nestjs/testing';
import { ReservesService } from './reserves.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateReservaDto, UpdateReservaEstatDto } from './dto/reserves.dto';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

const mockUser: CurrentUserData = {
    userId: 1,
    email: 'test@test.com',
    rol: 'ADMIN_GENERAL' as any,
    empresaId: 1,
};

const mockPrismaService = {
    servei: {
        findUnique: jest.fn(),
    },
    treballador: {
        findUnique: jest.fn(),
    },
    reserva: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
    },
    usuari: {
        findUnique: jest.fn(),
    },
    client: {
        findFirst: jest.fn(),
        create: jest.fn(),
    },
};

describe('ReservesService', () => {
    let service: ReservesService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReservesService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ReservesService>(ReservesService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const dto: CreateReservaDto = {
            idServei: 1,
            idTreballador: 1,
            data: '2023-01-01',
            hora: '10:00',
            email: 'client@example.com',
            nom: 'Client',
            cognoms: 'Cognom',
            telefon: '123456789',
            observacions: 'None',
        };

        it('should create a reserva successfully', async () => {
            mockPrismaService.servei.findUnique.mockResolvedValue({ id: 1, duradaMin: 60 });
            mockPrismaService.treballador.findUnique.mockResolvedValue({ id: 1, empresaId: 1 });
            mockPrismaService.reserva.findMany.mockResolvedValue([]); // No overlaps
            mockPrismaService.client.findFirst.mockResolvedValue({ id: 1 }); // Client exists
            mockPrismaService.reserva.create.mockResolvedValue({ id: 100, ...dto });

            const result = await service.create(dto);

            expect(result).toBeDefined();
            expect(mockPrismaService.reserva.create).toHaveBeenCalled();
        });

        it('should throw ForbiddenException if overlap exists', async () => {
            mockPrismaService.servei.findUnique.mockResolvedValue({ id: 1, duradaMin: 60 });
            mockPrismaService.treballador.findUnique.mockResolvedValue({ id: 1, empresaId: 1 });

            const existingReserva = {
                dataHora: new Date('2023-01-01T10:30:00'),
                servei: { duradaMin: 60 },
            };
            mockPrismaService.reserva.findMany.mockResolvedValue([existingReserva]);

            await expect(service.create(dto)).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if servei not found', async () => {
            mockPrismaService.servei.findUnique.mockResolvedValue(null);
            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if treballador not found', async () => {
            mockPrismaService.servei.findUnique.mockResolvedValue({ id: 1, duradaMin: 60 });
            mockPrismaService.treballador.findUnique.mockResolvedValue(null);
            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const dto: CreateReservaDto = {
            idServei: 1,
            idTreballador: 1,
            data: '2023-01-01',
            hora: '10:00',
            email: 'client@example.com',
            nom: 'Client',
            cognoms: 'Cognom',
            telefon: '123456789',
            observacions: 'None',
        };

        it('should update a reserva', async () => {
            mockPrismaService.reserva.findUnique.mockResolvedValue({ id: 1, empresaId: 1 });
            mockPrismaService.servei.findUnique.mockResolvedValue({ id: 1, duradaMin: 60 });
            mockPrismaService.treballador.findUnique.mockResolvedValue({ id: 1, empresaId: 1 });
            mockPrismaService.reserva.findMany.mockResolvedValue([]);
            mockPrismaService.client.findFirst.mockResolvedValue({ id: 1 });
            mockPrismaService.reserva.update.mockResolvedValue({ id: 1, ...dto });

            const result = await service.update(1, dto, mockUser);
            expect(result).toBeDefined();
        });

        it('should throw NotFoundException if reserva not found', async () => {
            mockPrismaService.reserva.findUnique.mockResolvedValue(null);
            await expect(service.update(1, dto, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete a reserva', async () => {
            mockPrismaService.reserva.findUnique.mockResolvedValue({ id: 1, empresaId: 1 });
            mockPrismaService.reserva.delete.mockResolvedValue({ id: 1 });
            const result = await service.delete(1, mockUser);
            expect(result).toBeDefined();
        });

        it('should throw NotFoundException if reserva not found', async () => {
            mockPrismaService.reserva.findUnique.mockResolvedValue(null);
            await expect(service.delete(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateEstado', () => {
        it('should update status', async () => {
            mockPrismaService.reserva.findUnique.mockResolvedValue({ id: 1, empresaId: 1, clientEmail: null, servei: { nom: 'Test' }, empresa: { nom: 'Emp' } });
            mockPrismaService.reserva.update.mockResolvedValue({ id: 1, estat: 'CONFIRMADA' });
            const result = await service.updateEstado(1, 'CONFIRMADA', mockUser);
            expect(result.estat).toBe('CONFIRMADA');
        });

        it('should throw NotFoundException if reserva not found', async () => {
            mockPrismaService.reserva.findUnique.mockResolvedValue(null);
            await expect(service.updateEstado(1, 'CONFIRMADA', mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAllBySetmana', () => {
        it('should return reserves successfully without treballadorId', async () => {
            const user = { id: 1, empresaId: 1, rol: 'ADMIN_GENERAL' };
            mockPrismaService.usuari.findUnique.mockResolvedValue(user);
            mockPrismaService.reserva.findMany.mockResolvedValue([{ id: 1 }]);

            const result = await service.findAllBySetmana(1, '2023-01-01', '2023-01-07', 1);

            expect(result).toBeDefined();
            expect(mockPrismaService.reserva.findMany).toHaveBeenCalled();
            expect(mockPrismaService.treballador.findUnique).not.toHaveBeenCalled();
        });

        it('should return reserves successfully with treballadorId', async () => {
            const user = { id: 1, empresaId: 1, rol: 'ADMIN_GENERAL' };
            const treballador = { id: 2, empresaId: 1 };
            mockPrismaService.usuari.findUnique.mockResolvedValue(user);
            mockPrismaService.treballador.findUnique.mockResolvedValue(treballador);
            mockPrismaService.reserva.findMany.mockResolvedValue([{ id: 1 }]);

            const result = await service.findAllBySetmana(1, '2023-01-01', '2023-01-07', 1, '2');

            expect(result).toBeDefined();
            expect(mockPrismaService.treballador.findUnique).toHaveBeenCalled();
            expect(mockPrismaService.reserva.findMany).toHaveBeenCalled();
        });

        it('should throw ForbiddenException if user has wrong empresaId', async () => {
            const user = { id: 1, empresaId: 2, rol: 'ADMIN_GENERAL' };
            mockPrismaService.usuari.findUnique.mockResolvedValue(user);

            await expect(service.findAllBySetmana(1, '2023-01-01', '2023-01-07', 1))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException if user is not ADMIN_GENERAL', async () => {
            const user = { id: 1, empresaId: 1, rol: 'TREBALLADOR' };
            mockPrismaService.usuari.findUnique.mockResolvedValue(user);

            await expect(service.findAllBySetmana(1, '2023-01-01', '2023-01-07', 1))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException if treballador belongs to another empresa', async () => {
            const user = { id: 1, empresaId: 1, rol: 'ADMIN_GENERAL' };
            const treballador = { id: 2, empresaId: 2 };
            mockPrismaService.usuari.findUnique.mockResolvedValue(user);
            mockPrismaService.treballador.findUnique.mockResolvedValue(treballador);

            await expect(service.findAllBySetmana(1, '2023-01-01', '2023-01-07', 1, '2'))
                .rejects.toThrow(ForbiddenException);
        });
    });
});
