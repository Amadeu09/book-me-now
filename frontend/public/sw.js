/* Service worker de BookMeNow: només mostra les notificacions push dels avisos. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let dades = {};
  try {
    dades = event.data ? event.data.json() : {};
  } catch (e) {
    dades = { cos: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(dades.titol || 'BookMeNow', {
      body: dades.cos || '',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: dades.tag,
      renotify: Boolean(dades.tag),
      data: { url: dades.url || '/bookings' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || '/bookings', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((finestres) => {
      for (const f of finestres) {
        if (f.url.startsWith(self.location.origin) && 'focus' in f) {
          if ('navigate' in f) f.navigate(url);
          return f.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
