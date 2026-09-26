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
});
