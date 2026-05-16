import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservaDto, ModificarReservaGestioDto } from './dto/reserves.dto';
import { ReservaEstat } from '@prisma/client';
import { Resend } from 'resend';

const EMAIL_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: true,
  removeOnFail: false,
};

@Injectable()
export class ReservesService {
  private readonly resend: Resend;
  private readonly emailFrom: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @InjectQueue('emails') private emailQueue: Queue,
  ) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.emailFrom = this.config.get<string>('EMAIL_FROM');
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getUTCDay();
    const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
    date.setUTCDate(diff);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  private async checkSlotAvailable(
    treballadorId: number,
    empresaId: number,
    serveiDuradaMin: number,
    dataHoraInici: Date,
  ): Promise<void> {
    const dayStart = new Date(dataHoraInici); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dataHoraInici); dayEnd.setHours(23, 59, 59, 999);

    const empresaAbsence = await this.prisma.absenciaEmpresa.findFirst({
      where: { empresaId, inici: { lte: dayEnd }, fi: { gte: dayStart } },
    });
    if (empresaAbsence) throw new ConflictException('No hi ha disponibilitat per a aquest horari');

    const workerAbsence = await this.prisma.absencia.findFirst({
      where: { treballadorId, estat: 'APROVADA', inici: { lte: dayEnd }, fi: { gte: dayStart } },
    });
    if (workerAbsence) throw new ConflictException('No hi ha disponibilitat per a aquest horari');

    const treballadorAmbPlantilla = await this.prisma.treballador.findUnique({
      where: { id: treballadorId },
      include: {
        plantilla: { include: { rotacions: { include: { dies: { include: { trams: true } } } } } },
      },
    });

    const plantilla = treballadorAmbPlantilla?.plantilla;
    if (!plantilla || !plantilla.rotacions?.length) {
      throw new ConflictException('No hi ha disponibilitat per a aquest horari');
    }

    let dow = dataHoraInici.getDay();
    if (dow === 0) dow = 7;

    const rotacionsOrdenades = [...plantilla.rotacions].sort((a, b) => a.index - b.index);
    const rotacio = rotacionsOrdenades[0];

    if (!rotacio) throw new ConflictException('No hi ha disponibilitat per a aquest horari');

    const diaRotacio = rotacio.dies?.find(d => d.dow === dow);
    if (!diaRotacio || diaRotacio.esDescans || !diaRotacio.trams?.length) {
      throw new ConflictException('No hi ha disponibilitat per a aquest horari');
    }

    const slotStartMin = dataHoraInici.getHours() * 60 + dataHoraInici.getMinutes();
    const slotEndMin = slotStartMin + serveiDuradaMin;

    const withinTram = diaRotacio.trams.some(t => slotStartMin >= t.iniciMin && slotEndMin <= t.fiMin);
    if (!withinTram) throw new ConflictException('No hi ha disponibilitat per a aquest horari');
  }

  private async safeEnviarEmail(fn: () => Promise<void>, context: string): Promise<void> {
    try {
      await fn();
    } catch (err) {
      console.error(`[ReservesService] Error enviant email (${context}):`, err);
    }
  }

  private async createReservaInternal(
    dto: CreateReservaDto,
    options: { checkActiu: boolean; filterCancellades: boolean },
  ): Promise<any> {
    const servei = await this.prisma.servei.findUnique({ where: { id: dto.idServei } });
    if (!servei || (options.checkActiu && !servei.actiu)) throw new NotFoundException('Servei no trobat');

    const treballador = await this.prisma.treballador.findUnique({ where: { id: dto.idTreballador } });
    if (!treballador || (options.checkActiu && !treballador.actiu)) throw new NotFoundException('Treballador no trobat');

    const treballadorServei = await this.prisma.treballadorServei.findUnique({
      where: { treballadorId_serveiId: { treballadorId: dto.idTreballador, serveiId: dto.idServei } },
    });
    if (!treballadorServei) throw new ForbiddenException('El treballador no ofereix aquest servei');

    const dataHoraInici = new Date(`${dto.data}T${dto.hora}:00`);

    if (isNaN(dataHoraInici.getTime())) throw new BadRequestException(`Data o hora invàlida: "${dto.data}T${dto.hora}"`);

    const dataHoraFinal = new Date(dataHoraInici.getTime() + servei.duradaMin * 60 * 1000);

    await this.checkSlotAvailable(dto.idTreballador, treballador.empresaId, servei.duradaMin, dataHoraInici);

    const email = dto.email?.trim().toLowerCase() ?? null;
    const tokenValoracio = email ? randomUUID() : null;

    const reserva = await this.prisma.$transaction(async (tx) => {
      const dayStart = new Date(dataHoraInici); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dataHoraInici); dayEnd.setHours(23, 59, 59, 999);

      const existingReserves = await tx.reserva.findMany({
        where: {
          treballadorId: dto.idTreballador,
          dataHora: { gte: dayStart, lte: dayEnd },
          ...(options.filterCancellades && { estat: { not: 'CANCELLADA' } }),
        },
        include: { servei: { select: { duradaMin: true } } },
      });

      const hasOverlap = existingReserves.some((r) => {
        const rFi = new Date(r.dataHora.getTime() + r.servei.duradaMin * 60 * 1000);
        return r.dataHora < dataHoraFinal && rFi > dataHoraInici;
      });

      if (hasOverlap) {
        throw options.filterCancellades
          ? new ConflictException('Aquest horari ja no està disponible')
          : new ForbiddenException('Ja hi ha una reserva solapada');
      }

      const client = email
        ? await tx.client.upsert({
          where: { email_empresaId: { email, empresaId: treballador.empresaId } },
          update: { nom: dto.nom, telefon: dto.telefon ?? null },
          create: { nom: dto.nom, email, telefon: dto.telefon ?? null, empresaId: treballador.empresaId },
        })
        : await tx.client.create({
          data: { nom: dto.nom, email: null, telefon: dto.telefon ?? null, empresaId: treballador.empresaId },
        });

      const tokenGestio = email ? randomUUID() : null;

      return tx.reserva.create({
        data: {
          treballadorId: dto.idTreballador,
          dataHora: dataHoraInici,
          empresaId: treballador.empresaId,
          serveiId: dto.idServei,
          clientId: client.id,
          clientEmail: email,
          clientNom: dto.nom,
          observacions: dto.observacions,
          estat: 'CONFIRMADA',
          tokenGestio,
          tokenValoracio,
        },
        include: { servei: true, treballador: true },
      });
    });

    if (email) {
      this.safeEnviarEmail(
        () => this.enviarEmailConfirmacio(reserva, { ...dto, email }, dataHoraInici, reserva.tokenGestio),
        'confirmació',
      );

      const delay = Math.max(0, dataHoraFinal.getTime() - Date.now());
      this.emailQueue.add('post-cita', {
        email,
        nom: dto.nom,
        serveiNom: reserva.servei.nom,
        dataHoraInici: dataHoraInici.toISOString(),
        tokenValoracio: reserva.tokenValoracio ?? undefined,
      }, { delay, ...EMAIL_JOB_OPTIONS }).catch(err => console.error('[ReservesService] Error afegint job post-cita:', err));
    }

    return reserva;
  }

  async create(dto: CreateReservaDto) {
    return this.createReservaInternal(dto, { checkActiu: false, filterCancellades: false });
  }

  async createPublic(dto: CreateReservaDto) {
    return this.createReservaInternal(dto, { checkActiu: true, filterCancellades: true });
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

    const dataHoraInici = new Date(`${dto.data}T${dto.hora}:00`);

    const dataHoraFinal = new Date(dataHoraInici.getTime() + servei.duradaMin * 60 * 1000);

    await this.checkSlotAvailable(
      dto.idTreballador,
      treballador.empresaId,
      servei.duradaMin,
      dataHoraInici,
    );

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
      include: {
        servei: { select: { nom: true } },
        empresa: { select: { nom: true } },
      },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no trobada');
    }

    const updated = await this.prisma.reserva.update({
      where: { id: idReserva },
      data: { estat: nouEstat },
    });

    if (nouEstat === 'CANCELLADA' && reserva.clientEmail) {
      this.enviarEmailCancellacio(reserva).catch(err =>
        console.error('Error sending cancellation email', err),
      );
    }

    return updated;
  }

  private async enviarEmailCancellacio(reserva: {
    clientNom?: string | null;
    clientEmail: string;
    dataHora: Date;
    servei: { nom: string };
    empresa: { nom: string };
  }): Promise<void> {
    const portalUrl = this.config.get<string>('PORTAL_URL', 'http://localhost:3002');
    const dataFormatada = reserva.dataHora.toLocaleDateString('ca-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'Europe/Madrid',
    });
    const horaFormatada = reserva.dataHora.toLocaleTimeString('ca-ES', {
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Madrid',
    });

    await this.resend.emails.send({
      from: this.emailFrom,
      to: reserva.clientEmail,
      subject: `Reserva cancel·lada — ${reserva.empresa.nom}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;">
          <h2 style="color:#6366F1;margin:0 0 4px">BookMeNow</h2>
          <p style="color:#6B7280;font-size:13px;margin:0 0 24px">${reserva.empresa.nom}</p>
          <h3 style="color:#0F172A;margin:0 0 12px">La teva reserva ha estat cancel·lada</h3>
          <p style="color:#334155;font-size:15px;">Hola ${reserva.clientNom ?? ''},</p>
          <p style="color:#334155;font-size:15px;">Lamentem informar-te que la teva cita ha estat cancel·lada per l'empresa:</p>
          <div style="background:#F8F9FB;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;color:#334155;font-size:14px;"><strong>Servei:</strong> ${reserva.servei.nom}</p>
            <p style="margin:4px 0;color:#334155;font-size:14px;"><strong>Data:</strong> ${dataFormatada}</p>
            <p style="margin:4px 0;color:#334155;font-size:14px;"><strong>Hora:</strong> ${horaFormatada}</p>
          </div>
          <p style="color:#334155;font-size:15px;">Si vols tornar a reservar, pots fer-ho des del nostre portal:</p>
          <a href="${portalUrl}" style="display:inline-block;margin:8px 0 16px;padding:12px 24px;background:#6366F1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
            Fer nova reserva
          </a>
          <p style="color:#9CA3AF;font-size:12px;margin-top:16px;">Disculpa les molèsties.</p>
        </div>
      `,
    });
  }

  async findAllByTreballador(idTreballador: number, currentUserEmpresaId: number, currentUserId: number, inici?: string, fi?: string) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    let treballador;
    if (user.rol === 'EMPLEAT') {
      treballador = await this.prisma.treballador.findFirst({
        where: { idUsuari: currentUserId },
      });
    } else {
      treballador = await this.prisma.treballador.findFirst({
        where: {
          OR: [
            { id: idTreballador },
            { idUsuari: idTreballador }
          ],
          empresaId: currentUserEmpresaId
        },
      });
    }

    if (!treballador) {
      throw new NotFoundException('Treballador no trobat');
    }

    if (treballador.empresaId !== currentUserEmpresaId) {
      throw new ForbiddenException('No pots veure les reserves d\'un treballador d\'una altra empresa');
    }

    let dateFilter = {};
    if (inici && fi) {
      const dataInici = new Date(inici);
      dataInici.setHours(0, 0, 0, 0);

      const dataFi = new Date(fi);
      dataFi.setHours(23, 59, 59, 999);

      dateFilter = {
        dataHora: {
          gte: dataInici,
          lte: dataFi,
        }
      };
    }

    const reserves = await this.prisma.reserva.findMany({
      where: {
        treballadorId: treballador.id,
        ...dateFilter
      },
      include: {
        servei: true,
        treballador: true,
        client: true,
      },
    });
    return reserves;
  }

  async findAllBySetmana(empresaId: number, inici: string, fi: string, currentUserId: number, treballadorId?: string) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.empresaId !== empresaId || user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Sense permisos per veure totes les reserves de l\'empresa');
    }

    if (treballadorId) {
      const userBooking = await this.prisma.treballador.findUnique({
        where: { id: parseInt(treballadorId) },
      });

      if (!userBooking) {
        throw new NotFoundException('Treballador no trobat');
      }

      if (userBooking.empresaId !== empresaId) {
        throw new ForbiddenException('No pots veure les reserves d\'un treballador d\'una altra empresa');
      }
    }

    const dataInici = new Date(inici);
    dataInici.setHours(0, 0, 0, 0);

    const dataFi = new Date(fi);
    dataFi.setHours(23, 59, 59, 999);

    const reserves = await this.prisma.reserva.findMany({
      where: {
        ...(treballadorId && { treballadorId: parseInt(treballadorId) }),
        empresaId: empresaId,
        dataHora: {
          gte: dataInici,
          lte: dataFi,
        },
      },
      include: {
        servei: true,
        treballador: true,
        client: true,
      },
    });

    return reserves;
  }

  private async enviarEmailConfirmacio(
    reserva: { servei: { nom: string; duradaMin: number } },
    dto: CreateReservaDto,
    dataHoraInici: Date,
    tokenGestio: string | null,
  ): Promise<void> {
    const portalUrl = this.config.get<string>('PORTAL_URL', 'http://localhost:3002');
    const dataFormatada = dataHoraInici.toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Madrid' });
    const horaFormatada = dataHoraInici.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
    const gestioLink = tokenGestio ? `${portalUrl}/reserva/${tokenGestio}` : null;

    await this.resend.emails.send({
      from: this.emailFrom,
      to: dto.email,
      subject: 'Reserva confirmada',
      html: `
        <h2>La teva reserva ha estat confirmada!</h2>
        <p>Hola ${dto.nom},</p>
        <p>Et confirmem la teva cita amb els detalls següents:</p>
        <ul>
          <li><strong>Servei:</strong> ${reserva.servei.nom}</li>
          <li><strong>Data:</strong> ${dataFormatada}</li>
          <li><strong>Hora:</strong> ${horaFormatada}</li>
          <li><strong>Durada:</strong> ${reserva.servei.duradaMin} minuts</li>
        </ul>
        ${gestioLink ? `
        <p>Pots gestionar la teva cita (modificar o cancel·lar) des d'aquest enllaç:</p>
        <a href="${gestioLink}" style="display:inline-block;padding:12px 24px;background:#7C3AED;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Gestionar la meva cita
        </a>
        <p style="font-size:12px;color:#9CA3AF;margin-top:8px;">O copia aquest enllaç: ${gestioLink}</p>
        ` : ''}
      `,
    });
  }

  async getReservaByToken(token: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { tokenGestio: token },
      include: {
        servei: true,
        treballador: { include: { Usuari: { select: { fotoPerfil: true } } } },
        empresa: { select: { id: true, nom: true, fotoPerfil: true, ubicacio: true } },
      },
    });

    if (!reserva) throw new NotFoundException('Reserva no trobada');
    return reserva;
  }

  async cancellarReservaByToken(token: string) {
    const reserva = await this.prisma.reserva.findUnique({ where: { tokenGestio: token } });
    if (!reserva) throw new NotFoundException('Reserva no trobada');
    if (reserva.estat === 'CANCELLADA') throw new BadRequestException('La reserva ja està cancel·lada');
    if (reserva.dataHora < new Date()) throw new BadRequestException('No es pot cancel·lar una cita ja passada');

    return this.prisma.reserva.update({
      where: { tokenGestio: token },
      data: { estat: 'CANCELLADA' },
    });
  }

  async modificarReservaByToken(token: string, dto: ModificarReservaGestioDto) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { tokenGestio: token },
      include: { servei: true },
    });
    if (!reserva) throw new NotFoundException('Reserva no trobada');
    if (reserva.estat === 'CANCELLADA') throw new BadRequestException('No es pot modificar una reserva cancel·lada');
    if (reserva.dataHora < new Date()) throw new BadRequestException('No es pot modificar una cita ja passada');

    const dataHoraInici = new Date(`${dto.data}T${dto.hora}:00`);

    if (isNaN(dataHoraInici.getTime())) throw new BadRequestException('Data o hora invàlida');

    const dataHoraFinal = new Date(dataHoraInici.getTime() + reserva.servei.duradaMin * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const dayStart = new Date(dataHoraInici); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dataHoraInici); dayEnd.setHours(23, 59, 59, 999);

      const reserves = await tx.reserva.findMany({
        where: {
          id: { not: reserva.id },
          treballadorId: reserva.treballadorId,
          dataHora: { gte: dayStart, lte: dayEnd },
          estat: { not: 'CANCELLADA' },
        },
        include: { servei: { select: { duradaMin: true } } },
      });

      const hasOverlap = reserves.some((r) => {
        const rFi = new Date(r.dataHora.getTime() + r.servei.duradaMin * 60 * 1000);
        return r.dataHora < dataHoraFinal && rFi > dataHoraInici;
      });

      if (hasOverlap) throw new ConflictException('Aquest horari ja no està disponible');

      return tx.reserva.update({
        where: { tokenGestio: token },
        data: { dataHora: dataHoraInici },
        include: { servei: true, treballador: true, empresa: true },
      });
    });
  }
}
