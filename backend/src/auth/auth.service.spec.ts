import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokenBlacklistService } from './token-blacklist.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    usuari: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    empresa: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TokenBlacklistService,
          useValue: { addToBlacklist: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debería autenticar un usuario con credenciales válidas', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockEmpresa = {
        id: 1,
        nom: 'Empresa Test',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        hash: await bcrypt.hash('password123', 10),
        rol: 'ADMIN_GENERAL' as const,
        empresaId: 1,
        empresa: mockEmpresa,
      };

      const mockToken = 'mock.jwt.token';

      mockPrismaService.usuari.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        token: mockToken,
        user: {
          id: '1',
          email: mockUser.email,
          rol: mockUser.rol,
          empresaId: mockUser.empresaId,
          empresa: mockUser.empresa,
        },
      });
      expect(prismaService.usuari.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        include: { empresa: { select: { id: true, nom: true } } },
      });
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException con email inválido', async () => {
      mockPrismaService.usuari.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException con contraseña incorrecta', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        hash: await bcrypt.hash('correctPassword', 10),
        rol: 'ADMIN_GENERAL' as const,
        empresaId: 1,
      };

      mockPrismaService.usuari.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signup', () => {
    it('debería crear una nueva empresa y usuario administrador', async () => {
      const signupDto = {
        usuari: {
          email: 'newadmin@example.com',
          password: 'SecurePass123!',
        },
        empresa: {
          nom: 'Nueva Empresa',
          ubicacio: 'Barcelona, Spain',
          capacitat: 20,
        },
      };

      const mockEmpresa = {
        id: 1,
        nom: signupDto.empresa.nom,
        ubicacio: signupDto.empresa.ubicacio,
        capacitat: signupDto.empresa.capacitat,
        activa: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUsuari = {
        id: 1,
        email: signupDto.usuari.email,
        hash: 'hashedPassword',
        rol: 'ADMIN_GENERAL' as const,
        empresaId: mockEmpresa.id,
        createdAt: new Date(),
      };

      const mockToken = 'mock.jwt.token';

      mockPrismaService.usuari.findUnique.mockResolvedValue(null); // Email no existe
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          empresa: {
            create: jest.fn().mockResolvedValue(mockEmpresa),
          },
          usuari: {
            create: jest.fn().mockResolvedValue(mockUsuari),
          },
        });
      });
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        token: mockToken,
        user: {
          id: '1',
          email: mockUsuari.email,
          rol: mockUsuari.rol,
          empresaId: mockUsuari.empresaId,
          empresa: { id: mockEmpresa.id, nom: mockEmpresa.nom },
        },
      });
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      const signupDto = {
        usuari: {
          email: 'existing@example.com',
          password: 'SecurePass123!',
        },
        empresa: {
          nom: 'Nueva Empresa',
          ubicacio: 'Barcelona',
        },
      };

      mockPrismaService.usuari.findUnique.mockResolvedValue({
        id: 1,
        email: signupDto.usuari.email,
      });

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('debería devolver el usuario si existe', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        rol: 'ADMIN_GENERAL' as const,
        empresaId: 1,
      };

      mockPrismaService.usuari.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(1);

      expect(result).toEqual(mockUser);
      expect(prismaService.usuari.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          email: true,
          rol: true,
          empresaId: true,
        },
      });
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      mockPrismaService.usuari.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(999)).rejects.toThrow(UnauthorizedException);
    });
  });
});
