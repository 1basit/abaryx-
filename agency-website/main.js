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
    // 12. Capabilities — mobile auto-sliding carousel
    //     (grid stays a static CSS grid on tablet/desktop;
    //     this only drives the horizontal scroller that CSS
    //     switches on at <=560px)
    //
    //     Forward motion (autoplay + the next arrow) never reverses to
    //     loop: a clone of the card set sits right after the real one, so
    //     advancing past the last real card keeps scrolling rightward onto
    //     the (pixel-identical) clone, then silently snaps back to the
    //     real card once the scroll settles — invisible, always forward.
    // ==========================================
    (function () {
      const grid = document.getElementById('capability-grid');
      const prevBtn = document.getElementById('capability-prev');
      const nextBtn = document.getElementById('capability-next');
      const dotsWrap = document.getElementById('capability-dots');
      if (!grid || !prevBtn || !nextBtn || !dotsWrap) return;

      const realCards = Array.from(grid.querySelectorAll('.capability-card'));
      const count = realCards.length;
      if (!count) return;

      realCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.removeAttribute('data-reveal');
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
        grid.appendChild(clone);
      });
      const allCards = Array.from(grid.querySelectorAll('.capability-card'));

      const mobileQuery = window.matchMedia('(max-width: 560px)');
      let currentIndex = 0; // 0..count-1 — the "real" card, for dots
      let autoplayTimer = null;
      let resumeTimer = null;
      let wrapTimer = null;
      let driftTimer = null;

      dotsWrap.innerHTML = '';
      const dots = realCards.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'capability-dot';
        dot.setAttribute('aria-label', 'Go to capability ' + (i + 1));
        dot.addEventListener('click', () => {
          currentIndex = i;
          scrollToCard(allCards[i], true);
          updateDots(i);
          restartAutoplay();
        });
        dotsWrap.appendChild(dot);
        return dot;
      });

      function updateDots(index) {
        dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
      }

      // Card-to-card transitions glide via GSAP (matches the easing used
      // everywhere else on the site) instead of the browser's native
      // scrollTo smooth-scroll, which is abrupt and inconsistent across
      // browsers. The wrap/drift corrections stay a true instant jump —
      // those are meant to be imperceptible, not part of the glide.
      //
      // isProgrammatic guards the free-swipe scroll-sync below from ever
      // reacting to scroll events OUR OWN tween/instant-jump generates —
      // without it, the sync logic would mistake the wrap's in-flight
      // glide for a manual swipe onto the clone and schedule its own
      // "drift" correction, which then raced the wrap's own correction and
      // yanked the position mid-glide (the stutter/"delay" this fixes).
      const SCROLL_DURATION = 0.5;
      let isProgrammatic = false;
      function scrollToCard(card, smooth) {
        const gridRect = grid.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const delta = (cardRect.left + cardRect.width / 2) - (gridRect.left + gridRect.width / 2);
        const target = grid.scrollLeft + delta;
        isProgrammatic = true;
        if (!smooth) {
          gsapReady && gsap.killTweensOf(grid);
          grid.scrollLeft = target;
          requestAnimationFrame(() => { isProgrammatic = false; });
        } else if (gsapReady) {
          gsap.killTweensOf(grid);
          gsap.to(grid, {
            scrollLeft: target,
            duration: SCROLL_DURATION,
            ease: 'power2.inOut',
            onComplete: () => { isProgrammatic = false; }
          });
        } else {
          grid.scrollTo({ left: target, behavior: 'smooth' });
          setTimeout(() => { isProgrammatic = false; }, SCROLL_DURATION * 1000 + 50);
        }
      }

      // Forward-only: used by autoplay and the next arrow.
      function advance(userInitiated) {
        clearTimeout(wrapTimer);
        const next = currentIndex + 1;
        if (next < count) {
          currentIndex = next;
          scrollToCard(allCards[currentIndex], true);
          updateDots(currentIndex);
        } else {
          // Scroll onto the clone of card 0 — still moving right — then
          // once that settles, snap (no animation) to the real card 0.
          scrollToCard(allCards[count], true);
          updateDots(0);
          wrapTimer = setTimeout(() => {
            currentIndex = 0;
            scrollToCard(allCards[0], false);
          }, SCROLL_DURATION * 1000 + 20);
        }
        if (userInitiated) restartAutoplay();
      }

      // Manual "back" is allowed to actually move backward — only the
      // forward auto-loop must never visibly reverse.
      function retreat() {
        currentIndex = (currentIndex - 1 + count) % count;
        scrollToCard(allCards[currentIndex], true);
        updateDots(currentIndex);
        restartAutoplay();
      }

      prevBtn.addEventListener('click', retreat);
      nextBtn.addEventListener('click', () => advance(true));

      // Keep the dots (and autoplay's sense of "current") in sync when the
      // user free-swipes the row instead of using the arrows. Driven by
      // actual card geometry on scroll (closest card to center) rather than
      // IntersectionObserver, which proved flaky about what it reports as
      // "intersecting" the moment observation starts.
      function closestCardIndex() {
        const gridRect = grid.getBoundingClientRect();
        const centerX = gridRect.left + gridRect.width / 2;
        let closest = 0;
        let closestDist = Infinity;
        allCards.forEach((c, i) => {
          const r = c.getBoundingClientRect();
          const dist = Math.abs((r.left + r.width / 2) - centerX);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        return closest;
      }

      let scrollSyncRAF = null;
      grid.addEventListener('scroll', () => {
        if (isProgrammatic) return; // this is our own tween/snap, not a free-swipe
        if (scrollSyncRAF) return;
        scrollSyncRAF = requestAnimationFrame(() => {
          scrollSyncRAF = null;
          const idx = closestCardIndex();
          if (idx >= count) {
            // Landed on a clone while free-swiping — visually identical to
            // its real counterpart, so correct silently once motion settles.
            currentIndex = idx - count;
            updateDots(currentIndex);
            clearTimeout(driftTimer);
            driftTimer = setTimeout(() => scrollToCard(allCards[currentIndex], false), 250);
          } else {
            currentIndex = idx;
            updateDots(idx);
          }
        });
      }, { passive: true });

      function stopAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
      function startAutoplay() {
        stopAutoplay();
        if (!mobileQuery.matches) return;
        autoplayTimer = setInterval(() => advance(false), 4200);
      }
      function restartAutoplay() {
        clearTimeout(resumeTimer);
        stopAutoplay();
        resumeTimer = setTimeout(startAutoplay, 6000);
      }

      // Pause while the user is actively touching/dragging the row,
      // resume automatically a few seconds after they let go.
      grid.addEventListener('touchstart', stopAutoplay, { passive: true });
      grid.addEventListener('touchend', restartAutoplay, { passive: true });

      // Don't run the interval while the section is scrolled off-screen.
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startAutoplay();
          else stopAutoplay();
        });
      }, { threshold: 0.3 });
      sectionObserver.observe(grid);

      mobileQuery.addEventListener('change', () => {
        if (mobileQuery.matches) startAutoplay();
        else stopAutoplay();
      });

      currentIndex = closestCardIndex() % count;
      updateDots(currentIndex);
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
