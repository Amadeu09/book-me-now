import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested, IsArray } from 'class-validator';
import { JornadaTreballadorDto } from './CreateTreballadorDto';

export class UpdateTreballadorDto {
    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del trabajador', required: false })
    @IsString()
    @IsOptional()
    nom?: string;

    @ApiProperty({ type: () => JornadaTreballadorDto, required: false, description: 'Datos de la jornada a actualizar (opcional)' })
    @ValidateNested()
    @Type(() => JornadaTreballadorDto)
    @IsOptional()
    jornadaTreballador?: JornadaTreballadorDto;

    @ApiProperty({ example: [1, 2, 3], required: false, description: 'Lista de IDs de servicios a asignar (opcional)' })
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    serveisIds?: number[];
}
