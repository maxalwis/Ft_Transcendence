import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:8080',
    credentials: true,
  }); 
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      enableDebugMessages: true,
    })
  );

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // Automatically trigger data ingestion on first startup

  try {
    logger.log('Triggering automatic Mairie de Paris ingestion...');

    const response = await fetch(`http://localhost:${port}/ingestion/mairie-paris`, {
      method: 'POST',
    });

    if (response.ok) {
      logger.log('Mairie de Paris data ingested successfully!');
    } else {
      logger.warn(`Ingestion returned status: ${response.status} (Data might already exist)`);
    }
  } catch (error) {
    logger.error('Failed to trigger automatic ingestion:', error.message);
  }
}

bootstrap();