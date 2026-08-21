import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Ingestion (e2e)', () => {
  let app: INestApplication;
  const agent = typeof request === 'function' ? request : (request as any).default;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  it('/ingestion/mairie-paris (POST)', () => {
    return agent(app.getHttpServer())
      .post('/ingestion/mairie-paris')
      .expect(201);
  }, 30000); // 30s timeout for real API fetch + DB operations

  afterAll(async () => {
    if (app) {
      const prismaService = app.get(PrismaService, { strict: false });
      if (prismaService && typeof prismaService.$disconnect === 'function') {
        await prismaService.$disconnect();
      }

      await app.close();
    }
  });
});