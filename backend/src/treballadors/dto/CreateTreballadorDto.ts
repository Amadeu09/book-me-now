import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class JornadaTreballadorDto {

    @ApiProperty({ example: 10, description: 'ID de la plantilla de jornada' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    plantillaJornadaId: number;

    @ApiProperty({ example: '2026-02-07T09:00:00.000Z', description: 'Fecha de inicio de la asignación' })
    @IsString()
    @IsNotEmpty()
    dataInici: string;

    @ApiProperty({ example: '2026-02-07T18:00:00.000Z', description: 'Fecha de fin de la asignación (opcional)', required: false })
    @IsString()
    @IsOptional()
    dataFi?: string;
}

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

    @ApiProperty({ type: () => JornadaTreballadorDto, required: false, description: 'Datos de la jornada inicial (opcional)' })
    @ValidateNested()
    @Type(() => JornadaTreballadorDto)
    @IsOptional()
    jornadaTreballador?: JornadaTreballadorDto;
}

export class CreateJornadaTreballadorExistDto {
    @ApiProperty({ example: 123, description: 'ID del trabajador existente a vincular' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    treballadorId: number;

    @ApiProperty({ example: 10, description: 'ID de la plantilla de jornada' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    plantillaJornadaId: number;

    @ApiProperty({ example: '2026-02-07T09:00:00.000Z', description: 'Fecha de inicio de la asignación' })
    @IsString()
    @IsNotEmpty()
    dataInici: string;

    @ApiProperty({ example: '2026-02-07T18:00:00.000Z', description: 'Fecha de fin de la asignación (opcional)', required: false })
    @IsString()
    @IsOptional()
    dataFi?: string;
}