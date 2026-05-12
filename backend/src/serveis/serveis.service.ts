import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
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
        descripcio: dto.descripcio ?? null,
        categoria: dto.categoria ?? 'ALTRES',
        empresaId,
      },
    });
  }

  async findAll(empresaId: number, page = 1, pageSize = 4) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.servei.findMany({
        where: { empresaId, actiu: true },
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
      this.prisma.servei.count({ where: { empresaId, actiu: true } }),
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
        descripcio: dto.descripcio !== undefined ? dto.descripcio : existing.descripcio,
        categoria: dto.categoria !== undefined ? dto.categoria : existing.categoria,
      },
    });
  }

  async remove(empresaId: number, id: number) {
    const existing = await this.prisma.servei.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Servei no trobat');
    if (existing.empresaId !== empresaId) throw new ForbiddenException('No autoritzat');

    return this.prisma.servei.update({
      where: { id },
      data: { actiu: false },
    });
  }

  async uploadFoto(id: number, file: Express.Multer.File, userEmpresaId: number) {
    const servei = await this.prisma.servei.findUnique({ where: { id } });

    if (!servei) throw new NotFoundException('Servei no trobat');
    if (servei.empresaId !== userEmpresaId) throw new ForbiddenException('No tens permís per modificar aquest servei');
    if (!file || !file.buffer) throw new BadRequestException("No s'ha rebut cap fitxer");

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'serveis',
          public_id: `servei_${id}`,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(new InternalServerErrorException('Error al pujar la foto'));
          else resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });

    return this.prisma.servei.update({
      where: { id },
      data: { fotoUrl: uploadResult.secure_url },
    });
  }

  async findAllPublic(empresaId: number) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) throw new NotFoundException('Empresa no trobada');

    return this.prisma.servei.findMany({
      where: { empresaId, actiu: true },
      select: {
        id: true,
        nom: true,
        descripcio: true,
        duradaMin: true,
        preu: true,
        fotoUrl: true,
        categoria: true,
        treballadors: {
          select: {
            treballador: {
              select: {
                id: true,
                nom: true,
                Usuari: {
                  select: {
                    fotoPerfil: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { nom: 'asc' },
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
