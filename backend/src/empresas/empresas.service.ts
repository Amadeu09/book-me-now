import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { BusinessType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/empresa.dto';

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
        ...(createEmpresaDto.diasAntesReserva ? { diasAntesReserva: createEmpresaDto.diasAntesReserva } : {}),
      },
    });

    return empresa;
  }

  async searchPublic(query: string) {
    const sanitized = query.trim().slice(0, 100);
    return this.prisma.empresa.findMany({
      where: {
        activa: true,
        nom: {
          contains: sanitized,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        nom: true,
        ubicacio: true,
        fotoPerfil: true,
        bannerUrl: true,
        descripcio: true,
        tipo: true,
      },
      take: 10,
      orderBy: { nom: 'asc' },
    });
  }

  async findOnePublic(id: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id, activa: true },
      select: {
        id: true,
        nom: true,
        ubicacio: true,
        fotoPerfil: true,
        bannerUrl: true,
        descripcio: true,
        tipo: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    return empresa;
  }

  async findAll(userEmpresaId: number) {
    return this.prisma.empresa.findMany({
      where: { id: userEmpresaId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPublic(tipo: string | null, page: number, limit: number) {
    const where: Prisma.EmpresaWhereInput = {
      activa: true,
      ...(tipo ? { tipo: tipo as BusinessType } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.empresa.findMany({
        where,
        select: {
          id: true,
          nom: true,
          ubicacio: true,
          fotoPerfil: true,
          bannerUrl: true,
          descripcio: true,
            tipo: true,
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.empresa.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: number, userEmpresaId: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    if (empresa.id !== userEmpresaId) {
      throw new ForbiddenException('No tens permís per veure aquesta empresa');
    }

    return empresa;
  }

  async update(
    id: number,
    updateEmpresaDto: UpdateEmpresaDto,
    userEmpresaId: number,
  ) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    if (empresa.id !== userEmpresaId) {
      throw new ForbiddenException('No tens permís per modificar aquesta empresa');
    }

    return this.prisma.empresa.update({
      where: { id },
      data: updateEmpresaDto,
    });
  }

  async remove(id: number, userEmpresaId: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    if (empresa.id !== userEmpresaId) {
      throw new ForbiddenException('No tens permís per desactivar aquesta empresa');
    }

    return this.prisma.empresa.update({
      where: { id },
      data: { activa: false },
    });
  }

  // ✅ FIX PRINCIPAL AQUÍ
  async uploadFoto(
    id: number,
    file: Express.Multer.File,
    userEmpresaId: number,
  ) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    if (empresa.id !== userEmpresaId) {
      throw new ForbiddenException('No tens permís per modificar aquesta empresa');
    }

    if (!file || !file.buffer) {
      throw new BadRequestException("No s'ha rebut cap fitxer");
    }

    // ✅ Subida a Cloudinary usando buffer
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'empresas',
          public_id: `empresa_${id}`,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(
              new InternalServerErrorException(
                'Error al pujar la foto',
              ),
            );
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(file.buffer);
    });

    const updated = await this.prisma.empresa.update({
      where: { id },
      data: {
        fotoPerfil: uploadResult.secure_url,
      },
    });

    this.logger.log(
      `Foto actualizada empresa ${id}: ${uploadResult.secure_url}`,
    );

    return updated;
  }

  async uploadBanner(
    id: number,
    file: Express.Multer.File,
    userEmpresaId: number,
  ) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });

    if (!empresa) throw new NotFoundException('Empresa no trobada');
    if (empresa.id !== userEmpresaId) throw new ForbiddenException('No tens permís per modificar aquesta empresa');
    if (!file || !file.buffer) throw new BadRequestException("No s'ha rebut cap fitxer");

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'empresas/banners',
          public_id: `banner_empresa_${id}`,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(new InternalServerErrorException('Error al pujar el banner'));
          else resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });

    const updated = await this.prisma.empresa.update({
      where: { id },
      data: { bannerUrl: uploadResult.secure_url },
    });

    this.logger.log(`Banner actualitzat empresa ${id}: ${uploadResult.secure_url}`);
    return updated;
  }
}