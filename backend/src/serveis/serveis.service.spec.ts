import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ServeisService } from './serveis.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServeiDto, UpdateServeiDto } from './dto/servei.dto';

describe('ServeisService', () => {
  let service: ServeisService;
  // Usamos any para poder mockear con jest.fn() sin pelear con las firmas generadas de Prisma
  let prisma: any;

  const mockPrisma: any = {
    servei: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServeisService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ServeisService>(ServeisService);
    prisma = module.get(PrismaService) as any;
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crea un servei para la empresa actual', async () => {
      const dto: CreateServeiDto = {
        nom: 'Corte',
        duradaMin: 30,
        preu: 25,
        actiu: true,
      };
      const created = { id: 1, empresaId: 10, ...dto };
      prisma.servei.create.mockResolvedValue(created as any);

      const res = await service.create(10, dto);

      expect(res).toEqual(created);
      expect(prisma.servei.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ nom: 'Corte', empresaId: 10 }),
      });
    });
  });

  describe('findAll paginado', () => {
    it('devuelve data y meta con pageSize 4', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      prisma.$transaction.mockResolvedValue([data, 2] as any);

      const res = await service.findAll(5, 2, 4);

      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Array));
      expect(res.data).toEqual(data);
      expect(res.meta).toEqual({ page: 2, pageSize: 4, total: 2, pageCount: 1 });
    });
  });

  describe('findOne', () => {
    it('retorna el servei si pertenece a la empresa', async () => {
      const svc = { id: 1, empresaId: 7 };
      prisma.servei.findUnique.mockResolvedValue(svc as any);

      const res = await service.findOne(7, 1);
      expect(res).toEqual(svc);
    });

    it('lanza NotFound si no existe', async () => {
      prisma.servei.findUnique.mockResolvedValue(null);
      await expect(service.findOne(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('lanza Forbidden si es de otra empresa', async () => {
      prisma.servei.findUnique.mockResolvedValue({ id: 1, empresaId: 2 } as any);
      await expect(service.findOne(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('actualiza campos permitidos', async () => {
      const existing = { id: 3, empresaId: 9, nom: 'Old', duradaMin: 30, preu: 20, actiu: true };
      const dto: UpdateServeiDto = { nom: 'Nuevo', preu: 30 };
      prisma.servei.findUnique.mockResolvedValue(existing as any);
      prisma.servei.update.mockResolvedValue({ ...existing, ...dto } as any);

      const res = await service.update(9, 3, dto);
      expect(res.nom).toBe('Nuevo');
      expect(res.preu).toBe(30);
    });
  });

  describe('remove', () => {
    it('elimina el servei (hard delete)', async () => {
      const existing = { id: 4, empresaId: 8, actiu: true };
      prisma.servei.findUnique.mockResolvedValue(existing as any);
      prisma.servei.delete.mockResolvedValue(existing as any);

      const res = await service.remove(8, 4);
      expect(res).toEqual(existing);
      expect(prisma.servei.delete).toHaveBeenCalledWith({
        where: { id: 4 },
      });
    });
  });

  describe('findByTreballador', () => {
    it('retorna serveis assignats al treballador', async () => {
      const empresaId = 1;
      const treballadorId = 100;
      const servei = { id: 1, nom: 'Corte', empresaId };

      mockPrisma.treballador = { findUnique: jest.fn() };
      mockPrisma.treballadorServei = { findMany: jest.fn() };

      mockPrisma.treballador.findUnique.mockResolvedValue({ id: treballadorId, empresaId });
      mockPrisma.treballadorServei.findMany.mockResolvedValue([{ servei }]);

      const res = await service.findByTreballador(empresaId, treballadorId);

      expect(res).toEqual([servei]);
      expect(mockPrisma.treballador.findUnique).toHaveBeenCalledWith({ where: { id: treballadorId } });
    });

    it('lanza NotFoundException si el trabajador no existe', async () => {
      mockPrisma.treballador.findUnique.mockResolvedValue(null);
      await expect(service.findByTreballador(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('lanza ForbiddenException si el trabajador es de otra empresa', async () => {
      mockPrisma.treballador.findUnique.mockResolvedValue({ id: 100, empresaId: 2 });
      await expect(service.findByTreballador(1, 100)).rejects.toThrow(ForbiddenException);
    });
  });
});
