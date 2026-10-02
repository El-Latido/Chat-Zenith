import React from 'react';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: string;
  sender: string;
  isOwn: boolean;
  bubbleStyle?: 'default' | 'neon' | 'gradient' | 'glass' | 'fire' | 'galaxy' | 'matrix';
  fontStyle?: string;
  fontColor?: string;
  timestamp?: number;
}

const BUBBLE_STYLES: Record<string, string> = {
  default: 'bg-gray-700 text-white',
  neon: 'bg-black border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.7)]',
  gradient: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
  glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white',
  fire: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.6)]',
  galaxy: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]',
  matrix: 'bg-black border border-green-500 text-green-400 font-mono shadow-[0_0_15px_rgba(34,197,94,0.5)]',
};

export function ChatBubble({ message, sender, isOwn, bubbleStyle = 'default', fontStyle, fontColor, timestamp }: ChatBubbleProps) {
  const style = BUBBLE_STYLES[bubbleStyle] || BUBBLE_STYLES.default;
  
  const isAnimated = ['neon', 'fire', 'galaxy', 'matrix'].includes(bubbleStyle);

  const textStyle: React.CSSProperties = {
    fontFamily: fontStyle && fontStyle !== 'default' ? fontStyle : 'inherit',
    color: fontColor || undefined,
  };

  const bubbleContent = (
    <div
      className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md break-words ${style} ${
        isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'
      }`}
      style={textStyle}
    >
      <p className="text-sm">{message}</p>
      {timestamp && (
        <p className="text-[10px] opacity-60 mt-1 text-right font-mono">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );

  if (isAnimated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        {bubbleContent}
      </motion.div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {bubbleContent}
    </div>
  );
}
