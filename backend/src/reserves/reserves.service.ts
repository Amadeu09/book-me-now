import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservaDto } from './dto/reserves.dto';
import { ReservaEstat } from '@prisma/client';

@Injectable()
export class ReservesService {
  constructor(private prisma: PrismaService) { }


  async create(dto: CreateReservaDto) {

    const servei = await this.prisma.servei.findUnique({
      where: { id: dto.idServei },
    });

    if (!servei) {
      throw new NotFoundException('Servei no trobat');
    }

  

    const treballador = await this.prisma.treballador.findUnique({
      where: { id: dto.idTreballador },
    });

    if (!treballador) {
      throw new NotFoundException('Treballador no trobat');
    }


    const dataHoraInici = new Date(`${dto.data}T${dto.hora}`);
    //calcular data hora final
    const dataHoraFinal = new Date(dataHoraInici.getTime() + servei.duradaMin * 60 * 1000);

    //comprovar si hi ha una reserva solapada amb el mateix treballador
    const dayStart = new Date(dataHoraInici);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dataHoraInici);
    dayEnd.setHours(23, 59, 59, 999);

    const reserves = await this.prisma.reserva.findMany({
      where: {
        treballadorId: dto.idTreballador,
        dataHora: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        servei: {
          select: { duradaMin: true },
        },
      },
    });

    const hasOverlap = reserves.some((reserva) => {
      const reservaInici = reserva.dataHora;
      const reservaFi = new Date(reservaInici.getTime() + reserva.servei.duradaMin * 60 * 1000);
      return reservaInici < dataHoraFinal && reservaFi > dataHoraInici;
    });

    if (hasOverlap) {
      throw new ForbiddenException('Ja hi ha una reserva solapada');
    }

    let client = await this.prisma.client.findFirst({
      where: { email: dto.email },
    });

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          nom: dto.nom,
          email: dto.email,
          telefon: dto.telefon,
          empresaId: treballador.empresaId,
        },
      });
    }

    return this.prisma.reserva.create({
      data: {
        treballadorId: dto.idTreballador,
        dataHora: dataHoraInici,
        empresaId: treballador.empresaId,
        serveiId: dto.idServei,
        clientId: client.id,
        clientEmail: dto.email,
        clientNom: dto.nom,
        observacions: dto.observacions,
        estat: 'PENDENT',
      },
    });

  }

  async delete(idReserva: number) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: idReserva },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no trobada');
    }

    return this.prisma.reserva.delete({
      where: { id: idReserva },
    });
  }

   async update(idReserva: number, dto: CreateReservaDto) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: idReserva },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no trobada');
    }

    const servei = await this.prisma.servei.findUnique({
      where: { id: dto.idServei },
    });

    if (!servei) {
      throw new NotFoundException('Servei no trobat');
    }

    const treballador = await this.prisma.treballador.findUnique({
      where: { id: dto.idTreballador },
    });

    if (!treballador) {
      throw new NotFoundException('Treballador no trobat');
    }

    const dataHoraInici = new Date(`${dto.data}T${dto.hora}`);
    const dataHoraFinal = new Date(dataHoraInici.getTime() + servei.duradaMin * 60 * 1000);

    const dayStart = new Date(dataHoraInici);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dataHoraInici);
    dayEnd.setHours(23, 59, 59, 999);

    const reserves = await this.prisma.reserva.findMany({
      where: {
        id: { not: idReserva },
        treballadorId: dto.idTreballador,
        dataHora: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        servei: {
          select: { duradaMin: true },
        },
      },
    });

    const hasOverlap = reserves.some((reservaDia) => {
      const reservaInici = reservaDia.dataHora;
      const reservaFi = new Date(reservaInici.getTime() + reservaDia.servei.duradaMin * 60 * 1000);
      return reservaInici < dataHoraFinal && reservaFi > dataHoraInici;
    });

    if (hasOverlap) {
      throw new ForbiddenException('Ja hi ha una reserva solapada');
    }

    let client = await this.prisma.client.findFirst({
      where: { email: dto.email, empresaId: treballador.empresaId },
    });

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          nom: dto.nom,
          email: dto.email,
          telefon: dto.telefon,
          empresaId: treballador.empresaId,
        },
      });
    }

    return this.prisma.reserva.update({
      where: { id: idReserva },
      data: {
        treballadorId: dto.idTreballador,
        dataHora: dataHoraInici,
        empresaId: treballador.empresaId,
        serveiId: dto.idServei,
        clientId: client.id,
        clientEmail: dto.email,
        clientNom: dto.nom,
        observacions: dto.observacions,
      },
    });
  }



  async updateEstado(idReserva: number, nouEstat: ReservaEstat) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: idReserva },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no trobada');
    }

    

    return this.prisma.reserva.update({
      where: { id: idReserva },
      data: { estat: nouEstat },
    });
  }
}
