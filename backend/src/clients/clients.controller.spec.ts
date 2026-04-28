import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Rol } from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

const mockClientsService = {
  createClient: jest.fn(),
  updateClient: jest.fn(),
  deleteClient: jest.fn(),
  findAllByEmpresa: jest.fn(),
  findAllByEmpresaPaginat: jest.fn(),
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

  describe('create', () => {
    it('should call service.createClient with dto and user', async () => {
      const dto = { nom: 'Anna García', email: 'anna@test.com', telefon: '600111222' };
      const created = { id: 1, ...dto, empresaId: 10 };
      mockClientsService.createClient.mockResolvedValue(created);

      const result = await controller.create(dto, adminUser);

      expect(service.createClient).toHaveBeenCalledWith(dto, adminUser);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should call service.updateClient with id, dto and user', async () => {
      const dto = { nom: 'Anna Actualitzada' };
      const updated = { id: 1, nom: 'Anna Actualitzada', email: 'anna@test.com', telefon: '600111222', empresaId: 10 };
      mockClientsService.updateClient.mockResolvedValue(updated);

      const result = await controller.update(1, dto, adminUser);

      expect(service.updateClient).toHaveBeenCalledWith(1, dto, adminUser);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call service.deleteClient with id and user', async () => {
      const deleted = { id: 1, nom: 'Anna García', empresaId: 10 };
      mockClientsService.deleteClient.mockResolvedValue(deleted);

      const result = await controller.remove(1, adminUser);

      expect(service.deleteClient).toHaveBeenCalledWith(1, adminUser);
      expect(result).toEqual(deleted);
    });
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

  describe('findAllByEmpresaPaginat', () => {
    it('should call service.findAllByEmpresaPaginat with the correct params', async () => {
      const paginatedResult = {
        data: [{ id: 1, nom: 'Anna', empresaId: 10 }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      mockClientsService.findAllByEmpresaPaginat.mockResolvedValue(paginatedResult);
      const query = { page: 1, limit: 20 };

      const result = await controller.findAllByEmpresaPaginat(10, adminUser, query);

      expect(service.findAllByEmpresaPaginat).toHaveBeenCalledWith(10, adminUser, query);
      expect(result).toEqual(paginatedResult);
    });
  });
});
