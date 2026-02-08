# BookMeNow Backend - NestJS

Backend API completo para el sistema de gestión de reservas BookMeNow, construido con NestJS, Prisma y PostgreSQL.

## 🛡️ **Seguridad & Producción Ready**

Este backend implementa **mejores prácticas de seguridad empresarial**:

-  **JWT Authentication** con tokens firmados + bcrypt hash
-  **Rate Limiting** anti-brute force (5 login/min, 3 signup/min)
-  **Environment Validation** con Zod (startup checks)
-  **CORS Restrictivo** con whitelist configurable
-  **Exception Handling** global + Prisma error mapping
-  **Transacciones Atómicas** en operaciones críticas
-  **Logging Estructurado** de requests y errores
-  **Healthcheck Endpoint** (`/health`) para monitoreo

👉 **Ver [SECURITY.md](./SECURITY.md) para detalles completos de seguridad**

---

## 🚀 Quick Start

### Desarrollo Local (sin Docker)

1. **Instalar dependencias**
```powershell
cd backend-nestjs
npm install
```

2. **Configurar variables de entorno**
```powershell
cp .env.example .env
# ⚠️ IMPORTANTE: Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
# Copiar output y pegarlo en .env como JWT_SECRET
```

**Variables obligatorias en `.env`:**
```bash
DATABASE_URL="postgresql://..."          # PostgreSQL connection
JWT_SECRET="..."                         # Min 32 chars (ver comando arriba)
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3000
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:19000"
```

3. **Generar Prisma Client**
```powershell
npm run prisma:generate
```

4. **Ejecutar migraciones**
```powershell
npm run prisma:migrate
```

5. **Iniciar servidor**
```powershell
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000/api`

### Desarrollo con Docker

```powershell
# Levantar todos los servicios (PostgreSQL + Backend)
docker-compose up --build

# Solo base de datos
docker-compose up postgres -d

# Ver logs
docker-compose logs -f backend
```

## 📋 Scripts Disponibles

```powershell
# Desarrollo
npm run start:dev          # Servidor con hot-reload
npm run start:debug        # Modo debug

# Producción
npm run build              # Compilar
npm run start:prod         # Ejecutar compilado

# Prisma
npm run prisma:generate    # Generar cliente
npm run prisma:migrate     # Ejecutar migraciones dev
npm run prisma:deploy      # Ejecutar migraciones prod
npm run prisma:studio      # Abrir Prisma Studio

# Testing
npm run test               # Tests unitarios
npm run test:e2e           # Tests end-to-end
npm run test:cov           # Coverage
```

## 🏗️ Arquitectura

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Módulo raíz
├── prisma/                 # Prisma service (global)
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── common/                 # Utilidades compartidas
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   └── guards/
│       └── roles.guard.ts
├── auth/                   # Autenticación JWT
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── guards/
│       └── jwt-auth.guard.ts
├── usuaris/                # Gestión usuarios
├── empresas/               # Gestión empresas
├── treballadors/           # Trabajadores
├── serveis/                # Servicios
├── clients/                # Clientes
├── reserves/               # Reservas
├── valoracions/            # Valoraciones
├── factures/               # Facturas
└── horaris/                # Horarios (jornadas + ausencias)
```

## 🔐 Autenticación

Todas las rutas (excepto `/auth/login` y `/auth/signup`) requieren JWT Bearer token:

```bash
Authorization: Bearer <tu-jwt-token>
```

### Roles disponibles:
- `ADMIN_GENERAL`: Administrador de empresa
- `EMPLEAT`: Empleado

## 📡 Endpoints Principales

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Registro empresa + admin

### Usuaris
- `GET /api/usuaris` - Listar usuarios
- `GET /api/usuaris/:id` - Obtener usuario
- `POST /api/usuaris` - Crear usuario (solo ADMIN)
- `PATCH /api/usuaris/:id` - Actualizar usuario
- `DELETE /api/usuaris/:id` - Eliminar usuario

### Empreses
- `GET /api/empreses` - Listar empresas
- `GET /api/empreses/:id` - Obtener empresa
- `POST /api/empreses` - Crear empresa
- `PATCH /api/empreses/:id` - Actualizar empresa
- `DELETE /api/empreses/:id` - Desactivar empresa

### Serveis
- `POST /api/serveis` - Crear servei
- `GET /api/serveis?page=1` - Listar serveis paginados de 4 en 4
- `GET /api/serveis/:id` - Obtener servei (scope por empresa)
- `PATCH /api/serveis/:id` - Actualizar servei
- `DELETE /api/serveis/:id` - Desactivar (soft delete) servei

### Reserves
- `GET /api/reserves` - Listar reservas
- `GET /api/reserves/:id` - Obtener reserva

*(Y más endpoints para treballadors, serveis, clients, etc.)*

## 🐳 Docker

### Producción
```powershell
docker build -t bookmenow-api .
docker run -p 3000:3000 --env-file .env bookmenow-api
```

### Docker Compose (recomendado)
```powershell
docker-compose up --build -d
```

## 🚢 Deploy a Railway

1. **Crear cuenta en Railway.app**

2. **Conectar repositorio GitHub**

3. **Configurar variables de entorno:**
   - `DATABASE_URL` (Railway proveerá PostgreSQL)
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS`

4. **Railway auto-detecta el Dockerfile y despliega**

## 🔧 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Clave secreta JWT (mín 32 chars) | `random-32-char-string` |
| `JWT_EXPIRES_IN` | Expiración token | `7d` |
| `NODE_ENV` | Entorno | `development` / `production` |
| `PORT` | Puerto servidor | `3000` |
| `ALLOWED_ORIGINS` | URLs frontend (separadas por comas) | `http://localhost:3000` |

## 📊 Base de Datos

El proyecto usa **Prisma** como ORM con **PostgreSQL**.

Schema incluye:
- ✅ Usuaris (usuarios)
- ✅ Empreses (empresas)
- ✅ Treballadors (trabajadores)
- ✅ Serveis (servicios)
- ✅ Clients (clientes)
- ✅ Reserves (reservas)
- ✅ Valoracions (valoraciones)
- ✅ Factures (facturas)
- ✅ Jornades (jornadas laborales)
- ✅ Absències (ausencias)

## 🧪 Testing

```powershell
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Migraciones Prisma

El proyecto ya incluye migraciones del backend anterior. Para crear nuevas:

```powershell
# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar en producción
npx prisma migrate deploy

# Visualizar BD
npx prisma studio
```

## 🔄 Migración desde Next.js

Este proyecto reemplaza el backend Next.js anterior con NestJS. Ventajas:

✅ Arquitectura modular por dominios  
✅ Dependency Injection nativa  
✅ Decoradores para validación automática  
✅ Guards y middleware robustos  
✅ Testing integrado  
✅ Swagger fácil de agregar  
✅ Docker-ready  

## 📚 Recursos

- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Passport JWT](http://www.passportjs.org/packages/passport-jwt/)
- [Class Validator](https://github.com/typestack/class-validator)

## 🐛 Troubleshooting

### Error: "Cannot find module '@nestjs/core'"
```powershell
rm -rf node_modules package-lock.json
npm install
```

### Error: "Prisma Client not generated"
```powershell
npx prisma generate
```

### Error: "Port 3000 already in use"
```powershell
# Cambiar PORT en .env o matar proceso:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

**Autor**: BookMeNow Team  
**Licencia**: Privado
