/*
  Warnings:

  - You are about to drop the column `shopId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Conversation` table. All the data in the column will be lost.
  - The primary key for the `ShopMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[shopId,userId]` on the table `ShopMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopMemberId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `ShopMember` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT', 'UNLISTED');

-- CreateEnum
CREATE TYPE "InventoryPolicy" AS ENUM ('DENY', 'CONTINUE');

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_shopId_userId_fkey";

-- DropIndex
DROP INDEX "Conversation_shopId_userId_updatedAt_idx";

-- DropIndex
DROP INDEX "ShopMember_userId_key";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "shopId",
DROP COLUMN "userId",
ADD COLUMN     "shopMemberId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ShopMember" DROP CONSTRAINT "ShopMember_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "ShopMember_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "shopifyProductId" TEXT NOT NULL,
    "shopId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionHtml" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "ProductStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "publishedAt" TIMESTAMPTZ(3),
    "totalInventory" INTEGER NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "featuredImageUrl" TEXT,
    "featuredImageAltText" TEXT,
    "featuredImageWidth" INTEGER,
    "featuredImageHeight" INTEGER,
    "onlineStoreUrl" TEXT,
    "onlineStorePreviewUrl" TEXT,
    "minVariantPrice" DECIMAL(12,2) NOT NULL,
    "minVariantCurrency" TEXT NOT NULL,
    "maxVariantPrice" DECIMAL(12,2) NOT NULL,
    "maxVariantCurrency" TEXT NOT NULL,
    "syncedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordUpdatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" UUID NOT NULL,
    "shopifyVariantId" TEXT NOT NULL,
    "productId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "compareAtPrice" DECIMAL(12,2),
    "inventoryQuantity" INTEGER NOT NULL,
    "inventoryPolicy" "InventoryPolicy" NOT NULL,
    "selectedOptions" JSONB NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_shopId_updatedAt_idx" ON "Product"("shopId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopId_shopifyProductId_key" ON "Product"("shopId", "shopifyProductId");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_shopifyVariantId_key" ON "ProductVariant"("productId", "shopifyVariantId");

-- CreateIndex
CREATE INDEX "Conversation_shopMemberId_updatedAt_idx" ON "Conversation"("shopMemberId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShopMember_shopId_userId_key" ON "ShopMember"("shopId", "userId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "ShopifyShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_shopMemberId_fkey" FOREIGN KEY ("shopMemberId") REFERENCES "ShopMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
