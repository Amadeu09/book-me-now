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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/empresa.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('empresas')
@ApiBearerAuth('JWT-auth')
@Controller('empreses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) { }

  @Post()
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Crear empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada' })
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }



  @Get()
  @ApiOperation({ summary: 'Listar empresas' })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  findAll() {
    return this.empresasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empresa' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.empresasService.findOne(id, user.empresaId, user.rol);
  }

  @Patch(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Actualizar empresa' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.empresasService.update(id, updateEmpresaDto, user.empresaId, user.rol);
  }

  @Delete(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Desactivar empresa' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Empresa desactivada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.remove(id);
  }
}
