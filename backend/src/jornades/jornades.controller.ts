import {
    Controller,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
    Get,
    Query,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JornadesService } from './jornades.service';
import { CreateJornadaPlantillaDto } from './dto/jornada-plantilla.dto';
import { UpdateJornadaPlantillaDto } from './dto/update-jornada-plantilla.dto';
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
    @ApiParam({ name: 'empresaId', description: 'ID de la empresa' })
    @ApiResponse({ status: 201, description: 'Plantilla de jornada creada exitosamente' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
    @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
    @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso para crear jornadas en esta empresa' })
    @ApiResponse({ status: 404, description: 'No encontrada: La empresa no existe' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    create(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Body() createJornadaDto: CreateJornadaPlantillaDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.jornadasService.create(empresaId, createJornadaDto, user.empresaId, user.rol);
    }


    @Get()
    @Roles('ADMIN_GENERAL', 'EMPLEAT')
    @ApiOperation({ summary: 'Listar plantillas de jornada' })
    @ApiParam({ name: 'empresaId', description: 'ID de la empresa' })
    @ApiResponse({ status: 200, description: 'Lista de plantillas recuperada exitosamente' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta' })
    @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
    @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso para ver jornadas de esta empresa' })
    @ApiResponse({ status: 404, description: 'No encontrada: La empresa no existe' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    findAll(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.jornadasService.findAll(empresaId, user.empresaId, user.rol);
    }

    @Get('paginadas')
    @Roles('ADMIN_GENERAL', 'EMPLEAT')
    @ApiOperation({ summary: 'Obtener plantillas de jornada paginadas' })
    @ApiParam({ name: 'empresaId', description: 'ID de la empresa' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto 1)' })
    @ApiQuery({ name: 'rows', required: false, type: Number, description: 'Número de filas por página (por defecto 2)' })
    @ApiResponse({ status: 200, description: 'Lista paginada de plantillas recuperada exitosamente' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta' })
    @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
    @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso para ver jornadas de esta empresa' })
    @ApiResponse({ status: 404, description: 'No encontrada: La empresa no existe' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    getJornadesPaginadas(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('rows', new DefaultValuePipe(2), ParseIntPipe) rows: number,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.jornadasService.getJornadesPaginadas(empresaId, user.empresaId, user.rol, page, rows);
    }

    @Put(':id')
    @Roles('ADMIN_GENERAL', 'EMPLEAT')
    @ApiOperation({ summary: 'Actualizar plantilla de jornada' })
    @ApiParam({ name: 'empresaId', description: 'ID de la empresa' })
    @ApiParam({ name: 'id', description: 'ID de la plantilla de jornada' })
    @ApiResponse({ status: 200, description: 'Plantilla de jornada actualizada exitosamente' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
    @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
    @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
    @ApiResponse({ status: 404, description: 'No encontrada' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    update(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateJornadaDto: UpdateJornadaPlantillaDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.jornadasService.update(empresaId, id, updateJornadaDto, user.empresaId, user.rol);
    }

    @Delete(':id')
    @Roles('ADMIN_GENERAL', 'EMPLEAT')
    @ApiOperation({ summary: 'Eliminar plantilla de jornada' })
    @ApiParam({ name: 'empresaId', description: 'ID de la empresa' })
    @ApiParam({ name: 'id', description: 'ID de la plantilla de jornada' })
    @ApiResponse({ status: 200, description: 'Plantilla de jornada eliminada exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
    @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
    @ApiResponse({ status: 404, description: 'No encontrada' })
    @ApiResponse({ status: 409, description: 'Conflicto: Hay trabajadores asignados a esta plantilla' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    remove(
        @Param('empresaId', ParseIntPipe) empresaId: number,
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.jornadasService.remove(empresaId, id, user.empresaId, user.rol);
    }
}
