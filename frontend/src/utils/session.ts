import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '@/features/auth/services/auth.service';

/* ──────────────────────────────────────────
   Session helpers
   Token i user guardats a AsyncStorage.
   NOTE: en builds natius (iOS/Android) migrar token a expo-secure-store
   per xifrat natiu (iOS Keychain / Android Keystore).
   En web, AsyncStorage i SecureStore usen localStorage — seguretat equivalent.
   ────────────────────────────────────────── */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** Retorna el token JWT emmagatzemat, o null */
export async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

/** Desa el token JWT */
export async function setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
}

/** Retorna l'usuari autenticat, o null */
export async function getUser(): Promise<AuthUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

/** Desa l'objecte d'usuari */
export async function setUser(user: AuthUser): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Retorna l'empresaId de l'usuari logejat, o null */
export async function getEmpresaId(): Promise<number | null> {
    const user = await getUser();
    return user?.empresaId ?? null;
}

/**
 * Actualitza els camps d'empresa de l'usuari desat.
 */
export async function patchStoredEmpresa(patch: Partial<NonNullable<AuthUser['empresa']>>): Promise<void> {
    const user = await getUser();
    if (!user) return;
    const updated: AuthUser = {
        ...user,
        empresa: user.empresa ? { ...user.empresa, ...patch } : user.empresa,
    };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
}

/**
 * Actualitza camps de primer nivell de l'usuari desat.
 */
export async function patchStoredUser(patch: Partial<AuthUser>): Promise<void> {
    const user = await getUser();
    if (!user) return;
    const updated: AuthUser = { ...user, ...patch };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
}

/** Esborra la sessió (logout) */
export async function clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
