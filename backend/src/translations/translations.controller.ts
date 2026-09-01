import { Controller, Get, Param, Query } from '@nestjs/common';
import { TranslationsService } from './translations.service';

@Controller('events/:id')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Get('description')
  async getDescription(@Param('id') id: string, @Query('lang') lang: string) {
    const translatedText = await this.translationsService.getTranslatedDescription(id, lang);
    return { lang, translatedText };
  }

  @Get('title')
  async getTitle(@Param('id') id: string, @Query('lang') lang: string) {
    const translatedText = await this.translationsService.getTranslatedTitle(id, lang);
    return { lang, translatedText };
  }
}
