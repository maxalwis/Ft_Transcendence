<<<<<<< HEAD
import 'dotenv/config';
import { defineConfig } from '@prisma/config';
=======
import { defineConfig } from '@prisma/config';
import 'dotenv/config';
>>>>>>> dev

export default defineConfig({
  datasource: {
<<<<<<< HEAD
    url: process.env.DATABASE_URL || "postgresql://transcendence:changeme@main_db:5432/transcendence?schema=public",
=======
    url: process.env.DATABASE_URL || '',
>>>>>>> dev
  },
});