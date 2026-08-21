import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';
import { WinstonInstance } from './winston-logger';

@Injectable()
export class AppLogger extends ConsoleLogger implements LoggerService {
  log(message: string, context?: string) {
    // 1. Print to terminal using NestJS's native console styling
    super.log(message, context);
    // 2. Silently send to ELK
    WinstonInstance.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
    WinstonInstance.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
    WinstonInstance.warn(message, { context });
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
    WinstonInstance.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
    WinstonInstance.verbose(message, { context });
  }
}
