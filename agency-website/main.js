(function () {
  'use strict';

  function initApp() {

    // ==========================================
    // 1. Scroll Progress Bar
    // ==========================================
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (h > 0) progressBar.style.width = ((window.scrollY / h) * 100) + '%';
      }, { passive: true });
    }

    // ==========================================
    // 2. Mobile Menu
    // ==========================================
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');
    if (navToggle && navMobile) {
      navToggle.addEventListener('click', () => {
        const isOpen = navToggle.classList.toggle('active');
        navMobile.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      navMobile.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navToggle.classList.remove('active');
          navMobile.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }

    // ==========================================
    // 3. Smooth Scroll with Offset
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;
        e.preventDefault();

        if (navToggle && navToggle.classList.contains('active')) {
          navToggle.classList.remove('active');
          if (navMobile) navMobile.classList.remove('active');
          document.body.style.overflow = '';
        }

        const offset = 20;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    // ==========================================
    // 4. GSAP setup (shared by reveal + split-text sections below)
    // ==========================================
    const gsapReady = typeof gsap !== 'undefined';
    const scrollTriggerReady = gsapReady && typeof ScrollTrigger !== 'undefined';
    if (scrollTriggerReady) {
      gsap.registerPlugin(ScrollTrigger);
      // Safety net for any late-loading images that could still shift
      // layout after boot() already waited for fonts.
      window.addEventListener('load', () => ScrollTrigger.refresh());
    }

    // ==========================================
    // 5. Counter Animation
    // ==========================================
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'));
            let current = 0;
            const step = Math.max(1, Math.floor(target / 60));
            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = current;
            }, 30);
            counterObserver.unobserve(el);
          }
        });
      }, { threshold: 0.3 });
      counters.forEach(c => counterObserver.observe(c));
    }

    // ==========================================
    // 6. Scroll Reveal ([data-reveal]) — staggered fade + slide-up,
    //    grouped by shared parent so a whole card grid animates
    //    in together (rather than each card triggering solo).
    // ==========================================
    const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
    if (revealEls.length) {
      if (scrollTriggerReady) {
        const groups = new Map();
        revealEls.forEach(el => {
          const parent = el.parentElement;
          if (!groups.has(parent)) groups.set(parent, []);
          groups.get(parent).push(el);
        });
        groups.forEach(group => {
          gsap.to(group, {
            opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: group[0], start: 'top 88%', once: true }
          });
        });
      } else {
        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
              setTimeout(() => entry.target.classList.add('is-visible'), (i % 4) * 90);
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 });
        revealEls.forEach(el => revealObserver.observe(el));
      }
    }

    // ==========================================
    // 7. Split-Text Reveal (word-by-word)
    //    Wraps each word in overflow-hidden spans and
    //    animates them in — hero headings run on load,
    //    everything else runs on scroll-into-view.
    // ==========================================
    function splitWords(el) {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = '';
      const inners = [];
      words.forEach((word, i) => {
        const outer = document.createElement('span');
        outer.className = 'split-word';
        const inner = document.createElement('span');
        inner.className = 'split-word-inner';
        inner.textContent = word + (i < words.length - 1 ? ' ' : '');
        outer.appendChild(inner);
        el.appendChild(outer);
        inners.push(inner);
      });
      return inners;
    }

    // Preserve <em> emphasis: split each child text node / em separately
    function splitHeading(el) {
      const inners = [];
      const nodes = Array.from(el.childNodes);
      el.innerHTML = '';
      nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const tempWords = node.textContent.trim().split(/\s+/).filter(Boolean);
          tempWords.forEach((word, i) => {
            const outer = document.createElement('span');
            outer.className = 'split-word';
            const inner = document.createElement('span');
            inner.className = 'split-word-inner';
            inner.textContent = word;
            outer.appendChild(inner);
            el.appendChild(outer);
            el.appendChild(document.createTextNode(' '));
            inners.push(inner);
          });
        } else if (node.nodeName === 'EM') {
          const em = document.createElement('em');
          const outer = document.createElement('span');
          outer.className = 'split-word';
          const inner = document.createElement('span');
          inner.className = 'split-word-inner';
          inner.textContent = node.textContent;
          outer.appendChild(inner);
          em.appendChild(outer);
          el.appendChild(em);
          el.appendChild(document.createTextNode(' '));
          inners.push(inner);
        } else {
          el.appendChild(node);
        }
      });
      return inners;
    }

    // Hero heading — animates immediately on load (first one only, it's above the fold)
    const heroHeading = document.querySelector('.hero-wrapper .hero-heading[data-split]');
    if (heroHeading) {
      const inners = splitHeading(heroHeading);
      if (gsapReady) {
        gsap.set(inners, { yPercent: 110, opacity: 0 });
        gsap.to(inners, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: 'power3.out', delay: 0.2 });
      } else {
        inners.forEach(i => { i.style.transform = 'translateY(0)'; i.style.opacity = '1'; });
      }
    }
    const heroSubtext = document.querySelector('.hero-wrapper .hero-subtext[data-split-fade]');
    if (heroSubtext && gsapReady) {
      gsap.from(heroSubtext, { opacity: 0, y: 16, duration: 0.8, delay: 0.7, ease: 'power2.out' });
    }
    const heroActions = document.querySelector('.hero-wrapper .hero-actions');
    if (heroActions && gsapReady) {
      gsap.from(heroActions, { opacity: 0, y: 16, duration: 0.8, delay: 0.9, ease: 'power2.out' });
    }
    const heroFloats = document.querySelectorAll('.hero-wrapper .float-card');
    if (heroFloats.length && gsapReady) {
      gsap.from(heroFloats, { opacity: 0, y: 30, duration: 0.7, delay: 1.1, stagger: 0.12, ease: 'power3.out' });
    }
    const eyebrowHero = document.querySelector('.hero-wrapper .eyebrow');
    if (eyebrowHero && gsapReady) {
      gsap.from(eyebrowHero, { opacity: 0, y: -10, duration: 0.6, ease: 'power2.out' });
    }

    // All other split headings — reveal once on scroll
    document.querySelectorAll('[data-split]').forEach(el => {
      if (el === heroHeading) return;
      const inners = splitHeading(el);
      if (scrollTriggerReady) {
        gsap.set(inners, { yPercent: 110, opacity: 0 });
        gsap.to(inners, {
          yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      } else {
        inners.forEach(i => { i.style.transform = 'translateY(0)'; i.style.opacity = '1'; });
      }
    });

    // ==========================================
    // 8. GSAP Scroll Animations (section fade-ups)
    // ==========================================
    if (scrollTriggerReady) {
      gsap.utils.toArray('.section-head').forEach(el => {
        if (el.closest('.hero-wrapper')) return;
        gsap.from(el, {
          y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
      });

      gsap.from('.about-visual', {
        y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-visual', start: 'top 85%', once: true }
      });

      // About panel fan cards — pop up from beneath the panel, each
      // keeping its own fixed fan rotation throughout the entrance.
      const fanCards = [
        { el: document.querySelector('.about-visual-card--left'), rotation: -7 },
        { el: document.querySelector('.about-visual-card--center'), rotation: 0, xPercent: -50 },
        { el: document.querySelector('.about-visual-card--right'), rotation: 8 }
      ].filter(c => c.el);
      fanCards.forEach((c, i) => {
        gsap.set(c.el, { y: 90, opacity: 0, rotation: c.rotation, xPercent: c.xPercent || 0 });
        gsap.to(c.el, {
          y: 0, opacity: 1, duration: 1, delay: i * 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.about-visual', start: 'top 80%', once: true }
        });
      });

      gsap.utils.toArray('.stat-item').forEach((el, i) => {
        gsap.from(el, {
          y: 20, opacity: 0, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.stats-row', start: 'top 88%', once: true }
        });
      });
    } else {
      // No GSAP available — just reveal the fan cards as-is rather than
      // leaving them permanently hidden behind their CSS opacity:0 default.
      document.querySelectorAll('.about-visual-card').forEach(el => {
        el.style.opacity = '1';
      });
    }

    // ==========================================
    // 9. Our Process — interactive timeline
    // ==========================================
    (function () {
      const nodes = Array.from(document.querySelectorAll('.process-node'));
      const cards = Array.from(document.querySelectorAll('.process-card'));
      const trackFill = document.getElementById('process-track-fill');
      const hint = document.getElementById('process-hint');
      if (!nodes.length) return;

      function setActive(index) {
        nodes.forEach((n, i) => {
          n.classList.toggle('is-active', i === index);
          n.classList.toggle('is-complete', i < index);
        });
        cards.forEach((c, i) => {
          c.classList.toggle('is-current', i === index);
          // Driven via GSAP (not a CSS transform) so it composes cleanly
          // with the y-offset the scroll-reveal animation already owns
          // on this element, instead of one inline style clobbering the other.
          if (gsapReady) {
            gsap.to(c, { scale: i === index ? 1.06 : 1, duration: 0.4, ease: 'power2.out' });
          }
        });
        if (trackFill) {
          trackFill.style.width = (index / (nodes.length - 1)) * 100 + '%';
        }
        if (hint) {
          hint.textContent = `Click the timeline nodes to explore our process · Phase ${index + 1} of ${nodes.length}`;
        }
      }

      nodes.forEach((node, i) => {
        node.addEventListener('click', () => setActive(i));
      });

      setActive(0);
    })();

    // ==========================================
    // 10. Newsletter forms (no backend — inline confirmation)
    // ==========================================
    document.querySelectorAll('.newsletter-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const note = form.parentElement.querySelector('.newsletter-note');
        const input = form.querySelector('.newsletter-input');
        if (note) {
          note.textContent = 'Thanks — you\'re on the list!';
          note.classList.add('success');
        }
        if (input) input.value = '';
      });
    });

    // ==========================================
    // 11. Zoho Bookings modal (Schedule a Call)
    // ==========================================
    (function () {
      const ZOHO_BOOKING_URL = 'https://calendar.zoho.com/zc/view/slot-booking/zz08011220685d96c762be5afa819a7a8dd71ecf08054d11825607a05caa7f40dfd404be58';
      const LOAD_TIMEOUT_MS = 8000;

      const modal = document.getElementById('zoho-modal');
      const triggers = document.querySelectorAll('[data-zoho-booking]');
      if (!modal || !triggers.length) return;

      const iframe = document.getElementById('zoho-modal-iframe');
      const fallbackLink = document.getElementById('zoho-modal-fallback-link');
      if (fallbackLink) fallbackLink.href = ZOHO_BOOKING_URL;

      let loadTimer = null;
      let lastFocused = null;

      function openModal() {
        lastFocused = document.activeElement;
        modal.classList.remove('is-loaded', 'has-error');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Set src fresh on every open so a stalled/blocked previous
        // attempt doesn't linger, and so we don't load Zoho until needed.
        iframe.src = ZOHO_BOOKING_URL;

        requestAnimationFrame(() => modal.classList.add('is-open'));

        clearTimeout(loadTimer);
        loadTimer = setTimeout(() => {
          // Cross-origin iframes blocked by X-Frame-Options/CSP fail
          // silently (no load/error event), so a timeout is the only
          // reliable way to detect "embedding didn't work" and fall
          // back to a plain link out to the real booking page.
          modal.classList.add('has-error');
        }, LOAD_TIMEOUT_MS);

        const closeBtn = modal.querySelector('.zoho-modal-close');
        if (closeBtn) closeBtn.focus();
      }

      function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        clearTimeout(loadTimer);
        setTimeout(() => {
          iframe.src = '';
          modal.classList.remove('is-loaded', 'has-error');
        }, 300);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
      }

      iframe.addEventListener('load', () => {
        if (!iframe.src) return;
        clearTimeout(loadTimer);
        modal.classList.add('is-loaded');
        modal.classList.remove('has-error');
      });

      triggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          openModal();
        });
      });

      modal.querySelectorAll('[data-zoho-close]').forEach(el => {
        el.addEventListener('click', closeModal);
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
      });
    })();

    // ==========================================
    // 12. Capabilities — seamless infinite carousel (all breakpoints)
    //
    //     One continuous "position" (px) drives everything — autoplay,
    //     drag, wheel, and keyboard all just add to the same number,
    //     which is then applied as a single translate3d on the track.
    //     The track holds two consecutive copies of the card set, and
    //     position wraps via modulo against one set's width — so wherever
    //     it lands, the content on screen is pixel-identical whether it's
    //     "real" or "clone," and the wrap is never visible. This avoids
    //     the old scrollLeft+snap approach entirely, which is what caused
    //     the visible delay/jump at the loop point.
    // ==========================================
    (function () {
      const viewport = document.getElementById('capability-viewport');
      const track = document.getElementById('capability-track');
      if (!viewport || !track) return;

      const realCards = Array.from(track.querySelectorAll('.capability-card'));
      const count = realCards.length;
      if (!count) return;

      realCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.removeAttribute('data-reveal');
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
        track.appendChild(clone);
      });
      const allCards = Array.from(track.querySelectorAll('.capability-card'));

      let position = 0;   // px — how far the track has scrolled left
      let cardWidth = 0;
      let gap = 0;
      let setWidth = 0;   // width of one full set of `count` cards (the loop period)

      function getVisibleCount() {
        const w = window.innerWidth;
        if (w <= 560) return 1;
        if (w <= 1023) return 2;
        return 4;
      }

      function render() {
        track.style.transform = `translate3d(${-position}px, 0, 0)`;
      }

      function layout() {
        const trackGap = parseFloat(getComputedStyle(track).columnGap);
        gap = Number.isFinite(trackGap) ? trackGap : 20;
        const visible = getVisibleCount();
        const viewportWidth = viewport.getBoundingClientRect().width;
        cardWidth = (viewportWidth - gap * (visible - 1)) / visible;
        allCards.forEach((c) => { c.style.flex = `0 0 ${cardWidth}px`; });
        setWidth = (cardWidth + gap) * count;
        // Re-measure the loop width from actual rendered positions once
        // layout has settled — this is what guarantees the real-card-to-
        // clone-card seam lines up exactly like every other card gap,
        // regardless of any subpixel/rounding difference between our own
        // arithmetic and what the browser actually painted.
        requestAnimationFrame(() => {
          if (allCards.length > count) {
            const pitch = allCards[count].getBoundingClientRect().left - allCards[0].getBoundingClientRect().left;
            if (Number.isFinite(pitch) && pitch > 0) setWidth = pitch;
          }
          position = setWidth ? ((position % setWidth) + setWidth) % setWidth : 0;
          render();
        });
        position = setWidth ? ((position % setWidth) + setWidth) % setWidth : 0;
        render();
      }

      function wrap() {
        if (setWidth > 0) position = ((position % setWidth) + setWidth) % setWidth;
      }

      // --- Autoplay: slow, continuous, time-based (not frame-count-based
      // so it stays a consistent speed regardless of refresh rate) ---
      const SPEED = 37; // px/second (~32% faster than the original 28)
      let autoplayActive = true;
      let lastTime = null;
      function tick(time) {
        requestAnimationFrame(tick);
        if (!autoplayActive) { lastTime = null; return; }
        if (lastTime == null) { lastTime = time; return; }
        const dt = (time - lastTime) / 1000;
        lastTime = time;
        position += SPEED * dt;
        wrap();
        render();
      }
      requestAnimationFrame(tick);

      let resumeTimer = null;
      function pauseAutoplay() {
        autoplayActive = false;
        clearTimeout(resumeTimer);
      }
      function scheduleResume(delay) {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => { autoplayActive = true; lastTime = null; }, delay);
      }

      // --- Pointer drag — unifies mouse, touch, and pen in one code path ---
      let dragging = false;
      let dragStartX = 0;
      let dragStartPosition = 0;
      let activePointerId = null;

      viewport.addEventListener('pointerdown', (e) => {
        dragging = true;
        activePointerId = e.pointerId;
        dragStartX = e.clientX;
        dragStartPosition = position;
        pauseAutoplay();
        viewport.classList.add('is-dragging');
        viewport.setPointerCapture(activePointerId);
      });

      viewport.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        position = dragStartPosition - (e.clientX - dragStartX);
        wrap();
        render();
      });

      function endDrag() {
        if (!dragging) return;
        dragging = false;
        viewport.classList.remove('is-dragging');
        if (activePointerId != null) {
          try { viewport.releasePointerCapture(activePointerId); } catch (err) { /* already released */ }
        }
        // A drag/tap can leave the (keyboard-only) focus ring showing on
        // some mobile browsers — blur immediately after, since this was
        // never a keyboard interaction to begin with.
        viewport.blur();
        scheduleResume(1800);
      }
      viewport.addEventListener('pointerup', endDrag);
      viewport.addEventListener('pointercancel', endDrag);
      viewport.addEventListener('pointerleave', () => { if (dragging) endDrag(); });
      viewport.addEventListener('dragstart', (e) => e.preventDefault());

      // --- Wheel / trackpad — horizontal delta preferred, vertical wheel
      // as a fallback so a plain mouse scroll wheel still nudges it ---
      viewport.addEventListener('wheel', (e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(delta) < 1) return;
        e.preventDefault();
        position += delta;
        wrap();
        render();
        pauseAutoplay();
        scheduleResume(1800);
      }, { passive: false });

      // --- Keyboard ---
      viewport.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        position += (e.key === 'ArrowRight' ? 1 : -1) * (cardWidth + gap);
        wrap();
        render();
        pauseAutoplay();
        scheduleResume(1800);
      });

      // Pause while the section is scrolled off-screen.
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { autoplayActive = true; lastTime = null; }
          else autoplayActive = false;
        });
      }, { threshold: 0.2 });
      sectionObserver.observe(viewport);

      layout();
      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layout, 150);
      });
    })();

    console.log('[Abraxis] App initialized.');
  }

  // ==========================================
  // Boot
  // ==========================================
  function boot() {
    // Wait for web fonts to finish swapping in before measuring layout —
    // GSAP ScrollTrigger positions computed against fallback-font layout
    // can be wrong once Fraunces/Inter swap in and reflow the page.
    const start = () => setTimeout(initApp, 50);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
