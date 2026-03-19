/*
  Warnings:

  - Added the required column `tipus` to the `Absencia` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipusAbsencia" AS ENUM ('VACANCES', 'MALALTIA', 'PERMIS', 'ALTRE');

-- AlterTable
ALTER TABLE "Absencia" ADD COLUMN     "tipus" "TipusAbsencia" NOT NULL;

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "fotoPerfil" TEXT;

-- AlterTable
ALTER TABLE "Valoracio" ADD COLUMN     "nomClient" TEXT,
ADD COLUMN     "serveiId" INTEGER;

-- AddForeignKey
ALTER TABLE "Valoracio" ADD CONSTRAINT "Valoracio_serveiId_fkey" FOREIGN KEY ("serveiId") REFERENCES "Servei"("id") ON DELETE SET NULL ON UPDATE CASCADE;
