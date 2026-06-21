import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Galeri } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface GaleriProps {
  gallery: Galeri[];
}

export default function GaleriSection({ gallery }: GaleriProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const openLightbox = (idx: number) => {
    setActiveIdx(idx);
    document.body.style.overflow = 'hidden'; // Lock background scroll
  };

  const closeLightbox = () => {
    setActiveIdx(null);
    document.body.style.overflow = 'unset'; // Unlock scroll
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null) {
      setActiveIdx((activeIdx + 1) % gallery.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null) {
      setActiveIdx((activeIdx - 1 + gallery.length) % gallery.length);
    }
  };

  return (
    <section id="gallery" className="py-24 bg-elegant-green-950 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-950/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="font-mono text-accent-gold uppercase tracking-widest text-xs font-semibold block">
            Visual Snapshots
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight">
            Galeri <span className="text-accent-gold">Estetik Kaktus</span>
          </h2>
          <div className="w-16 h-[2px] bg-accent-gold mx-auto my-3" />
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto font-sans">
            Sudut-sudut foto favorit yang sering diabadikan oleh pengunjung and fotografer profesional di ruang asri kami.
          </p>
        </div>

        {/* Masonry Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((pic, idx) => (
            <div
              key={pic.id}
              onClick={() => openLightbox(idx)}
              className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer border border-accent-gold/10 shadow-lg hover:border-accent-gold/35 hover:-translate-y-1 transition-all duration-300 bg-elegant-green-900/60"
            >
              <ImageWithFallback
                src={pic.fotoUrl}
                alt={pic.deskripsi}
                className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover Dark Overlay Card with eye icon, centering details */}
              <div className="absolute inset-0 bg-gradient-to-t from-elegant-green-950/90 via-elegant-green-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold font-semibold">
                      Spesial Momen
                    </span>
                    <p className="text-white text-xs sm:text-sm font-sans font-medium line-clamp-1">
                      {pic.deskripsi}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-accent-gold text-elegant-green-950 flex items-center justify-center shrink-0">
                    <Maximize2 size={14} />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Lightbox Modal overlay with controls */}
        {activeIdx !== null && (
          <div
            onClick={closeLightbox}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          >
            {/* Top Bar inside modal */}
            <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-center text-white z-20">
              <span className="text-xs font-mono tracking-widest text-[#a6bca2] uppercase font-semibold">
                Galeri Kaktus ({activeIdx + 1} / {gallery.length})
              </span>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer"
                title="Tutup Lightbox"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Stage */}
            <div className="relative max-w-4xl w-full flex items-center justify-center">
              {/* Previous Control button */}
              <button
                onClick={prevImage}
                className="absolute left-2 sm:-left-16 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer z-10 hover:text-accent-gold"
                title="Sebelumnya"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Interactive Image Frame */}
              <div className="max-h-[75vh] flex flex-col items-center relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-elegant-green-950">
                <ImageWithFallback
                  src={gallery[activeIdx].fotoUrl}
                  alt={gallery[activeIdx].deskripsi}
                  className="max-h-[65vh] object-contain w-auto block max-w-full"
                />
                
                {/* Description Footer */}
                <div className="w-full bg-elegant-green-950/95 border-t border-white/5 p-4 text-center">
                  <p className="text-gray-200 text-xs sm:text-sm font-sans tracking-wide">
                    {gallery[activeIdx].deskripsi}
                  </p>
                </div>
              </div>

              {/* Next Control button */}
              <button
                onClick={nextImage}
                className="absolute right-2 sm:-right-16 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer z-10 hover:text-accent-gold"
                title="Selanjutnya"
              >
                <ChevronRight size={24} />
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
