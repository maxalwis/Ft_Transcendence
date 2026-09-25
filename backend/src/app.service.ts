import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class AppService implements OnApplicationShutdown {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    return 'Hello World!';
  }

  onApplicationShutdown(signal: string) {
    this.logger.log(`Backend received ${signal} signal: shutting down gracefully...`);
  }
}
