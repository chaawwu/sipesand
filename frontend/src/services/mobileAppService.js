import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { cleanTenantInput, getCurrentTenant } from './localDatabase';

/**
 * Inisialisasi Service Native Mobile (Android APK)
 * - Menangani Deep Linking (sipesand://tenant?id=namapondok)
 * - Menangani tombol Back fisik HP Android
 * - Mengatur Status Bar & Splash Screen native
 */
export function initMobileAppBridge(onTenantChanged = null) {
  if (typeof window === 'undefined') return;

  const isNative = Boolean(window.Capacitor?.isNativePlatform?.());

  if (isNative) {
    // 1. Hide Splash Screen smoothly after React mounts
    try {
      SplashScreen.hide({ fadeOutDuration: 400 });
    } catch (e) {}

    // 2. Configure Native Status Bar
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#0052FF' });
    } catch (e) {}

    // 3. Android Hardware Back Button Listener
    try {
      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          // Jika di halaman awal, konfirmasi keluar aplikasi
          if (window.confirm('Keluar dari aplikasi SiPesand?')) {
            App.exitApp();
          }
        }
      });
    } catch (e) {}

    // 4. Deep Link Listener (sipesand://namapondok atau https://namapondok.sipesand.web.id)
    try {
      App.addListener('appUrlOpen', (event) => {
        if (!event?.url) return;
        try {
          const urlStr = event.url;
          let detectedTenant = null;

          if (urlStr.startsWith('sipesand://')) {
            // Format: sipesand://tenant?id=namapondok atau sipesand://namapondok
            const pathPart = urlStr.replace('sipesand://', '');
            if (pathPart.includes('?')) {
              const qs = new URLSearchParams(pathPart.split('?')[1]);
              detectedTenant = qs.get('tenant') || qs.get('id') || qs.get('subdomain');
            } else {
              detectedTenant = pathPart.replace(/^\/+|\/+$/g, '');
            }
          } else {
            const parsed = new URL(urlStr);
            const q = parsed.searchParams.get('tenant') || parsed.searchParams.get('id');
            if (q) {
              detectedTenant = q;
            } else if (parsed.hostname.includes('.sipesand.web.id')) {
              detectedTenant = parsed.hostname.replace('.sipesand.web.id', '').split('.')[0];
            }
          }

          const cleaned = cleanTenantInput(detectedTenant);
          if (cleaned && cleaned !== getCurrentTenant()) {
            localStorage.setItem('sipesand_active_tenant', cleaned);
            if (typeof onTenantChanged === 'function') {
              onTenantChanged(cleaned);
            } else {
              window.location.reload();
            }
          }
        } catch (err) {
          console.warn('Error parsing native app URL:', err);
        }
      });
    } catch (e) {}
  }
}

/**
 * Cek apakah aplikasi berjalan sebagai APK native Android
 */
export function isMobileNative() {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && window.navigator?.userAgent?.includes('Android'))
  );
}

/**
 * Unduh APK SiPesand langsung
 */
export function getApkDownloadUrl() {
  // 1. Cek apakah di-hosting di server lokal/production
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin && !origin.includes('localhost')) {
      return `${origin}/download/sipesand.apk`;
    }
  }
  // 2. Default link GitHub Releases atau direct web
  return 'https://github.com/chaawwu/sipesand/releases/latest/download/sipesand-release.apk';
}

/**
 * Meminta izin runtime Android (Kamera & Notifikasi) secara graceful
 */
export async function requestNativePermissions() {
  if (typeof window === 'undefined') return;
  
  // 1. Izin Kamera via browser/Capacitor MediaDevices jika scan QR
  try {
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Matikan stream setelah izin didapatkan
      stream.getTracks().forEach(track => track.stop());
    }
  } catch (err) {
    console.log('Camera permission prompt skipped or denied:', err.message);
  }

  // 2. Izin Notifikasi (Web & Mobile push notifications)
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  } catch (err) {
    console.log('Notification permission prompt skipped:', err.message);
  }

  // 3. Inisialisasi Sensor NFC (Web NFC NDEFReader jika perangkat mendukung)
  try {
    if ('NDEFReader' in window) {
      const ndef = new window.NDEFReader();
      // Tes aktivasi pembaca NFC di browser/webview
      console.log('NFC hardware reader is supported and ready.');
    }
  } catch (err) {
    console.log('NFC activation check skipped:', err.message);
  }
}

