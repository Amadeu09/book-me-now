import { IsNotEmpty, IsString, IsNumber, IsOptional, IsInt, IsEnum } from "class-validator";
import { ReservaEstat } from "@prisma/client";

export class CreateReservaDto {
    @IsNotEmpty()
    @IsString()
    nom: string;

    @IsNotEmpty()
    @IsString()
    cognoms: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    telefon: string;

    @IsNotEmpty()
    @IsString()
    data: string;

    @IsNotEmpty()
    @IsString()
    hora: string;

    @IsString()
    @IsOptional()
    observacions?: string;

    @IsNotEmpty()
    @IsNumber()
    idServei: number;

    @IsNotEmpty()
    @IsNumber()
    idTreballador: number;
}

export class UpdateReservaEstatDto {
    @IsNotEmpty()
    @IsInt()
    idReserva: number;

    @IsNotEmpty()
    @IsEnum(ReservaEstat)
    nouEstat: ReservaEstat;
}