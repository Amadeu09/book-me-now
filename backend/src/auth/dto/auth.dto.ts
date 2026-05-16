import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsNumber, IsInt, Min, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ example: 'admin@bookmenow.com', description: 'Email del usuario' })
  @IsEmail({}, { message: 'Email invàlid' })
  @IsNotEmpty({ message: 'Email requerit' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Contraseña del usuario', minLength: 8 })
  @IsString()
  @IsNotEmpty({ message: 'Contrasenya requerida' })
  @MinLength(8, { message: 'La contrasenya ha de tenir mínim 8 caràcters' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'La contrasenya ha de contenir almenys una majúscula, un número i un caràcter especial',
  })
  password: string;
}

export class SignupUsuariDto {
  @ApiProperty({ example: 'newuser@company.com', description: 'Email del nuevo usuario' })
  @IsEmail({}, { message: 'Email invàlid' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Contraseña (mínimo 8 caracteres, majúscula, número i especial)', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contrasenya ha de tenir mínim 8 caràcters' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'La contrasenya ha de contenir almenys una majúscula, un número i un caràcter especial',
  })
  password: string;

  @ApiProperty({ example: '#FF6A00', required: false, description: 'Color primario del usuario (hex)' })
  @IsOptional()
  @IsString()
  colorPrimari?: string;
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

  @ApiProperty({ example: 'Somos un salón de belleza premium...', required: false })
  @IsOptional()
  @IsString()
  descripcio?: string;

  @ApiProperty({ example: 14, description: 'Dies d\'antelació màxima per fer reserves', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  diasAntesReserva?: number;

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
    fotoPerfil?: string;
    nom?: string;
    colorPrimari?: string;
    idioma?: string;
    empresa?: {
      id: number;
      nom: string;
      ubicacio: string;
      capacitat: number | null;
      fotoPerfil?: string;
      bannerUrl?: string;
      descripcio?: string;
    };
  };
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Contrasenya actual del usuari' })
  @IsString()
  @IsNotEmpty({ message: 'La contrasenya actual és obligatòria' })
  currentPassword: string;

  @ApiProperty({ description: 'Nova contrasenya (mínim 8, majúscula, número i especial)', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La nova contrasenya ha de tenir mínim 8 caràcters' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'La nova contrasenya ha de contenir almenys una majúscula, un número i un caràcter especial',
  })
  newPassword: string;
}

export class UpdateIdiomaDto {
  @ApiProperty({ example: 'ca', enum: ['ca', 'es'], description: 'Idioma de la interfície' })
  @IsString()
  @IsNotEmpty()
  idioma: 'ca' | 'es';
}

export class UpdateColorDto {
  @ApiProperty({ example: '#FF6A00', required: false, nullable: true, description: 'Color primario del usuario (hex) o null per eliminar' })
  @IsOptional()
  @IsString()
  colorPrimari?: string | null;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@bookmenow.com', description: 'Email del compte' })
  @IsEmail({}, { message: 'Email invàlid' })
  @IsNotEmpty({ message: 'Email requerit' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de restabliment rebut per correu' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Nova contrasenya (mínim 8, majúscula, número i especial)', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La nova contrasenya ha de tenir mínim 8 caràcters' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'La nova contrasenya ha de contenir almenys una majúscula, un número i un caràcter especial',
  })
  newPassword: string;
}

export interface JwtPayload {
  sub: number; // userId
  email: string;
  rol: Rol;
  empresaId: number;
}
