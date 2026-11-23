-- Registre dels correus enviats i avisos de quota
CREATE TABLE "CorreuEnviat" (
    "id" SERIAL NOT NULL,
    "tipus" TEXT NOT NULL,
    "empresaId" INTEGER,
    "destinataris" INTEGER NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CorreuEnviat_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CorreuEnviat_createdAt_idx" ON "CorreuEnviat"("createdAt");
CREATE INDEX "CorreuEnviat_empresaId_createdAt_idx" ON "CorreuEnviat"("empresaId", "createdAt");

CREATE TABLE "AvisQuota" (
    "clau" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvisQuota_pkey" PRIMARY KEY ("clau")
);
