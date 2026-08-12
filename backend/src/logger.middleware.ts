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

      const baseUrl = originalUrl.split('?')[0];
      const sanitizedQuery = this.sanitizeData(query);
      const sanitizedBody = this.sanitizeData(body);

      this.logger.log(
        `${method} ${baseUrl} ${statusCode} - ${duration}ms | Body: ${JSON.stringify(
          sanitizedBody
        )} | Query: ${JSON.stringify(sanitizedQuery)}`
      );
    });

    next();
  }

  // Helper function to format bbox numbers to 1 decimal place
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const clone = Array.isArray(data) ? [] : {};
    for (const key of Object.keys(data)) {
      const value = data[key];

      if (typeof value === 'string') {
        if (key === 'bbox') {
          const parts = value.split(',').map((v) => {
            const num = parseFloat(v.trim());
            // Format to 1 decimal place if it's a valid number
            return !isNaN(num) ? num.toFixed(1) : v;
          });
          // Join them back with commas (or your preferred separator)
          clone[key] = parts.join(',');
        } else if (value.length > 30) {
          clone[key] = `${value.substring(0, 30)}... [truncated]`;
        } else {
          clone[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        clone[key] = this.sanitizeData(value);
      } else {
        clone[key] = value;
      }
    }
    return clone;
  }
}
