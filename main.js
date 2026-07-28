// ============================================
// Wait for GSAP to load (deferred scripts)
// ============================================
function initApp() {

  // 1. Initialize Lenis Smooth Scroll (if available)
  let lenis;
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

  // 2. Initialize AOS (if available)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 80,
      easing: 'ease-out-cubic',
    });
  }

  // 3. Initialize Lucide Icons (if available)
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 5. Scroll Progress Bar
  const progressBar = document.querySelector('.scroll-progress') || document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + "%";
    });
  }

  // 6. Navigation — scroll detection & mobile menu
  const nav = document.querySelector('nav') || document.getElementById('navbar');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('nav--scrolled');
        // Also handle Tailwind classes for services page nav
        if (nav.classList.contains('fixed')) {
          nav.classList.add('py-4', 'bg-navy/90', 'backdrop-blur-lg', 'shadow-lg', 'shadow-blue-900/10');
          nav.classList.remove('py-6', 'bg-navy/0');
        }
      } else {
        nav.classList.remove('nav--scrolled');
        if (nav.classList.contains('fixed')) {
          nav.classList.add('py-6', 'bg-navy/0');
          nav.classList.remove('py-4', 'bg-navy/90', 'backdrop-blur-lg', 'shadow-lg', 'shadow-blue-900/10');
        }
      }
    });
  }

  // Mobile menu toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMobile = document.getElementById('nav-mobile');
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMobile.classList.toggle('active');
      document.body.style.overflow = navMobile.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMobile.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // 7. GSAP Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance animation
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const heroBadge = document.querySelector('.hero__badge');
    const heroTitle = document.querySelector('.hero__title') || document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero__subtitle') || document.querySelector('.hero-subtitle');
    const heroActions = document.querySelector('.hero__actions');
    const heroStats = document.querySelector('.hero__stats');

    if (heroBadge) heroTl.from(heroBadge, { y: 0 /* disabled y: 30 */, duration: 0.8, delay: 0.2 });
    if (heroTitle) heroTl.from(heroTitle, { y: 0 /* disabled y: 50 */, duration: 1 }, "-=0.5");
    if (heroSubtitle) heroTl.from(heroSubtitle, { y: 0 /* disabled y: 30 */, duration: 0.8 }, "-=0.6");
    if (heroActions) heroTl.from(heroActions, { y: 0 /* disabled y: 30 */, duration: 0.8 }, "-=0.5");
    if (heroStats) heroTl.from(heroStats, { y: 0 /* disabled y: 30 */, duration: 0.8 }, "-=0.4");

    // Section reveal animations
    /* gsap.utils.toArray('.section__header, .section__label, .section__title').forEach(el => {
      gsap.from(el, {
        y: 40,
        // opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        }
      });
    }); */

    // Staggered card animations
    gsap.utils.toArray('.services__grid, .solutions__grid, .team__grid, .stack__grid, .about__stats').forEach(grid => {
      const cards = grid.children;
      if (cards.length > 0) {
        gsap.from(cards, {
          y: 60,
          // opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
            once: true,
          }
        });
      }
    });

    // Counter animations  
    const counters = document.querySelectorAll('[data-count], .stat-counter');
    counters.forEach(counter => {
      const target = counter.getAttribute('data-count') || counter.getAttribute('data-target');
      if (target) {
        ScrollTrigger.create({
          trigger: counter,
          start: "top 85%",
          onEnter: () => {
            gsap.to(counter, {
              innerHTML: +target,
              duration: 2.5,
              snap: { innerHTML: 1 },
              ease: "power2.out"
            });
          },
          once: true
        });
      }
    });

    // Parallax on orbs  
    gsap.utils.toArray('.hero__orb, .services__orb, .contact__orb').forEach(orb => {
      gsap.to(orb, {
        y: () => -100,
        ease: "none",
        scrollTrigger: {
          trigger: orb.closest('section') || orb.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      });
    });

    // Magnetic effect on buttons
    document.querySelectorAll('.btn, .nav__cta, .btn-glow').forEach(btn => {
      // Disabled as requested for steadier buttons
      /*
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
        gsap.to(btn, { x, y, duration: 0.3, ease: "power2.out" });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      });
      */
    });

    // Card tilt effect on service/solution cards
    document.querySelectorAll('.service-card, .solution-card, .glass-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotationY: x * 8,
          rotationX: -y * 8,
          duration: 0.4,
          ease: "power2.out",
          transformPerspective: 800,
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
        });
      });
    });
  }

  // 8. Vanta.js Network Background (services page)
  const vantaEl = document.getElementById('vanta-bg');
  if (vantaEl && typeof VANTA !== 'undefined') {
    setTimeout(() => {
      VANTA.NET({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x00BFFF,
        backgroundColor: 0x0A0F1C,
        points: 12.00,
        maxDistance: 22.00,
        spacing: 18.00,
        showDots: true
      });
    }, 100);
  }

  // 9. Initialize Swiper for Testimonials
  if (document.querySelector('.testimonials-slider') && typeof Swiper !== 'undefined') {
    new Swiper('.testimonials-slider', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      coverflowEffect: {
        rotate: 20,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
      },
      loop: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      breakpoints: {
        320: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });
  }

  // 10. Services Hero Mouse Glow
  const heroSection = document.getElementById('services-hero');
  const mouseGlow = document.getElementById('hero-mouse-glow');
  if (heroSection && mouseGlow && typeof gsap !== 'undefined') {
    gsap.set(mouseGlow, { x: -1000, y: -1000, autoAlpha: 0 });
    let entered = false;

    heroSection.addEventListener('mousemove', (e) => {
      if (!entered) {
        gsap.to(mouseGlow, { autoAlpha: 1, duration: 0.5 });
        entered = true;
      }
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left - 250;
      const y = e.clientY - rect.top - 250;
      gsap.to(mouseGlow, { x, y, duration: 0.8, ease: "power2.out" });
    });

    heroSection.addEventListener('mouseleave', () => {
      gsap.to(mouseGlow, { autoAlpha: 0, duration: 0.5 });
      entered = false;
    });
  }

  // 11. Smooth anchor scroll via Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetElement, { duration: 1.2, offset: -80 });
        } else {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Cross-page hash scroll
  if (window.location.hash) {
    const targetElement = document.querySelector(window.location.hash);
    if (targetElement) {
      setTimeout(() => {
        if (lenis) {
          lenis.scrollTo(targetElement, { duration: 1.2, offset: -80 });
        } else {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }

  // 12. Particle canvas for hero (lightweight)
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

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

        // Connect nearby particles
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

      animId = requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });
  }

  // 13. Active nav link detection
  if (typeof IntersectionObserver !== 'undefined') {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    if (sections.length && navLinks.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              }
            });
          }
        });
      }, { rootMargin: '-40% 0px -40% 0px' });

      sections.forEach(section => observer.observe(section));
    }
  }

  // 14. Contact form handling
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
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }, 2500);
      }, 1500);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure deferred scripts are loaded
    setTimeout(initApp, 150);
  });
} else {
  setTimeout(initApp, 150);
}

/* ============================================
   ABRAXIS SOLUTIONS — Main JS
   Fixed: reveal system, opacity, all animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     Mark body as JS-loaded so reveal CSS works
     ========================================== */
  document.body.classList.add('js-loaded');

  /* ==========================================
     Scroll Progress Bar
     ========================================== */
  const scrollProgress = document.getElementById('scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = `${pct}%`;
    }, { passive: true });
  }

  /* ==========================================
     Navigation Scroll Effect
     ========================================== */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('nav--scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==========================================
     Active Nav Link on Scroll
     ========================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const observerNav = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observerNav.observe(s));

  /* ==========================================
     Mobile Menu
     ========================================== */
  const navToggle = document.getElementById('nav-toggle');
  const navMobile = document.getElementById('nav-mobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('active');
      navMobile.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navMobile.querySelectorAll('.nav__mobile-link, .nav__mobile-cta').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMobile.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ==========================================
     Reveal on Scroll — IntersectionObserver
     ========================================== */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ==========================================
     Counter Animations
     ========================================== */
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 2000;
        const start = performance.now();

        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };

        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ==========================================
     Hero Particle Canvas
     ========================================== */
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const colors = ['rgba(0,212,255,', 'rgba(123,45,255,', 'rgba(255,45,124,', 'rgba(0,255,170,'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();
  }

  /* ==========================================
     Canvas 1: Network Mesh
     ========================================== */
  const canvas1 = document.getElementById('canvas-network');
  if (canvas1) {
    const ctx = canvas1.getContext('2d');
    let width, height;
    let particles = [];
    
    function resize1() {
      width = canvas1.width = window.innerWidth;
      height = canvas1.height = window.innerHeight;
    }
    window.addEventListener('resize', resize1);
    resize1();
    
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        radius: Math.random() * 2 + 1
      });
    }
    
    function draw1() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#00d4ff';
      ctx.strokeStyle = '#00d4ff';
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = 1 - (dist / 150);
            ctx.globalAlpha = 1 - (dist / 150);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });
      requestAnimationFrame(draw1);
    }
    draw1();
  }

  /* ==========================================
     Swiper — Testimonials & Hero
     ========================================== */
  if (typeof Swiper !== 'undefined') {
    new Swiper('.testimonials-slider', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: {
        768: { slidesPerView: 2 },
      },
    });

    const heroSliderElem = document.querySelector('.hero-slider');
    if (heroSliderElem) {
      new Swiper('.hero-slider', {
        slidesPerView: 1,
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });
    }
  }

  /* ==========================================
     Smooth Scroll for Anchor Links
     ========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ==========================================
     Contact Form
     ========================================== */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;

      btn.innerHTML = '<span>Sending...</span>';
      btn.disabled = true;

      await new Promise(r => setTimeout(r, 1500));

      btn.innerHTML = '<span>Message Sent ✓</span>';
      btn.style.background = '#00ffaa';
      btn.style.color = '#05070e';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.style.background = '';
        btn.style.color = '';
        form.reset();
      }, 3000);
    });
  }

  /* ==========================================
     Footer Newsletter Form
     ========================================== */
  const footerForm = document.querySelector('.footer__form');
  if (footerForm) {
    footerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = footerForm.querySelector('input');
      const btn = footerForm.querySelector('button');
      if (input.value) {
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
});
