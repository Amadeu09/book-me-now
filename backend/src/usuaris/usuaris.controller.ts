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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

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
  @ApiResponse({ status: 400, description: 'Petición incorrecta' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  create(@Body() createUsuariDto: CreateUsuariDto, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.create(createUsuariDto, user.userId);
  }

  @Get()
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Listar usuarios de la empresa' })
  @ApiResponse({ status: 200, type: [UsuariResponseDto] })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.usuarisService.findAll(user.empresaId);
  }

  @Get(':id')
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: UsuariResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.findOne(id, user.empresaId);
  }

  @Patch(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateUsuariDto })
  @ApiResponse({ status: 200, type: UsuariResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Email ya en uso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuariDto: UpdateUsuariDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.usuarisService.update(id, updateUsuariDto, user.empresaId);
  }

  @Patch(':id/foto')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Subir foto de perfil del usuario' })
  @ApiParam({ name: 'id' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Foto actualizada', type: UsuariResponseDto })
  @ApiResponse({ status: 400, description: 'Archivo no válido o demasiado grande' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
  uploadFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5,
            message: 'El archivo es demasiado grande (máx 5MB)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.usuarisService.uploadFoto(id, file, user.empresaId);
  }

  @Delete(':id')
  @Roles('ADMIN_GENERAL')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.remove(id, user.empresaId);
  }
}
