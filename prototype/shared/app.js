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
  function closeMobileMenu() {
    var ham = document.getElementById('navHamburger');
    var right = document.getElementById('navRight');
    if (ham) { ham.classList.remove('is-open'); ham.setAttribute('aria-expanded', 'false'); }
    if (right) right.classList.remove('is-open');
  }
  function initMobileMenu() {
    var ham = document.getElementById('navHamburger');
    var right = document.getElementById('navRight');
    if (!ham || !right) return;
    ham.addEventListener('click', function () {
      var open = ham.classList.toggle('is-open');
      right.classList.toggle('is-open', open);
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  /* ---------- Page load ---------- */
  function initPageLoad() {
    window.requestAnimationFrame(function () {
      document.body.classList.add('is-loaded');
    });
  }

  /* ---------- Menu accordion ---------- */
  function initMenu() {
    var headers = document.querySelectorAll('.cat-header');
    headers.forEach(function (header) {
      header.addEventListener('click', function () {
        var cat = header.closest('.cat');
        var body = cat.querySelector('.cat-body');
        var open = cat.classList.toggle('is-open');
        header.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          body.style.maxHeight = body.scrollHeight + 'px';
        } else {
          body.style.maxHeight = null;
        }
      });
    });
    // Recalculate open panel height on resize / language change
    window.addEventListener('resize', function () {
      document.querySelectorAll('.cat.is-open .cat-body').forEach(function (body) {
        body.style.maxHeight = body.scrollHeight + 'px';
      });
    });
  }

  /* ---------- Gallery plate reveal (clip-path circle expand) ---------- */
  function initGallery() {
    var layer = document.getElementById('revealLayer');
    if (!layer) return;
    var plateEl = document.getElementById('revealPlate');
    var textEl  = document.getElementById('revealText');
    var isOpen = false, ocx = 0, ocy = 0;

    function curLang() { return document.documentElement.getAttribute('lang') || 'de'; }

    function openReveal(pw) {
      if (isOpen) return; isOpen = true;
      var plate = pw.querySelector('.g-plate');
      var r = plate.getBoundingClientRect();
      ocx = r.left + r.width / 2;
      ocy = r.top + r.height / 2;

      var vw = window.innerWidth, vh = window.innerHeight;
      var big, lang = curLang();

      if (vw <= 767) {
        big = Math.min(vw * 0.6, vh * 0.4, 280);
        plateEl.style.left = ((vw - big) / 2) + 'px';
        plateEl.style.top  = (vh * 0.12) + 'px';
        textEl.style.left  = '24px';
        textEl.style.top   = (vh * 0.12 + big + 28) + 'px';
        textEl.style.width = (vw - 48) + 'px';
      } else {
        big = Math.min(vw * 0.36, vh * 0.58, 360);
        plateEl.style.left = (vw * 0.08) + 'px';
        plateEl.style.top  = ((vh - big) / 2) + 'px';
        textEl.style.left  = (vw * 0.08 + big + 60) + 'px';
        textEl.style.top   = ((vh - big) / 2 + 30) + 'px';
        textEl.style.width = (vw - (vw * 0.08) - big - 120) + 'px';
      }
      plateEl.style.width = big + 'px';
      plateEl.style.height = big + 'px';
      plateEl.style.background = plate.style.background;

      document.getElementById('rvCat').textContent   = pw.getAttribute('data-cat-' + lang) || '';
      document.getElementById('rvName').textContent  = pw.getAttribute('data-name') || '';
      document.getElementById('rvDesc').textContent  = pw.getAttribute('data-desc-' + lang) || '';
      document.getElementById('rvPrice').textContent = pw.getAttribute('data-price') || '';

      layer.style.transition = 'none';
      layer.style.clipPath = 'circle(0px at ' + ocx + 'px ' + ocy + 'px)';
      layer.offsetHeight; // reflow
      layer.style.transition = 'clip-path 0.85s cubic-bezier(0.76, 0, 0.24, 1)';
      layer.style.clipPath = 'circle(200vmax at ' + ocx + 'px ' + ocy + 'px)';
      layer.classList.add('is-open');
      layer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeReveal() {
      if (!isOpen) return;
      layer.style.transition = 'clip-path 0.72s cubic-bezier(0.76, 0, 0.24, 1)';
      layer.style.clipPath = 'circle(0px at ' + ocx + 'px ' + ocy + 'px)';
      layer.classList.remove('is-open');
      layer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(function () { isOpen = false; }, 750);
    }

    document.querySelectorAll('.g-plates .pw').forEach(function (pw) {
      pw.addEventListener('click', function () { openReveal(pw); });
    });
    var closeBtn = document.getElementById('rvClose');
    if (closeBtn) closeBtn.addEventListener('click', closeReveal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeReveal(); });
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
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return; // skip off-screen
        var center = r.top + r.height / 2;
        var delta = center - vh / 2;                    // distance from viewport center
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.05;
        el.style.transform = 'translate3d(0,' + (-delta * speed).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Scroll reveal (sections below the hero) ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
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
    initGallery();
    initParallax();
    initChapterRail();
    initScrollReveal();
    initPageLoad();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
