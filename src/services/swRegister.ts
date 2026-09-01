/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Service Worker Registration
 */

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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
  }
}
