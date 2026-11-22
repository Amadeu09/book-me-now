import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { CreateAbsenciaEmpresaDto, UpdateAbsenciaEmpresaDto } from './dto/absencia-empresa.dto';

/** Últim instant del dia de la data indicada (les dates de tancament són dies sencers). */
function finalDelDia(d: Date): Date {
    const f = new Date(d);
    f.setHours(23, 59, 59, 999);
    return f;
}

@Injectable()
export class AbsenciesEmpresaService {
    constructor(private prisma: PrismaService) {}

    private assertSameEmpresa(user: CurrentUserData, empresaId: number) {
        if (user.empresaId !== empresaId) {
            throw new ForbiddenException('No tens permisos per gestionar absències d\'aquesta empresa');
        }
    }

    async findAll(empresaId: number, user: CurrentUserData, any?: number) {
        this.assertSameEmpresa(user, empresaId);

        const where: any = { empresaId };

        if (any) {
            where.inici = {
                gte: new Date(`${any}-01-01`),
                lte: new Date(`${any}-12-31`),
            };
        }

        const absencies = await this.prisma.absenciaEmpresa.findMany({
            where,
            orderBy: { inici: 'asc' },
        });
        return this.ambReservesAfectades(empresaId, absencies);
    }

    /**
     * Afegeix a cada tancament futur quantes cites actives (pendents o confirmades)
     * hi ha reservades dins del període, per poder avisar el negoci.
     */
    private async ambReservesAfectades<T extends { inici: Date; fi: Date }>(empresaId: number, absencies: T[]) {
        const ara = new Date();
        const futures = absencies.filter(a => finalDelDia(a.fi) >= ara);
        if (futures.length === 0) return absencies.map(a => ({ ...a, reservesAfectades: 0 }));

        const desDe = new Date(Math.max(ara.getTime(), Math.min(...futures.map(a => a.inici.getTime()))));
        const finsA = new Date(Math.max(...futures.map(a => finalDelDia(a.fi).getTime())));
        const reserves = await this.prisma.reserva.findMany({
            where: {
                empresaId,
                estat: { in: ['PENDENT', 'CONFIRMADA'] },
                dataHora: { gte: desDe, lte: finsA },
            },
            select: { dataHora: true },
        });

        return absencies.map(a => {
            const inici = Math.max(a.inici.getTime(), ara.getTime());
            const fi = finalDelDia(a.fi).getTime();
            const reservesAfectades = reserves.filter(r => {
                const t = r.dataHora.getTime();
                return t >= inici && t <= fi;
            }).length;
            return { ...a, reservesAfectades };
        });
    }

    async create(empresaId: number, dto: CreateAbsenciaEmpresaDto, user: CurrentUserData) {
        this.assertSameEmpresa(user, empresaId);

        const inici = new Date(dto.inici);
        const fi = dto.fi ? new Date(dto.fi) : new Date(dto.inici);

        const creada = await this.prisma.absenciaEmpresa.create({
            data: {
                empresaId,
                titol: dto.titol,
                inici,
                fi,
                tipus: dto.tipus,
            },
        });
        const [ambReserves] = await this.ambReservesAfectades(empresaId, [creada]);
        return ambReserves;
    }

    async update(empresaId: number, id: number, dto: UpdateAbsenciaEmpresaDto, user: CurrentUserData) {
        this.assertSameEmpresa(user, empresaId);

        const absencia = await this.prisma.absenciaEmpresa.findUnique({ where: { id } });
        if (!absencia) throw new NotFoundException('Absència d\'empresa no trobada');
        if (absencia.empresaId !== empresaId) throw new ForbiddenException('No tens permisos per modificar aquesta absència');

        const actualitzada = await this.prisma.absenciaEmpresa.update({
            where: { id },
            data: {
                ...(dto.titol !== undefined && { titol: dto.titol }),
                ...(dto.inici && { inici: new Date(dto.inici) }),
                ...(dto.fi && { fi: new Date(dto.fi) }),
                ...(dto.tipus && { tipus: dto.tipus }),
            },
        });
        const [ambReserves] = await this.ambReservesAfectades(empresaId, [actualitzada]);
        return ambReserves;
    }

    async remove(empresaId: number, id: number, user: CurrentUserData) {
        this.assertSameEmpresa(user, empresaId);

        const absencia = await this.prisma.absenciaEmpresa.findUnique({ where: { id } });
        if (!absencia) throw new NotFoundException('Absència d\'empresa no trobada');
        if (absencia.empresaId !== empresaId) throw new ForbiddenException('No tens permisos per eliminar aquesta absència');

        return this.prisma.absenciaEmpresa.delete({ where: { id } });
    }
}
