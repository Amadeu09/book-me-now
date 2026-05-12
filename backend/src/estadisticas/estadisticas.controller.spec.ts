import { Test, TestingModule } from '@nestjs/testing';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { Rol } from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

const mockEstadisticasService = {
    getResum: jest.fn(),
    getDetall: jest.fn(),
};

const adminUser: CurrentUserData = {
    userId: 1,
    email: 'admin@test.com',
    rol: 'ADMIN_GENERAL' as Rol,
    empresaId: 10,
};

describe('EstadisticasController', () => {
    let controller: EstadisticasController;
    let service: EstadisticasService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EstadisticasController],
            providers: [
                { provide: EstadisticasService, useValue: mockEstadisticasService },
            ],
        }).compile();

        controller = module.get<EstadisticasController>(EstadisticasController);
        service = module.get<EstadisticasService>(EstadisticasService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getDetall', () => {
        it('should call service.getDetall with query and user and return the result', async () => {
            const mockResult = {
                mes: 'Abril 2026',
                serveisDestacats: [{ id: 1, nom: 'Tall', reserves: 10, ingressos: 300 }],
                treballadorsDestacats: [{ id: 2, nom: 'Maria', reserves: 8, ingressos: 240, noShows: 1 }],
            };
            mockEstadisticasService.getDetall.mockResolvedValue(mockResult);
            const query = { year: 2026, mes: 4 };

            const result = await controller.getDetall(query, adminUser);

            expect(service.getDetall).toHaveBeenCalledWith(adminUser, query);
            expect(result).toEqual(mockResult);
        });
    });

    describe('getResum', () => {
        it('should call service.getResum with query and user and return the result', async () => {
            const mockResult = {
                reservesMes: { 'Abril 2026': { total: 10 } },
                noShowsMes: { 'Abril 2026': { total: 2 } },
                ingresosMes: { mesActual: 1500, mesPassat: 1250 },
            };
            mockEstadisticasService.getResum.mockResolvedValue(mockResult);
            const query = { mesVisites: 6, mesNoShow: 6 };

            const result = await controller.getResum(query, adminUser);

            expect(service.getResum).toHaveBeenCalledWith(adminUser, query);
            expect(result).toEqual(mockResult);
        });
    });
});
