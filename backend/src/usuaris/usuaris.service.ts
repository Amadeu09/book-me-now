import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuariDto, UpdateUsuariDto } from './dto/usuari.dto';
import * as bcrypt from 'bcrypt';
import { Rol } from '@prisma/client';

@Injectable()
export class UsuarisService {
  private readonly logger = new Logger(UsuarisService.name);

  constructor(private prisma: PrismaService) { }

  async create(createUsuariDto: CreateUsuariDto, currentUserId: number) {
    // Check if email already exists
    const existing = await this.prisma.usuari.findUnique({
      where: { email: createUsuariDto.email },
    });

    const currentUsuari = await this.prisma.usuari.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUsuari) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (currentUsuari.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('No tens permís per crear usuaris');
    }

    if (existing) {
      throw new ConflictException('Aquest email ja està registrat');
    }

    // Hash password
    const hash = await bcrypt.hash(createUsuariDto.password, 10);

    const usuari = await this.prisma.usuari.create({
      data: {
        email: createUsuariDto.email,
        hash,
        rol: createUsuariDto.rol,
        empresaId: createUsuariDto.empresaId,
      },
      select: {
        id: true,
        email: true,
        rol: true,
        empresaId: true,
        createdAt: true,
      },
    });

    this.logger.log(`Usuari created: ${usuari.id} by user ${currentUserId}`);
    return usuari;
  }

  async findAll(empresaId: number, userRol: Rol) {
    // ADMIN_GENERAL can only see users from their empresa
    const where = userRol === 'ADMIN_GENERAL' ? { empresaId } : {};

    return this.prisma.usuari.findMany({
      where,
      select: {
        id: true,
        email: true,
        rol: true,
        empresaId: true,
        createdAt: true,
        empresa: {
          select: {
            nom: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, currentUserEmpresaId: number, userRol: Rol) {
    const usuari = await this.prisma.usuari.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        rol: true,
        empresaId: true,
        createdAt: true,
        empresa: {
          select: {
            nom: true,
            ubicacio: true,
          },
        },
      },
    });

    if (!usuari) {
      throw new NotFoundException('Usuari no trobat');
    }

    // ADMIN_GENERAL can only see users from their empresa
    if (userRol === 'ADMIN_GENERAL' && usuari.empresaId !== currentUserEmpresaId) {
      throw new ForbiddenException('No tens permís per veure aquest usuari');
    }

    return usuari;
  }

  async update(id: number, updateUsuariDto: UpdateUsuariDto, currentUserEmpresaId: number, userRol: Rol) {
    const usuari = await this.prisma.usuari.findUnique({
      where: { id },
    });

    if (!usuari) {
      throw new NotFoundException('Usuari no trobat');
    }

    // ADMIN_GENERAL can only update users from their empresa
    if (userRol === 'ADMIN_GENERAL' && usuari.empresaId !== currentUserEmpresaId) {
      throw new ForbiddenException('No tens permís per modificar aquest usuari');
    }

    const dataToUpdate: any = {};

    if (updateUsuariDto.email) {
      // Check if new email is already in use
      const existing = await this.prisma.usuari.findUnique({
        where: { email: updateUsuariDto.email },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Aquest email ja està en ús');
      }

      dataToUpdate.email = updateUsuariDto.email;
    }

    if (updateUsuariDto.password) {
      dataToUpdate.hash = await bcrypt.hash(updateUsuariDto.password, 10);
    }

    if (updateUsuariDto.rol) {
      dataToUpdate.rol = updateUsuariDto.rol;
    }

    const updated = await this.prisma.usuari.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        rol: true,
        empresaId: true,
        createdAt: true,
      },
    });

    this.logger.log(`Usuari updated: ${id}`);
    return updated;
  }

  async remove(id: number, currentUserEmpresaId: number, userRol: Rol) {
    const usuari = await this.prisma.usuari.findUnique({
      where: { id },
    });

    if (!usuari) {
      throw new NotFoundException('Usuari no trobat');
    }

    // ADMIN_GENERAL can only delete users from their empresa
    if (userRol === 'ADMIN_GENERAL' && usuari.empresaId !== currentUserEmpresaId) {
      throw new ForbiddenException('No tens permís per eliminar aquest usuari');
    }

    await this.prisma.usuari.delete({
      where: { id },
    });

    this.logger.log(`Usuari deleted: ${id}`);
    return { message: 'Usuari eliminat correctament' };
  }
}
