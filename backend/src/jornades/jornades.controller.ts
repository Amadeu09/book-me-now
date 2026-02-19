import {
    Controller,
    Post,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
    Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JornadesService } from './jornades.service';
import { CreateJornadaPlantillaDto } from './dto/jornada-plantilla.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('jornades')
@ApiBearerAuth('JWT-auth')
@Controller('empreses/:empresaId/jornades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JornadesController {
    constructor(private readonly jornadasService: JornadesService) { }

    @Post()
    @Roles('ADMIN_GENERAL', 'EMPLEAT')
    @ApiOperation({ summary: 'Crear plantilla de jornada' })
    @ApiParam({ name: 'empresaId' })
    @ApiResponse({ status: 201, description: 'Plantilla de jornada creada' })
    @ApiResponse({ status: 403, description: 'Prohibit: No tens permís per crear jornades en aquesta empresa' })
    @ApiResponse({ status: 404, description: 'No trobada: L\'empresa no existeix' })
    create(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Body() createJornadaDto: CreateJornadaPlantillaDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.jornadasService.create(empresaId, createJornadaDto, user.empresaId, user.rol);
    }


    @Get()
    @Roles('ADMIN_GENERAL', 'EMPLEAT')
    @ApiOperation({ summary: 'Llistar plantilles de jornada' })
    @ApiParam({ name: 'empresaId' })
    @ApiResponse({ status: 200, description: 'Llista de plantilles' })
    @ApiResponse({ status: 403, description: 'Prohibit: No tens permís per veure jornades d\'aquesta empresa' })
    @ApiResponse({ status: 404, description: 'No trobada: L\'empresa no existeix' })
    findAll(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.jornadasService.findAll(empresaId, user.empresaId, user.rol);
    }
}
