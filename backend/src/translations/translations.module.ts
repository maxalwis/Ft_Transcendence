import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LibreTranslateService } from './libretranslate.service';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';

@Module({
  imports: [PrismaModule],
  controllers: [TranslationsController],
  providers: [TranslationsService, LibreTranslateService],
  exports: [TranslationsService],
})
export class TranslationsModule {}
