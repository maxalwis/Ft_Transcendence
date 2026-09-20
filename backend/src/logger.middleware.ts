import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonInstance } from './logger/winston-logger';

function sanitize(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  const result: Record<string, unknown> = {};

  for (const [key, currentValue] of Object.entries(value)) {
    if (key === 'password' || key === 'accessToken' || key === 'refreshToken') {
      result[key] = '[REDACTED]';
    } else {
      result[key] = sanitize(currentValue);
    }
  }

  return result;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query } = req;
    const start = Date.now();

    // Intercept response body chunks to capture exception details
    let responseBody: any;
    const originalWrite = res.write;
    const originalEnd = res.end;
    const chunks: Buffer[] = [];

    // Duplicates logs protection
    if ((req as any).__isLogged) {
      return next();
    }
    (req as any).__isLogged = true;

    res.write = function (chunk: any, ...args: any[]) {
      if (chunk) chunks.push(Buffer.from(chunk));
      return originalWrite.apply(res, [chunk, ...args] as any);
    };

    res.end = function (chunk: any, ...args: any[]) {
      if (chunk) chunks.push(Buffer.from(chunk));
      return originalEnd.apply(res, [chunk, ...args] as any);
    };

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const grey = '\x1b[90m';
      const invisible = '\x1b[8m';
      const reset = '\x1b[0m';
      const padding = '                                                     ';
      const decodedUrl = decodeURIComponent(originalUrl);

      // Parse captured response body if available
      try {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        responseBody = JSON.parse(rawBody);
      } catch {
        responseBody = null;
      }

      // Extract the reason from NestJS exception object or standard message string
      const reason =
        responseBody?.message ||
        responseBody?.error ||
        (statusCode >= 400 ? 'Unknown Error' : undefined);

      // Format human-readable terminal output with reason
      const logLines = [
        `${method} ${grey}${decodedUrl} ${statusCode} - ${duration}ms`,
        `${padding}${invisible}${method}${reset}${grey}|- Body: ${JSON.stringify(sanitize(body))}`,
        `${padding}${invisible}${method}${reset}${grey}|- Query: ${JSON.stringify(sanitize(query))}`,
      ];

      if (reason) {
        logLines.push(
          `${padding}${invisible}${method}${reset}${grey}\`- Reason: ${Array.isArray(reason) ? reason.join(', ') : reason}`
        );
      }

      const humanMessage = logLines.join('\n');

      const logPayload = {
        '@timestamp': new Date().toISOString(),
        http: {
          method,
          originalUrl: decodedUrl,
          statusCode,
          duration,
          body: sanitize(body),
          query: sanitize(query),
          reason,
          response: sanitize(responseBody),
        },
      };

      // Log according to HTTP status code severity
      if (statusCode >= 500) {
        this.logger.error(humanMessage);
        WinstonInstance.error('HTTP Request Error', logPayload);
      } else if (statusCode >= 400) {
        this.logger.warn(humanMessage);
        WinstonInstance.warn('HTTP Request Warning', logPayload);
      } else {
        this.logger.log(humanMessage);
        WinstonInstance.info('HTTP Request', logPayload);
      }
    });

    next();
  }
}
