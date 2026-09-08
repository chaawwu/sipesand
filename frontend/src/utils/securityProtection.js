/**
 * Security Protection System for SiPesand Platform
 * Melindungi antarmuka dari inspect element (Ctrl+Shift+I, F12, Ctrl+U),
 * context menu (klik kanan), dan mencegah pembocoran data sensitif melalui console peramban.
 */

export function initSecurityProtection() {
  if (typeof window === 'undefined') return;

  // 1. Blokir Menu Konteks (Klik Kanan)
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Blokir Shortcut Keyboard DevTools & View Source
  window.addEventListener('keydown', (e) => {
    // F12 (DevTools)
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = (e.key || '').toLowerCase();

    // Ctrl+Shift+I atau Cmd+Option+I (Inspect Element)
    if (isCtrlOrMeta && isShift && (key === 'i' || e.keyCode === 73)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+J atau Cmd+Option+J (Console)
    if (isCtrlOrMeta && isShift && (key === 'j' || e.keyCode === 74)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+C atau Cmd+Option+C (Element Inspector)
    if (isCtrlOrMeta && isShift && (key === 'c' || e.keyCode === 67)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U atau Cmd+Option+U (View Page Source)
    if (isCtrlOrMeta && (key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S atau Cmd+S (Save HTML Page)
    if (isCtrlOrMeta && (key === 's' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Sanitasi Output Console (Mencegah Sniffing Data di Console)
  try {
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.dir = noop;
    console.table = noop;
    console.debug = noop;
  } catch (err) {
    // Silent catch
  }

  // 4. Deteksi Pembukaan DevTools via Window Outer/Inner Threshold
  let devtoolsDetected = false;
  const checkDevTools = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;

    if ((widthDiff || heightDiff) && !devtoolsDetected) {
      devtoolsDetected = true;
      try {
        console.clear();
      } catch (e) {}
    } else if (!widthDiff && !heightDiff) {
      devtoolsDetected = false;
    }
  };

  window.addEventListener('resize', checkDevTools, { passive: true });
}
