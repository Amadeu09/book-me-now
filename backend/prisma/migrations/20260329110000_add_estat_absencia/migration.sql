-- CreateEnum
CREATE TYPE "EstatAbsencia" AS ENUM ('PENDENT', 'APROVADA', 'REBUTJADA');

-- AlterTable
ALTER TABLE "Absencia"
  ADD COLUMN "estat"     "EstatAbsencia" NOT NULL DEFAULT 'PENDENT',
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Absencia_treballadorId_estat_idx" ON "Absencia"("treballadorId", "estat");
