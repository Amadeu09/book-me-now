-- Substitueix la cua Bull/Redis per una tasca programada.
ALTER TABLE "Reserva" ADD COLUMN "emailPostCitaEnviat" BOOLEAN NOT NULL DEFAULT false;

-- Les reserves ja passades no han de rebre l'email ara (evita enviar-ne de cop).
UPDATE "Reserva" SET "emailPostCitaEnviat" = true WHERE "dataHora" < NOW();

CREATE INDEX "Reserva_emailPostCitaEnviat_dataHora_idx" ON "Reserva"("emailPostCitaEnviat", "dataHora");
