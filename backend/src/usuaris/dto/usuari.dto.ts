import { IsEmail, IsString, MinLength, IsEnum, IsNumber, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '@prisma/client';

export class CreateUsuariDto {
  @ApiProperty({ example: 'worker@bookmenow.com', description: 'Email del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Contraseña (mínimo 8 caracteres, majúscula, número i especial)', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contrasenya ha de tenir mínim 8 caràcters' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'La contrasenya ha de contenir almenys una majúscula, un número i un caràcter especial',
  })
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

  @ApiProperty({ example: 'NewPass123!', required: false, minLength: 8, description: 'Nueva contraseña (mínimo 8 caracteres, majúscula, número i especial)' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contrasenya ha de tenir mínim 8 caràcters' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'La contrasenya ha de contenir almenys una majúscula, un número i un caràcter especial',
  })
  password?: string;
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

  @ApiProperty({ example: 'https://res.cloudinary.com/...', required: false, nullable: true, description: 'URL de la foto de perfil' })
  fotoPerfil: string | null;

  @ApiProperty({ example: '2026-03-01T12:00:00.000Z', description: 'Fecha de creación' })
  createdAt: Date;
}
