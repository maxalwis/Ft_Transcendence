import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { AppLogger } from './logger/app-logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PublicApiModule } from './public-api/public-api.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Unauthorized by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      enableDebugMessages: true,
    })
  );

  // OpenAPI docs for the public API (served at /docs; /api/docs behind nginx)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Transcendence Public API')
    .setDescription('Public API to query and manage Paris events. Requires an API key.')
    .setVersion('1.0')
    .addServer('/api')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    include: [PublicApiModule],
    });
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();
  app.set('etag', false);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Server is running on http://localhost:${port}`);
}
bootstrap();
