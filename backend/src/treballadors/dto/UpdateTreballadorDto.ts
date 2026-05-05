import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateIf, IsArray, Min, Max } from 'class-validator';

export class UpdateTreballadorDto {
    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del trabajador', required: false })
    @IsString()
    @IsOptional()
    nom?: string;

    @ApiProperty({ example: 10, required: false, nullable: true, description: 'ID de la plantilla de jornada. null per desassignar.' })
    @IsOptional()
    @ValidateIf((o) => o.plantillaId !== null)
    @IsInt()
    @Type(() => Number)
    plantillaId?: number | null;

    @ApiProperty({ example: [1, 2, 3], required: false, description: 'Lista de IDs de servicios a asignar (opcional)' })
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    serveisIds?: number[];

    @ApiProperty({ example: 25, required: false, description: 'Dies de vacances anuals assignats al treballador' })
    @IsInt()
    @Min(0)
    @Max(365)
    @IsOptional()
    diesVacancesAnuals?: number;
}
