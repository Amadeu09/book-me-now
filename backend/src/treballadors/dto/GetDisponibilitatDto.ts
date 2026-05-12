import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty } from "class-validator";

export class GetDisponibilitatDto {
    @ApiProperty({ example: 10, description: 'ID del servicio a reservar' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    serveiId: number;
}