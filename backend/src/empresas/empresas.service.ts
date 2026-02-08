import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/empresa.dto';

import { Rol } from '@prisma/client';

@Injectable()
export class EmpresasService {
  private readonly logger = new Logger(EmpresasService.name);

  constructor(private prisma: PrismaService) { }

  async create(createEmpresaDto: CreateEmpresaDto) {
    const empresa = await this.prisma.empresa.create({
      data: {
        nom: createEmpresaDto.nom,
        ubicacio: createEmpresaDto.ubicacio,
        capacitat: createEmpresaDto.capacitat ?? null,
        activa: createEmpresaDto.activa ?? true,
      },
      include: {
        _count: {
          select: {
            treballadors: true,
            serveis: true,
          },
        },
      },
    });

    this.logger.log(`Empresa created: ${empresa.id}`);
    return empresa;
  }



  async findAll() {
    return this.prisma.empresa.findMany({
      include: {
        _count: {
          select: {
            treballadors: true,
            serveis: true,
            usuaris: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userEmpresaId: number, userRol: Rol) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: {
        treballadors: {
          select: {
            id: true,
            nom: true,
          },
        },
        serveis: {
          select: {
            id: true,
            nom: true,
            preu: true,
            duradaMin: true,
          },
        },
        _count: {
          select: {
            usuaris: true,
          },
        },
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    // ADMIN_GENERAL can only see their own empresa
    if (userRol === 'ADMIN_GENERAL' && empresa.id !== userEmpresaId) {
      throw new ForbiddenException('No tens permís per veure aquesta empresa');
    }

    return empresa;
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto, userEmpresaId: number, userRol: Rol) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    // ADMIN_GENERAL can only update their own empresa
    if (userRol === 'ADMIN_GENERAL' && empresa.id !== userEmpresaId) {
      throw new ForbiddenException('No tens permís per modificar aquesta empresa');
    }

    const updated = await this.prisma.empresa.update({
      where: { id },
      data: updateEmpresaDto,
    });

    this.logger.log(`Empresa updated: ${id}`);
    return updated;
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              treballadors: true,
              usuaris: true,
              reserves: true,
            },
          },
        },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa no trobada');
      }

      // Soft delete: mark as inactive
      const updated = await tx.empresa.update({
        where: { id },
        data: { activa: false },
      });

      // Also deactivate all related treballadors and services
      await tx.treballador.updateMany({
        where: { empresaId: id },
        data: { actiu: false },
      });

      await tx.servei.updateMany({
        where: { empresaId: id },
        data: { actiu: false },
      });

      this.logger.log(`Empresa and related entities deactivated: ${id}`);
      return { message: 'Empresa desactivada correctament', empresa: updated };
    });
  }
}
