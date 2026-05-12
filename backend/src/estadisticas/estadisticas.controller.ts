import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EstadisticasDetallQueryDto, EstadisticasQueryDto } from './dto/estadisticas.dto';

@ApiTags('estadisticas')
@ApiBearerAuth('JWT-auth')
@Controller('estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstadisticasController {
    constructor(private readonly estadisticasService: EstadisticasService) { }

    @Get('detall')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Serveis i treballadors més concorreguts per un mes concret' })
    @ApiQuery({ name: 'year', required: true, type: Number, example: 2026 })
    @ApiQuery({ name: 'mes', required: true, type: Number, description: 'Mes (1-12)', example: 4 })
    @ApiResponse({ status: 200, description: 'Detall retornat correctament' })
    @ApiResponse({ status: 403, description: 'Sense permisos' })
    getDetall(
        @Query() query: EstadisticasDetallQueryDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.estadisticasService.getDetall(user, query);
    }

    @Get('resum')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Resum estadístic de l\'empresa: visites, no-shows i ingressos per mes' })
    @ApiQuery({ name: 'mesVisites', required: false, type: Number, description: 'Mesos d\'historial per a visites (defecte: 6, màx: 24)', example: 6 })
    @ApiQuery({ name: 'mesNoShow', required: false, type: Number, description: 'Mesos d\'historial per a no-shows (defecte: 6, màx: 24)', example: 6 })
    @ApiResponse({ status: 200, description: 'Resum retornat correctament' })
    @ApiResponse({ status: 403, description: 'Sense permisos' })
    getResum(
        @Query() query: EstadisticasQueryDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.estadisticasService.getResum(user, query);
    }
}
