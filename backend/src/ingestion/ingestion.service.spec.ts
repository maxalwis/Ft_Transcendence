import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { PrismaService } from '../prisma/prisma.service';

describe('IngestionService', () => {
  let service: IngestionService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    event: {
      deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
      upsert: jest.fn().mockResolvedValue({ id: 'event-uuid-1' }),
    },
    $executeRaw: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleDailyIngestionAndCleanup', () => {
    it('should delete past events and trigger fetchFromMairieParis', async () => {
      jest.spyOn(service, 'fetchFromMairieParis').mockResolvedValue(undefined);

      await service.handleDailyIngestionAndCleanup();

      expect(prismaService.event.deleteMany).toHaveBeenCalledWith({
        where: {
          dateEnd: {
            lt: expect.any(Date),
          },
        },
      });
      expect(service.fetchFromMairieParis).toHaveBeenCalled();
    });
  });

  describe('fetchFromMairieParis', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should fetch and upsert events from OpenData API', async () => {
      const mockApiResponse = {
        total_count: 1,
        results: [
          {
            id: '12345',
            title: 'Exposition Test',
            lead_text: 'Une superbe exposition',
            date_start: '2026-09-01T10:00:00Z',
            date_end: '2026-09-10T18:00:00Z',
            lat_lon: { lat: 48.8566, lon: 2.3522 },
            qfap_tags: 'Art; Culture',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      await service.fetchFromMairieParis();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(prismaService.event.upsert).toHaveBeenCalledWith({
        where: { 
          source_externalId: { source: 'mairie_paris', externalId: '12345' } 
        },
        update: expect.objectContaining({
          title: 'Exposition Test',
          category: ['Art', 'Culture'],
        }),
        create: expect.objectContaining({
          source: 'mairie_paris',
          externalId: '12345',
          title: 'Exposition Test',
          category: ['Art', 'Culture'],
        }),
      });
      expect(prismaService.$executeRaw).toHaveBeenCalled();
    });

    it('should handle HTTP fetch failure gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await service.fetchFromMairieParis();

      expect(prismaService.event.upsert).not.toHaveBeenCalled();
    });
  });
});