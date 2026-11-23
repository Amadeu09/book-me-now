import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SuperAdminLoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) password: string;
}

export class SuperAdminRecuperarDto {
  @ApiProperty() @IsEmail() email: string;
}

export class SuperAdminContrasenyaDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) token: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12, { message: 'La contrasenya ha de tenir com a mínim 12 caràcters' })
  @MaxLength(200)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: 'La contrasenya ha de tenir majúscules, minúscules i números' })
  password: string;
}

export class CrearInvitacioDto {
  @ApiPropertyOptional({ description: "Si s'indica, només aquest email podrà fer servir la invitació" })
  @IsOptional() @IsEmail() email?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) nomEmpresa?: string;

  @ApiPropertyOptional({ default: 7, minimum: 1, maximum: 30 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(30) dies?: number;

  @ApiPropertyOptional({ description: "Enviar l'enllaç per email (cal email)" })
  @IsOptional() @IsBoolean() enviarEmail?: boolean;
}

export class EstatEmpresaDto {
  @ApiProperty() @IsBoolean() activa: boolean;
}
