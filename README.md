# BookMeNow — Sistema de Gestió de Reserves

Plataforma SaaS per a la gestió empresarial amb cites prèvies. Dissenyada per a petites i mitjanes empreses de serveis (perruqueries, estètica, clíniques, gimnasos, etc.).

---

## Arquitectura — Monorepo de tres capes

```
BookMeNow-app/
├── backend/          → API REST (NestJS + PostgreSQL + Redis)
├── frontend/         → App mòbil i web (React Native + Expo)
├── client-portal/    → Portal públic (Next.js)
└── docker-compose.yml
```

| Capa | Tecnologia | Responsabilitat |
|------|-----------|-----------------|
| **backend** | NestJS 10 · Prisma · PostgreSQL 15 | Lògica de negoci, API REST, autenticació |
| **frontend** | React Native 0.81 · Expo SDK · Expo Router | App empresa/empleats (mòbil i web) |
| **client-portal** | Next.js · Tailwind CSS 4 | Portal públic de descoberta i reserva |

---

## Requisits previs

- **Node.js 20+**
- **Docker Desktop**
- **Git**

---

## Inici ràpid

### 1. Clonar

```bash
git clone https://github.com/u1980982-create/BookMeNow-app.git
cd BookMeNow-app
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edita .env amb les teves credencials

docker-compose up -d          # Aixeca PostgreSQL + Redis + backend
# O per a desenvolupament en host:
docker-compose up postgres redis -d
npm install
npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start          # Expo DevTools
# Prem 'w' per obrir al navegador, 'a' per Android
```

- Web: http://localhost:8081

### 4. Client Portal

```bash
cd client-portal
cp .env.example .env.local
npm install
npm run dev
```

- Portal: http://localhost:3002

---

## Variables d'entorn

### backend/.env

| Variable | Descripció |
|----------|-----------|
| `DATABASE_URL` | Connexió PostgreSQL |
| `JWT_SECRET` | Clau JWT (mínim 32 caràcters) |
| `JWT_EXPIRES_IN` | Durada del token (ex: `7d`) |
| `NODE_ENV` | `development` / `production` |
| `PORT` | Port del servidor (defecte 3000) |
| `ALLOWED_ORIGINS` | Orígens CORS separats per comes |
| `RESEND_API_KEY` | Clau per a emails transaccionals |
| `EMAIL_FROM` | Adreça emisora dels emails |
| `REDIS_HOST` / `REDIS_PORT` | Connexió Redis per a BullMQ |
| `CLOUDINARY_CLOUD_NAME` | Credencials Cloudinary (imatges) |
| `CLOUDINARY_API_KEY` | Credencials Cloudinary |
| `CLOUDINARY_API_SECRET` | Credencials Cloudinary |

Vegeu `backend/.env.example` per als valors per defecte.

### frontend/.env

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Per a dispositius físics, usa la IP local en lloc de `localhost`.

### client-portal/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Docker Compose

```bash
# Aixecar tot (Postgres + Redis + backend + frontend)
docker-compose up -d

# Logs
docker-compose logs -f backend

# Aturar
docker-compose down

# Aturar i eliminar dades
docker-compose down -v
```

---

## Comandes de desenvolupament

### Backend

```bash
npm run start:dev       # Hot-reload
npm run build           # Compilar TypeScript
npm test                # Tests unitaris
npm run test:cov        # Cobertura
npm run test:e2e        # Tests E2E
npx prisma studio       # GUI de base de dades
npx prisma migrate dev  # Nova migració
```

### Frontend

```bash
npm start               # Expo DevTools
npm run web             # Obrir directament al navegador
npm run android         # Android
npm run lint            # ESLint
```

### Client Portal

```bash
npm run dev             # Servidor de desenvolupament
npm run build           # Build de producció
npm run lint            # ESLint
```

---

## Stack tecnològic

### Backend
- NestJS 10 · TypeScript
- Prisma 6 + PostgreSQL 15
- JWT (Passport) + token blacklist per logout
- BullMQ + Redis per a tasques asíncrones (emails post-cita)
- Cloudinary per a imatges
- Resend per a emails transaccionals
- Swagger/OpenAPI 3.0
- Rate limiting en 3 nivells (Throttler)
- Zod per a validació de variables d'entorn

### Frontend
- React Native 0.81 · Expo SDK
- Expo Router (navegació basada en fitxers)
- React Query (TanStack) per a gestió d'estat del servidor
- Axios amb interceptors JWT
- AsyncStorage
- Tematització dinàmica per empresa (ThemeProvider)

### Client Portal
- Next.js · React Server Components
- Tailwind CSS 4
- Plus Jakarta Sans

---

## Funcionalitats

| Funcionalitat | Backend | Frontend | Portal |
|---------------|---------|----------|--------|
| Registre i login d'empresa | ✅ | ✅ | — |
| Gestió d'empleats (CRUD) | ✅ | ✅ | — |
| Gestió de serveis (CRUD + imatge + categoria) | ✅ | ✅ | ✅ |
| Base de clients | ✅ | ✅ | — |
| Motor de disponibilitat | ✅ | — | ✅ |
| Reserves (crear/confirmar/cancel·lar/finalitzar) | ✅ | ✅ | ✅ |
| Plantilles de torns amb rotació A/B | ✅ | ✅ | — |
| Absències individuals + tancaments empresa | ✅ | ✅ | — |
| Pujada d'imatges (Cloudinary) | ✅ | ✅ | — |
| Tematització dinàmica per empresa | — | ✅ | — |
| Valoracions i ressenyes | ✅ | ✅ | ✅ |
| Estadístiques i analítica | ✅ | ✅ | — |
| Directori públic d'empreses | — | — | ✅ |
| Reserva pública sense login (token únic) | ✅ | — | ✅ |
| Emails transaccionals (confirmació, valoració) | ✅ | — | — |
| Cua de tasques asíncrones (BullMQ) | ✅ | — | — |
| Documentació API (Swagger) | ✅ | — | — |

---

## Seguretat

- Passwords amb bcrypt
- JWT amb llista negra per a logout segur
- Rate limiting en 3 nivells
- CORS amb whitelist d'orígens
- Validació de variables d'entorn amb Zod
- Guards de rols (`ADMIN_GENERAL` / `EMPLEAT`)
- Exception filters globals

---

## Resolució de problemes

### "Cannot connect to database"
```bash
docker ps | grep postgres
docker-compose restart postgres
```

### "Port 3000 already in use" (Windows)
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### "Prisma Client not initialized"
```bash
npx prisma generate
```

### Frontend no connecta al backend (dispositiu físic)
Usa la IP local (`ipconfig` a Windows) en lloc de `localhost` al `EXPO_PUBLIC_API_URL`.

---

## Documentació addicional

- [Descripció completa del projecte](PROJECTE.md) — Arquitectura, decisions tècniques, model de dades
- [Guia d'inici ràpid](START.md) — Setup pas a pas per a Windows
- [Seguretat del backend](backend/SECURITY.md)
- [Swagger interactiu](http://localhost:3000/api/docs) — Tots els endpoints documentats

---

## Llicència

Projecte d'ús educatiu (PDS — Producció i Disseny de Software, 2024-25).
