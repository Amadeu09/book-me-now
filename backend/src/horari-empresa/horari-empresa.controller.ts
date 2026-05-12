import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HorariEmpresaService } from './horari-empresa.service';
import { CreateHorariEmpresaDto, UpdateHorariEmpresaDto } from './dto/horari-empresa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('horari-empresa')
@ApiBearerAuth('JWT-auth')
@Controller('empreses/:empresaId/horari')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HorariEmpresaController {
    constructor(private readonly service: HorariEmpresaService) {}

    @Get('public')
    @Public()
    @ApiOperation({ summary: 'Obtenir horari i tancaments de l\'empresa (públic, sense auth)' })
    @ApiParam({ name: 'empresaId', type: Number })
    @ApiResponse({ status: 200, description: 'Horari setmanal i absències properes' })
    findPublic(@Param('empresaId', ParseIntPipe) empresaId: number) {
        return this.service.findPublic(empresaId);
    }

    @Get()
    @Roles('ADMIN_GENERAL', 'EMPLEAT')
    @ApiOperation({ summary: 'Obtenir tots els trams d\'horari de l\'empresa' })
    @ApiParam({ name: 'empresaId', type: Number })
    @ApiResponse({ status: 200, description: 'Llista de trams horaris' })
    @ApiResponse({ status: 403, description: 'No pertanys a aquesta empresa' })
    findAll(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.service.findAll(empresaId, user);
    }

    @Post()
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Afegir un tram horari a un dia de la setmana' })
    @ApiParam({ name: 'empresaId', type: Number })
    @ApiResponse({ status: 201, description: 'Tram creat' })
    @ApiResponse({ status: 400, description: 'Dades invàlides (inici >= fi)' })
    @ApiResponse({ status: 403, description: 'Sense permisos o empresa diferent' })
    create(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Body() dto: CreateHorariEmpresaDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.service.create(empresaId, dto, user);
    }

    @Put(':id')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Editar un tram horari existent' })
    @ApiParam({ name: 'empresaId', type: Number })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Tram actualitzat' })
    @ApiResponse({ status: 400, description: 'Dades invàlides' })
    @ApiResponse({ status: 403, description: 'Sense permisos o empresa diferent' })
    @ApiResponse({ status: 404, description: 'Tram no trobat' })
    update(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateHorariEmpresaDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.service.update(empresaId, id, dto, user);
    }

    @Delete(':id')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Eliminar un tram horari' })
    @ApiParam({ name: 'empresaId', type: Number })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Tram eliminat' })
    @ApiResponse({ status: 403, description: 'Sense permisos o empresa diferent' })
    @ApiResponse({ status: 404, description: 'Tram no trobat' })
    remove(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.service.remove(empresaId, id, user);
    }
}
