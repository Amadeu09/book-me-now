import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AbsenciesService } from './absencies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAbsenciaDto, UpdateAbsenciaDto } from './dto/absencia.dto';

@ApiTags('absencies')
@Controller('absencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbsenciesController {
    constructor(private readonly absenciesService: AbsenciesService) { }

    @Post()
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Asignar ausencia a un trabajador' })
    @ApiResponse({ status: 201, description: 'Ausencia asignada correctamente' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación en DTO)' })
    @ApiResponse({ status: 403, description: 'Prohibido: No tienes permisos para asignar ausencias o el trabajador no pertenece a tu empresa' })
    @ApiResponse({ status: 404, description: 'No encontrado: El trabajador no existe' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    create(@Body() dto: CreateAbsenciaDto, @CurrentUser() user: CurrentUserData) {
        return this.absenciesService.create(user.empresaId, dto, user.userId);
    }

    @Put(':id')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Editar una ausencia' })
    @ApiResponse({ status: 200, description: 'Ausencia actualizada correctamente' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación en DTO)' })
    @ApiResponse({ status: 403, description: 'Prohibido: No tienes permisos para editar esta ausencia' })
    @ApiResponse({ status: 404, description: 'No encontrado: La ausencia no existe' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAbsenciaDto,
        @CurrentUser() user: CurrentUserData
    ) {
        return this.absenciesService.update(user.empresaId, id, dto, user.userId);
    }

    @Delete(':id')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Eliminar una ausencia' })
    @ApiResponse({ status: 200, description: 'Ausencia eliminada correctamente' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
    @ApiResponse({ status: 403, description: 'Prohibido: No tienes permisos para eliminar esta ausencia' })
    @ApiResponse({ status: 404, description: 'No encontrado: La ausencia no existe' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
        return this.absenciesService.remove(user.empresaId, id, user.userId);
    }
}
