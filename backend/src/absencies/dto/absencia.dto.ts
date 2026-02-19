import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAbsenciaDto {
    @ApiProperty({ description: 'ID del treballador' })
    @IsInt()
    treballadorId: number;

    @ApiProperty({ description: 'Data inici de l\'absència' })
    @IsDateString()
    inici: string;

    @ApiProperty({ description: 'Data fi de l\'absència' })
    @IsDateString()
    fi: string;

    @ApiProperty({ description: 'Motiu de l\'absència', required: false })
    @IsOptional()
    @IsString()
    motiu?: string;
}

export class UpdateAbsenciaDto extends PartialType(CreateAbsenciaDto) { }
