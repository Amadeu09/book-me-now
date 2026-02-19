import { Test, TestingModule } from '@nestjs/testing';
import { TreballadorsController } from './treballadors.controller';
import { TreballadorsService } from './treballadors.service';
import { CreateTreballadorDto, CreateJornadaTreballadorExistDto } from './dto/CreateTreballadorDto';
import { AssignarServeisDto } from './dto/AssignarServeisDto';
import { Rol } from '@prisma/client';

const mockTreballadorsService = {
    create: jest.fn(),
    assignJornadaTreballador: jest.fn(),
    assignarServeis: jest.fn(),
};

describe('TreballadorsController', () => {
    let controller: TreballadorsController;
    let service: TreballadorsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TreballadorsController],
            providers: [
                {
                    provide: TreballadorsService,
                    useValue: mockTreballadorsService,
                },
            ],
        }).compile();

        controller = module.get<TreballadorsController>(TreballadorsController);
        service = module.get<TreballadorsService>(TreballadorsService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: CreateTreballadorDto = { nom: 'Test', idUsuari: 2 };
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockTreballadorsService.create.mockResolvedValue('created');

            const result = await controller.create(dto, user);

            expect(service.create).toHaveBeenCalledWith(user.empresaId, dto, user.userId);
            expect(result).toBe('created');
        });
    });

    describe('assignarJornada', () => {
        it('should call service.assignJornadaTreballador', async () => {
            const dto: CreateJornadaTreballadorExistDto = {
                treballadorId: 1,
                plantillaJornadaId: 1,
                dataInici: new Date().toISOString(),
                dataFi: undefined
            };
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockTreballadorsService.assignJornadaTreballador.mockResolvedValue('assigned');

            const result = await controller.assignarJornada(dto, user);

            expect(service.assignJornadaTreballador).toHaveBeenCalledWith(user.empresaId, dto, user.userId);
            expect(result).toBe('assigned');
        });
    });

    describe('assignarServeis', () => {
        it('should call service.assignarServeis', async () => {
            const dto: AssignarServeisDto = { treballadorId: 1, serveisIds: [1, 2] };
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockTreballadorsService.assignarServeis.mockResolvedValue('assigned');

            const result = await controller.assignarServeis(dto, user);

            expect(service.assignarServeis).toHaveBeenCalledWith(user.empresaId, dto, user.userId);
            expect(result).toBe('assigned');
        });
    });
});
