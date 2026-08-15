import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonInstance } from './logger/winston-logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const grey = '\x1b[90m';
      const invisible = '\x1b[8m';
      const reset = '\x1b[0m';
      const padding = '                                                     ';
      const decodedUrl = decodeURIComponent(originalUrl);

      const humanMessage = [
        `${method} ${grey}${decodedUrl} ${statusCode} - ${duration}ms`,
        `${padding}${invisible}${method}${reset}${grey}|- Body: ${JSON.stringify(body)}`,
        `${padding}${invisible}${method}${reset}${grey}\`- Query: ${JSON.stringify(query)}`,
      ].join('\n');

      // Log with extra metadata context (ideal for structured log pipelines)
      this.logger.log(
        humanMessage /*, {
        method,
        originalUrl: decodedUrl,
        statusCode,
        duration,
        body,
        query,
      }*/
      );

      WinstonInstance.info('HTTP Request', {
        method,
        originalUrl: decodedUrl,
        statusCode,
        duration,
        body,
        query,
      });
    });

    next();
  }
}
