/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ShopMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ShopMember_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ShopMember_userId_key" ON "ShopMember"("userId");
