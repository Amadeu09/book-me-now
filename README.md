# 📱 BookMeNow - Sistema de Gestión de Reservas

**Aplicación full-stack** para gestión de reservas empresariales con backend NestJS y frontend React Native (Expo).

---

## 📁 Estructura del Proyecto

```
BookMeNow-app/
├── backend/          # Backend NestJS con Prisma + PostgreSQL
│   ├── src/
│   │   ├── auth/           # Autenticación JWT
│   │   ├── usuaris/        # Gestión de usuarios
│   │   ├── empresas/       # Gestión de empresas
│   │   ├── treballadors/   # Trabajadores
│   │   ├── serveis/        # Servicios
│   │   ├── clients/        # Clientes
│   │   ├── reserves/       # Reservas
│   │   └── ...
│   ├── prisma/
│   │   └── schema.prisma   # Modelo de base de datos
│   ├── docker-compose.yml  # PostgreSQL + Backend
│   └── package.json
│
└── frontend/         # Frontend React Native (Expo)
    ├── app/                # Pantallas (login, home, etc.)
    ├── src/
    │   ├── components/     # Componentes reutilizables
    │   ├── lib/            # Cliente API
    │   └── services/       # Servicios (auth, empresa, etc.)
    ├── app.config.ts       # Configuración de Expo
    └── package.json
```

---

## 🚀 Quick Start

### **1. Requisitos**
- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **Docker Desktop** ([descargar](https://www.docker.com/products/docker-desktop/))
- **Git** ([descargar](https://git-scm.com/))

### **2. Clonar el Repositorio**
```bash
git clone https://github.com/u1980982-create/BookMeNow-app.git
cd BookMeNow-app
```

### **3. Configurar Backend**
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Levantar PostgreSQL + Backend con Docker
docker-compose up -d

# O solo PostgreSQL (backend en host para desarrollo)
docker-compose up postgres -d

# Aplicar migraciones de base de datos
npx prisma migrate deploy

# Generar Prisma Client
npx prisma generate

# Iniciar backend en desarrollo
npm run start:dev
```

**Backend disponible en:** http://localhost:3000  
**Swagger Docs:** http://localhost:3000/api/docs

### **4. Configurar Frontend**
```bash
cd ../frontend

# Instalar dependencias
npm install

# Iniciar Expo
npx expo start

# Opciones:
# - Presiona 'a' para abrir en Android
# - Presiona 'i' para abrir en iOS
# - Escanea el QR con Expo Go app
```

---

## 📚 Documentación

### **Backend (NestJS)**
- [README del Backend](backend/README.md) - Setup completo y comandos
- [API Documentation (Swagger)](http://localhost:3000/api/docs) - Documentación interactiva
- [Guía de Tests](backend/TESTS_SWAGGER_COMPLETE.md) - Tests unitarios y E2E
- [Seguridad](backend/SECURITY.md) - Checklist de seguridad
- [Migraciones](backend/MIGRATION_COMPLETE.md) - Historial de migraciones

### **Frontend (React Native)**
- [README del Frontend](frontend/README.md) - Configuración de Expo
- Servicios: Ver [`frontend/src/services/`](frontend/src/services/)

---

## 🛠️ Stack Tecnológico

### **Backend**
- **Framework:** NestJS 10.4.20
- **Base de datos:** PostgreSQL 15 (Neon Cloud / Docker)
- **ORM:** Prisma 6.18.0
- **Autenticación:** Passport JWT + bcrypt
- **Documentación:** Swagger/OpenAPI 3.0
- **Testing:** Jest + Supertest (23 tests, 85%+ coverage)
- **Seguridad:** Rate limiting, CORS, Zod validation

### **Frontend**
- **Framework:** React Native (Expo SDK 52)
- **Lenguaje:** TypeScript
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **Navigation:** Expo Router

---

## 🔑 Variables de Entorno

### **Backend (`.env`)**
```env
# Base de datos (Neon Cloud o Docker local)
DATABASE_URL="postgresql://user:password@host:5432/bookmenow"

# Seguridad
JWT_SECRET="tu-secret-key-seguro-minimo-32-caracteres"
SESSION_SECRET="otro-secret-para-sesiones"

# CORS (orígenes permitidos)
ALLOWED_ORIGINS="http://localhost:19000,http://localhost:8081"

# Ambiente
NODE_ENV="development"
PORT=3000
```

### **Frontend (`.env`)**
```env
# URL del backend
EXPO_PUBLIC_API_URL="http://localhost:3000"

# O usar IP local para dispositivos físicos
# EXPO_PUBLIC_API_URL="http://192.168.1.x:3000"
```

---

## 🧪 Testing

### **Backend**
```bash
cd backend

# Tests unitarios
npm test

# Tests con cobertura
npm run test:cov

# Tests E2E
npm run test:e2e

# Tests específicos
npm test -- --testPathPattern="auth.service.spec"
```

**Cobertura actual:**
- AuthService: **100%**
- UsuarisService: **87.75%**
- EmpresasService: **91.17%**

### **Frontend**
```bash
cd frontend
# Tests por implementar
```

---

## 📦 Comandos Útiles

### **Backend**
```bash
# Desarrollo con hot-reload
npm run start:dev

# Build para producción
npm run build
npm run start:prod

# Prisma
npx prisma studio              # UI para ver/editar datos
npx prisma migrate dev         # Crear nueva migración
npx prisma generate            # Regenerar cliente

# Docker
docker-compose up -d           # Levantar todo
docker-compose logs -f         # Ver logs
docker-compose down            # Detener todo
docker-compose down -v         # Detener y eliminar datos
```

### **Frontend**
```bash
# Desarrollo
npx expo start                 # Iniciar con QR
npx expo start --android       # Abrir en Android
npx expo start --ios           # Abrir en iOS
npx expo start --web           # Abrir en navegador

# Build
npx expo prebuild              # Generar carpetas nativas
eas build --platform android   # Build para Android (requiere EAS)
```

---

## 🌐 Endpoints Principales

### **Autenticación**
- `POST /api/auth/signup` - Registrar empresa + admin
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/me` - Perfil actual (requiere JWT)

### **Usuarios**
- `GET /api/usuaris` - Listar usuarios
- `POST /api/usuaris` - Crear usuario
- `PATCH /api/usuaris/:id` - Actualizar usuario
- `DELETE /api/usuaris/:id` - Eliminar usuario

### **Empresas**
- `GET /api/empreses` - Listar empresas
- `POST /api/empreses` - Crear empresa
- `PATCH /api/empreses/:id` - Actualizar empresa
- `DELETE /api/empreses/:id` - Desactivar empresa

**Ver todos los endpoints:** http://localhost:3000/api/docs

---

## 🔒 Seguridad

✅ **Implementado:**
- JWT con tokens seguros (32+ caracteres)
- Passwords hasheados con bcrypt
- Rate limiting (3-5 req/min en auth)
- CORS con whitelist
- Validación de env con Zod
- Guards de roles (Admin vs Empleat)
- Exception filters globales

⚠️ **Recomendaciones adicionales:**
- Helmet para headers HTTP
- HTTPS en producción
- Refresh tokens
- Logs de auditoría

Ver [SECURITY.md](backend/SECURITY.md) para más detalles.

---

## 🐛 Troubleshooting

### **"Cannot connect to database"**
```bash
# Verificar PostgreSQL corriendo
docker ps | grep postgres

# Ver logs
docker logs bookmenow-db-local

# Reiniciar
docker-compose restart postgres
```

### **"Port 3000 already in use"**
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### **"Prisma Client not initialized"**
```bash
npx prisma generate
npm install
```

### **Frontend no conecta al backend**
```bash
# Usar IP local en lugar de localhost
# En backend/.env:
# ALLOWED_ORIGINS="http://192.168.1.x:19000"

# En frontend/.env:
# EXPO_PUBLIC_API_URL="http://192.168.1.x:3000"

# Obtener tu IP
ipconfig  # Windows
ifconfig  # Mac/Linux
```

---

## 📈 Estado del Proyecto

### ✅ **Completado**
- ✅ Backend NestJS con arquitectura modular
- ✅ Autenticación JWT + Guards de roles
- ✅ CRUD completo: Usuarios, Empresas
- ✅ Base de datos con Prisma + PostgreSQL
- ✅ Swagger/OpenAPI documentación
- ✅ 23 tests unitarios + E2E (85%+ coverage)
- ✅ Docker Compose para desarrollo
- ✅ Frontend React Native con Expo
- ✅ Integración frontend-backend básica

### 🚧 **En Desarrollo**
- ⚠️ Validación compleja de reservas (solapamiento, disponibilidad)
- ⚠️ Cálculo automático de facturación
- ⚠️ Tests del frontend
- ⚠️ Notificaciones push

### 📋 **Planificado**
- ❌ Dashboard de administración
- ❌ Reportes y estadísticas
- ❌ Sistema de valoraciones
- ❌ Integración de pagos

---

## 👥 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -am 'Añadir nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de uso educativo. Ver archivo LICENSE para más detalles.

---

## 🔗 Enlaces Útiles

- [Documentación NestJS](https://docs.nestjs.com/)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación Expo](https://docs.expo.dev/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

## 📞 Soporte

- **Swagger Docs:** http://localhost:3000/api/docs
- **Healthcheck:** http://localhost:3000/health
- **Issues:** [GitHub Issues](https://github.com/u1980982-create/BookMeNow-app/issues)

---

**¡Happy Coding!** 🚀
