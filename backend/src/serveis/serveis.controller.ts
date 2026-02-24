import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ServeisService } from './serveis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { CreateServeiDto, UpdateServeiDto } from './dto/servei.dto';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@Controller('serveis')
@UseGuards(JwtAuthGuard)
export class ServeisController {
  constructor(private readonly serveisService: ServeisService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo servicio' })
  @ApiBody({ type: CreateServeiDto })
  @ApiResponse({ status: 201, description: 'Servicio creado correctamente' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  create(@Body() dto: CreateServeiDto, @CurrentUser() user: CurrentUserData) {
    return this.serveisService.create(user.empresaId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los servicios de la empresa' })
  @ApiResponse({ status: 200, description: 'Lista de servicios recuperada' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  ) {
    return this.serveisService.findAll(user.empresaId, page, 4);
  }

  @Get('treballador/:id')
  @ApiOperation({ summary: 'Obtener servicios por trabajador' })
  @ApiResponse({ status: 200, description: 'Servicios encontrados' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 403, description: 'No autorizado o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Trabajador o servicios no encontrados' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findByTreballador(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.serveisService.findByTreballador(user.empresaId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio encontrado' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso o el servicio es de otra empresa' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.serveisService.findOne(user.empresaId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un servicio' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiBody({ type: UpdateServeiDto })
  @ApiResponse({ status: 200, description: 'Servicio actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso o el servicio es de otra empresa' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServeiDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.serveisService.update(user.empresaId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (desactivar) un servicio' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio eliminado correctamente' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso o el servicio es de otra empresa' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.serveisService.remove(user.empresaId, id);
  }
}
