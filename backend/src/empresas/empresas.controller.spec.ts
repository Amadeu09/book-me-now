import { Test, TestingModule } from '@nestjs/testing';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/empresa.dto';
import { Rol } from '@prisma/client';

const mockEmpresasService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe('EmpresasController', () => {
    let controller: EmpresasController;
    let service: EmpresasService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EmpresasController],
            providers: [
                {
                    provide: EmpresasService,
                    useValue: mockEmpresasService,
                },
            ],
        }).compile();

        controller = module.get<EmpresasController>(EmpresasController);
        service = module.get<EmpresasService>(EmpresasService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: CreateEmpresaDto = { nom: 'Test', ubicacio: 'Loc' };
            mockEmpresasService.create.mockResolvedValue('created');

            const result = await controller.create(dto);

            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toBe('created');
        });
    });

    describe('findAll', () => {
        it('should call service.findAll with empresaId', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t.com', rol: 'ADMIN_GENERAL' as Rol };
            mockEmpresasService.findAll.mockResolvedValue(['empresa']);

            const result = await controller.findAll(user);

            expect(service.findAll).toHaveBeenCalledWith(user.empresaId);
            expect(result).toEqual(['empresa']);
        });
    });

    describe('findOne', () => {
        it('should call service.findOne without rol', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t.com', rol: 'ADMIN_GENERAL' as Rol };
            mockEmpresasService.findOne.mockResolvedValue('empresa');

            const result = await controller.findOne(1, user);

            expect(service.findOne).toHaveBeenCalledWith(1, user.empresaId);
            expect(result).toBe('empresa');
        });
    });

    describe('update', () => {
        it('should call service.update without rol', async () => {
            const dto: UpdateEmpresaDto = { nom: 'Updated' };
            const user = { userId: 1, empresaId: 1, email: 't@t.com', rol: 'ADMIN_GENERAL' as Rol };
            mockEmpresasService.update.mockResolvedValue('updated');

            const result = await controller.update(1, dto, user);

            expect(service.update).toHaveBeenCalledWith(1, dto, user.empresaId);
            expect(result).toBe('updated');
        });
    });

    describe('remove', () => {
        it('should call service.remove with empresaId', async () => {
            const user = { userId: 1, empresaId: 1, email: 't@t.com', rol: 'ADMIN_GENERAL' as Rol };
            mockEmpresasService.remove.mockResolvedValue('removed');

            const result = await controller.remove(1, user);

            expect(service.remove).toHaveBeenCalledWith(1, user.empresaId);
            expect(result).toBe('removed');
        });
    });
});
