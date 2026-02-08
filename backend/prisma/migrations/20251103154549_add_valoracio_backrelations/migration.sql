-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN_GENERAL', 'ADMIN_SALA', 'EMPLEAT');

-- CreateEnum
CREATE TYPE "ReservaEstat" AS ENUM ('PENDENT', 'CONFIRMADA', 'CANCELLADA', 'FINALITZADA', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ValoracioTipus" AS ENUM ('SALA', 'TREBALLADOR');

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuari" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treballador" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "actiu" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treballador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servei" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "duradaMin" INTEGER NOT NULL,
    "preu" DECIMAL(10,2) NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "actiu" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT,
    "telefon" TEXT,
    "empresaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreballadorServei" (
    "id" SERIAL NOT NULL,
    "treballadorId" INTEGER NOT NULL,
    "serveiId" INTEGER NOT NULL,

    CONSTRAINT "TreballadorServei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaServei" (
    "id" SERIAL NOT NULL,
    "salaId" INTEGER NOT NULL,
    "serveiId" INTEGER NOT NULL,

    CONSTRAINT "SalaServei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapSala" (
    "id" SERIAL NOT NULL,
    "salaId" INTEGER NOT NULL,
    "treballadorId" INTEGER NOT NULL,

    CONSTRAINT "CapSala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" SERIAL NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "estat" "ReservaEstat" NOT NULL DEFAULT 'PENDENT',
    "salaId" INTEGER NOT NULL,
    "treballadorId" INTEGER,
    "clientId" INTEGER,
    "clientNom" TEXT,
    "clientEmail" TEXT,
    "observacions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaServei" (
    "id" SERIAL NOT NULL,
    "reservaId" INTEGER NOT NULL,
    "serveiId" INTEGER NOT NULL,
    "preuFinal" DECIMAL(10,2),
    "duradaFinal" INTEGER,
    "ordre" INTEGER,

    CONSTRAINT "ReservaServei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Valoracio" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "clientId" INTEGER,
    "tipus" "ValoracioTipus" NOT NULL,
    "salaId" INTEGER,
    "treballadorId" INTEGER,
    "puntuacio" INTEGER NOT NULL,
    "comentari" TEXT,
    "dataValoracio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Valoracio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" SERIAL NOT NULL,
    "reservaId" INTEGER NOT NULL,
    "dataEmissio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineaFactura" (
    "id" SERIAL NOT NULL,
    "facturaId" INTEGER NOT NULL,
    "concepte" TEXT NOT NULL,
    "quantitat" INTEGER NOT NULL DEFAULT 1,
    "preuUnitari" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "LineaFactura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jornada" (
    "id" SERIAL NOT NULL,
    "treballadorId" INTEGER NOT NULL,
    "inici" TIMESTAMP(3) NOT NULL,
    "fi" TIMESTAMP(3) NOT NULL,
    "recurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Absencia" (
    "id" SERIAL NOT NULL,
    "treballadorId" INTEGER NOT NULL,
    "inici" TIMESTAMP(3) NOT NULL,
    "fi" TIMESTAMP(3) NOT NULL,
    "motiu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Absencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuari_email_key" ON "Usuari"("email");

-- CreateIndex
CREATE INDEX "Usuari_empresaId_idx" ON "Usuari"("empresaId");

-- CreateIndex
CREATE INDEX "Treballador_empresaId_idx" ON "Treballador"("empresaId");

-- CreateIndex
CREATE INDEX "Treballador_actiu_idx" ON "Treballador"("actiu");

-- CreateIndex
CREATE INDEX "Sala_empresaId_idx" ON "Sala"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Sala_empresaId_nom_key" ON "Sala"("empresaId", "nom");

-- CreateIndex
CREATE INDEX "Servei_empresaId_idx" ON "Servei"("empresaId");

-- CreateIndex
CREATE INDEX "Servei_actiu_idx" ON "Servei"("actiu");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_empresaId_idx" ON "Client"("empresaId");

-- CreateIndex
CREATE INDEX "TreballadorServei_serveiId_idx" ON "TreballadorServei"("serveiId");

-- CreateIndex
CREATE UNIQUE INDEX "TreballadorServei_treballadorId_serveiId_key" ON "TreballadorServei"("treballadorId", "serveiId");

-- CreateIndex
CREATE INDEX "SalaServei_serveiId_idx" ON "SalaServei"("serveiId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaServei_salaId_serveiId_key" ON "SalaServei"("salaId", "serveiId");

-- CreateIndex
CREATE UNIQUE INDEX "CapSala_salaId_key" ON "CapSala"("salaId");

-- CreateIndex
CREATE INDEX "CapSala_treballadorId_idx" ON "CapSala"("treballadorId");

-- CreateIndex
CREATE INDEX "Reserva_salaId_dataHora_idx" ON "Reserva"("salaId", "dataHora");

-- CreateIndex
CREATE INDEX "Reserva_treballadorId_dataHora_idx" ON "Reserva"("treballadorId", "dataHora");

-- CreateIndex
CREATE INDEX "Reserva_clientId_idx" ON "Reserva"("clientId");

-- CreateIndex
CREATE INDEX "Reserva_estat_idx" ON "Reserva"("estat");

-- CreateIndex
CREATE INDEX "ReservaServei_serveiId_idx" ON "ReservaServei"("serveiId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservaServei_reservaId_serveiId_key" ON "ReservaServei"("reservaId", "serveiId");

-- CreateIndex
CREATE INDEX "Valoracio_empresaId_idx" ON "Valoracio"("empresaId");

-- CreateIndex
CREATE INDEX "Valoracio_tipus_salaId_treballadorId_idx" ON "Valoracio"("tipus", "salaId", "treballadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_reservaId_key" ON "Factura"("reservaId");

-- CreateIndex
CREATE INDEX "Jornada_treballadorId_inici_idx" ON "Jornada"("treballadorId", "inici");

-- CreateIndex
CREATE INDEX "Absencia_treballadorId_inici_idx" ON "Absencia"("treballadorId", "inici");

-- AddForeignKey
ALTER TABLE "Usuari" ADD CONSTRAINT "Usuari_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treballador" ADD CONSTRAINT "Treballador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sala" ADD CONSTRAINT "Sala_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servei" ADD CONSTRAINT "Servei_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreballadorServei" ADD CONSTRAINT "TreballadorServei_treballadorId_fkey" FOREIGN KEY ("treballadorId") REFERENCES "Treballador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreballadorServei" ADD CONSTRAINT "TreballadorServei_serveiId_fkey" FOREIGN KEY ("serveiId") REFERENCES "Servei"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaServei" ADD CONSTRAINT "SalaServei_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaServei" ADD CONSTRAINT "SalaServei_serveiId_fkey" FOREIGN KEY ("serveiId") REFERENCES "Servei"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapSala" ADD CONSTRAINT "CapSala_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapSala" ADD CONSTRAINT "CapSala_treballadorId_fkey" FOREIGN KEY ("treballadorId") REFERENCES "Treballador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_treballadorId_fkey" FOREIGN KEY ("treballadorId") REFERENCES "Treballador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaServei" ADD CONSTRAINT "ReservaServei_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaServei" ADD CONSTRAINT "ReservaServei_serveiId_fkey" FOREIGN KEY ("serveiId") REFERENCES "Servei"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracio" ADD CONSTRAINT "Valoracio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracio" ADD CONSTRAINT "Valoracio_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracio" ADD CONSTRAINT "Valoracio_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracio" ADD CONSTRAINT "Valoracio_treballadorId_fkey" FOREIGN KEY ("treballadorId") REFERENCES "Treballador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaFactura" ADD CONSTRAINT "LineaFactura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jornada" ADD CONSTRAINT "Jornada_treballadorId_fkey" FOREIGN KEY ("treballadorId") REFERENCES "Treballador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absencia" ADD CONSTRAINT "Absencia_treballadorId_fkey" FOREIGN KEY ("treballadorId") REFERENCES "Treballador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
