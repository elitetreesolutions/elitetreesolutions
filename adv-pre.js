/* ═══════════════════════════════════════════════════════════
   ADVERSE TECHNOLOGIES — Page Preloader
   Black void · Geometric A monogram · Typewriter cursor effect
   Adverse → pause → Technologies
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Skip if already shown this session (fast navigation)
  // But always show on first load of each unique page
  const pageKey = 'adv_pre_' + location.pathname;
  const alreadyShown = sessionStorage.getItem(pageKey);

  // Build and inject preloader immediately (before DOM ready)
  const style = document.createElement('style');
  style.textContent = `
    /* ── PRELOADER OVERLAY ── */
    #advPre {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #050a06;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
      transition: opacity 0.7s ease, visibility 0.7s ease;
      overflow: hidden;
    }
    #advPre.adv-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    /* ── AMBIENT BACKGROUND ── */
    #advPre::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 50% at 50% 50%, rgba(122,182,72,0.04) 0%, transparent 70%),
        radial-gradient(ellipse 30% 30% at 20% 80%, rgba(122,182,72,0.03) 0%, transparent 60%);
      pointer-events: none;
    }

    /* ── GRID LINES (tech feel) ── */
    #advPre::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(122,182,72,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(122,182,72,0.025) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
    }

    /* ── LOGO MARK ── */
    #advPreLogo {
      position: relative;
      z-index: 2;
      margin-bottom: 2.8rem;
      opacity: 0;
      transform: scale(0.7) translateY(8px);
      animation: advLogoIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
    }
    @keyframes advLogoIn {
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* ── RING PULSE around logo ── */
    .adv-ring {
      position: absolute;
      inset: -18px;
      border-radius: 50%;
      border: 1px solid rgba(122,182,72,0.15);
      animation: advRingPulse 2s ease infinite;
    }
    .adv-ring-2 {
      inset: -32px;
      border-color: rgba(122,182,72,0.07);
      animation-delay: 0.4s;
    }
    @keyframes advRingPulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.04); }
    }

    /* ── TYPEWRITER TEXT ── */
    #advPreText {
      position: relative;
      z-index: 2;
      text-align: center;
      margin-bottom: 0.6rem;
    }
    #advPreName {
      font-size: clamp(1.5rem, 5vw, 2.4rem);
      font-weight: 300;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #f0ede8;
      line-height: 1.2;
      min-height: 1.2em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
    }
    #advTyped {
      color: #f0ede8;
    }
    #advTypedB {
      color: #7ab648;
      font-weight: 400;
    }
    /* Blinking cursor */
    #advCursor {
      display: inline-block;
      width: 2px;
      height: 1em;
      background: #7ab648;
      margin-left: 3px;
      vertical-align: middle;
      animation: advBlink 0.75s step-end infinite;
    }
    @keyframes advBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    /* Cursor hidden state */
    #advCursor.adv-no-blink {
      animation: none;
      opacity: 1;
    }

    /* ── TAGLINE ── */
    #advTagline {
      position: relative;
      z-index: 2;
      font-size: 0.62rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: rgba(122,182,72,0.45);
      margin-top: 1.4rem;
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    #advTagline.adv-show { opacity: 1; }

    /* ── PROGRESS BAR ── */
    #advBar {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      background: rgba(122,182,72,0.08);
      z-index: 2;
    }
    #advBarFill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #4a7c59, #7ab648, #9dd460);
      transition: width 0.1s linear;
      box-shadow: 0 0 8px rgba(122,182,72,0.6);
    }

    /* ── CORNER MARKS (tech detail) ── */
    .adv-corner {
      position: absolute;
      width: 20px; height: 20px;
      z-index: 2;
      opacity: 0.25;
    }
    .adv-corner-tl { top: 1.5rem; left: 1.5rem; border-top: 1px solid #7ab648; border-left: 1px solid #7ab648; }
    .adv-corner-tr { top: 1.5rem; right: 1.5rem; border-top: 1px solid #7ab648; border-right: 1px solid #7ab648; }
    .adv-corner-bl { bottom: 1.5rem; left: 1.5rem; border-bottom: 1px solid #7ab648; border-left: 1px solid #7ab648; }
    .adv-corner-br { bottom: 1.5rem; right: 1.5rem; border-bottom: 1px solid #7ab648; border-right: 1px solid #7ab648; }

    /* ── VERSION TAG ── */
    #advVersion {
      position: absolute;
      bottom: 1.4rem;
      right: 2rem;
      font-size: 0.58rem;
      letter-spacing: 0.15em;
      color: rgba(122,182,72,0.2);
      z-index: 2;
      font-family: 'IBM Plex Mono', monospace;
    }
  `;
  document.head.appendChild(style);

  // ── BUILD PRELOADER HTML ──
  const pre = document.createElement('div');
  pre.id = 'advPre';
  pre.setAttribute('role', 'progressbar');
  pre.setAttribute('aria-label', 'Loading Adverse Technologies');

  pre.innerHTML = `
    <!-- Corner brackets -->
    <div class="adv-corner adv-corner-tl"></div>
    <div class="adv-corner adv-corner-tr"></div>
    <div class="adv-corner adv-corner-bl"></div>
    <div class="adv-corner adv-corner-br"></div>

    <!-- Geometric A Logo -->
    <div id="advPreLogo">
      <div class="adv-ring"></div>
      <div class="adv-ring adv-ring-2"></div>
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer circle -->
        <circle cx="44" cy="44" r="42" stroke="rgba(122,182,72,0.18)" stroke-width="1"/>
        <!-- Inner circle -->
        <circle cx="44" cy="44" r="34" stroke="rgba(122,182,72,0.08)" stroke-width="1"/>

        <!-- Geometric A shape — sharp, tech -->
        <!-- Left leg -->
        <path d="M24 68 L44 20 L64 68" stroke="#7ab648" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <!-- Crossbar -->
        <path d="M31.5 52 L56.5 52" stroke="#7ab648" stroke-width="2" stroke-linecap="round"/>

        <!-- Circuit dots on crossbar ends -->
        <circle cx="31.5" cy="52" r="2.5" fill="#7ab648"/>
        <circle cx="56.5" cy="52" r="2.5" fill="#7ab648"/>

        <!-- Apex dot -->
        <circle cx="44" cy="20" r="2" fill="#9dd460"/>

        <!-- Circuit lines extending from legs (tech detail) -->
        <path d="M24 68 L18 68 L18 62" stroke="rgba(122,182,72,0.35)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M64 68 L70 68 L70 62" stroke="rgba(122,182,72,0.35)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Small circuit nodes -->
        <rect x="16" y="60" width="4" height="4" rx="1" fill="rgba(122,182,72,0.3)"/>
        <rect x="68" y="60" width="4" height="4" rx="1" fill="rgba(122,182,72,0.3)"/>

        <!-- Subtle scan line -->
        <line x1="10" y1="44" x2="18" y2="44" stroke="rgba(122,182,72,0.2)" stroke-width="1"/>
        <line x1="70" y1="44" x2="78" y2="44" stroke="rgba(122,182,72,0.2)" stroke-width="1"/>
      </svg>
    </div>

    <!-- Typewriter text -->
    <div id="advPreText">
      <div id="advPreName">
        <span id="advTyped"></span><span id="advTypedB"></span><span id="advCursor"></span>
      </div>
    </div>

    <!-- Tagline -->
    <div id="advTagline">Building the future · Uganda</div>

    <!-- Progress bar -->
    <div id="advBar"><div id="advBarFill"></div></div>

    <!-- Version -->
    <div id="advVersion">ADV · v2025</div>
  `;

  // Inject as very first child of body (before anything renders)
  if (document.body) {
    document.body.insertBefore(pre, document.body.firstChild);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.insertBefore(pre, document.body.firstChild);
    });
  }

  // ── TYPEWRITER ENGINE ──
  function typewriter(config, onDone) {
    /*
      config = [
        { text: 'Adverse',      el: 'advTyped',  speed: 80, pauseAfter: 520 },
        { text: ' Technologies', el: 'advTypedB', speed: 55, pauseAfter: 0   },
      ]
    */
    let stepIndex = 0;

    function typeStep(step, charIndex, cb) {
      const el = document.getElementById(step.el);
      if (!el) { cb(); return; }

      if (charIndex <= step.text.length) {
        el.textContent = step.text.slice(0, charIndex);

        // Natural typing rhythm — slight randomness
        const base = step.speed;
        const jitter = Math.random() * 30 - 10;
        setTimeout(() => typeStep(step, charIndex + 1, cb), base + jitter);
      } else {
        // Finished this word — pause then callback
        setTimeout(cb, step.pauseAfter || 0);
      }
    }

    function runNext() {
      if (stepIndex >= config.length) {
        if (onDone) onDone();
        return;
      }
      typeStep(config[stepIndex], 0, () => {
        stepIndex++;
        runNext();
      });
    }

    runNext();
  }

  // ── PROGRESS BAR ──
  function animateBar(duration, onDone) {
    const fill = document.getElementById('advBarFill');
    if (!fill) { onDone && onDone(); return; }

    let start = null;
    // Goes to 85% naturally, then jumps to 100% when done
    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(85, (elapsed / duration) * 85);
      fill.style.width = pct + '%';
      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        fill.style.width = '100%';
        fill.style.transition = 'width 0.25s ease';
        setTimeout(onDone, 280);
      }
    }
    requestAnimationFrame(step);
  }

  // ── DISMISS PRELOADER ──
  function dismiss() {
    const overlay = document.getElementById('advPre');
    if (!overlay) return;
    overlay.classList.add('adv-hidden');
    setTimeout(() => {
      overlay.remove();
      // Also hide the site's own splash if present (index.html)
      const siteSplash = document.getElementById('loadSplash');
      if (siteSplash) siteSplash.classList.add('hidden');
    }, 750);
    sessionStorage.setItem(pageKey, '1');
  }

  // ── CURSOR BLINK CONTROL ──
  function stopBlink() {
    const cursor = document.getElementById('advCursor');
    if (cursor) cursor.classList.add('adv-no-blink');
  }
  function hideCursor() {
    const cursor = document.getElementById('advCursor');
    if (cursor) cursor.style.display = 'none';
  }

  // ── MAIN SEQUENCE ──
  function runPreloader() {
    const overlay = document.getElementById('advPre');
    if (!overlay) return;

    // If already shown this session, dismiss instantly
    if (alreadyShown) {
      overlay.remove();
      return;
    }

    // Total display time: logo animates in (0.8s) + typing + small hold
    const TOTAL_DURATION = 3200; // ms

    // Start progress bar
    animateBar(TOTAL_DURATION - 300, () => {});

    // Start typewriter after logo animates in (0.8s delay)
    setTimeout(() => {
      typewriter([
        { el: 'advTyped',  text: 'Adverse',       speed: 85, pauseAfter: 540 },
        { el: 'advTypedB', text: ' Technologies',  speed: 58, pauseAfter: 200 },
      ], () => {
        // Typing done — stop cursor blink, show tagline
        stopBlink();
        const tagline = document.getElementById('advTagline');
        if (tagline) tagline.classList.add('adv-show');

        // Short hold then dismiss
        setTimeout(() => {
          hideCursor();
          dismiss();
        }, 500);
      });
    }, 820);

    // Safety net — always dismiss after max time
    setTimeout(dismiss, TOTAL_DURATION + 500);

    // Also dismiss when page fully loads (whichever comes first)
    window.addEventListener('load', () => {
      // Give typing sequence time to finish naturally
      setTimeout(dismiss, 1200);
    }, { once: true });
  }

  // Run immediately
  runPreloader();

})();
