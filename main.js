/**
 * TRINITY — main.js
 * Nav scroll behaviour · Mobile menu · Scroll animations · Counter animation
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. NAV — add .scrolled class + smooth shadow on scroll
     ========================================================================== */
  const nav = document.getElementById('nav');

  function onNavScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll(); // run on load in case page is already scrolled

  /* ==========================================================================
     2. MOBILE MENU — toggle hamburger + drawer
     ========================================================================== */
  const hamburger  = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });

    // Close menu when a nav link is clicked
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* ==========================================================================
     3. SCROLL-REVEAL — IntersectionObserver on .animate-child elements
     ========================================================================== */
  const animateObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animateObserver.unobserve(entry.target); // only trigger once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animate-child').forEach(function (el) {
    animateObserver.observe(el);
  });

  /* ==========================================================================
     4. COUNTER ANIMATION — stat numbers count up on entry
     ========================================================================== */

  /**
   * Ease-out quad: fast start, slow finish — more natural for counters
   * @param {number} t  progress 0–1
   * @returns {number}  eased value 0–1
   */
  function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  /**
   * Animate a single counter element from 0 to its data-target value.
   * @param {HTMLElement} el  the element with data-target attribute
   */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800; // ms
    const startTs  = performance.now();

    function step(now) {
      const elapsed  = now - startTs;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutQuad(progress) * target);

      el.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix; // ensure exact final value
        el.classList.add('count-done');   // CSS pop animation
      }
    }

    requestAnimationFrame(step);
  }

  // Observe stat numbers — trigger counter when they enter viewport
  const counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.target.dataset.target) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  document.querySelectorAll('.stat__number[data-target]').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ==========================================================================
     5. SMOOTH SCROLL — polite fallback for browsers without CSS scroll-behavior
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;

      // If CSS scroll-behavior is supported, let it handle it
      if ('scrollBehavior' in document.documentElement.style) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ==========================================================================
     6. HERO TITLE — slight parallax on mouse move (desktop only)
     Subtle, elegant — not a gimmick. Disabled on touch devices.
     ========================================================================== */
  const heroTitle = document.querySelector('.hero__title');

  if (heroTitle && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      const x = (e.clientX / window.innerWidth  - 0.5) * 8;  // ±4px
      const y = (e.clientY / window.innerHeight - 0.5) * 6;  // ±3px
      heroTitle.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    }, { passive: true });
  }

})();
