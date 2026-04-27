/*
  Warnings:

  - A unique constraint covering the columns `[tokenValoracio]` on the table `Reserva` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reservaId,tipus]` on the table `Valoracio` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "tokenValoracio" TEXT,
ADD COLUMN     "tokenValoracioUsat" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Valoracio" ADD COLUMN     "reservaId" INTEGER,
ALTER COLUMN "puntuacio" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_tokenValoracio_key" ON "Reserva"("tokenValoracio");

-- CreateIndex
CREATE UNIQUE INDEX "Valoracio_reservaId_tipus_key" ON "Valoracio"("reservaId", "tipus");

-- AddForeignKey
ALTER TABLE "Valoracio" ADD CONSTRAINT "Valoracio_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE SET NULL ON UPDATE CASCADE;
