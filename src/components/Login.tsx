import React, { useRef, useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, Calendar, Users, Upload } from 'lucide-react';

export function Login({ handleGoogleLogin, user, setUser, handleLogin, setRecoveryModalOpen }: any) {
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        alert("Por favor, completa todos los campos (Name, Password, Gender, Date of Birth) para registrarte.");
        return;
      }
      const age = calculateAge(day, month, year);
      setUser(prev => ({ ...prev, age, birthDate: `${day}/${month}/${year}` }));
    } else {
      if (!user.username || !user.password) {
        alert("Por favor, ingresa tu Name y Password.");
        return;
      }
    }

    const trimmedName = (user.username || '').trim();
    const isMasterAdminName = trimmedName === 'AXISS' || trimmedName === 'Axiss';

    if (isRegisterMode && isMasterAdminName) {
      alert("⚠️ Los nombres 'AXISS' y 'Axiss' están reservados exclusivamente para el Administrador Principal. Por favor agrega otro carácter o elige un nombre diferente.");
      return;
    }

    if (isMasterAdminName) {
      if (user.password === '£¢€¥^°={}\\') {
        setUser(prev => ({...prev, username: trimmedName, role: 'admin'}));
      } else {
        alert("❌ Contraseña de Administrador incorrecta. Los nombres AXISS y Axiss pertenecen al Administrador Principal. Si eres un usuario, por favor agrega otro carácter a tu nombre.");
        return;
      }
    }
    handleLogin(e, { age: calculateAge(day, month, year), birthdate: `${day}/${month}/${year}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
      {/* Background with blur blobs mimicking the image */}
      <div className="absolute inset-0 bg-[#161224] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#5e2b45] via-transparent to-transparent opacity-80 mix-blend-screen blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#3a4b85] via-transparent to-transparent opacity-80 mix-blend-screen blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-[360px] p-8 rounded-[32px] bg-white/10 backdrop-blur-2xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <form onSubmit={handleCustomLogin} className="flex flex-col items-center">
          
          {/* Avatar */}
          <div 
            className="w-24 h-24 mb-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden relative cursor-pointer group"
            onClick={() => isRegisterMode && fileInputRef.current?.click()}
          >
            {user.profilePic ? (
              <img src={user.profilePic} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-16 h-16 text-white/30 mt-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
            
            {isRegisterMode && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={20} className="text-white" />
              </div>
            )}
            
            {isRegisterMode && (
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            )}
          </div>

          <div className="w-full space-y-6">
            {/* Name Input (Replaces Email ID) */}
            <div className="relative border-b border-white/40 pb-1 flex items-center">
              <User size={16} className="text-white mr-3" />
              <input
                className="w-full bg-transparent border-none p-0 text-white placeholder-white focus:outline-none focus:ring-0 text-sm"
                placeholder="Name"
                value={user.username || ''}
                onChange={e => setUser({...user, username: e.target.value})}
              />
            </div>

            {/* Password Input */}
            <div className="relative border-b border-white/40 pb-1 flex items-center">
              <Lock size={16} className="text-white mr-3" />
              <input
                className="w-full bg-transparent border-none p-0 text-white placeholder-white focus:outline-none focus:ring-0 text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={user.password || ''}
                onChange={e => setUser({...user, password: e.target.value})}
              />
            </div>

            {/* Registration Fields */}
            {isRegisterMode && (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-6 pt-2">
                {/* Gender */}
                <div className="relative border-b border-white/40 pb-1 flex items-center">
                  <Users size={16} className="text-white mr-3" />
                  <select
                    className="w-full bg-transparent border-none p-0 text-white focus:outline-none focus:ring-0 text-sm appearance-none"
                    value={user.gender || ''}
                    onChange={e => setUser({...user, gender: e.target.value})}
                  >
                    <option value="" className="text-black">Gender</option>
                    <option value="Male" className="text-black">Male</option>
                    <option value="Female" className="text-black">Female</option>
                    <option value="Other" className="text-black">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="relative border-b border-white/40 pb-1 flex items-center">
                  <Calendar size={16} className="text-white mr-3" />
                  <div className="flex w-full gap-2 text-sm">
                    <input
                      className="w-1/3 bg-transparent border-none p-0 text-white placeholder-white focus:outline-none text-center"
                      placeholder="DD"
                      maxLength={2}
                      value={day}
                      onChange={e => setDay(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                    <span className="text-white">/</span>
                    <input
                      className="w-1/3 bg-transparent border-none p-0 text-white placeholder-white focus:outline-none text-center"
                      placeholder="MM"
                      maxLength={2}
                      value={month}
                      onChange={e => setMonth(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                    <span className="text-white">/</span>
                    <input
                      className="w-1/3 bg-transparent border-none p-0 text-white placeholder-white focus:outline-none text-center"
                      placeholder="YYYY"
                      maxLength={4}
                      value={year}
                      onChange={e => setYear(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Footer */}
            <div className="flex justify-between items-center text-[11px] text-white/80 pt-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3 h-3 rounded-sm bg-transparent border-white/40 focus:ring-0" />
                Remember me
              </label>
              {!isRegisterMode && (
                <button type="button" onClick={() => setRecoveryModalOpen(true)} className="italic hover:text-white">
                  Forgot Password?
                </button>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#6e2c4f] to-[#435bb1] text-white font-semibold tracking-wider rounded-xl py-3 mt-4 hover:opacity-90 shadow-lg transition-opacity text-sm uppercase"
            >
              {isRegisterMode ? 'REGISTER' : 'LOGIN'}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={(e) => { e.preventDefault(); setIsRegisterMode(!isRegisterMode); }}
            className="text-white/60 hover:text-white text-[11px] font-medium transition-colors"
          >
            {isRegisterMode ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
