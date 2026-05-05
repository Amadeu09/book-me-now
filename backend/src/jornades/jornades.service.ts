import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJornadaPlantillaDto } from './dto/jornada-plantilla.dto';
import { UpdateJornadaPlantillaDto } from './dto/update-jornada-plantilla.dto';
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

    async getJornadesPaginadas(
        empresaId: number,
        userEmpresaId: number,
        userRol: Rol,
        page: number = 1,
        rows: number = 2,
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

        const skip = (page - 1) * rows;
        const total = await this.prisma.jornadaPlantilla.count({ where: { empresaId } });
        
        const data = await this.prisma.jornadaPlantilla.findMany({
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

    async update(
        empresaId: number,
        id: number,
        dto: UpdateJornadaPlantillaDto,
        userEmpresaId: number,
        userRol: Rol,
    ) {
        // 1. Verificar permisos
        if (userRol !== 'ADMIN_GENERAL' && empresaId !== userEmpresaId) {
            throw new ForbiddenException('No tens permís per editar jornades en aquesta empresa');
        }

        // 2. Verificar que la plantilla existeix
        const plantillaActual = await this.prisma.jornadaPlantilla.findUnique({
            where: { id, empresaId },
        });

        if (!plantillaActual) {
            throw new NotFoundException('Plantilla no trobada o no pertany a aquesta empresa');
        }

        // 3. Actualitzar estructura
        const updatedPlantilla = await this.prisma.$transaction(async (tx) => {
            // Eliminar rotacions anteriors (en cascada eliminarà dies i trams per schema normalment, o ho fem explícit)
            // Assumint que onDelete: Cascade està configurat per Rotacions -> Dies -> Trams (si no, cal eliminar manualment endins cap a enfora)
            // A l'schema està: jornadaPlantilla   JornadaPlantilla @relation(fields: [plantillaId], references: [id], onDelete: Cascade)
            if (dto.rotacions) {
                const currentRotations = await tx.jornadaRotacio.findMany({
                    where: { plantillaId: id },
                    select: { id: true },
                });
                
                const rotationIds = currentRotations.map(r => r.id);

                if (rotationIds.length > 0) {
                    await tx.jornadaTram.deleteMany({
                        where: { dia: { rotacioId: { in: rotationIds } } }
                    });

                    await tx.jornadaDiaRotacio.deleteMany({
                        where: { rotacioId: { in: rotationIds } }
                    });

                    await tx.jornadaRotacio.deleteMany({
                        where: { plantillaId: id },
                    });
                }
            }

            // Actualitzar la plantilla
            return await tx.jornadaPlantilla.update({
                where: { id },
                data: {
                    nom: dto.nom !== undefined ? dto.nom : undefined,
                    activa: dto.activa !== undefined ? dto.activa : undefined,
                    rotacions: dto.rotacions ? {
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
                    } : undefined,
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
        });

        this.logger.log(`JornadaPlantilla updated: ${updatedPlantilla.id}`);
        return updatedPlantilla;
    }

    async remove(
        empresaId: number,
        id: number,
        userEmpresaId: number,
        userRol: Rol,
    ) {
        // 1. Verificar permisos
        if (userRol !== 'ADMIN_GENERAL' && empresaId !== userEmpresaId) {
            throw new ForbiddenException('No tens permís per eliminar jornades en aquesta empresa');
        }

        // 2. Verificar que la plantilla existeix i pertany a l'empresa
        const plantilla = await this.prisma.jornadaPlantilla.findUnique({
            where: { id, empresaId },
        });

        if (!plantilla) {
            throw new NotFoundException('Plantilla no trobada o no pertany a aquesta empresa');
        }

        // 3. Comprovar que no hi hagi treballadors assignats
        const assignmentsCount = await this.prisma.treballador.count({
            where: { plantillaId: id }
        });

        if (assignmentsCount > 0) {
            throw new ForbiddenException({
                statusCode: 409,
                message: 'No es pot eliminar la plantilla perquè té treballadors assignats',
            });
        }

        // 4. Eliminar en cascada manualmente
        await this.prisma.$transaction(async (tx) => {
            const rotacions = await tx.jornadaRotacio.findMany({ where: { plantillaId: id } });
            const rotationIds = rotacions.map(r => r.id);
            
            if (rotationIds.length > 0) {
                await tx.jornadaTram.deleteMany({ where: { dia: { rotacioId: { in: rotationIds } } } });
                await tx.jornadaDiaRotacio.deleteMany({ where: { rotacioId: { in: rotationIds } } });
                await tx.jornadaRotacio.deleteMany({ where: { plantillaId: id } });
            }
            await tx.jornadaPlantilla.delete({ where: { id } });
        });

        this.logger.log(`JornadaPlantilla deleted: ${id}`);
        return { message: 'Plantilla eliminada exitosament' };
    }
}
