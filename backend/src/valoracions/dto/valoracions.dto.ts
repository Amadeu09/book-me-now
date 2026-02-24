import { ApiProperty, PartialType } from "@nestjs/swagger";
import { ValoracioTipus } from "@prisma/client";
import { IsInt, IsString, Min, Max, IsEnum, IsNotEmpty, IsOptional } from "class-validator";

export class CreateValoracioDto {
    @ApiProperty({ description: 'ID de la entidad a valorar (Trabajador o Empresa/Sala)', example: 1 })
    @IsInt()
    @Min(1)
    id: number;

    @ApiProperty({ description: 'Puntuación (1-5)', example: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    valoracio: number;

    @ApiProperty({ description: 'Comentario de la valoración', example: 'Excelente servicio' })
    @IsString()
    @IsNotEmpty()
    comentari: string;

    @ApiProperty({ description: 'Tipo de valoración (SALA o TREBALLADOR)', enum: ValoracioTipus, example: ValoracioTipus.TREBALLADOR })
    @IsEnum(ValoracioTipus)
    tipusValoracio: ValoracioTipus;

    @ApiProperty({ description: 'Nombre del cliente (opcional si es anónimo)', example: 'Juan Pérez', required: false })
    @IsString()
    @IsOptional()
    nomClient?: string;

    @ApiProperty({ description: 'ID del servicio valorado', example: 10 })
    @IsInt()
    @Min(1)
    idServeis: number;
}

export class UpdateValoracioDto extends PartialType(CreateValoracioDto) { }