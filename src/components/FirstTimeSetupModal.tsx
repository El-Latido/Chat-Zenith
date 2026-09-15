import React, { useState } from 'react';
import { UserObj } from '../types';
import { Check } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface FirstTimeSetupModalProps {
  user: UserObj;
  onComplete: (data: any) => void;
}

export function FirstTimeSetupModal({ user, onComplete }: FirstTimeSetupModalProps) {
  const [formData, setFormData] = useState({
    statusMessage: user.statusMessage || '',
    gender: user.gender || '',
    mood: user.mood || '',
    countryLanguage: user.countryLanguage || 'es',
    is_friends_public: user.is_friends_public ?? true
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
       await setDoc(doc(db, "users", user.username!), {
          statusMessage: formData.statusMessage,
          pais_idioma: formData.countryLanguage,
          is_friends_public: formData.is_friends_public,
          gender: formData.gender,
          mood: formData.mood,
          updatedAt: new Date()
       }, { merge: true });
       onComplete(formData);
    } catch (error) {
       console.error("Error saving first time setup:", error);
       onComplete(formData); // proceed anyway
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-[#111116] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 text-center border-b border-white/10">
          <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido a ChatLiz!</h2>
          <p className="text-sm text-gray-400">Configura tu perfil para empezar a chatear.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">Estado / Biografía</label>
            <input 
              type="text"
              required
              className="w-full bg-black/30 p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="¿Qué estás pensando?"
              value={formData.statusMessage}
              onChange={e => setFormData({...formData, statusMessage: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">Género</label>
            <select 
              required
              className="w-full bg-black/30 p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
            >
              <option value="">Selecciona tu género...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="No Binario">No Binario</option>
              <option value="Prefiero no decirlo">Prefiero no decirlo</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">Estado de ánimo</label>
            <select 
              required
              className="w-full bg-black/30 p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              value={formData.mood}
              onChange={e => setFormData({...formData, mood: e.target.value})}
            >
              <option value="">¿Cómo te sientes?</option>
              <option value="Feliz">Feliz 😄</option>
              <option value="Tranquilo">Tranquilo 😌</option>
              <option value="Emocionado">Emocionado 🤩</option>
              <option value="Triste">Triste 😢</option>
              <option value="Enojado">Enojado 😡</option>
              <option value="Aburrido">Aburrido 🥱</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">Idioma / Región</label>
            <select 
              className="w-full bg-black/30 p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              value={formData.countryLanguage}
              onChange={e => setFormData({...formData, countryLanguage: e.target.value})}
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
              <option value="fr">Francés</option>
              <option value="de">Alemán</option>
              <option value="it">Italiano</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="is_friends_public"
              className="w-5 h-5 accent-cyan-500 cursor-pointer"
              checked={formData.is_friends_public}
              onChange={e => setFormData({...formData, is_friends_public: e.target.checked})}
            />
            <label htmlFor="is_friends_public" className="text-sm text-gray-300 cursor-pointer">
              Permitir que otros vean mi lista de amigos
            </label>
          </div>

          <button 
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Check size={20} /> Entrar a ChatLiz
          </button>
        </form>
      </div>
    </div>
  );
}
