import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, Min, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessType } from '@prisma/client';

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

  @ApiProperty({ enum: BusinessType, example: BusinessType.PERRUQUERIA, description: 'Tipus de negoci', required: false })
  @IsOptional()
  @IsEnum(BusinessType)
  tipo?: BusinessType;

  @ApiProperty({ example: 14, description: 'Dies d\'antelació màxima per fer reserves', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  diasAntesReserva?: number;
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

  @ApiProperty({ enum: BusinessType, example: BusinessType.PERRUQUERIA, description: 'Tipus de negoci', required: false })
  @IsOptional()
  @IsEnum(BusinessType)
  tipo?: BusinessType;

  @ApiProperty({ example: 14, required: false, description: 'Dies d\'antelació màxima per fer reserves' })
  @IsOptional()
  @IsInt()
  @Min(1)
  diasAntesReserva?: number;
}
