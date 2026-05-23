import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards, Query } from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreateReservaDto, UpdateReservaEstatDto, ReservaResponseDto, ModificarReservaGestioDto } from './dto/reserves.dto';

@ApiTags('reserves')
@ApiBearerAuth('JWT-auth')
@Controller('reserves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservesController {
  constructor(private readonly reservesService: ReservesService) { }

  @Get('gestio/:token')
  @Public()
  @ApiOperation({ summary: 'Obtenir detalls de la reserva pel token de gestió' })
  @ApiResponse({ status: 200, description: 'Detalls de la reserva' })
  @ApiResponse({ status: 404, description: 'Token invàlid' })
  getByToken(@Param('token') token: string) {
    return this.reservesService.getReservaByToken(token);
  }

  @Patch('gestio/:token/cancellar')
  @Public()
  @ApiOperation({ summary: 'Cancel·lar una reserva pel token de gestió' })
  @ApiResponse({ status: 200, description: 'Reserva cancel·lada' })
  @ApiResponse({ status: 400, description: 'Reserva ja cancel·lada o ja passada' })
  @ApiResponse({ status: 404, description: 'Token invàlid' })
  cancellarByToken(@Param('token') token: string) {
    return this.reservesService.cancellarReservaByToken(token);
  }

  @Patch('gestio/:token/modificar')
  @Public()
  @ApiOperation({ summary: 'Modificar data/hora d\'una reserva pel token de gestió' })
  @ApiBody({ type: ModificarReservaGestioDto })
  @ApiResponse({ status: 200, description: 'Reserva modificada' })
  @ApiResponse({ status: 409, description: 'Horari no disponible' })
  @ApiResponse({ status: 404, description: 'Token invàlid' })
  modificarByToken(@Param('token') token: string, @Body() dto: ModificarReservaGestioDto) {
    return this.reservesService.modificarReservaByToken(token, dto);
  }

  @Post('public')
  @Public()
  @ApiOperation({ summary: 'Crear una reserva pública sense autenticació' })
  @ApiBody({ type: CreateReservaDto })
  @ApiResponse({ status: 201, description: 'Reserva creada correctament' })
  @ApiResponse({ status: 409, description: 'Horari ja ocupat (conflicte de disponibilitat)' })
  @ApiResponse({ status: 404, description: 'Servei o treballador no trobat' })
  createPublic(@Body() dto: CreateReservaDto) {
    return this.reservesService.createPublic(dto);
  }

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
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reservesService.updateEstado(id, dto.nouEstat, user);
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
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.reservesService.delete(id, user);
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
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reservesService.update(id, dto, user);
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
  @ApiQuery({ name: 'inici', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fi', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  findAllByTreballador(
    @Param('id', ParseIntPipe) id: number,
    @Query('inici') inici: string,
    @Query('fi') fi: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reservesService.findAllByTreballador(id, user.empresaId, user.userId, inici, fi);
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
