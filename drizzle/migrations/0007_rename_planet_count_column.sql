-- Rename planet_count column to sector_count (ESLint enforcement)
-- This fixes the last remaining database column with "planet" terminology

ALTER TABLE "empires" RENAME COLUMN "planet_count" TO "sector_count";
