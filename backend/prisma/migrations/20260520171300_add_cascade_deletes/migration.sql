/*
  Warnings:

  - You are about to drop the `Factura` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Jornada` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LineaFactura` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[resetToken]` on the table `Usuari` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Absencia" DROP CONSTRAINT "Absencia_treballadorId_fkey";

-- DropForeignKey
ALTER TABLE "AbsenciaEmpresa" DROP CONSTRAINT "AbsenciaEmpresa_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "Factura" DROP CONSTRAINT "Factura_reservaId_fkey";

-- DropForeignKey
ALTER TABLE "Jornada" DROP CONSTRAINT "Jornada_treballadorId_fkey";

-- DropForeignKey
ALTER TABLE "JornadaDiaRotacio" DROP CONSTRAINT "JornadaDiaRotacio_rotacioId_fkey";

-- DropForeignKey
ALTER TABLE "JornadaPlantilla" DROP CONSTRAINT "JornadaPlantilla_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "JornadaRotacio" DROP CONSTRAINT "JornadaRotacio_plantillaId_fkey";

-- DropForeignKey
ALTER TABLE "JornadaTram" DROP CONSTRAINT "JornadaTram_diaId_fkey";

-- DropForeignKey
ALTER TABLE "LineaFactura" DROP CONSTRAINT "LineaFactura_facturaId_fkey";

-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "Servei" DROP CONSTRAINT "Servei_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "Treballador" DROP CONSTRAINT "Treballador_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "TreballadorServei" DROP CONSTRAINT "TreballadorServei_serveiId_fkey";

-- DropForeignKey
ALTER TABLE "TreballadorServei" DROP CONSTRAINT "TreballadorServei_treballadorId_fkey";

-- DropForeignKey
ALTER TABLE "Usuari" DROP CONSTRAINT "Usuari_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "Valoracio" DROP CONSTRAINT "Valoracio_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "Valoracio" DROP CONSTRAINT "Valoracio_treballadorId_fkey";

-- AlterTable
ALTER TABLE "Servei" ALTER COLUMN "categoria" SET DEFAULT 'OTROS';

-- AlterTable
ALTER TABLE "Usuari" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- DropTable
DROP TABLE "Factura";

-- DropTable
DROP TABLE "Jornada";

-- DropTable
DROP TABLE "LineaFactura";

-- CreateIndex
CREATE UNIQUE INDEX "Usuari_resetToken_key" ON "Usuari"("resetToken");

-- AddForeignKey
ALTER TABLE "Usuari" ADD CONSTRAINT "Usuari_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treballador" ADD CONSTRAINT "Treballador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servei" ADD CONSTRAINT "Servei_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreballadorServei" ADD CONSTRAINT "TreballadorServei_serveiId_fkey" FOREIGN KEY ("serveiId") REFERENCES "Servei"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreballadorServei" ADD CONSTRAINT "TreballadorServei_treballadorId_fkey" FOREIGN KEY ("treballadorId") REFERENCES "Treballador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracio" ADD CONSTRAINT "Valoracio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracio" ADD CONSTRAINT "Valoracio_treballadorId_fkey" FOREIGN KEY ("treballadorId") REFERENCES "Treballador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absencia" ADD CONSTRAINT "Absencia_treballadorId_fkey" FOREIGN KEY ("treballadorId") REFERENCES "Treballador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaPlantilla" ADD CONSTRAINT "JornadaPlantilla_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaRotacio" ADD CONSTRAINT "JornadaRotacio_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "JornadaPlantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaDiaRotacio" ADD CONSTRAINT "JornadaDiaRotacio_rotacioId_fkey" FOREIGN KEY ("rotacioId") REFERENCES "JornadaRotacio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaTram" ADD CONSTRAINT "JornadaTram_diaId_fkey" FOREIGN KEY ("diaId") REFERENCES "JornadaDiaRotacio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenciaEmpresa" ADD CONSTRAINT "AbsenciaEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
