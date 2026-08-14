import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      enableDebugMessages: true,
    })
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // Automatically trigger data ingestion on first startup
  const logger = new Logger('Bootstrap');

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