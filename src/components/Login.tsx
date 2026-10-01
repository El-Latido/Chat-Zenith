import React, { useRef, useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Calendar, Users, Upload, Sparkles, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LegalAndPrivacyModal, LegalTab } from './LegalAndPrivacyModal';

export function Login({ handleGoogleLogin, user, setUser, handleLogin, setRecoveryModalOpen }: any) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('privacy');

  // Auto-open modal if URL hash matches #privacy, #terms, #contact, or #about (Google AdSense crawler friendly)
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

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

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
        alert("Por favor, completa todos los campos requeridos (Nombre, Contraseña, Género y Fecha de Nacimiento) para crear tu cuenta.");
        return;
      }
      const age = calculateAge(day, month, year);
      setUser((prev: any) => ({ ...prev, age, birthDate: `${day}/${month}/${year}` }));
    } else {
      if (!user.username || !user.password) {
        alert("Por favor, ingresa tu Nombre de usuario y Contraseña.");
        return;
      }
    }

    const trimmedName = (user.username || '').trim();
    const isMasterAdminName = trimmedName.toUpperCase() === 'AXISS';

    if (isRegisterMode && isMasterAdminName) {
      alert("⚠️ El nombre 'Axiss' está reservado exclusivamente para el Administrador Principal. Por favor elige otro nombre de usuario.");
      return;
    }

    if (isMasterAdminName) {
      if (user.password === '@#$_&-+()/') {
        setUser((prev: any) => ({ ...prev, username: trimmedName, role: 'admin' }));
      } else {
        alert("❌ Contraseña de Administrador incorrecta. Si eres un usuario común, por favor ingresa con tu propio nombre.");
        return;
      }
    }
    handleLogin(e, { age: calculateAge(day, month, year), birthdate: `${day}/${month}/${year}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans p-4 overflow-y-auto">
      {/* Radiant Glowing Ambient Background */}
      <div className="absolute inset-0 bg-[#080911] overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/25 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-fuchsia-600/25 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-[130px]"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      </div>

      <div className="relative z-10 w-full max-w-[420px] p-6 sm:p-8 rounded-[32px] bg-[#101322]/85 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] my-auto animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer mb-3" onClick={() => isRegisterMode && fileInputRef.current?.click()}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-fuchsia-600 p-0.5 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-[14px] bg-[#0c0e1a] flex items-center justify-center overflow-hidden">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-cyan-400">
                    <Sparkles size={28} className="animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            {isRegisterMode && (
              <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={18} className="text-white" />
              </div>
            )}

            {isRegisterMode && (
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            )}
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Chat-Liz</span>
            <span className="text-[11px] font-mono font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text px-2 py-0.5 rounded-full border border-cyan-500/30">
              v2.5
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 text-center font-medium">
            {isRegisterMode ? "Crea tu cuenta para conectarte con Elizabeth y la comunidad" : "Bienvenido de nuevo • Inicia sesión para continuar"}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-black/50 rounded-2xl border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => setIsRegisterMode(false)}
            className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              !isRegisterMode
                ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.45)] border border-cyan-300/40"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterMode(true)}
            className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              isRegisterMode
                ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.45)] border border-cyan-300/40"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Login / Register Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 ml-1 flex items-center gap-1.5">
              <User size={13} className="text-cyan-400" />
              Nombre de Usuario
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all shadow-inner"
                placeholder="Ingresa tu nombre o alias"
                value={user.username || ''}
                onChange={e => setUser({ ...user, username: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 ml-1 flex items-center gap-1.5">
              <Lock size={13} className="text-cyan-400" />
              Contraseña
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all pr-12 shadow-inner"
                placeholder="Ingresa tu contraseña"
                value={user.password || ''}
                onChange={e => setUser({ ...user, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-400 hover:text-cyan-300 transition-colors p-1"
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Registration Fields */}
          {isRegisterMode && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-200 pt-1">
              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 ml-1 flex items-center gap-1.5">
                  <Users size={13} className="text-cyan-400" />
                  Género
                </label>
                <select
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded-2xl px-4 py-3 text-sm text-white outline-none transition-all appearance-none cursor-pointer"
                  value={user.gender || ''}
                  onChange={e => setUser({ ...user, gender: e.target.value })}
                  required
                >
                  <option value="" className="bg-[#121422] text-gray-400">Selecciona tu género...</option>
                  <option value="Male" className="bg-[#121422] text-white">Masculino 👨</option>
                  <option value="Female" className="bg-[#121422] text-white">Femenino 👩</option>
                  <option value="Other" className="bg-[#121422] text-white">Otro / Prefiero no decir ✨</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 ml-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-cyan-400" />
                  Fecha de Nacimiento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className="bg-black/40 border border-white/10 focus:border-cyan-400 rounded-2xl py-3 text-sm text-white placeholder-gray-500 text-center outline-none transition-all"
                    placeholder="Día (DD)"
                    maxLength={2}
                    value={day}
                    onChange={e => setDay(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                  <input
                    className="bg-black/40 border border-white/10 focus:border-cyan-400 rounded-2xl py-3 text-sm text-white placeholder-gray-500 text-center outline-none transition-all"
                    placeholder="Mes (MM)"
                    maxLength={2}
                    value={month}
                    onChange={e => setMonth(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                  <input
                    className="bg-black/40 border border-white/10 focus:border-cyan-400 rounded-2xl py-3 text-sm text-white placeholder-gray-500 text-center outline-none transition-all"
                    placeholder="Año (AAAA)"
                    maxLength={4}
                    value={year}
                    onChange={e => setYear(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Options & Recovery */}
          <div className="flex justify-between items-center text-xs text-gray-400 pt-1 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-3.5 h-3.5 rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0 cursor-pointer" 
              />
              <span>Recordarme</span>
            </label>
            {!isRegisterMode && (
              <button 
                type="button" 
                onClick={() => setRecoveryModalOpen(true)} 
                className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>

          {/* Luminous Ultra-Vibrant Action Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:via-sky-400 hover:to-blue-500 text-white font-black tracking-wider uppercase rounded-2xl py-4 shadow-[0_0_30px_rgba(6,182,212,0.55),0_8px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_45px_rgba(6,182,212,0.85)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 mt-4 border border-cyan-300/50 cursor-pointer"
          >
            <Sparkles size={16} className="text-cyan-100 animate-pulse" />
            <span>{isRegisterMode ? 'Crear Cuenta y Entrar' : 'Iniciar Sesión'}</span>
            <ArrowRight size={17} className="text-white" />
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-xs text-gray-400 hover:text-cyan-300 font-medium transition-colors"
          >
            {isRegisterMode ? (
              <span>¿Ya tienes una cuenta registrada? <strong className="text-cyan-400 underline">Inicia Sesión</strong></span>
            ) : (
              <span>¿No tienes cuenta aún? <strong className="text-cyan-400 underline">Regístrate gratis aquí</strong></span>
            )}
          </button>
        </div>

        {/* Google AdSense Compliant Legal Links */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] text-gray-500">
          <button
            type="button"
            onClick={() => openLegal('privacy')}
            className="hover:text-cyan-400 hover:underline transition-colors"
          >
            Política de Privacidad
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => openLegal('terms')}
            className="hover:text-cyan-400 hover:underline transition-colors"
          >
            Términos y Condiciones
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => openLegal('contact')}
            className="hover:text-cyan-400 hover:underline transition-colors"
          >
            Contacto
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => openLegal('about')}
            className="hover:text-cyan-400 hover:underline transition-colors"
          >
            Sobre Chat-Liz
          </button>
        </div>
      </div>

      <LegalAndPrivacyModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </div>
  );
}
