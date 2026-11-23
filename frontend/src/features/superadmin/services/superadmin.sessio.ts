import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAU = 'superadminToken';

/**
 * Token del superadmin. Al web es guarda a sessionStorage (desapareix en tancar la pestanya)
 * i mai es barreja amb el token d'empresa.
 */
export async function getSuperToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return window.sessionStorage.getItem(CLAU); } catch { return null; }
  }
  return AsyncStorage.getItem(CLAU);
}

export async function setSuperToken(token: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (token) window.sessionStorage.setItem(CLAU, token);
      else window.sessionStorage.removeItem(CLAU);
    } catch { /* navegador sense storage */ }
    return;
  }
  if (token) await AsyncStorage.setItem(CLAU, token);
  else await AsyncStorage.removeItem(CLAU);
}
