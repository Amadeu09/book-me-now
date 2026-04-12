-- Activa l'extensió pg_trgm per a cerques de text parcial eficients
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índex GIN sobre "nom" per accelerar ILIKE '%query%'
CREATE INDEX IF NOT EXISTS "Empresa_nom_trgm_idx"
  ON "Empresa" USING GIN ("nom" gin_trgm_ops);
