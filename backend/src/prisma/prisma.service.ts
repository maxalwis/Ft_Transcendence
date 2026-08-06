import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// adapter Postgres obligatoire avec Prisma 7
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Connexion/déconnexion du client Prisma, gérées automatiquement par NestJS
// via les hooks de cycle de vie onModuleInit() et onModuleDestroy().
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
