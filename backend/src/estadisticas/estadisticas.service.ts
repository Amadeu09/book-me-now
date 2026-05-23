import { ForbiddenException, Injectable } from '@nestjs/common';
import { ReservaEstat } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { EstadisticasDetallQueryDto, EstadisticasQueryDto } from './dto/estadisticas.dto';

const MESOS_CA = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre',
];

@Injectable()
export class EstadisticasService {
    constructor(private prisma: PrismaService) { }

    async getResum(user: CurrentUserData, query: EstadisticasQueryDto) {
        if (user.rol !== 'ADMIN_GENERAL') {
            throw new ForbiddenException('Només els administradors poden veure les estadístiques');
        }

        const { empresaId } = user;
        const now = new Date();
        const nVisites = query.mesVisites ?? 6;
        const nNoShow = query.mesNoShow ?? 6;

        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const visitesStart = new Date(now.getFullYear(), now.getMonth() - nVisites + 1, 1);
        const noShowStart = new Date(now.getFullYear(), now.getMonth() - nNoShow + 1, 1);

        const [visitesRaw, noShowsRaw, ingressosActuals, ingressosPassats, valoracioAgg] = await Promise.all([
            this.prisma.reserva.findMany({
                where: { empresaId, estat: ReservaEstat.CONFIRMADA, dataHora: { gte: visitesStart } },
                select: { dataHora: true },
            }),
            this.prisma.reserva.findMany({
                where: { empresaId, estat: ReservaEstat.NO_SHOW, dataHora: { gte: noShowStart } },
                select: { dataHora: true },
            }),
            this.prisma.reserva.findMany({
                where: { empresaId, estat: ReservaEstat.CONFIRMADA, dataHora: { gte: currentMonthStart, lt: nextMonthStart } },
                select: { servei: { select: { preu: true } } },
            }),
            this.prisma.reserva.findMany({
                where: { empresaId, estat: ReservaEstat.CONFIRMADA, dataHora: { gte: prevMonthStart, lt: currentMonthStart } },
                select: { servei: { select: { preu: true } } },
            }),
            this.prisma.valoracio.aggregate({
                where: { empresaId, treballadorId: null },
                _avg: { puntuacio: true },
                _count: { puntuacio: true },
            }),
        ]);

        const reservesMes = this.buildMonthMap(nVisites, now);
        for (const r of visitesRaw) {
            const key = this.monthKey(r.dataHora);
            if (reservesMes[key]) reservesMes[key].total++;
        }

        const noShowsMes = this.buildMonthMap(nNoShow, now);
        for (const r of noShowsRaw) {
            const key = this.monthKey(r.dataHora);
            if (noShowsMes[key]) noShowsMes[key].total++;
        }

        const valoracioMitjana = valoracioAgg._count.puntuacio > 0
            ? Math.round((valoracioAgg._avg.puntuacio ?? 0) * 10) / 10
            : null;

        return {
            reservesMes,
            noShowsMes,
            ingresosMes: {
                mesActual: this.sumPreu(ingressosActuals),
                mesPassat: this.sumPreu(ingressosPassats),
            },
            valoracioMitjana,
        };
    }

    async getDetall(user: CurrentUserData, query: EstadisticasDetallQueryDto) {
        if (user.rol !== 'ADMIN_GENERAL') {
            throw new ForbiddenException('Només els administradors poden veure les estadístiques');
        }

        const { year, mes } = query;
        const startDate = new Date(year, mes - 1, 1);
        const endDate = new Date(year, mes, 1);

        const [confirmades, noShows] = await Promise.all([
            this.prisma.reserva.findMany({
                where: { empresaId: user.empresaId, estat: ReservaEstat.CONFIRMADA, dataHora: { gte: startDate, lt: endDate } },
                select: {
                    serveiId: true,
                    treballadorId: true,
                    servei: { select: { nom: true, preu: true } },
                    treballador: { select: { nom: true } },
                },
            }),
            this.prisma.reserva.findMany({
                where: { empresaId: user.empresaId, estat: ReservaEstat.NO_SHOW, dataHora: { gte: startDate, lt: endDate } },
                select: { treballadorId: true },
            }),
        ]);

        const serveiMap = new Map<number, { nom: string; reserves: number; ingressos: number }>();
        for (const r of confirmades) {
            const prev = serveiMap.get(r.serveiId) ?? { nom: r.servei.nom, reserves: 0, ingressos: 0 };
            serveiMap.set(r.serveiId, { nom: prev.nom, reserves: prev.reserves + 1, ingressos: prev.ingressos + Number(r.servei.preu) });
        }

        const treballadorMap = new Map<number, { nom: string; reserves: number; ingressos: number; noShows: number }>();
        for (const r of confirmades) {
            if (!r.treballadorId || !r.treballador) continue;
            const prev = treballadorMap.get(r.treballadorId) ?? { nom: r.treballador.nom, reserves: 0, ingressos: 0, noShows: 0 };
            treballadorMap.set(r.treballadorId, { nom: prev.nom, reserves: prev.reserves + 1, ingressos: prev.ingressos + Number(r.servei.preu), noShows: prev.noShows });
        }
        for (const r of noShows) {
            if (!r.treballadorId) continue;
            const prev = treballadorMap.get(r.treballadorId);
            if (prev) treballadorMap.set(r.treballadorId, { ...prev, noShows: prev.noShows + 1 });
        }

        const round2 = (n: number) => Math.round(n * 100) / 100;

        return {
            mes: `${MESOS_CA[mes - 1]} ${year}`,
            serveisDestacats: [...serveiMap.entries()]
                .map(([id, v]) => ({ id, nom: v.nom, reserves: v.reserves, ingressos: round2(v.ingressos) }))
                .sort((a, b) => b.reserves - a.reserves)
                .slice(0, 5),
            treballadorsDestacats: [...treballadorMap.entries()]
                .map(([id, v]) => ({ id, nom: v.nom, reserves: v.reserves, ingressos: round2(v.ingressos), noShows: v.noShows }))
                .sort((a, b) => b.reserves - a.reserves)
                .slice(0, 5),
        };
    }

    private monthKey(date: Date): string {
        return `${MESOS_CA[date.getMonth()]} ${date.getFullYear()}`;
    }

    private buildMonthMap(n: number, now: Date): Record<string, { total: number }> {
        const result: Record<string, { total: number }> = {};
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            result[this.monthKey(d)] = { total: 0 };
        }
        return result;
    }

    private sumPreu(records: { servei: { preu: any } }[]): number {
        const sum = records.reduce((acc, r) => acc + Number(r.servei.preu), 0);
        return Math.round(sum * 100) / 100;
    }
}
