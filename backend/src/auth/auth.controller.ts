import { Controller, Post, Body, HttpCode, HttpStatus, Logger, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto, LoginResponseDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // Max 5 login attempts per minute
  @ApiOperation({ summary: 'Login de usuario', description: 'Autentica un usuario y devuelve un token JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos - Rate limit exceeded' })
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
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos - Rate limit exceeded' })
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
  async logout(@Req() req: any): Promise<{ message: string }> {
    const userId = req.user.userId;
    const token = req.headers.authorization?.split(' ')[1];
    this.logger.debug(`POST /api/auth/logout - User: ${userId}`);
    return this.authService.logout(userId, token);
  }
}
