/*
  Warnings:

  - You are about to drop the column `colorPrimari` on the `Empresa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Empresa" DROP COLUMN "colorPrimari";

-- AlterTable
ALTER TABLE "Usuari" ADD COLUMN     "colorPrimari" TEXT;
