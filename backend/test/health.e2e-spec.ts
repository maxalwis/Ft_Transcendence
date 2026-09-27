import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Health (e2e)', () => {
  let app: INestApplication;
  const agent = typeof request === 'function' ? request : (request as any).default;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  it('GET /health reports the service and its database as up', async () => {
    const response = await agent(app.getHttpServer()).get('/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.info.database.status).toBe('up');
  });

  // Ingestion only runs from the daily cron / startup: the old unauthenticated
  // HTTP trigger let anyone hammer the Paris API and the DB, it must stay gone.
  it('POST /ingestion/mairie-paris is not exposed', () => {
    return agent(app.getHttpServer()).post('/ingestion/mairie-paris').expect(404);
  });

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
