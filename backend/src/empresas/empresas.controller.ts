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
  Query,
  BadRequestException,
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
import { Public } from '../common/decorators/public.decorator';
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

  @Get('directori')
  @Public()
  @ApiOperation({ summary: 'Llistar empreses públicament (paginat, filtrat per tipus)' })
  findAllPublic(
    @Query('tipo') tipo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.empresasService.findAllPublic(
      tipo ?? null,
      parseInt(page ?? '1', 10) || 1,
      parseInt(limit ?? '9', 10) || 9,
    );
  }

  @Get('public/:id')
  @Public()
  @ApiOperation({ summary: 'Obtenir perfil públic d\'una empresa per ID' })
  @ApiParam({ name: 'id' })
  findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.findOnePublic(id);
  }

  @Get('cerca')
  @Public()
  @ApiOperation({ summary: 'Cercar empreses públicament per nom (sense autenticació)' })
  @ApiResponse({ status: 200, description: 'Llista de fins a 10 empreses actives' })
  searchPublic(@Query('q') q: string) {
    if (!q || q.trim().length === 0) {
      throw new BadRequestException("El paràmetre 'q' és obligatori");
    }
    return this.empresasService.searchPublic(q);
  }

  @Post()
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Crear empresa' })
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Get()
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Listar empresas' })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.empresasService.findAll(user.empresaId);
  }

  @Get(':id')
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Obtener empresa por ID' })
  @ApiParam({ name: 'id' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.empresasService.findOne(id, user.empresaId);
  }

  @Patch(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Actualizar empresa' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.empresasService.update(id, updateEmpresaDto, user.empresaId);
  }

  @Delete(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Desactivar empresa' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.empresasService.remove(id, user.empresaId);
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
    return this.empresasService.uploadFoto(id, file, user.empresaId);
  }

  @Patch(':id/banner')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Subir banner de la empresa' })
  @ApiParam({ name: 'id' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('banner', { storage: memoryStorage() }))
  uploadBanner(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 8,
            message: 'El archivo es demasiado grande (máx 8MB)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.empresasService.uploadBanner(id, file, user.empresaId);
  }
}