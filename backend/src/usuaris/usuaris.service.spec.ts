import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsuarisService } from './usuaris.service';
import { PrismaService } from '../prisma/prisma.service';
import { Rol } from '@prisma/client';

describe('UsuarisService', () => {
  let service: UsuarisService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    usuari: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarisService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsuarisService>(UsuarisService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un nuevo usuario', async () => {
      const createDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        nom: 'Test User',
        rol: 'TREBALLADOR' as Rol,
        empresaId: 1,
      };

      const mockUser = {
        id: 1,
        email: createDto.email,
        rol: createDto.rol,
        empresaId: createDto.empresaId,
        createdAt: new Date(),
      };

      mockPrismaService.usuari.findUnique.mockResolvedValue(null); // Email no existe
      mockPrismaService.usuari.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto, 1);

      expect(result).toEqual(mockUser);
      expect(prismaService.usuari.create).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      const createDto = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        nom: 'Existing User',
        rol: 'TREBALLADOR' as Rol,
        empresaId: 1,
      };

      mockPrismaService.usuari.findUnique.mockResolvedValue({ id: 1, email: createDto.email });

      await expect(service.create(createDto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debería devolver todos los usuarios para ADMIN_GENERAL de su empresa', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com', rol: 'TREBALLADOR', empresaId: 1 },
        { id: 2, email: 'user2@example.com', rol: 'TREBALLADOR', empresaId: 1 },
      ];

      mockPrismaService.usuari.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll(1, 'ADMIN_GENERAL');

      expect(result).toEqual(mockUsers);
      expect(prismaService.usuari.findMany).toHaveBeenCalledWith({
        where: { empresaId: 1 },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('debería devolver un usuario por ID', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        rol: 'TREBALLADOR' as Rol,
        empresaId: 1,
        createdAt: new Date(),
        empresa: { nom: 'Test Company', ubicacio: 'Barcelona' },
      };

      mockPrismaService.usuari.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1, 1, 'ADMIN_GENERAL');

      expect(result).toEqual(mockUser);
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockPrismaService.usuari.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, 1, 'ADMIN_GENERAL')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario', async () => {
      const updateDto = {
        email: 'updated@example.com',
      };

      const existingUser = {
        id: 1,
        email: 'old@example.com',
        empresaId: 1,
      };

      const updatedUser = {
        id: 1,
        email: updateDto.email,
        rol: 'TREBALLADOR' as Rol,
        empresaId: 1,
        createdAt: new Date(),
      };

      mockPrismaService.usuari.findUnique
        .mockResolvedValueOnce(existingUser) // Primera llamada: verificar existencia
        .mockResolvedValueOnce(null); // Segunda llamada: verificar email único

      mockPrismaService.usuari.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateDto, 1, 'ADMIN_GENERAL');

      expect(result.email).toBe(updateDto.email);
      expect(prismaService.usuari.update).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockPrismaService.usuari.findUnique.mockResolvedValue(null);

      await expect(service.update(999, {}, 1, 'ADMIN_GENERAL')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar un usuario', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        empresaId: 1,
      };

      mockPrismaService.usuari.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.usuari.delete.mockResolvedValue(mockUser);

      const result = await service.remove(1, 1, 'ADMIN_GENERAL');

      expect(result).toHaveProperty('message');
      expect(prismaService.usuari.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockPrismaService.usuari.findUnique.mockResolvedValue(null);

      await expect(service.remove(999, 1, 'ADMIN_GENERAL')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
