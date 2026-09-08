import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LibreTranslateService } from './libretranslate.service';
import { TranslationsService } from './translations.service';

@Module({
  imports: [PrismaModule],
  providers: [TranslationsService, LibreTranslateService],
  exports: [TranslationsService],
})
export class TranslationsModule {}
