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
    @ApiProperty({ description: 'Minuts des de 00:00 per l\'inici del tram', example: 480 })
    @IsInt()
    @Min(0)
    iniciMin: number;

    @ApiProperty({ description: 'Minuts des de 00:00 pel final del tram', example: 720 })
    @IsInt()
    @Min(0)
    fiMin: number;
}

export class CreateJornadaDiaRotacioDto {
    @ApiProperty({ description: 'Dia de la setmana (1=Dilluns, ... 7=Diumenge)', example: 1 })
    @IsInt()
    @Min(1)
    dow: number;

    @ApiProperty({ description: 'Indica si és dia de descans', example: false })
    @IsBoolean()
    esDescans: boolean;

    @ApiProperty({ type: [CreateJornadaTramDto], description: 'Llistat de trams horaris' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateJornadaTramDto)
    trams: CreateJornadaTramDto[];
}

export class CreateJornadaRotacioDto {
    @ApiProperty({ description: 'Índex de la rotació (0, 1, ...)', example: 0 })
    @IsInt()
    @Min(0)
    index: number;

    @ApiProperty({ description: 'Nom de la rotació', example: 'Setmana A' })
    @IsString()
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ type: [CreateJornadaDiaRotacioDto], description: 'Dies de la rotació' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateJornadaDiaRotacioDto)
    dies: CreateJornadaDiaRotacioDto[];
}

export class CreateJornadaPlantillaDto {
    @ApiProperty({ description: 'ID de l\'empresa', example: 10 })
    @IsInt()
    empresaId: number;

    @ApiProperty({ description: 'Nom de la plantilla', example: 'Jornada matí/tarda' })
    @IsString()
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ description: 'Si la plantilla està activa', example: true })
    @IsBoolean()
    @IsOptional()
    activa?: boolean;

    @ApiProperty({ type: [CreateJornadaRotacioDto], description: 'Llistat de rotacions' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateJornadaRotacioDto)
    rotacions: CreateJornadaRotacioDto[];
}
