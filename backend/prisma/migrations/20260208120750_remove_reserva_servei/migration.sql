/*
  Warnings:

  - You are about to drop the `ReservaServei` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `serveiId` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReservaServei" DROP CONSTRAINT "ReservaServei_reservaId_fkey";

-- DropForeignKey
ALTER TABLE "ReservaServei" DROP CONSTRAINT "ReservaServei_serveiId_fkey";

-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "serveiId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ReservaServei";

-- CreateIndex
CREATE INDEX "Reserva_serveiId_idx" ON "Reserva"("serveiId");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_serveiId_fkey" FOREIGN KEY ("serveiId") REFERENCES "Servei"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
