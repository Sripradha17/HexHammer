-- DropForeignKey
ALTER TABLE "Strike" DROP CONSTRAINT "Strike_levelNumber_fkey";

-- AlterTable
ALTER TABLE "Strike" ADD COLUMN     "trackId" TEXT,
ALTER COLUMN "levelNumber" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Strike_trackId_order_key" ON "Strike"("trackId", "order");

-- AddForeignKey
ALTER TABLE "Strike" ADD CONSTRAINT "Strike_levelNumber_fkey" FOREIGN KEY ("levelNumber") REFERENCES "Level"("number") ON DELETE SET NULL ON UPDATE CASCADE;

