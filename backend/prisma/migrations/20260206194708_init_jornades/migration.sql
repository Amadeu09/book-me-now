-- CreateTable
CREATE TABLE "JornadaPlantilla" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JornadaPlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JornadaRotacio" (
    "id" SERIAL NOT NULL,
    "plantillaId" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "nom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JornadaRotacio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JornadaDiaRotacio" (
    "id" SERIAL NOT NULL,
    "rotacioId" INTEGER NOT NULL,
    "dow" INTEGER NOT NULL,
    "esDescans" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JornadaDiaRotacio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JornadaTram" (
    "id" SERIAL NOT NULL,
    "diaId" INTEGER NOT NULL,
    "iniciMin" INTEGER NOT NULL,
    "fiMin" INTEGER NOT NULL,
    "ordre" INTEGER,

    CONSTRAINT "JornadaTram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreballadorJornadaPlantilla" (
    "id" SERIAL NOT NULL,
    "treballadorId" INTEGER NOT NULL,
    "plantillaId" INTEGER NOT NULL,
    "dataInici" TIMESTAMP(3) NOT NULL,
    "dataFi" TIMESTAMP(3),
    "anchorRotacioIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreballadorJornadaPlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JornadaPlantilla_empresaId_idx" ON "JornadaPlantilla"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "JornadaPlantilla_empresaId_nom_key" ON "JornadaPlantilla"("empresaId", "nom");

-- CreateIndex
CREATE INDEX "JornadaRotacio_plantillaId_idx" ON "JornadaRotacio"("plantillaId");

-- CreateIndex
CREATE UNIQUE INDEX "JornadaRotacio_plantillaId_index_key" ON "JornadaRotacio"("plantillaId", "index");

-- CreateIndex
CREATE INDEX "JornadaDiaRotacio_rotacioId_idx" ON "JornadaDiaRotacio"("rotacioId");

-- CreateIndex
CREATE UNIQUE INDEX "JornadaDiaRotacio_rotacioId_dow_key" ON "JornadaDiaRotacio"("rotacioId", "dow");

-- CreateIndex
CREATE INDEX "JornadaTram_diaId_idx" ON "JornadaTram"("diaId");

-- CreateIndex
CREATE INDEX "TreballadorJornadaPlantilla_treballadorId_dataInici_idx" ON "TreballadorJornadaPlantilla"("treballadorId", "dataInici");

-- CreateIndex
CREATE INDEX "TreballadorJornadaPlantilla_plantillaId_idx" ON "TreballadorJornadaPlantilla"("plantillaId");

-- AddForeignKey
ALTER TABLE "JornadaPlantilla" ADD CONSTRAINT "JornadaPlantilla_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaRotacio" ADD CONSTRAINT "JornadaRotacio_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "JornadaPlantilla"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaDiaRotacio" ADD CONSTRAINT "JornadaDiaRotacio_rotacioId_fkey" FOREIGN KEY ("rotacioId") REFERENCES "JornadaRotacio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaTram" ADD CONSTRAINT "JornadaTram_diaId_fkey" FOREIGN KEY ("diaId") REFERENCES "JornadaDiaRotacio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreballadorJornadaPlantilla" ADD CONSTRAINT "TreballadorJornadaPlantilla_treballadorId_fkey" FOREIGN KEY ("treballadorId") REFERENCES "Treballador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreballadorJornadaPlantilla" ADD CONSTRAINT "TreballadorJornadaPlantilla_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "JornadaPlantilla"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
