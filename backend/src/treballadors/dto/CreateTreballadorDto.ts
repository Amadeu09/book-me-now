import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsArray, Min } from 'class-validator';

export class CreateTreballadorDto {
    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del trabajador' })
    @IsString()
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ example: 123, description: 'ID del usuario existente a vincular' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    idUsuari: number;

    @ApiProperty({ example: 30, required: false, description: 'Dies de vacances anuals (per defecte 25)' })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsOptional()
    diesVacancesAnuals?: number;

    @ApiProperty({ example: 10, required: false, description: 'ID de la plantilla de jornada a assignar (opcional)' })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    plantillaId?: number;

    @ApiProperty({ example: [1, 2, 3], required: false, description: 'Lista de IDs de servicios iniciales a asignar (opcional)' })
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    serveisIds?: number[];
}
