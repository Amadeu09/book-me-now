import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmpresasService', () => {
  let service: EmpresasService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    empresa: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    treballador: {
      updateMany: jest.fn(),
    },
    servei: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresasService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmpresasService>(EmpresasService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una nueva empresa', async () => {
      const createDto = {
        nom: 'Nueva Empresa',
        ubicacio: 'Barcelona, España',
        capacitat: 30,
        activa: true,
      };

      const mockEmpresa = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
      };

      mockPrismaService.empresa.create.mockResolvedValue(mockEmpresa);

      const result = await service.create(createDto);

      expect(result).toEqual(mockEmpresa);
    });
  });

  describe('findAll', () => {
    it('debería devolver las empresas del usuario autenticado', async () => {
      const mockEmpresas = [
        { id: 1, nom: 'Empresa 1', ubicacio: 'Barcelona' },
      ];

      mockPrismaService.empresa.findMany.mockResolvedValue(mockEmpresas);

      const result = await service.findAll(1);

      expect(result).toEqual(mockEmpresas);
      expect(prismaService.empresa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });
  });

  describe('findOne', () => {
    it('debería devolver una empresa del mismo tenant', async () => {
      const mockEmpresa = { id: 1, nom: 'Test Company', ubicacio: 'Barcelona', activa: true };

      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockEmpresa);
    });

    it('debería lanzar ForbiddenException si la empresa es de otro tenant', async () => {
      const mockEmpresa = { id: 2, nom: 'Other Company', ubicacio: 'Madrid', activa: true };

      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);

      await expect(service.findOne(2, 1)).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar NotFoundException si la empresa no existe', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar una empresa del mismo tenant', async () => {
      const updateDto = { nom: 'Nombre Actualizado', capacitat: 50 };
      const existingEmpresa = { id: 1, nom: 'Nombre Original', ubicacio: 'Barcelona', empresaId: 1 };
      const updatedEmpresa = { ...existingEmpresa, ...updateDto };

      mockPrismaService.empresa.findUnique.mockResolvedValue(existingEmpresa);
      mockPrismaService.empresa.update.mockResolvedValue(updatedEmpresa);

      const result = await service.update(1, updateDto, 1);

      expect(result.nom).toBe(updateDto.nom);
    });

    it('debería lanzar ForbiddenException si la empresa es de otro tenant', async () => {
      const existingEmpresa = { id: 2, nom: 'Other', ubicacio: 'Madrid', empresaId: 2 };
      mockPrismaService.empresa.findUnique.mockResolvedValue(existingEmpresa);

      await expect(service.update(2, { nom: 'Hack' }, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('debería desactivar una empresa del mismo tenant', async () => {
      const mockEmpresa = { id: 1, nom: 'Test Company', ubicacio: 'Barcelona', activa: true };
      const updatedEmpresa = { ...mockEmpresa, activa: false };

      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);
      mockPrismaService.empresa.update.mockResolvedValue(updatedEmpresa);

      const result = await service.remove(1, 1);

      expect(result.activa).toBe(false);
    });

    it('debería lanzar ForbiddenException si la empresa es de otro tenant', async () => {
      const mockEmpresa = { id: 2, nom: 'Other', ubicacio: 'Madrid', activa: true };
      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);

      await expect(service.remove(2, 1)).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar NotFoundException si la empresa no existe', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
