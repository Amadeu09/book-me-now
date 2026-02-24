import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsuarisService } from './usuaris.service';
import { CreateUsuariDto, UpdateUsuariDto, UsuariResponseDto } from './dto/usuari.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('usuaris')
@ApiBearerAuth('JWT-auth')
@Controller('usuaris')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarisController {
  constructor(private readonly usuarisService: UsuarisService) { }

  @Post()
  @Roles('ADMIN_GENERAL')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiBody({ type: CreateUsuariDto })
  @ApiResponse({ status: 201, description: 'Usuario creado', type: UsuariResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 404, description: 'No encontrado: Usuario actual o empresa no existe' })
  @ApiResponse({ status: 409, description: 'Conflicto: El email ya existe' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  create(@Body() createUsuariDto: CreateUsuariDto, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.create(createUsuariDto, user.userId);
  }

  @Get()
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Listar usuarios de la empresa' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios recuperada', type: [UsuariResponseDto] })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.usuarisService.findAll(user.empresaId, user.rol);
  }

  @Get(':id')
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UsuariResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso o el usuario es de otra empresa' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.findOne(id, user.empresaId, user.rol);
  }

  @Patch(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateUsuariDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado correctamente', type: UsuariResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso o el usuario es de otra empresa' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto: El email ya está en uso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuariDto: UpdateUsuariDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.usuarisService.update(id, updateUsuariDto, user.empresaId, user.rol);
  }

  @Delete(':id')
  @Roles('ADMIN_GENERAL')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado correctamente', type: UsuariResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 403, description: 'Prohibido: No tienes permiso o el usuario es de otra empresa' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.remove(id, user.empresaId, user.rol);
  }
}
