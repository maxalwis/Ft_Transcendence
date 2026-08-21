// @ts-nocheck
import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://transcendence:changeme@main_db:5432/transcendence",
  },
});