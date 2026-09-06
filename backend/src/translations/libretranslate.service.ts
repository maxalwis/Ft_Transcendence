import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class LibreTranslateService {
  private readonly logger = new Logger(LibreTranslateService.name);
  private readonly baseUrl = process.env.LIBRETRANSLATE_URL ?? 'http://localhost:5000';

  async translate(text: string, targetLang: string, sourceLang = 'fr'): Promise<string> {
    const response = await fetch(`${this.baseUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Erreur LibreTranslate (${response.status}): ${errorText}`);
      throw new InternalServerErrorException('Le service de traduction est indisponible');
    }

    const data = (await response.json()) as { translatedText: string };
    return data.translatedText;
  }
}
