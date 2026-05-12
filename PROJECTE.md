# BookMeNow — Descripció completa del projecte

> Document de referència per a la redacció de la memòria del TFG (PFG).
> Conté el context, arquitectura, funcionalitats i decisions tècniques de l'aplicació.

---

## 1. Visió general i objectiu

**BookMeNow** és un sistema de gestió empresarial amb cites prèvies dissenyat per a petites i mitjanes empreses de serveis (perruqueries, centres d'estètica, clíniques, gimnasos, etc.). El seu objectiu principal és digitalitzar i centralitzar la gestió de reserves, empleats, horaris i clients en una sola plataforma, eliminant la dependència de gestió manual (paper, WhatsApp, fulls de càlcul).

El sistema resol tres problemes concrets:
1. **Gestió de cites** — Clients externs poden reservar en línia sense necessitat de crear un compte, i l'empresa rep i gestiona totes les reserves des d'un únic tauler.
2. **Gestió d'equip** — L'empresa pot configurar els horaris de treball, rotacions i absències de cada treballador, i el sistema calcula automàticament la disponibilitat real.
3. **Visibilitat pública** — Les empreses apareixen en un directori públic accessible des del portal web, on els clients poden trobar-les, veure els seus serveis i fer la reserva directament.

---

## 2. Arquitectura general — Monorepo de tres capes

El projecte està organitzat com un **monorepo** amb tres aplicacions independents que es comuniquen entre elles:

```
BookMeNow-app/
├── backend/          → API REST (NestJS + PostgreSQL)
├── frontend/         → App mòbil i web (React Native + Expo)
├── client-portal/    → Portal públic web (Next.js)
└── docker-compose.yml
```

Cada capa té una responsabilitat clara:

| Capa | Tecnologia principal | Responsabilitat |
|------|---------------------|-----------------|
| **Backend** | NestJS 10 + Prisma + PostgreSQL 15 | Lògica de negoci, base de dades, autenticació, API REST |
| **Frontend** | React Native 0.81 + Expo Router | Interfície de l'empresa/empleats (mòbil i web) |
| **Client Portal** | Next.js 16 + Tailwind CSS | Portal públic de descoberta i reserva per al client final |

---

## 3. Backend — API REST (NestJS)

### 3.1 Stack tecnològic

- **NestJS 10** com a framework principal (TypeScript, arquitectura modular)
- **Prisma 6** com a ORM per a PostgreSQL
- **PostgreSQL 15** com a base de dades relacional
- **JWT + Passport** per a autenticació i autorització
- **BullMQ + Redis** per a cua de tasques asíncrones (emails diferits)
- **Cloudinary** per a gestió d'imatges (fotos de perfil, banners, imatges de serveis)
- **Resend** per a enviament d'emails transaccionals
- **Swagger/OpenAPI 3.0** per a documentació automàtica de l'API
- **Throttler** per a limitació de peticions (rate limiting)
- **Zod** per a validació de variables d'entorn

### 3.2 Mòduls funcionals (12 mòduls)

L'API està organitzada en **12 mòduls de domini**, cadascun amb el seu controlador, servei i DTOs:

| Mòdul | Ruta API | Funcionalitat |
|-------|----------|---------------|
| `auth` | `/api/auth` | Login, registre, logout, canvi de contrasenya, perfil |
| `usuaris` | `/api/usuaris` | Gestió de comptes d'usuari |
| `empresas` | `/api/empreses` | Gestió d'empreses, directori públic, configuració de marca |
| `treballadors` | `/api/treballadors` | Gestió d'empleats |
| `serveis` | `/api/serveis` | Serveis oferts per l'empresa (tractaments, productes) |
| `clients` | `/api/clients` | Base de dades de clients de l'empresa |
| `reserves` | `/api/reserves` | Gestió completa de reserves i disponibilitat |
| `valoracions` | `/api/valoracions` | Valoracions i ressenyes de serveis i empleats |
| `factures` | `/api/factures` | Generació i seguiment de factures |
| `horaris` | `/api/horaris` | Horaris i jornades laborals de l'empresa |
| `jornades` | `/api/jornades` | Plantilles de torns i rotacions d'empleats |
| `absencies` | `/api/absencies` | Gestió de vacances, baixes i permisos |

### 3.3 Autenticació i autorització

El sistema implementa autenticació basada en **JWT (JSON Web Tokens)**:

- En fer login, el servidor retorna un token JWT signat
- Cada petició autenticada envia el token a la capçalera `Authorization: Bearer <token>`
- En fer logout, el token s'afegeix a una **llista negra** (`TokenBlacklist`) a la base de dades per invalidar-lo
- Hi ha dos rols d'usuari:
  - `ADMIN_GENERAL` — Propietari o administrador de l'empresa, amb accés complet
  - `EMPLEAT` — Treballador, amb accés restringit al seu propi calendari i perfil

L'autorització s'implementa mitjançant guards de NestJS (`@Roles()` decorator + `RolesGuard`) que verifiquen el rol de l'usuari en cada endpoint protegit.

### 3.4 Sistema de reserves i disponibilitat

El nucli de l'aplicació és el motor de disponibilitat. Quan un client vol fer una reserva, el sistema:

1. Obté tots els **treballadors** que ofereixen el servei demanat
2. Consulta les **jornades laborals** actives de cada treballador per al dia demanat (plantilla de torns + rotació)
3. Elimina els **intervals ocupats** per reserves existents (en estat PENDENT o CONFIRMADA)
4. Elimina els intervals corresponents a **absències** aprovades del treballador
5. Elimina els intervals de **tancaments de l'empresa** (festes locals, ponts, etc.)
6. Retorna els **slots lliures** disponibles per a cada treballador

Les reserves tenen els estats: `PENDENT → CONFIRMADA → FINALITZADA` o `CANCELLADA / NO_SHOW`.

Cada reserva genera un **token únic de gestió** (`tokenGestio`) que permet al client consultar i cancel·lar la seva reserva sense necessitat de tenir un compte.

### 3.5 Sistema de jornades i torns (el més complex)

El sistema de jornades és la funcionalitat tècnicament més elaborada del projecte. Permet configurar **plantilles de torns amb rotació setmanal**:

- Una **Plantilla de Jornada** (`JornadaPlantilla`) defineix un cicle de treball (p. ex., "Setmana A / Setmana B")
- Cada plantilla té **Rotacions** (`JornadaRotacio`) — setmanes numerades (0 = setmana A, 1 = setmana B)
- Cada rotació té **Dies** (`JornadaDiaRotacio`) — de dilluns a diumenge, marcables com a descans
- Cada dia té **Trams horaris** (`JornadaTram`) — intervals d'inici i fi en minuts des de les 00:00

Un treballador s'assigna a una plantilla amb una data d'inici i un índex d'ancoratge (`anchorRotacioIndex`), que determina quina setmana de la rotació correspon a cada setmana del calendari.

Exemple: si avui és dimecres i el treballador té assignada la plantilla "A/B" amb inici el dilluns passat i ancoratge 0 (setmana A), el sistema sap que aquesta setmana toca "setmana A" i consulta els trams corresponents.

### 3.6 Sistema d'absències

Les absències es gestionen a dos nivells:

- **Absències individuals** (`Absencia`): vacances, malaltia, permís o altre d'un treballador concret. Tenen un flux d'aprovació (PENDENT → APROVADA / REBUTJADA).
- **Absències d'empresa** (`AbsenciaEmpresa`): tancaments generals de l'empresa (festes locals, festes estatals, ponts). Afecten tots els treballadors.

Ambdós tipus s'integren al motor de disponibilitat per bloquejar slots automàticament.

### 3.7 Middleware i seguretat global

- **AllExceptionsFilter** — Captura i formata tots els errors de l'API de forma coherent
- **LoggingInterceptor** — Registra totes les peticions i respostes
- **ThrottlerModule** — Rate limiting en 3 nivells: 10 req/s, 100 req/min, 500 req/15min
- **CORS** configurat per als orígens autoritzats (frontend mòbil + portal web)

### 3.8 Tasques asíncrones i emails

Quan una reserva passa a estat `FINALITZADA`, s'encua una tasca a **BullMQ** (amb Redis com a broker) que envia un email de valoració al client. Això es fa de forma asíncrona per no bloquejar la resposta de l'API.

Els emails s'envien des de `reservas@bookmenow.org` utilitzant **Resend** com a servei de transaccional.

---

## 4. Frontend — App mòbil i web (React Native + Expo)

### 4.1 Stack tecnològic

- **React Native 0.81** amb **Expo SDK**
- **Expo Router** per a navegació basada en sistema de fitxers
- **React Query (TanStack Query)** per a gestió d'estat del servidor (cache, refetch, stale time)
- **Axios** com a client HTTP amb interceptors per a injecció automàtica del JWT
- **AsyncStorage** per a persistència del token d'autenticació
- **TypeScript** en tot el codebase

### 4.2 Organització de pantalles i navegació

```
app/
├── login.tsx, register.tsx, register-user.tsx   → Flux d'autenticació (sense login)
├── (tabs)/                                        → Layout principal per a ADMINS
│   ├── index.tsx       → HomeScreen (dashboard)
│   ├── bookings.tsx    → TabsBookingsScreen
│   ├── services.tsx    → TabsServicesScreen
│   └── profile.tsx     → TabsProfileScreen
├── (main)/                                        → Layout principal (admins i empleats)
│   ├── bookings.tsx         → BookingsScreen (calendari setmanal)
│   ├── services.tsx         → ServicesScreen (gestió de serveis)
│   ├── horarios.tsx         → HorariosScreen (gestió de torns)
│   ├── vacaciones.tsx       → VacacionesScreen (gestió d'absències)
│   ├── estadisticas.tsx     → EstadisticasScreen (analítica)
│   ├── valoracions-empresa.tsx → Valoracions rebudes per l'empresa
│   └── profile.tsx          → ProfileScreen
```

La navegació s'adapta a la mida de pantalla: **pestanyes inferiors** en mòbil, **barra lateral** en pantalles ≥ 768px (tauleta/web).

### 4.3 Mòduls de funcionalitats (`src/features/`)

| Mòdul | Pantalles | Funcionalitat |
|-------|-----------|---------------|
| `auth` | Login, Register, RegisterUser | Autenticació i registre d'empresa i usuari |
| `home` | HomeScreen | Dashboard principal amb resum de reserves |
| `calendar` | BookingsScreen | Calendari setmanal de reserves, codificació per estat |
| `horarios` | HorariosScreen | Configuració de plantilles de torns i rotacions |
| `services` | ServicesScreen | Llistat i gestió de serveis (CRUD + imatge + categoria) |
| `profile` | ProfileScreen | Perfil d'usuari i configuració de l'empresa |
| `vacaciones` | VacacionesScreen | Sol·licitud i gestió d'absències i vacances |
| `estadisticas` | EstadisticasScreen | Estadístiques d'ingressos, reserves i valoracions |
| `empresa` | CompanyDataProvider | Proveïdor de context amb dades i branding de l'empresa |

### 4.4 Tematització dinàmica

Cada empresa té un color primari (`colorPrimari`) configurable. Quan l'usuari fa login, el sistema carrega el color de l'empresa i el propaga a tot el tema de l'aplicació mitjançant un `ThemeProvider` personalitzat. Això genera automàticament:

- El color primari principal
- Variants clares i fosques del color
- Colors de text amb contrast adequat (negre o blanc segons la lluminositat del fons)

### 4.5 Gestió d'estat i comunicació amb l'API

- **React Query** gestiona tota la comunicació amb l'API: cache automàtic (5 min stale time), reintents (màx. 1), invalidació de queries en mutations
- **Axios** amb un interceptor global que afegeix el token JWT a totes les peticions autenticades i gestiona els errors 401 (token expirat → redirigir al login)
- Els tokens es guarden i recuperen de **AsyncStorage**

---

## 5. Client Portal — Portal públic web (Next.js)

### 5.1 Stack tecnològic

- **Next.js 16** (React Server Components per defecte)
- **React 19**
- **Tailwind CSS 4**
- Font: Plus Jakarta Sans

### 5.2 Pàgines i funcionalitat

| Ruta | Pàgina | Funcionalitat |
|------|--------|---------------|
| `/` | Pàgina d'inici | Directori d'empreses, cerca per categoria, hero section, CTA per a empreses |
| `/empresa/[id]` | Detall d'empresa | Informació, serveis, selector de disponibilitat i formulari de reserva |
| `/reserva/[token]` | Gestió de reserva | Consulta i cancel·lació d'una reserva per token (sense login) |

### 5.3 Flux de reserva del client final

1. El client accedeix al directori i troba l'empresa
2. Selecciona un servei i un treballador (opcional)
3. El portal consulta l'API de disponibilitat en temps real
4. El client tria un slot lliure al calendari interactiu
5. Omple nom, email i telèfon
6. La reserva es crea a la base de dades amb estat `PENDENT`
7. El client rep un email de confirmació amb un **enllaç únic de gestió** (`/reserva/[token]`)
8. Des d'aquest enllaç pot consultar l'estat o cancel·lar la reserva sense necessitat de registrar-se

---

## 6. Base de dades — Model de dades (Prisma + PostgreSQL)

### 6.1 Entitats principals

| Entitat | Propòsit | Camps rellevants |
|---------|----------|-----------------|
| `Usuari` | Compte d'usuari del sistema | email, hash (bcrypt), rol, colorPrimari, fotoPerfil |
| `Empresa` | Empresa/negoci | nom, ubicacio, capacitat, fotoPerfil, bannerUrl, colorPrimari, tipo (BusinessType) |
| `Treballador` | Empleat d'una empresa | nom, idUsuari (1:1 a Usuari), empresaId, diesVacancesAnuals (default 25) |
| `Servei` | Servei que ofereix l'empresa | nom, duradaMin, preu, fotoUrl, descripcio |
| `Client` | Client de l'empresa | nom, email, telefon (no requereix compte al sistema) |
| `Reserva` | Cita/reserva | dataHora, estat, treballadorId, clientId, serveiId, tokenGestio |
| `Valoracio` | Valoració d'un servei o treballador | puntuacio, comentari, tipus (SALA / TREBALLADOR) |
| `Factura` | Factura associada a una reserva | reservaId (1:1), total, dataEmissio, linies |
| `Jornada` | Torn de treball (legacy) | treballadorId, inici, fi, recurrent |
| `Absencia` | Absència individual d'un treballador | treballadorId, inici, fi, tipus, estat (PENDENT/APROVADA/REBUTJADA) |
| `JornadaPlantilla` | Plantilla de torn reutilitzable | nom, activa, empresaId |
| `JornadaRotacio` | Setmana dins d'una plantilla | plantillaId, index, nom |
| `JornadaDiaRotacio` | Dia dins d'una setmana | rotacioId, dow (1=Dl...7=Dg), esDescans |
| `JornadaTram` | Interval horari d'un dia | diaId, iniciMin, fiMin (minuts des de 00:00) |
| `TreballadorJornadaPlantilla` | Assignació d'un treballador a una plantilla | treballadorId, plantillaId, dataInici, dataFi, anchorRotacioIndex |
| `AbsenciaEmpresa` | Tancament general de l'empresa | empresaId, titol, inici, fi, tipus (FESTA_LOCAL, PONT, etc.) |
| `TokenBlacklist` | Tokens JWT invalidats (logout) | token, expiresAt |

### 6.2 Relacions clau

- `Empresa` ← `Treballador` → `Usuari` (cada treballador té un compte d'usuari associat)
- `Treballador` ↔ `TreballadorServei` ↔ `Servei` (relació molts-a-molts: un treballador pot fer múltiples serveis)
- `Reserva` connecta `Client` + `Treballador` + `Servei` en un moment concret
- `JornadaPlantilla` → `JornadaRotacio` → `JornadaDiaRotacio` → `JornadaTram` (jerarquia de 4 nivells per definir torns complexos)

### 6.3 Índexs d'optimització

La base de dades té índexs compostos per a les consultes més freqüents:
- `(empresaId, dataHora)` a `Reserva` — per consultes del calendari de l'empresa
- `(treballadorId, dataHora)` a `Reserva` — per consultes del calendari del treballador
- `(empresaId, actiu)` — per filtrar serveis i treballadors actius

---

## 7. Infraestructura i desplegament

### 7.1 Docker Compose (entorn local)

L'entorn de desenvolupament s'aixeca amb un sol comando (`docker-compose up`):

| Servei | Imatge | Port | Propòsit |
|--------|--------|------|---------|
| `postgres` | postgres:15-alpine | 5433 | Base de dades PostgreSQL |
| `redis` | redis:7-alpine | 6379 | Broker per a BullMQ |
| `backend` | Dockerfile.dev | 3000 | API NestJS amb hot-reload |
| `frontend` | Dockerfile.dev | 3001, 19000-19002 | Expo web amb hot-reload |

### 7.2 Variables d'entorn necessàries

```
DATABASE_URL        → Connexió a PostgreSQL
JWT_SECRET          → Clau secreta per a JWT (mínim 32 caràcters)
CLOUDINARY_*        → Credencials per a pujada d'imatges
RESEND_API_KEY      → Clau per a enviament d'emails
REDIS_HOST/PORT     → Connexió a Redis
EXPO_PUBLIC_API_URL → URL de l'API per al frontend
```

### 7.3 Producció

- **Backend**: Dockerfile multi-stage (builder → runner) amb Node 20 Alpine. Executa migracions de Prisma en arrencar.
- **Base de dades**: Compatible amb serveis gestionats (Neon, Railway, Supabase)
- **Redis**: Compatible amb Upstash, Render Redis
- **Frontend**: Expo web deployable a Vercel o qualsevol CDN estàtic
- **Portal**: Next.js deployable a Vercel

---

## 8. Funcionalitats implementades vs. pendents

### Implementades ✅

| Funcionalitat | Capa |
|---------------|------|
| Registre i login d'empresa | Backend + Frontend |
| Gestió d'empleats (CRUD) | Backend + Frontend |
| Gestió de serveis (CRUD + imatge + categoria) | Backend + Frontend |
| Gestió de clients | Backend + Frontend |
| Motor de disponibilitat | Backend |
| Reserves (crear, confirmar, cancel·lar, finalitzar) | Backend + Frontend |
| Calendari setmanal de reserves amb codificació per estat | Frontend |
| Plantilles de torns amb rotació A/B | Backend + Frontend |
| Gestió d'absències individuals | Backend + Frontend |
| Tancaments d'empresa | Backend + Frontend |
| Pujada d'imatges a Cloudinary | Backend + Frontend |
| Tematització dinàmica per empresa | Frontend |
| Valoracions i ressenyes de serveis/treballadors | Backend + Frontend + Client Portal |
| Estadístiques i analítica (ingressos, reserves, valoracions) | Backend + Frontend |
| Portal públic de descoberta | Client Portal |
| Reserva pública sense login (token únic) | Backend + Client Portal |
| Emails transaccionals (confirmació, valoració) | Backend |
| Cua de tasques asíncrones (BullMQ) | Backend |
| Documentació API (Swagger) | Backend |
| Rate limiting en 3 nivells | Backend |
| Invalidació de tokens (logout) | Backend |

### Pendents / Treball futur 🔜

| Funcionalitat | Motiu |
|---------------|-------|
| Facturació (UI) | Backend implementat, frontend pendent |
| Refresh tokens | Seguretat millorada (ara els JWT expiren i cal fer login de nou) |
| 2FA / Verificació d'email al registre | Seguretat addicional |
| App Store / Play Store deployment | Expo build i publicació |
| Notificacions push | Per avisar de noves reserves |
| Tests del frontend | No hi ha runner de tests configurat al frontend |

---

## 9. Decisions tecnològiques principals

| Decisió | Alternativa considerada | Raó de l'elecció |
|---------|------------------------|-----------------|
| NestJS vs Express | Express, Fastify | NestJS ofereix arquitectura modular, injecció de dependències i TypeScript natiu, ideal per a projectes de mida mitjana-gran |
| React Native + Expo vs Flutter | Flutter, Ionic | React Native permet compartir codi amb el portal web (Next.js) i reutilitzar coneixement de React; Expo simplifica el build i el desplegament |
| PostgreSQL vs MongoDB | MongoDB, MySQL | El model de dades és altament relacional (empreses → treballadors → reserves → serveis); PostgreSQL ofereix millor suport per a consultes complexes i integritat referencial |
| Prisma vs TypeORM | TypeORM, Sequelize | Prisma ofereix un schema declaratiu clar, migracions automàtiques i un client TypeScript completament tipat |
| JWT sense refresh vs amb refresh | Sessions, OAuth | Per simplicitat en el MVP; el treball futur inclou afegir refresh tokens |
| BullMQ vs emails síncrons | Nodemailer síncron | Els emails no han de bloquejar la resposta de l'API; BullMQ permet reintents automàtics en cas de fallada |
| Cloudinary vs emmagatzematge propi | AWS S3, local | Cloudinary ofereix CDN, transformació d'imatges i pla gratuït generós, sense gestió d'infraestructura |
| Resend vs SendGrid | SendGrid, Mailgun | Resend és modern, simple d'integrar i té millor reputació de lliurament per a nous dominis |

---

## 10. Resum executiu

BookMeNow és una plataforma SaaS de gestió empresarial i cites prèvies construïda com un monorepo de tres capes:

- Un **backend NestJS** robust amb 12 mòduls de domini, autenticació JWT amb doble rol, un motor de disponibilitat que integra torns rotatius i absències, i un sistema de cua per a tasques asíncrones.
- Un **frontend React Native + Expo** que funciona com a app mòbil i web, amb tematització dinàmica per empresa i gestió completa del calendari, equip i serveis.
- Un **portal web Next.js** públic que permet als clients finals descobrir empreses i fer reserves sense necessitat de registre, gràcies a un sistema de tokens únics.

La base de dades PostgreSQL, gestionada amb Prisma, conté 17 models interconnectats que cobreixen des de la gestió d'usuaris fins a les estructures de torns rotatius de complexitat arbitrària.

El projecte és funcional i desplegable, amb Docker Compose per a l'entorn local i Dockerfiles de producció optimitzats.
