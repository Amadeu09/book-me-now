import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TipusAbsenciaEmpresa } from '@prisma/client';

export class CreateAbsenciaEmpresaDto {
    @ApiProperty({ description: 'Títol de l\'absència (p.ex. "Sant Joan", "Pont Constitució")', example: 'Dia del Treballador' })
    @IsString()
    @MinLength(1)
    titol: string;

    @ApiProperty({ description: 'Data d\'inici', example: '2025-05-01' })
    @IsDateString()
    inici: string;

    @ApiProperty({
        description: 'Data de fi (opcional — si no s\'indica, s\'assumeix el mateix dia que inici)',
        example: '2025-05-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    fi?: string;

    @ApiProperty({ enum: TipusAbsenciaEmpresa, description: 'Tipus d\'absència d\'empresa', example: TipusAbsenciaEmpresa.FESTA_ESTATAL })
    @IsEnum(TipusAbsenciaEmpresa)
    tipus: TipusAbsenciaEmpresa;
}

export class UpdateAbsenciaEmpresaDto extends PartialType(CreateAbsenciaEmpresaDto) {}
