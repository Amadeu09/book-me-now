import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { Rol } from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const mockPrismaService = {
  client: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const adminUser: CurrentUserData = {
  userId: 1,
  email: 'admin@test.com',
  rol: 'ADMIN_GENERAL' as Rol,
  empresaId: 10,
};

const empleatUser: CurrentUserData = {
  userId: 2,
  email: 'empleat@test.com',
  rol: 'EMPLEAT' as Rol,
  empresaId: 10,
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createClient', () => {
    const dto = { nom: 'Anna García', email: 'anna@test.com', telefon: '600111222' };
    const created = { id: 1, ...dto, empresaId: 10, createdAt: new Date(), updatedAt: new Date() };

    it('should create a client for the admin\'s empresa', async () => {
      mockPrismaService.client.create.mockResolvedValue(created);

      const result = await service.createClient(dto, adminUser);

      expect(result).toEqual(created);
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: { nom: 'Anna García', email: 'anna@test.com', telefon: '600111222', empresaId: 10 },
      });
    });

    it('should throw ForbiddenException if user is EMPLEAT', async () => {
      await expect(service.createClient(dto, empleatUser)).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.client.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate email', async () => {
      const prismaError = new PrismaClientKnownRequestError('Unique constraint', { code: 'P2002', clientVersion: '5.0.0' });
      mockPrismaService.client.create.mockRejectedValue(prismaError);

      await expect(service.createClient(dto, adminUser)).rejects.toThrow(ConflictException);
    });

    it('should store null when email and telefon are omitted', async () => {
      const dtoMinimal = { nom: 'Bernat' };
      mockPrismaService.client.create.mockResolvedValue({ id: 2, nom: 'Bernat', email: null, telefon: null, empresaId: 10 });

      await service.createClient(dtoMinimal, adminUser);

      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: { nom: 'Bernat', email: null, telefon: null, empresaId: 10 },
      });
    });
  });

  describe('updateClient', () => {
    const existingClient = { id: 1, nom: 'Anna García', email: 'anna@test.com', telefon: '600111222', empresaId: 10 };
    const dto = { nom: 'Anna Actualitzada', email: 'anna2@test.com' };

    it('should update a client belonging to the admin\'s empresa', async () => {
      const updated = { ...existingClient, ...dto };
      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);
      mockPrismaService.client.update.mockResolvedValue(updated);

      const result = await service.updateClient(1, dto, adminUser);

      expect(result).toEqual(updated);
      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { nom: 'Anna Actualitzada', email: 'anna2@test.com' },
      });
    });

    it('should throw ForbiddenException if user is EMPLEAT', async () => {
      await expect(service.updateClient(1, dto, empleatUser)).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.client.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if client does not exist', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      await expect(service.updateClient(99, dto, adminUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if client belongs to another empresa', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue({ ...existingClient, empresaId: 99 });
      await expect(service.updateClient(1, dto, adminUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);
      const prismaError = new PrismaClientKnownRequestError('Unique constraint', { code: 'P2002', clientVersion: '5.0.0' });
      mockPrismaService.client.update.mockRejectedValue(prismaError);
      await expect(service.updateClient(1, { email: 'duplicate@test.com' }, adminUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteClient', () => {
    const existingClient = { id: 1, nom: 'Anna García', email: 'anna@test.com', telefon: '600111222', empresaId: 10 };

    it('should delete a client belonging to the admin\'s empresa', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);
      mockPrismaService.client.delete.mockResolvedValue(existingClient);

      const result = await service.deleteClient(1, adminUser);

      expect(result).toEqual(existingClient);
      expect(mockPrismaService.client.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw ForbiddenException if user is EMPLEAT', async () => {
      await expect(service.deleteClient(1, empleatUser)).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.client.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if client does not exist', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      await expect(service.deleteClient(99, adminUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if client belongs to another empresa', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue({ ...existingClient, empresaId: 99 });
      await expect(service.deleteClient(1, adminUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllByEmpresa', () => {
    const empresaId = 10;
    const mockClients = [
      { id: 1, nom: 'Anna', email: 'anna@test.com', telefon: '600111222', empresaId },
      { id: 2, nom: 'Bernat', email: 'bernat@test.com', telefon: '600333444', empresaId },
    ];

    it('should return clients when admin belongs to the company', async () => {
      mockPrismaService.client.findMany.mockResolvedValue(mockClients);

      const result = await service.findAllByEmpresa(empresaId, adminUser);

      expect(result).toEqual(mockClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: { empresaId },
        orderBy: { nom: 'asc' },
      });
    });

    it('should return clients for EMPLEAT user of the same empresa', async () => {
      mockPrismaService.client.findMany.mockResolvedValue(mockClients);

      const result = await service.findAllByEmpresa(empresaId, empleatUser);

      expect(result).toEqual(mockClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if admin belongs to a different company', async () => {
      const otherCompanyAdmin: CurrentUserData = { ...adminUser, empresaId: 99 };

      await expect(service.findAllByEmpresa(empresaId, otherCompanyAdmin))
        .rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.client.findMany).not.toHaveBeenCalled();
    });

    it('should return empty array when company has no clients', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([]);

      const result = await service.findAllByEmpresa(empresaId, adminUser);

      expect(result).toEqual([]);
    });
  });

  describe('findAllByEmpresaPaginat', () => {
    const empresaId = 10;
    const mockClientsRaw = [
      { id: 1, nom: 'Anna', email: 'anna@test.com', telefon: '600111222', empresaId, _count: { reserves: 5 } },
      { id: 2, nom: 'Bernat', email: 'bernat@test.com', telefon: '600333444', empresaId, _count: { reserves: 2 } },
    ];
    const mockClientsMapped = [
      { id: 1, nom: 'Anna', email: 'anna@test.com', telefon: '600111222', empresaId, visites: 5 },
      { id: 2, nom: 'Bernat', email: 'bernat@test.com', telefon: '600333444', empresaId, visites: 2 },
    ];

    it('should return paginated clients with metadata', async () => {
      mockPrismaService.client.findMany.mockResolvedValue(mockClientsRaw);
      mockPrismaService.client.count.mockResolvedValue(2);

      const result = await service.findAllByEmpresaPaginat(empresaId, adminUser, { page: 1, limit: 20 });

      expect(result).toEqual({ data: mockClientsMapped, total: 2, page: 1, limit: 20, totalPages: 1 });
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { empresaId },
          orderBy: { nom: 'asc' },
          skip: 0,
          take: 20,
        }),
      );
      expect(mockPrismaService.client.count).toHaveBeenCalledWith({ where: { empresaId } });
    });

    it('should calculate skip correctly for page 2', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([]);
      mockPrismaService.client.count.mockResolvedValue(45);

      const result = await service.findAllByEmpresaPaginat(empresaId, adminUser, { page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(5);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('should use default page=1 limit=20 when not provided', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([]);
      mockPrismaService.client.count.mockResolvedValue(0);

      const result = await service.findAllByEmpresaPaginat(empresaId, adminUser, {});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should return paginated clients for EMPLEAT user of the same empresa', async () => {
      mockPrismaService.client.findMany.mockResolvedValue(mockClientsRaw);
      mockPrismaService.client.count.mockResolvedValue(2);

      const result = await service.findAllByEmpresaPaginat(empresaId, empleatUser, { page: 1, limit: 20 });

      expect(result.data).toEqual(mockClientsMapped);
      expect(mockPrismaService.client.findMany).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if admin belongs to a different company', async () => {
      const otherCompanyAdmin: CurrentUserData = { ...adminUser, empresaId: 99 };

      await expect(service.findAllByEmpresaPaginat(empresaId, otherCompanyAdmin, { page: 1, limit: 20 }))
        .rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.client.findMany).not.toHaveBeenCalled();
    });

    it('should order by reserves count when orderBy is concurrencia', async () => {
      mockPrismaService.client.findMany.mockResolvedValue(mockClientsRaw);
      mockPrismaService.client.count.mockResolvedValue(2);

      await service.findAllByEmpresaPaginat(empresaId, adminUser, { page: 1, limit: 20, orderBy: 'concurrencia' });

      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { reserves: { _count: 'desc' } } }),
      );
    });

    it('should order by nom asc when orderBy is nom', async () => {
      mockPrismaService.client.findMany.mockResolvedValue(mockClientsRaw);
      mockPrismaService.client.count.mockResolvedValue(2);

      await service.findAllByEmpresaPaginat(empresaId, adminUser, { page: 1, limit: 20, orderBy: 'nom' });

      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { nom: 'asc' } }),
      );
    });
  });
});
