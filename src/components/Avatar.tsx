import React, { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  frameId?: number;
  onClick?: () => void;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  className = '',
  frameId,
  onClick,
  referrerPolicy = 'no-referrer',
}) => {
  const hasFrame = frameId !== undefined && frameId >= 1 && frameId <= 40;
  
  const [customUrl, setCustomUrl] = useState<string | null>(null);

  useEffect(() => {
    if (hasFrame) {
      const getCustomUrl = () => {
         const w = window as any;
         if (w.chatlizCustomFrames && w.chatlizCustomFrames[frameId!]) {
            return w.chatlizCustomFrames[frameId!];
         }
         return null;
      };
      
      setCustomUrl(getCustomUrl());

      const handleUpdate = () => setCustomUrl(getCustomUrl());
      window.addEventListener('chatliz_custom_frames_updated', handleUpdate);
      return () => window.removeEventListener('chatliz_custom_frames_updated', handleUpdate);
    }
  }, [frameId, hasFrame]);

  return (
    <div
      className={`relative inline-block shrink-0 ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        referrerPolicy={referrerPolicy}
        className="w-full h-full rounded-full object-cover relative z-0"
      />
      {hasFrame && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            transform: 'scale(1.35)'
          }}
        >
          <img 
            src={customUrl || `/frames/${frameId}.png`} 
            alt={`Frame ${frameId}`}
            className="w-full h-full object-contain"
            style={customUrl ? undefined : {
              WebkitMaskImage: 'radial-gradient(circle closest-side, transparent 74%, black 75%)',
              maskImage: 'radial-gradient(circle closest-side, transparent 74%, black 75%)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};
