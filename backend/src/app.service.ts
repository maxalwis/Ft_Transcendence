import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onApplicationBootstrap() {
    // Wait a brief moment or ensure Prisma is connected
    setTimeout(async () => {
      await this.waitForDatabase();
      await this.checkAndCreateDefaultUser();
      await this.checkAndIngestData();
    }, 1500);
  }

  // Safety check to ensure Prisma client is available
  private async waitForDatabase() {
    let retries = 5;
    while (retries > 0) {
      try {
        if (this.prisma && this.prisma.user) {
          return;
        }
      } catch (e) {
        // Ignore until ready
      }
      this.logger.warn('Waiting for Prisma client to initialize...');
      await new Promise((res) => setTimeout(res, 1000));
      retries--;
    }
  }

  onApplicationShutdown(signal: string) {
    this.logger.log(`Backend received ${signal} signal: shutting down gracefully...`);
  }

  private async checkAndCreateDefaultUser() {
    try {
      if (!this.prisma?.user) {
        this.logger.error('Prisma user model is undefined.');
        return;
      }

      const userCount = await this.prisma.user.count();

      if (userCount > 0) {
        this.logger.log(
          `Database already contains ${userCount} user(s). Skipping default user creation.`
        );
        return;
      }

      this.logger.log('No users found. Creating default test user...');

      const defaultUser = await this.prisma.user.create({
        data: {
          username: 'Test User',
          email: 'test@transcendence.com',
          password: 'mdp123secret',
        },
      });

      this.logger.log(
        `Default user created successfully (ID: ${defaultUser.id}, Email: ${defaultUser.email})`
      );
    } catch (error) {
      this.logger.error(`Failed to create default user: ${error.message}`);
    }
  }

  private async checkAndIngestData() {
    try {
      if (!this.prisma?.event) {
        this.logger.error('Prisma event model is undefined.');
        return;
      }

      const eventCount = await this.prisma.event.count();

      if (eventCount > 0) {
        this.logger.log(`Database already contains ${eventCount} events. Skipping auto-ingestion.`);
        return;
      }

      this.logger.log('Database is empty. Triggering automatic Mairie de Paris ingestion...');
      const port = process.env.PORT ?? 3000;

      const response = await fetch(`http://127.0.0.1:${port}/ingestion/mairie-paris`, {
        method: 'POST',
      });

      if (response.ok) {
        this.logger.log('Mairie de Paris data ingested successfully!');
      } else {
        this.logger.warn(`Ingestion returned status: ${response.status}`);
      }
    } catch (error) {
      this.logger.error(`Failed to check database or trigger ingestion: ${error.message}`);
    }
  }
}
