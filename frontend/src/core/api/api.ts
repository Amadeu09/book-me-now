import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { getToken, setToken, clearSession, segonsFinsCaducitat } from '@/utils/session';

// Resolució robusta de la base URL per a dispositiu físic:
// 1. Env var EXPO_PUBLIC_API_URL (recomanat)
// 2. extra.apiUrl definida a app.config.ts
// 3. hostUri d'Expo (ex: 192.168.x.x:8081) -> construïm http://IP:3000
// 4. Fallback final localhost:3000

interface ExpoConfigExtra {
  apiUrl?: string;
}

function resolveApiBase(): string {
  const extra = Constants.expoConfig?.extra as ExpoConfigExtra | undefined;
  let candidate: string | undefined = extra?.apiUrl;

  // Fallbacks: IP del host desde Expo o localhost
  if (!candidate) {
    const hostUri = (Constants.expoConfig as { hostUri?: string } | null | undefined)?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        candidate = `http://${host}:3000`;
      }
    }
  }
  if (!candidate) candidate = 'http://localhost:3000';

  // Normalitza per no duplicar "/api" si ve inclòs per error
  candidate = candidate.replace(/\/+$/, '');
  candidate = candidate.replace(/\/?api$/i, '');
  return candidate;
}

const API_URL = `${resolveApiBase()}/api`;

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[API] Base URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Renovació de sessió: si al token li queden menys de 3 dies, se'n demana un de nou.
// Així la sessió no caduca de cop mentre l'app s'utilitza.
const MARGE_RENOVACIO_S = 3 * 24 * 60 * 60;
let renovacioEnCurs: Promise<string | null> | null = null;

async function renovarSiCal(token: string): Promise<string> {
  const queda = segonsFinsCaducitat(token);
  if (queda === null || queda <= 0 || queda > MARGE_RENOVACIO_S) return token;

  if (!renovacioEnCurs) {
    renovacioEnCurs = axios
      .post(`${API_URL}/auth/refresh`, {}, { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 })
      .then(async (res) => {
        const nou: string | undefined = res.data?.token;
        if (nou) await setToken(nou);
        return nou ?? null;
      })
      .catch(() => null)
      .finally(() => {
        renovacioEnCurs = null;
      });
  }
  return (await renovacioEnCurs) ?? token;
}

// Request interceptor: afegeix Bearer token + corregeix Content-Type per multipart
api.interceptors.request.use(async (config) => {
  try {
    let token = await getToken();
    if (token) token = await renovarSiCal(token);
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // ignore
  }

  // Quan s'envia FormData, elimina el 'application/json' per defecte perquè
  // React Native XHR pugui establir 'multipart/form-data; boundary=...' automàticament.
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Response interceptor: gestió d'errors 401 + logging en dev
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (__DEV__) {
      const cfg = error.config || {};
      // eslint-disable-next-line no-console
      console.log('[API][Error]', {
        message: error.message,
        url: cfg.baseURL ? cfg.baseURL + (cfg.url || '') : cfg.url,
        method: cfg.method,
        hasResponse: !!error.response,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Token expirat o invàlid → neteja sessió i redirigeix a login
    if (error.response?.status === 401) {
      try {
        await clearSession();
        router.replace('/login');
      } catch {
        // ignore cleanup errors
      }
    }

    return Promise.reject(error);
  }
);

export default api;
