import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateReservaDto, UpdateReservaEstatDto, ReservaResponseDto } from './dto/reserves.dto';

@ApiTags('reserves')
@Controller('reserves')
export class ReservesController {
  constructor(private readonly reservesService: ReservesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiBody({ type: CreateReservaDto })
  @ApiResponse({ status: 201, description: 'Reserva creada correctamente', type: ReservaResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Servicio o trabajador no encontrados' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  create(@Body() dto: CreateReservaDto) {
    return this.reservesService.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Actualizar el estado de una reserva' })
  @ApiBody({ type: UpdateReservaEstatDto })
  @ApiResponse({ status: 200, description: 'Estado de reserva actualizado', type: ReservaResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
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
  @ApiOperation({ summary: 'Eliminar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva eliminada correctamente', type: ReservaResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.reservesService.delete(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una reserva' })
  @ApiBody({ type: CreateReservaDto })
  @ApiResponse({ status: 200, description: 'Reserva actualizada correctamente', type: ReservaResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReservaDto,
  ) {
    return this.reservesService.update(id, dto);
  }
}
