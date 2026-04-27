import { ApiProperty, PartialType } from "@nestjs/swagger";
import { ValoracioTipus } from "@prisma/client";
import { IsInt, IsString, Min, Max, IsEnum, IsNotEmpty, IsOptional, IsNumber, IsPositive } from "class-validator";

export class CreateValoracioDto {
    @ApiProperty({ description: 'ID de la entidad a valorar (Trabajador o Empresa/Sala)', example: 1 })
    @IsInt()
    @Min(1)
    id: number;

    @ApiProperty({ description: 'Puntuación (1-5)', example: 5 })
    @IsNumber({ maxDecimalPlaces: 1 })
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

export class CreateValoracioByTokenDto {
    @ApiProperty({ description: 'Puntuació empresa (1–5, mitges permeses)', example: 4.5 })
    @IsNumber({ maxDecimalPlaces: 1 })
    @Min(1)
    @Max(5)
    puntuacioEmpresa: number;

    @ApiProperty({ description: 'Comentari sobre l\'empresa' })
    @IsString()
    @IsNotEmpty()
    comentariEmpresa: string;

    @ApiProperty({ description: 'Puntuació treballador (1–5, mitges permeses)', example: 5, required: false })
    @IsNumber({ maxDecimalPlaces: 1 })
    @Min(1)
    @Max(5)
    @IsOptional()
    puntuacioTreballador?: number;

    @ApiProperty({ description: 'Comentari sobre el treballador', required: false })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    comentariTreballador?: string;
}
