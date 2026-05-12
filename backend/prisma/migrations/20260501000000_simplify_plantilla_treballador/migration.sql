ALTER TABLE "Treballador" ADD COLUMN "plantillaId" INTEGER;
ALTER TABLE "Treballador" ADD CONSTRAINT "Treballador_plantillaId_fkey"
    FOREIGN KEY ("plantillaId") REFERENCES "JornadaPlantilla"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE "TreballadorJornadaPlantilla";