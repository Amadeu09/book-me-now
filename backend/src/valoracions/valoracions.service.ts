import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateValoracioDto, UpdateValoracioDto } from './dto/valoracions.dto';
import { ValoracioTipus } from '@prisma/client';

@Injectable()
export class ValoracionsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateValoracioDto) {
        // Logic to distinguish between Sala (Empresa) and Treballador
        // Assuming 'id' in DTO refers to:
        // - treballadorId if tipusValoracio is TREBALLADOR
        // - empresaId if tipusValoracio is SALA

        // Also need to get empresaId for the valuation itself.
        // If valuing a worker, the valuation belongs to the worker's company.
        // If valuing a Sala (Company), it belongs to that company.

        let empresaId: number;
        let treballadorId: number | null = null;
        let clientId: number | null = null; // Assuming anonymous or string-based for now as per schema update

        if (dto.tipusValoracio === ValoracioTipus.TREBALLADOR) {
            const treballador = await this.prisma.treballador.findUnique({
                where: { id: dto.id },
            });
            if (!treballador) throw new NotFoundException('Trabajador no encontrado');
            empresaId = treballador.empresaId;
            treballadorId = treballador.id;
        } else {
            // SALA case - assumes dto.id is EmpresaId
            const empresa = await this.prisma.empresa.findUnique({
                where: { id: dto.id },
            });
            if (!empresa) throw new NotFoundException('Empresa/Sala no encontrada');
            empresaId = empresa.id;
        }

        return this.prisma.valoracio.create({
            data: {
                empresaId,
                treballadorId, // null if SALA
                tipus: dto.tipusValoracio,
                puntuacio: dto.valoracio,
                comentari: dto.comentari,
                nomClient: dto.nomClient,
                serveiId: dto.idServeis,
                // clientId: null, // intentionally left null or managed if needed
            },
        });
    }

    findAll() {
        return this.prisma.valoracio.findMany({
            include: {
                empresa: true, // Optional: include details
                treballador: true,
                servei: true
            }
        });
    }

    async findOne(id: number) {
        const valoracio = await this.prisma.valoracio.findUnique({
            where: { id },
            include: {
                empresa: true,
                treballador: true,
                servei: true
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
                // tipus cannot easily be changed without re-validating entities, assuming static
            },
        });
    }

    async remove(id: number) {
        const exists = await this.prisma.valoracio.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Valoración no encontrada');
        return this.prisma.valoracio.delete({ where: { id } });
    }
}
