import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, Query } from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreateReservaDto, UpdateReservaEstatDto, ReservaResponseDto } from './dto/reserves.dto';

@ApiTags('reserves')
@ApiBearerAuth('JWT-auth')
@Controller('reserves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservesController {
  constructor(private readonly reservesService: ReservesService) { }

  @Post()
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiBody({ type: CreateReservaDto })
  @ApiResponse({ status: 201, description: 'Reserva creada correctament', type: ReservaResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Servicio o trabajador no encontrados' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  create(@Body() dto: CreateReservaDto) {
    return this.reservesService.create(dto);
  }

  @Put('update/:id')
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Actualizar el estado de una reserva' })
  @ApiBody({ type: UpdateReservaEstatDto })
  @ApiResponse({ status: 200, description: 'Estado de reserva actualizado', type: ReservaResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservaEstatDto,
  ) {
    return this.reservesService.updateEstado(id, dto.nouEstat);
  }

  @Delete(':id')
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Eliminar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva eliminada correctament', type: ReservaResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.reservesService.delete(id);
  }

  @Put(':id')
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Actualizar una reserva' })
  @ApiBody({ type: CreateReservaDto })
  @ApiResponse({ status: 200, description: 'Reserva actualitzada correctament', type: ReservaResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReservaDto,
  ) {
    return this.reservesService.update(id, dto);
  }

  @Get('treballador/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Obtener todas las reservas de un trabajador' })
  @ApiResponse({ status: 200, description: 'Lista de reservas obtenida correctamente', type: [ReservaResponseDto] })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findAllByTreballador(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reservesService.findAllByTreballador(id, user.empresaId, user.userId);
  }

  @Get('setmana')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Obtener todas las reservas de la empresa en un rango de fechas' })
  @ApiQuery({ name: 'inici', required: true, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fi', required: true, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista de reservas obtenida correctamente', type: [ReservaResponseDto] })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (fechas inválidas)' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findAllBySetmana(
    @Query('inici') inici: string,
    @Query('fi') fi: string,
    @Query('treballadorId') treballadorId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reservesService.findAllBySetmana(user.empresaId, inici, fi, user.userId, treballadorId);
  }
}
