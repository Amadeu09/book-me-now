import { ExpoConfig, ConfigContext } from 'expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // Prefer explicit env var. Fallback to localhost:3000 (backend NestJS) para desarrollo.
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  const merged = {
    ...config,
    extra: {
      ...(config.extra || {}),
      apiUrl,
    },
  } as ExpoConfig;

  return merged;
};
