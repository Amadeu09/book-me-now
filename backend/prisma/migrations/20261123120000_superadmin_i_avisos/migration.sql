-- Superadmin, invitacions i registre d'accions
CREATE TABLE "SuperAdmin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "credencialsCanviades" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SuperAdmin_email_key" ON "SuperAdmin"("email");
CREATE UNIQUE INDEX "SuperAdmin_resetToken_key" ON "SuperAdmin"("resetToken");

CREATE TABLE "Invitacio" (
    "id" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "email" TEXT,
    "nomEmpresa" TEXT,
    "caduca" TIMESTAMP(3) NOT NULL,
    "usadaAt" TIMESTAMP(3),
    "revocada" BOOLEAN NOT NULL DEFAULT false,
    "empresaId" INTEGER,
    "creadaPerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitacio_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Invitacio_tokenHash_key" ON "Invitacio"("tokenHash");
CREATE INDEX "Invitacio_createdAt_idx" ON "Invitacio"("createdAt");
ALTER TABLE "Invitacio" ADD CONSTRAINT "Invitacio_creadaPerId_fkey" FOREIGN KEY ("creadaPerId") REFERENCES "SuperAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "RegistreAccio" (
    "id" SERIAL NOT NULL,
    "superAdminId" INTEGER NOT NULL,
    "accio" TEXT NOT NULL,
    "detall" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistreAccio_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RegistreAccio_createdAt_idx" ON "RegistreAccio"("createdAt");
ALTER TABLE "RegistreAccio" ADD CONSTRAINT "RegistreAccio_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "SuperAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Avisos al negoci: subscripcions push i campana
CREATE TABLE "PushSubscripcio" (
    "id" SERIAL NOT NULL,
    "usuariId" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushSubscripcio_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PushSubscripcio_endpoint_key" ON "PushSubscripcio"("endpoint");
CREATE INDEX "PushSubscripcio_usuariId_idx" ON "PushSubscripcio"("usuariId");
ALTER TABLE "PushSubscripcio" ADD CONSTRAINT "PushSubscripcio_usuariId_fkey" FOREIGN KEY ("usuariId") REFERENCES "Usuari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Notificacio" (
    "id" SERIAL NOT NULL,
    "usuariId" INTEGER NOT NULL,
    "tipus" TEXT NOT NULL,
    "titol" TEXT NOT NULL,
    "cos" TEXT NOT NULL,
    "reservaId" INTEGER,
    "llegida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notificacio_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notificacio_usuariId_llegida_createdAt_idx" ON "Notificacio"("usuariId", "llegida", "createdAt");
ALTER TABLE "Notificacio" ADD CONSTRAINT "Notificacio_usuariId_fkey" FOREIGN KEY ("usuariId") REFERENCES "Usuari"("id") ON DELETE CASCADE ON UPDATE CASCADE;
