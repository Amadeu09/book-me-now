import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AbsenciesService } from './absencies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAbsenciaDto, UpdateAbsenciaDto, UpdateEstatAbsenciaDto } from './dto/absencia.dto';

@ApiTags('absencies')
@Controller('absencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbsenciesController {
    constructor(private readonly absenciesService: AbsenciesService) { }

    @Get('pendents')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Llista paginada d\'absències pendents d\'aprovació (ADMIN_GENERAL)' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Pàgina (per defecte 1)' })
    @ApiQuery({ name: 'rows', required: false, type: Number, description: 'Files per pàgina (per defecte 4)' })
    @ApiResponse({ status: 200, description: 'Llista paginada retornada correctament' })
    @ApiResponse({ status: 403, description: 'No autoritzat' })
    getPendents(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('rows', new DefaultValuePipe(4), ParseIntPipe) rows: number,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.absenciesService.getPendents(user.empresaId, page, rows);
    }

    @Get('treballador/:treballadorId/vacances-resum')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Resum de vacances aprovades d\'un treballador (ADMIN_GENERAL)' })
    @ApiParam({ name: 'treballadorId', type: Number })
    @ApiResponse({ status: 200, description: '{ diesVacancesAnuals, vacancesUsed }' })
    @ApiResponse({ status: 403, description: 'Treballador d\'una altra empresa' })
    @ApiResponse({ status: 404, description: 'Treballador no trobat' })
    getVacancesResum(
        @Param('treballadorId', ParseIntPipe) treballadorId: number,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.absenciesService.getVacancesResumTreballador(treballadorId, user.empresaId);
    }

    @Get('treballador/:treballadorId/absencies-calendari')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Calendari d\'absències d\'un treballador (ADMIN_GENERAL)' })
    @ApiParam({ name: 'treballadorId', type: Number })
    @ApiQuery({ name: 'any', required: false, type: Number, description: 'Filtrar per any (p.ex. 2026)' })
    @ApiResponse({ status: 200, description: '{ treballador: Absencia[], empresa: AbsenciaEmpresa[], diesVacancesAnuals, missatgeDies }' })
    @ApiResponse({ status: 403, description: 'Treballador d\'una altra empresa' })
    @ApiResponse({ status: 404, description: 'Treballador no trobat' })
    getAbsenciesCalendari(
        @Param('treballadorId', ParseIntPipe) treballadorId: number,
        @CurrentUser() user: CurrentUserData,
        @Query('any') anyStr?: string,
    ) {
        const any = anyStr !== undefined ? parseInt(anyStr, 10) : undefined;
        return this.absenciesService.getAbsenciesCalendariTreballador(treballadorId, user.empresaId, any);
    }

    @Post()
    @Roles('ADMIN_GENERAL', 'EMPLEAT')
    @ApiOperation({ summary: 'Sol·licitar una absència. EMPLEAT → PENDENT; ADMIN_GENERAL → APROVADA directament' })
    @ApiResponse({ status: 201, description: 'Sol·licitud creada correctament' })
    @ApiResponse({ status: 403, description: 'No autoritzat o treballador d\'una altra empresa' })
    @ApiResponse({ status: 404, description: 'Treballador no trobat' })
    create(@Body() dto: CreateAbsenciaDto, @CurrentUser() user: CurrentUserData) {
        return this.absenciesService.create(dto, user);
    }

    @Patch(':id/estat')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Aprovar o rebutjar una sol·licitud d\'absència (ADMIN_GENERAL)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Estat actualitzat correctament' })
    @ApiResponse({ status: 403, description: 'No autoritzat o absència d\'una altra empresa' })
    @ApiResponse({ status: 404, description: 'Absència no trobada' })
    updateEstat(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEstatAbsenciaDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.absenciesService.updateEstat(user.empresaId, id, dto);
    }

    @Put(':id')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Editar dades d\'una absència (ADMIN_GENERAL)' })
    @ApiResponse({ status: 200, description: 'Absència actualitzada correctament' })
    @ApiResponse({ status: 403, description: 'No autoritzat' })
    @ApiResponse({ status: 404, description: 'Absència no trobada' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAbsenciaDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.absenciesService.update(user.empresaId, id, dto, user.userId);
    }

    @Delete(':id')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Eliminar una absència (ADMIN_GENERAL)' })
    @ApiResponse({ status: 200, description: 'Absència eliminada correctament' })
    @ApiResponse({ status: 403, description: 'No autoritzat' })
    @ApiResponse({ status: 404, description: 'Absència no trobada' })
    delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
        return this.absenciesService.remove(user.empresaId, id, user.userId);
    }
}
