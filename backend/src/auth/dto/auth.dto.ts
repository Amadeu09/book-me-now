import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ example: 'admin@bookmenow.com', description: 'Email del usuario' })
  @IsEmail({}, { message: 'Email invàlid' })
  @IsNotEmpty({ message: 'Email requerit' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Contraseña del usuario', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Contrasenya requerida' })
  password: string;
}

export class SignupUsuariDto {
  @ApiProperty({ example: 'newuser@company.com', description: 'Email del nuevo usuario' })
  @IsEmail({}, { message: 'Email invàlid' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Contraseña (mínimo 6 caracteres)', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contrasenya ha de tenir mínim 6 caràcters' })
  password: string;
}

export class SignupEmpresaDto {
  @ApiProperty({ example: 'Peluquería Bella', description: 'Nombre de la empresa' })
  @IsString()
  @IsNotEmpty({ message: 'Nom de l\'empresa requerit' })
  nom: string;

  @ApiProperty({ example: 'Barcelona, Carrer de Gracia 123', description: 'Ubicación de la empresa' })
  @IsString()
  @IsNotEmpty({ message: 'Ubicació requerida' })
  ubicacio: string;

  @ApiProperty({ example: 20, description: 'Capacidad máxima de clientes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacitat?: number;
}

export class SignupDto {
  @ApiProperty({ type: SignupUsuariDto, description: 'Datos del usuario administrador' })
  @IsNotEmpty()
  usuari: SignupUsuariDto;

  @ApiProperty({ type: SignupEmpresaDto, description: 'Datos de la empresa' })
  @IsNotEmpty()
  empresa: SignupEmpresaDto;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Token JWT para autenticación' })
  token: string;
  
  @ApiProperty({ 
    example: { id: '1', email: 'admin@bookmenow.com', rol: 'ADMIN_GENERAL', empresaId: 1 },
    description: 'Información del usuario autenticado'
  })
  user: {
    id: string;
    email: string;
    rol: Rol;
    empresaId: number;
  };
}

export interface JwtPayload {
  sub: number; // userId
  email: string;
  rol: Rol;
  empresaId: number;
}
