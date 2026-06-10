---
---
(function () {
  'use strict';

  /* ---- Intro loader (once per browser session) ---- */
  var loader = document.getElementById('loader');
  if (loader) {
    var seen = false;
    try { seen = sessionStorage.getItem('vj_loaded') === '1'; } catch (e) {}
    if (seen) {
      loader.parentNode.removeChild(loader);
    } else {
      window.addEventListener('load', function () {
        setTimeout(function () {
          loader.classList.add('done');
          try { sessionStorage.setItem('vj_loaded', '1'); } catch (e) {}
          setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 800);
        }, 2000);
      });
    }
  }

  /* ---- Auto-tag section content for reveal (skip hero/banner) ---- */
  document.querySelectorAll('section:not(.hero):not(.banner):not(.cs-hero) > .wrap')
    .forEach(function (w) { if (!w.classList.contains('reveal')) w.classList.add('reveal'); });

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    /* Reveal anything already on-screen at load so no section shows as an empty
       coloured block in the first viewport before the user scrolls. */
    requestAnimationFrame(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      reveals.forEach(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.95) {
          el.classList.add('in'); io.unobserve(el);
        }
      });
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Animated stat counters ---- */
  function animateCount(el) {
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      var shown = target % 1 === 0 ? Math.round(val) : val.toFixed(1);
      el.textContent = prefix + shown + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Sticky header shrink ---- */
  var header = document.querySelector('.site-header.solid');
  if (header) {
    var shrunk = false, ticking = false;
    var apply = function () {
      var y = window.scrollY;
      // Hysteresis: only flip past separated thresholds so a position
      // hovering near the trigger can't toggle the class back and forth.
      if (!shrunk && y > 90) { shrunk = true; header.classList.add('shrink'); }
      else if (shrunk && y < 30) { shrunk = false; header.classList.remove('shrink'); }
      ticking = false;
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Cookie consent ---- */
  var cookie = document.getElementById('cookie');

  // Loads analytics ONLY after the visitor has accepted. Until then no
  // analytics/tracking cookies are set, which is what UK GDPR / PECR require.
  function vjLoadAnalytics() {
    if (window.vjAnalyticsLoaded) return;
    window.vjAnalyticsLoaded = true;
    /* Google Analytics 4 — loads only after the visitor accepts cookies. */
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id={{ site.company.analytics }}';
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '{{ site.company.analytics }}', { anonymize_ip: true });
  }

  function vjConsent(choice) {
    try { localStorage.setItem('vj_consent', choice); } catch (e) {}
    if (cookie) cookie.classList.remove('show');
    if (choice === 'accepted') vjLoadAnalytics();
  }

  // Let a "Cookie preferences" link anywhere re-open the banner.
  window.vjCookiePrefs = function () { if (cookie) cookie.classList.add('show'); };

  if (cookie) {
    var choice = null;
    try { choice = localStorage.getItem('vj_consent'); } catch (e) {}
    // Migrate anyone who clicked the old single-button banner.
    if (!choice) {
      try {
        if (localStorage.getItem('vj_cookie') === '1') {
          choice = 'accepted';
          localStorage.setItem('vj_consent', 'accepted');
        }
      } catch (e) {}
    }
    if (choice === 'accepted') vjLoadAnalytics();
    if (!choice) setTimeout(function () { cookie.classList.add('show'); }, 900);

    var acc = cookie.querySelector('.cookie-accept');
    var rej = cookie.querySelector('.cookie-reject');
    if (acc) acc.addEventListener('click', function () { vjConsent('accepted'); });
    if (rej) rej.addEventListener('click', function () { vjConsent('rejected'); });
  }
})();
