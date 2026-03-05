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
        treballadorJornadaPlantilla: {
            create: jest.fn(),
            findMany: jest.fn(),
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
            jornadaTreballador: {
                plantillaJornadaId: 10,
                dataInici: '2024-01-01T00:00:00Z',
                dataFi: '2024-12-31T23:59:59Z',
            },
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

        it('should create a treballador and assign jornada successfully', async () => {
            mockPrismaService.usuari.findUnique
                .mockResolvedValueOnce(adminUser) // Admin check
                .mockResolvedValueOnce(targetUser); // Target user check

            const createdTreballador = {
                id: 100,
                empresaId,
                idUsuari: targetUserId,
                nom: createDto.nom,
            };

            mockPrismaService.treballador.create.mockResolvedValue(createdTreballador);

            const result = await service.create(empresaId, createDto, adminUserId);

            expect(result).toEqual(createdTreballador);
            expect(prismaService.treballador.create).toHaveBeenCalledWith({
                data: {
                    empresaId,
                    idUsuari: createDto.idUsuari,
                    nom: createDto.nom,
                },
            });
            expect(prismaService.treballadorJornadaPlantilla.create).toHaveBeenCalledWith({
                data: {
                    treballador: { connect: { id: createdTreballador.id } },
                    plantilla: { connect: { id: createDto.jornadaTreballador!.plantillaJornadaId } },
                    dataInici: new Date(createDto.jornadaTreballador!.dataInici),
                    dataFi: new Date(createDto.jornadaTreballador!.dataFi!),
                },
            });
        });

        it('should create a treballador without jornada if not provided', async () => {
            const dtoWithoutJornada = { ...createDto };
            delete dtoWithoutJornada.jornadaTreballador;

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

            const result = await service.create(empresaId, dtoWithoutJornada, adminUserId);

            expect(result).toEqual(createdTreballador);
            expect(prismaService.treballadorJornadaPlantilla.create).not.toHaveBeenCalled();
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

            const createdTreballador = {
                id: 100,
                empresaId,
                idUsuari: targetUserId,
                nom: createDto.nom,
            };

            // Only one service returned instead of two
            const serveisDocs = [
                { id: 1, empresaId },
            ];

            mockPrismaService.treballador.create.mockResolvedValue(createdTreballador);
            mockPrismaService.servei.findMany.mockResolvedValue(serveisDocs);

            await expect(service.create(empresaId, dtoWithServeis, adminUserId)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if user is not ADMIN_GENERAL', async () => {
            const nonAdminUser = { ...adminUser, rol: 'EMPLEAT' };

            mockPrismaService.usuari.findUnique.mockResolvedValueOnce(nonAdminUser);

            await expect(service.create(empresaId, createDto, adminUserId)).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should throw NotFoundException if target user does not exist', async () => {
            mockPrismaService.usuari.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(null);

            await expect(service.create(empresaId, createDto, adminUserId)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException if target user belongs to another company', async () => {
            const otherCompanyUser = { ...targetUser, empresaId: 999 };

            mockPrismaService.usuari.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(otherCompanyUser);

            await expect(service.create(empresaId, createDto, adminUserId)).rejects.toThrow(
                ForbiddenException,
            );
        });
        describe('assignarServeis', () => {
            const empresaId = 1;
            const adminUserId = 1;

            const dto = {
                treballadorId: 100,
                serveisIds: [10, 11],
            };

            const adminUser = {
                id: adminUserId,
                rol: 'ADMIN_GENERAL',
                empresaId: empresaId,
            };

            const treballador = {
                id: 100,
                empresaId: empresaId,
            };

            const serveis = [
                { id: 10, empresaId: empresaId },
                { id: 11, empresaId: empresaId },
            ];

            it('should assign services successfully', async () => {
                mockPrismaService.usuari.findUnique.mockResolvedValue(adminUser);
                mockPrismaService.treballador.findUnique.mockResolvedValue(treballador);
                prismaService.servei.findMany = jest.fn().mockResolvedValue(serveis);
                prismaService.$transaction = jest.fn().mockImplementation((cb) => cb(prismaService));
                prismaService.treballadorServei.findUnique = jest.fn().mockResolvedValue(null); // No existing assignment
                prismaService.treballadorServei.create = jest.fn().mockResolvedValue({ id: 1 });

                await service.assignarServeis(empresaId, dto, adminUserId);

                expect(prismaService.treballadorServei.create).toHaveBeenCalledTimes(2);
            });

            it('should throw ForbiddenException if user is not ADMIN_GENERAL', async () => {
                const nonAdminUser = { ...adminUser, rol: 'EMPLEAT' };
                mockPrismaService.usuari.findUnique.mockResolvedValue(nonAdminUser);

                await expect(service.assignarServeis(empresaId, dto, adminUserId)).rejects.toThrow(
                    ForbiddenException,
                );
            });

            it('should throw NotFoundException if worker does not exist', async () => {
                mockPrismaService.usuari.findUnique.mockResolvedValue(adminUser);
                mockPrismaService.treballador.findUnique.mockResolvedValue(null);

                await expect(service.assignarServeis(empresaId, dto, adminUserId)).rejects.toThrow(
                    NotFoundException,
                );
            });

            it('should throw NotFoundException if any service does not exist', async () => {
                mockPrismaService.usuari.findUnique.mockResolvedValue(adminUser);
                mockPrismaService.treballador.findUnique.mockResolvedValue(treballador);
                prismaService.servei.findMany = jest.fn().mockResolvedValue([serveis[0]]); // Only one service found

                await expect(service.assignarServeis(empresaId, dto, adminUserId)).rejects.toThrow(
                    NotFoundException,
                );
            });
        });
    });

    describe('getDisponibilitat', () => {
        const empresaId = 1;
        const adminUserId = 1;
        const workerId = 100;
        const serviceId = 5;

        const adminUser = { id: adminUserId, rol: 'ADMIN_GENERAL', empresaId };
        const worker = { id: workerId, empresaId };
        const servei = { id: serviceId, empresaId, duradaMin: 60 };

        it('should return availability slots', async () => {
            mockPrismaService.usuari.findUnique.mockResolvedValue(adminUser);
            mockPrismaService.treballador.findUnique.mockResolvedValue(worker);
            prismaService.servei.findUnique = jest.fn().mockResolvedValue(servei);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const assignments = [{
                dataInici: new Date(today),
                dataFi: null,
                anchorRotacioIndex: 0,
                plantilla: {
                    rotacions: [{
                        index: 0,
                        dies: [{
                            dow: new Date().getDay() || 7, // Today
                            trams: [{ iniciMin: 480, fiMin: 1080 }] // 08:00 - 18:00
                        }]
                    }]
                }
            }];

            prismaService.treballadorJornadaPlantilla.findMany = jest.fn().mockResolvedValue(assignments);
            prismaService.reserva.findMany = jest.fn().mockResolvedValue([]);
            prismaService.absencia.findMany = jest.fn().mockResolvedValue([]);

            const result = await service.getDisponibilitat(empresaId, workerId, serviceId, adminUserId);

            expect(result).toBeDefined();
            const dateKey = today.toISOString().split('T')[0];
            expect(result[dateKey]).toBeDefined();
            expect(result[dateKey].length).toBeGreaterThan(0);
        });

        it('should filter slots based on reservations', async () => {
            mockPrismaService.usuari.findUnique.mockResolvedValue(adminUser);
            mockPrismaService.treballador.findUnique.mockResolvedValue(worker);
            prismaService.servei.findUnique = jest.fn().mockResolvedValue(servei);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Create a reservation from 08:00 to 09:00
            const reservationDate = new Date(today);
            reservationDate.setHours(8, 0, 0, 0);

            const assignments = [{
                dataInici: new Date(today),
                dataFi: null,
                anchorRotacioIndex: 0,
                plantilla: {
                    rotacions: [{
                        index: 0,
                        dies: [{
                            dow: new Date().getDay() || 7,
                            trams: [{ iniciMin: 480, fiMin: 600 }] // 08:00 - 10:00
                        }]
                    }]
                }
            }];

            const reserves = [{
                dataHora: reservationDate,
                servei: { duradaMin: 60 }
            }];

            prismaService.treballadorJornadaPlantilla.findMany = jest.fn().mockResolvedValue(assignments);
            prismaService.reserva.findMany = jest.fn().mockResolvedValue(reserves);
            prismaService.absencia.findMany = jest.fn().mockResolvedValue([]);

            const result = await service.getDisponibilitat(empresaId, workerId, serviceId, adminUserId);

            const dateKey = today.toISOString().split('T')[0];
            // 08:00-09:00 blocked. 09:00-10:00 should be free.
            expect(result[dateKey]).toContain('09:00 - 10:00');
            expect(result[dateKey]).not.toContain('08:00 - 09:00');
        });
    });
});
