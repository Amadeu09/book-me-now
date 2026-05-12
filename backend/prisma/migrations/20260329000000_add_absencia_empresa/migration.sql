-- CreateEnum
CREATE TYPE "TipusAbsenciaEmpresa" AS ENUM ('FESTA_LOCAL', 'FESTA_ESTATAL', 'PONT', 'ALTRE');

-- CreateTable
CREATE TABLE "AbsenciaEmpresa" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "titol" TEXT NOT NULL,
    "inici" TIMESTAMP(3) NOT NULL,
    "fi" TIMESTAMP(3) NOT NULL,
    "tipus" "TipusAbsenciaEmpresa" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbsenciaEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AbsenciaEmpresa_empresaId_inici_idx" ON "AbsenciaEmpresa"("empresaId", "inici");

-- AddForeignKey
ALTER TABLE "AbsenciaEmpresa" ADD CONSTRAINT "AbsenciaEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
