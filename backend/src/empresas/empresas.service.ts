import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
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
    });

    return empresa;
  }

  async findAll() {
    return this.prisma.empresa.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userEmpresaId: number, userRol: Rol) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    if (userRol === 'ADMIN_GENERAL' && empresa.id !== userEmpresaId) {
      throw new ForbiddenException(
        'No tens permís per veure aquesta empresa',
      );
    }

    return empresa;
  }

  async update(
    id: number,
    updateEmpresaDto: UpdateEmpresaDto,
    userEmpresaId: number,
    userRol: Rol,
  ) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    if (userRol === 'ADMIN_GENERAL' && empresa.id !== userEmpresaId) {
      throw new ForbiddenException(
        'No tens permís per modificar aquesta empresa',
      );
    }

    return this.prisma.empresa.update({
      where: { id },
      data: updateEmpresaDto,
    });
  }

  async remove(id: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
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
    userRol: Rol,
  ) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    if (userRol === 'ADMIN_GENERAL' && empresa.id !== userEmpresaId) {
      throw new ForbiddenException(
        'No tens permís per modificar aquesta empresa',
      );
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
}