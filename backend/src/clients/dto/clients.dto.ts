import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Anna García', description: 'Nom complet del client' })
  @IsNotEmpty({ message: 'El nom és obligatori' })
  @IsString()
  nom: string;

  @ApiPropertyOptional({ example: 'anna@email.com', description: 'Correu electrònic (opcional)' })
  @IsOptional()
  @IsEmail({}, { message: 'El format de l\'email no és vàlid' })
  email?: string;

  @ApiPropertyOptional({ example: '600111222', description: 'Telèfon de contacte (opcional)' })
  @IsOptional()
  @IsString()
  telefon?: string;
}

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'Anna García', description: 'Nom complet del client' })
  @IsOptional()
  @IsNotEmpty({ message: 'El nom no pot estar buit' })
  @IsString()
  nom?: string;

  @ApiPropertyOptional({ example: 'anna@email.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El format de l\'email no és vàlid' })
  email?: string;

  @ApiPropertyOptional({ example: '600111222' })
  @IsOptional()
  @IsString()
  telefon?: string;
}

export class ClientsPaginatsQueryDto {
  @ApiPropertyOptional({ description: 'Número de pàgina (comença en 1)', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Clients per pàgina', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Ordenació: "nom" (defecte) o "concurrencia" (per total de reserves)', enum: ['nom', 'concurrencia'] })
  @IsOptional()
  @IsString()
  @IsIn(['nom', 'concurrencia'])
  orderBy?: 'nom' | 'concurrencia' = 'nom';
}
