import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ServeisService } from './serveis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateServeiDto, UpdateServeiDto } from './dto/servei.dto';
import { ApiConsumes, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

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
    @Query('rows', new ParseIntPipe({ optional: true })) rows = 4,
  ) {
    return this.serveisService.findAll(user.empresaId, page, rows);
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

  @Get('public/:empresaId')
  @Public()
  @ApiOperation({ summary: 'Llistar serveis actius d\'una empresa (sense autenticació)' })
  @ApiResponse({ status: 200, description: 'Llista de serveis actius' })
  @ApiResponse({ status: 404, description: 'Empresa no trobada' })
  findAllPublic(@Param('empresaId', ParseIntPipe) empresaId: number) {
    return this.serveisService.findAllPublic(empresaId);
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

  @Patch(':id/foto')
  @ApiOperation({ summary: 'Subir foto de un servicio' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
  uploadFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.serveisService.uploadFoto(id, file, user.empresaId);
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
