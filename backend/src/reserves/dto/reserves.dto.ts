import { IsNotEmpty, IsString, IsNumber, IsOptional, IsInt, IsEnum, Matches, IsEmail } from "class-validator";
import { ReservaEstat } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateReservaDto {
    @ApiProperty({ example: 'Martí', description: 'Nombre del cliente' })
    @IsNotEmpty()
    @IsString()
    nom: string;

    @ApiPropertyOptional({ example: 'Garcia', description: 'Apellidos del cliente (opcional, no s\'emmagatzema)' })
    @IsOptional()
    @IsString()
    cognoms?: string;

    @ApiPropertyOptional({ example: 'marti@email.com', description: 'Email del cliente' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: '666777888', description: 'Teléfono de contacto' })
    @IsOptional()
    @IsString()
    telefon?: string;

    @ApiProperty({ example: '2026-02-20', description: 'Fecha de la reserva (YYYY-MM-DD)' })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'data must be in YYYY-MM-DD format' })
    data: string;

    @ApiProperty({ example: '10:00', description: 'Hora de la reserva (HH:MM)' })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'hora must be in HH:MM format' })
    hora: string;

    @ApiPropertyOptional({ example: 'Alergia al tinte', description: 'Observaciones adicionales' })
    @IsString()
    @IsOptional()
    observacions?: string;

    @ApiProperty({ example: 1, description: 'ID del servicio reservado' })
    @IsNotEmpty()
    @IsNumber()
    idServei: number;

    @ApiProperty({ example: 5, description: 'ID del trabajador seleccionado' })
    @IsNotEmpty()
    @IsNumber()
    idTreballador: number;
}

export class ModificarReservaGestioDto {
    @ApiProperty({ example: '2026-02-20', description: 'Nova data (YYYY-MM-DD)' })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'data must be in YYYY-MM-DD format' })
    data: string;

    @ApiProperty({ example: '10:00', description: 'Nova hora (HH:MM)' })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'hora must be in HH:MM format' })
    hora: string;
}

export class UpdateReservaEstatDto {
    @ApiProperty({ example: 100, description: 'ID de la reserva' })
    @IsNotEmpty()
    @IsInt()
    idReserva: number;

    @ApiProperty({ example: 'CONFIRMED', enum: ReservaEstat, description: 'Nuevo estado de la reserva' })
    @IsNotEmpty()
    @IsEnum(ReservaEstat)
    nouEstat: ReservaEstat;
}

export class ReservaResponseDto {
    @ApiProperty({ example: 1, description: 'ID de la reserva' })
    id: number;

    @ApiProperty({ example: '2026-02-20T10:00:00.000Z', description: 'Fecha y hora de la reserva' })
    dataHora: Date;

    @ApiProperty({ enum: ReservaEstat, example: 'PENDENT', description: 'Estado actual' })
    estat: ReservaEstat;

    @ApiProperty({ example: 1, description: 'ID de la empresa' })
    empresaId: number;

    @ApiProperty({ example: 5, description: 'ID del trabajador asignado', required: false })
    treballadorId?: number;

    @ApiProperty({ example: 1, description: 'ID del servicio reservado' })
    serveiId: number;
}