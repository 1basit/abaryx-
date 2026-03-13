// ============================================
// ABRAXIS SOLUTIONS — Consolidated Main JS
// ============================================

(function () {
  'use strict';

  function initApp() {
    // Debug: log all grid sections to confirm DOM content
    const debugGrids = document.querySelectorAll('.services__grid, .solutions__grid, .team__grid, .stack__grid, .about__stats');
    debugGrids.forEach(grid => {
      const children = grid.children;
      console.log(`[Abraxis Debug] Grid "${grid.className}" has ${children.length} children:`, Array.from(children).map(c => c.className || c.tagName));
    });

    // ==========================================
    // Hero Typing Effect
    // ==========================================
    const headline = document.querySelector('.hero-headline');
    if (headline) {
      const fullText = headline.textContent;
      headline.textContent = '';
      headline.style.visibility = 'visible';

      let i = 0;
      const typeInterval = setInterval(() => {
        headline.textContent = fullText.slice(0, i);
        i++;
        if (i > fullText.length) {
          clearInterval(typeInterval);
        }
      }, 60);
    }

    // ==========================================
    // 1. Lenis Smooth Scroll
    // ==========================================
    let lenis = null;
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
      });

      function raf(time) {
        lenis.raf(time);
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // ==========================================
    // 2. AOS (if available)
    // ==========================================
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 800, once: true, offset: 80, easing: 'ease-out-cubic' });
    }

    // ==========================================
    // 3. Lucide Icons (if available)
    // ==========================================
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // ==========================================
    // 4. Custom Cursor
    // ==========================================
    // DELETE the entire cursor initialization block, e.g.:
    // const cursor = document.getElementById('cursor');
    // const cursorDot = document.querySelector('.cursor-dot');
    // const cursorOutline = document.querySelector('.cursor-outline');
    // document.addEventListener('mousemove', (e) => { ... });
    // ... all cursor-related event listeners

    // ==========================================
    // 5. Scroll Progress Bar
    // ==========================================
    const progressBar = document.querySelector('.scroll-progress') || document.getElementById('scroll-progress');
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (height > 0) {
          progressBar.style.width = ((window.scrollY / height) * 100) + '%';
        }
      }, { passive: true });
    }

    // ==========================================
    // 6. Navigation — scroll & mobile menu
    // ==========================================
    const nav = document.querySelector('nav') || document.getElementById('navbar');
    if (nav) {
      const handleNavScroll = () => {
        const scrolled = window.scrollY > 50;
        nav.classList.toggle('nav--scrolled', scrolled);

        // Tailwind nav support (services page)
        if (nav.classList.contains('fixed')) {
          if (scrolled) {
            nav.classList.add('py-4', 'bg-navy/90', 'backdrop-blur-lg', 'shadow-lg', 'shadow-blue-900/10');
            nav.classList.remove('py-6', 'bg-navy/0');
          } else {
            nav.classList.add('py-6', 'bg-navy/0');
            nav.classList.remove('py-4', 'bg-navy/90', 'backdrop-blur-lg', 'shadow-lg', 'shadow-blue-900/10');
          }
        }
      };
      window.addEventListener('scroll', handleNavScroll, { passive: true });
      handleNavScroll();
    }

    // Mobile menu toggle
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
    // 7. GSAP Animations (THE FIX)
    // ==========================================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // --- Hero entrance ---
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      const heroBadge = document.querySelector('.hero-badge');
      const heroTitle = document.querySelector('.hero__title');
      const heroSubtitle = document.querySelector('.hero-subtitle');
      const heroActions = document.querySelector('.hero-buttons');
      const heroStats = document.querySelector('.hero-stats');

      if (heroBadge) heroTl.from(heroBadge, { y: 30, opacity: 0, duration: 0.8, delay: 0.2 });
      if (heroTitle) heroTl.from(heroTitle, { y: 50, opacity: 0, duration: 1 }, '-=0.5');
      if (heroSubtitle) heroTl.from(heroSubtitle, { y: 30, opacity: 0, duration: 0.8 }, '-=0.6');
      if (heroActions) heroTl.from(heroActions, { y: 30, opacity: 0, duration: 0.8 }, '-=0.5');
      if (heroStats) heroTl.from(heroStats, { y: 30, opacity: 0, duration: 0.8 }, '-=0.4');

      // --- Section headers ---
      gsap.utils.toArray('.section__header, .section__label, .section__title').forEach(el => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
      });

      // --- FIX: Staggered card animations with clearProps ---
      // The key fix: after the animation completes, we clear the inline
      // styles GSAP sets so cards don't get stuck at opacity:0
      gsap.utils.toArray('.services__grid, .solutions__grid, .team__grid, .stack__grid, .about__stats').forEach(grid => {
        const cards = Array.from(grid.children);
        if (cards.length === 0) {
          console.warn(`[Abraxis] Grid "${grid.className}" is empty — no cards to animate.`);
          return;
        }

        console.log(`[Abraxis] Animating ${cards.length} cards in "${grid.className}"`);

        // IMPORTANT: Set initial state explicitly so elements are visible
        // even if ScrollTrigger never fires (e.g. already in viewport)
        gsap.set(cards, { opacity: 0, y: 60 });

        ScrollTrigger.create({
          trigger: grid,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              clearProps: 'transform,opacity',  // <-- THIS IS THE KEY FIX
              onComplete: () => {
                // Safety net: force visibility after animation
                cards.forEach(card => {
                  card.style.opacity = '';
                  card.style.transform = '';
                });
                console.log(`[Abraxis] Cards in "${grid.className}" animation complete, inline styles cleared.`);
              }
            });
          },
          onEnterBack: () => {
            // If user scrolls back up, ensure cards are visible
            cards.forEach(card => {
              card.style.opacity = '';
              card.style.transform = '';
            });
          }
        });

        // SAFETY: If the grid is already in the viewport on load, 
        // show cards immediately (ScrollTrigger might not fire)
        const rect = grid.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          console.log(`[Abraxis] Grid "${grid.className}" already in viewport — showing immediately.`);
          setTimeout(() => {
            gsap.to(cards, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power3.out',
              clearProps: 'all'
            });
          }, 300);
        }
      });

      // --- Counter animations ---
      const counters = document.querySelectorAll('[data-count], .stat-counter');
      counters.forEach(counter => {
        const target = counter.getAttribute('data-count') || counter.getAttribute('data-target');
        if (target) {
          ScrollTrigger.create({
            trigger: counter,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.to(counter, {
                innerHTML: +target,
                duration: 2.5,
                snap: { innerHTML: 1 },
                ease: 'power2.out'
              });
            }
          });
        }
      });

      // --- Parallax on orbs ---
      gsap.utils.toArray('.hero__orb, .services__orb, .contact__orb').forEach(orb => {
        gsap.to(orb, {
          y: () => -100,
          ease: 'none',
          scrollTrigger: {
            trigger: orb.closest('section') || orb.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          }
        });
      });

      // --- Magnetic buttons ---
      document.querySelectorAll('.btn, .nav__cta, .btn-glow').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
          const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
          gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        });
      });

      // --- Card tilt effect ---
      document.querySelectorAll('.service-card, .solution-card, .glass-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotationY: x * 8, rotationX: -y * 8,
            duration: 0.4, ease: 'power2.out', transformPerspective: 800
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        });
      });
    } else {
      // NO GSAP FALLBACK: Make sure all cards are visible
      console.warn('[Abraxis] GSAP not loaded — showing all elements without animation.');
      document.querySelectorAll('.services__grid > *, .solutions__grid > *, .team__grid > *, .stack__grid > *, .about__stats > *').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }

    // ==========================================
    // 8. Vanta.js (services page)
    // ==========================================
    const vantaEl = document.getElementById('vanta-bg');
    if (vantaEl && typeof VANTA !== 'undefined') {
      setTimeout(() => {
        VANTA.NET({
          el: '#vanta-bg', mouseControls: true, touchControls: true,
          gyroControls: false, minHeight: 200, minWidth: 200,
          scale: 1, scaleMobile: 1, color: 0x00BFFF,
          backgroundColor: 0x0A0F1C, points: 12, maxDistance: 22,
          spacing: 18, showDots: true
        });
      }, 100);
    }

    // ==========================================
    // 9. Swiper Testimonials
    // ==========================================
    if (document.querySelector('.testimonials-slider') && typeof Swiper !== 'undefined') {
      new Swiper('.testimonials-slider', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: { rotate: 20, stretch: 0, depth: 100, modifier: 1, slideShadows: false },
        loop: true,
        autoplay: { delay: 3500, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        breakpoints: {
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }
      });
    }

    // ==========================================
    // 10. Services Hero Mouse Glow
    // ==========================================
    const heroSection = document.getElementById('services-hero');
    const mouseGlow = document.getElementById('hero-mouse-glow');
    if (heroSection && mouseGlow && typeof gsap !== 'undefined') {
      gsap.set(mouseGlow, { x: -1000, y: -1000, autoAlpha: 0 });
      let entered = false;
      heroSection.addEventListener('mousemove', (e) => {
        if (!entered) { gsap.to(mouseGlow, { autoAlpha: 1, duration: 0.5 }); entered = true; }
        const rect = heroSection.getBoundingClientRect();
        gsap.to(mouseGlow, { x: e.clientX - rect.left - 250, y: e.clientY - rect.top - 250, duration: 0.8, ease: 'power2.out' });
      });
      heroSection.addEventListener('mouseleave', () => {
        gsap.to(mouseGlow, { autoAlpha: 0, duration: 0.5 }); entered = false;
      });
    }

    // ==========================================
    // 11. Smooth Anchor Scroll (IMPROVED — 80px offset)
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();

          // Close mobile menu if open
          const navToggleEl = document.getElementById('nav-toggle');
          const navMobileEl = document.getElementById('nav-mobile');
          if (navToggleEl && navToggleEl.classList.contains('active')) {
            navToggleEl.classList.remove('active');
            if (navMobileEl) navMobileEl.classList.remove('active');
            document.body.style.overflow = '';
          }

          // Scroll with 80px offset for fixed navbar
          const offsetTop = targetEl.getBoundingClientRect().top + window.scrollY - 80;

          if (lenis) {
            lenis.scrollTo(targetEl, { duration: 1.2, offset: -80 });
          } else {
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
          }
        }
      });
    });

    // Cross-page hash scroll (with offset)
    if (window.location.hash) {
      const hashTarget = document.querySelector(window.location.hash);
      if (hashTarget) {
        setTimeout(() => {
          const offsetTop = hashTarget.getBoundingClientRect().top + window.scrollY - 80;
          if (lenis) { lenis.scrollTo(hashTarget, { duration: 1.2, offset: -80 }); }
          else { window.scrollTo({ top: offsetTop, behavior: 'smooth' }); }
        }, 300);
      }
    }

    // ==========================================
    // 12. Hero Particles Canvas
    // ==========================================
    const canvas = document.getElementById('hero-particles');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let particles = [];

      function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }

      function createParticles() {
        particles = [];
        const count = Math.min(60, Math.floor(canvas.width / 25));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
          });
        }
      }

      function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const dx = p.x - particles[j].x;
            const dy = p.y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 120)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
        requestAnimationFrame(drawParticles);
      }

      resizeCanvas();
      createParticles();
      drawParticles();
      window.addEventListener('resize', () => { resizeCanvas(); createParticles(); }, { passive: true });
    }

    // ==========================================
    // 13. Active Nav Link Detection
    // ==========================================
    const sectionEls = document.querySelectorAll('section[id]');
    const navLinkEls = document.querySelectorAll('.nav__link');
    if (sectionEls.length && navLinkEls.length) {
      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinkEls.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      }, { rootMargin: '-40% 0px -40% 0px' });
      sectionEls.forEach(s => navObserver.observe(s));
    }

    // ==========================================
    // 14. Contact Form
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>Sending...</span>';
        btn.disabled = true;

        setTimeout(() => {
          btn.innerHTML = '<span style="color: var(--accent-emerald)">✓ Message Sent!</span>';
          contactForm.reset();
          setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2500);
        }, 1500);
      });
    }

    // ==========================================
    // 15. Footer Newsletter
    // ==========================================
    const footerForm = document.querySelector('.footer__form');
    if (footerForm) {
      footerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = footerForm.querySelector('input');
        const btn = footerForm.querySelector('button');
        if (input && input.value) {
          btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>';
          btn.style.background = '#00ffaa';
          setTimeout(() => {
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
            btn.style.background = '';
            input.value = '';
          }, 2500);
        }
      });
    }

    /* ============================================
       Why Choose Us — Staggered Card Reveal
       ============================================ */
    (function () {
      const whyCards = document.querySelectorAll('[data-why-card]');
      if (!whyCards.length) return;

      const whyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.parentElement.querySelectorAll('[data-why-card]');
            cards.forEach((card, i) => {
              setTimeout(() => {
                card.classList.add('visible');
              }, i * 100);
            });
            whyObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      // Observe the first card — when it enters, trigger all
      if (whyCards[0]) {
        whyObserver.observe(whyCards[0]);
      }
    })();

    /* ============================================
       AI Automation — Benefit Row Staggered Reveal
       ============================================ */
    (function () {
      const benefitRows = document.querySelectorAll('[data-ai-benefit]');
      if (!benefitRows.length) return;

      const benefitObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rows = document.querySelectorAll('[data-ai-benefit]');
            rows.forEach((row, i) => {
              setTimeout(() => {
                row.classList.add('visible');
              }, i * 150);
            });
            benefitObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      if (benefitRows[0]) {
        benefitObserver.observe(benefitRows[0]);
      }
    })();

    /* ============================================
       AI Automation — Three.js Globe
       ============================================ */
    (function () {
      const canvas = document.getElementById('ai-globe-canvas');
      if (!canvas || typeof THREE === 'undefined') return;

      const wrapper = canvas.parentElement;
      const width = wrapper.clientWidth || 500;
      const height = wrapper.clientHeight || 500;

      // Scene
      const scene = new THREE.Scene();

      // Camera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 4;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      // Solid sphere
      const sphereGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: 0x060d1f,
        shininess: 30,
        transparent: true,
        opacity: 0.95
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      scene.add(sphere);

      // Wireframe overlay
      const wireGeo = new THREE.SphereGeometry(1.22, 24, 24);
      const wireframe = new THREE.WireframeGeometry(wireGeo);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x00d2ff,
        transparent: true,
        opacity: 0.35
      });
      const wireLines = new THREE.LineSegments(wireframe, wireMat);
      scene.add(wireLines);

      // Particles
      const particleCount = 80;
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 1.5 + Math.random() * 1.5;
        particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        particlePositions[i * 3 + 2] = r * Math.cos(phi);
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x00d2ff,
        size: 0.03,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Lights
      const pointLight = new THREE.PointLight(0x00d2ff, 1.2, 20);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
      scene.add(ambientLight);

      // Track visibility for speed boost
      let isInView = false;
      const sectionEl = document.getElementById('ai-automation');
      if (sectionEl) {
        const globeObserver = new IntersectionObserver((entries) => {
          isInView = entries[0].isIntersecting;
        }, { threshold: 0.1 });
        globeObserver.observe(sectionEl);
      }

      // Animation loop
      function animate() {
        requestAnimationFrame(animate);

        const speed = isInView ? 1.3 : 1;

        wireLines.rotation.y += 0.004 * speed;
        sphere.rotation.y += 0.002 * speed;
        particles.rotation.y += 0.001 * speed;

        // Floating effect
        const floatY = Math.sin(Date.now() * 0.001) * 0.15;
        sphere.position.y = floatY;
        wireLines.position.y = floatY;
        particles.position.y = floatY;

        renderer.render(scene, camera);
      }

      animate();

      // Resize handler
      function handleResize() {
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;
        if (w && h) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }

      window.addEventListener('resize', handleResize);
    })();

    /* ============================================
       Three.js Globe — Fixed Round Rendering
       ============================================ */
    function initGlobe() {
      const container = document.getElementById('globe-container');
      if (!container) return;

      const canvas = document.getElementById('globe-canvas');
      if (!canvas) return;

      // Dynamically load Three.js if not already loaded
      if (typeof THREE === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => buildGlobe(canvas, container);
        document.head.appendChild(script);
      } else {
        buildGlobe(canvas, container);
      }
    }

    function buildGlobe(canvas, container) {
      container.style.width = '100%';
      container.style.height = '500px';

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
      });

      // CRITICAL — use container's actual pixel dimensions
      const W = container.offsetWidth;
      const H = container.offsetHeight;
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();

      // CRITICAL — aspect ratio must be W/H not hardcoded
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
      camera.position.z = 3;

      // Inner solid sphere
      const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: 0x060d1f,
        emissive: 0x0a1628,
        shininess: 30
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      scene.add(sphere);

      // Wireframe overlay — slightly larger than sphere
      const wireGeo = new THREE.WireframeGeometry(
        new THREE.SphereGeometry(1.02, 24, 24)
      );
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x00d2ff,
        transparent: true,
        opacity: 0.3
      });
      const wireframe = new THREE.LineSegments(wireGeo, wireMat);
      scene.add(wireframe);

      // Lights
      const pointLight = new THREE.PointLight(0x00d2ff, 2, 10);
      pointLight.position.set(3, 3, 3);
      scene.add(pointLight);
      scene.add(new THREE.AmbientLight(0x223344, 0.5));

      // Particles orbiting the globe
      const particleCount = 80;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        const r = 1.5 + Math.random() * 0.3;
        positions[i * 3] = r * Math.cos(theta) * Math.sin(phi);
        positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x00d2ff,
        size: 0.03,
        transparent: true,
        opacity: 0.6
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Animation
      const clock = new THREE.Clock();
      const animate = () => {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        sphere.rotation.y = t * 0.2;
        wireframe.rotation.y = t * 0.35;
        wireframe.rotation.x = t * 0.1;
        particles.rotation.y = -t * 0.1;
        sphere.position.y = Math.sin(t) * 0.08;
        renderer.render(scene, camera);
      };
      animate();

      // Resize handler — keeps it perfectly round on window resize
      window.addEventListener('resize', () => {
        const W2 = container.offsetWidth;
        const H2 = container.offsetHeight;
        camera.aspect = W2 / H2;
        camera.updateProjectionMatrix();
        renderer.setSize(W2, H2);
      });
    }

    initGlobe();

    console.log('[Abraxis] App initialized successfully.');
  }

  // ==========================================
  // Boot — wait for deferred scripts
  // ==========================================
  function boot() {
    // Wait a tick for deferred GSAP/Swiper to be available
    setTimeout(initApp, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();

/* ============================================
   Smooth Scroll for Nav Links (80px offset)
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll with navbar offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const navbarHeight = 80;
      const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update active state
      document.querySelectorAll('.navbar__link').forEach(link => link.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

/* ============================================
   Floating Hero Stars Generator
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const starsContainer = document.getElementById('hero-stars');
  if (!starsContainer) return;

  for (let i = 0; i < 30; i++) {
    const star = document.createElement('div');
    star.classList.add('hero-star');
    
    // Random position
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    
    // Random twinkle duration between 2s and 5s
    const duration = Math.random() * 3 + 2;
    star.style.setProperty('--duration', duration + 's');
    
    // Random delay so they don't all blink together
    star.style.animationDelay = (Math.random() * 5) + 's';
    
    starsContainer.appendChild(star);
  }
});

/* ============================================
   Tech Grid Individual Colors & Glow
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const techColors = {
    'React':      { color: '#61dafb', glow: 'rgba(97, 218, 251, 0.2)' },
    'Next.js':    { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.15)' },
    'TypeScript': { color: '#3178c6', glow: 'rgba(49, 120, 198, 0.25)' },
    'Node.js':    { color: '#68a063', glow: 'rgba(104, 160, 99, 0.25)' },
    'Python':     { color: '#ffd43b', glow: 'rgba(255, 212, 59, 0.2)' },
    'Go':         { color: '#00acd7', glow: 'rgba(0, 172, 215, 0.25)' },
    'PostgreSQL': { color: '#336791', glow: 'rgba(51, 103, 145, 0.25)' },
    'MongoDB':    { color: '#47a248', glow: 'rgba(71, 162, 72, 0.25)' },
    'Redis':      { color: '#ff4438', glow: 'rgba(255, 68, 56, 0.25)' },
    'Docker':     { color: '#2496ed', glow: 'rgba(36, 150, 237, 0.25)' },
    'Kubernetes': { color: '#326ce5', glow: 'rgba(50, 108, 229, 0.25)' },
    'AWS':        { color: '#ff9900', glow: 'rgba(255, 153, 0, 0.25)' },
    'Azure':      { color: '#0089d6', glow: 'rgba(0, 137, 214, 0.25)' },
    'GraphQL':    { color: '#e10098', glow: 'rgba(225, 0, 152, 0.25)' },
    'Figma':      { color: '#f24e1e', glow: 'rgba(242, 78, 30, 0.25)' },
    'Rust':       { color: '#ff4647', glow: 'rgba(255, 70, 71, 0.25)' },
    'Terraform':  { color: '#7b42bc', glow: 'rgba(123, 66, 188, 0.25)' },
    'Security':   { color: '#00d2ff', glow: 'rgba(0, 210, 255, 0.25)' },
  };

  document.querySelectorAll('.stack__slider-item').forEach(card => {
    const name = card.querySelector('span')?.textContent?.trim();
    if (techColors[name]) {
      card.style.setProperty('--tech-color', techColors[name].color);
      card.style.setProperty('--tech-glow', techColors[name].glow);
    }
  });
});
