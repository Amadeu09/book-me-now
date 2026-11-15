-- Invalida les sessions antigues quan es canvia o es restableix la contrasenya.
ALTER TABLE "Usuari" ADD COLUMN "credencialsCanviades" TIMESTAMP(3);
