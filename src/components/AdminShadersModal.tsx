import React, { useState, useEffect } from "react";
import { X, Layers, Save, Eye } from "lucide-react";

interface AdminShadersModalProps {
  setOpen: (val: boolean) => void;
  currentShaders: string[];
  onSave: (shaders: string[]) => void;
  onPreview: (shaders: string[]) => void;
}

export function AdminShadersModal({ setOpen, currentShaders, onSave, onPreview }: AdminShadersModalProps) {
  const [selectedShaders, setSelectedShaders] = useState<string[]>(currentShaders || []);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    onPreview(selectedShaders);
  }, [selectedShaders, onPreview]);

  const toggleShader = (shader: string) => {
    setSelectedShaders(prev => 
      prev.includes(shader) ? prev.filter(s => s !== shader) : [...prev, shader]
    );
  };

  const SHADERS = [
    { id: "shader-crt", name: "CRT Monitor", desc: "Añade líneas de escaneo estilo TV antigua" },
    { id: "shader-scanlines", name: "Líneas de Escaneo", desc: "Patrón de rayas horizontales tenues" },
    { id: "shader-vignette", name: "Viñeta Oscura", desc: "Bordes oscurecidos para mayor enfoque central" },
    { id: "shader-glow", name: "Resplandor (Glow)", desc: "Brillo en textos y elementos (puede ser intenso)" },
    { id: "shader-chromatic", name: "Aberración Cromática", desc: "Efecto 3D / desalineación de colores en texto" },
    { id: "shader-pixelate", name: "Pixelado Retro", desc: "Aumenta contraste y saturación con pixelado" },
    { id: "grayscale", name: "Escala de Grises", desc: "Convierte todo a blanco y negro" },
    { id: "sepia", name: "Sepia Vintage", desc: "Tono amarillento antiguo" },
    { id: "invert", name: "Colores Invertidos", desc: "Invierte todos los colores de la pantalla" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-[#0f111a] rounded-[32px] w-full max-w-lg shadow-2xl relative overflow-hidden border border-white/10">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-center gap-3">
            <Layers className="text-cyan-400" size={24} />
            <h2 className="text-xl font-bold text-white">Configurar Shaders Globales</h2>
          </div>
          <button onClick={() => {
            onPreview(currentShaders); // restore original
            setOpen(false);
          }} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
           <p className="text-sm text-gray-400 mb-4">
             Selecciona uno o combina varios shaders. Todos los usuarios verán estos efectos. Estás en modo <b>Vista Previa</b>.
           </p>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SHADERS.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => toggleShader(s.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all flex flex-col gap-1
                    ${selectedShaders.includes(s.id) 
                      ? 'bg-cyan-500/20 border-cyan-400 text-white' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'}`}
                >
                  <span className="font-bold text-sm">{s.name}</span>
                  <span className="text-xs opacity-70">{s.desc}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-black/20 flex gap-3">
           <button 
             onClick={() => {
               onPreview(currentShaders);
               setOpen(false);
             }}
             className="flex-1 py-3 rounded-xl font-bold transition-colors bg-white/10 text-white hover:bg-white/20"
           >
             Cancelar
           </button>
           <button 
             onClick={() => {
               onSave(selectedShaders);
               setOpen(false);
             }}
             className="flex-1 py-3 rounded-xl font-bold transition-colors bg-cyan-600 text-white hover:bg-cyan-500 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
           >
             <Save size={18} />
             Aplicar a Todos
           </button>
        </div>
      </div>
    </div>
  );
}
