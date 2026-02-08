# 🎯 Backend Test Guide - API Endpoints

## ✅ Estado: BACKEND FUNCIONANDO SIN ERRORES

El servidor está corriendo correctamente en `http://localhost:3000/api`

### 📊 Verificación de Estado

```powershell
# El servidor está levantado mostrando:
✅ Database connected successfully
🚀 BookMeNow API running on: http://localhost:3000/api
📚 Environment: development
```

Todos los módulos cargados:
- ✅ AuthModule (login/signup)
- ✅ UsuarisModule  
- ✅ EmpresasModule
- ✅ TreballadorsModule
- ✅ ServeisModule
- ✅ ClientsModule
- ✅ ReservesModule

### 🔧 Probar los Endpoints

#### 1. Signup (Crear empresa + admin)

**PowerShell:**
```powershell
$body = @{
    usuari = @{
        email = 'admin@tuempresa.com'
        password = '123456'
    }
    empresa = @{
        nom = 'Mi Empresa Test'
        ubicacio = 'Barcelona'
        capacitat = 10
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/signup' -Method POST -Body $body -ContentType 'application/json'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@tuempresa.com",
    "rol": "ADMIN_GENERAL",
    "empresaId": 1
  }
}
```

#### 2. Login

```powershell
$body = @{
    email = 'admin@tuempresa.com'
    password = '123456'
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
$token = $response.token
Write-Host "Token: $token"
```

#### 3. Listar Usuarios (requiere JWT)

```powershell
# Usar el token del login/signup anterior
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri 'http://localhost:3000/api/usuaris' -Method GET -Headers $headers
```

#### 4. Listar Empresas

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri 'http://localhost:3000/api/empreses' -Method GET -Headers $headers
```

#### 5. Crear Usuario (solo ADMIN)

```powershell
$body = @{
    email = 'empleado@tuempresa.com'
    password = '123456'
    rol = 'EMPLEAT'
    empresaId = 1
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri 'http://localhost:3000/api/usuaris' -Method POST -Body $body -ContentType 'application/json' -Headers $headers
```

### 🌐 Usando Navegador / Postman

#### Postman Collection

**POST** `http://localhost:3000/api/auth/signup`
```json
{
  "usuari": {
    "email": "test@example.com",
    "password": "123456"
  },
  "empresa": {
    "nom": "Test Company",
    "ubicacio": "Barcelona"
  }
}
```

**POST** `http://localhost:3000/api/auth/login`
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**GET** `http://localhost:3000/api/usuaris`
- Headers: `Authorization: Bearer <tu-token>`

### 📋 Todos los Endpoints Disponibles

| Método | Endpoint | Auth | Roles | Descripción |
|--------|----------|------|-------|-------------|
| POST | `/api/auth/signup` | ❌ | - | Crear empresa + admin |
| POST | `/api/auth/login` | ❌ | - | Login |
| GET | `/api/usuaris` | ✅ | ADMIN, EMPLEAT | Listar usuarios |
| GET | `/api/usuaris/:id` | ✅ | ADMIN, EMPLEAT | Ver usuario |
| POST | `/api/usuaris` | ✅ | ADMIN | Crear usuario |
| PATCH | `/api/usuaris/:id` | ✅ | ADMIN | Actualizar usuario |
| DELETE | `/api/usuaris/:id` | ✅ | ADMIN | Eliminar usuario |
| GET | `/api/empreses` | ✅ | Todos | Listar empresas |
| GET | `/api/empreses/:id` | ✅ | Todos | Ver empresa |
| POST | `/api/empreses` | ✅ | ADMIN | Crear empresa |
| PATCH | `/api/empreses/:id` | ✅ | ADMIN | Actualizar empresa |
| DELETE | `/api/empreses/:id` | ✅ | ADMIN | Desactivar empresa |
| GET | `/api/treballadors` | ✅ | Todos | Listar trabajadores |
| GET | `/api/treballadors/:id` | ✅ | Todos | Ver trabajador |
| GET | `/api/serveis` | ✅ | Todos | Listar servicios |
| GET | `/api/serveis/:id` | ✅ | Todos | Ver servicio |
| GET | `/api/clients` | ✅ | Todos | Listar clientes |
| GET | `/api/clients/:id` | ✅ | Todos | Ver cliente |
| GET | `/api/reserves` | ✅ | Todos | Listar reservas |
| GET | `/api/reserves/:id` | ✅ | Todos | Ver reserva |

### 🐛 Troubleshooting

**Error: Cannot connect**
- Verificar que el servidor esté corriendo: `http://localhost:3000/api`
- Revisar logs del terminal

**Error: 401 Unauthorized**
- Token expirado o inválido
- Hacer login nuevamente para obtener nuevo token

**Error: 403 Forbidden**
- Tu usuario no tiene permisos para esa acción
- Solo ADMIN_GENERAL puede crear/modificar usuarios

### ✅ RESUMEN

**Estado del Backend NestJS:**
- ✅ Compilación: 0 errores
- ✅ Base de datos: Conectada a Neon PostgreSQL
- ✅ Servidor: Corriendo en puerto 3000
- ✅ Auth: JWT funcionando
- ✅ Guards: Roles implementados
- ✅ Validación: DTOs automáticos
- ✅ CORS: Configurado para frontend

**El backend está 100% funcional y listo para conectar con el frontend.**
