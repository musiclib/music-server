import { ADMIN_APIS, GUEST_APIS, JWT_TOKEN, SYNOLOGY_AUDIOSTATION_APIS, USER_APIS } from './constants/swagger';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './api/exception-filter';
import { NestFactory, Reflector } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';
import helmetConfig from './helmet.config';
import type { Request } from 'express';

async function bootstrap() {
  // CORS headers
  const cors = {
    origin: [] as string[],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours in seconds
  };
  const { CORS_ORIGINS = '' } = process.env;
  if (CORS_ORIGINS?.length) {
    cors.origin = CORS_ORIGINS.split(',');
  }
  const logger = new Logger('NestApplication');
  const app = await NestFactory.create(AppModule, {
    cors,
    rawBody: true,
    logger,
    bufferLogs: true,
  });
  app.getHttpAdapter().getInstance().set('etag', false);
  app.use(helmet(helmetConfig));
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Set CORP header
    next();
  });
  app.use(
    compression({
      filter: (req: Request) => {
        return (
          req.url.indexOf('stream.cgi') === -1 &&
          req.url.indexOf('-cover') === -1 &&
          req.url.indexOf('authLogin.cgi') === -1 &&
          req.url.indexOf('.php') === -1
        );
      },
      threshold: 0,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    }),
  );
  if (process.env.SWAGGER_ENABLED) {
    const swaggerDocumentOptions = new DocumentBuilder()
      .setTitle('API Server')
      .addTag(GUEST_APIS, 'APIs for guests to sign in or any other unauthenticated actions.')
      .addTag(USER_APIS, 'WebUI APIs for users to create and manage their collections and other data.')
      .addTag(ADMIN_APIS, 'WebUI APIs for administrators to manage the platform and its users.')
      .addTag(SYNOLOGY_AUDIOSTATION_APIS, 'APIs for Synology DS Audio apps for iPhone and Android.')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter your session token.  These can be issued by the `create-session` endpoint.',
          in: 'header',
        },
        JWT_TOKEN,
      )
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerDocumentOptions);
    SwaggerModule.setup('swagger', app, swaggerDocument, {
      jsonDocumentUrl: 'swagger.json',
      yamlDocumentUrl: 'swagger.yaml',
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
        defaultModelExpandDepth: 10,
        persistAuthorization: true,
        withCredentials: true,
      },
    });
  }
  const address = process.env.SERVER_ADDRESS || '127.0.0.1';
  const port = process.env.SERVER_PORT || 3000;
  await app.listen(port, address);
  logger.log(`API server is running on http://${address}:${port}`);
}

bootstrap();
