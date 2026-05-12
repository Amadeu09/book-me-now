import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { PrismaService } from '../prisma/prisma.service';
import { Rol } from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

const mockPrismaService = {
    reserva: {
        findMany: jest.fn(),
    },
};

const adminUser: CurrentUserData = {
    userId: 1,
    email: 'admin@test.com',
    rol: 'ADMIN_GENERAL' as Rol,
    empresaId: 10,
};

const empleatUser: CurrentUserData = {
    userId: 2,
    email: 'empleat@test.com',
    rol: 'EMPLEAT' as Rol,
    empresaId: 10,
};

describe('EstadisticasService', () => {
    let service: EstadisticasService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EstadisticasService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<EstadisticasService>(EstadisticasService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getResum', () => {
        it('should throw ForbiddenException if user is EMPLEAT', async () => {
            await expect(service.getResum(empleatUser, {})).rejects.toThrow(ForbiddenException);
            expect(mockPrismaService.reserva.findMany).not.toHaveBeenCalled();
        });

        it('should return correct structure with all keys', async () => {
            mockPrismaService.reserva.findMany
                .mockResolvedValueOnce([])  // visites
                .mockResolvedValueOnce([])  // no-shows
                .mockResolvedValueOnce([])  // ingressos mes actual
                .mockResolvedValueOnce([]); // ingressos mes passat

            const result = await service.getResum(adminUser, { mesVisites: 6, mesNoShow: 6 });

            expect(result).toHaveProperty('reservesMes');
            expect(result).toHaveProperty('noShowsMes');
            expect(result).toHaveProperty('ingresosMes');
            expect(result.ingresosMes).toHaveProperty('mesActual');
            expect(result.ingresosMes).toHaveProperty('mesPassat');
        });

        it('should build a month map with N entries ordered chronologically', async () => {
            mockPrismaService.reserva.findMany
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            const result = await service.getResum(adminUser, { mesVisites: 3, mesNoShow: 3 });

            const keys = Object.keys(result.reservesMes);
            expect(keys).toHaveLength(3);
            // All entries initialized to 0
            keys.forEach(k => expect(result.reservesMes[k].total).toBe(0));
        });

        it('should count reservations correctly per month', async () => {
            const now = new Date();
            const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 15);
            const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 10);

            mockPrismaService.reserva.findMany
                .mockResolvedValueOnce([
                    { dataHora: currentMonthDate },
                    { dataHora: currentMonthDate },
                    { dataHora: prevMonthDate },
                ])  // visites
                .mockResolvedValueOnce([{ dataHora: currentMonthDate }])  // no-shows
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            const result = await service.getResum(adminUser, { mesVisites: 6, mesNoShow: 6 });

            const visitKeys = Object.keys(result.reservesMes);
            const currentKey = visitKeys[visitKeys.length - 1];
            const prevKey = visitKeys[visitKeys.length - 2];

            expect(result.reservesMes[currentKey].total).toBe(2);
            expect(result.reservesMes[prevKey].total).toBe(1);
            expect(result.noShowsMes[currentKey].total).toBe(1);
        });

        it('should sum preu correctly for ingressosMes', async () => {
            mockPrismaService.reserva.findMany
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                    { servei: { preu: '50.00' } },
                    { servei: { preu: '35.50' } },
                ])  // ingressos mes actual
                .mockResolvedValueOnce([
                    { servei: { preu: '40.00' } },
                ]); // ingressos mes passat

            const result = await service.getResum(adminUser, {});

            expect(result.ingresosMes.mesActual).toBe(85.5);
            expect(result.ingresosMes.mesPassat).toBe(40);
        });

        it('should return 0 ingressos when no reservations exist', async () => {
            mockPrismaService.reserva.findMany.mockResolvedValue([]);
            const result = await service.getResum(adminUser, {});
            expect(result.ingresosMes.mesActual).toBe(0);
            expect(result.ingresosMes.mesPassat).toBe(0);
        });
    });

    describe('getDetall', () => {
        const query = { year: 2026, mes: 4 };

        it('should throw ForbiddenException if user is EMPLEAT', async () => {
            await expect(service.getDetall(empleatUser, query)).rejects.toThrow(ForbiddenException);
            expect(mockPrismaService.reserva.findMany).not.toHaveBeenCalled();
        });

        it('should return correct structure with empty arrays when no data', async () => {
            mockPrismaService.reserva.findMany
                .mockResolvedValueOnce([])  // confirmades
                .mockResolvedValueOnce([]); // noShows

            const result = await service.getDetall(adminUser, query);

            expect(result).toHaveProperty('mes', 'Abril 2026');
            expect(result.serveisDestacats).toEqual([]);
            expect(result.treballadorsDestacats).toEqual([]);
        });

        it('should group and sort services by reserves desc', async () => {
            mockPrismaService.reserva.findMany
                .mockResolvedValueOnce([
                    { serveiId: 1, treballadorId: null, treballador: null, servei: { nom: 'Tall', preu: '30.00' } },
                    { serveiId: 1, treballadorId: null, treballador: null, servei: { nom: 'Tall', preu: '30.00' } },
                    { serveiId: 2, treballadorId: null, treballador: null, servei: { nom: 'Tint', preu: '50.00' } },
                ])
                .mockResolvedValueOnce([]);

            const result = await service.getDetall(adminUser, query);

            expect(result.serveisDestacats[0]).toMatchObject({ id: 1, nom: 'Tall', reserves: 2, ingressos: 60 });
            expect(result.serveisDestacats[1]).toMatchObject({ id: 2, nom: 'Tint', reserves: 1, ingressos: 50 });
        });

        it('should group treballadors and add no-shows correctly', async () => {
            mockPrismaService.reserva.findMany
                .mockResolvedValueOnce([
                    { serveiId: 1, treballadorId: 10, treballador: { nom: 'Maria' }, servei: { nom: 'Tall', preu: '30.00' } },
                    { serveiId: 1, treballadorId: 10, treballador: { nom: 'Maria' }, servei: { nom: 'Tall', preu: '30.00' } },
                ])
                .mockResolvedValueOnce([
                    { treballadorId: 10 },
                ]);

            const result = await service.getDetall(adminUser, query);

            expect(result.treballadorsDestacats[0]).toMatchObject({ id: 10, nom: 'Maria', reserves: 2, ingressos: 60, noShows: 1 });
        });

        it('should limit results to top 5', async () => {
            const manyReserves = Array.from({ length: 8 }, (_, i) => ({
                serveiId: i + 1,
                treballadorId: null,
                treballador: null,
                servei: { nom: `Servei ${i + 1}`, preu: '20.00' },
            }));
            mockPrismaService.reserva.findMany
                .mockResolvedValueOnce(manyReserves)
                .mockResolvedValueOnce([]);

            const result = await service.getDetall(adminUser, query);

            expect(result.serveisDestacats).toHaveLength(5);
        });
    });
});
