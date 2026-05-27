import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuarisService } from '../usuaris/usuaris.service';
import { LoginDto, SignupDto, LoginResponseDto } from './dto/auth.dto';
import { Rol } from '@prisma/client';

const mockAuthService = {
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
};

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: UsuarisService,
                    useValue: { findOne: jest.fn() },
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should call service.login with correct parameters', async () => {
            const dto: LoginDto = { email: 'test@example.com', password: 'password' };
            const response: LoginResponseDto = {
                token: 'token',
                user: { id: '1', email: 'test@example.com', rol: 'ADMIN_GENERAL', empresaId: 1 },
            };

            mockAuthService.login.mockResolvedValue(response);

            const result = await controller.login(dto);

            expect(service.login).toHaveBeenCalledWith(dto);
            expect(result).toEqual(response);
        });
    });

    describe('signup', () => {
        it('should call service.signup with correct parameters', async () => {
            const dto: SignupDto = {
                usuari: { email: 'test@example.com', password: 'password' },
                empresa: { nom: 'Test Co', ubicacio: 'Loc' },
            };
            const response: LoginResponseDto = {
                token: 'token',
                user: { id: '1', email: 'test@example.com', rol: 'ADMIN_GENERAL', empresaId: 1 },
            };

            mockAuthService.signup.mockResolvedValue(response);

            const result = await controller.signup(dto);

            expect(service.signup).toHaveBeenCalledWith(dto);
            expect(result).toEqual(response);
        });
    });

    describe('logout', () => {
        it('should call service.logout with correct parameters', async () => {
            const req = {
                user: { userId: 1 },
                headers: { authorization: 'Bearer token' },
            };

            mockAuthService.logout.mockResolvedValue({ message: 'Logout exitoso' });

            const result = await controller.logout(req);

            expect(service.logout).toHaveBeenCalledWith(1, 'token');
            expect(result).toEqual({ message: 'Logout exitoso' });
        });
    });
});
