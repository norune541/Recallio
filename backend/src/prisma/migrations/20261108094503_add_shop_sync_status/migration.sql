-- CreateEnum
CREATE TYPE "ShopifySyncStatus" AS ENUM ('IDLE', 'PENDING', 'CONNECTED', 'FAILED');

-- AlterTable
ALTER TABLE "ShopifyShop" ADD COLUMN     "syncStatus" "ShopifySyncStatus" NOT NULL DEFAULT 'IDLE';
