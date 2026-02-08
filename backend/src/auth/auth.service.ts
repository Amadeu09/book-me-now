import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignupDto, LoginResponseDto, JwtPayload } from './dto/auth.dto';
import { TokenBlacklistService } from './token-blacklist.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  /**
   * Login user and generate JWT token
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.debug(`Attempt login for email: ${loginDto.email}`);

    // Find user by email
    const user = await this.prisma.usuari.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.warn(`Login attempt with non-existent email: ${loginDto.email}`);
      throw new UnauthorizedException('Credencials invàlides');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(loginDto.password, user.hash);

    if (!isValidPassword) {
      this.logger.warn(`Login attempt with incorrect password for user: ${user.id}`);
      throw new UnauthorizedException('Credencials invàlides');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      empresaId: user.empresaId,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(`Login successful for user: ${user.id} (${user.email})`);

    return {
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        rol: user.rol,
        empresaId: user.empresaId,
      },
    };
  }

  /**
   * Logout user and blacklist JWT token
   */
  async logout(userId: number, token: string): Promise<{ message: string }> {
    // Decode token to get expiration time
    try {
      const decoded = this.jwtService.decode(token) as any;
      const expiresAt = new Date(decoded.exp * 1000);
      
      // Add token to blacklist
      this.tokenBlacklistService.addToBlacklist(token, expiresAt);
      
      this.logger.log(`User logged out successfully: ${userId}`);
      
      return { message: 'Logout exitoso' };
    } catch (error) {
      this.logger.warn(`Error during logout for user: ${userId}`, error);
      throw new UnauthorizedException('Token inválid para logout');
    }
  }

  /**
   * Register new company with admin user
   * Executed in atomic transaction
   */
  async signup(signupDto: SignupDto): Promise<LoginResponseDto> {
    this.logger.debug(`Signup attempt for email: ${signupDto.usuari.email}`);

    // Check if email already exists
    const existingUser = await this.prisma.usuari.findUnique({
      where: { email: signupDto.usuari.email },
    });

    if (existingUser) {
      this.logger.warn(`Signup attempt with existing email: ${signupDto.usuari.email}`);
      throw new ConflictException('Aquest email ja està registrat');
    }

    // Hash password
    const hash = await bcrypt.hash(signupDto.usuari.password, 10);

    // Transaction: create empresa and admin user
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create empresa
      const empresa = await tx.empresa.create({
        data: {
          nom: signupDto.empresa.nom,
          ubicacio: signupDto.empresa.ubicacio,
          capacitat: signupDto.empresa.capacitat ?? null,
          activa: true,
        },
      });

      this.logger.log(`Empresa created: ${empresa.id} (${empresa.nom})`);

      // 2. Create admin user
      const usuari = await tx.usuari.create({
        data: {
          email: signupDto.usuari.email,
          hash,
          rol: 'ADMIN_GENERAL',
          empresaId: empresa.id,
        },
      });

      this.logger.log(`Admin user created: ${usuari.id} (${usuari.email})`);

      return { empresa, usuari };
    });

    // Generate JWT token
    const payload: JwtPayload = {
      sub: result.usuari.id,
      email: result.usuari.email,
      rol: result.usuari.rol,
      empresaId: result.usuari.empresaId,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(`Signup successful for user: ${result.usuari.id}`);

    return {
      token,
      user: {
        id: result.usuari.id.toString(),
        email: result.usuari.email,
        rol: result.usuari.rol,
        empresaId: result.usuari.empresaId,
      },
    };
  }


  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUser(userId: number) {
    const user = await this.prisma.usuari.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        rol: true,
        empresaId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuari no vàlid');
    }

    return user;
  }
}
