import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuariDto, UpdateUsuariDto } from './dto/usuari.dto';
import * as bcrypt from 'bcrypt';

/** Camps retornats a totes les consultes de usuari */
const USUARI_SELECT = {
  id: true,
  email: true,
  rol: true,
  empresaId: true,
  fotoPerfil: true,
  createdAt: true,
} as const;

@Injectable()
export class UsuarisService {
  private readonly logger = new Logger(UsuarisService.name);

  constructor(private prisma: PrismaService) { }

  async create(createUsuariDto: CreateUsuariDto, currentUserId: number) {
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

    const hash = await bcrypt.hash(createUsuariDto.password, 10);

    const usuari = await this.prisma.usuari.create({
      data: {
        email: createUsuariDto.email,
        hash,
        rol: createUsuariDto.rol,
        empresaId: createUsuariDto.empresaId,
      },
      select: USUARI_SELECT,
    });

    this.logger.log(`Usuari created: ${usuari.id} by user ${currentUserId}`);
    return usuari;
  }

  async findAll(empresaId: number) {
    return this.prisma.usuari.findMany({
      where: { empresaId },
      select: {
        ...USUARI_SELECT,
        empresa: {
          select: { nom: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, currentUserEmpresaId: number) {
    const usuari = await this.prisma.usuari.findUnique({
      where: { id },
      select: {
        ...USUARI_SELECT,
        empresa: {
          select: { nom: true, ubicacio: true },
        },
      },
    });

    if (!usuari) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (usuari.empresaId !== currentUserEmpresaId) {
      throw new ForbiddenException('No tens permís per veure aquest usuari');
    }

    return usuari;
  }

  async update(id: number, updateUsuariDto: UpdateUsuariDto, currentUserEmpresaId: number) {
    const usuari = await this.prisma.usuari.findUnique({ where: { id } });

    if (!usuari) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (usuari.empresaId !== currentUserEmpresaId) {
      throw new ForbiddenException('No tens permís per modificar aquest usuari');
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (updateUsuariDto.email) {
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


    const updated = await this.prisma.usuari.update({
      where: { id },
      data: dataToUpdate,
      select: USUARI_SELECT,
    });

    this.logger.log(`Usuari updated: ${id}`);
    return updated;
  }

  async remove(id: number, currentUserEmpresaId: number) {
    const usuari = await this.prisma.usuari.findUnique({ where: { id } });

    if (!usuari) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (usuari.empresaId !== currentUserEmpresaId) {
      throw new ForbiddenException('No tens permís per eliminar aquest usuari');
    }

    await this.prisma.usuari.delete({ where: { id } });

    this.logger.log(`Usuari deleted: ${id}`);
    return { message: 'Usuari eliminat correctament' };
  }

  async uploadFoto(id: number, file: Express.Multer.File, currentUserEmpresaId: number) {
    const usuari = await this.prisma.usuari.findUnique({ where: { id } });

    if (!usuari) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (usuari.empresaId !== currentUserEmpresaId) {
      throw new ForbiddenException('No tens permís per modificar aquest usuari');
    }

    if (!file?.buffer) {
      throw new BadRequestException("No s'ha rebut cap fitxer");
    }

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'usuaris',
          public_id: `usuari_${id}`,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(new InternalServerErrorException('Error al pujar la foto'));
          } else {
            resolve(result as { secure_url: string });
          }
        },
      );
      uploadStream.end(file.buffer);
    });

    const updated = await this.prisma.usuari.update({
      where: { id },
      data: { fotoPerfil: uploadResult.secure_url },
      select: USUARI_SELECT,
    });

    this.logger.log(`Foto actualizada usuari ${id}: ${uploadResult.secure_url}`);
    return updated;
  }
}
