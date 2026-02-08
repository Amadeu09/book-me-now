import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJornadaPlantillaDto } from './dto/jornada-plantilla.dto';
import { Rol } from '@prisma/client';

@Injectable()
export class JornadesService {
    private readonly logger = new Logger(JornadesService.name);

    constructor(private prisma: PrismaService) { }

    async create(
        empresaId: number,
        dto: CreateJornadaPlantillaDto,
        userEmpresaId: number,
        userRol: Rol,
    ) {
        // 1. Verificar permisos: si no es ADMIN_GENERAL, ha de ser de la mateixa empresa
        if (userRol !== 'ADMIN_GENERAL' && empresaId !== userEmpresaId) {
            throw new ForbiddenException('No tens permís per crear jornades en aquesta empresa');
        }

        if (empresaId !== userEmpresaId) {
            throw new ForbiddenException('No ets part de l\'empresa');
        }
        // 2. Verificar que l'empresa existeix
        const empresa = await this.prisma.empresa.findUnique({
            where: { id: empresaId },
        });
        if (!empresa) {
            throw new NotFoundException('Empresa no trobada');
        }

        // 3. Crear l'estructura completa de la plantilla
        // Prisma permet nested writes molt potents
        const plantilla = await this.prisma.jornadaPlantilla.create({
            data: {
                empresaId,
                nom: dto.nom,
                activa: dto.activa ?? true,
                rotacions: {
                    create: dto.rotacions.map((rot) => ({
                        index: rot.index,
                        nom: rot.nom,
                        dies: {
                            create: rot.dies.map((dia) => ({
                                dow: dia.dow,
                                esDescans: dia.esDescans,
                                trams: {
                                    create: dia.trams.map((tram) => ({
                                        iniciMin: tram.iniciMin,
                                        fiMin: tram.fiMin,
                                    })),
                                },
                            })),
                        },
                    })),
                },
            },
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
        });

        this.logger.log(`JornadaPlantilla created: ${plantilla.id} for Empresa: ${empresaId}`);
        return plantilla;
    }

    async findAll(
        empresaId: number,
        userEmpresaId: number,
        userRol: Rol,
    ) {
        // 1. Verificar permisos
        if (userRol !== 'ADMIN_GENERAL' && empresaId !== userEmpresaId) {
            throw new ForbiddenException('No tens permís per veure jornades d\'aquesta empresa');
        }

        // 2. Verificar que l'empresa existeix
        const empresa = await this.prisma.empresa.findUnique({
            where: { id: empresaId },
        });
        if (!empresa) {
            throw new NotFoundException('Empresa no trobada');
        }

        // 3. Buscar totes les plantilles de l'empresa
        const plantilles = await this.prisma.jornadaPlantilla.findMany({
            where: { empresaId },
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
            orderBy: {
                nom: 'asc',
            },
        });

        return plantilles;
    }
}
