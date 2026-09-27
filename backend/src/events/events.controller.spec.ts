import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsServiceMock: any;

  beforeEach(async () => {
    eventsServiceMock = {
      findForMap: jest.fn(),
      findAllForMap: jest.fn(),
      findNearby: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: eventsServiceMock }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findForMap', () => {
    it('should use the bbox search when a bbox is provided', () => {
      const bbox = { minLon: 0, minLat: 0, maxLon: 1, maxLat: 1 };
      controller.findForMap({ bbox, category: 'sport', price: 10 } as any);

      expect(eventsServiceMock.findForMap).toHaveBeenCalledWith(
        bbox,
        undefined,
        undefined,
        'sport',
        '10'
      );
      expect(eventsServiceMock.findAllForMap).not.toHaveBeenCalled();
    });

    it('should fall back to the unbounded search when no bbox is provided', () => {
      controller.findForMap({ city: 'Paris' } as any);

      expect(eventsServiceMock.findAllForMap).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        'Paris'
      );
      expect(eventsServiceMock.findForMap).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should default to french when no lang query param is given', () => {
      controller.findOne('event-1');

      expect(eventsServiceMock.findOne).toHaveBeenCalledWith('event-1', 'fr');
    });

    it('should forward the requested lang', () => {
      controller.findOne('event-1', 'en');

      expect(eventsServiceMock.findOne).toHaveBeenCalledWith('event-1', 'en');
    });
  });
});
