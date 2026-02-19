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
  @ApiBody({ type: CreateUsuariDto })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 403, description: 'Prohibit: No tens permís' })
  @ApiResponse({ status: 404, description: 'No trobat: Usuari actual no existeix' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  create(@Body() createUsuariDto: CreateUsuariDto, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.create(createUsuariDto, user.userId);
  }

  @Get()
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Llistar usuaris de l\'empresa' })
  @ApiResponse({ status: 200, description: 'Llista d\'usuaris recuperada' })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.usuarisService.findAll(user.empresaId, user.rol);
  }

  @Get(':id')
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiOperation({ summary: 'Obtenir un usuari per ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Usuari trobat' })
  @ApiResponse({ status: 403, description: 'Prohibit: No tens permís o l\'usuari és d\'una altra empresa' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.findOne(id, user.empresaId, user.rol);
  }

  @Patch(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Actualitzar un usuari' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateUsuariDto })
  @ApiResponse({ status: 200, description: 'Usuari actualitzat correctament' })
  @ApiResponse({ status: 403, description: 'Prohibit: No tens permís o l\'usuari és d\'una altra empresa' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat' })
  @ApiResponse({ status: 409, description: 'Conflicte: L\'email ja està en ús' })
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
  @ApiOperation({ summary: 'Eliminar un usuari' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Usuari eliminat correctament' })
  @ApiResponse({ status: 403, description: 'Prohibit: No tens permís o l\'usuari és d\'una altra empresa' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usuarisService.remove(id, user.empresaId, user.rol);
  }
}
