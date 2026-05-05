import { Test, TestingModule } from '@nestjs/testing';
import { TreballadorsService } from './treballadors.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTreballadorDto } from './dto/CreateTreballadorDto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TreballadorsService', () => {
    let service: TreballadorsService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        usuari: {
            findUnique: jest.fn(),
        },
        treballador: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
        servei: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        treballadorServei: {
            create: jest.fn(),
            createMany: jest.fn(),
            findUnique: jest.fn(),
        },
        reserva: {
            findMany: jest.fn(),
        },
        absencia: {
            findMany: jest.fn(),
        },
        absenciaEmpresa: {
            findMany: jest.fn().mockResolvedValue([]),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TreballadorsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<TreballadorsService>(TreballadorsService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const empresaId = 1;
        const adminUserId = 1;
        const targetUserId = 2;

        const createDto: CreateTreballadorDto = {
            nom: 'Test Worker',
            idUsuari: targetUserId,
            plantillaId: 10,
        };

        const adminUser = {
            id: adminUserId,
            rol: 'ADMIN_GENERAL',
            empresaId: empresaId,
        };

        const targetUser = {
            id: targetUserId,
            empresaId: empresaId,
        };

        it('should create a treballador with plantillaId', async () => {
            mockPrismaService.usuari.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(targetUser);

            const createdTreballador = {
                id: 100,
                empresaId,
                idUsuari: targetUserId,
                nom: createDto.nom,
                plantillaId: 10,
            };

            mockPrismaService.treballador.create.mockResolvedValue(createdTreballador);

            const result = await service.create(empresaId, createDto, adminUserId);

            expect(result).toEqual(createdTreballador);
            expect(prismaService.treballador.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    empresaId,
                    idUsuari: createDto.idUsuari,
                    nom: createDto.nom,
                    plantillaId: createDto.plantillaId,
                }),
            });
        });

        it('should create a treballador without plantilla if not provided', async () => {
            const dtoWithoutPlantilla: CreateTreballadorDto = { nom: createDto.nom, idUsuari: createDto.idUsuari };

            mockPrismaService.usuari.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(targetUser);

            const createdTreballador = {
                id: 100,
                empresaId,
                idUsuari: targetUserId,
                nom: createDto.nom,
            };

            mockPrismaService.treballador.create.mockResolvedValue(createdTreballador);

            const result = await service.create(empresaId, dtoWithoutPlantilla, adminUserId);

            expect(result).toEqual(createdTreballador);
            expect(prismaService.treballador.create).toHaveBeenCalledWith({
                data: expect.not.objectContaining({ plantillaId: expect.anything() }),
            });
        });

        it('should assign serveis during creation if serveisIds are provided', async () => {
            const dtoWithServeis = { ...createDto, serveisIds: [1, 2] };

            mockPrismaService.usuari.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(targetUser);

            const createdTreballador = {
                id: 100,
                empresaId,
                idUsuari: targetUserId,
                nom: createDto.nom,
            };

            const serveisDocs = [
                { id: 1, empresaId },
                { id: 2, empresaId },
            ];

            mockPrismaService.treballador.create.mockResolvedValue(createdTreballador);
            mockPrismaService.servei.findMany.mockResolvedValue(serveisDocs);
            mockPrismaService.treballadorServei.createMany = jest.fn().mockResolvedValue({ count: 2 });

            const result = await service.create(empresaId, dtoWithServeis, adminUserId);

            expect(result).toEqual(createdTreballador);
            expect(prismaService.servei.findMany).toHaveBeenCalledWith({
                where: { id: { in: dtoWithServeis.serveisIds }, empresaId }
            });
            expect(prismaService.treballadorServei.createMany).toHaveBeenCalledWith({
                data: [
                    { treballadorId: createdTreballador.id, serveiId: 1 },
                    { treballadorId: createdTreballador.id, serveiId: 2 },
                ],
                skipDuplicates: true
            });
        });

        it('should throw NotFoundException if any serveisIds do not exist during creation', async () => {
            const dtoWithServeis = { ...createDto, serveisIds: [1, 999] };

            mockPrismaService.usuari.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(targetUser);

            const createdTreballador = { id: 100, empresaId, idUsuari: targetUserId, nom: createDto.nom };

            mockPrismaService.treballador.create.mockResolvedValue(createdTreballador);
            mockPrismaService.servei.findMany.mockResolvedValue([{ id: 1, empresaId }]);

            await expect(service.create(empresaId, dtoWithServeis, adminUserId)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if user is not ADMIN_GENERAL', async () => {
            const nonAdminUser = { ...adminUser, rol: 'EMPLEAT' };
            mockPrismaService.usuari.findUnique.mockResolvedValueOnce(nonAdminUser);
            await expect(service.create(empresaId, createDto, adminUserId)).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if target user does not exist', async () => {
            mockPrismaService.usuari.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(null);
            await expect(service.create(empresaId, createDto, adminUserId)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if target user belongs to another company', async () => {
            const otherCompanyUser = { ...targetUser, empresaId: 999 };
            mockPrismaService.usuari.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(otherCompanyUser);
            await expect(service.create(empresaId, createDto, adminUserId)).rejects.toThrow(ForbiddenException);
        });

        describe('assignarServeis', () => {
            const empresaId = 1;
            const adminUserId = 1;
            const dto = { treballadorId: 100, serveisIds: [10, 11] };
            const adminUser = { id: adminUserId, rol: 'ADMIN_GENERAL', empresaId };
            const treballador = { id: 100, empresaId };
            const serveis = [{ id: 10, empresaId }, { id: 11, empresaId }];

            it('should assign services successfully', async () => {
                mockPrismaService.usuari.findUnique.mockResolvedValue(adminUser);
                mockPrismaService.treballador.findUnique.mockResolvedValue(treballador);
                prismaService.servei.findMany = jest.fn().mockResolvedValue(serveis);
                prismaService.$transaction = jest.fn().mockImplementation((cb) => cb(prismaService));
                prismaService.treballadorServei.findUnique = jest.fn().mockResolvedValue(null);
                prismaService.treballadorServei.create = jest.fn().mockResolvedValue({ id: 1 });

                await service.assignarServeis(empresaId, dto, adminUserId);

                expect(prismaService.treballadorServei.create).toHaveBeenCalledTimes(2);
            });

            it('should throw ForbiddenException if user is not ADMIN_GENERAL', async () => {
                const nonAdminUser = { ...adminUser, rol: 'EMPLEAT' };
                mockPrismaService.usuari.findUnique.mockResolvedValue(nonAdminUser);
                await expect(service.assignarServeis(empresaId, dto, adminUserId)).rejects.toThrow(ForbiddenException);
            });

            it('should throw NotFoundException if worker does not exist', async () => {
                mockPrismaService.usuari.findUnique.mockResolvedValue(adminUser);
                mockPrismaService.treballador.findUnique.mockResolvedValue(null);
                await expect(service.assignarServeis(empresaId, dto, adminUserId)).rejects.toThrow(NotFoundException);
            });

            it('should throw NotFoundException if any service does not exist', async () => {
                mockPrismaService.usuari.findUnique.mockResolvedValue(adminUser);
                mockPrismaService.treballador.findUnique.mockResolvedValue(treballador);
                prismaService.servei.findMany = jest.fn().mockResolvedValue([serveis[0]]);
                await expect(service.assignarServeis(empresaId, dto, adminUserId)).rejects.toThrow(NotFoundException);
            });
        });
    });

    describe('getDisponibilitat', () => {
        const empresaId = 1;
        const adminUserId = 1;
        const workerId = 100;
        const serviceId = 5;

        const adminUser = { id: adminUserId, rol: 'ADMIN_GENERAL', empresaId };
        const servei = { id: serviceId, empresaId, duradaMin: 60 };

        const makePlantilla = (dow: number) => ({
            rotacions: [{
                index: 0,
                dies: [{ dow, esDescans: false, trams: [{ iniciMin: 480, fiMin: 1080 }] }],
            }],
        });

        it('should return availability slots', async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let dow = today.getDay();
            if (dow === 0) dow = 7;

            const workerWithPlantilla = { id: workerId, empresaId, plantilla: makePlantilla(dow) };

            mockPrismaService.usuari.findUnique.mockResolvedValue(adminUser);
            mockPrismaService.treballador.findUnique.mockResolvedValue(workerWithPlantilla);
            prismaService.servei.findUnique = jest.fn().mockResolvedValue(servei);
            prismaService.reserva.findMany = jest.fn().mockResolvedValue([]);
            prismaService.absencia.findMany = jest.fn().mockResolvedValue([]);
            mockPrismaService.absenciaEmpresa.findMany.mockResolvedValue([]);

            const result = await service.getDisponibilitat(empresaId, workerId, serviceId, adminUserId);

            expect(result).toBeDefined();
            const dateKey = today.toISOString().split('T')[0];
            expect(result[dateKey]).toBeDefined();
            expect(result[dateKey].length).toBeGreaterThan(0);
        });

        it('should filter slots based on reservations', async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let dow = today.getDay();
            if (dow === 0) dow = 7;

            const workerWithPlantilla = {
                id: workerId,
                empresaId,
                plantilla: {
                    rotacions: [{
                        index: 0,
                        dies: [{ dow, esDescans: false, trams: [{ iniciMin: 480, fiMin: 600 }] }],
                    }],
                },
            };

            const reservationDate = new Date(today);
            reservationDate.setHours(8, 0, 0, 0);
            const reserves = [{ dataHora: reservationDate, servei: { duradaMin: 60 } }];

            mockPrismaService.usuari.findUnique.mockResolvedValue(adminUser);
            mockPrismaService.treballador.findUnique.mockResolvedValue(workerWithPlantilla);
            prismaService.servei.findUnique = jest.fn().mockResolvedValue(servei);
            prismaService.reserva.findMany = jest.fn().mockResolvedValue(reserves);
            prismaService.absencia.findMany = jest.fn().mockResolvedValue([]);
            mockPrismaService.absenciaEmpresa.findMany.mockResolvedValue([]);

            const result = await service.getDisponibilitat(empresaId, workerId, serviceId, adminUserId);

            const dateKey = today.toISOString().split('T')[0];
            expect(result[dateKey]).toContain('09:00 - 10:00');
            expect(result[dateKey]).not.toContain('08:00 - 09:00');
        });
    });
});
