/*
  Warnings:

  - A unique constraint covering the columns `[idUsuari]` on the table `Treballador` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idUsuari` to the `Treballador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Treballador" ADD COLUMN     "idUsuari" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Treballador_idUsuari_key" ON "Treballador"("idUsuari");

-- AddForeignKey
ALTER TABLE "Treballador" ADD CONSTRAINT "Treballador_idUsuari_fkey" FOREIGN KEY ("idUsuari") REFERENCES "Usuari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
