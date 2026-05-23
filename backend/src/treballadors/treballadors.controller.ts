import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, Query, DefaultValuePipe } from '@nestjs/common';
import { TreballadorsService } from './treballadors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CreateTreballadorDto } from './dto/CreateTreballadorDto';
import { AssignarServeisDto } from './dto/AssignarServeisDto';
import { GetDisponibilitatDto } from './dto/GetDisponibilitatDto';
import { UpdateTreballadorDto } from './dto/UpdateTreballadorDto';

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

  @Get('disponibilitat-publica/:id')
  @Public()
  @ApiOperation({ summary: 'Obtenir disponibilitat pública d\'un treballador per a un servei (sense autenticació)' })
  @ApiParam({ name: 'id', description: 'ID del treballador' })
  @ApiQuery({ name: 'serveiId', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Disponibilitat obtinguda' })
  @ApiResponse({ status: 404, description: 'Treballador o servei no trobat' })
  getDisponibilitatPublic(
    @Param('id', ParseIntPipe) id: number,
    @Query('serveiId', ParseIntPipe) serveiId: number,
  ) {
    return this.treballadorsService.getDisponibilitatPublic(id, serveiId);
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
  getDisponibilitat(@Param('id', ParseIntPipe) id: number, @Query() dto: GetDisponibilitatDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.getDisponibilitat(user.empresaId, id, dto.serveiId, user.userId);
  }

  @Get(':empresaId/paginades')
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Listar trabajadores paginados por empresa' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto 1)' })
  @ApiQuery({ name: 'rows', required: false, type: Number, description: 'Número de filas por página (por defecto 2)' })
  @ApiResponse({ status: 200, description: 'Lista de trabajadores obtenida correctamente' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso o no perteneces a la empresa' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  getTreballadorsPaginats(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('rows', new DefaultValuePipe(2), ParseIntPipe) rows: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.treballadorsService.getTreballadorsPaginats(empresaId, page, rows, user.userId);
  }

  @Get('my/absencies-calendari')
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Obtenir absències del treballador autenticat + festius de l\'empresa' })
  @ApiQuery({ name: 'any', required: false, type: Number, description: 'Filtrar per any (p.ex. 2026)' })
  @ApiResponse({ status: 200, description: '{ treballador: Absencia[], empresa: AbsenciaEmpresa[] }' })
  getMyAbsenciesCalendari(
    @CurrentUser() user: CurrentUserData,
    @Query('any') anyStr?: string,
  ) {
    const any = anyStr !== undefined ? parseInt(anyStr, 10) : undefined;
    return this.treballadorsService.getMyAbsenciesCalendari(user, any);
  }

  @Get()
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Listar trabajadores paginados por empresa' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto 1)' })
  @ApiQuery({ name: 'rows', required: false, type: Number, description: 'Número de filas por página (por defecto 2)' })
  @ApiResponse({ status: 200, description: 'Lista de trabajadores obtenida correctamente' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso o no perteneces a la empresa' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  getTreballadors(
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.treballadorsService.getTreballadors(user.empresaId, user.userId);
  }

  @Put(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Actualizar trabajador' })
  @ApiParam({ name: 'id', description: 'ID del trabajador' })
  @ApiBody({ type: UpdateTreballadorDto })
  @ApiResponse({ status: 200, description: 'Trabajador actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTreballadorDto: UpdateTreballadorDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.treballadorsService.update(user.empresaId, id, updateTreballadorDto, user.userId);
  }

  @Delete(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Eliminar trabajador' })
  @ApiParam({ name: 'id', description: 'ID del trabajador' })
  @ApiResponse({ status: 200, description: 'Trabajador eliminado correctamente' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.remove(user.empresaId, id, user.userId);
  }
}

