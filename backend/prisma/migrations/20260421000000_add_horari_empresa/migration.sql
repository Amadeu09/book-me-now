-- CreateTable
CREATE TABLE "HorariEmpresa" (
    "id"        SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "dow"       INTEGER NOT NULL,
    "iniciMin"  INTEGER NOT NULL,
    "fiMin"     INTEGER NOT NULL,

    CONSTRAINT "HorariEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HorariEmpresa_empresaId_dow_idx" ON "HorariEmpresa"("empresaId", "dow");

-- AddForeignKey
ALTER TABLE "HorariEmpresa"
    ADD CONSTRAINT "HorariEmpresa_empresaId_fkey"
    FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
