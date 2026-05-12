import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJornadaTramDto {
    @ApiProperty({ description: 'Minutos desde 00:00 para el inicio del tramo', example: 480 })
    @IsInt()
    @Min(0)
    iniciMin: number;

    @ApiProperty({ description: 'Minutos desde 00:00 para el final del tramo', example: 720 })
    @IsInt()
    @Min(0)
    fiMin: number;
}

export class CreateJornadaDiaRotacioDto {
    @ApiProperty({ description: 'Día de la semana (1=Lunes, ... 7=Domingo)', example: 1 })
    @IsInt()
    @Min(1)
    dow: number;

    @ApiProperty({ description: 'Indica si es día de descanso', example: false })
    @IsBoolean()
    esDescans: boolean;

    @ApiProperty({ type: [CreateJornadaTramDto], description: 'Listado de tramos horarios' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateJornadaTramDto)
    trams: CreateJornadaTramDto[];
}

export class CreateJornadaRotacioDto {
    @ApiProperty({ description: 'Índice de la rotación (0, 1, ...)', example: 0 })
    @IsInt()
    @Min(0)
    index: number;

    @ApiProperty({ description: 'Nombre de la rotación', example: 'Semana A' })
    @IsString()
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ type: [CreateJornadaDiaRotacioDto], description: 'Días de la rotación' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateJornadaDiaRotacioDto)
    dies: CreateJornadaDiaRotacioDto[];
}

export class CreateJornadaPlantillaDto {
    @ApiProperty({ description: 'ID de la empresa', example: 10 })
    @IsInt()
    empresaId: number;

    @ApiProperty({ description: 'Nombre de la plantilla', example: 'Jornada mañana/tarde' })
    @IsString()
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ description: 'Si la plantilla está activa', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    activa?: boolean;

    @ApiProperty({ type: [CreateJornadaRotacioDto], description: 'Listado de rotaciones' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateJornadaRotacioDto)
    rotacions: CreateJornadaRotacioDto[];
}
