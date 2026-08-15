import { Injectable, LoggerService } from '@nestjs/common';
import { WinstonInstance } from './winston-logger';

@Injectable()
export class AppLogger implements LoggerService {
  log(message: string, context?: string) {
    WinstonInstance.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    WinstonInstance.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    WinstonInstance.warn(message, { context });
  }

  debug(message: string, context?: string) {
    WinstonInstance.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    WinstonInstance.verbose(message, { context });
  }
}