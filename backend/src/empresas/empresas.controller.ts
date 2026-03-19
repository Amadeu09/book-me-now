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
  ApiConsumes,
} from '@nestjs/swagger';

import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/empresa.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '../common/decorators/current-user.decorator';

@ApiTags('empresas')
@ApiBearerAuth('JWT-auth')
@Controller('empreses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) { }

  @Post()
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Crear empresa' })
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas' })
  findAll() {
    return this.empresasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empresa por ID' })
  @ApiParam({ name: 'id' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.empresasService.findOne(id, user.empresaId, user.rol);
  }

  @Patch(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Actualizar empresa' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.empresasService.update(
      id,
      updateEmpresaDto,
      user.empresaId,
      user.rol,
    );
  }

  @Delete(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Desactivar empresa' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.remove(id);
  }

  // ✅ FIX: Upload con memoryStorage
  @Patch(':id/foto')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Subir foto de perfil de la empresa' })
  @ApiParam({ name: 'id' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
    }),
  )
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
    return this.empresasService.uploadFoto(
      id,
      file,
      user.empresaId,
      user.rol,
    );
  }
}