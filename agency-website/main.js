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
    // 11. Cal.com booking (Schedule a Call)
    //
    //     Cal.com's element-click embed opens the booking flow in an
    //     overlay on their free plan — unlike the previous Zoho Calendar
    //     link, which sent X-Frame-Options: SAMEORIGIN and could not be
    //     embedded at all.
    //
    //     Graceful degradation is structural rather than bolted on: the
    //     trigger is a real anchor pointing at the public booking page,
    //     and Cal's script intercepts the click only once it has loaded.
    //     If the script is blocked, offline, or slow, the click is never
    //     intercepted and the browser just follows the href to the same
    //     booking page in a new tab. Nothing to time out, nothing to
    //     break, no blank modal.
    // ==========================================
    (function () {
      // ┌──────────────────────────────────────────────────────────┐
      // │ CONFIGURE ME — your Cal.com link, as "username/event".   │
      // │ Find it on your Cal.com event type: the public URL is    │
      // │ https://cal.com/<username>/<event-slug>, so a page at    │
      // │ https://cal.com/abaryx/30min  =>  'abaryx/30min'.        │
      // │ This is the only place the booking link is defined.      │
      // └──────────────────────────────────────────────────────────┘
      const CAL_LINK = 'abdulbasit1/meeting';

      const NAMESPACE = 'abaryx-booking';
      const triggers = document.querySelectorAll('[data-cal-booking]');
      if (!triggers.length) return;

      const configured = !CAL_LINK.startsWith('YOUR-CAL-USERNAME');
      const bookingUrl = 'https://cal.com/' + CAL_LINK;

      // Always point the anchor at the real page first, so the fallback
      // path is correct even if Cal never loads.
      triggers.forEach((el) => { el.href = bookingUrl; });

      if (!configured) {
        console.warn(
          '[Abaryx] Cal.com booking link is not configured yet. ' +
          'Set CAL_LINK in main.js (section 11) to "username/event".'
        );
        return; // leave the plain link behaviour rather than a broken modal
      }

      if (typeof window.Cal !== 'function') return; // loader missing -> href fallback

      // Brand the overlay so it reads as part of the site rather than a
      // third-party popup. Cal resolves these against its own tokens.
      window.Cal('init', NAMESPACE, { origin: 'https://app.cal.com' });
      window.Cal.ns[NAMESPACE]('ui', {
        theme: 'dark',
        hideEventTypeDetails: false,
        layout: 'month_view',
        cssVarsPerTheme: {
          dark: {
            'cal-brand': '#4ADE80',
            'cal-bg': '#132820',
            'cal-bg-emphasis': '#17332A'
          }
        }
      });

      // Cal binds these attributes via delegation, so setting them here
      // (after init) is fine and keeps the markup free of the link.
      triggers.forEach((el) => {
        el.setAttribute('data-cal-link', CAL_LINK);
        el.setAttribute('data-cal-namespace', NAMESPACE);
        el.setAttribute('data-cal-config', JSON.stringify({
          layout: 'month_view',
          useSlotsViewOnSmallScreen: 'true'
        }));
      });
    })();

    // ==========================================
    // 12. Capabilities — infinite marquee
    //
    //     ONE position source, by design. The track holds two identical
    //     copies of the card set and a single CSS animation translates it
    //     0% -> -50% (exactly one copy) on an infinite loop. Nothing else
    //     ever writes a transform to it.
    //
    //     Manual input (drag / wheel / keyboard) SEEKS that same animation
    //     via the Web Animations API rather than applying its own
    //     transform. That is the whole trick: an earlier version put the
    //     drag offset on a separate wrapper element, and because each
    //     layer wrapped independently at one period they could sum to two
    //     periods — the entire duplicated track — leaving the viewport
    //     blank. With one periodic source, currentTime is normalised into
    //     [0, duration) and the rendered position is therefore ALWAYS
    //     inside a single period. Running off the end is not expressible.
    //
    //     Keyframes are percentage->percentage with no calc() and no
    //     custom property, because WebKit does not interpolate
    //     length<->percentage transforms reliably (that is what made
    //     Safari stop at the end of the track).
    // ==========================================
    (function () {
      const viewport = document.getElementById('capability-viewport');
      const track = document.getElementById('capability-track');
      if (!viewport || !track) return;

      const realCards = Array.from(track.querySelectorAll('.capability-card'));
      const count = realCards.length;
      if (!count) return;

      // Second copy — what makes the -50% wrap invisible.
      realCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.removeAttribute('style');
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
        track.appendChild(clone);
      });
      const allCards = Array.from(track.querySelectorAll('.capability-card'));

      const SPEED_PX_PER_SEC = 55;
      let cardWidth = 0;
      let gap = 0;

      function getVisibleCount() {
        const w = window.innerWidth;
        if (w <= 560) return 1;
        if (w <= 1023) return 2;
        return 4;
      }

      function getAnim() {
        // getAnimations is supported in every target browser (Chrome 84+,
        // Safari 13.1+, Firefox 75+). If it is somehow unavailable the
        // marquee still autoplays from CSS — only seeking is lost.
        if (typeof track.getAnimations !== 'function') return null;
        return track.getAnimations().find((a) => a.animationName === 'capabilityMarquee')
            || track.getAnimations()[0] || null;
      }

      function layout() {
        const firstCard = allCards[0];
        const cardMargin = firstCard ? parseFloat(getComputedStyle(firstCard).marginRight) : NaN;
        gap = Number.isFinite(cardMargin) ? cardMargin : 20;
        const visible = getVisibleCount();
        const viewportWidth = viewport.getBoundingClientRect().width;
        // Never write flex-basis:0 while the element has no width (hidden
        // tab / collapsed pane) — it would permanently collapse the cards.
        if (!(viewportWidth > 0)) return;
        cardWidth = (viewportWidth - gap * (visible - 1)) / visible;
        allCards.forEach((c) => { c.style.flex = `0 0 ${cardWidth}px`; });

        // Read synchronously so the pending reflow from the writes above
        // is flushed; rAF would not fire at all in a background tab and
        // would leave animation-duration unset.
        const period = track.scrollWidth / 2;
        if (period > 0) {
          track.style.animationDuration = `${period / SPEED_PX_PER_SEC}s`;
        }
      }

      // --- One helper for every manual movement -------------------------
      // Converts a pixel delta into a time delta on the same animation and
      // normalises into [0, duration). Because the animation is periodic
      // and infinite, any value in that range is both valid and visually
      // continuous, so this can never expose the start or end of the track.
      function nudgeByPixels(px) {
        const anim = getAnim();
        if (!anim) return;
        const duration = anim.effect.getTiming().duration;
        const period = track.scrollWidth / 2;
        if (!duration || !period) return;
        const deltaTime = (px / period) * duration;
        const t = Number(anim.currentTime) || 0;
        anim.currentTime = (((t + deltaTime) % duration) + duration) % duration;
      }

      let isOffscreen = false;
      let isInteracting = false;
      function syncPlayState() {
        const anim = getAnim();
        if (!anim) return;
        if (isOffscreen || isInteracting) anim.pause();
        else anim.play();
      }

      let resumeTimer = null;
      function holdPlayback() {
        isInteracting = true;
        clearTimeout(resumeTimer);
        syncPlayState();
      }
      function releasePlayback(delay) {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => { isInteracting = false; syncPlayState(); }, delay);
      }

      // --- Pointer drag (mouse, touch and pen in one path) ---
      let dragging = false;
      let lastX = 0;
      let activePointerId = null;

      viewport.addEventListener('pointerdown', (e) => {
        dragging = true;
        activePointerId = e.pointerId;
        lastX = e.clientX;
        holdPlayback();
        viewport.classList.add('is-dragging');
        try { viewport.setPointerCapture(activePointerId); } catch (err) { /* not capturable */ }
      });

      viewport.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        // Incremental (not absolute from a start point) so the seek stays
        // correct no matter how far or how often the pointer moves.
        nudgeByPixels(lastX - e.clientX);
        lastX = e.clientX;
      });

      function endDrag() {
        if (!dragging) return;
        dragging = false;
        viewport.classList.remove('is-dragging');
        if (activePointerId != null) {
          try { viewport.releasePointerCapture(activePointerId); } catch (err) { /* already released */ }
        }
        viewport.blur(); // a tap should not leave the keyboard focus ring
        releasePlayback(1200);
      }
      viewport.addEventListener('pointerup', endDrag);
      viewport.addEventListener('pointercancel', endDrag);
      viewport.addEventListener('pointerleave', () => { if (dragging) endDrag(); });
      viewport.addEventListener('dragstart', (e) => e.preventDefault());

      // --- Wheel: horizontal gestures only ---
      // A vertical wheel is left completely alone so scrolling the page
      // with the cursor over the carousel neither hijacks the scroll nor
      // interrupts playback.
      viewport.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        if (Math.abs(e.deltaX) < 1) return;
        e.preventDefault();
        nudgeByPixels(e.deltaX);
      }, { passive: false });

      // --- Keyboard ---
      viewport.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        nudgeByPixels((e.key === 'ArrowRight' ? 1 : -1) * (cardWidth + gap));
        holdPlayback();
        releasePlayback(1200);
      });

      // Don't burn frames while the section is scrolled out of view.
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isOffscreen = !entry.isIntersecting;
          syncPlayState();
        });
      }, { threshold: 0.2 });
      sectionObserver.observe(viewport);

      layout();
      let resizeTimer = null;
      function scheduleLayout() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layout, 150);
      }
      window.addEventListener('resize', scheduleLayout);
      // The carousel's own box can change size without a window resize
      // (fonts settling, a collapsed pane opening, container queries).
      if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(scheduleLayout).observe(viewport);
      }
    })();

    // ==========================================
    // 13. About dashboard cards — hover / tap micro-interactions
    //
    //     Every transform here goes through GSAP, never a CSS :hover
    //     rule. These three cards are fanned by GSAP-managed rotation
    //     (-7deg / 0 / 8deg) plus xPercent:-50 on the centre one — a CSS
    //     `transform` would replace that entire matrix and collapse the
    //     fan. GSAP tracks scale/y/rotation/xPercent as separate
    //     components and recomposes them, so a hover can add scale+lift
    //     without ever disturbing the fan geometry.
    // ==========================================
    (function () {
      const cards = Array.from(document.querySelectorAll('.about-visual-card'));
      if (!cards.length) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const smallScreen = () => window.matchMedia('(max-width: 640px)').matches;

      // Snapshot each card's animatable content up front so the counters
      // can be replayed from zero and always land back on the exact
      // original strings (no drift from repeated float formatting).
      const entries = cards.map((card) => {
        const values = Array.from(card.querySelectorAll('.float-card-value'))
          .map((el) => {
            const raw = el.textContent.trim();
            const m = raw.match(/^([\d.]+)(.*)$/);
            if (!m) return null;
            return {
              el,
              raw,
              num: parseFloat(m[1]),
              decimals: (m[1].split('.')[1] || '').length,
              suffix: m[2]
            };
          })
          .filter(Boolean);
        const ring = card.querySelector('.about-visual-ring');
        return {
          card,
          values,
          bars: Array.from(card.querySelectorAll('.float-card-bars span')),
          ring,
          ringSpan: ring ? ring.querySelector('span') : null,
          ringPct: ring ? (parseFloat(getComputedStyle(ring).getPropertyValue('--pct')) || 82) : 0,
          baseZ: getComputedStyle(card).zIndex
        };
      });

      function playContent(entry) {
        if (!gsapReady || reduceMotion) return;

        entry.values.forEach((v) => {
          const proxy = { n: 0 };
          gsap.to(proxy, {
            n: v.num, duration: 1.05, ease: 'power2.out', overwrite: true,
            onUpdate: () => { v.el.textContent = proxy.n.toFixed(v.decimals) + v.suffix; },
            onComplete: () => { v.el.textContent = v.raw; }
          });
        });

        if (entry.bars.length) {
          gsap.fromTo(entry.bars,
            { scaleY: 0.12 },
            { scaleY: 1, duration: 0.7, stagger: 0.045, ease: 'back.out(1.7)', overwrite: true }
          );
        }

        if (entry.ring) {
          const proxy = { p: 0 };
          gsap.to(proxy, {
            p: entry.ringPct, duration: 1.05, ease: 'power2.out', overwrite: true,
            onUpdate: () => {
              entry.ring.style.setProperty('--pct', proxy.p.toFixed(2));
              if (entry.ringSpan) entry.ringSpan.textContent = Math.round(proxy.p) + '%';
            },
            onComplete: () => {
              entry.ring.style.setProperty('--pct', entry.ringPct);
              if (entry.ringSpan) entry.ringSpan.textContent = Math.round(entry.ringPct) + '%';
            }
          });
        }
      }

      function resetContent(entry) {
        if (!gsapReady) return;
        entry.values.forEach((v) => {
          gsap.killTweensOf(v.el);
          v.el.textContent = v.raw;
        });
        if (entry.bars.length) {
          gsap.killTweensOf(entry.bars);
          gsap.set(entry.bars, { scaleY: 1 });
        }
        if (entry.ring) {
          entry.ring.style.setProperty('--pct', entry.ringPct);
          if (entry.ringSpan) entry.ringSpan.textContent = Math.round(entry.ringPct) + '%';
        }
      }

      let active = null;

      function activate(entry) {
        if (active === entry) return;
        if (active) deactivate(active);
        active = entry;

        entry.card.classList.add('is-active');
        entry.card.style.zIndex = '20';

        if (!gsapReady || reduceMotion) return;

        // overwrite:'auto' so this cleanly supersedes the entrance tween
        // if the user hovers while the fan is still animating in.
        // On phones the expanded state grows the card's height instead
        // (the badges join its normal flow — see styles.css), so scaling
        // on top of that would push the taller card past .about-visual's
        // overflow:hidden edge and clip it. Growth is the emphasis there;
        // scale stays 1 and only a small lift is applied.
        // No lift either on phones: the grown centre card ends up within
        // ~6px of .about-visual's clip edge, so a lift would push it
        // straight through. Growth + glow carry the emphasis there.
        const small = smallScreen();
        gsap.to(entry.card, {
          scale: small ? 1 : 1.04,
          y: small ? 0 : -12,
          duration: 0.55,
          ease: 'back.out(1.5)',
          overwrite: 'auto'
        });

        entries.forEach((other) => {
          if (other === entry) return;
          gsap.to(other.card, {
            scale: 0.965, opacity: 0.55, duration: 0.45, ease: 'power2.out', overwrite: 'auto'
          });
        });

        playContent(entry);
      }

      function deactivate(entry) {
        if (!entry) return;
        entry.card.classList.remove('is-active');
        entry.card.style.zIndex = '';
        if (active === entry) active = null;

        if (gsapReady && !reduceMotion) {
          entries.forEach((e) => {
            gsap.to(e.card, {
              scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', overwrite: 'auto'
            });
          });
        }
        resetContent(entry);
      }

      // Both interaction styles are always bound and disambiguated by the
      // real pointer type rather than a `(hover: hover)` media query —
      // touchscreen laptops report hover:hover, so a media-query branch
      // would leave them with hover-only behaviour that a finger can
      // never trigger cleanly. pointerType is what actually happened.
      let lastPointerType = 'mouse';
      document.addEventListener('pointerdown', (e) => { lastPointerType = e.pointerType || 'mouse'; }, true);

      entries.forEach((entry) => {
        entry.card.addEventListener('mouseenter', () => {
          if (lastPointerType === 'touch') return; // tap path owns this
          activate(entry);
        });
        entry.card.addEventListener('mouseleave', () => {
          if (lastPointerType === 'touch') return;
          deactivate(entry);
        });

        // Cursor-following highlight (see .about-visual-card::after).
        entry.card.addEventListener('pointermove', (e) => {
          if (reduceMotion || e.pointerType === 'touch') return;
          const r = entry.card.getBoundingClientRect();
          entry.card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
          entry.card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
        });

        // Tap to open, tap again (or tap another card) to close. Bound to
        // `click`, not touchstart, so a scroll gesture that happens to
        // begin on a card never fires it.
        entry.card.addEventListener('click', () => {
          if (lastPointerType !== 'touch') return;
          if (active === entry) deactivate(entry);
          else activate(entry);
        });
      });

      // Tapping outside also closes, so a card can't get stuck open.
      document.addEventListener('click', (e) => {
        if (lastPointerType !== 'touch') return;
        if (active && !e.target.closest('.about-visual-card')) deactivate(active);
      });
    })();

    console.log('[Abaryx] App initialized.');
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
