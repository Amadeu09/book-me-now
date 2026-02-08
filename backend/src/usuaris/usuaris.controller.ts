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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsuarisService } from './usuaris.service';
import { CreateUsuariDto, UpdateUsuariDto } from './dto/usuari.dto';
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
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  create(@Body() createUsuariDto: CreateUsuariDto, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.create(createUsuariDto, user.userId);
  }

  @Get()
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.usuarisService.findAll(user.empresaId, user.rol);
  }

  @Get(':id')
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.findOne(id, user.empresaId, user.rol);
  }

  @Patch(':id')
  @Roles('ADMIN_GENERAL')
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
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.remove(id, user.empresaId, user.rol);
  }
}
