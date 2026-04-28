import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class EstadisticasQueryDto {
    @ApiPropertyOptional({ description: 'Mesos d\'historial per a visites', default: 6, minimum: 1, maximum: 24 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(24)
    mesVisites?: number = 6;

    @ApiPropertyOptional({ description: 'Mesos d\'historial per a no-shows', default: 6, minimum: 1, maximum: 24 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(24)
    mesNoShow?: number = 6;
}

export class EstadisticasDetallQueryDto {
    @ApiProperty({ description: 'Any (ex. 2026)', example: 2026 })
    @Type(() => Number)
    @IsInt()
    @Min(2020)
    @Max(2100)
    year: number;

    @ApiProperty({ description: 'Mes (1-12)', example: 4 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    mes: number;
}
