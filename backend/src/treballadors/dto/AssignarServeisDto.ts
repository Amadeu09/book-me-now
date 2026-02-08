import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class AssignarServeisDto {
    @ApiProperty({ example: 1, description: 'ID del trabajador' })
    @IsInt()
    @IsNotEmpty()
    treballadorId: number;

    @ApiProperty({ example: [1, 2, 3], description: 'Array de IDs de los servicios a asignar' })
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    serveisIds: number[];
}
