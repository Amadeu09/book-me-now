import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { TreballadorsService } from './treballadors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateJornadaTreballadorExistDto, CreateTreballadorDto, JornadaTreballadorDto } from './dto/CreateTreballadorDto';
import { AssignarServeisDto } from './dto/AssignarServeisDto';
import { GetDisponibilitatDto } from './dto/GetDisponibilitatDto';


@Controller('treballadors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreballadorsController {
  constructor(private readonly treballadorsService: TreballadorsService) { }

  @Post()
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Crear trabajador' })
  @ApiBody({ type: CreateTreballadorDto })
  @ApiResponse({ status: 201, description: 'Trabajador creado correctamente' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'No encontrado: Usuario a asignar no existe' })
  @ApiResponse({ status: 409, description: 'Conflicto: Trabajador ya existe' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  create(@Body() createTreballadorDto: CreateTreballadorDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.create(user.empresaId, createTreballadorDto, user.userId);
  }

  @Post('assignar-jornada')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Asignar jornada a un trabajador existente' })
  @ApiBody({ type: CreateJornadaTreballadorExistDto })
  @ApiResponse({ status: 201, description: 'Jornada asignada correctamente' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'No encontrado: Trabajador o plantilla no existen' })
  @ApiResponse({ status: 409, description: 'Conflicto' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  assignarJornada(@Body() createTreballadorDto: CreateJornadaTreballadorExistDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.assignJornadaTreballador(user.empresaId, createTreballadorDto, user.userId);
  }

  @Delete("assignar-jornada/:id")
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Eliminar jornada asignada a un trabajador' })
  @ApiResponse({ status: 200, description: 'Jornada eliminada correctamente' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'No encontrado: Trabajador o jornada no existen' })
  @ApiResponse({ status: 409, description: 'Conflicto' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  eliminarJornada(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.eliminarJornadaTreballador(user.empresaId, id, user.userId);
  }

  @Post('assignar-serveis')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Asignar múltiples servicios a un trabajador' })
  @ApiBody({ type: AssignarServeisDto })
  @ApiResponse({ status: 201, description: 'Servicios asignados correctamente' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 403, description: 'No autorizado o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Trabajador o servicios no encontrados' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  assignarServeis(@Body() dto: AssignarServeisDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.assignarServeis(user.empresaId, dto, user.userId);
  }

  @Delete("assignar-serveis/:id")
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Eliminar servicios asignados a un trabajador' })
  @ApiResponse({ status: 200, description: 'Servicios eliminados correctamente' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'No encontrado: Trabajador o servicios no existen' })
  @ApiResponse({ status: 409, description: 'Conflicto' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  eliminarServeis(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.eliminarServeis(user.empresaId, id, user.userId);
  }

  @Get("disponibilitat/:id")
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Obtener disponibilidad de un trabajador' })
  @ApiResponse({ status: 200, description: 'Disponibilidad obtenida correctamente' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'No encontrado: Trabajador no existe' })
  @ApiResponse({ status: 409, description: 'Conflicto' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  getDisponibilitat(@Param('id', ParseIntPipe) id: number, @Body() dto: GetDisponibilitatDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.getDisponibilitat(user.empresaId, id, dto.serveiId, user.userId);
  }
}

