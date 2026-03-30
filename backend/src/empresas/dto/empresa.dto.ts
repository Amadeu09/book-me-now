import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmpresaDto {
  @ApiProperty({ example: 'Spa Wellness Center', description: 'Nombre de la empresa' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'Madrid, Calle Mayor 45', description: 'Ubicación física' })
  @IsString()
  @IsNotEmpty()
  ubicacio: string;

  @ApiProperty({ example: 30, description: 'Capacidad máxima de clientes/trabajadores', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacitat?: number;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @ApiProperty({ example: 'Somos un salón de belleza premium...', description: 'Descripción de la empresa', required: false })
  @IsOptional()
  @IsString()
  descripcio?: string;

  @ApiProperty({ example: '#FF6A00', description: 'Color primario corporativo (hex)', required: false })
  @IsOptional()
  @IsString()
  colorPrimari?: string;
}

export class UpdateEmpresaDto {
  @ApiProperty({ example: 'Nuevo nombre', required: false, description: 'Nuevo nombre de empresa' })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({ example: 'Nueva ubicación', required: false, description: 'Nueva ubicación' })
  @IsOptional()
  @IsString()
  ubicacio?: string;

  @ApiProperty({ example: 50, required: false, description: 'Nueva capacidad máxima' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacitat?: number;

  @ApiProperty({ example: false, required: false, description: 'Nuevo estado activo/inactivo' })
  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @ApiProperty({ example: 'Somos un salón de belleza premium...', required: false })
  @IsOptional()
  @IsString()
  descripcio?: string;

  @ApiProperty({ example: '#FF6A00', required: false, description: 'Color primario corporativo (hex)' })
  @IsOptional()
  @IsString()
  colorPrimari?: string;
}
