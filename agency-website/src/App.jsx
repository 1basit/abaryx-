// src/App.jsx  — Abraxis Solutions | Complete Redesign
import { useEffect, useState, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '#about',    label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#solutions',label: 'Solutions' },
  { href: '#stack',    label: 'Technology' },
  { href: '#careers',  label: 'Careers' },
];

const STATS = [
  { value: 250, suffix: '+', label: 'Projects Delivered' },
  { value: 150, suffix: '+', label: 'Global Clients' },
  { value: 99,  suffix: '%', label: 'Satisfaction' },
];

const WHY_CARDS = [
  {
    color: 'cyan',
    title: 'Speed of Delivery',
    desc: 'From concept to production in weeks, not months. Streamlined processes eliminate bottlenecks.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    color: 'violet',
    title: 'Battle-Tested Architecture',
    desc: 'Infrastructure designed to handle millions of users from day one, built on proven patterns.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="6" width="22" height="12" rx="2" />
        <path d="M1 10h22" />
      </svg>
    ),
  },
  {
    color: 'magenta',
    title: 'AI-Powered Development',
    desc: 'We leverage AI copilots and intelligent toolchains to write cleaner code faster.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="2" />
        <path d="M12 14v4" />
        <path d="M12 2a4 4 0 0 1 4 4" />
      </svg>
    ),
  },
  {
    color: 'emerald',
    title: 'Transparent Communication',
    desc: 'Real-time dashboards, weekly demos, direct Slack access to your engineering team.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    color: 'amber',
    title: 'End-to-End Ownership',
    desc: 'From discovery to deployment to ongoing support — one team owns the entire lifecycle.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
  {
    color: 'blue',
    title: 'Global Remote Team',
    desc: 'Senior engineers across time zones mean your project moves forward 24 hours a day.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const SOLUTIONS = [
  {
    featured: true,
    color: 'pink',
    title: 'Enterprise Platform Engineering',
    desc: 'End-to-end custom platforms powering mission-critical operations with 99.99% uptime.',
    tags: ['Microservices', 'High Availability', 'Enterprise'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
  {
    featured: false,
    color: 'cyan',
    title: 'AI-Powered Analytics',
    desc: 'Machine learning pipelines that transform raw data into actionable business intelligence.',
    tags: ['ML/AI', 'Data Pipeline', 'Real-time'],
  },
  {
    featured: false,
    color: 'violet',
    title: 'Cloud Migration & DevOps',
    desc: 'Seamless cloud transitions with automated CI/CD pipelines and infrastructure-as-code.',
    tags: ['AWS/Azure/GCP', 'Terraform', 'K8s'],
  },
];

const TECH_ROW_1 = ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Next.js', 'Figma', 'GraphQL'];
const TECH_ROW_2 = ['Security', 'Terraform', 'MongoDB', 'Python', 'Redis', 'Azure', 'Go', 'Rust', 'Swift', 'Flutter'];

const AI_BENEFITS = [
  {
    title: 'Autonomous Agents',
    desc: 'Self-operating AI workflows that execute complex multi-step tasks without human intervention.',
    color: '#00b4d8',
  },
  {
    title: 'Predictive Intelligence',
    desc: 'ML models that anticipate market shifts, user behaviour, and operational risks in real time.',
    color: '#8b5cf6',
  },
  {
    title: 'Natural Language Interfaces',
    desc: 'Conversational AI layers that let your team query data and control systems with plain English.',
    color: '#10b981',
  },
];

const JOBS = [
  { title: 'Senior Full-Stack Engineer',     meta: 'Remote · Full-time',   color: 'cyan' },
  { title: 'AI/ML Research Scientist',        meta: 'Hybrid · Full-time',  color: 'violet' },
  { title: 'Cloud Infrastructure Architect',  meta: 'Remote · Full-time',  color: 'magenta' },
  { title: 'Product Designer (UI/UX)',        meta: 'Remote · Contract',   color: 'cyan' },
];

const TESTIMONIALS = [
  {
    stars: 5,
    quote: 'Abraxis delivered our enterprise platform 3 weeks ahead of schedule. The code quality is exceptional and the team communication was world-class.',
    name: 'Michael Chen',
    role: 'CTO · FinScale Inc.',
    initials: 'MC',
  },
  {
    stars: 5,
    quote: 'The AI automation system they built reduced our operational costs by 40%. Outstanding technical depth and business understanding.',
    name: 'Sarah Mitchell',
    role: 'VP Engineering · CloudBase',
    initials: 'SM',
  },
  {
    stars: 5,
    quote: 'From discovery to deployment in 6 weeks. Their remote team operates with a level of discipline I have never seen before.',
    name: 'James Okafor',
    role: 'CEO · DataPulse',
    initials: 'JO',
  },
  {
    stars: 5,
    quote: 'Zero compromises on security and zero downtime since launch. Abraxis is the only agency I trust with mission-critical infrastructure.',
    name: 'Priya Sharma',
    role: 'CISO · NexaBank',
    initials: 'PS',
  },
];

/* ─────────────────────────────────────────────
   COLOUR HELPERS
───────────────────────────────────────────── */
const COLORS = {
  cyan:    { bg: 'rgba(0,212,255,0.1)',   border: 'rgba(0,212,255,0.2)',   text: '#00d4ff' },
  violet:  { bg: 'rgba(123,45,255,0.1)',  border: 'rgba(123,45,255,0.2)',  text: '#7b2dff' },
  magenta: { bg: 'rgba(255,45,124,0.1)',  border: 'rgba(255,45,124,0.2)',  text: '#ff2d7c' },
  emerald: { bg: 'rgba(0,255,170,0.1)',   border: 'rgba(0,255,170,0.2)',   text: '#00ffaa' },
  amber:   { bg: 'rgba(255,170,0,0.1)',   border: 'rgba(255,170,0,0.2)',   text: '#ffaa00' },
  blue:    { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  text: '#3b82f6' },
  pink:    { bg: 'rgba(255,45,124,0.1)',  border: 'rgba(255,45,124,0.2)',  text: '#ff2d7c' },
};

/* ─────────────────────────────────────────────
   COUNTER HOOK
───────────────────────────────────────────── */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / (duration / 16);
      const tick = () => {
        start += step;
        if (start >= target) { setCount(target); return; }
        setCount(Math.floor(start));
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return [count, ref];
}

/* ─────────────────────────────────────────────
   SMALL COMPONENTS
───────────────────────────────────────────── */
function SectionLabel({ children, light }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700,
      color: light ? '#0a0a1a' : '#00d4ff',
      textTransform: 'uppercase', letterSpacing: '0.18em',
      marginBottom: '1rem', position: 'relative', paddingLeft: '1.5rem',
    }}>
      <span style={{
        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
        width: 8, height: 8, borderRadius: '50%',
        background: light ? '#0a0a1a' : '#00d4ff',
        boxShadow: light ? 'none' : '0 0 10px rgba(0,212,255,0.6)',
      }} />
      {children}
    </span>
  );
}

function GradientText({ children }) {
  return (
    <span style={{
      background: 'linear-gradient(135deg, #00d4ff 0%, #7b2dff 50%, #ff2d7c 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    }}>
      {children}
    </span>
  );
}

function StatCounter({ value, suffix, label }) {
  const [count, ref] = useCounter(value);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'system-ui, sans-serif', fontSize: 'clamp(2.5rem,5vw,3.5rem)',
        fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em',
        background: 'linear-gradient(135deg, #00d4ff 0%, #7b2dff 50%, #ff2d7c 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.25rem' }}>
        {label}
      </div>
    </div>
  );
}

function TechIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" />
    </svg>
  );
}

function MarqueeRow({ items, reverse }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', position: 'relative', padding: '0.75rem 0', marginBottom: reverse ? 0 : '1rem' }}>
      {/* Edge fades */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(to right, #0a0d18, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(to left, #0a0d18, transparent)', zIndex: 2, pointerEvents: 'none' }} />

      <div style={{
        display: 'flex', flexDirection: 'row', flexWrap: 'nowrap',
        gap: '1rem', width: 'max-content',
        animation: `${reverse ? 'marqueeRight' : 'marqueeLeft'} 30s linear infinite`,
      }}>
        {doubled.map((tech, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.5rem', padding: '1rem 1.5rem',
            background: 'rgba(13,16,32,0.9)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem', minWidth: 110, flexShrink: 0,
            transition: 'all 0.3s ease', cursor: 'default',
          }}>
            <div style={{ color: '#00d4ff', width: 32, height: 32 }}>
              <TechIcon />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              {tech}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [whyVisible,  setWhyVisible]  = useState([]);
  const whyRef = useRef(null);

  /* Nav scroll */
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on link click */
  const closeMenu = useCallback(() => setMobileOpen(false), []);

  /* Why cards intersection */
  useEffect(() => {
    if (!whyRef.current) return;
    const cards = whyRef.current.querySelectorAll('[data-why]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setWhyVisible(prev => [...new Set([...prev, e.target.dataset.why])]);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* ── GLOBAL KEYFRAMES ─────────────────── */}
      <style>{`
        @keyframes marqueeLeft  { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes marqueeRight { from { transform: translateX(-50%) } to { transform: translateX(0) } }
        @keyframes heroPulse    { 0%,100% { opacity:.6; transform:translate(-50%,-50%) scale(1) } 50% { opacity:1; transform:translate(-50%,-50%) scale(1.2) } }
        @keyframes starTwinkle  { 0%,100% { opacity:.15; transform:scale(1) } 50% { opacity:.8; transform:scale(1.4) } }
        @keyframes dotPulse     { 0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(0,212,255,.4) } 50% { opacity:.6; box-shadow:0 0 0 8px rgba(0,212,255,0) } }
        @keyframes orbMove1     { 0%,100% { transform:translate(0,0) scale(1); opacity:.5 } 50% { transform:translate(80px,-70px) scale(1.3); opacity:.75 } }
        @keyframes orbMove2     { 0%,100% { transform:translate(0,0) scale(1); opacity:.45 } 50% { transform:translate(-90px,60px) scale(1.25); opacity:.7 } }
        @keyframes orbMove3     { 0%,100% { transform:translate(0,0) scale(.95); opacity:.45 } 50% { transform:translate(70px,80px) scale(1.35); opacity:.7 } }
        @keyframes aiOrb        { 0%,100% { transform:translate(0,0) scale(1) } 33% { transform:translate(60px,-50px) scale(1.2) } 66% { transform:translate(-40px,60px) scale(.85) } }
        @keyframes buildShimmer { 0% { background-position:-200% 0 } 100% { background-position:200% 0 } }
        @keyframes orbFloat     { 0%,100% { transform:translateY(0) scale(1) } 50% { transform:translateY(-30px) scale(1.1) } }
        @keyframes fadeUp       { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #ffffff; font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
        button { border: none; background: none; cursor: pointer; font-family: inherit; }

        .why-card-enter { animation: fadeUp 0.6s ease forwards; }
      `}</style>

      {/* ── SCROLL PROGRESS ──────────────────── */}
      <ScrollProgress />

      {/* ── HERO ─────────────────────────────── */}
      <section id="home" style={{ background: '#ffffff', padding: '1rem', minHeight: '100vh', display: 'flex' }}>
        <div style={{
          background: '#050810', borderRadius: 20, width: '100%',
          minHeight: 'calc(100vh - 2rem)', position: 'relative',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Glow orb */}
          <div style={{
            position: 'absolute', width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,180,255,.22) 0%, rgba(139,92,246,.18) 40%, transparent 70%)',
            filter: 'blur(80px)', top: '50%', left: '50%',
            animation: 'heroPulse 6s ease-in-out infinite', pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Stars */}
          <Stars />

          {/* NAV inside card */}
          <nav style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '1.5rem 2.5rem', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            zIndex: 10,
            ...(navScrolled ? {
              background: 'rgba(5,7,14,0.9)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(0,212,255,0.1)',
            } : {}),
          }}>
            {/* Logo */}
            <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <LogoIcon />
              <span style={{
                fontWeight: 800, fontSize: '1.35rem',
                background: 'linear-gradient(135deg, #00d4ff, #7b2dff, #ff2d7c)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Abraxis</span>
            </a>

            {/* Desktop links */}
            <div style={{ display: 'flex', gap: '0.25rem' }} className="desktop-nav">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href} style={{
                  padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
                  letterSpacing: '0.04em', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* CTA pill */}
            <a href="#contact" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.5rem', background: '#00d4ff',
              color: '#05070e', borderRadius: '0.75rem',
              fontSize: '0.8125rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              boxShadow: '0 0 20px rgba(0,212,255,0.3)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#00e5ff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#00d4ff'; e.currentTarget.style.transform = 'none'; }}
            >
              Start Project
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </nav>

          {/* Hero content */}
          <div style={{
            position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center',
            maxWidth: 900, width: '100%', margin: '0 auto',
            padding: '6rem clamp(1rem,4vw,2rem) 4rem', gap: '1.5rem',
          }}>
            {/* Badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1.25rem',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 9999, fontSize: '0.72rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.75)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: '#00d4ff',
                boxShadow: '0 0 10px rgba(0,212,255,0.7)',
                animation: 'dotPulse 2s ease-in-out infinite',
              }} />
              Next-Generation Software Engineering
            </span>

            {/* Title */}
            <h1 style={{ lineHeight: 1, margin: 0 }}>
              <span style={{
                display: 'block', fontWeight: 800,
                fontSize: 'clamp(3rem,7vw,5.5rem)',
                color: '#ffffff', letterSpacing: '-0.03em',
              }}>
                We Engineer
              </span>
              <span style={{
                display: 'block', fontWeight: 800,
                fontSize: 'clamp(3rem,7vw,5.5rem)',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #00d4ff 0%, #7b2dff 50%, #ff2d7c 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Intelligent Systems
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 'clamp(1rem,2vw,1.1rem)', color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.75, maxWidth: 560, margin: 0,
            }}>
              Transforming ambitious ideas into scalable, secure, and high-performance digital products for global enterprises and visionary startups.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <HeroBtn href="#contact" primary>
                Start Your Project
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </HeroBtn>
              <HeroBtn href="#services">
                Explore Services
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </HeroBtn>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 'clamp(1.5rem,4vw,3rem)', flexWrap: 'wrap',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '2rem', width: '100%',
            }}>
              {STATS.map((s, i) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1.5rem,4vw,3rem)' }}>
                  <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
                  {i < STATS.length - 1 && (
                    <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.4), transparent)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────── */}
      <section id="about" style={{ background: '#ffffff', padding: 'clamp(4rem,8vw,8rem) 0', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle orbs for white section */}
        <Orb style={{ width:400, height:400, background:'rgba(0,212,255,0.06)', top:-100, right:-100, animation:'orbFloat 8s ease-in-out infinite' }} />
        <Orb style={{ width:300, height:300, background:'rgba(123,45,255,0.05)', bottom:-80, left:-80, animation:'orbFloat 10s ease-in-out infinite reverse' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem,4vw,2.5rem)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '4rem', alignItems: 'center' }}>

            {/* Text side */}
            <div>
              <SectionLabel light>About Us</SectionLabel>
              <h2 style={{ fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 800, color: '#0a0f1a', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1rem' }}>
                Redefining <GradientText>Digital Excellence</GradientText>
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#4b5563', lineHeight: 1.75, marginBottom: '2rem' }}>
                At Abraxis Solutions, we fuse cutting-edge technology with exceptional design thinking. Since our inception, we've driven digital transformation for industry leaders globally, crafting state-of-the-art products that dominate the modern web and cloud ecosystem.
              </p>
              <div style={{
                display: 'flex', gap: '1.25rem', padding: '1.75rem',
                background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: '1.25rem',
              }}>
                <div style={{
                  width: 52, height: 52, flexShrink: 0, borderRadius: '1rem',
                  background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#0a0f1a', marginBottom: '0.35rem' }}>Our Mission</h3>
                  <p style={{ fontSize: '0.9375rem', color: '#4b5563', lineHeight: 1.75 }}>
                    To build intelligent, scalable, and beautifully designed digital infrastructure that propels humanity forward into the cloud era.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.25rem' }}>
              {[
                { val: 250, label: 'Projects Delivered', mod: '' },
                { val: 150, label: 'Global Clients',     mod: '--purple' },
                { val: 10,  label: 'Years Experience',   mod: '--blue' },
                { val: 35,  label: 'Tech Mastered',      mod: '--pink' },
              ].map(s => <AboutStatCard key={s.label} value={s.val} label={s.label} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────── */}
      <section id="why" style={{ background: '#080d1a', padding: 'clamp(4rem,8vw,8rem) 0', position: 'relative', overflow: 'hidden' }} ref={whyRef}>
        {/* Animated orbs */}
        <Orb style={{ width:500,height:500,background:'rgba(0,212,255,0.35)',top:-100,left:-120,filter:'blur(90px)',animation:'orbMove1 5s ease-in-out infinite' }} />
        <Orb style={{ width:450,height:450,background:'rgba(123,45,255,0.3)',bottom:-80,right:-100,filter:'blur(90px)',animation:'orbMove2 6s ease-in-out infinite' }} />
        <Orb style={{ width:380,height:380,background:'rgba(0,255,170,0.22)',top:'45%',left:'48%',marginLeft:-190,marginTop:-190,filter:'blur(90px)',animation:'orbMove3 4s ease-in-out infinite' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem,4vw,2.5rem)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto clamp(3rem,6vw,5rem)' }}>
            <SectionLabel>Why Choose Us</SectionLabel>
            <h2 style={{ fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1rem' }}>
              Built Different by <GradientText>Design</GradientText>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, fontSize: '1.05rem' }}>
              We don't just build software — we engineer competitive advantages. Here's what sets us apart.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
            {WHY_CARDS.map((card, i) => {
              const c = COLORS[card.color];
              const vis = whyVisible.includes(String(i));
              return (
                <div key={i} data-why={i} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                  transition: 'all 0.4s ease', position: 'relative', overflow: 'hidden',
                  opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(30px)',
                  transitionDelay: `${i * 80}ms`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = vis ? 'translateY(0)' : 'translateY(30px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: c.bg, border: `1px solid ${c.border}`, color: c.text,
                  }}>
                    {card.icon}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>{card.title}</h3>
                  <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS ────────────────────────── */}
      <section id="solutions" style={{ background: '#05070e', padding: 'clamp(4rem,8vw,8rem) 0', position: 'relative', overflow: 'hidden' }}>
        <Orb style={{ width:500,height:500,background:'rgba(255,45,124,0.07)',top:-100,right:-150,filter:'blur(150px)',animation:'orbFloat 8s ease-in-out infinite' }} />
        <Orb style={{ width:400,height:400,background:'rgba(123,45,255,0.06)',bottom:-80,left:-120,filter:'blur(150px)',animation:'orbFloat 10s ease-in-out infinite reverse' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem,4vw,2.5rem)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto clamp(3rem,6vw,5rem)' }}>
            <SectionLabel>Our Solutions</SectionLabel>
            <h2 style={{ fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 800, color: '#edf2f7', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1rem' }}>
              Tailored Digital Solutions
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.75 }}>
              Enterprise-grade platforms built for scale, security, and performance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
            {SOLUTIONS.map((sol, i) => {
              const c = COLORS[sol.color];
              return (
                <SolutionCard key={i} sol={sol} c={c} />
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <a href="#contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 2rem', background: '#00d4ff', color: '#05070e',
              borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              boxShadow: '0 0 25px rgba(0,212,255,0.35)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#00e5ff'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#00d4ff'; e.currentTarget.style.transform = 'none'; }}
            >
              Discuss Your Solution
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY STACK ─────────────────── */}
      <section id="stack" style={{ background: '#0a0d18', padding: 'clamp(4rem,8vw,8rem) 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem,4vw,2.5rem)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto clamp(3rem,6vw,5rem)' }}>
            <SectionLabel>Technology Stack</SectionLabel>
            <h2 style={{ fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 800, color: '#edf2f7', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1rem' }}>
              Tools We Master
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.75 }}>
              Enterprise-grade technologies powering our solutions.
            </p>
          </div>

          <MarqueeRow items={TECH_ROW_1} />
          <MarqueeRow items={TECH_ROW_2} reverse />
        </div>
      </section>

      {/* ── AI AUTOMATION ────────────────────── */}
      <section style={{ background: '#ffffff', padding: 'clamp(4rem,8vw,8rem) 2rem', position: 'relative', overflow: 'hidden' }}>
        <Orb style={{ width:500,height:500,background:'rgba(0,212,255,0.1)',top:-100,left:-100,filter:'blur(120px)',animation:'aiOrb 7s ease-in-out infinite' }} />
        <Orb style={{ width:400,height:400,background:'rgba(139,92,246,0.08)',bottom:-80,right:200,filter:'blur(120px)',animation:'aiOrb 5s ease-in-out infinite 1s reverse' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '4rem', alignItems: 'center', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Globe placeholder (animated visual) */}
          <GlobePlaceholder />

          {/* Text side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <SectionLabel light>AI Automation</SectionLabel>
            <h2 style={{ fontSize: 'clamp(2rem,3.5vw,2.75rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              Automate the Future,<br /><GradientText>Today</GradientText>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {AI_BENEFITS.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, minWidth: 44, borderRadius: 10, flexShrink: 0,
                    background: `${b.color}15`, border: `1px solid ${b.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.color,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>{b.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="#contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 2rem', background: '#0f172a', color: '#ffffff',
              borderRadius: 8, fontWeight: 600, fontSize: '0.875rem',
              width: 'fit-content', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'none'; }}
            >
              Explore AI Services
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── BUILD CTA ────────────────────────── */}
      <section style={{ background: '#030712', padding: 'clamp(4rem,8vw,8rem) 2rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        {/* Top shimmer line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, #00d4ff, #7b2dff, #ff9316, transparent)',
          backgroundSize: '200% 100%', animation: 'buildShimmer 3s linear infinite',
        }} />
        <Orb style={{ width:600,height:600,background:'rgba(0,210,255,0.14)',top:-200,left:-100,filter:'blur(120px)',animation:'orbFloat 5s ease-in-out infinite' }} />
        <Orb style={{ width:500,height:500,background:'rgba(123,45,255,0.11)',bottom:-150,right:-100,filter:'blur(120px)',animation:'orbFloat 4s ease-in-out infinite reverse' }} />
        <Orb style={{ width:400,height:400,background:'rgba(249,115,22,0.09)',top:'50%',left:'50%',transform:'translate(-50%,-50%)',filter:'blur(100px)',animation:'orbFloat 6s ease-in-out infinite' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 9999,
            padding: '0.35rem 1rem', background: 'rgba(0,212,255,0.05)',
          }}>
            Let's Build Together
          </span>
          <h2 style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Your Vision,<br />
            <span style={{ background: 'linear-gradient(135deg,#00d4ff,#7b2dff,#ff9316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Our Execution
            </span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.75, maxWidth: 560 }}>
            From MVP to enterprise-scale — we turn ambitious ideas into market-dominating products. No handoffs, no black boxes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 2rem', background: '#00d4ff', color: '#05070e',
              borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              boxShadow: '0 0 25px rgba(0,212,255,0.35)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#00e5ff'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#00d4ff'; e.currentTarget.style.transform = 'none'; }}
            >
              Start a Project
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            <a href="#stack" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 2rem', background: 'rgba(255,255,255,0.07)',
              color: '#ffffff', borderRadius: '0.75rem', fontWeight: 700,
              fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; }}
            >
              View Tech Stack
            </a>
          </div>
        </div>
      </section>

      {/* ── CAREERS ──────────────────────────── */}
      <section id="careers" style={{ background: '#080d1a', padding: 'clamp(4rem,8vw,8rem) 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem,4vw,2.5rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '5rem' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionLabel>Open Positions</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Build the Future<br />With Us
              </h2>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
                We're a globally distributed team of engineers, designers, and strategists who believe in radical ownership, extreme quality, and shipping fast.
              </p>
              <a href="#contact" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                width: 'fit-content', padding: '0.875rem 2rem',
                border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff',
                borderRadius: 9999, fontSize: '0.875rem', fontWeight: 700,
                transition: 'all 0.2s', background: 'transparent',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
              >
                Send Your CV
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            </div>

            {/* Right — job cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {JOBS.map((job, i) => {
                const c = COLORS[job.color];
                return (
                  <a key={i} href="#contact" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.5rem 1.75rem',
                    background: 'rgba(13,16,32,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                    borderLeft: `3px solid ${c.text}`,
                    borderRadius: '0.75rem', transition: 'all 0.3s ease', textDecoration: 'none',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.background = `${c.bg}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(13,16,32,0.8)'; }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#edf2f7', marginBottom: '0.25rem' }}>{job.title}</h4>
                      <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>{job.meta}</span>
                    </div>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.45)', flexShrink: 0, transition: 'all 0.3s',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────── */}
      <section style={{ background: '#080d1a', padding: 'clamp(4rem,8vw,8rem) 0', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem,4vw,2.5rem)' }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto clamp(3rem,6vw,5rem)' }}>
            <SectionLabel>Proven Track Record</SectionLabel>
            <h2 style={{ fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1rem' }}>
              Trusted by the <GradientText>World's Best</GradientText>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ color: '#f59e0b', fontSize: '1rem' }}>{'★'.repeat(t.stars)}</div>
                <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, flex: 1 }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#00d4ff,#7b2dff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#edf2f7', fontSize: '0.9375rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────── */}
      <section id="contact" style={{ background: '#ffffff', padding: 'clamp(4rem,8vw,8rem) 0', position: 'relative', overflow: 'hidden' }}>
        <Orb style={{ width:400,height:400,background:'rgba(0,212,255,0.06)',top:-100,right:-100,filter:'blur(120px)',animation:'orbFloat 8s ease-in-out infinite' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem,4vw,2.5rem)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto clamp(3rem,6vw,4rem)' }}>
            <SectionLabel light>Contact</SectionLabel>
            <h2 style={{ fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 800, color: '#0a0f1a', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1rem' }}>
              Start Your <GradientText>Project</GradientText>
            </h2>
            <p style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.75 }}>
              Tell us about your idea and we'll get back to you within 24 hours.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '4rem', alignItems: 'start' }}>
            {/* Form */}
            <ContactForm />

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { label: 'Email Us',    value: 'hello@abraxis.solutions', color: 'cyan' },
                { label: 'Call Support', value: '+92 300 1234 567',        color: 'violet' },
                { label: 'Visit Us',    value: 'Lahore, Punjab, Pakistan', color: 'blue' },
              ].map((info, i) => {
                const c = COLORS[info.color];
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    padding: '1.5rem', background: '#f8f9fb',
                    border: '1px solid rgba(0,0,0,0.06)', borderRadius: '1rem',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.border}`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ width:48,height:48,borderRadius:'0.75rem',background:c.bg,border:`1px solid ${c.border}`,display:'flex',alignItems:'center',justifyContent:'center',color:c.text,flexShrink:0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {i===0 && <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}
                        {i===1 && <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>}
                        {i===2 && <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, color: '#0a0f1a', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>{info.label}</h4>
                      <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{info.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer style={{ background: '#000000', padding: '5rem 0 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem,4vw,2.5rem)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '3rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <LogoIcon size={28} />
                <span style={{ fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg,#00d4ff,#7b2dff,#ff2d7c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Abraxis</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 260 }}>
                Intelligent software architecture for ambitious global brands. We build the future of the web.
              </p>
            </div>

            {/* Links */}
            {[
              { title: 'Company', links: ['About Us', 'Careers', 'News & Blog', 'Contact'] },
              { title: 'Services', links: ['Web Development', 'Cloud Tech', 'AI & ML', 'Cybersecurity'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', marginBottom: '1.25rem' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s', display: 'block' }}
                        onMouseEnter={e => e.target.style.color = '#ffffff'}
                        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', marginBottom: '0.75rem' }}>Subscribe</h4>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: '1.25rem' }}>Get the latest insights on tech and software.</p>
              <FooterForm />
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>© 2026 Abraxis Solutions Global. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy Policy', 'Terms of Service'].map(l => (
                <a key={l} href="#" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}
                >{l}</a>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['X', 'GH', 'LI', 'IG'].map(s => (
                <div key={s} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'; e.currentTarget.style.color = '#00d4ff'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.transform = 'none'; }}
                >{s}</div>
              ))}
            </div>
          </div>
        </div>
        {/* Footer bottom glow */}
        <div style={{ position: 'absolute', bottom: -200, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, borderRadius: '50%', background: 'rgba(0,212,255,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      </footer>
    </>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

function ScrollProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setWidth(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, height: 3, width: `${width}%`,
      background: 'linear-gradient(135deg,#00d4ff,#7b2dff,#ff2d7c)',
      zIndex: 10001, transition: 'none', willChange: 'width',
      boxShadow: '0 0 10px rgba(0,212,255,0.5)',
    }} />
  );
}

function Stars() {
  const positions = [
    [8,12],[15,45],[22,78],[35,25],[42,60],[55,88],[60,35],[70,72],[78,15],[85,50],[12,92],[48,5],[30,55],[90,82],[5,35]
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      {positions.map(([top, left], i) => (
        <div key={i} style={{
          position: 'absolute', top: `${top}%`, left: `${left}%`,
          width: i % 3 === 0 ? 1.5 : 2, height: i % 3 === 0 ? 1.5 : 2,
          borderRadius: '50%',
          background: i % 4 === 0 ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.5)',
          animation: `starTwinkle ${2.5 + (i % 4) * 0.5}s ease-in-out infinite`,
          animationDelay: `${(i * 0.3) % 3}s`,
        }} />
      ))}
    </div>
  );
}

function Orb({ style }) {
  return <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(100px)', ...style }} />;
}

function LogoIcon({ size = 36 }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={size} height={size}>
      <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" stroke="url(#lg)" strokeWidth="2" fill="none" />
      <path d="M20 12L28 16V24L20 28L12 24V16L20 12Z" fill="url(#lg)" />
      <defs>
        <linearGradient id="lg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" />
          <stop offset="0.5" stopColor="#7b2dff" />
          <stop offset="1" stopColor="#ff2d7c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HeroBtn({ href, children, primary }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.875rem 2rem', borderRadius: '0.75rem',
    fontWeight: 700, fontSize: '0.875rem',
    textTransform: 'uppercase', letterSpacing: '0.03em',
    transition: 'all 0.2s', cursor: 'pointer', whiteSpace: 'nowrap',
    textDecoration: 'none',
  };
  const s = primary
    ? { ...base, background: '#ffffff', color: '#050810', boxShadow: '0 0 25px rgba(255,255,255,0.15)' }
    : { ...base, background: 'rgba(255,255,255,0.07)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' };

  return (
    <a href={href} style={s}
      onMouseEnter={e => {
        if (primary) { e.currentTarget.style.background='#f0f0f0'; e.currentTarget.style.transform='translateY(-3px)'; }
        else { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.transform='translateY(-3px)'; }
      }}
      onMouseLeave={e => {
        if (primary) { e.currentTarget.style.background='#ffffff'; e.currentTarget.style.transform='none'; }
        else { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='none'; }
      }}
    >
      {children}
    </a>
  );
}

function AboutStatCard({ value, label }) {
  const [count, ref] = useCounter(value);
  return (
    <div ref={ref} style={{
      position: 'relative', padding: '2rem 1.5rem',
      background: '#0d1020', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '1.25rem', overflow: 'hidden', transition: 'all 0.3s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 0 30px rgba(0,212,255,0.2)'; e.currentTarget.style.borderColor='rgba(0,212,255,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}
    >
      <div style={{
        display: 'block', fontWeight: 800, fontSize: '2.75rem', lineHeight: 1.1, marginBottom: '0.35rem',
        background: 'linear-gradient(135deg,#00d4ff,#7b2dff,#ff2d7c)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {count}+
      </div>
      <div style={{ fontSize: '0.7rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

function SolutionCard({ sol, c }) {
  return (
    <div style={{
      position: 'relative', background: 'rgba(13,16,32,0.85)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem',
      overflow: 'hidden', transition: 'all 0.4s ease', display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-8px)'; e.currentTarget.style.borderColor=`rgba(255,45,124,0.3)`; e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow='none'; }}
    >
      {sol.image && (
        <div style={{ position: 'relative', height: 200, overflow: 'hidden', flexShrink: 0 }}>
          <img src={sol.image} alt={sol.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,7,14,0.9), rgba(5,7,14,0.4) 50%, rgba(5,7,14,0.1))' }} />
        </div>
      )}
      <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ width:48,height:48,borderRadius:'0.75rem',background:c.bg,border:`1px solid ${c.border}`,color:c.text,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem',transition:'all 0.3s' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8"/><path d="M12 17v4"/>
          </svg>
        </div>
        <h3 style={{ fontWeight: 700, fontSize: '1.3rem', color: '#edf2f7', marginBottom: '0.5rem' }}>{sol.title}</h3>
        <p style={{ fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.7, flex: 1 }}>{sol.desc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
          {sol.tags.map(tag => (
            <span key={tag} style={{ padding:'0.3rem 0.75rem', fontSize:'0.7rem', fontWeight:600, color:'#cbd5e1', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9999 }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GlobePlaceholder() {
  // Animated SVG globe as a lightweight alternative to Three.js
  return (
    <div style={{ position: 'relative', width: '100%', height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes rotate360 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse2 { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.06)} }
      `}</style>
      <div style={{ position: 'relative', width: 340, height: 340 }}>
        {/* Outer ring */}
        <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:'1px solid rgba(0,180,216,0.2)',animation:'rotate360 20s linear infinite' }} />
        {/* Middle ring */}
        <div style={{ position:'absolute',inset:30,borderRadius:'50%',border:'1px solid rgba(139,92,246,0.2)',animation:'rotate360 15s linear infinite reverse' }} />
        {/* Inner ring */}
        <div style={{ position:'absolute',inset:60,borderRadius:'50%',border:'1px solid rgba(0,212,255,0.3)',animation:'rotate360 10s linear infinite' }} />
        {/* Core */}
        <div style={{
          position:'absolute',inset:100,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,180,216,0.5),rgba(139,92,246,0.3),transparent)',
          animation:'pulse2 4s ease-in-out infinite',
        }} />
        {/* Orbit dots */}
        {[0,60,120,180,240,300].map(deg => (
          <div key={deg} style={{
            position:'absolute',top:'50%',left:'50%',
            width:8,height:8,borderRadius:'50%',
            background:`hsl(${180+deg/2},100%,70%)`,
            boxShadow:`0 0 12px hsl(${180+deg/2},100%,70%)`,
            transform:`rotate(${deg}deg) translateX(150px) translateY(-50%)`,
          }} />
        ))}
        {/* Label */}
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'0.5rem' }}>
          <div style={{ fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(0,180,216,0.8)' }}>AI CORE</div>
          <div style={{ width:2,height:30,background:'rgba(0,180,216,0.4)',borderRadius:2 }} />
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name:'', email:'', company:'', message:'' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name:'', email:'', company:'', message:'' });
  };

  const inputStyle = {
    width:'100%', padding:'0.75rem 1rem', background:'#f8f9fb',
    border:'1px solid rgba(0,0,0,0.1)', borderRadius:'0.75rem',
    color:'#0a0f1a', fontFamily:'inherit', fontSize:'0.9375rem',
    outline:'none', transition:'all 0.2s',
  };

  const labelStyle = { display:'block', fontSize:'0.875rem', fontWeight:500, color:'#374151', marginBottom:'0.5rem' };

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        {[
          { key:'name',   label:'Full Name',   type:'text',  placeholder:'John Smith' },
          { key:'email',  label:'Email',        type:'email', placeholder:'john@company.com' },
        ].map(f => (
          <div key={f.key}>
            <label style={labelStyle}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} required value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor='rgba(0,212,255,0.4)'; e.target.style.boxShadow='0 0 0 3px rgba(0,212,255,0.08)'; }}
              onBlur={e => { e.target.style.borderColor='rgba(0,0,0,0.1)'; e.target.style.boxShadow='none'; }}
            />
          </div>
        ))}
      </div>
      <div>
        <label style={labelStyle}>Company Name</label>
        <input type="text" placeholder="Company Ltd." value={form.company}
          onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor='rgba(0,212,255,0.4)'; e.target.style.boxShadow='0 0 0 3px rgba(0,212,255,0.08)'; }}
          onBlur={e => { e.target.style.borderColor='rgba(0,0,0,0.1)'; e.target.style.boxShadow='none'; }}
        />
      </div>
      <div>
        <label style={labelStyle}>Project Details</label>
        <textarea rows={4} placeholder="Briefly describe your requirements..." required value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          style={{ ...inputStyle, resize:'vertical', minHeight:120 }}
          onFocus={e => { e.target.style.borderColor='rgba(0,212,255,0.4)'; e.target.style.boxShadow='0 0 0 3px rgba(0,212,255,0.08)'; }}
          onBlur={e => { e.target.style.borderColor='rgba(0,0,0,0.1)'; e.target.style.boxShadow='none'; }}
        />
      </div>
      <button type="submit" style={{
        width:'100%', padding:'0.875rem 2rem',
        background: sent ? '#10b981' : '#00d4ff', color: sent ? '#ffffff' : '#05070e',
        borderRadius:'0.75rem', fontWeight:700, fontSize:'0.9375rem',
        border:'none', cursor:'pointer', transition:'all 0.3s',
        boxShadow: sent ? '0 0 20px rgba(16,185,129,0.4)' : '0 0 20px rgba(0,212,255,0.3)',
        display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
      }}
        onMouseEnter={e => { if(!sent) { e.currentTarget.style.background='#00e5ff'; e.currentTarget.style.transform='translateY(-2px)'; }}}
        onMouseLeave={e => { if(!sent) { e.currentTarget.style.background='#00d4ff'; e.currentTarget.style.transform='none'; }}}
      >
        {sent ? '✓ Message Sent!' : 'Send Message'}
        {!sent && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
      </button>
    </form>
  );
}

function FooterForm() {
  const [val, setVal] = useState('');
  const [ok, setOk] = useState(false);
  return (
    <div style={{ display:'flex', gap:'0.5rem' }}>
      <input type="email" placeholder="Email Address" required value={val}
        onChange={e => setVal(e.target.value)}
        style={{ flex:1, padding:'0.65rem 1rem', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'0.75rem', color:'#ffffff', fontSize:'0.875rem', outline:'none', fontFamily:'inherit' }}
      />
      <button onClick={() => { if(val) { setOk(true); setVal(''); setTimeout(()=>setOk(false),3000); }}}
        style={{ width:42,height:42,display:'flex',alignItems:'center',justifyContent:'center',background:'#00d4ff',borderRadius:'0.75rem',color:'#05070e',flexShrink:0,transition:'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background='#00e5ff'}
        onMouseLeave={e => e.currentTarget.style.background='#00d4ff'}
      >
        {ok ? '✓' : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
      </button>
    </div>
  );
}
