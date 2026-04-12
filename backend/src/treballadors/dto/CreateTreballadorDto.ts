import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested, IsArray, IsDateString } from 'class-validator';
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/** `dataFi`, if present, must be strictly after `dataInici` */
function IsAfter(property: string, validationOptions?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: 'isAfter',
            target: (object as any).constructor,
            propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedProp] = args.constraints;
                    const relatedValue = (args.object as any)[relatedProp];
                    if (!value || !relatedValue) return true; // optional — skip if either missing
                    return new Date(value) > new Date(relatedValue);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} ha de ser posterior a ${args.constraints[0]}`;
                },
            },
        });
    };
}
import { AssignarServeisDto } from './AssignarServeisDto';

export class JornadaTreballadorDto {

    @ApiProperty({ example: 10, description: 'ID de la plantilla de jornada' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    plantillaJornadaId: number;

    @ApiProperty({ example: '2026-02-07T09:00:00.000Z', description: 'Fecha de inicio de la asignación' })
    @IsDateString()
    @IsNotEmpty()
    dataInici: string;

    @ApiProperty({ example: '2026-12-31T18:00:00.000Z', description: 'Fecha de fin de la asignación (opcional)', required: false })
    @IsDateString()
    @IsAfter('dataInici', { message: 'dataFi ha de ser posterior a dataInici' })
    @IsOptional()
    dataFi?: string;
}

export class CreateTreballadorDto {
    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del trabajador' })
    @IsString()
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ example: 123, description: 'ID del usuario existente a vincular' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    idUsuari: number;

    @ApiProperty({ type: () => JornadaTreballadorDto, required: false, description: 'Datos de la jornada inicial (opcional)' })
    @ValidateNested()
    @Type(() => JornadaTreballadorDto)
    @IsOptional()
    jornadaTreballador?: JornadaTreballadorDto;

    @ApiProperty({ example: [1, 2, 3], required: false, description: 'Lista de IDs de servicios iniciales a asignar (opcional)' })
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    serveisIds?: number[];
}

export class CreateJornadaTreballadorExistDto {
    @ApiProperty({ example: 123, description: 'ID del trabajador existente a vincular' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    treballadorId: number;

    @ApiProperty({ example: 10, description: 'ID de la plantilla de jornada' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    plantillaJornadaId: number;

    @ApiProperty({ example: '2026-02-07T09:00:00.000Z', description: 'Fecha de inicio de la asignación' })
    @IsDateString()
    @IsNotEmpty()
    dataInici: string;

    @ApiProperty({ example: '2026-12-31T18:00:00.000Z', description: 'Fecha de fin de la asignación (opcional)', required: false })
    @IsDateString()
    @IsAfter('dataInici', { message: 'dataFi ha de ser posterior a dataInici' })
    @IsOptional()
    dataFi?: string;
}