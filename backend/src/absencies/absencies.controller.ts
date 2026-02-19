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
    @ApiOperation({ summary: 'Assignar absència a un treballador' })
    @ApiResponse({ status: 201, description: 'Absència assignada correctament' })
    @ApiResponse({ status: 403, description: 'Prohibit: No tens permisos per assignar absències o el treballador no pertany a la teva empresa' })
    @ApiResponse({ status: 404, description: 'No trobat: El treballador no existeix' })
    create(@Body() dto: CreateAbsenciaDto, @CurrentUser() user: CurrentUserData) {
        return this.absenciesService.create(user.empresaId, dto, user.userId);
    }

    @Put(':id')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Editar una absència' })
    @ApiResponse({ status: 200, description: 'Absència actualitzada correctament' })
    @ApiResponse({ status: 403, description: 'Prohibit: No tens permisos per editar aquesta absència' })
    @ApiResponse({ status: 404, description: 'No trobat: L\'absència no existeix' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAbsenciaDto,
        @CurrentUser() user: CurrentUserData
    ) {
        return this.absenciesService.update(user.empresaId, id, dto, user.userId);
    }

    @Delete(':id')
    @Roles('ADMIN_GENERAL')
    @ApiOperation({ summary: 'Eliminar una absència' })
    @ApiResponse({ status: 200, description: 'Absència eliminada correctament' })
    @ApiResponse({ status: 403, description: 'Prohibit: No tens permisos per eliminar aquesta absència' })
    @ApiResponse({ status: 404, description: 'No trobat: L\'absència no existeix' })
    delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
        return this.absenciesService.remove(user.empresaId, id, user.userId);
    }
}
