import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '@/features/auth/services/auth.service';

/* ──────────────────────────────────────────
   Session helpers
   Reads token / user persisted by LoginScreen
   and RegisterUserScreen (keys: "token", "user")
   ────────────────────────────────────────── */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** Devuelve el token JWT almacenado, o null */
export async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

/** Devuelve el usuario autenticado, o null */
export async function getUser(): Promise<AuthUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

/** Devuelve el empresaId del usuario logueado, o null */
export async function getEmpresaId(): Promise<number | null> {
    const user = await getUser();
    return user?.empresaId ?? null;
}

/**
 * Patches the stored user's empresa fields.
 * Call this after any successful company update so the theme
 * survives a reload without needing a new login.
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
 * Patches top-level fields on the stored user (e.g. colorPrimari).
 * Call this after any successful self-service user update.
 */
export async function patchStoredUser(patch: Partial<AuthUser>): Promise<void> {
    const user = await getUser();
    if (!user) return;
    const updated: AuthUser = { ...user, ...patch };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
}

/** Limpia la sesión (logout) */
export async function clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
