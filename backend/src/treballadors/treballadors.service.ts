import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJornadaTreballadorExistDto, CreateTreballadorDto, JornadaTreballadorDto } from './dto/CreateTreballadorDto';
import { AssignarServeisDto } from './dto/AssignarServeisDto';

@Injectable()
export class TreballadorsService {
  constructor(private prisma: PrismaService) { }

  async create(empresaId: number, dto: CreateTreballadorDto, userId: number) {

    const user = await this.prisma.usuari.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Usuari no autoritzat');
    }

    const userAfegir = await this.prisma.usuari.findUnique({
      where: { id: dto.idUsuari },
    });

    if (!userAfegir) {
      throw new NotFoundException('L\'usuari a assignar no existeix');
    }

    if (userAfegir.empresaId !== empresaId) {
      throw new ForbiddenException('No pots assignar un usuari d\'una altra empresa');
    }

    const treballador = await this.prisma.treballador.create({
      data: {
        empresaId: empresaId,
        idUsuari: dto.idUsuari,
        nom: dto.nom,
      },
    });

    if (dto.jornadaTreballador) {
      await this.prisma.treballadorJornadaPlantilla.create({
        data: {
          treballador: { connect: { id: treballador.id } },
          plantilla: { connect: { id: dto.jornadaTreballador.plantillaJornadaId } },
          dataInici: new Date(dto.jornadaTreballador.dataInici),
          dataFi: dto.jornadaTreballador.dataFi ? new Date(dto.jornadaTreballador.dataFi) : null,
        },
      });
    }

    return treballador;
  }


  async assignJornadaTreballador(empresaId: number, jornadaTreballadorDto: CreateJornadaTreballadorExistDto, currentUser: number) {

    const user = await this.prisma.usuari.findUnique({
      where: {
        id: currentUser,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Usuari no autoritzat');
    }

    const treballador = await this.prisma.treballador.findUnique({
      where: { id: jornadaTreballadorDto.treballadorId },
    });

    if (!treballador) {
      throw new NotFoundException('El treballador a assignar no existeix');
    }

    if (treballador.empresaId !== empresaId) {
      throw new ForbiddenException('No pots assignar un treballador d\'una altra empresa');
    }

    const plantilla = await this.prisma.jornadaPlantilla.findUnique({
      where: { id: jornadaTreballadorDto.plantillaJornadaId },
    });

    if (!plantilla) {
      throw new NotFoundException('La plantilla de jornada a assignar no existeix');
    }

    if (plantilla.empresaId !== empresaId) {
      throw new ForbiddenException('No pots assignar una plantilla de jornada d\'una altra empresa');
    }

    return await this.prisma.treballadorJornadaPlantilla.create({
      data: {
        treballador: { connect: { id: jornadaTreballadorDto.treballadorId } },
        plantilla: { connect: { id: jornadaTreballadorDto.plantillaJornadaId } },
        dataInici: new Date(jornadaTreballadorDto.dataInici),
        dataFi: jornadaTreballadorDto.dataFi ? new Date(jornadaTreballadorDto.dataFi) : null,
      },
    });



  }

  async assignarServeis(empresaId: number, dto: AssignarServeisDto, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUser },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Usuari no autoritzat');
    }

    const treballador = await this.prisma.treballador.findUnique({
      where: { id: dto.treballadorId },
    });

    if (!treballador) {
      throw new NotFoundException('El treballador no existeix');
    }

    if (treballador.empresaId !== empresaId) {
      throw new ForbiddenException('No pots assignar serveis a un treballador d\'una altra empresa');
    }

    // Verify all services exist and belong to the company
    const serveis = await this.prisma.servei.findMany({
      where: {
        id: { in: dto.serveisIds },
        empresaId: empresaId,
      },
    });

    if (serveis.length !== dto.serveisIds.length) {
      throw new NotFoundException('Un o més serveis no existeixen o no pertanyen a la teva empresa');
    }

    // Assign services (transaction to ensure atomicity)
    return await this.prisma.$transaction(async (tx) => {
      const assignments = [];
      for (const serveiId of dto.serveisIds) {
        // Check if assignment already exists to avoid duplicates
        const existingAssignment = await tx.treballadorServei.findUnique({
          where: {
            treballadorId_serveiId: {
              treballadorId: dto.treballadorId,
              serveiId: serveiId,
            },
          },
        });

        if (!existingAssignment) {
          const assignment = await tx.treballadorServei.create({
            data: {
              treballadorId: dto.treballadorId,
              serveiId: serveiId,
            },
          });
          assignments.push(assignment);
        }
      }
      return assignments;
    });
  }
}
