/*
  Warnings:

  - The values [ADMIN_SALA] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('ADMIN_GENERAL', 'EMPLEAT');
ALTER TABLE "Usuari" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "public"."Rol_old";
COMMIT;
