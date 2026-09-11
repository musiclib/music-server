import {
  ADMIN_APIS,
  GUEST_APIS,
  JWT_TOKEN,
  QNAP_MUSICSTATION_APIS,
  SYNOLOGY_AUDIOSTATION_APIS,
  USER_APIS,
} from './constants/swagger';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './api/exception-filter';
import { NestFactory, Reflector } from '@nestjs/core';
import compression from 'compression';
import express, { type NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import helmetConfig from './helmet.config';

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
    bodyParser: true,
    rawBody: true,
    logger,
    bufferLogs: true,
  });
  // fix QNAP's "application/x-www-form-urlencoded;charset=UTF-8;"
  app.use((req: Request, _: Response, next: NextFunction) => {
    if (req.headers['content-type']?.toLowerCase().startsWith('application/x-www-form-urlencoded;charset=utf-8;')) {
      req.headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }
    next();
  });
  app.getHttpAdapter().getInstance().set('etag', false);
  app.use(helmet(helmetConfig));
  app.use(express.json());
  // set CORP header
  app.use((_: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Set CORP header
    next();
  });
  app.use(
    compression({
      filter: (req: Request) => {
        return req.url.indexOf('stream.cgi') === -1 && req.url.indexOf('-cover') === -1;
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
      .setTitle('Music Server API')
      .setDescription(
        [
          'API documentation for building your own audio client on Music Server.',
          // eslint-disable-next-line max-len
          'This API consists of "Standard API" with User, Admin and Guest APIs that allow you to manage your music library and user accounts.  These APIs return JSON except where serving image/audio files and each have their successful and erroneous responses defined.\n',
          'Each endpoint has a single input and response format and URL structure describing its functionality.',
          'Endpoints map directly to source code, eg `/api/user/list-albums` is found in `/src/api/user/list-albums`.',
          '\nThe Synology and QNAP APIs are documented here to share learnings, you should not build on them.',
        ].join('\n '),
      )
      .setExternalDoc('View documentation online', 'https://musiclib.github.io/music-server')
      .setLicense('Source code repository', 'https://github.com/musiclib/music-server')
      .addTag(GUEST_APIS, 'Standard APIs for guests to sign in or any other unauthenticated actions.')
      .addTag(USER_APIS, 'Standard APIs for users to create and manage their collections and other data.')
      .addTag(ADMIN_APIS, 'Standard APIs for administrators to manage the platform and its users.')
      .addTag(
        SYNOLOGY_AUDIOSTATION_APIS,
        'Compatibility layer emulating Synology AudioStation, for Synology DS Audio smartphone apps.',
      )
      .addTag(
        QNAP_MUSICSTATION_APIS,
        'Compatibility layer emulating QNAP Music Station, for QNAP QMusic smartphone apps.',
      )
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
        operationsSorter: 'alpha',
        withCredentials: true,
        supportedSubmitMethods: process.env.NODE_ENV === 'test' ? [] : undefined,
      },
    });
  }
  const address = process.env.SERVER_ADDRESS || '127.0.0.1';
  const port = process.env.SERVER_PORT || 3000;
  await app.listen(port, address);
  logger.log(`API server is running on http://${address}:${port}`);
}

bootstrap();
