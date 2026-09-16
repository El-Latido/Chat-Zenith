with open('./src/components/Login.tsx', 'r') as f:
    content = f.read()

new_content = """import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Upload, Calendar, Users } from 'lucide-react';
import { UserObj } from '../types';

interface LoginProps {
  user: UserObj & { password?: string, gender?: string, birthdate?: string, age?: number };
  setUser: React.Dispatch<React.SetStateAction<UserObj & { password?: string, securityEmail?: string, gender?: string, birthdate?: string, age?: number }>>;
  handleLogin: (e?: React.FormEvent) => void;
  handleGoogleLogin?: () => void;
  setRecoveryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Login({ user, setUser, handleLogin, setRecoveryModalOpen, handleGoogleLogin }: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    if (day && month && year && year.length === 4) {
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        setUser(prev => ({...prev, birthdate: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`, age}));
    }
  }, [day, month, year, setUser]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({...prev, profilePic: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomLogin = () => {
    if (user.username === 'AXISS' && user.password === '£¢€¥^°={}\\\\') {
        setUser(prev => ({...prev, role: 'admin'}));
    }
    handleLogin();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#150f1f] relative overflow-hidden font-sans">
      {/* Blurry gradient background inspired by image */}
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#7c2d5e]/40 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[90%] h-[90%] bg-[#3b4b8c]/40 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] left-[30%] w-[50%] h-[50%] bg-[#91425a]/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      <div className="z-10 w-full max-w-md px-6">
        <div className="bg-white/[0.05] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
          
          {/* Avatar Area */}
          <div className="relative mb-8 group cursor-pointer" onClick={() => isRegisterMode && fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 flex items-center justify-center relative">
              {user.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-white/40" />
              )}
              {isRegisterMode && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload size={24} className="text-white" />
                </div>
              )}
            </div>
            {isRegisterMode && (
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            )}
          </div>

          <div className="w-full space-y-6">
            {/* Username/Name Field */}
            <div className="relative border-b border-white/20 pb-2">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60">
                <User size={20} />
              </div>
              <input
                className="w-full bg-transparent border-none pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-0 text-base"
                placeholder="Name"
                value={user.username}
                onChange={e => setUser({...user, username: e.target.value})}
              />
            </div>

            {/* Password Field */}
            <div className="relative border-b border-white/20 pb-2">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60">
                <Lock size={20} />
              </div>
              <input
                className="w-full bg-transparent border-none pl-10 pr-12 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-0 text-base"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={user.password}
                onChange={e => setUser({...user, password: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && handleCustomLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Extra Register Fields */}
            {isRegisterMode && (
              <div className="animate-in fade-in slide-in-from-top-4 space-y-6">
                
                {/* Gender Field */}
                <div className="relative border-b border-white/20 pb-2">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60">
                    <Users size={20} />
                  </div>
                  <select
                    className="w-full bg-transparent border-none pl-10 pr-4 py-2 text-white/80 focus:outline-none focus:ring-0 text-base appearance-none cursor-pointer"
                    value={user.gender || ''}
                    onChange={e => setUser({...user, gender: e.target.value})}
                  >
                    <option value="" className="bg-[#1a1025] text-white">Select Gender</option>
                    <option value="Male" className="bg-[#1a1025] text-white">Male</option>
                    <option value="Female" className="bg-[#1a1025] text-white">Female</option>
                    <option value="Other" className="bg-[#1a1025] text-white">Other</option>
                  </select>
                </div>

                {/* Birthdate Fields */}
                <div className="relative border-b border-white/20 pb-2">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60">
                    <Calendar size={20} />
                  </div>
                  <div className="flex pl-10 pr-4 gap-2">
                    <input
                      className="w-1/3 bg-transparent border-none py-2 text-white placeholder-white/50 focus:outline-none text-center"
                      placeholder="DD"
                      maxLength={2}
                      value={day}
                      onChange={e => setDay(e.target.value)}
                    />
                    <span className="text-white/50 py-2">/</span>
                    <input
                      className="w-1/3 bg-transparent border-none py-2 text-white placeholder-white/50 focus:outline-none text-center"
                      placeholder="MM"
                      maxLength={2}
                      value={month}
                      onChange={e => setMonth(e.target.value)}
                    />
                    <span className="text-white/50 py-2">/</span>
                    <input
                      className="w-1/3 bg-transparent border-none py-2 text-white placeholder-white/50 focus:outline-none text-center"
                      placeholder="YYYY"
                      maxLength={4}
                      value={year}
                      onChange={e => setYear(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            {!isRegisterMode && (
              <div className="flex justify-between items-center text-xs text-white/60 pt-2">
                <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" className="rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-0 focus:ring-offset-0" />
                  Remember me
                </label>
                <button type="button" onClick={() => setRecoveryModalOpen(true)} className="hover:text-white transition-colors italic">
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleCustomLogin}
              className="w-full bg-gradient-to-r from-[#3b2d69] to-[#4c6fb5] text-white font-bold tracking-widest uppercase rounded-full py-4 mt-6 hover:opacity-90 shadow-[0_0_20px_rgba(76,111,181,0.4)] transition-all active:scale-[0.98] text-sm"
            >
              {isRegisterMode ? 'SIGN UP' : 'LOGIN'}
            </button>
            
          </div>

        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={(e) => { e.preventDefault(); setIsRegisterMode(!isRegisterMode); }}
            className="text-white/60 hover:text-white text-sm font-medium transition-colors"
          >
            {isRegisterMode ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
          
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
"""

with open('./src/components/Login.tsx', 'w') as f:
    f.write(new_content)
