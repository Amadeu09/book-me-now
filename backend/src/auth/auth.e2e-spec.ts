import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Aplicar configuración igual que en main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    app.setGlobalPrefix('api');
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/signup (POST)', () => {
    const uniqueEmail = `test-${Date.now()}@e2e-test.com`;

    it('debería crear una nueva empresa y usuario', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          usuari: {
            email: uniqueEmail,
            password: 'SecurePass123!',
          },
          empresa: {
            nom: 'Test E2E Company',
            ubicacio: 'Barcelona, Test Street',
            capacitat: 15,
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(uniqueEmail);
          expect(res.body.user.rol).toBe('ADMIN_GENERAL');
        });
    });

    it('debería rechazar signup con email duplicado', async () => {
      // Primero crear usuario
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          usuari: {
            email: 'duplicate@e2e-test.com',
            password: 'SecurePass123!',
          },
          empresa: {
            nom: 'Duplicate Test',
            ubicacio: 'Test',
          },
        });

      // Intentar crear con mismo email
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          usuari: {
            email: 'duplicate@e2e-test.com',
            password: 'AnotherPass123!',
          },
          empresa: {
            nom: 'Another Company',
            ubicacio: 'Test',
          },
        })
        .expect(409); // Conflict
    });

    it('debería validar campos requeridos', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          usuari: {
            email: 'invalid',
            password: '123', // Too short
          },
          empresa: {
            // nom missing
            ubicacio: 'Test',
          },
        })
        .expect(400); // Bad Request
    });
  });

  describe('/api/auth/login (POST)', () => {
    const testUser = {
      email: `login-test-${Date.now()}@e2e-test.com`,
      password: 'SecurePass123!',
    };

    beforeAll(async () => {
      // Crear usuario de prueba
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          usuari: testUser,
          empresa: {
            nom: 'Login Test Company',
            ubicacio: 'Test Location',
          },
        });
    });

    it('debería autenticar con credenciales correctas', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('debería rechazar credenciales incorrectas', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('debería rechazar usuario inexistente', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@e2e-test.com',
          password: 'SomePassword123!',
        })
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('debería aplicar rate limit en login', async () => {
      const requests = [];

      // Hacer 6 requests rápidos (límite es 5/min)
      for (let i = 0; i < 6; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
              email: 'ratelimit@test.com',
              password: 'test',
            }),
        );
      }

      const responses = await Promise.all(requests);
      
      // Al menos uno debería ser bloqueado por rate limit
      const blockedRequests = responses.filter(res => res.status === 429);
      expect(blockedRequests.length).toBeGreaterThan(0);
    });
  });
});
