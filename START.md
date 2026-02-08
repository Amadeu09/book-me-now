# 🚀 Guía de Inicio - BookMeNow

## 📋 Requisitos Previos

- **Docker Desktop** instalado y corriendo
- **Node.js 20+** instalado
- **PowerShell** (Windows)

---

## 🎯 INICIO RÁPIDO (Windows)

### **1. Iniciar Backend**

```powershell
cd backend
.\start-dev.ps1
```

**O manualmente:**
```powershell
cd backend
docker-compose up -d --build
```

**Verifica que funcione:**
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

### **2. Iniciar Frontend**

```powershell
cd frontend
npm install        # Solo la primera vez
npm start
```

Presiona **`w`** para abrir en navegador web.

---

## 🔧 Solución de Problemas

### **❌ "Docker no está corriendo"**
1. Abre **Docker Desktop**
2. Espera a que el ícono de Docker aparezca en la barra de tareas
3. Vuelve a ejecutar el script

### **❌ "Puerto 3000 en uso"**
```powershell
# Detener contenedores
docker-compose down

# O forzar detención
docker stop bookmenow-backend bookmenow-db
docker rm bookmenow-backend bookmenow-db
```

### **❌ "Database connection error"**
```powershell
# Reiniciar solo PostgreSQL
docker-compose restart postgres

# O reiniciar todo
docker-compose down
docker-compose up -d
```

### **❌ Ver logs del backend**
```powershell
docker-compose logs -f backend
```

---

## 📊 Comandos Útiles

### **Backend**
```powershell
# Ver contenedores corriendo
docker ps

# Ver logs
docker-compose logs -f backend

# Acceder al contenedor
docker exec -it bookmenow-backend sh

# Detener todo
docker-compose down

# Reiniciar backend
docker-compose restart backend

# Limpiar todo (CUIDADO: borra la base de datos)
docker-compose down -v
```

### **Frontend**
```powershell
# Reiniciar servidor
# Ctrl+C para detener, luego:
npm start

# Limpiar caché
npm start -- --clear

# Abrir en navegador específico
npm run web
```

### **Base de Datos**
```powershell
# Acceder a PostgreSQL
docker exec -it bookmenow-db psql -U postgres -d bookmenow

# Dentro de psql:
\dt          # Listar tablas
\d usuari    # Ver estructura de tabla
SELECT * FROM usuari;  # Query de ejemplo
\q           # Salir
```

---

## 🏗️ Estructura del Proyecto

```
BookMeNow-app/
├── backend/
│   ├── docker-compose.yml    # Configuración Docker
│   ├── Dockerfile.dev         # Imagen de desarrollo
│   ├── start-dev.ps1         # Script de inicio
│   └── src/                  # Código fuente NestJS
│
├── frontend/
│   ├── app/                  # Rutas Expo Router
│   ├── src/                  # Componentes/Hooks
│   └── package.json
│
└── START.md                  # Esta guía
```

---

## 🔐 URLs y Credenciales

### **Backend**
- **API Base:** http://localhost:3000/api
- **Swagger Docs:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/api

### **Base de Datos**
- **Host:** localhost:5432
- **Usuario:** postgres
- **Password:** postgres
- **Database:** bookmenow

### **Frontend**
- **Web:** http://localhost:8081
- **Metro:** http://localhost:8081

---

## ✅ Verificación Completa

Ejecuta estos comandos para verificar que todo funciona:

```powershell
# 1. Backend health
curl http://localhost:3000/api

# 2. PostgreSQL
docker exec bookmenow-db psql -U postgres -d bookmenow -c "SELECT 1"

# 3. Ver contenedores
docker ps
```

**Deberías ver:**
- ✅ `bookmenow-backend` (healthy)
- ✅ `bookmenow-db` (healthy)

---

## 🎓 Próximos Pasos

1. ✅ Backend corriendo
2. ✅ Frontend corriendo
3. 📱 Abre http://localhost:8081 en el navegador
4. 🔐 Registra un usuario en `/register`
5. 🎯 Prueba el CRUD de servicios en `/services`

---

## 📞 Necesitas Ayuda?

- Ver logs: `docker-compose logs -f`
- Reiniciar: `docker-compose restart`
- Limpiar: `docker-compose down -v` (⚠️ borra datos)
