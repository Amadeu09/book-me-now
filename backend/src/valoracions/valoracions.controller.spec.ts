import { Test, TestingModule } from '@nestjs/testing';
import { ValoracionsController } from './valoracions.controller';
import { ValoracionsService } from './valoracions.service';
import { CreateValoracioDto, UpdateValoracioDto } from './dto/valoracions.dto';
import { ValoracioTipus } from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

const mockUser: CurrentUserData = {
    userId: 1,
    email: 'admin@test.com',
    rol: 'ADMIN_GENERAL' as any,
    empresaId: 1,
};

describe('ValoracionsController', () => {
    let controller: ValoracionsController;
    let service: ValoracionsService;

    const mockValoracionsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ValoracionsController],
            providers: [
                {
                    provide: ValoracionsService,
                    useValue: mockValoracionsService,
                },
            ],
        }).compile();

        controller = module.get<ValoracionsController>(ValoracionsController);
        service = module.get<ValoracionsService>(ValoracionsService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create with dto', async () => {
            const dto: CreateValoracioDto = {
                id: 1,
                tipusValoracio: ValoracioTipus.SALA,
                valoracio: 5,
                nomClient: 'Test',
                comentari: 'test comment',
                idServeis: 1
            };
            mockValoracionsService.create.mockResolvedValue('created');
            const result = await controller.create(dto, mockUser);
            expect(service.create).toHaveBeenCalledWith(dto, mockUser);
            expect(result).toBe('created');
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            mockValoracionsService.findAll.mockResolvedValue(['all']);
            const result = await controller.findAll(mockUser);
            expect(service.findAll).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(['all']);
        });
    });

    describe('findOne', () => {
        it('should call service.findOne', async () => {
            mockValoracionsService.findOne.mockResolvedValue('one');
            const result = await controller.findOne(1);
            expect(service.findOne).toHaveBeenCalledWith(1);
            expect(result).toBe('one');
        });
    });

    describe('update', () => {
        it('should call service.update', async () => {
            const dto: UpdateValoracioDto = { valoracio: 4 };
            mockValoracionsService.update.mockResolvedValue('updated');
            const result = await controller.update(1, dto);
            expect(service.update).toHaveBeenCalledWith(1, dto);
            expect(result).toBe('updated');
        });
    });

    describe('remove', () => {
        it('should call service.remove', async () => {
            mockValoracionsService.remove.mockResolvedValue('removed');
            const result = await controller.remove(1);
            expect(service.remove).toHaveBeenCalledWith(1);
            expect(result).toBe('removed');
        });
    });
});
