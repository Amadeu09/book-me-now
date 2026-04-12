import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJornadaTreballadorExistDto, CreateTreballadorDto, JornadaTreballadorDto } from './dto/CreateTreballadorDto';
import { AssignarServeisDto } from './dto/AssignarServeisDto';
import { UpdateTreballadorDto } from './dto/UpdateTreballadorDto';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

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

    if (dto.serveisIds && dto.serveisIds.length > 0) {
      const serveis = await this.prisma.servei.findMany({
        where: {
          id: { in: dto.serveisIds },
          empresaId: empresaId,
        },
      });

      if (serveis.length !== dto.serveisIds.length) {
        throw new NotFoundException('Un o més serveis a assignar no existeixen o no pertanyen a la teva empresa');
      }

      await this.prisma.treballadorServei.createMany({
        data: dto.serveisIds.map((serveiId) => ({
          treballadorId: treballador.id,
          serveiId: serveiId,
        })),
        skipDuplicates: true,
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

  async eliminarJornadaTreballador(empresaId: number, id: number, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUser },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Usuari no autoritzat');
    }

    const jornadaTreballador = await this.prisma.treballadorJornadaPlantilla.findUnique({
      where: { id: id },
    });

    if (!jornadaTreballador) {
      throw new NotFoundException('La jornada del treballador no existeix');
    }

    return await this.prisma.treballadorJornadaPlantilla.delete({
      where: { id: id },
    });
  }

  async eliminarServeis(empresaId: number, id: number, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUser },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Usuari no autoritzat');
    }

    const serveisTreballador = await this.prisma.treballadorServei.findUnique({
      where: { id: id },
    });

    if (!serveisTreballador) {
      throw new NotFoundException('Els serveis del treballador no existeixen');
    }

    return await this.prisma.treballadorServei.delete({
      where: { id: id },
    });
  }

  async getDisponibilitatPublic(treballadorId: number, serveiId: number) {
    const treballador = await this.prisma.treballador.findUnique({ where: { id: treballadorId } });
    if (!treballador || !treballador.actiu) throw new NotFoundException('El treballador no existeix');

    const servei = await this.prisma.servei.findUnique({ where: { id: serveiId } });
    if (!servei || !servei.actiu) throw new NotFoundException('El servei no existeix');

    if (servei.empresaId !== treballador.empresaId) throw new NotFoundException('El servei no pertany a aquest treballador');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 14);

    const assignments = await this.prisma.treballadorJornadaPlantilla.findMany({
      where: {
        treballadorId,
        OR: [{ dataFi: null }, { dataFi: { gte: today } }],
        dataInici: { lte: endDate },
      },
      include: {
        plantilla: {
          include: {
            rotacions: { include: { dies: { include: { trams: true } } } },
          },
        },
      },
    });

    const reserves = await this.prisma.reserva.findMany({
      where: {
        treballadorId,
        dataHora: { gte: today, lt: endDate },
        estat: { not: 'CANCELLADA' },
      },
      include: { servei: true },
    });

    const absencies = await this.prisma.absencia.findMany({
      where: {
        treballadorId,
        estat: 'APROVADA',
        inici: { lte: endDate },
        fi: { gte: today },
      },
    });

    const absenciesEmpresa = await this.prisma.absenciaEmpresa.findMany({
      where: {
        empresaId: treballador.empresaId,
        inici: { lte: endDate },
        fi: { gte: today },
      },
    });

    const disponibilitat: Record<string, string[]> = {};
    const MS_PER_MIN = 60000;

    const getMonday = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];

      const dayStart = new Date(currentDate); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate); dayEnd.setHours(23, 59, 59, 999);

      const isEmpresaAbsence = absenciesEmpresa.some(a => a.inici <= dayEnd && a.fi >= dayStart);
      if (isEmpresaAbsence) { disponibilitat[dateString] = []; continue; }

      const assignment = assignments.find(a =>
        new Date(a.dataInici) <= currentDate && (!a.dataFi || new Date(a.dataFi) >= currentDate)
      );
      if (!assignment) { disponibilitat[dateString] = []; continue; }

      const plantilla = assignment.plantilla;
      if (!plantilla.rotacions || plantilla.rotacions.length === 0) { disponibilitat[dateString] = []; continue; }

      let dow = currentDate.getDay();
      if (dow === 0) dow = 7;

      const oneDay = 24 * 60 * 60 * 1000;
      const assignmentStartMonday = getMonday(new Date(assignment.dataInici));
      const currentMonday = getMonday(currentDate);
      const diffWeeks = Math.floor((currentMonday.getTime() - assignmentStartMonday.getTime()) / (7 * oneDay));

      if (diffWeeks < 0) { disponibilitat[dateString] = []; continue; }

      const rotationIndex = (assignment.anchorRotacioIndex + diffWeeks) % plantilla.rotacions.length;
      const rotacionsOrdenades = [...plantilla.rotacions].sort((a, b) => a.index - b.index);
      const rotacio = rotacionsOrdenades[rotationIndex];
      if (!rotacio) { disponibilitat[dateString] = []; continue; }

      const diaRotacio = rotacio.dies.find(d => d.dow === dow);
      if (!diaRotacio || diaRotacio.esDescans || !diaRotacio.trams) { disponibilitat[dateString] = []; continue; }

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
              if (slotStartDate < abs.fi && slotEndDate > abs.inici) {
                isBlocked = true;
                const absEndMin = abs.fi.getHours() * 60 + abs.fi.getMinutes();
                jumpToMin = absEndMin > currentMin ? absEndMin : currentMin + servei.duradaMin;
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
      where: { id: id },
    });

    if (!treballador) {
      throw new NotFoundException('El treballador no existeix');
    }

    if (treballador.empresaId !== empresaId) {
      throw new ForbiddenException('No pots veure la disponibilitat d\'un treballador d\'una altra empresa');
    }

    const servei = await this.prisma.servei.findUnique({
      where: { id: serveiId },
    });

    if (!servei) {
      throw new NotFoundException('El servei no existeix');
    }

    if (servei.empresaId !== empresaId) {
      throw new ForbiddenException('El servei no pertany a la teva empresa');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 14);

    // Fetch assignments covering the range
    const assignments = await this.prisma.treballadorJornadaPlantilla.findMany({
      where: {
        treballadorId: id,
        OR: [
          { dataFi: null },
          { dataFi: { gte: today } },
        ],
        dataInici: { lte: endDate },
      },
      include: {
        plantilla: {
          include: {
            rotacions: {
              include: {
                dies: {
                  include: {
                    trams: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const reserves = await this.prisma.reserva.findMany({
      where: {
        treballadorId: id,
        dataHora: {
          gte: today,
          lt: endDate,
        },
        estat: { not: 'CANCELLADA' },
      },
      include: {
        servei: true,
      },
    });

    const absencies = await this.prisma.absencia.findMany({
      where: {
        treballadorId: id,
        estat: 'APROVADA',
        inici: { lte: endDate },
        fi: { gte: today },
      },
    });

    const absenciesEmpresa = await this.prisma.absenciaEmpresa.findMany({
      where: {
        empresaId: empresaId,
        inici: { lte: endDate },
        fi: { gte: today },
      },
    });

    const disponibilitat = {};
    const MS_PER_MIN = 60000;

    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];

      // Find relevant assignment
      const assignment = assignments.find(a =>
        new Date(a.dataInici) <= currentDate && (!a.dataFi || new Date(a.dataFi) >= currentDate)
      );

      // Check if the day is blocked by a company-wide absence (holiday, etc.)
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const isEmpresaAbsence = absenciesEmpresa.some(
        a => a.inici <= dayEnd && a.fi >= dayStart,
      );
      if (isEmpresaAbsence) {
        disponibilitat[dateString] = [];
        continue;
      }

      if (!assignment) {
        console.log(`No assignment for ${dateString}`);
        disponibilitat[dateString] = []; // No schedule assigned
        continue;
      }

      // Calculate rotation index logic
      // Only if rotacions exist. Assuming simple rotation logic for now:
      // Week A (0), Week B (1), etc.
      // Days difference from start / 7 % count

      const plantilla = assignment.plantilla;
      if (!plantilla.rotacions || plantilla.rotacions.length === 0) {
        console.log(`No rotations for ${dateString}`);
        disponibilitat[dateString] = [];
        continue;
      }

      // Helper to get day of week (1=Monday... 7=Sunday)
      let dow = currentDate.getDay(); // 0=Sun, 1=Mon...
      if (dow === 0) dow = 7;

      // Calculate which rotation week is active
      // Needs complex logic if rotations are weekly. Assuming rotations are by week.
      // Standard logic: (CurrentWeek - StartWeek + anchorIndex) % totalRotations
      // Simply: Days since start / 7 floor

      const oneDay = 24 * 60 * 60 * 1000;

      // Normalize dates to Start of Week (Monday) to align rotations with Calendar Weeks
      const getMonday = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
        return date;
      }

      const assignmentStartMonday = getMonday(new Date(assignment.dataInici));
      const currentMonday = getMonday(currentDate);

      const diffTime = currentMonday.getTime() - assignmentStartMonday.getTime();
      const diffWeeks = Math.floor(diffTime / (7 * oneDay));

      if (diffWeeks < 0) {
        // Should not happen given the assignment query, but safety check
        disponibilitat[dateString] = [];
        continue;
      }

      const rotationIndex = (assignment.anchorRotacioIndex + diffWeeks) % plantilla.rotacions.length;

      console.log(`Date: ${dateString}, AssignmentStart: ${assignment.dataInici.toISOString()}, MondayStart: ${assignmentStartMonday.toISOString()}, CurrentMonday: ${currentMonday.toISOString()}, WeeksDiff: ${diffWeeks}, RotationIndex: ${rotationIndex}`);

      // Sort rotations by their index field and access by position,
      // so it works even when index values are not 0-based or have gaps.
      const rotacionsOrdenades = [...plantilla.rotacions].sort((a, b) => a.index - b.index);
      const rotacio = rotacionsOrdenades[rotationIndex];
      if (!rotacio) {
        console.log(`No rotation found for ${dateString} position ${rotationIndex}`);
        disponibilitat[dateString] = [];
        continue;
      }

      const diaRotacio = rotacio.dies.find(d => d.dow === dow);
      if (!diaRotacio || diaRotacio.esDescans || !diaRotacio.trams) {
        console.log(`No schedule for ${dateString} dow ${dow}`);
        disponibilitat[dateString] = [];
        continue;
      }

      const slots = [];
      // Flatten trams to usable minutes (e.g. 480 to 860)
      // Check collisions with reserves and absencies

      // Filter reserves for this day — use Date range to avoid timezone issues
      // (dayStart/dayEnd already computed above for empresa absence check)
      const dayReserves = reserves.filter(r => {
        const rDate = new Date(r.dataHora);
        return rDate >= dayStart && rDate < dayEnd;
      });

      // Filter absencies for this day — use pre-built dayStart/dayEnd (no currentDate mutation)
      const dayAbsencies = absencies.filter(a => a.inici <= dayEnd && a.fi >= dayStart);

      // Generate slots
      for (const tram of diaRotacio.trams) {
        let currentMin = tram.iniciMin;
        const tramEnd = tram.fiMin;

        while (currentMin + servei.duradaMin <= tramEnd) {
          const slotStartMin = currentMin;
          const slotEndMin = currentMin + servei.duradaMin;

          // Convert to hours for collision check
          const slotStartDate = new Date(currentDate);
          slotStartDate.setHours(Math.floor(slotStartMin / 60), slotStartMin % 60, 0, 0);

          const slotEndDate = new Date(currentDate);
          slotEndDate.setHours(Math.floor(slotEndMin / 60), slotEndMin % 60, 0, 0);

          let isBlocked = false;

          // Check reserves — jump to end of blocker to avoid redundant iterations
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

          // Check absences — jump to end of blocker
          for (const abs of dayAbsencies) {
            if (slotStartDate < abs.fi && slotEndDate > abs.inici) {
              isBlocked = true;
              const absEndMin = abs.fi.getHours() * 60 + abs.fi.getMinutes();
              jumpToMin = absEndMin > currentMin ? absEndMin : currentMin + servei.duradaMin;
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

  async getTreballadorsPaginats(
    empresaId: number,
    page: number = 1,
    rows: number = 2,
    currentUser: number
  ) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUser },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.rol !== 'ADMIN_GENERAL' && user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots veure treballadors d\'aquesta empresa');
    }

    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no trobada');
    }

    const skip = (page - 1) * rows;
    const total = await this.prisma.treballador.count({ where: { empresaId } });

    const data = await this.prisma.treballador.findMany({
      where: { empresaId },
      include: {
        Usuari: {
          select: {
            email: true,
            fotoPerfil: true,
          }
        },
        serveis: {
          include: {
            servei: true
          }
        },
        jornadesPlantillaAssignacions: {
          include: {
            plantilla: true
          }
        }
      },
      orderBy: {
        nom: 'asc',
      },
      skip,
      take: Number(rows),
    });

    return {
      data,
      total,
      page: Number(page),
      rows: Number(rows),
      totalPages: Math.ceil(total / rows)
    };
  }

  async update(empresaId: number, id: number, dto: UpdateTreballadorDto, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUser },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.rol !== 'ADMIN_GENERAL' && user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots modificar treballadors d\'aquesta empresa');
    }

    const treballador = await this.prisma.treballador.findUnique({
      where: { id: id },
    });

    if (!treballador) {
      throw new NotFoundException('El treballador no existeix');
    }

    if (treballador.empresaId !== empresaId) {
      throw new ForbiddenException('No pots modificar un treballador d\'una altra empresa');
    }

    // Process update in a transaction
    return await this.prisma.$transaction(async (tx) => {
      // 1. Update basic info
      if (dto.nom || dto.diesVacancesAnuals !== undefined) {
        await tx.treballador.update({
          where: { id: id },
          data: {
            ...(dto.nom ? { nom: dto.nom } : {}),
            ...(dto.diesVacancesAnuals !== undefined ? { diesVacancesAnuals: dto.diesVacancesAnuals } : {}),
          },
        });
      }

      // 2. Update service assignments if provided
      if (dto.serveisIds !== undefined) {
        // Verify services
        if (dto.serveisIds.length > 0) {
          const serveis = await tx.servei.findMany({
            where: {
              id: { in: dto.serveisIds },
              empresaId: empresaId,
            },
          });
          if (serveis.length !== dto.serveisIds.length) {
            throw new NotFoundException('Un o més serveis no existeixen o no pertanyen a la teva empresa');
          }
        }

        // Remove old assignments
        await tx.treballadorServei.deleteMany({
          where: { treballadorId: id },
        });

        // Add new assignments
        if (dto.serveisIds.length > 0) {
          await tx.treballadorServei.createMany({
            data: dto.serveisIds.map(serveiId => ({
              treballadorId: id,
              serveiId: serveiId,
            })),
          });
        }
      }

      // 3. Update active template assignment if provided (just doing one active assignment for simplicity, as in UI)
      if (dto.jornadaTreballador !== undefined) {
        const payload = dto.jornadaTreballador;

        // Find existing assignments
        const assignments = await tx.treballadorJornadaPlantilla.findMany({
          where: { treballadorId: id }
        });

        if (assignments.length > 0) {
          // Keep it simple: update the first or active assignment or recreate
          // Delete existing assignments for a clean slate
          await tx.treballadorJornadaPlantilla.deleteMany({
            where: { treballadorId: id }
          });
        }

        // Create new assignment
        if (payload && payload.plantillaJornadaId) {
          await tx.treballadorJornadaPlantilla.create({
            data: {
              treballador: { connect: { id: id } },
              plantilla: { connect: { id: payload.plantillaJornadaId } },
              dataInici: new Date(payload.dataInici),
              dataFi: payload.dataFi ? new Date(payload.dataFi) : null,
            },
          });
        }
      }

      // Return updated entity
      return await tx.treballador.findUnique({
        where: { id: id },
        include: {
          serveis: { include: { servei: true } },
          jornadesPlantillaAssignacions: { include: { plantilla: true } },
        }
      });
    });
  }

  async getTreballadors(empresaId: number, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUser },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.rol !== 'ADMIN_GENERAL' && user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots veure els treballadors d\'aquesta empresa');
    }

    return await this.prisma.treballador.findMany({
      where: { empresaId: empresaId },
      include: {
        serveis: { include: { servei: true } },
        jornadesPlantillaAssignacions: { include: { plantilla: true } },
      }
    });
  }

  async remove(empresaId: number, id: number, currentUser: number) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: currentUser },
    });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (user.rol !== 'ADMIN_GENERAL' && user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots eliminar treballadors d\'aquesta empresa');
    }

    const treballador = await this.prisma.treballador.findUnique({
      where: { id: id },
      include: { Usuari: true }
    });

    if (!treballador) {
      throw new NotFoundException('El treballador no existeix');
    }

    if (treballador.Usuari?.rol === 'ADMIN_GENERAL') {
      throw new ForbiddenException('No es pot eliminar un treballador administrador');
    }

    if (treballador.empresaId !== empresaId) {
      throw new ForbiddenException('No pots eliminar un treballador d\'una altra empresa');
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Eliminar relaciones que dependen del trabajador
      await tx.treballadorServei.deleteMany({ where: { treballadorId: id } });
      await tx.treballadorJornadaPlantilla.deleteMany({ where: { treballadorId: id } });
      await tx.jornada.deleteMany({ where: { treballadorId: id } });
      await tx.absencia.deleteMany({ where: { treballadorId: id } });

      // 2. Desvincular de reservas y valoraciones
      await tx.reserva.updateMany({ where: { treballadorId: id }, data: { treballadorId: null } });
      await tx.valoracio.updateMany({ where: { treballadorId: id }, data: { treballadorId: null } });

      // 3. Eliminar el trabajador
      const deletedTreballador = await tx.treballador.delete({
        where: { id: id },
      });

      // 4. Eliminar el usuario enlazado
      await tx.usuari.delete({
        where: { id: deletedTreballador.idUsuari },
      });

      return deletedTreballador;
    });
  }

  async getMyAbsenciesCalendari(user: CurrentUserData, any?: number) {
    const treballador = await this.prisma.treballador.findFirst({
      where: { idUsuari: user.userId },
      select: { id: true, diesVacancesAnuals: true },
    });

    const yearFilter = any
      ? {
          inici: {
            gte: new Date(`${any}-01-01T00:00:00.000Z`),
            lte: new Date(`${any}-12-31T23:59:59.999Z`),
          },
        }
      : {};

    const [treballadorAbsencies, empresaAbsencies] = await Promise.all([
      treballador
        ? this.prisma.absencia.findMany({
            where: { treballadorId: treballador.id, ...yearFilter },
            orderBy: { inici: 'asc' },
          })
        : Promise.resolve([]),
      this.prisma.absenciaEmpresa.findMany({
        where: { empresaId: user.empresaId, ...yearFilter },
        orderBy: { inici: 'asc' },
      }),
    ]);

    const diesVacancesAnuals = treballador?.diesVacancesAnuals ?? 0;

    return {
      treballador: treballadorAbsencies,
      empresa: empresaAbsencies,
      diesVacancesAnuals,
      missatgeDies: diesVacancesAnuals === 0
        ? 'No hi ha dies de vacances assignats per aquest treballador.'
        : null,
    };
  }
}
