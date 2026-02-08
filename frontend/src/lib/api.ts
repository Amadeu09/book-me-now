import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Resolución robusta de la base URL para dispositivo físico:
// 1. Env var EXPO_PUBLIC_API_URL (recomendado)
// 2. extra.apiUrl definida en app.config.ts
// 3. hostUri de Expo (ej: 192.168.x.x:8081) -> construimos http://IP:3000
// 4. Fallback final localhost:3000
function resolveApiBase(): string {
  const extra = Constants.expoConfig?.extra as any;
  let candidate = extra?.apiUrl as string | undefined;

  // Fallbacks: IP del host desde Expo o localhost
  if (!candidate) {
    const hostUri: string | undefined = (Constants as any).expoConfig?.hostUri;
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

// HARDCODED para forzar el puerto correcto - cambiar solo si backend cambia de puerto
const API_URL = 'http://localhost:3000/api';

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

// Request interceptor to add bearer token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    // ignore
  }
  return config;
});

export default api;
