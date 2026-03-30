# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev       # Start with hot-reload
npm run build           # Compile TypeScript
npm run start:prod      # Run compiled production build

# Testing
npm test                # Run all unit tests
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # End-to-end tests
# Run a single test file:
npx jest src/auth/auth.service.spec.ts

# Code quality
npm run lint            # ESLint with auto-fix
npm run format          # Prettier formatting

# Database
npm run prisma:migrate  # Run migrations (dev)
npm run prisma:deploy   # Deploy migrations (prod)
npm run prisma:generate # Regenerate Prisma client after schema changes
npm run prisma:studio   # Open Prisma Studio GUI
```

## Architecture

NestJS REST API with PostgreSQL via Prisma ORM. All routes are prefixed with `/api`. Swagger docs at `/api/docs`. Health check at `/health`.

### Module Structure

Each feature module (`auth`, `usuaris`, `empresas`, `treballadors`, `serveis`, `clients`, `reserves`, `valoracions`, `factures`, `horaris`, `jornades`, `absencies`) follows the same pattern: `module.ts` → `controller.ts` → `service.ts` + `dto/`. The `PrismaModule` is globally available to all modules.

### Authentication & Authorization

- JWT strategy via Passport (`src/auth/strategies/`)
- Token blacklist service for logout invalidation (`src/auth/token-blacklist.service.ts`)
- Two roles: `ADMIN_GENERAL` and `EMPLEAT`
- Role guard in `src/common/guards/`, `@Roles()` decorator in `src/common/decorators/`
- `@CurrentUser()` decorator extracts the authenticated user from the request

### Global Middleware (app.module.ts)

- `AllExceptionsFilter` — centralizes all error responses
- `LoggingInterceptor` — logs all requests
- `ThrottlerModule` — three rate-limit tiers: 10 req/s, 100 req/min, 500 req/15min

### Environment Validation

`src/config/env.validation.ts` uses Zod to validate all env vars at startup. Copy `.env.example` to `.env`. Required: `DATABASE_URL` (PostgreSQL), `JWT_SECRET` (min 32 chars, no weak words), `JWT_EXPIRES_IN`, `NODE_ENV`, `PORT`, `ALLOWED_ORIGINS`.

### File Uploads

Cloudinary is configured in `src/cloudinary.config.ts` and used for profile/company photos. Requires `CLOUDINARY_*` env vars.

### Domain Model (Prisma)

Key entities and relationships:
- `Empresa` ← `Treballador` → `Usuari` (employee linked to a user account)
- `Treballador` ↔ `Servei` (many-to-many via `TreballadorServei`)
- `Reserva` links `Client`, `Treballador`, `Servei`; states: `PENDENT`, `CONFIRMADA`, `CANCELLADA`, `FINALITZADA`, `NO_SHOW`
- `Jornada` = individual work shift; `JornadaPlantilla` = shift template assigned to `Treballador`
- `JornadaTram` = time slots within a shift
- `Absencia` types: `VACANCES`, `MALALTIA`, `PERMIS`, `ALTRE`

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).


## Skills

Skills instaladas en `.claude/skills/`. Claude Code debe consultarlas proactivamente:

- **nodejs-backend-patterns** — al crear o refactorizar servicios, controladores o módulos
- **typescript-advanced-types** — al definir tipos, interfaces o generics
- **api-design-principles** — al crear o modificar endpoints REST
- **database-schema-design** — al tocar el schema de Prisma o queries
- **security-best-practices** — al trabajar con auth, guards, validación de inputs
- **backend-testing** — al escribir o revisar tests
- **better-auth-best-practices** — al modificar el módulo `auth/`