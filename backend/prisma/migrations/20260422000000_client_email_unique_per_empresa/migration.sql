-- Drop the global unique constraint on email
DROP INDEX IF EXISTS "Client_email_key";

-- Add compound unique constraint: unique email per empresa
CREATE UNIQUE INDEX "Client_email_empresaId_key" ON "Client"("email", "empresaId");
