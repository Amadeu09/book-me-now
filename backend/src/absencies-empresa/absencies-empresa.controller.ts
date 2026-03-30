import {
    Body, Controller, Delete, Get, Param,
    ParseIntPipe, Post, Put, Query, UseGuards, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AbsenciesEmpresaService } from './absencies-empresa.service';
import { CreateAbsenciaEmpresaDto, UpdateAbsenciaEmpresaDto } from './dto/absencia-empresa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('absencies-empresa')
@ApiBearerAuth('JWT-auth')
@Controller('empreses/:empresaId/absencies-empresa')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbsenciesEmpresaController {
    constructor(private readonly service: AbsenciesEmpresaService) {}

    @Get()
    @Roles('ADMIN_GENERAL', 'EMPLEAT')
    @ApiOperation({ summary: 'Llistar absències d\'empresa (festius, ponts...)' })
    @ApiParam({ name: 'empresaId', type: Number })
    @ApiQuery({ name: 'any', required: false, type: Number, description: 'Filtrar per any (p.ex. 2025)' })
    @ApiResponse({ status: 200, description: 'Llista d\'absències d\'empresa' })
    @ApiResponse({ status: 403, description: 'No pertanys a aquesta empresa' })
    findAll(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @CurrentUser() user: CurrentUserData,
        @Query('any') anyStr?: string,
    ) {
        const any = anyStr !== undefined ? parseInt(anyStr, 10) : undefined;
        if (any !== undefined && isNaN(any)) throw new BadRequestException('any ha de ser un número enter');
        return this.service.findAll(empresaId, user, any);
    }

    @Post()
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Crear una absència d\'empresa (festiu, pont...)' })
    @ApiParam({ name: 'empresaId', type: Number })
    @ApiResponse({ status: 201, description: 'Absència creada correctament' })
    @ApiResponse({ status: 400, description: 'Dades invàlides' })
    @ApiResponse({ status: 403, description: 'Sense permisos o empresa diferent' })
    create(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Body() dto: CreateAbsenciaEmpresaDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.service.create(empresaId, dto, user);
    }

    @Put(':id')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Editar una absència d\'empresa' })
    @ApiParam({ name: 'empresaId', type: Number })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Absència actualitzada' })
    @ApiResponse({ status: 403, description: 'Sense permisos o empresa diferent' })
    @ApiResponse({ status: 404, description: 'Absència no trobada' })
    update(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAbsenciaEmpresaDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.service.update(empresaId, id, dto, user);
    }

    @Delete(':id')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Eliminar una absència d\'empresa' })
    @ApiParam({ name: 'empresaId', type: Number })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Absència eliminada' })
    @ApiResponse({ status: 403, description: 'Sense permisos o empresa diferent' })
    @ApiResponse({ status: 404, description: 'Absència no trobada' })
    remove(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.service.remove(empresaId, id, user);
    }
}
