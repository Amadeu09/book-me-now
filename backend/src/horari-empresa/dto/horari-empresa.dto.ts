import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHorariEmpresaDto {
    @ApiProperty({ example: 0, description: 'Dia de la setmana: 0=Dilluns … 6=Diumenge' })
    @IsInt()
    @Min(0)
    @Max(6)
    dow: number;

    @ApiProperty({ example: 540, description: 'Inici en minuts des de 00:00 (ex: 540 = 09:00)' })
    @IsInt()
    @Min(0)
    @Max(1439)
    iniciMin: number;

    @ApiProperty({ example: 840, description: 'Fi en minuts des de 00:00 (ex: 840 = 14:00)' })
    @IsInt()
    @Min(1)
    @Max(1440)
    fiMin: number;
}

export class UpdateHorariEmpresaDto {
    @ApiProperty({ example: 540 })
    @IsInt()
    @Min(0)
    @Max(1439)
    iniciMin: number;

    @ApiProperty({ example: 840 })
    @IsInt()
    @Min(1)
    @Max(1440)
    fiMin: number;
}
