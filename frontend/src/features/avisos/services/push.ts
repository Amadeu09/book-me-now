import { Platform } from 'react-native';
import { baixaSubscripcio, enviarSubscripcio, getClauPush } from './avisos.service';

/**
 * Notificacions Web Push des del navegador (ordinador, Android i iPhone amb la web
 * afegida a la pantalla d'inici). A les apps natives encara no n'hi ha.
 */
export type EstatPush = 'no-suportat' | 'cal-installar' | 'denegat' | 'inactiu' | 'actiu';

const SW = '/sw.js';

function esIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function esInstallada() {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function pushSuportat(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined'
    && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

async function registre() {
  return (await navigator.serviceWorker.getRegistration(SW)) ?? navigator.serviceWorker.register(SW, { scope: '/' });
}

export async function estatPush(): Promise<EstatPush> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'no-suportat';
  if (!pushSuportat()) return esIOS() && !esInstallada() ? 'cal-installar' : 'no-suportat';
  if (Notification.permission === 'denied') return 'denegat';
  const reg = await navigator.serviceWorker.getRegistration(SW);
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === 'granted' ? 'actiu' : 'inactiu';
}

function clauABytes(base64: string): Uint8Array {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Demana permís, subscriu el navegador i ho desa al servidor. */
export async function activarPush(): Promise<EstatPush> {
  const clau = await getClauPush();
  if (!clau) throw new Error('PUSH_NO_DISPONIBLE');
  const permis = await Notification.requestPermission();
  if (permis !== 'granted') return permis === 'denied' ? 'denegat' : 'inactiu';
  const reg = await registre();
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription())
    ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: clauABytes(clau) as BufferSource }));
  await enviarSubscripcio(sub.toJSON());
  return 'actiu';
}

/** Treu la subscripció d'aquest navegador (també en tancar la sessió). Mai llança. */
export async function desactivarPush(): Promise<void> {
  try {
    if (!pushSuportat()) return;
    const reg = await navigator.serviceWorker.getRegistration(SW);
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await baixaSubscripcio(sub.endpoint).catch(() => undefined);
    await sub.unsubscribe();
  } catch {
    /* res a fer */
  }
}
