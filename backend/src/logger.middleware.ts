import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const decodedUrl = decodeURIComponent(originalUrl);

      // ANSI escape codes for grey and reset
      const grey = '\x1b[90m';

      // Spaces padding to match the width of the timestamp, process ID, and log level prefix after the newline
      const padding = '                                                         ';

      const logMessage = [
        `${method} ${grey}${decodedUrl} ${statusCode} - ${duration}ms`,
        `${padding}${grey}|- Body: ${JSON.stringify(body)}`,
        `${padding}${grey}\`- Query: ${JSON.stringify(query)}`,
      ].join('\n');

      this.logger.log(logMessage);
    });

    next();
  }
}
