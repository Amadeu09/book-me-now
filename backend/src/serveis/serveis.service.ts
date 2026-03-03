import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServeiDto, UpdateServeiDto } from './dto/servei.dto';

@Injectable()
export class ServeisService {
  constructor(private prisma: PrismaService) { }

  async create(empresaId: number, dto: CreateServeiDto) {
    return this.prisma.servei.create({
      data: {
        nom: dto.nom,
        duradaMin: dto.duradaMin,
        preu: dto.preu,
        actiu: dto.actiu ?? true,
        empresaId,
      },
    });
  }

  async findAll(empresaId: number, page = 1, pageSize = 4) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.servei.findMany({
        where: { empresaId },
        include: {
          treballadors: {
            include: {
              treballador: {
                select: {
                  id: true,
                  nom: true,
                },
              },
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.servei.count({ where: { empresaId } }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(empresaId: number, id: number) {
    const servei = await this.prisma.servei.findUnique({
      where: { id },
      include: {
        treballadors: {
          include: {
            treballador: true,
          },
        },
      },
    });

    if (!servei) throw new NotFoundException('Servei no trobat');
    if (servei.empresaId !== empresaId) throw new ForbiddenException('No autoritzat');
    return servei;
  }

  async update(empresaId: number, id: number, dto: UpdateServeiDto) {
    const existing = await this.prisma.servei.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Servei no trobat');
    if (existing.empresaId !== empresaId) throw new ForbiddenException('No autoritzat');

    return this.prisma.servei.update({
      where: { id },
      data: {
        nom: dto.nom ?? existing.nom,
        duradaMin: dto.duradaMin ?? existing.duradaMin,
        preu: dto.preu ?? existing.preu,
        actiu: dto.actiu ?? existing.actiu,
      },
    });
  }

  async remove(empresaId: number, id: number) {
    const existing = await this.prisma.servei.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Servei no trobat');
    if (existing.empresaId !== empresaId) throw new ForbiddenException('No autoritzat');

    return this.prisma.servei.delete({
      where: { id },
    });
  }

  async findByTreballador(empresaId: number, treballadorId: number) {
    const treballador = await this.prisma.treballador.findUnique({
      where: { id: treballadorId },
    });

    if (!treballador) {
      throw new NotFoundException('Treballador no trobat');
    }

    if (treballador.empresaId !== empresaId) {
      throw new ForbiddenException('No pots accedir als serveis d\'un treballador d\'una altra empresa');
    }

    const serveisAssignats = await this.prisma.treballadorServei.findMany({
      where: { treballadorId },
      include: {
        servei: true,
      },
    });

    return serveisAssignats.map((assignacio) => assignacio.servei);
  }
}
