import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LibreTranslateService } from './libretranslate.service';

const SUPPORTED_LANGS = ['en', 'es', 'ar'];
type TranslatableField = 'title' | 'description' | 'priceDetail' | 'category';

@Injectable()
export class TranslationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly libreTranslate: LibreTranslateService
  ) {}

  async getTranslatedDescription(eventId: string, lang: string): Promise<string> {
    return this.getTranslatedField(eventId, 'description', lang);
  }

  async getTranslatedTitle(eventId: string, lang: string): Promise<string> {
    return this.getTranslatedField(eventId, 'title', lang);
  }

  async getTranslatedPriceDetail(eventId: string, lang: string): Promise<string> {
    return this.getTranslatedField(eventId, 'priceDetail', lang);
  }

  // fonction à part pour la catégorie vu que string[] et non string
  // on traduit et renvoie le premier élément de string[]
  async getTranslatedCategory(eventId: string, lang: string): Promise<string> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { category: true },
    });
    if (!event) {
      throw new NotFoundException(`Couldn't find event ${eventId}`);
    }

    const sourceText = event.category?.[0];
    if (!sourceText) return '';

    if (lang === 'fr') return sourceText;
    if (!SUPPORTED_LANGS.includes(lang)) {
      throw new BadRequestException(`Unsupported language: ${lang}`);
    }

    // 1. Cache DB
    const cached = await this.prisma.translationCache.findUnique({
      where: {
        eventId_lang_field: {
          eventId,
          lang,
          field: 'category',
        },
      },
    });

    if (cached) {
      return cached.translatedText;
    }

    // 2. Traduction à la demande + mise en cache persistant
    const translatedText = await this.libreTranslate.translate(sourceText, lang);

    const saved = await this.prisma.translationCache.upsert({
      where: {
        eventId_lang_field: {
          eventId,
          lang,
          field: 'category',
        },
      },
      create: {
        eventId,
        lang,
        field: 'category',
        translatedText,
      },
      update: {
        translatedText,
      },
    });

    return saved.translatedText;
  }

  private async getTranslatedField(
    eventId: string,
    field: TranslatableField,
    lang: string
  ): Promise<string> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { [field]: true } as Record<TranslatableField, true>,
    });
    if (!event) {
      throw new NotFoundException(`Couldn't find event ${eventId}`);
    }

    const record = event as unknown as Record<TranslatableField, string | null>;
    const sourceText = record[field];
    if (!sourceText) {
      return '';
    }

    // Si on demande le français, pas de traduction : la table Event est déjà la source FR.
    if (lang === 'fr') {
      return sourceText;
    }

    if (!SUPPORTED_LANGS.includes(lang)) {
      throw new BadRequestException(
        `Unsupported language: ${lang} (expected: fr, ${SUPPORTED_LANGS.join(', ')})`
      );
    }

    // 1. Cache DB
    const cached = await this.prisma.translationCache.findUnique({
      where: {
        eventId_lang_field: {
          eventId,
          lang,
          field,
        },
      },
    });

    if (cached) {
      return cached.translatedText;
    }

    // 2. Traduction à la demande + mise en cache persistant
    const translatedText = await this.libreTranslate.translate(sourceText, lang);

    const saved = await this.prisma.translationCache.upsert({
      where: {
        eventId_lang_field: {
          eventId,
          lang,
          field,
        },
      },
      create: {
        eventId,
        lang,
        field,
        translatedText,
      },
      update: {
        translatedText,
      },
    });

    return saved.translatedText;
  }
}
