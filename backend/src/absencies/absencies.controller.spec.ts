import { Test, TestingModule } from '@nestjs/testing';
import { AbsenciesController } from './absencies.controller';
import { AbsenciesService } from './absencies.service';
import { CreateAbsenciaDto, UpdateAbsenciaDto } from './dto/absencia.dto';
import { Rol } from '@prisma/client';

const mockAbsenciesService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe('AbsenciesController', () => {
    let controller: AbsenciesController;
    let service: AbsenciesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AbsenciesController],
            providers: [
                {
                    provide: AbsenciesService,
                    useValue: mockAbsenciesService,
                },
            ],
        }).compile();

        controller = module.get<AbsenciesController>(AbsenciesController);
        service = module.get<AbsenciesService>(AbsenciesService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create with correct parameters', async () => {
            const dto: CreateAbsenciaDto = {
                treballadorId: 1,
                inici: '2023-01-01',
                fi: '2023-01-02',
                motiu: 'Test',
            };
            const user = { userId: 1, empresaId: 1, email: 'test@example.com', rol: 'ADMIN_GENERAL' as Rol };

            mockAbsenciesService.create.mockResolvedValue('created');

            const result = await controller.create(dto, user);

            expect(service.create).toHaveBeenCalledWith(user.empresaId, dto, user.userId);
            expect(result).toBe('created');
        });
    });

    describe('update', () => {
        it('should call service.update with correct parameters', async () => {
            const dto: UpdateAbsenciaDto = { motiu: 'Updated' };
            const user = { userId: 1, empresaId: 1, email: 'test@example.com', rol: 'ADMIN_GENERAL' as Rol };
            const id = 10;

            mockAbsenciesService.update.mockResolvedValue('updated');

            const result = await controller.update(id, dto, user);

            expect(service.update).toHaveBeenCalledWith(user.empresaId, id, dto, user.userId);
            expect(result).toBe('updated');
        });
    });

    describe('delete', () => {
        it('should call service.remove with correct parameters', async () => {
            const user = { userId: 1, empresaId: 1, email: 'test@example.com', rol: 'ADMIN_GENERAL' as Rol };
            const id = 10;

            mockAbsenciesService.remove.mockResolvedValue('deleted');

            const result = await controller.delete(id, user);

            expect(service.remove).toHaveBeenCalledWith(user.empresaId, id, user.userId);
            expect(result).toBe('deleted');
        });
    });
});
