import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
        _count: {
          treballadors: 0,
          serveis: 0,
        },
      };

      mockPrismaService.empresa.create.mockResolvedValue(mockEmpresa);

      const result = await service.create(createDto);

      expect(result).toEqual(mockEmpresa);
      expect(prismaService.empresa.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nom: createDto.nom,
          ubicacio: createDto.ubicacio,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('debería devolver todas las empresas', async () => {
      const mockEmpresas = [
        {
          id: 1,
          nom: 'Empresa 1',
          ubicacio: 'Barcelona',
          _count: { treballadors: 5, serveis: 10, usuaris: 2 },
        },
        {
          id: 2,
          nom: 'Empresa 2',
          ubicacio: 'Madrid',
          _count: { treballadors: 3, serveis: 8, usuaris: 1 },
        },
      ];

      mockPrismaService.empresa.findMany.mockResolvedValue(mockEmpresas);

      const result = await service.findAll();

      expect(result).toEqual(mockEmpresas);
      expect(prismaService.empresa.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería devolver una empresa por ID', async () => {
      const mockEmpresa = {
        id: 1,
        nom: 'Test Company',
        ubicacio: 'Barcelona',
        capacitat: 20,
        activa: true,
        createdAt: new Date(),
        treballadors: [],
        serveis: [],
        _count: { usuaris: 2 },
      };

      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);

      const result = await service.findOne(1, 1, 'ADMIN_GENERAL');

      expect(result).toEqual(mockEmpresa);
    });

    it('debería lanzar NotFoundException si la empresa no existe', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, 1, 'ADMIN_GENERAL')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('debería actualizar una empresa', async () => {
      const updateDto = {
        nom: 'Nombre Actualizado',
        capacitat: 50,
      };

      const existingEmpresa = {
        id: 1,
        nom: 'Nombre Original',
        ubicacio: 'Barcelona',
        empresaId: 1,
      };

      const updatedEmpresa = {
        ...existingEmpresa,
        ...updateDto,
      };

      mockPrismaService.empresa.findUnique.mockResolvedValue(existingEmpresa);
      mockPrismaService.empresa.update.mockResolvedValue(updatedEmpresa);

      const result = await service.update(1, updateDto, 1, 'ADMIN_GENERAL');

      expect(result.nom).toBe(updateDto.nom);
      expect(result.capacitat).toBe(updateDto.capacitat);
    });
  });

  describe('remove', () => {
    it('debería desactivar una empresa y sus entidades relacionadas', async () => {
      const mockEmpresa = {
        id: 1,
        nom: 'Test Company',
        ubicacio: 'Barcelona',
        activa: true,
        _count: {
          treballadors: 5,
          usuaris: 2,
          reserves: 10,
        },
      };

      const updatedEmpresa = {
        ...mockEmpresa,
        activa: false,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          empresa: {
            findUnique: jest.fn().mockResolvedValue(mockEmpresa),
            update: jest.fn().mockResolvedValue(updatedEmpresa),
          },
          treballador: {
            updateMany: jest.fn().mockResolvedValue({ count: 5 }),
          },
          servei: {
            updateMany: jest.fn().mockResolvedValue({ count: 10 }),
          },
        };
        return callback(tx);
      });

      const result = await service.remove(1);

      expect(result).toHaveProperty('message');
      expect(result.empresa.activa).toBe(false);
    });

    it('debería lanzar NotFoundException si la empresa no existe', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          empresa: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(tx);
      });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
