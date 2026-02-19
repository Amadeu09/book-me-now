import { Test, TestingModule } from '@nestjs/testing';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';
import { CreateReservaDto, UpdateReservaEstatDto } from './dto/reserves.dto';

const mockReservesService = {
    create: jest.fn(),
    updateEstado: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
};

describe('ReservesController', () => {
    let controller: ReservesController;
    let service: ReservesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReservesController],
            providers: [
                {
                    provide: ReservesService,
                    useValue: mockReservesService,
                },
            ],
        }).compile();

        controller = module.get<ReservesController>(ReservesController);
        service = module.get<ReservesService>(ReservesService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: CreateReservaDto = {
                idServei: 1,
                idTreballador: 1,
                data: '2023-01-01',
                hora: '10:00',
                email: 'test@example.com',
                nom: 'Test',
                cognoms: 'Cognoms',
                telefon: '123',
                observacions: '',
            };
            mockReservesService.create.mockResolvedValue('created');

            const result = await controller.create(dto);

            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toBe('created');
        });
    });

    describe('updateEstado', () => {
        it('should call service.updateEstado', async () => {
            const dto: UpdateReservaEstatDto = { nouEstat: 'CONFIRMADA', idReserva: 1 };
            mockReservesService.updateEstado.mockResolvedValue('updated');

            const result = await controller.updateEstado(1, dto);

            expect(service.updateEstado).toHaveBeenCalledWith(1, dto.nouEstat);
            expect(result).toBe('updated');
        });
    });

    describe('delete', () => {
        it('should call service.delete', async () => {
            mockReservesService.delete.mockResolvedValue('deleted');

            const result = await controller.delete(1);

            expect(service.delete).toHaveBeenCalledWith(1);
            expect(result).toBe('deleted');
        });
    });

    describe('update', () => {
        it('should call service.update', async () => {
            const dto: CreateReservaDto = {
                idServei: 1,
                idTreballador: 1,
                data: '2023-01-01',
                hora: '10:00',
                email: 'test@example.com',
                nom: 'Test',
                cognoms: 'Cognoms',
                telefon: '123',
                observacions: '',
            };
            mockReservesService.update.mockResolvedValue('updated');

            const result = await controller.update(1, dto);

            expect(service.update).toHaveBeenCalledWith(1, dto);
            expect(result).toBe('updated');
        });
    });
});
