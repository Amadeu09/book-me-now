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
        },
        servei: {
            findMany: jest.fn(),
        },
        treballadorServei: {
            create: jest.fn(),
            findUnique: jest.fn(),
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
});
