-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_shopId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_userId_fkey";

-- DropIndex
DROP INDEX "Conversation_shopId_updatedAt_idx";

-- DropIndex
DROP INDEX "Conversation_userId_updatedAt_idx";

-- CreateIndex
CREATE INDEX "Conversation_shopId_userId_updatedAt_idx" ON "Conversation"("shopId", "userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_shopId_userId_fkey" FOREIGN KEY ("shopId", "userId") REFERENCES "ShopMember"("shopId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;
