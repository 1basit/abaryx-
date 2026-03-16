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

        // Close mobile menu
        if (navToggle && navToggle.classList.contains('active')) {
          navToggle.classList.remove('active');
          if (navMobile) navMobile.classList.remove('active');
          document.body.style.overflow = '';
        }

        const offset = 20; // small offset since nav is inside hero card
        const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    // ==========================================
    // 4. Hero Stars Generator
    // ==========================================
    const starsContainer = document.getElementById('hero-stars');
    if (starsContainer) {
      for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.classList.add('hero-star');
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        star.style.animationDelay = (Math.random() * 5) + 's';
        starsContainer.appendChild(star);
      }
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
    // 6. Why Choose Us — Staggered Reveal
    // ==========================================
    const whyCards = document.querySelectorAll('[data-why-card]');
    if (whyCards.length) {
      const whyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const allCards = entry.target.parentElement.querySelectorAll('[data-why-card]');
            allCards.forEach((card, i) => {
              setTimeout(() => card.classList.add('visible'), i * 100);
            });
            whyObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      if (whyCards[0]) whyObserver.observe(whyCards[0]);
    }

    // ==========================================
    // 7. AI Benefits — Staggered Reveal
    // ==========================================
    const benefitRows = document.querySelectorAll('[data-ai-benefit]');
    if (benefitRows.length) {
      const benefitObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const all = document.querySelectorAll('[data-ai-benefit]');
            all.forEach((row, i) => {
              setTimeout(() => row.classList.add('visible'), i * 150);
            });
            benefitObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      if (benefitRows[0]) benefitObserver.observe(benefitRows[0]);
    }

    // ==========================================
    // 8. Tech Card Colors
    // ==========================================
    const techColors = {
      'React': { color: '#61dafb', glow: 'rgba(97,218,251,0.2)' },
      'Next.js': { color: '#333333', glow: 'rgba(0,0,0,0.1)' },
      'TypeScript': { color: '#3178c6', glow: 'rgba(49,120,198,0.2)' },
      'Node.js': { color: '#68a063', glow: 'rgba(104,160,99,0.2)' },
      'Python': { color: '#ffd43b', glow: 'rgba(255,212,59,0.2)' },
      'Go': { color: '#00acd7', glow: 'rgba(0,172,215,0.2)' },
      'PostgreSQL': { color: '#336791', glow: 'rgba(51,103,145,0.2)' },
      'MongoDB': { color: '#47a248', glow: 'rgba(71,162,72,0.2)' },
      'Redis': { color: '#ff4438', glow: 'rgba(255,68,56,0.2)' },
      'Docker': { color: '#2496ed', glow: 'rgba(36,150,237,0.2)' },
      'Kubernetes': { color: '#326ce5', glow: 'rgba(50,108,229,0.2)' },
      'AWS': { color: '#ff9900', glow: 'rgba(255,153,0,0.2)' },
      'Azure': { color: '#0089d6', glow: 'rgba(0,137,214,0.2)' },
      'GraphQL': { color: '#e10098', glow: 'rgba(225,0,152,0.2)' },
      'Figma': { color: '#f24e1e', glow: 'rgba(242,78,30,0.2)' },
      'Rust': { color: '#ff4647', glow: 'rgba(255,70,71,0.2)' },
      'Terraform': { color: '#7b42bc', glow: 'rgba(123,66,188,0.2)' },
      'Security': { color: '#00d2ff', glow: 'rgba(0,210,255,0.2)' },
    };

    document.querySelectorAll('.tech-card').forEach(card => {
      const name = card.querySelector('span')?.textContent?.trim();
      if (techColors[name]) {
        card.style.setProperty('--tech-color', techColors[name].color);
        card.style.setProperty('--tech-glow', techColors[name].glow);
      }
    });

    // ==========================================
    // 9. GSAP Animations (if loaded)
    // ==========================================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Hero entrance
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from('.hero-headline, .services-page-hero__title', { y: 50, opacity: 0, duration: 1, delay: 0.3 })
        .from('.hero-subtitle, .services-page-hero__subtitle', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.hero-actions, .services-page-hero__actions', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
        .from('.hero-stats-row, .services-page-hero__tags', { y: 30, opacity: 0, duration: 0.8 }, '-=0.4');

      // Section headers
      gsap.utils.toArray('.section-header').forEach(el => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
      });

      // About glass cards — staggered reveal
      gsap.utils.toArray('.about-glass-card').forEach((card, i) => {
        gsap.from(card, {
          y: 50, opacity: 0, duration: 0.7, delay: i * 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true }
        });
      });

      // About content
      gsap.from('.about-text-v2', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-text-v2', start: 'top 85%', once: true }
      });

      // About mission box
      gsap.from('.about-mission-v2', {
        y: 30, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-mission-v2', start: 'top 88%', once: true }
      });

      // About tech slider
      const techSlider = document.querySelector('.about-tech-slider');
      if (techSlider) {
        gsap.from(techSlider, {
          x: 40, opacity: 0, duration: 0.8, delay: 0.3, ease: 'power3.out',
          scrollTrigger: { trigger: techSlider, start: 'top 85%', once: true }
        });
      }

      // About stats cards (old — keep for backward compat)
      gsap.utils.toArray('.about-stat-card').forEach((card, i) => {
        gsap.from(card, {
          y: 40, opacity: 0, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true }
        });
      });

      // Service cards (index page)
      gsap.utils.toArray('.service-card').forEach((card, i) => {
        gsap.from(card, {
          y: 40, opacity: 0, duration: 0.6, delay: i * 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true }
        });
      });

      // Service detail cards (services page)
      gsap.utils.toArray('.service-detail-card').forEach((card, i) => {
        gsap.from(card, {
          y: 30, opacity: 0, duration: 0.5, delay: (i % 2) * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true }
        });
      });

      // Services category headers (services page)
      gsap.utils.toArray('.services-category__header').forEach(el => {
        gsap.from(el, {
          x: -30, opacity: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
      });

      // Solution cards
      gsap.utils.toArray('.solution-card').forEach((card, i) => {
        gsap.from(card, {
          y: 40, opacity: 0, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true }
        });
      });

      // Testimonial cards
      gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
        gsap.from(card, {
          y: 40, opacity: 0, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true }
        });
      });

      // Job cards
      gsap.utils.toArray('.job-card').forEach((card, i) => {
        gsap.from(card, {
          x: 30, opacity: 0, duration: 0.5, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true }
        });
      });
    }

    // ==========================================
    // 10. Three.js Globe (AI Section)
    // ==========================================
    (function () {
      const canvas = document.getElementById('ai-globe-canvas');
      if (!canvas || typeof THREE === 'undefined') return;

      const wrapper = canvas.parentElement;
      const width = wrapper.clientWidth || 400;
      const height = wrapper.clientHeight || 400;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 4;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      // Solid sphere
      const sphereGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const sphereMat = new THREE.MeshPhongMaterial({ color: 0x060d1f, shininess: 30, transparent: true, opacity: 0.95 });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      scene.add(sphere);

      // Wireframe
      const wireGeo = new THREE.SphereGeometry(1.22, 24, 24);
      const wireframe = new THREE.WireframeGeometry(wireGeo);
      const wireMat = new THREE.LineBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.35 });
      const wireLines = new THREE.LineSegments(wireframe, wireMat);
      scene.add(wireLines);

      // Particles
      const pCount = 80;
      const pPositions = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = 1.5 + Math.random() * 1.5;
        pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pPositions[i * 3 + 2] = r * Math.cos(phi);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      const pMat = new THREE.PointsMaterial({ color: 0x00d2ff, size: 0.03, transparent: true, opacity: 0.6, sizeAttenuation: true });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      // Lights
      const pointLight = new THREE.PointLight(0x00d2ff, 1.2, 20);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
      scene.add(new THREE.AmbientLight(0xffffff, 0.1));

      // Visibility check
      let isInView = false;
      const aiSection = document.getElementById('ai-automation');
      if (aiSection) {
        const gObserver = new IntersectionObserver((entries) => {
          isInView = entries[0].isIntersecting;
        }, { threshold: 0.1 });
        gObserver.observe(aiSection);
      }

      function animate() {
        requestAnimationFrame(animate);
        const speed = isInView ? 1.3 : 0.5;
        wireLines.rotation.y += 0.004 * speed;
        sphere.rotation.y += 0.002 * speed;
        particles.rotation.y += 0.001 * speed;
        const floatY = Math.sin(Date.now() * 0.001) * 0.15;
        sphere.position.y = floatY;
        wireLines.position.y = floatY;
        particles.position.y = floatY;
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;
        if (w && h) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      });
    })();

    console.log('[Abraxis] App initialized.');
  }

  // ==========================================
  // Boot
  // ==========================================
  function boot() {
    setTimeout(initApp, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
