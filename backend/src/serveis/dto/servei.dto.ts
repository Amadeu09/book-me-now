import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateServeiDto {
  @ApiProperty({ example: 'Corte de cabello' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 45, description: 'Duración en minutos' })
  @IsInt()
  @IsPositive()
  duradaMin: number;

  @ApiProperty({ example: 25.5, description: 'Precio' })
  @IsNumber()
  @Min(0)
  preu: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  actiu?: boolean;
}

export class UpdateServeiDto {
  @ApiPropertyOptional({ example: 'Corte + lavado' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nom?: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  duradaMin?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preu?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  actiu?: boolean;
}
