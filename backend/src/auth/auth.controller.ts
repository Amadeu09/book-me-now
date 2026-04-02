import { Controller, Post, Body, HttpCode, HttpStatus, Logger, UseGuards, Req, Patch, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto, LoginResponseDto, ChangePasswordDto } from './dto/auth.dto';
import { UsuarisService } from '../usuaris/usuaris.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usuarisService: UsuarisService,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // Max 5 login attempts per minute
  @ApiOperation({ summary: 'Login de usuario', description: 'Autentica un usuario y devuelve un token JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación en DTO)' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos - Rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.debug(`POST /api/auth/login - Email: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 2, ttl: 60000 } }) // Max 3 signups per minute
  @ApiOperation({ summary: 'Registro de empresa', description: 'Registra una nueva empresa con un usuario administrador' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'Registro exitoso', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación en DTO)' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos - Rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async signup(@Body() signupDto: SignupDto): Promise<LoginResponseDto> {
    this.logger.debug(`POST /api/auth/signup - Email: ${signupDto.usuari.email}`);
    return this.authService.signup(signupDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout de usuario', description: 'Desautentica el usuario y invalida el token JWT' })
  @ApiResponse({ status: 200, description: 'Logout exitoso' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async logout(@Req() req: any): Promise<{ message: string }> {
    const userId = req.user.userId;
    const token = req.headers.authorization?.split(' ')[1];
    this.logger.debug(`POST /api/auth/logout - User: ${userId}`);
    return this.authService.logout(userId, token);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña (self-service)', description: 'Requiere la contraseña actual para validar' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta o nueva inválida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    this.logger.debug(`POST /api/auth/change-password - User: ${user.userId}`);
    return this.authService.changePassword(user.userId, dto);
  }

  @Patch('me/foto')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_GENERAL', 'EMPLEAT')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir foto de perfil propia (self-service)' })
  @ApiResponse({ status: 200, description: 'Foto actualizada' })
  @ApiResponse({ status: 400, description: 'Archivo no válido' })
  @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
  async uploadMyFoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5, message: 'Màx 5MB' })],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: CurrentUserData,
  ) {
    this.logger.debug(`PATCH /api/auth/me/foto - User: ${user.userId}`);
    return this.usuarisService.uploadFoto(user.userId, file, user.empresaId);
  }
}
