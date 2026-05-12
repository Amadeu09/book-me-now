# Guia d'inici ràpid — BookMeNow

## Requisits previs

- **Docker Desktop** instal·lat i en execució
- **Node.js 20+**

---

## Backend (NestJS + PostgreSQL + Redis)

```powershell
cd backend
copy .env.example .env
# Edita .env amb les teves credencials

docker-compose up -d --build
```

Verifica que funcioni:
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

---

## Frontend (React Native + Expo)

```powershell
cd frontend
copy .env.example .env
npm install        # Només la primera vegada
npm start
```

Prem **`w`** per obrir al navegador web, **`a`** per Android.

- Web: http://localhost:8081

---

## Client Portal (Next.js)

```powershell
cd client-portal
copy .env.example .env.local
npm install        # Només la primera vegada
npm run dev
```

- Portal: http://localhost:3002

---

## Resolució de problemes

### Docker no s'executa
1. Obre **Docker Desktop**
2. Espera que aparegui la icona a la barra de tasques
3. Torna a executar `docker-compose up -d`

### Port 3000 en ús
```powershell
docker-compose down
docker-compose up -d
```

### Error de connexió a la base de dades
```powershell
docker-compose restart postgres
docker-compose logs -f backend
```

### Frontend no connecta al backend (dispositiu físic)
Canvia `EXPO_PUBLIC_API_URL` al `frontend/.env` per la teva IP local:
```
# Obté la teva IP amb: ipconfig
EXPO_PUBLIC_API_URL=http://192.168.1.x:3000
```

---

## Comandes útils

```powershell
# Backend
docker-compose logs -f backend    # Logs en directe
docker-compose restart backend    # Reiniciar backend
docker-compose down               # Aturar tot
docker-compose down -v            # Aturar i esborrar dades (COMPTE)

# Base de dades (Prisma)
cd backend
npx prisma studio                 # GUI per veure/editar dades
npx prisma migrate dev            # Crear nova migració

# Frontend
npm start -- --clear              # Netejar caché Expo
```

---

## URLs de referència

| Servei | URL |
|--------|-----|
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |
| Frontend web | http://localhost:8081 |
| Client Portal | http://localhost:3002 |
| PostgreSQL | localhost:5433 |
| Redis | localhost:6379 |
