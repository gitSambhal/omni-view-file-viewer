/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Viewer - Service Worker Registration
 */

export function registerServiceWorker(): void {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Only register service worker in true production builds
    const isProd = import.meta.env?.PROD ?? false;

    if (isProd) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[OmniView SW] Service worker registered successfully:', reg.scope);
          })
          .catch((err) => {
            console.warn('[OmniView SW] Service worker registration failed:', err);
          });
      });
    } else {
      // In development, ensure any previously registered service worker is unregistered
      // so it does not intercept Vite dev server requests or cause blank screens
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('[OmniView SW] Service worker setup encountered an error:', err);
  }
}
