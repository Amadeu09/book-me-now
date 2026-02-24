import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateServeiDto {
  @ApiProperty({ example: 'Corte de cabello', description: 'Nombre del servicio' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 45, description: 'Duración en minutos' })
  @IsInt()
  @IsPositive()
  duradaMin: number;

  @ApiProperty({ example: 25.5, description: 'Precio del servicio' })
  @IsNumber()
  @Min(0)
  preu: number;

  @ApiPropertyOptional({ example: true, description: 'Si el servicio está activo' })
  @IsOptional()
  @IsBoolean()
  actiu?: boolean;
}

export class UpdateServeiDto {
  @ApiPropertyOptional({ example: 'Corte + lavado', description: 'Nombre del servicio' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nom?: string;

  @ApiPropertyOptional({ example: 60, description: 'Duración en minutos' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  duradaMin?: number;

  @ApiPropertyOptional({ example: 30, description: 'Precio del servicio' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preu?: number;

  @ApiPropertyOptional({ example: false, description: 'Si el servicio está activo' })
  @IsOptional()
  @IsBoolean()
  actiu?: boolean;
}
