import { IsEmail, IsString, MinLength, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '@prisma/client';

export class CreateUsuariDto {
  @ApiProperty({ example: 'worker@bookmenow.com', description: 'Email del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan', description: 'Nom del usuario' })
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
  @ApiProperty({ example: 'newemail@bookmenow.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'NewPass123!', required: false, minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ enum: Rol, example: 'ADMIN_GENERAL', required: false })
  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;
}

export class UsuariResponseDto {
  id: number;
  email: string;
  rol: Rol;
  empresaId: number;
  createdAt: Date;
}
