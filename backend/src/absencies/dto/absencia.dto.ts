import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TipusAbsencia, EstatAbsencia } from '@prisma/client';

export class CreateAbsenciaDto {
    @ApiProperty({ description: 'ID del trabajador (opcional per EMPLEAT, usa el seu propi)', required: false })
    @IsInt()
    @IsOptional()
    treballadorId?: number;

    @ApiProperty({ description: 'Data inici de l\'absència', example: '2026-06-01' })
    @IsDateString()
    inici: string;

    @ApiProperty({ description: 'Data fi de l\'absència', example: '2026-06-07' })
    @IsDateString()
    fi: string;

    @ApiProperty({ enum: TipusAbsencia, description: 'Tipus d\'absència', example: TipusAbsencia.VACANCES })
    @IsEnum(TipusAbsencia)
    tipus: TipusAbsencia;

    @ApiProperty({ description: 'Motiu de l\'absència', required: false, example: 'Vacances d\'estiu' })
    @IsOptional()
    @IsString()
    motiu?: string;
}

export class UpdateAbsenciaDto extends PartialType(CreateAbsenciaDto) { }

export class UpdateEstatAbsenciaDto {
    @ApiProperty({ enum: EstatAbsencia, description: 'Nou estat de la sol·licitud', example: EstatAbsencia.APROVADA })
    @IsEnum(EstatAbsencia)
    estat: EstatAbsencia;
}
