/*
  Warnings:

  - You are about to drop the column `salaId` on the `Reserva` table. All the data in the column will be lost.
  - You are about to drop the column `salaId` on the `Valoracio` table. All the data in the column will be lost.
  - You are about to drop the `CapSala` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sala` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaServei` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `empresaId` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."CapSala" DROP CONSTRAINT "CapSala_salaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CapSala" DROP CONSTRAINT "CapSala_treballadorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reserva" DROP CONSTRAINT "Reserva_salaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Sala" DROP CONSTRAINT "Sala_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalaServei" DROP CONSTRAINT "SalaServei_salaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalaServei" DROP CONSTRAINT "SalaServei_serveiId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Valoracio" DROP CONSTRAINT "Valoracio_salaId_fkey";

-- DropIndex
DROP INDEX "public"."Reserva_salaId_dataHora_idx";

-- DropIndex
DROP INDEX "public"."Valoracio_tipus_salaId_treballadorId_idx";

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "activa" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "capacitat" INTEGER,
ADD COLUMN     "ubicacio" TEXT;

-- AlterTable
ALTER TABLE "Reserva" DROP COLUMN "salaId",
ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Valoracio" DROP COLUMN "salaId";

-- DropTable
DROP TABLE "public"."CapSala";

-- DropTable
DROP TABLE "public"."Sala";

-- DropTable
DROP TABLE "public"."SalaServei";

-- CreateIndex
CREATE INDEX "Reserva_empresaId_dataHora_idx" ON "Reserva"("empresaId", "dataHora");

-- CreateIndex
CREATE INDEX "Valoracio_tipus_treballadorId_idx" ON "Valoracio"("tipus", "treballadorId");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
