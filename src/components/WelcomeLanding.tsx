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
  Info
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

  // Handle URL hashes for Google AdSense crawlers and direct access
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

  return (
    <div className="min-h-screen bg-[#0d101d] text-gray-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-purple-900/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-cyan-900/20 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-pink-900/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-white/10 bg-[#0d101d]/80 backdrop-blur-md sticky top-0 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.35)]">
            <div className="w-full h-full bg-[#0f1322] rounded-[14px] flex items-center justify-center">
              <Sparkles size={20} className="text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              Chat-Liz
              <span className="text-[10px] bg-gradient-to-r from-cyan-400 to-purple-400 text-black font-bold px-1.5 py-0.5 rounded-full uppercase">
                En Vivo
              </span>
            </span>
            <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
              Comunidad Global de Mensajería Interactiva e IA
            </p>
          </div>
        </div>

        {/* Quick Nav Links for AdSense crawlers and user guidance */}
        <nav className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <a
            href="#caracteristicas"
            className="text-gray-300 hover:text-cyan-400 transition-colors hidden md:inline-block px-2 py-1"
          >
            Características
          </a>
          <a
            href="#comunidad"
            className="text-gray-300 hover:text-cyan-400 transition-colors hidden md:inline-block px-2 py-1"
          >
            Comunidad
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
          <a
            href="#acceso"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-black px-3.5 py-1.5 rounded-xl shadow-md transition-transform active:scale-95 text-xs"
          >
            {isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}
          </a>
        </nav>
      </header>

      {/* Main Content Area: Split layout with Hero + Value Content on Left, Interactive Auth on Right */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Valuable Content, Detailed Description & Features (Ensures Google AdSense has substantial content to index) */}
          <section className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles size={14} />
                <span>Plataforma Social en Tiempo Real con Inteligencia Artificial</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                Conecta, chatea y comparte en{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Chat-Liz
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
                Bienvenido a <strong>Chat-Liz</strong>, un ecosistema de comunicación en vivo diseñado para unir a personas de todo el mundo mediante salas de chat temáticas, amigos en tiempo real, videollamadas con webcam y agentes de Inteligencia Artificial como Elizabeth. Disfruta de un entorno seguro, interactivo, libre de spam y enriquecido con mini-juegos y radio comunitaria.
              </p>
            </div>

            {/* Unique Features Grid */}
            <div id="caracteristicas" className="pt-2">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Características Principales de Chat-Liz
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5">
                    <MessageCircle size={18} />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">Salas Globales y Privadas</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Comunícate instantáneamente en la sala global o crea tus propias salas temáticas privadas con fondos personalizados y control de acceso.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5">
                    <Bot size={18} />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">Asistente IA Elizabeth</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Conversa con personajes de Inteligencia Artificial con personalidades configuradas para responder preguntas, contar historias y debatir.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-pink-500/40 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-2.5">
                    <Video size={18} />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">Webcam Friends para Todos</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Transmite tu cámara en vivo y mantén videollamadas fluidas con amigos en la comunidad sin instalaciones externas ni complicaciones.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
                    <Radio size={18} />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">Radio Global & Visualizador</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Sintoniza emisoras de radio en streaming con efectos reactivos de audio para ambientar tus conversaciones con buena música.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5">
                    <Gamepad2 size={18} />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">Ajedrez Social y Minijuegos</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Desafía a otros usuarios en partidas de ajedrez en tiempo real con reloj digital o juega contra la inteligencia artificial.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/40 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2.5">
                    <Heart size={18} />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">LizGram & Perfiles Únicos</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Comparte publicaciones, fotos e historias. Concede un Me Gusta o corazón único por perfil y recibe notificaciones instantáneas.
                  </p>
                </div>
              </div>
            </div>

            {/* Community & Safety Section */}
            <div id="comunidad" className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield size={16} className="text-cyan-400" />
                Seguridad, Moderación y Confianza Comunitaria
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                En <strong>Chat-Liz</strong> aplicamos políticas estrictas contra el acoso, la discriminación y el contenido no deseado. Los usuarios pueden personalizar su perfil, bloquear contactos y comunicarse con moderadores las 24 horas del día. Toda la información se procesa conforme a nuestra Política de Privacidad y Términos de Servicio.
              </p>
            </div>
          </section>

          {/* RIGHT: Login & Registration Card */}
          <section id="acceso" className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#131728]/90 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.7)] relative">
              
              {/* Tab Selector */}
              <div className="flex bg-black/40 p-1 rounded-2xl mb-6 border border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    isRegisterMode
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Crear Cuenta (Registro)
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    !isRegisterMode
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Iniciar Sesión
                </button>
              </div>

              <form onSubmit={handleCustomLogin} className="flex flex-col items-center">
                {/* Avatar Upload (for register mode) */}
                <div
                  className="w-20 h-20 mb-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative cursor-pointer group shadow-inner"
                  onClick={() => isRegisterMode && fileInputRef.current?.click()}
                  title={isRegisterMode ? 'Subir Foto de Perfil' : 'Avatar'}
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
      </main>

      {/* Footer Section with Detailed Legal Links for Google AdSense Crawler & User Transparency */}
      <footer className="relative z-20 border-t border-white/10 bg-[#0a0d17] px-4 sm:px-8 py-6 text-xs text-gray-400">
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

      {/* Legal and Privacy Modal */}
      <LegalAndPrivacyModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </div>
  );
}
