-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('PERRUQUERIA', 'BARBERIA', 'ESTETICA', 'SPA', 'MASSATGES', 'FITNESS', 'PILATES', 'IOGA', 'NUTRICIONISTA', 'FISIOTERAPIA', 'DENTAL', 'VETERINARIA', 'ALTRES', 'OTROS');

-- DropIndex
DROP INDEX "Empresa_nom_trgm_idx";

-- AlterTable
ALTER TABLE "Absencia" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "tipo" "BusinessType" NOT NULL DEFAULT 'OTROS';
