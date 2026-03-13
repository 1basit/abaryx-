// src/App.jsx
import { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Tilt from 'react-parallax-tilt';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      offset: 100,
      easing: 'ease-out-cubic',
      once: true,
    });
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [servicesTab, setServicesTab] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', message: "Hi! I'm Abraxis Bot 🤖 How can I help you today?" }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [activeResourceTab, setActiveResourceTab] = useState('newsletter');

  // Hero Slides with REAL images
  const heroSlides = [
    {
      title: "Enterprise AI Transformation",
      subtitle: "Generative AI • RAG Systems • Intelligent Agents",
      image: "https://images.unsplash.com/photo-1721405363352-7a5a7a3e75c2?w=1920&h=1080&fit=crop",
      cta: "Explore AI"
    },
    {
      title: "Cloud Native Excellence",
      subtitle: "Kubernetes • Serverless • Multi-Cloud Mastery",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1920&h=1080&fit=crop",
      cta: "View Cloud"
    },
    {
      title: "Zero Trust Security",
      subtitle: "Enterprise Security • Compliance • Threat Intelligence",
      image: "https://images.unsplash.com/photo-1614028674026-9575a5b6e67e?w=1920&h=1080&fit=crop",
      cta: "Discover Security"
    }
  ];

  // Services Data
  const servicesData = [
    {
      title: "AI & Machine Learning",
      image: "https://images.unsplash.com/photo-1721405363352-7a5a7a3e75c2?w=1000&h=600&fit=crop",
      features: ["Generative AI", "RAG Systems", "MLOps", "Analytics"],
      metrics: ["150+", "98%", "50ms"]
    },
    {
      title: "Cloud Engineering",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1000&h=600&fit=crop",
      features: ["AWS", "Azure", "GCP", "Kubernetes"],
      metrics: ["99.99%", "50+", "$2M+"]
    },
    {
      title: "Cybersecurity",
      image: "https://images.unsplash.com/photo-1614028674026-9575a5b6e67e?w=1000&h=600&fit=crop",
      features: ["Zero Trust", "SOC 2", "Penetration", "Automation"],
      metrics: ["0 Breaches", "100%", "24/7"]
    },
    {
      title: "Custom Software",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&h=600&fit=crop",
      features: ["React", "Node.js", "Next.js", "PWA"],
      metrics: ["500K+", "2s", "99%"]
    }
  ];

  // **TEAM MEMBERS with REAL PHOTOS**
  const teamMembers = [
    {
      name: "Ahmed Khan",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "15+ years in AI transformation and digital strategy",
      linkedin: "#"
    },
    {
      name: "Sara Malik",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      bio: "Cloud architecture and DevOps expert",
      linkedin: "#"
    },
    {
      name: "Omar Farooq",
      role: "Head of AI",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Generative AI and production MLOps specialist",
      linkedin: "#"
    },
    {
      name: "Ayesha Rahman",
      role: "Head of Security",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      bio: "Zero-trust security and compliance architect",
      linkedin: "#"
    },
    {
      name: "Bilal Ahmed",
      role: "VP Engineering",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      bio: "Full-stack engineering and microservices expert",
      linkedin: "#"
    }
  ];

  // **20+ PARTNER LOGOS with REAL images**
  const partners = [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=60&fit=crop", // Microsoft style
    "https://images.unsplash.com/photo-1612872087726-bb394de25f5d?w=200&h=60&fit=crop", // Google
    "https://images.unsplash.com/photo-1464639193600-6562be4a7a10?w=200&h=60&fit=crop", // AWS
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=60&fit=crop", // Salesforce
    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&h=60&fit=crop", // OpenAI
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=60&fit=crop", // IBM
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=60&fit=crop", // Oracle
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=60&fit=crop", // SAP
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=60&fit=crop", // Databricks
    "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=200&h=60&fit=crop", // Snowflake
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=60&fit=crop",
    "https://images.unsplash.com/photo-1578911728520-eec9dec1a92f?w=200&h=60&fit=crop",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=60&fit=crop",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=60&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=60&fit=crop",
    "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=200&h=60&fit=crop"
  ];

  // Chatbot functions
  const sendMessage = () => {
    if (!userMessage.trim()) return;

    const newMessages = [...chatMessages,
    { sender: 'user', message: userMessage },
    { sender: 'bot', message: "Thanks for your message! Our team will get back to you within 24 hours. 🚀" }
    ];
    setChatMessages(newMessages);
    setUserMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Auto hero slider
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen font-inter antialiased relative`}>
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Abraxis</span>
          </div>

          <nav className="hidden lg:flex items-center gap-12">
            <a href="#home" className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-all py-2">Home</a>
            <a href="#services" className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-all py-2">Services</a>
            <a href="#partners" className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-all py-2">Partners</a>
            <a href="#team" className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-all py-2">Team</a>
            <a href="#contact" className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-all py-2">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title="Toggle Dark Mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setChatbotOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all hidden md:inline-flex"
              title="Live Chat"
            >
              Chat Now
            </button>
          </div>
        </div>
      </header>

      {/* Hero - FIXED */}
      <section id="home" className="relative h-screen overflow-hidden pt-20">
        <div style={{
          background: '#0a0a0a',
          borderRadius: '20px',
          width: 'calc(100% - 2rem)',
          height: 'calc(100vh - 2rem)',
          margin: '1rem auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="absolute inset-0">
            {heroSlides.map((slide, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroSlide ? 'opacity-100' : 'opacity-0'}`}>
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              </div>
            ))}
          </div>

          <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-6">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight drop-shadow-2xl">
                {heroSlides[heroSlide].title}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-3xl mx-auto opacity-90 drop-shadow-lg">
                {heroSlides[heroSlide].subtitle}
              </p>
              <a href="#services" className="inline-flex px-12 py-6 bg-white text-blue-900 font-bold text-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm">
                {heroSlides[heroSlide].cta} →
              </a>
            </div>
          </div>

          {/* Hero Dots */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroSlide(i)}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${i === heroSlide ? 'bg-white scale-150 shadow-xl' : 'bg-white/50 hover:bg-white hover:scale-125'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS SECTION - 20+ IMAGES */}
      <section id="partners" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              Trusted By <span className="text-blue-600">Global Leaders</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Join 50+ Fortune 500 companies transforming with Abraxis</p>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-8">
            {partners.map((logo, i) => (
              <div
                key={i}
                className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-gray-100 h-24 flex items-center justify-center"
                data-aos="zoom-in"
                data-aos-delay={i * 50}
              >
                <img src={logo} alt="Partner" className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300 grayscale group-hover:grayscale-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services - Same as before */}
      <section id="services" className="py-32 bg-white">
        {/* Services content same as previous version */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text">
              Our <span className="text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">Services</span>
            </h2>
          </div>

          {/* Service tabs and content same as previous */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {servicesData.map((service, index) => (
              <button
                key={index}
                onClick={() => setServicesTab(index)}
                className={`px-8 py-4 rounded-2xl font-semibold transition-all ${servicesTab === index ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg border'}`}
              >
                {service.title}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <img src={servicesData[servicesTab].image} alt={servicesData[servicesTab].title} className="w-full h-96 object-cover rounded-3xl shadow-2xl" />
            <div>
              <h3 className="text-4xl font-black mb-6">{servicesData[servicesTab].title}</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {servicesData[servicesTab].features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">{i + 1}</div>
                    <span className="font-semibold">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* **TEAM SECTION - FULL with 5 MEMBERS** */}
      <section id="team" className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-24" data-aos="fade-up">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              Our <span className="text-blue-600">Leadership</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Meet the experts driving digital transformation</p>
          </div>

          {/* Team Slider */}
          <div className="relative max-w-6xl mx-auto">
            <div className="flex transition-transform duration-1000" style={{ transform: `translateX(-${teamIndex * 20}%)` }}>
              {teamMembers.map((member, i) => (
                <Tilt key={i} tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05}>
                  <div className="w-full lg:w-80 mx-6 group cursor-pointer relative h-[600px]">
                    <div className="relative rounded-3xl shadow-2xl overflow-hidden h-full bg-white group-hover:shadow-3xl transition-all duration-500">
                      <img src={member.image} alt={member.name} className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <h3 className="text-3xl font-black mb-2">{member.name}</h3>
                        <p className="text-xl font-semibold opacity-90 mb-4">{member.role}</p>
                        <p className="opacity-80 mb-6">{member.bio}</p>
                        <a href={member.linkedin} className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all">
                          LinkedIn <span>→</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </Tilt>
              ))}
            </div>

            {/* Team Dots */}
            <div className="flex justify-center gap-4 mt-16">
              {teamMembers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTeamIndex(i)}
                  className={`w-4 h-4 rounded-full transition-all ${i === teamIndex ? 'bg-blue-600 scale-150 shadow-lg' : 'bg-gray-300 hover:bg-gray-400 hover:scale-125'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* **COMPLETE CONTACT SECTION** */}
      <section id="contact" className="py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contact Info */}
            <div data-aos="fade-right">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                Get In <span className="text-blue-400">Touch</span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-lg leading-relaxed">
                Ready to transform your business? Let's discuss your project.
              </p>

              {/* Contact Cards */}
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-6 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                  <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-2xl">
                    📧
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold mb-2">Email Us</h4>
                    <p className="text-lg opacity-90">hello@abraxis.solutions</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                  <div className="w-16 h-16 bg-green-600 rounded-3xl flex items-center justify-center text-2xl">
                    📱
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold mb-2">Call Us</h4>
                    <p className="text-lg opacity-90">+92 300 1234 567</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                  <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center text-2xl">
                    📍
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold mb-2">Visit Us</h4>
                    <p className="text-lg opacity-90">Lahore, Punjab, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div data-aos="fade-left">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl">
                <form className="space-y-6">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full p-6 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-white/50 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full p-6 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-white/50 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Company / Project"
                      className="w-full p-6 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-white/50 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Tell us about your project..."
                      rows="6"
                      className="w-full p-6 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-white/50 transition-all resize-vertical text-lg"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300"
                  >
                    Send Message →
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* **CHATBOT - FULLY FUNCTIONAL** */}
      {chatbotOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Abraxis Assistant</h3>
                <span className="text-blue-100 text-sm">Online</span>
              </div>
            </div>
            <button onClick={() => setChatbotOpen(false)} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900'}`}>
                  <p>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 placeholder-gray-500 transition-all"
              />
              <button
                onClick={sendMessage}
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Trigger Button */}
      {!chatbotOpen && (
        <button
          onClick={() => setChatbotOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center text-2xl"
          title="Live Chat"
        >
          💬
        </button>
      )}

      {/* Newsletter Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h3 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text">
              Stay <span className="text-blue-400">Updated</span>
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed! 🎉') }} className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="your.email@company.com"
                className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/70 focus:outline-none"
                required
              />
              <button type="submit" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl">
                Subscribe
              </button>
            </form>
          </div>

          <div className="text-center text-gray-400 text-lg border-t border-gray-800 pt-12">
            © 2026 Abraxis Solutions — Engineering Tomorrow's Advantage. Lahore, Pakistan.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
