import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { CreateAbsenciaEmpresaDto, UpdateAbsenciaEmpresaDto } from './dto/absencia-empresa.dto';

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

        return this.prisma.absenciaEmpresa.findMany({
            where,
            orderBy: { inici: 'asc' },
        });
    }

    async create(empresaId: number, dto: CreateAbsenciaEmpresaDto, user: CurrentUserData) {
        this.assertSameEmpresa(user, empresaId);

        const inici = new Date(dto.inici);
        const fi = dto.fi ? new Date(dto.fi) : new Date(dto.inici);

        return this.prisma.absenciaEmpresa.create({
            data: {
                empresaId,
                titol: dto.titol,
                inici,
                fi,
                tipus: dto.tipus,
            },
        });
    }

    async update(empresaId: number, id: number, dto: UpdateAbsenciaEmpresaDto, user: CurrentUserData) {
        this.assertSameEmpresa(user, empresaId);

        const absencia = await this.prisma.absenciaEmpresa.findUnique({ where: { id } });
        if (!absencia) throw new NotFoundException('Absència d\'empresa no trobada');
        if (absencia.empresaId !== empresaId) throw new ForbiddenException('No tens permisos per modificar aquesta absència');

        return this.prisma.absenciaEmpresa.update({
            where: { id },
            data: {
                ...(dto.titol !== undefined && { titol: dto.titol }),
                ...(dto.inici && { inici: new Date(dto.inici) }),
                ...(dto.fi && { fi: new Date(dto.fi) }),
                ...(dto.tipus && { tipus: dto.tipus }),
            },
        });
    }

    async remove(empresaId: number, id: number, user: CurrentUserData) {
        this.assertSameEmpresa(user, empresaId);

        const absencia = await this.prisma.absenciaEmpresa.findUnique({ where: { id } });
        if (!absencia) throw new NotFoundException('Absència d\'empresa no trobada');
        if (absencia.empresaId !== empresaId) throw new ForbiddenException('No tens permisos per eliminar aquesta absència');

        return this.prisma.absenciaEmpresa.delete({ where: { id } });
    }
}
