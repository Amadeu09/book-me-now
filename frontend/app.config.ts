import { ExpoConfig, ConfigContext } from 'expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // Prefer explicit env var. Fallback to localhost:3000 (backend NestJS) per a desenvolupament.
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  if (process.env.NODE_ENV === 'production' && apiUrl.startsWith('http://')) {
    throw new Error(
      `[app.config] EXPO_PUBLIC_API_URL must use HTTPS in production. Got: ${apiUrl}`
    );
  }

  const merged = {
    ...config,
    extra: {
      ...(config.extra || {}),
      apiUrl,
    },
  } as ExpoConfig;

  return merged;
};
