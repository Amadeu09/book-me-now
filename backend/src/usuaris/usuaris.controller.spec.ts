import { Test, TestingModule } from '@nestjs/testing';
import { UsuarisController } from './usuaris.controller';
import { UsuarisService } from './usuaris.service';
import { CreateUsuariDto, UpdateUsuariDto } from './dto/usuari.dto';
import { Rol } from '@prisma/client';

const mockUsuarisService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe('UsuarisController', () => {
    let controller: UsuarisController;
    let service: UsuarisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsuarisController],
            providers: [
                {
                    provide: UsuarisService,
                    useValue: mockUsuarisService,
                },
            ],
        }).compile();

        controller = module.get<UsuarisController>(UsuarisController);
        service = module.get<UsuarisService>(UsuarisService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: CreateUsuariDto = { email: 'test@test.com', password: '123', rol: 'ADMIN_GENERAL' as Rol, empresaId: 1, nom: "Nom" };
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockUsuarisService.create.mockResolvedValue('created');

            const result = await controller.create(dto, user);

            expect(service.create).toHaveBeenCalledWith(dto, user.userId);
            expect(result).toBe('created');
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockUsuarisService.findAll.mockResolvedValue(['usuaris']);

            const result = await controller.findAll(user);

            expect(service.findAll).toHaveBeenCalledWith(user.empresaId, user.rol);
            expect(result).toEqual(['usuaris']);
        });
    });

    describe('findOne', () => {
        it('should call service.findOne', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockUsuarisService.findOne.mockResolvedValue('usuari');

            const result = await controller.findOne(1, user);

            expect(service.findOne).toHaveBeenCalledWith(1, user.empresaId, user.rol);
            expect(result).toBe('usuari');
        });
    });

    describe('update', () => {
        it('should call service.update', async () => {
            const dto: UpdateUsuariDto = { email: 'new@test.com' };
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockUsuarisService.update.mockResolvedValue('updated');

            const result = await controller.update(1, dto, user);

            expect(service.update).toHaveBeenCalledWith(1, dto, user.empresaId, user.rol);
            expect(result).toBe('updated');
        });
    });

    describe('remove', () => {
        it('should call service.remove', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t', rol: 'ADMIN_GENERAL' as Rol };
            mockUsuarisService.remove.mockResolvedValue('removed');

            const result = await controller.remove(1, user);

            expect(service.remove).toHaveBeenCalledWith(1, user.empresaId, user.rol);
            expect(result).toBe('removed');
        });
    });
});
