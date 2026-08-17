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
  Logger.log(`Server is running on http://localhost:${port}`);
}
bootstrap();