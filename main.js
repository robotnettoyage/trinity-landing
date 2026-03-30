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
     5. TIMELINE — line draw + dot pop on scroll
     ========================================================================== */
  const timeline = document.querySelector('.timeline');

  if (timeline) {
    // Observe the timeline container → draw the gradient line
    const lineObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('line-visible');
            lineObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    lineObserver.observe(timeline);

    // Observe each step → pop its dot when visible
    const dotObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const dot = entry.target.querySelector('.timeline__dot');
            if (dot) {
              // Small delay so line has time to reach the dot's position
              const stepIndex = Array.from(timeline.querySelectorAll('.timeline__step')).indexOf(entry.target);
              setTimeout(function () {
                dot.classList.add('is-popped');
              }, 200 + stepIndex * 250);
            }
            dotObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    timeline.querySelectorAll('.timeline__step').forEach(function (step) {
      dotObserver.observe(step);
    });
  }

  /* ==========================================================================
     6. BLOB PARALLAX — blobs move at 0.35× scroll speed (desktop only)
     ========================================================================== */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var ticking = false;

    function updateBlobs() {
      var scrollY = window.scrollY;
      document.querySelectorAll('.blob').forEach(function (blob, i) {
        // Alternate direction for visual variety
        var factor = i % 2 === 0 ? -0.30 : 0.22;
        blob.style.setProperty('--parallax-y', (scrollY * factor) + 'px');
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateBlobs);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ==========================================================================
     7. SMOOTH SCROLL — polite fallback for browsers without CSS scroll-behavior
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
     8. ACCORDION — Problem section
     ========================================================================== */
  var accItems = document.querySelectorAll('.acc-item');

  accItems.forEach(function (item) {
    var trigger = item.querySelector('.acc-item__trigger');
    if (!trigger) return;

    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      // Close all items
      accItems.forEach(function (i) {
        i.classList.remove('is-open');
        i.querySelector('.acc-item__trigger').setAttribute('aria-expanded', 'false');
      });

      // Open clicked item if it was closed
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ==========================================================================
     9. TABS — Solution section
     ========================================================================== */
  var tabBtns     = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.dataset.tab;

      // Update tab buttons
      tabBtns.forEach(function (b) {
        b.classList.remove('tab-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('tab-btn--active');
      btn.setAttribute('aria-selected', 'true');

      // Fade out all panels
      tabContents.forEach(function (c) { c.classList.remove('is-active'); });

      // Fade in target panel
      var newPanel = document.getElementById('tab-panel-' + target);
      if (newPanel) {
        newPanel.removeAttribute('hidden');
        void newPanel.offsetHeight; // force reflow so opacity transition fires
        newPanel.classList.add('is-active');
        // Re-hide the others after they fade out
        tabContents.forEach(function (c) {
          if (c !== newPanel) { c.setAttribute('hidden', ''); }
        });
      }
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
