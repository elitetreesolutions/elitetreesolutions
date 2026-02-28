// ═══════════════════════════════════════════════════════
// ELITE TREE SOLUTIONS — PWA Controller
// Phase 1: Service Worker Registration
// Phase 2: App UI (Bottom Nav, Install Banner)
// Phase 4: Push Notification Subscription
// ═══════════════════════════════════════════════════════

(function () {
  'use strict';

  const BASE = '/elitetreesolutions';
  const VAPID_PUBLIC_KEY = ''; // Fill in after setting up push server

  // ── DETECT PWA MODE ──
  const isPWA = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || document.referrer.includes('android-app://');

  // ── CURRENT PAGE ──
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // ═══════════════════════════════════
  // PHASE 1 — Register Service Worker
  // ═══════════════════════════════════
  function registerSW() {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker not supported in this browser.');
      return;
    }

    navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` })
      .then(reg => {
        console.log('[PWA] ✅ Service Worker registered:', reg.scope);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      })
      .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
  }

  // ═══════════════════════════════════
  // PHASE 2 — Install Prompt Banner
  // ═══════════════════════════════════
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Install prompt ready.');

    // Show install banner after 8 seconds if not already installed
    if (!isPWA && !localStorage.getItem('ets_install_dismissed')) {
      setTimeout(showInstallBanner, 8000);
    }
  });

  function showInstallBanner() {
    if (document.getElementById('pwaInstallBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwaInstallBanner';
    banner.innerHTML = `
      <div style="
        position:fixed;bottom:${isPWA ? '80px' : '1.5rem'};left:50%;transform:translateX(-50%);
        z-index:10000;width:calc(100% - 3rem);max-width:420px;
        background:#0d2818;border:1px solid rgba(122,182,72,0.3);
        border-radius:1.2rem;padding:1.2rem 1.4rem;
        box-shadow:0 8px 40px rgba(0,0,0,0.5);
        display:flex;align-items:center;gap:1rem;
        animation:slideUpBanner 0.4s ease forwards;
        font-family:'DM Sans',sans-serif;
      ">
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#1a4a2e,#0d2818);border:1px solid rgba(122,182,72,0.25);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <ellipse cx="13" cy="10" rx="9" ry="8" fill="#7ab648" opacity="0.9"/>
            <ellipse cx="13" cy="7" rx="6" ry="5.5" fill="#0d2818" opacity="0.45"/>
            <rect x="11.5" y="17" width="3" height="8" rx="1.5" fill="#5c3d1e"/>
          </svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.88rem;font-weight:600;color:#f5f0e8;margin-bottom:0.15rem;">Install Elite Tree Solutions</div>
          <div style="font-size:0.72rem;color:rgba(245,240,232,0.45);line-height:1.4;">Add to home screen — works offline too</div>
        </div>
        <div style="display:flex;gap:0.5rem;flex-shrink:0;">
          <button onclick="dismissInstall()" style="background:transparent;border:1px solid rgba(245,240,232,0.15);color:rgba(245,240,232,0.4);padding:0.4rem 0.7rem;border-radius:0.5rem;font-size:0.72rem;cursor:pointer;font-family:inherit;">Later</button>
          <button onclick="triggerInstall()" style="background:#7ab648;border:none;color:#0d2818;padding:0.4rem 0.9rem;border-radius:0.5rem;font-size:0.78rem;font-weight:600;cursor:pointer;font-family:inherit;">Install ↓</button>
        </div>
      </div>
      <style>
        @keyframes slideUpBanner {
          from { opacity:0; transform:translateX(-50%) translateY(20px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      </style>
    `;
    document.body.appendChild(banner);
  }

  window.triggerInstall = function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(result => {
      console.log('[PWA] Install choice:', result.outcome);
      if (result.outcome === 'accepted') {
        console.log('[PWA] ✅ App installed!');
        showToast('✅ App installed! Find it on your home screen.');
      }
      deferredPrompt = null;
      dismissInstall();
    });
  };

  window.dismissInstall = function () {
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.remove();
    localStorage.setItem('ets_install_dismissed', '1');
  };

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] ✅ App installed successfully!');
    deferredPrompt = null;
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.remove();
  });

  // ═══════════════════════════════════
  // PHASE 2 — Bottom Navigation Bar
  // ═══════════════════════════════════
  function injectBottomNav() {
    if (document.getElementById('pwaBottomNav')) return;

    const pages = [
      { href: 'index.html',   label: 'Home',   icon: homeIcon()   },
      { href: 'shop.html',    label: 'Shop',   icon: shopIcon()   },
      { href: 'booking.html', label: 'Book',   icon: bookIcon()   },
      { href: 'adverse.html', label: 'Ask AI', icon: aiIcon()     },
      { href: 'findus.html',  label: 'Find Us',icon: mapIcon()    },
    ];

    const nav = document.createElement('nav');
    nav.id = 'pwaBottomNav';
    nav.setAttribute('aria-label', 'App Navigation');

    const style = document.createElement('style');
    style.textContent = `
      #pwaBottomNav {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        z-index: 9000;
        background: rgba(8, 20, 10, 0.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(122,182,72,0.12);
        display: flex;
        align-items: stretch;
        padding-bottom: env(safe-area-inset-bottom, 0px);
        height: calc(64px + env(safe-area-inset-bottom, 0px));
        box-shadow: 0 -4px 30px rgba(0,0,0,0.4);
      }
      .pwa-nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        text-decoration: none;
        color: rgba(245,240,232,0.35);
        font-family: 'DM Sans', sans-serif;
        font-size: 0.62rem;
        font-weight: 500;
        letter-spacing: 0.02em;
        padding: 8px 4px;
        transition: color 0.2s;
        position: relative;
        -webkit-tap-highlight-color: transparent;
      }
      .pwa-nav-item:active { transform: scale(0.92); }
      .pwa-nav-item.active {
        color: #7ab648;
      }
      .pwa-nav-item.active svg path,
      .pwa-nav-item.active svg ellipse,
      .pwa-nav-item.active svg rect,
      .pwa-nav-item.active svg circle {
        stroke: #7ab648;
        fill-opacity: 0.15;
      }
      .pwa-nav-item svg {
        width: 22px; height: 22px;
        transition: transform 0.2s;
      }
      .pwa-nav-item.active svg { transform: translateY(-1px); }
      .pwa-nav-dot {
        position: absolute;
        top: 6px;
        width: 32px; height: 32px;
        border-radius: 50%;
        background: rgba(122,182,72,0.1);
        transform: scale(0);
        transition: transform 0.25s;
      }
      .pwa-nav-item.active .pwa-nav-dot { transform: scale(1); }
      /* Push page content up when bottom nav is showing */
      body.pwa-nav-active {
        padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
      }
      /* Hide bottom nav on desktop */
      @media (min-width: 1024px) {
        #pwaBottomNav { display: none !important; }
        body.pwa-nav-active { padding-bottom: 0 !important; }
      }
    `;
    document.head.appendChild(style);

    pages.forEach(page => {
      const a = document.createElement('a');
      a.href = page.href;
      a.className = 'pwa-nav-item' + (currentPage === page.href ? ' active' : '');
      a.setAttribute('aria-label', page.label);
      a.innerHTML = `
        <div class="pwa-nav-dot"></div>
        ${page.icon}
        <span>${page.label}</span>
      `;
      // Smooth transition on click
      a.addEventListener('click', e => {
        document.querySelectorAll('.pwa-nav-item').forEach(el => el.classList.remove('active'));
        a.classList.add('active');
      });
      nav.appendChild(a);
    });

    document.body.appendChild(nav);
    document.body.classList.add('pwa-nav-active');
  }

  // ═══════════════════════════════════
  // PHASE 2 — Update Banner
  // ═══════════════════════════════════
  function showUpdateBanner() {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position:fixed;top:1rem;left:50%;transform:translateX(-50%);
      z-index:10001;background:#0d2818;border:1px solid rgba(122,182,72,0.3);
      border-radius:1rem;padding:0.9rem 1.4rem;
      display:flex;align-items:center;gap:1rem;
      box-shadow:0 8px 30px rgba(0,0,0,0.4);
      font-family:'DM Sans',sans-serif;font-size:0.82rem;color:#f5f0e8;
    `;
    banner.innerHTML = `
      <span>🌿 New version available!</span>
      <button onclick="window.location.reload()" style="background:#7ab648;border:none;color:#0d2818;padding:0.35rem 0.9rem;border-radius:0.5rem;font-size:0.78rem;font-weight:600;cursor:pointer;">Update</button>
      <button onclick="this.parentNode.remove()" style="background:none;border:none;color:rgba(245,240,232,0.4);cursor:pointer;font-size:1rem;">✕</button>
    `;
    document.body.appendChild(banner);
  }

  // ═══════════════════════════════════
  // PHASE 4 — Push Notifications
  // ═══════════════════════════════════
  function initPushNotifications() {
    if (!('Notification' in window) || !('PushManager' in window)) return;
    if (!navigator.serviceWorker) return;

    // Show notification prompt button in floating area (subtle)
    if (Notification.permission === 'default' && isPWA) {
      setTimeout(showNotificationPrompt, 15000); // Ask after 15s in app mode
    }
  }

  function showNotificationPrompt() {
    if (localStorage.getItem('ets_notif_asked')) return;
    if (document.getElementById('pwaNotifPrompt')) return;

    const prompt = document.createElement('div');
    prompt.id = 'pwaNotifPrompt';
    prompt.style.cssText = `
      position:fixed;bottom:80px;right:1rem;z-index:9500;
      background:#0d2818;border:1px solid rgba(122,182,72,0.25);
      border-radius:1rem;padding:1rem 1.2rem;max-width:260px;
      box-shadow:0 8px 30px rgba(0,0,0,0.4);
      font-family:'DM Sans',sans-serif;
      animation:slideUpBanner 0.35s ease forwards;
    `;
    prompt.innerHTML = `
      <div style="font-size:0.85rem;font-weight:600;color:#f5f0e8;margin-bottom:0.3rem;">🔔 Stay in the know</div>
      <div style="font-size:0.75rem;color:rgba(245,240,232,0.45);margin-bottom:0.9rem;line-height:1.5;">Get alerts when new trees arrive or Kakuye posts seasonal tips.</div>
      <div style="display:flex;gap:0.5rem;">
        <button onclick="requestNotifPermission()" style="flex:1;background:#7ab648;border:none;color:#0d2818;padding:0.5rem;border-radius:0.5rem;font-size:0.75rem;font-weight:600;cursor:pointer;font-family:inherit;">Allow</button>
        <button onclick="dismissNotifPrompt()" style="flex:1;background:rgba(245,240,232,0.06);border:1px solid rgba(245,240,232,0.1);color:rgba(245,240,232,0.5);padding:0.5rem;border-radius:0.5rem;font-size:0.75rem;cursor:pointer;font-family:inherit;">Not now</button>
      </div>
    `;
    document.body.appendChild(prompt);
  }

  window.requestNotifPermission = async function () {
    localStorage.setItem('ets_notif_asked', '1');
    const prompt = document.getElementById('pwaNotifPrompt');
    if (prompt) prompt.remove();

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('[PWA] ✅ Notification permission granted!');
        await subscribeToPush();
        showToast('✅ Notifications enabled! You\'ll hear from us soon. 🌿');
      } else {
        console.log('[PWA] Notification permission denied.');
      }
    } catch (err) {
      console.warn('[PWA] Notification error:', err);
    }
  };

  window.dismissNotifPrompt = function () {
    localStorage.setItem('ets_notif_asked', '1');
    const prompt = document.getElementById('pwaNotifPrompt');
    if (prompt) prompt.remove();
  };

  async function subscribeToPush() {
    if (!VAPID_PUBLIC_KEY) {
      console.log('[PWA] VAPID key not set — skipping push subscription.');
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log('[PWA] Push subscription:', JSON.stringify(subscription));
      // Send subscription to your server here
      // await fetch('/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
    } catch (err) {
      console.warn('[PWA] Push subscription failed:', err);
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
  }

  // ═══════════════════════════════════
  // OFFLINE STATUS INDICATOR
  // ═══════════════════════════════════
  function initOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'pwaOfflineBar';
    indicator.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:10002;
      background:#c8a96e;color:#0d2818;
      text-align:center;font-size:0.75rem;font-weight:600;
      padding:0.4rem 1rem;
      transform:translateY(-100%);transition:transform 0.3s;
      font-family:'DM Sans',sans-serif;
    `;
    indicator.textContent = '📵 You\'re offline — viewing cached content';
    document.body.appendChild(indicator);

    function updateOnlineStatus() {
      indicator.style.transform = navigator.onLine ? 'translateY(-100%)' : 'translateY(0)';
      if (!navigator.onLine) {
        document.body.style.paddingTop = '28px';
      } else {
        document.body.style.paddingTop = '';
        showToast('✅ Back online!');
      }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  // ═══════════════════════════════════
  // TOAST HELPER
  // ═══════════════════════════════════
  window.showToast = function (msg, duration = 3000) {
    let toast = document.getElementById('pwaToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pwaToast';
      toast.style.cssText = `
        position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);
        z-index:10003;background:#0d2818;border:1px solid rgba(122,182,72,0.3);
        color:#7ab648;padding:0.7rem 1.5rem;border-radius:2rem;
        font-family:'DM Sans',sans-serif;font-size:0.82rem;font-weight:500;
        box-shadow:0 4px 20px rgba(0,0,0,0.4);
        transition:all 0.35s;opacity:0;white-space:nowrap;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, duration);
  };

  // ═══════════════════════════════════
  // SVG ICONS
  // ═══════════════════════════════════
  function homeIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>`;
  }
  function shopIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
    </svg>`;
  }
  function bookIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <path d="M8 14h4M8 17h8"/>
    </svg>`;
  }
  function aiIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="12" cy="9" rx="7" ry="6"/>
      <ellipse cx="12" cy="6.5" rx="4.5" ry="4" stroke-opacity="0.4"/>
      <rect x="10.5" y="14" width="3" height="9" rx="1.5"/>
    </svg>`;
  }
  function mapIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>`;
  }

  // ═══════════════════════════════════
  // INITIALISE EVERYTHING
  // ═══════════════════════════════════
  function init() {
    // Register Service Worker
    registerSW();

    // Always show bottom nav on mobile (feels native)
    injectBottomNav();

    // Offline indicator
    initOfflineIndicator();

    // Push notifications (only in PWA/installed mode)
    if (isPWA) {
      initPushNotifications();
    }

    console.log(`[PWA] Elite Tree Solutions PWA initialised. Mode: ${isPWA ? 'Standalone App' : 'Browser'}`);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
