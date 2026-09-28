import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationsService } from '../translations/translations.service';

describe('EventsService', () => {
  let service: EventsService;
  let prismaMock: any;
  let translationsMock: any;

  const mockEvent = {
    id: 'evt-1',
    title: 'Concert',
    priceDetail: '10 EUR',
    category: ['musique'],
  };

  beforeEach(async () => {
    prismaMock = {
      event: { findUnique: jest.fn() },
      $queryRaw: jest.fn().mockResolvedValue([]),
    };
    translationsMock = {
      getTranslatedTitle: jest.fn().mockResolvedValue('Concert'),
      getTranslatedPriceDetail: jest.fn().mockResolvedValue('10 EUR'),
      getTranslatedCategory: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TranslationsService, useValue: translationsMock },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException if the event does not exist', async () => {
      prismaMock.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });

    it('should merge translated fields into the event, requesting them in the given lang', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findOne('evt-1', 'en');

      expect(translationsMock.getTranslatedTitle).toHaveBeenCalledWith('evt-1', 'en');
      expect(result).toEqual(mockEvent);
    });

    // Une catégorie traduite remplace le tableau original par un tableau à un
    // seul élément (cf. `category ? [category] : event.category`).
    it('should wrap a translated category into a single-item array', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      translationsMock.getTranslatedCategory.mockResolvedValue('music');

      const result = await service.findOne('evt-1', 'en');

      expect(result.category).toEqual(['music']);
    });
  });

  describe('search', () => {
    const baseQuery = {
      sort: 'date' as const,
      order: 'asc' as const,
      page: 1,
      limit: 10,
    };

    // $queryRaw est appelé en tagged template : on reconstruit le SQL à partir des fragments
    const sqlOf = (callIndex: number) => {
      const [strings, ...values] = prismaMock.$queryRaw.mock.calls[callIndex];
      return { text: strings.join('?'), values };
    };

    it('should return the page with pagination metadata', async () => {
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ total: BigInt(23) }])
        .mockResolvedValueOnce([{ id: 'evt-1' }]);

      const result = await service.search({ ...baseQuery, page: 2 });

      expect(result).toEqual({
        data: [{ id: 'evt-1' }],
        total: 23,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });

    it('should translate page and limit into LIMIT / OFFSET', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([{ total: 0n }]).mockResolvedValueOnce([]);

      await service.search({ ...baseQuery, page: 3, limit: 5 });

      const { values } = sqlOf(1);
      expect(values.slice(-2)).toEqual([5, 10]);
    });

    it('should order by the whitelisted SQL expression of the sort field', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([{ total: 0n }]).mockResolvedValueOnce([]);

      await service.search({ ...baseQuery, sort: 'popularity', order: 'desc' });

      const serialized = JSON.stringify(prismaMock.$queryRaw.mock.calls[1]);
      expect(serialized).toContain('interestCount');
      expect(serialized).toContain('DESC');
    });

    it('should escape LIKE wildcards in the text search', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([{ total: 0n }]).mockResolvedValueOnce([]);

      await service.search({ ...baseQuery, q: '100%_off' });

      const serialized = JSON.stringify(prismaMock.$queryRaw.mock.calls[0]);
      expect(serialized).toContain('%100\\\\%\\\\_off%');
    });
  });
});
