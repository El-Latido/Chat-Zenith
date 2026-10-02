import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Brain } from 'lucide-react';
import { socket } from '../socket';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'audio';
  audioUrl?: string;
  timestamp: number;
}

interface ElizabethAIProps {
  user: { username: string };
  onClose: () => void;
}

export function ElizabethAI({ user, onClose }: ElizabethAIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [memory, setMemory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cargar memoria del usuario al iniciar
  useEffect(() => {
    socket.emit('elizabeth_load_memory', { user: user.username });
    
    const handleMemory = (data: { memories: string[] }) => {
      if (data && Array.isArray(data.memories)) {
        setMemory(data.memories);
      }
    };

    socket.on('elizabeth_memory', handleMemory);
    return () => {
      socket.off('elizabeth_memory', handleMemory);
    };
  }, [user.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string, isAudioResponse = false) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      type: isAudioResponse ? 'audio' : 'text',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Enviar al backend con contexto de memoria
    socket.emit('elizabeth_chat', {
      user: user.username,
      message: text,
      memory: memory,
      wantsAudio: isAudioResponse || (autoVoice && text.toLowerCase().includes('háblame por audio')),
    });
  };

  useEffect(() => {
    const handleResponse = (data: { response: string; audioUrl?: string; newMemory?: string }) => {
      setIsTyping(false);
      
      const assistantMsg: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: data.response,
        type: data.audioUrl ? 'audio' : 'text',
        audioUrl: data.audioUrl,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Actualizar memoria
      if (data.newMemory) {
        setMemory(prev => [...prev, data.newMemory!].slice(-50)); // Mantener últimas 50 memorias
      }

      // Auto-reproducir audio si está habilitado
      if (data.audioUrl && autoVoice) {
        const audio = new Audio(data.audioUrl);
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        audio.play().catch(() => setIsSpeaking(false));
      }
    };

    socket.on('elizabeth_response', handleResponse);
    return () => {
      socket.off('elizabeth_response', handleResponse);
    };
  }, [autoVoice]);

  // Grabación de audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const resultStr = reader.result as string;
          const base64 = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
          socket.emit('elizabeth_audio_transcribe', {
            user: user.username,
            audio: base64,
            memory: memory,
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('No se pudo acceder al micrófono');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  useEffect(() => {
    const handleTranscription = (data: { transcription: string }) => {
      if (data && data.transcription) {
        sendMessage(data.transcription, true);
      }
    };
    socket.on('elizabeth_transcription', handleTranscription);
    return () => {
      socket.off('elizabeth_transcription', handleTranscription);
    };
  }, [memory]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 border border-purple-500/50 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-purple-500/30 flex items-center gap-3 bg-black/30">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
              👑
            </div>
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-pink-400 animate-ping pointer-events-none" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">Elizabeth AI</h3>
            <p className="text-purple-300 text-xs flex items-center gap-1 font-medium">
              <Brain size={12} />
              {memory.length > 0 ? `Recuerda ${memory.length} cosas de ti` : 'Conversación nueva con memoria activa'}
            </p>
          </div>
          <button
            onClick={() => setAutoVoice(!autoVoice)}
            className={`p-2 rounded-full transition cursor-pointer ${autoVoice ? 'bg-pink-600 text-white shadow-md' : 'bg-gray-700 text-gray-400'}`}
            title={autoVoice ? 'Voz automática activada' : 'Voz automática desactivada'}
          >
            {autoVoice ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {messages.length === 0 && (
            <div className="text-center text-purple-300 py-12">
              <div className="text-6xl mb-4 animate-bounce">👑</div>
              <p className="text-lg font-bold">Hola, soy Elizabeth</p>
              <p className="text-sm opacity-70">Puedo recordar nuestras conversaciones y responderte por audio. ¡Hablemos!</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
                  : 'bg-white/10 backdrop-blur border border-white/20 text-white rounded-bl-sm'
              }`}>
                {msg.type === 'audio' ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">🎤</span>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    {msg.audioUrl && (
                      <audio src={msg.audioUrl} controls className="h-8 w-full mt-1" />
                    )}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
                <span className="text-[9px] opacity-50 block text-right mt-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-4 py-2.5">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-purple-500/30 flex gap-2 bg-black/30">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition cursor-pointer shadow ${
              isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            title={isRecording ? "Detener grabación" : "Grabar audio"}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Escribe un mensaje para Elizabeth..."
            className="flex-1 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
          />
          <button
            onClick={() => sendMessage(input)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-full transition cursor-pointer shadow-lg"
            title="Enviar mensaje"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
