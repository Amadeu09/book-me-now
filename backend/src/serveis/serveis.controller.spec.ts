import { Test, TestingModule } from '@nestjs/testing';
import { ServeisController } from './serveis.controller';
import { ServeisService } from './serveis.service';
import { CreateServeiDto, UpdateServeiDto } from './dto/servei.dto';
import { Rol } from '@prisma/client';

const mockServeisService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByTreballador: jest.fn(),
};

describe('ServeisController', () => {
    let controller: ServeisController;
    let service: ServeisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServeisController],
            providers: [
                {
                    provide: ServeisService,
                    useValue: mockServeisService,
                },
            ],
        }).compile();

        controller = module.get<ServeisController>(ServeisController);
        service = module.get<ServeisService>(ServeisService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: CreateServeiDto = { nom: 'Test', duradaMin: 60, preu: 50 };
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockServeisService.create.mockResolvedValue('created');

            const result = await controller.create(dto, user);

            expect(service.create).toHaveBeenCalledWith(user.empresaId, dto);
            expect(result).toBe('created');
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockServeisService.findAll.mockResolvedValue(['serveis']);

            const result = await controller.findAll(user);

            expect(service.findAll).toHaveBeenCalledWith(user.empresaId, 1, 4);
            expect(result).toEqual(['serveis']);
        });
    });

    describe('findOne', () => {
        it('should call service.findOne', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockServeisService.findOne.mockResolvedValue('servei');

            const result = await controller.findOne(1, user);

            expect(service.findOne).toHaveBeenCalledWith(user.empresaId, 1);
            expect(result).toBe('servei');
        });
    });

    describe('update', () => {
        it('should call service.update', async () => {
            const dto: UpdateServeiDto = { nom: 'Updated' };
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockServeisService.update.mockResolvedValue('updated');

            const result = await controller.update(1, dto, user);

            expect(service.update).toHaveBeenCalledWith(user.empresaId, 1, dto);
            expect(result).toBe('updated');
        });
    });

    describe('remove', () => {
        it('should call service.remove', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockServeisService.remove.mockResolvedValue('removed');

            const result = await controller.remove(1, user);

            expect(service.remove).toHaveBeenCalledWith(user.empresaId, 1);
            expect(result).toBe('removed');
        });
    });

    describe('findByTreballador', () => {
        it('should call service.findByTreballador', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockServeisService.findByTreballador.mockResolvedValue(['serveis']);

            const result = await controller.findByTreballador(1, user);

            expect(service.findByTreballador).toHaveBeenCalledWith(user.empresaId, 1);
            expect(result).toEqual(['serveis']);
        });
    });
});
