import { PartialType } from '@nestjs/swagger';
import { CreateJornadaPlantillaDto } from './jornada-plantilla.dto';

export class UpdateJornadaPlantillaDto extends PartialType(CreateJornadaPlantillaDto) {}
