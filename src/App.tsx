import React, { useState, useEffect, useRef } from 'react';
import { Settings, MessageSquare, Users, Image as ImageIcon, Send, ArrowLeft, CheckCircle2, LogIn, LogOut } from 'lucide-react';
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

type InterfaceTheme = 'classic' | 'bubbles';

interface Message {
  id: string;
  text: string;
  sender: string;
  userId: string;
  channelId: string;
  createdAt: number;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');
  const [theme, setTheme] = useState<InterfaceTheme>('bubbles');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('channelId', '==', 'global'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMessages.push({
          id: doc.id,
          text: data.text,
          sender: data.sender,
          userId: data.userId,
          channelId: data.channelId,
          createdAt: data.createdAt?.toMillis() || Date.now()
        });
      });
      // Reverse to show newest at bottom
      setMessages(fetchedMessages.reverse());
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;
    const msgText = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'messages'), {
        channelId: 'global',
        text: msgText.slice(0, 1000), // Max length as per our rule
        sender: user.displayName || 'Usuario',
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Remix Chat-Liz
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button 
            onClick={() => setCurrentView('chat')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'chat' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <MessageSquare size={18} />
            <span>Chat Global</span>
          </button>
        </div>
        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Settings size={18} />
            <span>Configuración</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Remix Chat-Liz</h1>
          <button onClick={() => setCurrentView(currentView === 'chat' ? 'settings' : 'chat')} className="p-2 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors">
            {currentView === 'chat' ? <Settings size={20} /> : <ArrowLeft size={20} />}
          </button>
        </div>

        {currentView === 'chat' ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  Elizabeth AI
                </h2>
                <p className="text-sm text-zinc-400">Canal Global • 1,204 online</p>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-zinc-400" size={20} />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
              {!user ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                    <Users className="text-blue-500 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Únete al Chat Global</h3>
                  <p className="text-zinc-400 max-w-sm">
                    Inicia sesión para poder leer y enviar mensajes en el canal global de Remix Chat-Liz.
                  </p>
                  <button 
                    onClick={handleLogin}
                    className="mt-4 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    Iniciar sesión con Google
                  </button>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMe = user ? msg.userId === user.uid : false;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {theme === 'bubbles' ? (
                          // Bubble Theme
                          <div className={`max-w-[85%] md:max-w-[65%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                            {!isMe && <span className="text-xs text-zinc-500 ml-2 font-medium">{msg.sender}</span>}
                            <div 
                              className={`px-4 py-3 text-[15px] leading-relaxed shadow-sm break-words
                                ${isMe 
                                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                                  : 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 rounded-2xl rounded-tl-sm'
                                }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ) : (
                          // Classic/Flat Theme
                          <div className="w-full flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium text-sm ${isMe ? 'text-blue-400' : 'text-zinc-300'}`}>
                                {msg.sender}
                              </span>
                              <span className="text-xs text-zinc-600">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="text-zinc-300 text-[15px] break-words">
                              {msg.text}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <button 
                  disabled={!user}
                  className="p-3 text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 rounded-xl hover:bg-zinc-800 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon size={20} />
                </button>
                <div className={`flex-1 bg-zinc-800/50 border border-zinc-700 transition-colors rounded-xl flex items-center min-h-[50px] px-2 ${user ? 'focus-within:border-zinc-500' : 'opacity-50'}`}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={!user}
                    placeholder={user ? "Envía un mensaje al canal global..." : "Inicia sesión para enviar mensajes..."}
                    className="flex-1 bg-transparent border-none text-white px-3 py-3 focus:outline-none placeholder:text-zinc-500 w-full disabled:cursor-not-allowed"
                  />
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!user || !inputText.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-xl flex items-center justify-center shadow-md shadow-blue-900/20 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Settings View */
          <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 md:p-10">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setCurrentView('chat')}
                  className="md:hidden p-2 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Configuración</h2>
                  <p className="text-zinc-400">Personaliza tu experiencia en Remix Chat-Liz.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Settings className="text-blue-400" size={20}/>
                    Interfaz del Chat
                  </h3>
                  <p className="text-sm text-zinc-400 mb-6">
                    Elige cómo prefieres que se vean los mensajes en el chat.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Theme Option: Bubbles */}
                    <button
                      onClick={() => setTheme('bubbles')}
                      className={`relative flex flex-col text-left border ${theme === 'bubbles' ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 bg-zinc-800/30'} rounded-xl p-4 transition-all hover:border-blue-500/50 group`}
                    >
                      {theme === 'bubbles' && (
                        <div className="absolute top-3 right-3 text-blue-500">
                          <CheckCircle2 size={20} />
                        </div>
                      )}
                      
                      {/* Empty layout representation of the bubble design */}
                      <div className="mb-4 space-y-2 w-full pt-2">
                        {/* Fake received bubble */}
                        <div className="bg-zinc-700/80 w-2/3 h-8 rounded-2xl rounded-tl-sm transition-transform group-hover:-translate-y-0.5"></div>
                        {/* Fake sent bubble */}
                        <div className="bg-blue-600/80 w-3/4 h-8 rounded-2xl rounded-tr-sm self-end ml-auto transition-transform group-hover:-translate-y-0.5"></div>
                      </div>
                      
                      <h4 className="font-medium text-zinc-100 mt-2">Diseño de Burbujas</h4>
                      <p className="text-xs text-zinc-500 mt-1">Mensajes en contenedores redondeados estilo moderno.</p>
                    </button>

                    {/* Theme Option: Classic */}
                    <button
                      onClick={() => setTheme('classic')}
                      className={`relative flex flex-col text-left border ${theme === 'classic' ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 bg-zinc-800/30'} rounded-xl p-4 transition-all hover:border-blue-500/50 group`}
                    >
                      {theme === 'classic' && (
                        <div className="absolute top-3 right-3 text-blue-500">
                          <CheckCircle2 size={20} />
                        </div>
                      )}
                      
                      <div className="mb-4 space-y-3 w-full pt-2">
                        <div className="flex gap-2 items-center transition-transform group-hover:-translate-y-0.5">
                          <div className="w-4 h-4 rounded-full bg-zinc-600"></div>
                          <div className="w-full h-3 bg-zinc-700 rounded-sm"></div>
                        </div>
                        <div className="flex gap-2 items-center transition-transform group-hover:-translate-y-0.5">
                          <div className="w-4 h-4 rounded-full bg-blue-500/50"></div>
                          <div className="w-3/4 h-3 bg-zinc-700 rounded-sm"></div>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-zinc-100 mt-2">Plano / Clásico</h4>
                      <p className="text-xs text-zinc-500 mt-1">Diseño de texto continuo sin burbujas separadas.</p>
                    </button>
                  </div>
                </div>

                {/* Account Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Users className="text-blue-400" size={20}/>
                    Cuenta
                  </h3>
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.displayName || 'Usuario'}</p>
                          <p className="text-sm text-zinc-400">{user.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => logout()}
                        className="px-4 py-2 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <LogOut size={18} />
                        Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-2">
                      <p className="text-sm text-zinc-400 mb-2">
                        Inicia sesión para enviar mensajes y participar en el chat global.
                      </p>
                      <button 
                        onClick={handleLogin}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <LogIn size={18} />
                        Iniciar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
