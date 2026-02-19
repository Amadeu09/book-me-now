import { Test, TestingModule } from '@nestjs/testing';
import { JornadesController } from './jornades.controller';
import { JornadesService } from './jornades.service';
import { Rol } from '@prisma/client';

const mockJornadesService = {
    create: jest.fn(),
    findAll: jest.fn(),
};

describe('JornadesController', () => {
    let controller: JornadesController;
    let service: JornadesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [JornadesController],
            providers: [
                {
                    provide: JornadesService,
                    useValue: mockJornadesService,
                },
            ],
        }).compile();

        controller = module.get<JornadesController>(JornadesController);
        service = module.get<JornadesService>(JornadesService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto = { nom: 'Test', rotacions: [], empresaId: 1 };
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            const empresaId = 1;

            mockJornadesService.create.mockResolvedValue('created');

            const result = await controller.create(empresaId, dto, user);

            expect(service.create).toHaveBeenCalledWith(empresaId, dto, user.empresaId, user.rol);
            expect(result).toBe('created');
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            const empresaId = 1;

            mockJornadesService.findAll.mockResolvedValue(['plantilla']);

            const result = await controller.findAll(empresaId, user);

            expect(service.findAll).toHaveBeenCalledWith(empresaId, user.empresaId, user.rol);
            expect(result).toEqual(['plantilla']);
        });
    });
});
