import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAbsenciaDto, UpdateAbsenciaDto } from './dto/absencia.dto';

@Injectable()
export class AbsenciesService {
    constructor(private prisma: PrismaService) { }

    async create(empresaId: number, dto: CreateAbsenciaDto, currentUser: number) {
        const user = await this.prisma.usuari.findUnique({ where: { id: currentUser } });
        if (!user || user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException('Usuari no autoritzat');

        const treballador = await this.prisma.treballador.findUnique({ where: { id: dto.treballadorId } });
        if (!treballador) throw new NotFoundException('Treballador no trobat');
        if (treballador.empresaId !== empresaId) throw new ForbiddenException('No pots assignar absències a un treballador d\'una altra empresa');

        return await this.prisma.absencia.create({
            data: {
                treballadorId: dto.treballadorId,
                inici: new Date(dto.inici),
                fi: new Date(dto.fi),
                motiu: dto.motiu,
                tipus: dto.tipus,
            },
        });
    }

    async update(empresaId: number, absenciaId: number, dto: UpdateAbsenciaDto, currentUser: number) {
        const user = await this.prisma.usuari.findUnique({ where: { id: currentUser } });
        if (!user || user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException('Usuari no autoritzat');

        const absencia = await this.prisma.absencia.findUnique({ where: { id: absenciaId }, include: { treballador: true } });
        if (!absencia) throw new NotFoundException('Absència no trobada');
        if (absencia.treballador.empresaId !== empresaId) throw new ForbiddenException('No pots modificar absències d\'una altra empresa');

        return await this.prisma.absencia.update({
            where: { id: absenciaId },
            data: {
                ...(dto.inici && { inici: new Date(dto.inici) }),
                ...(dto.fi && { fi: new Date(dto.fi) }),
                ...(dto.motiu !== undefined && { motiu: dto.motiu }),
            },
        });
    }

    async remove(empresaId: number, absenciaId: number, currentUser: number) {
        const user = await this.prisma.usuari.findUnique({ where: { id: currentUser } });
        if (!user || user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException('Usuari no autoritzat');

        const absencia = await this.prisma.absencia.findUnique({ where: { id: absenciaId }, include: { treballador: true } });
        if (!absencia) throw new NotFoundException('Absència no trobada');
        if (absencia.treballador.empresaId !== empresaId) throw new ForbiddenException('No pots eliminar absències d\'una altra empresa');

        return await this.prisma.absencia.delete({ where: { id: absenciaId } });
    }
}
