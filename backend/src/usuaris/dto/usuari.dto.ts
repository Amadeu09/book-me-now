import { IsEmail, IsString, MinLength, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '@prisma/client';

export class CreateUsuariDto {
  @ApiProperty({ example: 'worker@bookmenow.com', description: 'Email del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Contraseña', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Rol, example: 'TREBALLADOR', description: 'Rol del usuario' })
  @IsEnum(Rol)
  rol: Rol;

  @ApiProperty({ example: 1, description: 'ID de la empresa' })
  @IsNumber()
  empresaId: number;
}

export class UpdateUsuariDto {
  @ApiProperty({ example: 'newemail@bookmenow.com', required: false, description: 'Nuevo email del usuario' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'NewPass123!', required: false, minLength: 6, description: 'Nueva contraseña' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ enum: Rol, example: 'ADMIN_GENERAL', required: false, description: 'Nuevo rol del usuario' })
  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;
}

export class UsuariResponseDto {
  @ApiProperty({ example: 1, description: 'ID del usuario' })
  id: number;

  @ApiProperty({ example: 'worker@bookmenow.com', description: 'Email del usuario' })
  email: string;

  @ApiProperty({ enum: Rol, example: 'TREBALLADOR', description: 'Rol del usuario' })
  rol: Rol;

  @ApiProperty({ example: 1, description: 'ID de la empresa a la que pertenece' })
  empresaId: number;

  @ApiProperty({ example: '2026-03-01T12:00:00.000Z', description: 'Fecha de creación' })
  createdAt: Date;
}
