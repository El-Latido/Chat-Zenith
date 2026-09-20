import React, { useRef, useState, useEffect } from 'react';
import {
  User,
  Lock,
  Calendar,
  Users,
  Upload,
  Shield,
  MessageCircle,
  Video,
  Bot,
  Radio,
  Gamepad2,
  Sparkles,
  Heart,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Mail,
  FileText,
  Info,
  Globe2,
  Bell,
  Eye,
  EyeOff,
  Flame,
  Award,
  ArrowRight
} from 'lucide-react';
import { LegalAndPrivacyModal, LegalTab } from './LegalAndPrivacyModal';

interface WelcomeLandingProps {
  handleGoogleLogin?: any;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  handleLogin: (e?: React.FormEvent, extraData?: any) => void;
  setRecoveryModalOpen: (open: boolean) => void;
}

export function WelcomeLanding({
  handleGoogleLogin,
  user,
  setUser,
  handleLogin,
  setRecoveryModalOpen,
}: WelcomeLandingProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('privacy');

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Sincronizar hash de la URL para indexación de Google AdSense (#privacy, #terms, #contact, #about)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#privacy' || hash === '#privacidad') {
        setLegalTab('privacy');
        setLegalModalOpen(true);
      } else if (hash === '#terms' || hash === '#terminos') {
        setLegalTab('terms');
        setLegalModalOpen(true);
      } else if (hash === '#contact' || hash === '#contacto') {
        setLegalTab('contact');
        setLegalModalOpen(true);
      } else if (hash === '#about' || hash === '#nosotros') {
        setLegalTab('about');
        setLegalModalOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openLegal = (tab: LegalTab) => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUser({ ...user, profilePic: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (d: string, m: string, y: string) => {
    if (!d || !m || !y) return null;
    const birthDate = new Date(`${y}-${m}-${d}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const mDiff = today.getMonth() - birthDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleCustomLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isRegisterMode) {
      if (!user.username || !user.password || !user.gender || !day || !month || !year) {
        alert('Por favor, completa todos los campos (Nombre, Contraseña, Género y Fecha de Nacimiento) para registrarte.');
        return;
      }
      const age = calculateAge(day, month, year);
      setUser((prev: any) => ({ ...prev, age, birthDate: `${day}/${month}/${year}` }));
    } else {
      if (!user.username || !user.password) {
        alert('Por favor, ingresa tu Nombre de Usuario y Contraseña.');
        return;
      }
    }

    const trimmedName = (user.username || '').trim();
    const isMasterAdminName = trimmedName.toLowerCase() === 'axiss';

    if (isRegisterMode && isMasterAdminName) {
      alert("⚠️ El nombre 'AXISS' o 'Axiss' está reservado exclusivamente para el Administrador Principal. Por favor elige otro nombre.");
      return;
    }

    if (isMasterAdminName) {
      if (user.password === '£¢€¥^°={}\\') {
        setUser((prev: any) => ({ ...prev, username: trimmedName, role: 'admin' }));
      } else {
        alert('❌ Contraseña de Administrador incorrecta. Los nombres AXISS y Axiss pertenecen al Administrador Principal.');
        return;
      }
    }
    handleLogin(e, { age: calculateAge(day, month, year), birthdate: `${day}/${month}/${year}` });
  };

  const features = [
    {
      icon: MessageCircle,
      title: 'Salas Globales y Temáticas',
      desc: 'Conéctate en tiempo real con salas públicas y personalizadas, salas por país, intereses y canales privados protegidos.',
      tag: 'Tiempo Real',
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
    },
    {
      icon: Bot,
      title: 'Elizabeth IA Integrada',
      desc: 'Nuestra inteligencia artificial carismática, impulsada por Gemini, lista para responder consultas, filosofar o amenizar la conversación.',
      tag: 'Gemini AI',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
    },
    {
      icon: Video,
      title: 'Friends Webcam en Vivo',
      desc: 'Comparte tu cámara web en directo con amigos de confianza con baja latencia y controles de privacidad integrados.',
      tag: 'WebRTC P2P',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      icon: Gamepad2,
      title: 'Ajedrez Online y Minijuegos',
      desc: 'Desafía a otros miembros a partidas de ajedrez con reloj digital profesional, efectos visuales de tablero y estadísticas de victorias.',
      tag: 'Multijugador',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
    },
    {
      icon: Radio,
      title: 'Radio Comunitaria y Visualizador',
      desc: 'Disfruta de emisoras de música en streaming con sincronización de ondas y ecualizador reactivo mientras chateas.',
      tag: 'Audio Streaming',
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30'
    },
    {
      icon: Heart,
      title: 'LizGram y Perfiles Interactivos',
      desc: 'Muro social para compartir fotos, estados, recibir comentarios y acumular me gustas únicos de otros miembros verificados.',
      tag: 'Social Feed',
      color: 'from-fuchsia-500/20 to-purple-500/20 text-fuchsia-400 border-fuchsia-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0d18] text-gray-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-purple-900/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-cyan-900/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-pink-900/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Header / Navigation Bar */}
      <header className="relative z-20 border-b border-white/10 bg-[#0a0d18]/85 backdrop-blur-md sticky top-0 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <div className="w-full h-full bg-[#0d1020] rounded-[14px] flex items-center justify-center">
              <Sparkles size={20} className="text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              Chat-Liz
              <span className="text-[10px] bg-gradient-to-r from-cyan-400 to-purple-400 text-black font-bold px-1.5 py-0.5 rounded-full uppercase">
                Online
              </span>
            </span>
            <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
              Comunidad Global de Mensajería Interactiva e IA
            </p>
          </div>
        </div>

        {/* Quick Nav Links for Visitors and Search Engine Crawlers */}
        <nav className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <a
            href="#caracteristicas"
            className="text-gray-300 hover:text-cyan-400 transition-colors hidden md:inline-block px-2 py-1"
          >
            Características
          </a>
          <a
            href="#sobre-nosotros"
            className="text-gray-300 hover:text-cyan-400 transition-colors hidden md:inline-block px-2 py-1"
          >
            Sobre Nosotros
          </a>
          <button
            type="button"
            onClick={() => openLegal('privacy')}
            className="text-gray-300 hover:text-cyan-400 transition-colors px-2 py-1"
          >
            Privacidad
          </button>
          <button
            type="button"
            onClick={() => openLegal('terms')}
            className="text-gray-300 hover:text-cyan-400 transition-colors px-2 py-1"
          >
            Términos
          </button>
          <button
            type="button"
            onClick={() => openLegal('contact')}
            className="text-gray-300 hover:text-cyan-400 transition-colors px-2 py-1"
          >
            Contacto
          </button>
          <a
            href="#acceso"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-black px-3.5 py-1.5 rounded-xl shadow-md transition-transform active:scale-95 text-xs"
          >
            {isRegisterMode ? 'Crear Cuenta' : 'Ingresar'}
          </a>
        </nav>
      </header>

      {/* Main Content Area: Hero + Auth Card */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Detailed Description, Value Proposition & Features */}
          <section className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles size={14} className="text-cyan-400" />
                <span>Plataforma Social de Próxima Generación con Inteligencia Artificial</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                Conecta, comparte y descubre en{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Chat-Liz
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
                Bienvenido a <strong>Chat-Liz</strong>, un ecosistema de comunicación en vivo creado para conectar personas de todo el mundo. Disfruta de salas de chat globales y privadas, videollamadas con cámara web, mini-juegos de ajedrez multijugador, radio en vivo y la asistencia continua de <strong>Elizabeth</strong>, una IA conversacional avanzada diseñada para responder preguntas y mantener debates constructivos.
              </p>
            </div>

            {/* Quick Metrics / Community Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-cyan-400 font-black text-lg sm:text-xl">100%</div>
                <div className="text-[11px] text-gray-400 font-medium mt-0.5">En Tiempo Real</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-purple-400 font-black text-lg sm:text-xl">Gemini</div>
                <div className="text-[11px] text-gray-400 font-medium mt-0.5">IA Inteligente</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-emerald-400 font-black text-lg sm:text-xl">Segura</div>
                <div className="text-[11px] text-gray-400 font-medium mt-0.5">Moderación Activa</div>
              </div>
            </div>

            {/* Unique Features Grid */}
            <div id="caracteristicas" className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  Características Principales de Chat-Liz
                </h2>
                <span className="text-xs text-cyan-400 font-semibold hidden sm:inline">Innovación & Entretenimiento</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {features.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all hover:bg-white/[0.05] group"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center border`}>
                          <Icon size={17} />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed About Us Section for Search Engines & Users */}
            <div id="sobre-nosotros" className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe2 size={16} className="text-cyan-400" />
                Compromiso con la Calidad, Seguridad y Libre Expresión
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Chat-Liz fue creado con el objetivo de ofrecer un espacio de encuentro accesible desde cualquier dispositivo, sin barreras complejas. Promovemos el respeto mutuo, la privacidad del usuario y una experiencia enriquecida con tecnología moderna. Nuestra plataforma implementa estándares de moderación de contenido, filtros anti-acoso y protección de datos conforme a las mejores prácticas digitales.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => openLegal('about')}
                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  <span>Conocer más sobre nosotros</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Interactive Login & Register Card */}
          <section id="acceso" className="lg:col-span-5 w-full">
            <div className="w-full p-6 sm:p-8 rounded-3xl bg-[#0f1424]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative">
              
              {/* Card Header & Mode Switch */}
              <div className="text-center mb-6">
                <div className="inline-flex p-1 bg-black/40 rounded-xl border border-white/10 mb-4">
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isRegisterMode
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Registrarse
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !isRegisterMode
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                </div>

                <h2 className="text-xl font-black text-white tracking-tight">
                  {isRegisterMode ? 'Crear tu Cuenta Gratuita' : 'Bienvenido de Nuevo'}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {isRegisterMode
                    ? 'Únete a miles de personas en Chat-Liz en segundos'
                    : 'Ingresa tus credenciales para acceder a tus chats'}
                </p>
              </div>

              {/* 1-Click Google Login Option */}
              {handleGoogleLogin && (
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>

                  <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-white/10" />
                    <span className="px-3 text-[11px] text-gray-400 font-medium">o con tu apodo</span>
                    <div className="flex-1 border-t border-white/10" />
                  </div>
                </div>
              )}

              {/* Traditional Form */}
              <form onSubmit={handleCustomLogin} className="flex flex-col items-center">
                {/* Profile Picture (Register Mode) */}
                <div
                  className="w-20 h-20 mb-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative cursor-pointer group shadow-inner"
                  onClick={() => isRegisterMode && fileInputRef.current?.click()}
                  title={isRegisterMode ? 'Sube tu foto de perfil' : 'Avatar'}
                >
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-white/30 mt-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}

                  {isRegisterMode && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={18} className="text-white" />
                    </div>
                  )}

                  {isRegisterMode && (
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  )}
                </div>

                <div className="w-full space-y-4">
                  {/* Name Input */}
                  <div className="relative bg-black/30 border border-white/10 rounded-xl px-3 py-2 flex items-center focus-within:border-cyan-400 transition-colors">
                    <User size={16} className="text-cyan-400 mr-2.5 shrink-0" />
                    <input
                      className="w-full bg-transparent border-none p-0 text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                      placeholder="Nombre de Usuario (Apodo)"
                      value={user.username || ''}
                      onChange={(e) => setUser({ ...user, username: e.target.value })}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative bg-black/30 border border-white/10 rounded-xl px-3 py-2 flex items-center focus-within:border-cyan-400 transition-colors">
                    <Lock size={16} className="text-cyan-400 mr-2.5 shrink-0" />
                    <input
                      className="w-full bg-transparent border-none p-0 text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña"
                      value={user.password || ''}
                      onChange={(e) => setUser({ ...user, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-white text-xs ml-2"
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>

                  {/* Registration Specific Fields */}
                  {isRegisterMode && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Gender */}
                      <div className="relative bg-black/30 border border-white/10 rounded-xl px-3 py-2 flex items-center focus-within:border-cyan-400 transition-colors">
                        <Users size={16} className="text-cyan-400 mr-2.5 shrink-0" />
                        <select
                          className="w-full bg-transparent border-none p-0 text-white focus:outline-none focus:ring-0 text-sm"
                          value={user.gender || ''}
                          onChange={(e) => setUser({ ...user, gender: e.target.value })}
                        >
                          <option value="" className="bg-[#131728] text-gray-400">
                            Seleccionar Género
                          </option>
                          <option value="Male" className="bg-[#131728] text-white">
                            Hombre (Male)
                          </option>
                          <option value="Female" className="bg-[#131728] text-white">
                            Mujer (Female)
                          </option>
                          <option value="Other" className="bg-[#131728] text-white">
                            Otro / Prefiero no decir
                          </option>
                        </select>
                      </div>

                      {/* Date of Birth */}
                      <div className="relative bg-black/30 border border-white/10 rounded-xl px-3 py-2 flex items-center focus-within:border-cyan-400 transition-colors">
                        <Calendar size={16} className="text-cyan-400 mr-2.5 shrink-0" />
                        <div className="flex w-full items-center gap-1.5 text-sm">
                          <input
                            className="w-1/3 bg-transparent border-none p-0 text-white placeholder-gray-400 focus:outline-none text-center"
                            placeholder="Día"
                            maxLength={2}
                            value={day}
                            onChange={(e) => setDay(e.target.value.replace(/[^0-9]/g, ''))}
                          />
                          <span className="text-gray-500">/</span>
                          <input
                            className="w-1/3 bg-transparent border-none p-0 text-white placeholder-gray-400 focus:outline-none text-center"
                            placeholder="Mes"
                            maxLength={2}
                            value={month}
                            onChange={(e) => setMonth(e.target.value.replace(/[^0-9]/g, ''))}
                          />
                          <span className="text-gray-500">/</span>
                          <input
                            className="w-1/3 bg-transparent border-none p-0 text-white placeholder-gray-400 focus:outline-none text-center"
                            placeholder="Año"
                            maxLength={4}
                            value={year}
                            onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ''))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Options row */}
                  <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-gray-200">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-3.5 h-3.5 rounded bg-black/40 border-white/20 text-cyan-500 focus:ring-0"
                      />
                      <span>Recordarme</span>
                    </label>
                    {!isRegisterMode && (
                      <button
                        type="button"
                        onClick={() => setRecoveryModalOpen(true)}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:opacity-95 text-black font-black tracking-wide rounded-xl py-3 shadow-lg shadow-cyan-500/20 transition-all text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <span>{isRegisterMode ? 'CREAR CUENTA GRATIS' : 'ENTRAR AL CHAT'}</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </form>

              {/* Toggle switch text */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs text-gray-400 hover:text-cyan-300 transition-colors"
                >
                  {isRegisterMode
                    ? '¿Ya tienes una cuenta registrada? Inicia sesión aquí'
                    : '¿Nuevo en Chat-Liz? Crea tu cuenta en 10 segundos'}
                </button>
              </div>

              {/* Notice regarding terms acceptance */}
              <p className="text-[10px] text-gray-500 text-center mt-4 leading-relaxed">
                Al ingresar o registrarte en Chat-Liz, aceptas nuestros{' '}
                <button
                  type="button"
                  onClick={() => openLegal('terms')}
                  className="text-cyan-400 hover:underline"
                >
                  Términos
                </button>{' '}
                y confirmas haber leído nuestra{' '}
                <button
                  type="button"
                  onClick={() => openLegal('privacy')}
                  className="text-cyan-400 hover:underline"
                >
                  Política de Privacidad
                </button>
                .
              </p>
            </div>
          </section>
        </div>

        {/* Dedicated Transparency & Policies Section (On-page readable content for AdSense crawlers) */}
        <section className="mt-16 pt-10 border-t border-white/10 space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="text-cyan-400" size={20} />
              Centro de Transparencia, Políticas y Contacto Oficial
            </h2>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              En Chat-Liz cumplimos con las directrices de Google AdSense y normativas de privacidad vigentes. Ponemos a tu disposición toda la documentación legal de forma pública y accesible antes de iniciar sesión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Privacy Card */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-2">
                <Shield size={16} />
                <span>Política de Privacidad</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                Información transparente sobre el uso de cookies, identificadores de Google AdSense, almacenamiento local y salvaguarda de datos personales sin cesión a terceros no autorizados.
              </p>
              <button
                type="button"
                onClick={() => openLegal('privacy')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Leer Política Completa</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Terms Card */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-2">
                <FileText size={16} />
                <span>Términos de Servicio</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                Reglas comunitarias de convivencia, prohibición explícita de spam, acoso y contenido ilícito, garantizando un entorno amigable y respetuoso para todos los participantes.
              </p>
              <button
                type="button"
                onClick={() => openLegal('terms')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Ver Términos y Condiciones</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Contact Card */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-pink-500/30 transition-all">
              <div className="flex items-center gap-2 text-pink-400 text-xs font-bold mb-2">
                <Mail size={16} />
                <span>Atención y Soporte</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                Canal directo de contacto con el equipo de administración de Chat-Liz: <strong>fabiangamer587@gmail.com</strong> para reportes, consultas de derechos ARCO o asistencia técnica.
              </p>
              <button
                type="button"
                onClick={() => openLegal('contact')}
                className="text-xs text-pink-400 hover:text-pink-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Información de Contacto</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Semantic Footer with Direct Legal Links */}
      <footer className="relative z-20 border-t border-white/10 bg-[#080a13] px-4 sm:px-8 py-6 text-xs text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-200">Chat-Liz © {new Date().getFullYear()} — Todos los derechos reservados.</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Plataforma de comunicación social en tiempo real y asistencia con Inteligencia Artificial.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => openLegal('privacy')}
              className="hover:text-cyan-400 transition-colors"
            >
              Política de Privacidad
            </button>
            <span className="text-gray-700">•</span>
            <button
              type="button"
              onClick={() => openLegal('terms')}
              className="hover:text-cyan-400 transition-colors"
            >
              Términos de Servicio
            </button>
            <span className="text-gray-700">•</span>
            <button
              type="button"
              onClick={() => openLegal('contact')}
              className="hover:text-cyan-400 transition-colors"
            >
              Contacto Oficial
            </button>
            <span className="text-gray-700">•</span>
            <button
              type="button"
              onClick={() => openLegal('about')}
              className="hover:text-cyan-400 transition-colors"
            >
              Sobre Chat-Liz
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modal for full detailed legal documents */}
      <LegalAndPrivacyModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </div>
  );
}
