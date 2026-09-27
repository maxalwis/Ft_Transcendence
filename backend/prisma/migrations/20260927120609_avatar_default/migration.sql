-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatar" SET DEFAULT '/profile_picture_default.webp';

-- Backfill existing users with no avatar (NULL or empty string) to the default picture
UPDATE "User" SET "avatar" = '/profile_picture_default.webp' WHERE "avatar" IS NULL OR "avatar" = '';
