import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  loading?: 'lazy' | 'eager';
}

export default function ImageWithFallback({ src, alt, className, fallbackClassName, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const isFormatSupported = (url: string | undefined): boolean => {
    if (!url) return false;
    const cleanUrl = url.toLowerCase().split('?')[0].split('#')[0];
    return (
      cleanUrl.endsWith('.jpg') ||
      cleanUrl.endsWith('.jpeg') ||
      cleanUrl.endsWith('.png') ||
      cleanUrl.endsWith('.webp') ||
      url.startsWith('data:image/') ||
      url.startsWith('blob:')
    );
  };

  const handleLoadError = () => {
    setError(true);
  };

  if (error || !src || !isFormatSupported(src)) {
    return (
      <div 
        id="img-fallback-box"
        className={`flex flex-col items-center justify-center p-3 bg-black/40 border border-white/5 text-center gap-1.5 rounded-xl ${fallbackClassName || className || 'w-full h-full'}`}
      >
        <ImageOff size={16} className="text-red-400/80 animate-pulse" />
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest font-mono select-none">
          Gambar tidak dapat dimuat
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleLoadError}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
