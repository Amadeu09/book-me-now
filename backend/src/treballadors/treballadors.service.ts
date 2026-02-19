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
        OR: [
          { fi: { gte: today } },
          { inici: { lte: endDate } },
        ],
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

      const rotacio = plantilla.rotacions.find(r => r.index === rotationIndex);
      if (!rotacio) {
        console.log(`No rotation found for ${dateString} index ${rotationIndex}`);
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

      // Filter reserves for this day
      const dayReserves = reserves.filter(r => {
        const rDate = new Date(r.dataHora);
        return rDate.getDate() === currentDate.getDate() &&
          rDate.getMonth() === currentDate.getMonth() &&
          rDate.getFullYear() === currentDate.getFullYear();
      });

      // Filter absencies for this day
      const dayAbsencies = absencies.filter(a => {
        // Simple overlap check
        return (a.inici <= new Date(currentDate.setHours(23, 59, 59, 999))) && (a.fi >= new Date(currentDate.setHours(0, 0, 0, 0)));
      });

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

          // Check reserves
          for (const res of dayReserves) {
            const resStart = new Date(res.dataHora);
            const resEnd = new Date(resStart.getTime() + res.servei.duradaMin * MS_PER_MIN);

            // Overlap: (StartA < EndB) && (EndA > StartB)
            if (slotStartDate < resEnd && slotEndDate > resStart) {
              isBlocked = true;
              // Optimization: Jump currentMin to end of reservation
              const resEndMin = resEnd.getHours() * 60 + resEnd.getMinutes();
              // But we are in a tight loop. Let's just break for now or jump.
              // Jumping is better for tight packing.
              // currentMin = resEndMin; // be careful with date crossover
              break;
            }
          }

          if (isBlocked) {
            // If blocked, just increment by standard step? 
            // Or jump?
            // If we are tight packing (08:00, 08:30...), if 08:00 is blocked, we try next minute? 
            // User prompt: "Basicamente cada dia vendra representado como: ... hora 1: 7 - 8:30"
            // Implies we return valid intervals.
            // The simplest robust way is to step 1 minute? Too slow.
            // Step 15 mins?
            // Or "tight tiling" as proposed in plan (contiguous if empty).
            // If blocked, we skip 15 mins or jump to end of blocker?

            // BETTER APPROACH:
            // 1. Create a "Free Time" timeline for the day [TramStart, TramEnd].
            // 2. Subtract all blockers (Reserves, Absences).
            // 3. In the remaining chunks, fit the service duration.

            currentMin += 15; // Granularity step?
            continue;
          }

          // Check absences
          for (const abs of dayAbsencies) {
            if (slotStartDate < abs.fi && slotEndDate > abs.inici) {
              isBlocked = true;
              break;
            }
          }

          if (!isBlocked) {
            slots.push(`${String(Math.floor(slotStartMin / 60)).padStart(2, '0')}:${String(slotStartMin % 60).padStart(2, '0')} - ${String(Math.floor(slotEndMin / 60)).padStart(2, '0')}:${String(slotEndMin % 60).padStart(2, '0')}`);
            // If found valid slot, jump by duration (tight packing)?
            currentMin += servei.duradaMin;
          } else {
            currentMin += 15; // Try slightly later
          }
        }
      }

      disponibilitat[dateString] = slots;
    }

    return disponibilitat;
  }
}
