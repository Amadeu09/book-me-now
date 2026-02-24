import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TipusAbsencia } from '@prisma/client';

export class CreateAbsenciaDto {
    @ApiProperty({ description: 'ID del trabajador' })
    @IsInt()
    treballadorId: number;

    @ApiProperty({ description: 'Fecha inicio de la ausencia', example: '2026-03-01' })
    @IsDateString()
    inici: string;

    @ApiProperty({ description: 'Fecha fin de la ausencia', example: '2026-03-05' })
    @IsDateString()
    fi: string;

    @ApiProperty({ enum: TipusAbsencia, description: 'Tipo de ausencia', example: TipusAbsencia.VACANCES })
    @IsEnum(TipusAbsencia)
    tipus: TipusAbsencia;

    @ApiProperty({ description: 'Motivo de la ausencia', required: false, example: 'Gripe' })
    @IsOptional()
    @IsString()
    motiu?: string;
}

export class UpdateAbsenciaDto extends PartialType(CreateAbsenciaDto) { }
