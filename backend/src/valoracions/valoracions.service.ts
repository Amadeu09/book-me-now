import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateValoracioDto, CreateValoracioByTokenDto, PaginacioValoracionsDto, UpdateValoracioDto } from './dto/valoracions.dto';
import { ValoracioTipus } from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

@Injectable()
export class ValoracionsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateValoracioDto, user: CurrentUserData) {
        let empresaId: number;
        let treballadorId: number | null = null;

        if (dto.tipusValoracio === ValoracioTipus.TREBALLADOR) {
            const treballador = await this.prisma.treballador.findUnique({
                where: { id: dto.id },
            });
            if (!treballador) throw new NotFoundException('Trabajador no encontrado');
            empresaId = treballador.empresaId;
            treballadorId = treballador.id;
        } else {
            const empresa = await this.prisma.empresa.findUnique({
                where: { id: dto.id },
            });
            if (!empresa) throw new NotFoundException('Empresa/Sala no encontrada');
            empresaId = empresa.id;
        }

        if (empresaId !== user.empresaId) {
            throw new ForbiddenException('Access denied');
        }

        return this.prisma.valoracio.create({
            data: {
                empresaId,
                treballadorId,
                tipus: dto.tipusValoracio,
                puntuacio: dto.valoracio,
                comentari: dto.comentari,
                nomClient: dto.nomClient,
                serveiId: dto.idServeis,
            },
        });
    }

    async getInfoByToken(token: string) {
        const reserva = await this.prisma.reserva.findUnique({
            where: { tokenValoracio: token },
            include: {
                empresa: { select: { id: true, nom: true, fotoPerfil: true } },
                treballador: { include: { Usuari: { select: { fotoPerfil: true } } } },
                servei: { select: { nom: true } },
            },
        });

        if (!reserva) throw new NotFoundException('Enllaç de valoració no vàlid');

        const jaValorada = reserva.tokenValoracioUsat;

        return {
            empresa: reserva.empresa,
            treballador: reserva.treballador
                ? { id: reserva.treballador.id, nom: reserva.treballador.nom, fotoPerfil: reserva.treballador.Usuari.fotoPerfil }
                : null,
            servei: reserva.servei,
            dataHora: reserva.dataHora,
            jaValorada,
        };
    }

    async createByToken(token: string, dto: CreateValoracioByTokenDto) {
        const reserva = await this.prisma.reserva.findUnique({
            where: { tokenValoracio: token },
            include: { treballador: true },
        });

        if (!reserva) throw new NotFoundException('Enllaç de valoració no vàlid');
        if (reserva.tokenValoracioUsat) throw new ConflictException('Aquesta cita ja ha estat valorada');
        if (reserva.dataHora > new Date()) throw new BadRequestException('Encara no pots valorar una cita que no ha passat');

        if (reserva.treballadorId && (dto.puntuacioTreballador === undefined || !dto.comentariTreballador)) {
            throw new BadRequestException('Cal valorar també el treballador');
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.valoracio.create({
                data: {
                    empresaId: reserva.empresaId,
                    tipus: ValoracioTipus.SALA,
                    puntuacio: dto.puntuacioEmpresa,
                    comentari: dto.comentariEmpresa,
                    clientId: reserva.clientId,
                    nomClient: reserva.clientNom,
                    serveiId: reserva.serveiId,
                    reservaId: reserva.id,
                },
            });

            if (reserva.treballadorId && dto.puntuacioTreballador !== undefined && dto.comentariTreballador) {
                await tx.valoracio.create({
                    data: {
                        empresaId: reserva.empresaId,
                        treballadorId: reserva.treballadorId,
                        tipus: ValoracioTipus.TREBALLADOR,
                        puntuacio: dto.puntuacioTreballador,
                        comentari: dto.comentariTreballador,
                        clientId: reserva.clientId,
                        nomClient: reserva.clientNom,
                        serveiId: reserva.serveiId,
                        reservaId: reserva.id,
                    },
                });
            }

            await tx.reserva.update({
                where: { id: reserva.id },
                data: { tokenValoracioUsat: true },
            });
        });

        return { ok: true };
    }

    async getValoracionsEmpresa(user: CurrentUserData, query: PaginacioValoracionsDto) {
        if (user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException();
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const where = { empresaId: user.empresaId, treballadorId: null };

        const [data, total, agg] = await Promise.all([
            this.prisma.valoracio.findMany({
                where,
                skip,
                take: limit,
                orderBy: { dataValoracio: 'desc' },
                select: {
                    id: true,
                    puntuacio: true,
                    comentari: true,
                    nomClient: true,
                    dataValoracio: true,
                    servei: { select: { nom: true } },
                },
            }),
            this.prisma.valoracio.count({ where }),
            this.prisma.valoracio.aggregate({ where, _avg: { puntuacio: true }, _count: { puntuacio: true } }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            mitjanaTotal: agg._count.puntuacio > 0 ? Math.round((agg._avg.puntuacio ?? 0) * 10) / 10 : null,
        };
    }

    async getValoraciónsTreballador(user: CurrentUserData, treballadorId: number, query: PaginacioValoracionsDto) {
        if (user.rol !== 'ADMIN_GENERAL') throw new ForbiddenException();
        const treballador = await this.prisma.treballador.findUnique({ where: { id: treballadorId } });
        if (!treballador || treballador.empresaId !== user.empresaId) throw new NotFoundException('Treballador no trobat');

        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const where = { treballadorId };

        const [data, total, agg] = await Promise.all([
            this.prisma.valoracio.findMany({
                where,
                skip,
                take: limit,
                orderBy: { dataValoracio: 'desc' },
                select: {
                    id: true,
                    puntuacio: true,
                    comentari: true,
                    nomClient: true,
                    dataValoracio: true,
                    servei: { select: { nom: true } },
                },
            }),
            this.prisma.valoracio.count({ where }),
            this.prisma.valoracio.aggregate({ where, _avg: { puntuacio: true }, _count: { puntuacio: true } }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            mitjanaTotal: agg._count.puntuacio > 0 ? Math.round((agg._avg.puntuacio ?? 0) * 10) / 10 : null,
        };
    }

    findAll(user: CurrentUserData) {
        return this.prisma.valoracio.findMany({
            where: { empresaId: user.empresaId },
            include: {
                empresa: true,
                treballador: true,
                servei: true,
            },
        });
    }

    async findOne(id: number) {
        const valoracio = await this.prisma.valoracio.findUnique({
            where: { id },
            include: {
                empresa: true,
                treballador: true,
                servei: true,
            }
        });
        if (!valoracio) throw new NotFoundException('Valoración no encontrada');
        return valoracio;
    }

    async update(id: number, dto: UpdateValoracioDto) {
        const exists = await this.prisma.valoracio.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Valoración no encontrada');

        return this.prisma.valoracio.update({
            where: { id },
            data: {
                puntuacio: dto.valoracio,
                comentari: dto.comentari,
                nomClient: dto.nomClient,
            },
        });
    }

    async remove(id: number) {
        const exists = await this.prisma.valoracio.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Valoración no encontrada');
        return this.prisma.valoracio.delete({ where: { id } });
    }
}
