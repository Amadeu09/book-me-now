import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ReservaEstat } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { ClientsPaginatsQueryDto, CreateClientDto, UpdateClientDto } from './dto/clients.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) { }

  async findAllByEmpresa(empresaId: number, user: CurrentUserData) {
    if (user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots accedir als clients d\'una altra empresa');
    }

    return this.prisma.client.findMany({
      where: { empresaId },
      orderBy: { nom: 'asc' },
    });
  }

  async createClient(dto: CreateClientDto, user: CurrentUserData) {
    if (user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Només els administradors poden crear clients');
    }

    try {
      return await this.prisma.client.create({
        data: {
          nom: dto.nom.trim(),
          email: dto.email?.trim() || null,
          telefon: dto.telefon?.trim() || null,
          empresaId: user.empresaId,
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ja existeix un client amb aquest email en aquesta empresa');
      }
      throw err;
    }
  }

  async updateClient(id: number, dto: UpdateClientDto, user: CurrentUserData) {
    if (user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Només els administradors poden editar clients');
    }

    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client no trobat');
    if (client.empresaId !== user.empresaId) {
      throw new ForbiddenException('No pots editar clients d\'una altra empresa');
    }

    try {
      return await this.prisma.client.update({
        where: { id },
        data: {
          ...(dto.nom !== undefined && { nom: dto.nom.trim() }),
          ...(dto.email !== undefined && { email: dto.email?.trim() || null }),
          ...(dto.telefon !== undefined && { telefon: dto.telefon?.trim() || null }),
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ja existeix un client amb aquest email en aquesta empresa');
      }
      throw err;
    }
  }

  async deleteClient(id: number, user: CurrentUserData) {
    if (user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Només els administradors poden eliminar clients');
    }

    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client no trobat');
    if (client.empresaId !== user.empresaId) {
      throw new ForbiddenException('No pots eliminar clients d\'una altra empresa');
    }

    return this.prisma.client.delete({ where: { id } });
  }

  async findAllByEmpresaPaginat(
    empresaId: number,
    user: CurrentUserData,
    query: ClientsPaginatsQueryDto,
  ) {
    if (user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots accedir als clients d\'una altra empresa');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const orderBy = query.orderBy === 'concurrencia'
      ? { reserves: { _count: 'desc' as const } }
      : { nom: 'asc' as const };

    const [rawData, total] = await Promise.all([
      this.prisma.client.findMany({
        where: { empresaId },
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              reserves: { where: { estat: ReservaEstat.CONFIRMADA } },
            },
          },
        },
      }),
      this.prisma.client.count({ where: { empresaId } }),
    ]);

    const data = rawData.map(({ _count, ...c }) => ({
      ...c,
      visites: _count.reserves,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
