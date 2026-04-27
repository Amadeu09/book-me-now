import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { Rol } from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

const mockPrismaService = {
  client: {
    findMany: jest.fn(),
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

    it('should throw ForbiddenException if user is EMPLEAT', async () => {
      await expect(service.findAllByEmpresa(empresaId, empleatUser))
        .rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.client.findMany).not.toHaveBeenCalled();
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
});
