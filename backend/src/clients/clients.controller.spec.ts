import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Rol } from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

const mockClientsService = {
  findAllByEmpresa: jest.fn(),
};

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: ClientsService;

  const adminUser: CurrentUserData = {
    userId: 1,
    email: 'admin@test.com',
    rol: 'ADMIN_GENERAL' as Rol,
    empresaId: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        { provide: ClientsService, useValue: mockClientsService },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get<ClientsService>(ClientsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllByEmpresa', () => {
    it('should call service.findAllByEmpresa with the correct params', async () => {
      const mockClients = [{ id: 1, nom: 'Anna', empresaId: 10 }];
      mockClientsService.findAllByEmpresa.mockResolvedValue(mockClients);

      const result = await controller.findAllByEmpresa(10, adminUser);

      expect(service.findAllByEmpresa).toHaveBeenCalledWith(10, adminUser);
      expect(result).toEqual(mockClients);
    });
  });
});
