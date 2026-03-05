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

/** Limpia la sesión (logout) */
export async function clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
