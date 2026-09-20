import React, { useState } from 'react';
import { X, Shield, FileText, Mail, Info, Check, ExternalLink, MessageCircle } from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'contact' | 'about';

interface LegalAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export function LegalAndPrivacyModal({ isOpen, onClose, initialTab = 'privacy' }: LegalAndPrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('fabiangamer587@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[350] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn font-sans">
      <div 
        className="relative w-full max-w-3xl bg-[#0e111a] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-purple-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold text-base sm:text-lg leading-tight">
                Centro Legal, Privacidad y Soporte
              </h2>
              <p className="text-white/50 text-xs">Chat-Liz • https://chatliz-online-chatliz.hf.space/</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-black/40 overflow-x-auto scrollbar-none px-3 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400'
                : 'text-white/60 hover:text-white border-transparent hover:bg-white/5'
            }`}
          >
            <Shield size={16} />
            Política de Privacidad
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400'
                : 'text-white/60 hover:text-white border-transparent hover:bg-white/5'
            }`}
          >
            <FileText size={16} />
            Términos y Condiciones
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400'
                : 'text-white/60 hover:text-white border-transparent hover:bg-white/5'
            }`}
          >
            <Info size={16} />
            Sobre Chat-Liz
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'contact'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400'
                : 'text-white/60 hover:text-white border-transparent hover:bg-white/5'
            }`}
          >
            <Mail size={16} />
            Contacto
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-white/90 text-sm leading-relaxed scrollbar-thin">
          
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-xl font-bold text-white mb-1">Privacy Policy</h3>
                <p className="text-xs text-white/50">Last updated: June 9, 2025</p>
              </div>

              <p className="text-white/80">
                This Privacy Policy describes how <strong>Chat-Liz</strong> (&quot;we&quot;) collects, uses, and protects your data on our website{' '}
                <a 
                  href="https://chatliz-online-chatliz.hf.space/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-cyan-400 underline hover:text-cyan-300 inline-flex items-center gap-1"
                >
                  https://chatliz-online-chatliz.hf.space/ <ExternalLink size={12} />
                </a>.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                <div>
                  <h4 className="font-bold text-cyan-300 mb-1">1. Data We Collect</h4>
                  <p className="text-white/80">
                    We collect the following data: <strong>Name</strong>, <strong>Email</strong>, <strong>IP Address</strong>, and <strong>Cookies</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-cyan-300 mb-1">2. Use of Data</h4>
                  <p className="text-white/80">
                    Collected data is used to provide services, improve the website, and for analytics purposes.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-cyan-300 mb-1">3. Data Protection</h4>
                  <p className="text-white/80">
                    We implement technical and organizational measures to protect your data against unauthorized access, loss, or alteration.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-cyan-300 mb-1">4. Sharing Data with Third Parties</h4>
                  <p className="text-white/80">
                    We do not share your data with third parties, except as required by law.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-cyan-300 mb-1">5. Your Rights</h4>
                  <p className="text-white/80">
                    You may request access, correction, or deletion of your data by contacting us at:{' '}
                    <a href="mailto:fabiangamer587@gmail.com" className="text-cyan-400 font-mono underline hover:text-cyan-300">
                      fabiangamer587@gmail.com
                    </a>.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-cyan-300 mb-1">6. Contact Us</h4>
                  <p className="text-white/80">
                    If you have any questions, please contact us at:{' '}
                    <a href="mailto:fabiangamer587@gmail.com" className="text-cyan-400 font-mono underline hover:text-cyan-300">
                      fabiangamer587@gmail.com
                    </a>.
                  </p>
                </div>
              </div>

              <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-4 text-xs text-white/70">
                <span className="font-bold text-cyan-300">Google AdSense y Cookies:</span> Cumplimos con los requisitos de transparencia de Google AdSense. Podemos utilizar cookies estándar de sesión para recordar tus preferencias y ofrecer análisis de tráfico no invasivo en la plataforma.
              </div>
            </div>
          )}

          {/* TAB 2: TERMS AND CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-xl font-bold text-white mb-1">Términos y Condiciones (Aviso Legal)</h3>
                <p className="text-xs text-white/50">Reglas de uso y responsabilidades en Chat-Liz</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="font-bold text-purple-300 mb-1.5">1. Aceptación del Servicio</h4>
                  <p className="text-white/80 text-xs sm:text-sm">
                    Al acceder y utilizar Chat-Liz (https://chatliz-online-chatliz.hf.space/), aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, te recomendamos suspender el uso del sitio.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="font-bold text-purple-300 mb-1.5">2. Responsabilidad del Usuario</h4>
                  <p className="text-white/80 text-xs sm:text-sm">
                    Los usuarios son exclusivamente responsables de los mensajes, archivos o interacciones que compartan dentro de la sala global o privada. Queda estrictamente prohibido:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-xs sm:text-sm text-white/70">
                    <li>Publicar contenido para adultos (+18), pornografía o material explícito.</li>
                    <li>Promover lenguaje de odio, discriminación, acoso o violencia.</li>
                    <li>Realizar spam, fraudes, estafas o compartir enlaces maliciosos.</li>
                    <li>Distribuir material protegido por derechos de autor sin autorización.</li>
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="font-bold text-purple-300 mb-1.5">3. Servicio Ofrecido &quot;Tal Cual&quot; (As-Is)</h4>
                  <p className="text-white/80 text-xs sm:text-sm">
                    Chat-Liz se proporciona &quot;tal cual&quot; y según disponibilidad. Aunque procuramos la máxima estabilidad técnica y velocidad, no garantizamos que el servicio esté libre de interrupciones imprevistas ni nos hacemos responsables por pérdidas de datos temporales.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="font-bold text-purple-300 mb-1.5">4. Límites de Responsabilidad y Moderación</h4>
                  <p className="text-white/80 text-xs sm:text-sm">
                    La administración se reserva el derecho de moderar, silenciar o bloquear el acceso a usuarios que vulneren estas normas comunitarias para proteger la integridad y seguridad de la comunidad.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT CHAT-LIZ (CONTENT VALUE FOR ADSENSE) */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-xl font-bold text-white mb-1">Sobre Chat-Liz</h3>
                <p className="text-xs text-white/50">Innovación en mensajería social interactiva con Inteligencia Artificial</p>
              </div>

              <p className="text-white/80">
                <strong>Chat-Liz</strong> es una comunidad web de chat en tiempo real diseñada para conectar a personas de todo el mundo mediante conversaciones fluidas, seguras y enriquecidas con inteligencias artificiales conversacionales.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                    <MessageCircle size={16} /> Chat Global en Tiempo Real
                  </h4>
                  <p className="text-xs text-white/70">
                    Conversaciones públicas moderadas con límite dinámico de 20 mensajes gestionados por la administración para mantener la sala ágil y fresca.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                    <Shield size={16} /> Inteligencia Artificial Integrada
                  </h4>
                  <p className="text-xs text-white/70">
                    Interactúa con personajes de IA como Elizabeth y otros asistentes con respuestas inteligentes, empáticas y dinámicas.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-emerald-300 text-sm">Normas de Convivencia</h4>
                <p className="text-xs text-white/70">
                  En Chat-Liz fomentamos un ambiente constructivo, amigable y respetuoso. Si detectas cualquier comportamiento indebido, puedes informarlo inmediatamente a nuestro equipo de moderación.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-xl font-bold text-white mb-1">Información de Contacto y Soporte</h3>
                <p className="text-xs text-white/50">Estamos a tu disposición para dudas, sugerencias o soporte legal</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-black/40 rounded-xl border border-white/10">
                  <div>
                    <span className="text-xs text-white/50 block font-medium">Correo Electrónico Oficial:</span>
                    <span className="text-cyan-300 font-mono font-bold text-sm sm:text-base">fabiangamer587@gmail.com</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyEmail}
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedEmail ? <Check size={14} className="text-green-400" /> : <Mail size={14} />}
                      {copiedEmail ? '¡Copiado!' : 'Copiar Correo'}
                    </button>
                    <a
                      href="mailto:fabiangamer587@gmail.com?subject=Contacto%20Chat-Liz"
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-opacity"
                    >
                      Redactar Email
                    </a>
                  </div>
                </div>

                <p className="text-xs text-white/60">
                  Respondemos habitualmente en un plazo de 24 a 48 horas hábiles. Para solicitudes relativas a la Política de Privacidad o eliminación de datos de usuario, indica tu nombre de usuario registrado.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-black/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <span>Chat-Liz © 2025 • Todos los derechos reservados.</span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
