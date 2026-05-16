import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTreballadorDto } from './dto/CreateTreballadorDto';
import { AssignarServeisDto } from './dto/AssignarServeisDto';
import { UpdateTreballadorDto } from './dto/UpdateTreballadorDto';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

const PLANTILLA_INCLUDE = {
  rotacions: { include: { dies: { include: { trams: true } } } },
} as const;

function parseDateInici(iso?: string): Date {
  const d = iso ? new Date(iso) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

@Injectable()
export class TreballadorsService {
  constructor(private prisma: PrismaService) { }

  async create(empresaId: number, dto: CreateTreballadorDto, userId: number) {
    const user = await this.prisma.usuari.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuari no trobat');
    if (user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException('Usuari no autoritzat');

    const userAfegir = await this.prisma.usuari.findUnique({ where: { id: dto.idUsuari } });
    if (!userAfegir) throw new NotFoundException('L\'usuari a assignar no existeix');
    if (userAfegir.empresaId !== empresaId) throw new ForbiddenException('No pots assignar un usuari d\'una altra empresa');

    const treballador = await this.prisma.treballador.create({
      data: {
        empresaId,
        idUsuari: dto.idUsuari,
        nom: dto.nom,
        ...(dto.diesVacancesAnuals !== undefined ? { diesVacancesAnuals: dto.diesVacancesAnuals } : {}),
        ...(dto.plantillaId ? { plantillaId: dto.plantillaId, dataIniciRotacio: parseDateInici(dto.dataIniciRotacio) } : {}),
      },
    });

    if (dto.serveisIds && dto.serveisIds.length > 0) {
      const serveis = await this.prisma.servei.findMany({
        where: { id: { in: dto.serveisIds }, empresaId },
      });
      if (serveis.length !== dto.serveisIds.length) {
        throw new NotFoundException('Un o més serveis a assignar no existeixen o no pertanyen a la teva empresa');
      }
      await this.prisma.treballadorServei.createMany({
        data: dto.serveisIds.map((serveiId) => ({ treballadorId: treballador.id, serveiId })),
        skipDuplicates: true,
      });
    }

    return treballador;
  }

  async assignarServeis(empresaId: number, dto: AssignarServeisDto, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({ where: { id: currentUser } });
    if (!user) throw new NotFoundException('Usuari no trobat');
    if (user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException('Usuari no autoritzat');

    const treballador = await this.prisma.treballador.findUnique({ where: { id: dto.treballadorId } });
    if (!treballador) throw new NotFoundException('El treballador no existeix');
    if (treballador.empresaId !== empresaId) throw new ForbiddenException('No pots assignar serveis a un treballador d\'una altra empresa');

    const serveis = await this.prisma.servei.findMany({
      where: { id: { in: dto.serveisIds }, empresaId },
    });
    if (serveis.length !== dto.serveisIds.length) {
      throw new NotFoundException('Un o més serveis no existeixen o no pertanyen a la teva empresa');
    }

    return await this.prisma.$transaction(async (tx) => {
      const assignments = [];
      for (const serveiId of dto.serveisIds) {
        const existing = await tx.treballadorServei.findUnique({
          where: { treballadorId_serveiId: { treballadorId: dto.treballadorId, serveiId } },
        });
        if (!existing) {
          assignments.push(await tx.treballadorServei.create({
            data: { treballadorId: dto.treballadorId, serveiId },
          }));
        }
      }
      return assignments;
    });
  }

  async eliminarServeis(empresaId: number, id: number, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({ where: { id: currentUser } });
    if (!user) throw new NotFoundException('Usuari no trobat');
    if (user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException('Usuari no autoritzat');

    const serveisTreballador = await this.prisma.treballadorServei.findUnique({ where: { id } });
    if (!serveisTreballador) throw new NotFoundException('Els serveis del treballador no existeixen');

    return await this.prisma.treballadorServei.delete({ where: { id } });
  }

  async getDisponibilitatPublic(treballadorId: number, serveiId: number) {
    const treballador = await this.prisma.treballador.findUnique({
      where: { id: treballadorId },
      include: { plantilla: { include: PLANTILLA_INCLUDE } },
    });
    if (!treballador || !treballador.actiu) throw new NotFoundException('El treballador no existeix');

    const servei = await this.prisma.servei.findUnique({ where: { id: serveiId } });
    if (!servei || !servei.actiu) throw new NotFoundException('El servei no existeix');
    if (servei.empresaId !== treballador.empresaId) throw new NotFoundException('El servei no pertany a aquest treballador');

    const empresaInfo = await this.prisma.empresa.findUnique({ where: { id: treballador.empresaId }, select: { diasAntesReserva: true } });
    const dies = empresaInfo?.diasAntesReserva ?? 14;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + dies);

    const [reserves, absencies, absenciesEmpresa] = await Promise.all([
      this.prisma.reserva.findMany({
        where: { treballadorId, dataHora: { gte: today, lt: endDate }, estat: { not: 'CANCELLADA' } },
        include: { servei: true },
      }),
      this.prisma.absencia.findMany({
        where: { treballadorId, estat: 'APROVADA', inici: { lte: endDate }, fi: { gte: today } },
      }),
      this.prisma.absenciaEmpresa.findMany({
        where: { empresaId: treballador.empresaId, inici: { lte: endDate }, fi: { gte: today } },
      }),
    ]);

    const plantilla = treballador.plantilla;
    const disponibilitat: Record<string, string[]> = {};
    const MS_PER_MIN = 60000;

    for (let i = 0; i < dies; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      const dayStart = new Date(currentDate); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate); dayEnd.setHours(23, 59, 59, 999);

      if (absenciesEmpresa.some(a => a.inici <= dayEnd && a.fi >= dayStart)) {
        disponibilitat[dateString] = []; continue;
      }
      if (!plantilla || !plantilla.rotacions || plantilla.rotacions.length === 0) {
        disponibilitat[dateString] = []; continue;
      }

      const refDate = new Date(treballador.dataIniciRotacio ?? currentDate);
      refDate.setHours(0, 0, 0, 0);
      if (currentDate < refDate) { disponibilitat[dateString] = []; continue; }

      let dow = currentDate.getDay();
      if (dow === 0) dow = 7;

      const rotacionsOrdenades = [...plantilla.rotacions].sort((a, b) => a.index - b.index);
      const numRotacions = rotacionsOrdenades.length;
      const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
      const mondayRef = getMondayOfWeek(refDate);
      const mondayCurrent = getMondayOfWeek(currentDate);
      const setmanes = Math.round((mondayCurrent.getTime() - mondayRef.getTime()) / MS_PER_WEEK);
      const rotacioIdx = ((setmanes % numRotacions) + numRotacions) % numRotacions;
      const rotacio = rotacionsOrdenades[rotacioIdx];
      if (!rotacio) { disponibilitat[dateString] = []; continue; }

      const diaRotacio = rotacio.dies.find(d => d.dow === dow);
      if (!diaRotacio || diaRotacio.esDescans || !diaRotacio.trams) {
        disponibilitat[dateString] = []; continue;
      }

      const dayReserves = reserves.filter(r => { const d = new Date(r.dataHora); return d >= dayStart && d < dayEnd; });
      const dayAbsencies = absencies.filter(a => a.inici <= dayEnd && a.fi >= dayStart);

      const slots: string[] = [];
      for (const tram of diaRotacio.trams) {
        let currentMin = tram.iniciMin;
        const tramEnd = tram.fiMin;

        while (currentMin + servei.duradaMin <= tramEnd) {
          const slotStartMin = currentMin;
          const slotEndMin = currentMin + servei.duradaMin;

          const slotStartDate = new Date(currentDate);
          slotStartDate.setHours(Math.floor(slotStartMin / 60), slotStartMin % 60, 0, 0);
          const slotEndDate = new Date(currentDate);
          slotEndDate.setHours(Math.floor(slotEndMin / 60), slotEndMin % 60, 0, 0);

          if (slotStartDate <= now) {
            currentMin += servei.duradaMin;
            continue;
          }

          let isBlocked = false;
          let jumpToMin = -1;

          for (const res of dayReserves) {
            const resStart = new Date(res.dataHora);
            const resEnd = new Date(resStart.getTime() + res.servei.duradaMin * MS_PER_MIN);
            if (slotStartDate < resEnd && slotEndDate > resStart) {
              isBlocked = true;
              jumpToMin = resEnd.getHours() * 60 + resEnd.getMinutes();
              break;
            }
          }

          if (!isBlocked) {
            for (const abs of dayAbsencies) {
              const absEnd = new Date(abs.fi);
              absEnd.setHours(23, 59, 59, 999);
              if (slotStartDate < absEnd && slotEndDate > abs.inici) {
                isBlocked = true;
                jumpToMin = tramEnd;
                break;
              }
            }
          }

          if (!isBlocked) {
            slots.push(`${String(Math.floor(slotStartMin / 60)).padStart(2, '0')}:${String(slotStartMin % 60).padStart(2, '0')} - ${String(Math.floor(slotEndMin / 60)).padStart(2, '0')}:${String(slotEndMin % 60).padStart(2, '0')}`);
            currentMin += servei.duradaMin;
          } else {
            currentMin = jumpToMin > currentMin ? jumpToMin : currentMin + servei.duradaMin;
          }
        }
      }

      disponibilitat[dateString] = slots;
    }

    return disponibilitat;
  }

  async getDisponibilitat(empresaId: number, id: number, serveiId: number, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({ where: { id: currentUser } });
    if (!user) throw new NotFoundException('Usuari no trobat');
    if (user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException('Usuari no autoritzat');

    const treballador = await this.prisma.treballador.findUnique({
      where: { id },
      include: { plantilla: { include: PLANTILLA_INCLUDE } },
    });
    if (!treballador) throw new NotFoundException('El treballador no existeix');
    if (treballador.empresaId !== empresaId) throw new ForbiddenException('No pots veure la disponibilitat d\'un treballador d\'una altra empresa');

    const servei = await this.prisma.servei.findUnique({ where: { id: serveiId } });
    if (!servei) throw new NotFoundException('El servei no existeix');
    if (servei.empresaId !== empresaId) throw new ForbiddenException('El servei no pertany a la teva empresa');

    const empresaInfo = await this.prisma.empresa.findUnique({ where: { id: empresaId }, select: { diasAntesReserva: true } });
    const dies = empresaInfo?.diasAntesReserva ?? 14;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + dies);

    const [reserves, absencies, absenciesEmpresa] = await Promise.all([
      this.prisma.reserva.findMany({
        where: { treballadorId: id, dataHora: { gte: today, lt: endDate }, estat: { not: 'CANCELLADA' } },
        include: { servei: true },
      }),
      this.prisma.absencia.findMany({
        where: { treballadorId: id, estat: 'APROVADA', inici: { lte: endDate }, fi: { gte: today } },
      }),
      this.prisma.absenciaEmpresa.findMany({
        where: { empresaId, inici: { lte: endDate }, fi: { gte: today } },
      }),
    ]);

    const plantilla = treballador.plantilla;
    const disponibilitat: Record<string, string[]> = {};
    const MS_PER_MIN = 60000;

    for (let i = 0; i < dies; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      const dayStart = new Date(currentDate); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate); dayEnd.setHours(23, 59, 59, 999);

      if (absenciesEmpresa.some(a => a.inici <= dayEnd && a.fi >= dayStart)) {
        disponibilitat[dateString] = []; continue;
      }
      if (!plantilla || !plantilla.rotacions || plantilla.rotacions.length === 0) {
        disponibilitat[dateString] = []; continue;
      }

      const refDate = new Date(treballador.dataIniciRotacio ?? currentDate);
      refDate.setHours(0, 0, 0, 0);
      if (currentDate < refDate) { disponibilitat[dateString] = []; continue; }

      let dow = currentDate.getDay();
      if (dow === 0) dow = 7;

      const rotacionsOrdenades = [...plantilla.rotacions].sort((a, b) => a.index - b.index);
      const numRotacions = rotacionsOrdenades.length;
      const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
      const mondayRef = getMondayOfWeek(refDate);
      const mondayCurrent = getMondayOfWeek(currentDate);
      const setmanes = Math.round((mondayCurrent.getTime() - mondayRef.getTime()) / MS_PER_WEEK);
      const rotacioIdx = ((setmanes % numRotacions) + numRotacions) % numRotacions;
      const rotacio = rotacionsOrdenades[rotacioIdx];
      if (!rotacio) { disponibilitat[dateString] = []; continue; }

      const diaRotacio = rotacio.dies.find(d => d.dow === dow);
      if (!diaRotacio || diaRotacio.esDescans || !diaRotacio.trams) {
        disponibilitat[dateString] = []; continue;
      }

      const dayReserves = reserves.filter(r => {
        const rDate = new Date(r.dataHora);
        return rDate >= dayStart && rDate < dayEnd;
      });
      const dayAbsencies = absencies.filter(a => a.inici <= dayEnd && a.fi >= dayStart);

      const slots: string[] = [];
      for (const tram of diaRotacio.trams) {
        let currentMin = tram.iniciMin;
        const tramEnd = tram.fiMin;

        while (currentMin + servei.duradaMin <= tramEnd) {
          const slotStartMin = currentMin;
          const slotEndMin = currentMin + servei.duradaMin;

          const slotStartDate = new Date(currentDate);
          slotStartDate.setHours(Math.floor(slotStartMin / 60), slotStartMin % 60, 0, 0);
          const slotEndDate = new Date(currentDate);
          slotEndDate.setHours(Math.floor(slotEndMin / 60), slotEndMin % 60, 0, 0);

          if (slotStartDate <= now) {
            currentMin += servei.duradaMin;
            continue;
          }

          let isBlocked = false;
          let jumpToMin = -1;

          for (const res of dayReserves) {
            const resStart = new Date(res.dataHora);
            const resEnd = new Date(resStart.getTime() + res.servei.duradaMin * MS_PER_MIN);
            if (slotStartDate < resEnd && slotEndDate > resStart) {
              isBlocked = true;
              jumpToMin = resEnd.getHours() * 60 + resEnd.getMinutes();
              break;
            }
          }

          if (isBlocked) {
            currentMin = jumpToMin > currentMin ? jumpToMin : currentMin + servei.duradaMin;
            continue;
          }

          for (const abs of dayAbsencies) {
            const absEnd = new Date(abs.fi);
            absEnd.setHours(23, 59, 59, 999);
            if (slotStartDate < absEnd && slotEndDate > abs.inici) {
              isBlocked = true;
              jumpToMin = tramEnd;
              break;
            }
          }

          if (!isBlocked) {
            slots.push(`${String(Math.floor(slotStartMin / 60)).padStart(2, '0')}:${String(slotStartMin % 60).padStart(2, '0')} - ${String(Math.floor(slotEndMin / 60)).padStart(2, '0')}:${String(slotEndMin % 60).padStart(2, '0')}`);
            currentMin += servei.duradaMin;
          } else {
            currentMin = jumpToMin;
          }
        }
      }

      disponibilitat[dateString] = slots;
    }

    return disponibilitat;
  }

  async getTreballadorsPaginats(empresaId: number, page: number = 1, rows: number = 2, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({ where: { id: currentUser } });
    if (!user) throw new NotFoundException('Usuari no trobat');
    if (user.rol !== 'ADMIN_GENERAL' && user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots veure treballadors d\'aquesta empresa');
    }

    const empresa = await this.prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) throw new NotFoundException('Empresa no trobada');

    const skip = (page - 1) * rows;
    const total = await this.prisma.treballador.count({ where: { empresaId } });

    const data = await this.prisma.treballador.findMany({
      where: { empresaId },
      include: {
        Usuari: { select: { email: true, fotoPerfil: true } },
        serveis: { include: { servei: true } },
        plantilla: true,
      },
      orderBy: { nom: 'asc' },
      skip,
      take: Number(rows),
    });

    return {
      data,
      total,
      page: Number(page),
      rows: Number(rows),
      totalPages: Math.ceil(total / rows),
    };
  }

  async update(empresaId: number, id: number, dto: UpdateTreballadorDto, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({ where: { id: currentUser } });
    if (!user) throw new NotFoundException('Usuari no trobat');
    if (user.rol !== 'ADMIN_GENERAL' && user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots modificar treballadors d\'aquesta empresa');
    }

    const treballador = await this.prisma.treballador.findUnique({ where: { id } });
    if (!treballador) throw new NotFoundException('El treballador no existeix');
    if (treballador.empresaId !== empresaId) throw new ForbiddenException('No pots modificar un treballador d\'una altra empresa');

    return await this.prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      const basicData: Record<string, any> = {};
      if (dto.nom) basicData.nom = dto.nom;
      if (dto.diesVacancesAnuals !== undefined) basicData.diesVacancesAnuals = dto.diesVacancesAnuals;

      if (Object.keys(basicData).length > 0) {
        await tx.treballador.update({ where: { id }, data: basicData });
      }

      // 2. Update service assignments
      if (dto.serveisIds !== undefined) {
        if (dto.serveisIds.length > 0) {
          const serveis = await tx.servei.findMany({
            where: { id: { in: dto.serveisIds }, empresaId },
          });
          if (serveis.length !== dto.serveisIds.length) {
            throw new NotFoundException('Un o més serveis no existeixen o no pertanyen a la teva empresa');
          }
        }
        await tx.treballadorServei.deleteMany({ where: { treballadorId: id } });
        if (dto.serveisIds.length > 0) {
          await tx.treballadorServei.createMany({
            data: dto.serveisIds.map(serveiId => ({ treballadorId: id, serveiId })),
          });
        }
      }

      // 3. Update plantilla assignment
      if (dto.plantillaId !== undefined) {
        if (dto.plantillaId !== null) {
          const plantilla = await tx.jornadaPlantilla.findUnique({ where: { id: dto.plantillaId } });
          if (!plantilla) throw new NotFoundException('La plantilla de jornada no existeix');
          if (plantilla.empresaId !== empresaId) throw new ForbiddenException('La plantilla no pertany a la teva empresa');
        }
        await tx.treballador.update({
          where: { id },
          data: {
            plantillaId: dto.plantillaId,
            dataIniciRotacio: dto.plantillaId !== null ? parseDateInici(dto.dataIniciRotacio) : null,
          },
        });
      }

      return await tx.treballador.findUnique({
        where: { id },
        include: {
          serveis: { include: { servei: true } },
          plantilla: true,
        },
      });
    });
  }

  async getTreballadors(empresaId: number, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({ where: { id: currentUser } });
    if (!user) throw new NotFoundException('Usuari no trobat');
    if (user.rol !== 'ADMIN_GENERAL' && user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots veure els treballadors d\'aquesta empresa');
    }

    return await this.prisma.treballador.findMany({
      where: { empresaId },
      include: {
        serveis: { include: { servei: true } },
        plantilla: true,
      },
    });
  }

  async remove(empresaId: number, id: number, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({ where: { id: currentUser } });
    if (!user) throw new NotFoundException('Usuari no trobat');
    if (user.rol !== 'ADMIN_GENERAL' && user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots eliminar treballadors d\'aquesta empresa');
    }

    const treballador = await this.prisma.treballador.findUnique({
      where: { id },
      include: { Usuari: true },
    });
    if (!treballador) throw new NotFoundException('El treballador no existeix');
    if (treballador.Usuari?.rol === 'ADMIN_GENERAL') throw new ForbiddenException('No es pot eliminar un treballador administrador');
    if (treballador.empresaId !== empresaId) throw new ForbiddenException('No pots eliminar un treballador d\'una altra empresa');

    return await this.prisma.$transaction(async (tx) => {
      await tx.treballadorServei.deleteMany({ where: { treballadorId: id } });
      await tx.jornada.deleteMany({ where: { treballadorId: id } });
      await tx.absencia.deleteMany({ where: { treballadorId: id } });
      await tx.reserva.updateMany({ where: { treballadorId: id }, data: { treballadorId: null } });
      await tx.valoracio.updateMany({ where: { treballadorId: id }, data: { treballadorId: null } });
      const deleted = await tx.treballador.delete({ where: { id } });
      await tx.usuari.delete({ where: { id: deleted.idUsuari } });
      return deleted;
    });
  }

  async getMyAbsenciesCalendari(user: CurrentUserData, any?: number) {
    const treballador = await this.prisma.treballador.findFirst({
      where: { idUsuari: user.userId },
      select: { id: true, diesVacancesAnuals: true },
    });

    const yearFilter = any
      ? { inici: { gte: new Date(`${any}-01-01T00:00:00.000Z`), lte: new Date(`${any}-12-31T23:59:59.999Z`) } }
      : {};

    const [treballadorAbsencies, empresaAbsencies] = await Promise.all([
      treballador
        ? this.prisma.absencia.findMany({ where: { treballadorId: treballador.id, ...yearFilter }, orderBy: { inici: 'asc' } })
        : Promise.resolve([]),
      this.prisma.absenciaEmpresa.findMany({ where: { empresaId: user.empresaId, ...yearFilter }, orderBy: { inici: 'asc' } }),
    ]);

    const diesVacancesAnuals = treballador?.diesVacancesAnuals ?? 0;

    return {
      treballador: treballadorAbsencies,
      empresa: empresaAbsencies,
      diesVacancesAnuals,
      missatgeDies: diesVacancesAnuals === 0 ? 'No hi ha dies de vacances assignats per aquest treballador.' : null,
    };
  }
}
