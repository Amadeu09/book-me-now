import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security: CORS configuration (restrict origins)
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:19000',
    'http://localhost:8081',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page'],
    maxAge: 3600, // Cache preflight for 1 hour
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert types automatically
      },
    }),
  );

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('BookMeNow API')
    .setDescription('Sistema de gestión de reservas para empresas con trabajadores, servicios y clientes')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y registro')
    .addTag('usuaris', 'Gestión de usuarios')
    .addTag('empresas', 'Gestión de empresas')
    .addTag('treballadors', 'Trabajadores')
    .addTag('serveis', 'Servicios')
    .addTag('clients', 'Clientes')
    .addTag('reserves', 'Reservas')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'BookMeNow API Docs',
    customfavIcon: 'https://nestjs.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Healthcheck endpoint (outside /api prefix)
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  });

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);

  logger.log(`🚀 BookMeNow API running on: http://localhost:${port}/api`);
  logger.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`📖 Swagger docs available at: http://localhost:${port}/api/docs`);
  logger.log(`🔒 CORS allowed origins: ${allowedOrigins.join(', ')}`);
  logger.log(`💚 Healthcheck available at: http://localhost:${port}/health`);
  logger.log(`🛡️  Rate limiting enabled: 10 req/s, 100 req/min, 500 req/15min`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error.stack);
  process.exit(1);
});
