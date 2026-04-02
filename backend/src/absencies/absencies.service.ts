import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EstatAbsencia } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAbsenciaDto, UpdateAbsenciaDto, UpdateEstatAbsenciaDto } from './dto/absencia.dto';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

@Injectable()
export class AbsenciesService {
    constructor(private prisma: PrismaService) { }

    async getPendents(empresaId: number, page: number, rows: number) {
        const skip = (page - 1) * rows;
        const where = {
            estat: EstatAbsencia.PENDENT,
            treballador: { empresaId },
        };

        const [data, total] = await Promise.all([
            this.prisma.absencia.findMany({
                where,
                include: {
                    treballador: {
                        select: {
                            id: true,
                            nom: true,
                            Usuari: { select: { fotoPerfil: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: rows,
            }),
            this.prisma.absencia.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            rows,
            totalPages: Math.ceil(total / rows),
        };
    }

    async create(dto: CreateAbsenciaDto, user: CurrentUserData) {
        const isAdmin = user.rol === 'ADMIN_GENERAL';

        // Resolve treballadorId
        let treballadorId: number;
        if (isAdmin && dto.treballadorId) {
            // Admin crea per un treballador específic
            const t = await this.prisma.treballador.findUnique({ where: { id: dto.treballadorId } });
            if (!t) throw new NotFoundException('Treballador no trobat');
            if (t.empresaId !== user.empresaId) throw new ForbiddenException('El treballador no pertany a la teva empresa');
            treballadorId = t.id;
        } else {
            // Empleat (o admin sense treballadorId) → usa el seu propi registre
            const t = await this.prisma.treballador.findFirst({ where: { idUsuari: user.userId } });
            if (!t) throw new NotFoundException('No s\'ha trobat el teu registre de treballador');
            treballadorId = t.id;
        }

        // Admin → APROVADA directament; empleat → PENDENT
        const estat: EstatAbsencia = isAdmin ? EstatAbsencia.APROVADA : EstatAbsencia.PENDENT;

        return this.prisma.absencia.create({
            data: {
                treballadorId,
                inici: new Date(dto.inici),
                fi: new Date(dto.fi),
                motiu: dto.motiu,
                tipus: dto.tipus,
                estat,
            },
        });
    }

    async update(empresaId: number, absenciaId: number, dto: UpdateAbsenciaDto, currentUserId: number) {
        const user = await this.prisma.usuari.findUnique({ where: { id: currentUserId } });
        if (!user || user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException('Usuari no autoritzat');

        const absencia = await this.prisma.absencia.findUnique({
            where: { id: absenciaId },
            include: { treballador: true },
        });
        if (!absencia) throw new NotFoundException('Absència no trobada');
        if (absencia.treballador.empresaId !== empresaId) throw new ForbiddenException('No pots modificar absències d\'una altra empresa');

        return this.prisma.absencia.update({
            where: { id: absenciaId },
            data: {
                ...(dto.inici && { inici: new Date(dto.inici) }),
                ...(dto.fi && { fi: new Date(dto.fi) }),
                ...(dto.motiu !== undefined && { motiu: dto.motiu }),
            },
        });
    }

    async updateEstat(empresaId: number, absenciaId: number, dto: UpdateEstatAbsenciaDto) {
        const absencia = await this.prisma.absencia.findUnique({
            where: { id: absenciaId },
            include: { treballador: true },
        });
        if (!absencia) throw new NotFoundException('Absència no trobada');
        if (absencia.treballador.empresaId !== empresaId) throw new ForbiddenException('Aquesta absència no pertany a la teva empresa');

        return this.prisma.absencia.update({
            where: { id: absenciaId },
            data: { estat: dto.estat },
        });
    }

    async remove(empresaId: number, absenciaId: number, currentUserId: number) {
        const user = await this.prisma.usuari.findUnique({ where: { id: currentUserId } });
        if (!user || user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException('Usuari no autoritzat');

        const absencia = await this.prisma.absencia.findUnique({
            where: { id: absenciaId },
            include: { treballador: true },
        });
        if (!absencia) throw new NotFoundException('Absència no trobada');
        if (absencia.treballador.empresaId !== empresaId) throw new ForbiddenException('No pots eliminar absències d\'una altra empresa');

        return this.prisma.absencia.delete({ where: { id: absenciaId } });
    }
}
