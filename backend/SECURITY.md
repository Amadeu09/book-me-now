# 🛡️ Guía de Seguridad - BookMeNow Backend

## ✅ Implementaciones de Seguridad

### 1. **Autenticación y Autorización**
- ✅ JWT con tokens firmados
- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
- ✅ Guards de roles (ADMIN_GENERAL, TREBALLADOR, CLIENT)
- ✅ Rate limiting en endpoints de autenticación (5 login/min, 3 signup/min)
- ✅ Hash nunca expuesto en respuestas de API

### 2. **Validación de Datos**
- ✅ Class-validator en todos los DTOs
- ✅ ValidationPipe global con whitelist (strip unknown properties)
- ✅ forbidNonWhitelisted: rechaza propiedades no permitidas
- ✅ Transform automático de tipos

### 3. **Variables de Entorno**
- ✅ Validación con Zod en startup
- ✅ JWT_SECRET mínimo 32 caracteres
- ✅ DATABASE_URL formato PostgreSQL validado
- ✅ PORT entre 1000-65535
- ✅ NODE_ENV restringido a: development, production, test

### 4. **CORS (Cross-Origin)**
- ✅ Orígenes permitidos configurables via env
- ✅ Credentials habilitados
- ✅ Headers específicos permitidos
- ✅ Logging de intentos bloqueados

### 5. **Rate Limiting (Anti Brute Force)**
- ✅ Global: 10 req/s, 100 req/min, 500 req/15min
- ✅ Auth login: 5 intentos/minuto
- ✅ Auth signup: 3 intentos/minuto

### 6. **Manejo de Errores**
- ✅ Exception Filter global
- ✅ Errores Prisma mapeados a HTTP codes
- ✅ Stack traces solo en development
- ✅ Logging estructurado de errores

### 7. **Logging y Auditoría**
- ✅ Interceptor global de requests
- ✅ Log de tiempos de respuesta
- ✅ Log de errores con contexto
- ✅ User-agent y IP tracking

### 8. **Base de Datos**
- ✅ Transacciones atómicas en operaciones críticas
- ✅ Soft delete (marca como inactiva)
- ✅ Prepared statements (Prisma previene SQL injection)

### 9. **Monitoreo**
- ✅ Healthcheck endpoint: `/health`
- ✅ Uptime, environment, timestamp

---

## 🔒 Checklist Pre-Producción

### Obligatorio (Bloqueantes)
- [ ] Cambiar `JWT_SECRET` en producción (generar nuevo de 64+ chars)
- [ ] Configurar `ALLOWED_ORIGINS` con dominio real
- [ ] Activar HTTPS en servidor (certificado SSL/TLS)
- [ ] Revisar logs de errores
- [ ] Configurar backups automáticos de BD
- [ ] Deshabilitar stack traces en producción (`NODE_ENV=production`)

### Recomendado
- [ ] Añadir Helmet.js para headers de seguridad
- [ ] Implementar refresh tokens (JWT de larga duración)
- [ ] Rate limiting por IP (no solo global)
- [ ] Monitoreo con Sentry o similar
- [ ] Logs centralizados (Datadog, CloudWatch, etc.)
- [ ] Configurar alertas de errores

### Opcional
- [ ] Autenticación de dos factores (2FA)
- [ ] Rotación de JWT_SECRET periódica
- [ ] Blacklist de tokens revocados (Redis)
- [ ] Captcha en login tras N intentos fallidos

---

## 🚨 Vulnerabilidades Conocidas Resueltas

| Vulnerabilidad | Estado | Solución |
|----------------|--------|----------|
| Hash expuesto en respuestas | ✅ RESUELTO | `select` excluye `hash` siempre |
| JWT_SECRET débil | ✅ RESUELTO | Validación Zod + generador crypto |
| CORS abierto (`*`) | ✅ RESUELTO | Whitelist de orígenes |
| Sin rate limiting | ✅ RESUELTO | Throttler module |
| Sin validación de env | ✅ RESUELTO | Zod schema con reglas estrictas |
| Errores sin formato | ✅ RESUELTO | AllExceptionsFilter global |
| Sin logging estructurado | ✅ RESUELTO | LoggingInterceptor + Logger |

---

## 📖 Comandos Útiles

### Generar JWT_SECRET seguro
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Verificar env vars
```bash
npm run start:dev
# Si falla, revisa los errores de validación de Zod
```

### Auditoría de dependencias
```bash
npm audit
npm audit fix
```

### Análisis de código
```bash
npm run lint
```

---

## 🔗 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

---

**Última actualización:** 2 de diciembre de 2025
**Responsable:** Backend Team
