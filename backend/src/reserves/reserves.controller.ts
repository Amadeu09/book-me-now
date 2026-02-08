import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateReservaDto, UpdateReservaEstatDto } from './dto/reserves.dto';

@Controller('reserves')
export class ReservesController {
  constructor(private readonly reservesService: ReservesService) { }

  @Post()
  @ApiOperation({ summary: 'Asignar múltiples servicios a un trabajador' })
  @ApiResponse({ status: 201, description: 'Servicios asignados correctamente' })
  @ApiResponse({ status: 403, description: 'No autorizado o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Trabajador o servicios no encontrados' })
  create(@Body() dto: CreateReservaDto ) {
    return this.reservesService.create( dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Cambiar el estado de una reserva' })
  @ApiResponse({ status: 200, description: 'Estado de reserva actualizado' })
  @ApiResponse({ status: 403, description: 'No autorizado o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservaEstatDto,
  ) {
    return this.reservesService.updateEstado(id, dto.nouEstat);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva eliminada correctamente' })
  @ApiResponse({ status: 403, description: 'No autorizado o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  delete(@Param('id', ParseIntPipe) id: number) 
  {
    return this.reservesService.delete(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva actualizada correctamente' })
  @ApiResponse({ status: 403, description: 'No autorizado o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReservaDto,
  ) {
    return this.reservesService.update(id, dto);
  }
}
