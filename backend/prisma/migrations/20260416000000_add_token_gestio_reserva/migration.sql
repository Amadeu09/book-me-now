-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN "tokenGestio" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_tokenGestio_key" ON "Reserva"("tokenGestio");
