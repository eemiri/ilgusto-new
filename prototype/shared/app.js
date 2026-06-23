/* =========================================================
   Il Gusto — Single-Page Prototype
   shared/app.js
   Section 0: Shell (lang toggle, smooth scroll, nav state, page load, mobile menu)
   ========================================================= */
(function () {
  'use strict';

  var LANG_KEY = 'ilgusto-lang';
  var DEFAULT_LANG = 'de';

  /* ---------- Language ---------- */
  function applyLang(lang) {
    if (lang !== 'de' && lang !== 'fr') lang = DEFAULT_LANG;

    // Swap all translatable nodes. innerHTML is safe here — content is authored, no user input.
    var nodes = document.querySelectorAll('[data-' + lang + ']');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var val = el.getAttribute('data-' + lang);
      if (val === null) continue;
      if (el.tagName === 'META') {
        el.setAttribute('content', val);
      } else {
        el.innerHTML = val;
      }
    }

    // Toggle button states
    var btns = document.querySelectorAll('.lang-btn');
    for (var j = 0; j < btns.length; j++) {
      var active = btns[j].getAttribute('data-lang') === lang;
      btns[j].classList.toggle('is-active', active);
      btns[j].setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}

    // Open accordion panels may change height when text length changes
    document.querySelectorAll('.cat.is-open .cat-body').forEach(function (body) {
      body.style.maxHeight = body.scrollHeight + 'px';
    });
  }

  function initLang() {
    var saved = DEFAULT_LANG;
    try { saved = localStorage.getItem(LANG_KEY) || DEFAULT_LANG; } catch (e) {}
    applyLang(saved);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.getAttribute('data-lang'));
      });
    });
  }

  /* ---------- Nav scroll state ---------- */
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var ticking = false;
    function update() {
      nav.classList.toggle('is-scrolled', window.scrollY >= 80);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Active nav link (section in view) ---------- */
  function initScrollSpy() {
    var links = document.querySelectorAll('.nav-links a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').replace('#', '');
      if (id) map[id] = a;
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          links.forEach(function (a) { a.classList.remove('is-active'); });
          map[entry.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) obs.observe(sec);
    });
  }

  /* ---------- Elegant smooth scroll for anchor links ---------- */
  // Solver for cubic-bezier(0.76, 0, 0.24, 1) — the site's motion signature (cf. plate reveal).
  function makeBezier(p1x, p1y, p2x, p2y) {
    function A(a, b) { return 1 - 3 * b + 3 * a; }
    function B(a, b) { return 3 * b - 6 * a; }
    function C(a) { return 3 * a; }
    function calc(t, a, b) { return ((A(a, b) * t + B(a, b)) * t + C(a)) * t; }
    function slope(t, a, b) { return 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a); }
    function solveX(x) {            // Newton-Raphson: find t for a given x
      var t = x;
      for (var i = 0; i < 6; i++) {
        var d = slope(t, p1x, p2x);
        if (d < 1e-6) break;
        t -= (calc(t, p1x, p2x) - x) / d;
      }
      return t;
    }
    return function (x) { return calc(solveX(x), p1y, p2y); };
  }

  function initSmoothScroll() {
    var ease = makeBezier(0.76, 0, 0.24, 1);
    var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var rafId = null;

    function animateScroll(destY, done) {
      if (rafId) cancelAnimationFrame(rafId);
      var startY = window.pageYOffset;
      var dist = destY - startY;
      if (Math.abs(dist) < 2) { if (done) done(); return; }

      // Duration scales with distance, clamped so near hops feel deliberate and long ones stay graceful.
      var duration = Math.min(1400, Math.max(650, Math.abs(dist) * 0.6));
      var startT = null, interrupted = false;

      function bail() { interrupted = true; }                       // let the user take over
      window.addEventListener('wheel', bail, { passive: true });
      window.addEventListener('touchstart', bail, { passive: true });

      function cleanup() {
        window.removeEventListener('wheel', bail);
        window.removeEventListener('touchstart', bail);
        rafId = null;
      }
      function step(ts) {
        if (interrupted) { cleanup(); return; }
        if (startT === null) startT = ts;
        var p = Math.min(1, (ts - startT) / duration);
        window.scrollTo(0, startY + dist * ease(p));
        if (p < 1) { rafId = requestAnimationFrame(step); }
        else { cleanup(); if (done) done(); }
      }
      rafId = requestAnimationFrame(step);
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeMobileMenu();
        var top = target.getBoundingClientRect().top + window.pageYOffset;
        var destY = Math.max(0, top - (target.id === 'hero' ? 0 : navH));
        var land = function () { history.replaceState(null, '', id); };
        if (reduced) { window.scrollTo(0, destY); land(); return; }
        animateScroll(destY, land);
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  function setElementInert(el, inert) {
    if (!el) return;
    el.inert = inert;
    if (inert) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  }

  function safeFocus(el) {
    if (!el || !el.focus) return;
    try { el.focus({ preventScroll: true }); }
    catch (e) { el.focus(); }
  }

  function setBodySiblingsInert(exceptEl, inert, key) {
    [].forEach.call(document.body.children, function (child) {
      if (child === exceptEl || child.tagName === 'SCRIPT') return;
      var inertAttr = 'data-' + key + '-had-inert';
      var hiddenAttr = 'data-' + key + '-aria-hidden';
      if (inert) {
        if (!child.hasAttribute(inertAttr)) {
          child.setAttribute(inertAttr, child.hasAttribute('inert') ? 'true' : 'false');
          child.setAttribute(hiddenAttr, child.hasAttribute('aria-hidden') ? child.getAttribute('aria-hidden') : '');
        }
        child.setAttribute('aria-hidden', 'true');
        setElementInert(child, true);
      } else if (child.hasAttribute(inertAttr)) {
        if (child.getAttribute(inertAttr) !== 'true') setElementInert(child, false);
        var previous = child.getAttribute(hiddenAttr);
        if (previous) child.setAttribute('aria-hidden', previous);
        else child.removeAttribute('aria-hidden');
        child.removeAttribute(inertAttr);
        child.removeAttribute(hiddenAttr);
      }
    });
  }

  function isMobileNavViewport() {
    return window.matchMedia ? window.matchMedia('(max-width: 767px)').matches : window.innerWidth <= 767;
  }

  function syncMobileMenu(open) {
    var ham = document.getElementById('navHamburger');
    var right = document.getElementById('navRight');
    var nav = document.getElementById('nav');
    if (!ham || !right) return;

    if (!isMobileNavViewport()) {
      ham.classList.remove('is-open');
      ham.setAttribute('aria-expanded', 'false');
      right.classList.remove('is-open');
      right.removeAttribute('aria-hidden');
      setElementInert(right, false);
      if (nav) setBodySiblingsInert(nav, false, 'mobile-nav');
      return;
    }

    ham.classList.toggle('is-open', open);
    ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    right.classList.toggle('is-open', open);
    right.setAttribute('aria-hidden', open ? 'false' : 'true');
    setElementInert(right, !open);
    if (nav) setBodySiblingsInert(nav, open, 'mobile-nav');
  }

  function closeMobileMenu() {
    syncMobileMenu(false);
  }
  function initMobileMenu() {
    var ham = document.getElementById('navHamburger');
    var right = document.getElementById('navRight');
    if (!ham || !right) return;
    syncMobileMenu(false);
    ham.addEventListener('click', function () {
      syncMobileMenu(!right.classList.contains('is-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMobileMenu();
        safeFocus(ham);
      }
      if (!isMobileNavViewport() || !right.classList.contains('is-open') || e.key !== 'Tab') return;
      var nav = document.getElementById('nav');
      var focusables = nav ? nav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])') : [];
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.addEventListener('resize', function () {
      syncMobileMenu(right.classList.contains('is-open'));
    });
  }

  /* ---------- Page load ---------- */
  // Hold the reveal cascade until the hero plate image is actually decoded, so the
  // plate settles first and the text drifts in over a finished plate (not a blank one).
  function initPageLoad() {
    // `js` (hidden state) is set inline in <head>, so the hero paints at opacity:0
    // first; add is-loaded on the next frame so the cascade transitions from there.
    function go() {
      window.requestAnimationFrame(function () {
        document.body.classList.add('is-loaded');
      });
    }
    var plate = document.querySelector('.hero-plate');
    var m = plate && plate.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
    if (!m) { go(); return; }
    var img = new Image();
    img.onload = img.onerror = go;
    img.src = m[1];
    if (img.complete) go();
    setTimeout(go, 2500); // ponytail: fallback so text never hangs on a stalled image
  }

  /* ---------- Menu accordion ---------- */
  function initMenu() {
    var headers = document.querySelectorAll('.cat-header');
    function setCatOpen(header, open) {
      var cat = header.closest('.cat');
      var body = cat && cat.querySelector('.cat-body');
      if (!cat || !body) return;
      cat.classList.toggle('is-open', open);
      header.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.style.maxHeight = open ? body.scrollHeight + 'px' : null;
    }

    headers.forEach(function (header, index) {
      var cat = header.closest('.cat');
      var body = cat && cat.querySelector('.cat-body');
      if (body) {
        if (!body.id) body.id = 'menu-panel-' + index;
        header.setAttribute('aria-controls', body.id);
      }
      setCatOpen(header, false);
      header.addEventListener('click', function () {
        var currentCat = header.closest('.cat');
        if (!currentCat) return;
        setCatOpen(header, !currentCat.classList.contains('is-open'));
      });
    });
    // Recalculate open panel height on resize / language change
    window.addEventListener('resize', function () {
      document.querySelectorAll('.cat.is-open .cat-body').forEach(function (body) {
        body.style.maxHeight = body.scrollHeight + 'px';
      });
    });
  }

  /* ---------- Gallery rail (smooth horizontal scroll) ---------- */
  function initGalleryRail() {
    var rails = document.querySelectorAll('.g-plates');
    if (!rails.length) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    function maxScroll(rail) {
      return Math.max(0, rail.scrollWidth - rail.clientWidth);
    }

    function normalizeWheel(e, rail) {
      var scale = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? rail.clientWidth : 1);
      return { x: e.deltaX * scale, y: e.deltaY * scale };
    }

    rails.forEach(function (rail) {
      if (!rail.hasAttribute('tabindex')) rail.setAttribute('tabindex', '0');
      if (!rail.hasAttribute('aria-label')) rail.setAttribute('aria-label', 'Seitlich scrollbare Galerie');

      var targetLeft = rail.scrollLeft;
      var wheelRaf = null;
      var wheelSettler = null;
      var momentumRaf = null;

      function cancelMomentum() {
        if (momentumRaf) cancelAnimationFrame(momentumRaf);
        momentumRaf = null;
      }

      function settleWheelClass() {
        if (wheelSettler) clearTimeout(wheelSettler);
        wheelSettler = setTimeout(function () {
          rail.classList.remove('is-wheel-scrolling');
        }, 140);
      }

      function stepToTarget() {
        targetLeft = clamp(targetLeft, 0, maxScroll(rail));
        var diff = targetLeft - rail.scrollLeft;

        if (Math.abs(diff) < 0.6) {
          rail.scrollLeft = targetLeft;
          wheelRaf = null;
          settleWheelClass();
          return;
        }

        rail.scrollLeft += diff * 0.24;
        wheelRaf = requestAnimationFrame(stepToTarget);
      }

      function smoothBy(delta) {
        if (!delta) return;
        cancelMomentum();
        targetLeft = clamp((wheelRaf ? targetLeft : rail.scrollLeft) + delta, 0, maxScroll(rail));

        if (reduced) {
          rail.scrollLeft = targetLeft;
          return;
        }

        rail.classList.add('is-wheel-scrolling');
        if (!wheelRaf) wheelRaf = requestAnimationFrame(stepToTarget);
      }

      rail.addEventListener('click', function (e) {
        if (!rail.__suppressGalleryClick) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        rail.__suppressGalleryClick = false;
      }, true);

      rail.addEventListener('wheel', function (e) {
        if (maxScroll(rail) <= 1) return;

        var d = normalizeWheel(e, rail);
        // ponytail: only handle horizontal-intent wheel; let vertical scroll pass to page (no trap)
        if (Math.abs(d.x) <= Math.abs(d.y)) return;
        var delta = d.x;
        if (Math.abs(delta) < 1) return;

        var max = maxScroll(rail);
        var atStart = rail.scrollLeft <= 0.5;
        var atEnd = rail.scrollLeft >= max - 0.5;
        if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

        e.preventDefault();
        smoothBy(delta);
      }, { passive: false });

      rail.addEventListener('keydown', function (e) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;

        var amount = Math.max(rail.clientWidth * 0.72, 220);
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          smoothBy(amount);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          smoothBy(-amount);
        } else if (e.key === 'Home') {
          e.preventDefault();
          smoothBy(-maxScroll(rail));
        } else if (e.key === 'End') {
          e.preventDefault();
          smoothBy(maxScroll(rail));
        }
      });

      rail.addEventListener('scroll', function () {
        if (!wheelRaf) targetLeft = rail.scrollLeft;
      }, { passive: true });

      window.addEventListener('resize', function () {
        targetLeft = clamp(targetLeft, 0, maxScroll(rail));
      });

      if (!finePointer) return;

      var dragging = false;
      var didDrag = false;
      var pointerId = null;
      var hasPointerCapture = false;
      var startX = 0;
      var startLeft = 0;
      var lastX = 0;
      var lastT = 0;
      var velocity = 0;

      function startMomentum(initialVelocity) {
        if (reduced || Math.abs(initialVelocity) < 0.03) return;
        cancelMomentum();
        var v = initialVelocity;

        function frame() {
          var max = maxScroll(rail);
          var next = clamp(rail.scrollLeft + v * 16, 0, max);
          if (next === 0 || next === max) v = 0;
          rail.scrollLeft = next;
          targetLeft = next;
          v *= 0.92;

          if (Math.abs(v) > 0.02) momentumRaf = requestAnimationFrame(frame);
          else momentumRaf = null;
        }

        momentumRaf = requestAnimationFrame(frame);
      }

      function endDrag(e) {
        if (!dragging || e.pointerId !== pointerId) return;
        dragging = false;
        pointerId = null;
        rail.classList.remove('is-dragging');

        if (hasPointerCapture) {
          try { rail.releasePointerCapture(e.pointerId); } catch (err) {}
          hasPointerCapture = false;
        }

        if (didDrag) {
          rail.__suppressGalleryClick = true;
          setTimeout(function () { rail.__suppressGalleryClick = false; }, 140);
          startMomentum(velocity);
        }
      }

      rail.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || maxScroll(rail) <= 1) return;

        cancelMomentum();
        dragging = true;
        didDrag = false;
        pointerId = e.pointerId;
        hasPointerCapture = false;
        startX = e.clientX;
        startLeft = rail.scrollLeft;
        lastX = e.clientX;
        lastT = performance.now();
        velocity = 0;
      });

      rail.addEventListener('pointermove', function (e) {
        if (!dragging || e.pointerId !== pointerId) return;

        var dx = e.clientX - startX;
        var now = performance.now();
        var dt = Math.max(1, now - lastT);
        velocity = (lastX - e.clientX) / dt;

        if (Math.abs(dx) > 5 && !didDrag) {
          didDrag = true;
          rail.classList.add('is-dragging');
          try {
            rail.setPointerCapture(pointerId);
            hasPointerCapture = true;
          } catch (err) {}
        }
        if (didDrag) e.preventDefault();

        rail.scrollLeft = startLeft - dx;
        targetLeft = rail.scrollLeft;
        lastX = e.clientX;
        lastT = now;
      });

      rail.addEventListener('pointerup', endDrag);
      rail.addEventListener('pointercancel', endDrag);
    });
  }

  /* ---------- Gallery plate reveal (clip-path circle expand) ---------- */
  function initGallery() {
    var layer = document.getElementById('revealLayer');
    if (!layer) return;
    var plateEl = document.getElementById('revealPlate');
    var textEl  = document.getElementById('revealText');
    var closeBtn = document.getElementById('rvClose');
    var isOpen = false, isClosing = false, ocx = 0, ocy = 0, lastFocus = null, activeTrigger = null;
    var previousBodyOverflow = '';

    function curLang() { return document.documentElement.getAttribute('lang') || 'de'; }

    function setPageInert(inert) {
      setBodySiblingsInert(layer, inert, 'reveal');
    }

    // dataEl carries the data-* attrs; plate is the visible round element (geometry + image).
    function openReveal(dataEl, plate) {
      if (!plate) return;
      if (isOpen || isClosing) return; isOpen = true;
      activeTrigger = dataEl;
      lastFocus = document.activeElement;
      activeTrigger.setAttribute('aria-expanded', 'true');
      var r = plate.getBoundingClientRect();
      ocx = r.left + r.width / 2;
      ocy = r.top + r.height / 2;

      var vw = window.innerWidth, vh = window.innerHeight;
      var big;

      if (vw <= 767) {
        big = Math.min(vw * 0.86, vh * 0.6, 420);
      } else {
        big = Math.min(vw * 0.6, vh * 0.92, 780);
      }
      plateEl.style.left = ((vw - big) / 2) + 'px';
      plateEl.style.top  = ((vh - big) / 2) + 'px';
      plateEl.style.width = big + 'px';
      plateEl.style.height = big + 'px';
      var img = plate.querySelector ? plate.querySelector('img') : null;
      var imageSrc = img && (img.currentSrc || img.src);
      plateEl.style.backgroundColor = 'transparent';
      plateEl.style.backgroundImage = imageSrc ? 'url("' + imageSrc + '")' : getComputedStyle(plate).backgroundImage;
      plateEl.style.backgroundSize = 'cover';
      plateEl.style.backgroundPosition = 'center';

      layer.style.transition = 'none';
      layer.style.clipPath = 'circle(0px at ' + ocx + 'px ' + ocy + 'px)';
      layer.offsetHeight; // reflow
      layer.style.transition = 'clip-path 0.85s cubic-bezier(0.76, 0, 0.24, 1)';
      layer.style.clipPath = 'circle(200vmax at ' + ocx + 'px ' + ocy + 'px)';
      layer.classList.add('is-open');
      layer.setAttribute('aria-hidden', 'false');
      previousBodyOverflow = document.body.style.overflow;
      setPageInert(true);
      document.body.style.overflow = 'hidden';
      safeFocus(closeBtn);
    }

    function closeReveal() {
      if (!isOpen) return;
      isOpen = false;
      isClosing = true;
      layer.style.transition = 'clip-path 0.72s cubic-bezier(0.76, 0, 0.24, 1)';
      layer.style.clipPath = 'circle(0px at ' + ocx + 'px ' + ocy + 'px)';
      layer.classList.remove('is-open');
      layer.setAttribute('aria-hidden', 'true');
      if (activeTrigger) activeTrigger.setAttribute('aria-expanded', 'false');
      setPageInert(false);
      document.body.style.overflow = previousBodyOverflow;
      var focusTarget = lastFocus;
      setTimeout(function () {
        isClosing = false;
        activeTrigger = null;
        safeFocus(focusTarget);
      }, 750);
    }

    document.querySelectorAll('.g-plates .pw').forEach(function (pw) {
      pw.setAttribute('aria-haspopup', 'dialog');
      pw.setAttribute('aria-expanded', 'false');
      pw.addEventListener('click', function () {
        var plate = pw.querySelector('.g-plate');
        if (plate) openReveal(pw, plate);
      });
    });
    // Accent plates (hero / about / menu / reservation) open the same reveal.
    document.querySelectorAll('[data-plate]').forEach(function (el) {
      el.setAttribute('aria-haspopup', 'dialog');
      el.setAttribute('aria-expanded', 'false');
      el.addEventListener('click', function () { openReveal(el, el); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReveal(el, el); }
      });
    });
    if (closeBtn) closeBtn.addEventListener('click', closeReveal);
    // Click anywhere outside the plate closes the reveal.
    layer.addEventListener('click', function (e) {
      if (!plateEl.contains(e.target)) closeReveal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeReveal();
      if (!isOpen || e.key !== 'Tab') return;
      var focusables = layer.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Chapter rail (scroll narrative active state) ---------- */
  function initChapterRail() {
    var rail = document.querySelector('.chapter-rail');
    if (!rail || !('IntersectionObserver' in window)) return;
    var links = {};
    rail.querySelectorAll('a').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && links[entry.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
          links[entry.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    ['about', 'menu', 'gallery', 'reservation'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) obs.observe(s);
    });
  }

  /* ---------- Plate parallax (subtle scroll-driven float) ---------- */
  function initParallax() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var items = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!items.length) return;
    var state = items.map(function (el) {
      return { el: el, cur: 0, speed: parseFloat(el.getAttribute('data-parallax')) || 0.05 };
    });
    // Continuous lerp toward the scroll target — low-pass filter = smooth, no per-scroll jitter.
    var LERP = 0.06;
    var running = false;
    function frame() {
      var vh = window.innerHeight;
      var settled = true;
      state.forEach(function (s) {
        if (s.el.hasAttribute('data-reveal') && !s.el.classList.contains('is-in')) return;
        var r = s.el.getBoundingClientRect();
        var target = -(r.top + r.height / 2 - vh / 2) * s.speed;
        if (Math.abs(target - s.cur) > 0.1) settled = false;
        s.cur += (target - s.cur) * LERP;
        s.el.style.transform = 'translate3d(0,' + s.cur.toFixed(2) + 'px,0)';
      });
      if (settled) { running = false; return; }
      window.requestAnimationFrame(frame);
    }
    function kick() {
      if (running) return;
      running = true;
      window.requestAnimationFrame(frame);
    }
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    window.addEventListener('ilgusto:reveal-in', kick);
    kick();
  }

  /* ---------- Scroll reveal (sections below the hero) ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      window.dispatchEvent(new CustomEvent('ilgusto:reveal-in'));
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          window.dispatchEvent(new CustomEvent('ilgusto:reveal-in'));
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    items.forEach(function (el) {
      if (el.closest('.hero') || el.id === 'nav') return; // handled by page-load
      obs.observe(el);
    });
  }

  /* ---------- Init ---------- */
  function init() {
    initLang();
    initNavScroll();
    initScrollSpy();
    initSmoothScroll();
    initMobileMenu();
    initMenu();
    initGalleryRail();
    initGallery();
    initParallax();
    initChapterRail();
    initScrollReveal();
    document.documentElement.classList.add('js');
    initPageLoad();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
