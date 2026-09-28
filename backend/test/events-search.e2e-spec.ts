import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('GET /events/search (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const agent = typeof request === 'function' ? request : (request as any).default;

  // Unique keyword so the text search only matches the events created here
  const keyword = `e2esearch${Date.now()}`;
  const source = `e2e-search-${Date.now()}`;
  const day = 24 * 60 * 60 * 1000;

  // Created out of alphabetical and chronological order on purpose
  const fixtures = [
    { title: `Charlie ${keyword}`, inDays: 3 },
    { title: `Alpha ${keyword}`, inDays: 5 },
    { title: `Bravo ${keyword}`, inDays: 1 },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Same pipe as main.ts: the DTO defaults and number conversion rely on it
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    for (const [index, fixture] of fixtures.entries()) {
      await prisma.event.create({
        data: {
          source,
          externalId: `${source}-${index}`,
          title: fixture.title,
          description: 'Event used by the search e2e test',
          dateStart: new Date(Date.now() + fixture.inDays * day),
          dateEnd: new Date(Date.now() + fixture.inDays * day + 2 * 60 * 60 * 1000),
          latitude: 48.8566,
          longitude: 2.3522,
          city: 'Paris',
          category: [],
        },
      });
    }
  }, 30000);

  afterAll(async () => {
    if (prisma) await prisma.event.deleteMany({ where: { source } });
    if (app) await app.close();
  });

  const search = (query: Record<string, string | number>) =>
    agent(app.getHttpServer())
      .get('/events/search')
      .query({ q: keyword, ...query });

  const titles = (body: { data: { title: string }[] }) =>
    body.data.map((event) => event.title.split(' ')[0]);

  it('filters by text and sorts by date ascending by default', async () => {
    const res = await search({}).expect(200);

    expect(res.body.total).toBe(3);
    expect(titles(res.body)).toEqual(['Bravo', 'Charlie', 'Alpha']);
  });

  it('sorts by title in both directions', async () => {
    const asc = await search({ sort: 'title', order: 'asc' }).expect(200);
    const desc = await search({ sort: 'title', order: 'desc' }).expect(200);

    expect(titles(asc.body)).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(titles(desc.body)).toEqual(['Charlie', 'Bravo', 'Alpha']);
  });

  it('paginates on the server', async () => {
    const page1 = await search({ sort: 'title', limit: 2, page: 1 }).expect(200);
    const page2 = await search({ sort: 'title', limit: 2, page: 2 }).expect(200);

    expect(page1.body).toMatchObject({ total: 3, page: 1, limit: 2, totalPages: 2 });
    expect(titles(page1.body)).toEqual(['Alpha', 'Bravo']);
    expect(titles(page2.body)).toEqual(['Charlie']);
  });

  it('rejects a sort field outside the whitelist', async () => {
    await search({ sort: 'id; DROP TABLE "Event"' }).expect(400);
  });

  it('rejects a page size above the limit', async () => {
    await search({ limit: 500 }).expect(400);
  });
});
