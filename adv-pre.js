/* ═══════════════════════════════════════════════════════════
   ADVERSE TECHNOLOGIES — Page Preloader v2
   Fixed: DOM injection, typewriter timing, guaranteed dismiss
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Already shown this session on this page? Skip. ──
  var pageKey = 'adv_shown_' + location.pathname;
  if (sessionStorage.getItem(pageKey)) return;

  // ── Inject CSS immediately into <head> ──
  var style = document.createElement('style');
  style.textContent = [
    '#advPre{',
      'position:fixed;inset:0;z-index:99999;',
      'background:#050a06;',
      'display:flex;flex-direction:column;',
      'align-items:center;justify-content:center;',
      'font-family:"DM Sans","Helvetica Neue",Arial,sans-serif;',
      'transition:opacity 0.65s ease,visibility 0.65s ease;',
      'overflow:hidden;',
    '}',
    '#advPre.adv-out{opacity:0;visibility:hidden;pointer-events:none;}',

    /* grid */
    '#advPre::after{',
      'content:"";position:absolute;inset:0;',
      'background-image:',
        'linear-gradient(rgba(122,182,72,0.03) 1px,transparent 1px),',
        'linear-gradient(90deg,rgba(122,182,72,0.03) 1px,transparent 1px);',
      'background-size:48px 48px;pointer-events:none;',
    '}',

    /* ambient glow */
    '#advPre::before{',
      'content:"";position:absolute;inset:0;',
      'background:radial-gradient(ellipse 55% 45% at 50% 50%,rgba(122,182,72,0.05) 0%,transparent 70%);',
      'pointer-events:none;',
    '}',

    /* logo wrapper */
    '#advLogo{',
      'position:relative;z-index:2;',
      'margin-bottom:2.6rem;',
      'opacity:0;transform:scale(0.75);',
      'animation:advIn 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.15s forwards;',
    '}',
    '@keyframes advIn{to{opacity:1;transform:scale(1);}}',

    /* pulse rings */
    '.advRing{',
      'position:absolute;border-radius:50%;',
      'border:1px solid rgba(122,182,72,0.14);',
      'animation:advPulse 2.2s ease infinite;',
    '}',
    '.advR1{inset:-16px;}',
    '.advR2{inset:-30px;border-color:rgba(122,182,72,0.07);animation-delay:0.5s;}',
    '@keyframes advPulse{0%,100%{opacity:0.4;transform:scale(1);}50%{opacity:1;transform:scale(1.05);}}',

    /* name */
    '#advName{',
      'position:relative;z-index:2;',
      'font-size:clamp(1.4rem,5vw,2.2rem);',
      'font-weight:300;',
      'letter-spacing:0.2em;',
      'text-transform:uppercase;',
      'color:#f0ede8;',
      'display:flex;align-items:center;justify-content:center;',
      'min-height:1.4em;',
      'margin-bottom:0;',
    '}',
    '#advPart1{color:#f0ede8;}',
    '#advPart2{color:#7ab648;font-weight:500;}',

    /* cursor */
    '#advCursor{',
      'display:inline-block;',
      'width:2px;height:0.9em;',
      'background:#7ab648;',
      'margin-left:4px;',
      'vertical-align:middle;',
      'animation:advBlink 0.8s step-end infinite;',
    '}',
    '@keyframes advBlink{0%,100%{opacity:1;}50%{opacity:0;}}',
    '#advCursor.adv-solid{animation:none;opacity:1;}',
    '#advCursor.adv-gone{display:none;}',

    /* tagline */
    '#advTag{',
      'position:relative;z-index:2;',
      'font-size:0.6rem;letter-spacing:0.28em;',
      'text-transform:uppercase;',
      'color:rgba(122,182,72,0.4);',
      'margin-top:1.5rem;',
      'opacity:0;transition:opacity 0.5s ease;',
    '}',
    '#advTag.adv-show{opacity:1;}',

    /* progress bar */
    '#advBar{position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(122,182,72,0.07);z-index:2;}',
    '#advFill{height:100%;width:0%;background:linear-gradient(90deg,#3a6a40,#7ab648,#9dd460);box-shadow:0 0 10px rgba(122,182,72,0.5);}',

    /* corner marks */
    '.advC{position:absolute;width:18px;height:18px;z-index:2;opacity:0.22;}',
    '.advTL{top:1.4rem;left:1.4rem;border-top:1px solid #7ab648;border-left:1px solid #7ab648;}',
    '.advTR{top:1.4rem;right:1.4rem;border-top:1px solid #7ab648;border-right:1px solid #7ab648;}',
    '.advBL{bottom:1.4rem;left:1.4rem;border-bottom:1px solid #7ab648;border-left:1px solid #7ab648;}',
    '.advBR{bottom:1.4rem;right:1.4rem;border-bottom:1px solid #7ab648;border-right:1px solid #7ab648;}',

    /* version */
    '#advVer{position:absolute;bottom:1.2rem;right:1.8rem;font-size:0.55rem;letter-spacing:0.14em;color:rgba(122,182,72,0.18);z-index:2;}',
  ].join('');
  document.head.appendChild(style);

  // ── Build the overlay HTML ──
  var html = [
    '<div class="advC advTL"></div>',
    '<div class="advC advTR"></div>',
    '<div class="advC advBL"></div>',
    '<div class="advC advBR"></div>',

    '<div id="advLogo">',
      '<div class="advRing advR1"></div>',
      '<div class="advRing advR2"></div>',
      '<svg width="86" height="86" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">',
        '<circle cx="44" cy="44" r="42" stroke="rgba(122,182,72,0.16)" stroke-width="1"/>',
        '<circle cx="44" cy="44" r="33" stroke="rgba(122,182,72,0.07)" stroke-width="1"/>',
        /* A shape */
        '<path d="M24 68 L44 18 L64 68" stroke="#7ab648" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        '<path d="M32 52 L56 52" stroke="#7ab648" stroke-width="2" stroke-linecap="round"/>',
        '<circle cx="32" cy="52" r="2.5" fill="#7ab648"/>',
        '<circle cx="56" cy="52" r="2.5" fill="#7ab648"/>',
        '<circle cx="44" cy="18" r="2" fill="#9dd460"/>',
        /* circuit legs */
        '<path d="M24 68 L17 68 L17 61" stroke="rgba(122,182,72,0.3)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>',
        '<path d="M64 68 L71 68 L71 61" stroke="rgba(122,182,72,0.3)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>',
        '<rect x="15" y="59" width="4" height="4" rx="1" fill="rgba(122,182,72,0.28)"/>',
        '<rect x="69" y="59" width="4" height="4" rx="1" fill="rgba(122,182,72,0.28)"/>',
        '<line x1="9" y1="44" x2="17" y2="44" stroke="rgba(122,182,72,0.18)" stroke-width="1"/>',
        '<line x1="71" y1="44" x2="79" y2="44" stroke="rgba(122,182,72,0.18)" stroke-width="1"/>',
      '</svg>',
    '</div>',

    '<div id="advName">',
      '<span id="advPart1"></span>',
      '<span id="advPart2"></span>',
      '<span id="advCursor"></span>',
    '</div>',

    '<div id="advTag">Powered by Adverse Technologies &middot; Uganda</div>',

    '<div id="advBar"><div id="advFill"></div></div>',
    '<div id="advVer">ADV &middot; 2026</div>',
  ].join('');

  // ── Inject overlay into body as soon as body is available ──
  function inject() {
    var overlay = document.createElement('div');
    overlay.id = 'advPre';
    overlay.innerHTML = html;
    // Prepend before everything
    if (document.body.firstChild) {
      document.body.insertBefore(overlay, document.body.firstChild);
    } else {
      document.body.appendChild(overlay);
    }
    startSequence();
  }

  // Body may or may not exist yet when this script runs from <head>
  if (document.body) {
    inject();
  } else {
    // Wait for body — use a tiny interval (faster than DOMContentLoaded)
    var bodyWait = setInterval(function () {
      if (document.body) {
        clearInterval(bodyWait);
        inject();
      }
    }, 5);
  }

  // ── TYPEWRITER ──
  function typeWord(elId, text, speed, done) {
    var el = document.getElementById(elId);
    if (!el) { done && done(); return; }
    var i = 0;
    function tick() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        // Slight human jitter
        setTimeout(tick, speed + (Math.random() * 28 - 10));
      } else {
        done && done();
      }
    }
    tick();
  }

  // ── PROGRESS BAR ──
  function runBar(ms) {
    var fill = document.getElementById('advFill');
    if (!fill) return;
    var start = Date.now();
    function step() {
      var pct = Math.min(90, ((Date.now() - start) / ms) * 90);
      fill.style.width = pct + '%';
      if (pct < 90) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── DISMISS ──
  function dismiss() {
    var overlay = document.getElementById('advPre');
    if (!overlay || overlay.dataset.dismissed) return;
    overlay.dataset.dismissed = '1';

    // Complete the bar
    var fill = document.getElementById('advFill');
    if (fill) { fill.style.transition = 'width 0.3s ease'; fill.style.width = '100%'; }

    setTimeout(function () {
      overlay.classList.add('adv-out');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        // Also kill site's own loadSplash if on index
        var splash = document.getElementById('loadSplash');
        if (splash) splash.classList.add('hidden');
      }, 700);
    }, 300);

    sessionStorage.setItem(pageKey, '1');
  }

  // ── MAIN SEQUENCE ──
  function startSequence() {
    // Safety: always dismiss after 5 seconds no matter what
    var safetyTimer = setTimeout(dismiss, 5000);

    // Start progress bar over 3 seconds
    runBar(3000);

    // Wait for logo animation (0.7s) then start typing
    setTimeout(function () {

      // Type "Adverse" at ~85ms per char
      typeWord('advPart1', 'Adverse', 85, function () {

        // Pause 550ms — cursor blinks on its own here
        setTimeout(function () {

          // Type " Technologies" at ~58ms per char in green
          typeWord('advPart2', '\u00a0Technologies', 58, function () {

            // Done typing — freeze cursor
            var cursor = document.getElementById('advCursor');
            if (cursor) cursor.classList.add('adv-solid');

            // Show tagline
            var tag = document.getElementById('advTag');
            if (tag) tag.classList.add('adv-show');

            // Hold 600ms then dismiss
            setTimeout(function () {
              clearTimeout(safetyTimer);
              var cursor2 = document.getElementById('advCursor');
              if (cursor2) cursor2.classList.add('adv-gone');
              dismiss();
            }, 600);

          });
        }, 550);
      });
    }, 700);
  }

})();
