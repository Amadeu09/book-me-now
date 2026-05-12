import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { CreateHorariEmpresaDto, UpdateHorariEmpresaDto } from './dto/horari-empresa.dto';

@Injectable()
export class HorariEmpresaService {
    constructor(private prisma: PrismaService) {}

    private assertAdmin(user: CurrentUserData) {
        if (user.rol !== 'ADMIN_GENERAL') {
            throw new ForbiddenException('Només els administradors poden gestionar l\'horari de l\'empresa');
        }
    }

    private assertSameEmpresa(user: CurrentUserData, empresaId: number) {
        if (user.empresaId !== empresaId) {
            throw new ForbiddenException('No tens permisos per gestionar l\'horari d\'aquesta empresa');
        }
    }

    async findAll(empresaId: number, user: CurrentUserData) {
        this.assertSameEmpresa(user, empresaId);
        return this.prisma.horariEmpresa.findMany({
            where: { empresaId },
            orderBy: [{ dow: 'asc' }, { iniciMin: 'asc' }],
        });
    }

    async create(empresaId: number, dto: CreateHorariEmpresaDto, user: CurrentUserData) {
        this.assertAdmin(user);
        this.assertSameEmpresa(user, empresaId);

        if (dto.iniciMin >= dto.fiMin) {
            throw new BadRequestException('L\'hora d\'inici ha de ser anterior a l\'hora de fi');
        }

        return this.prisma.horariEmpresa.create({
            data: { empresaId, dow: dto.dow, iniciMin: dto.iniciMin, fiMin: dto.fiMin },
        });
    }

    async update(empresaId: number, id: number, dto: UpdateHorariEmpresaDto, user: CurrentUserData) {
        this.assertAdmin(user);
        this.assertSameEmpresa(user, empresaId);

        if (dto.iniciMin >= dto.fiMin) {
            throw new BadRequestException('L\'hora d\'inici ha de ser anterior a l\'hora de fi');
        }

        const horari = await this.prisma.horariEmpresa.findUnique({ where: { id } });
        if (!horari) throw new NotFoundException('Tram horari no trobat');
        if (horari.empresaId !== empresaId) throw new ForbiddenException('No tens permisos per modificar aquest tram');

        return this.prisma.horariEmpresa.update({
            where: { id },
            data: { iniciMin: dto.iniciMin, fiMin: dto.fiMin },
        });
    }

    async findPublic(empresaId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [horaris, absencies] = await Promise.all([
            this.prisma.horariEmpresa.findMany({
                where: { empresaId },
                orderBy: [{ dow: 'asc' }, { iniciMin: 'asc' }],
            }),
            this.prisma.absenciaEmpresa.findMany({
                where: { empresaId, fi: { gte: today } },
                orderBy: { inici: 'asc' },
            }),
        ]);

        return { horaris, absencies };
    }

    async remove(empresaId: number, id: number, user: CurrentUserData) {
        this.assertAdmin(user);
        this.assertSameEmpresa(user, empresaId);

        const horari = await this.prisma.horariEmpresa.findUnique({ where: { id } });
        if (!horari) throw new NotFoundException('Tram horari no trobat');
        if (horari.empresaId !== empresaId) throw new ForbiddenException('No tens permisos per eliminar aquest tram');

        return this.prisma.horariEmpresa.delete({ where: { id } });
    }
}
