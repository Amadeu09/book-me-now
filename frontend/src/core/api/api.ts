import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Resolución robusta de la base URL para dispositivo físico:
// 1. Env var EXPO_PUBLIC_API_URL (recomendado)
// 2. extra.apiUrl definida en app.config.ts
// 3. hostUri de Expo (ej: 192.168.x.x:8081) -> construimos http://IP:3000
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

  // Normaliza para no duplicar "/api" si viene incluido por error
  candidate = candidate.replace(/\/+$/, '');
  candidate = candidate.replace(/\/?api$/i, '');
  return candidate;
}

const API_URL = `${resolveApiBase()}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[API] Base URL:', API_URL);
}


// Interceptor de respuesta para loguear errores de red detallados en desarrollo
api.interceptors.response.use(
  (res) => res,
  (error) => {
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
    return Promise.reject(error);
  }
);

// Request interceptor: add bearer token + fix Content-Type for multipart uploads
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    // ignore
  }

  // When sending FormData, remove the default 'application/json' Content-Type so the
  // browser / React Native XHR can set 'multipart/form-data; boundary=...' automatically.
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }

  return config;
});

export default api;
