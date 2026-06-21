import { useState } from 'react';
import { Cake, Sparkles, MessageSquare, Flame } from 'lucide-react';
import { CustomCake } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface CustomCakeSectionProps {
  customCakes: CustomCake[];
  noWaCake?: string;
  onConsultCake?: (cakeName: string) => void;
}

export default function CustomCakeSection({ customCakes, noWaCake = '6285738662165', onConsultCake }: CustomCakeSectionProps) {
  const activeCakes = customCakes.filter((cake) => cake.isActive);

  const handleConsultWa = (cakeName: string) => {
    if (onConsultCake) {
      onConsultCake(cakeName);
    } else {
      const message = encodeURIComponent(
        `Halo Kaktus Coffee & Bakeshop! Saya ingin berkonsultasi mengenai pesanan kue kustomisasi untuk model "${cakeName}". Mohon info detail untuk ukuran, rasa, dan waktu pembuatan.`
      );
      window.open(`https://wa.me/${noWaCake.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
  };

  if (activeCakes.length === 0) {
    return null;
  }

  return (
    <section id="custom-cake" className="py-24 bg-elegant-green-950 border-t border-b border-accent-gold/10 relative overflow-hidden">
      {/* Decorative backdrop shapes */}
      <div className="absolute left-0 top-1/4 w-72 h-72 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 bottom-1/4 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1 text-accent-gold font-mono text-[10px] tracking-widest uppercase border border-accent-gold/20 bg-accent-gold/5 px-3.5 py-1 rounded-full">
            <Sparkles size={11} className="animate-spin" />
            Signature Custom Bakery
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight">
            Kustomisasi <span className="text-accent-gold">Kue Premium</span>
          </h2>
          <div className="w-16 h-[2.5px] bg-accent-gold mx-auto" />
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto font-sans leading-relaxed">
            Wujudkan momen paling berharga Anda bersama kue kustomisasi kami. Setiap kue dirancang khusus, dibuat eksklusif, dan didekorasi hand-crafted oleh pastry chef ahli Kaktus.
          </p>
        </div>

        {/* Dynamic Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeCakes.map((cake, idx) => (
            <div 
              key={cake.id}
              className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-accent-gold/45 transition-all duration-350 border border-white/5"
            >
              {/* Product Thumbnail with hover scale effect */}
              <div className="relative aspect-[4/3] overflow-hidden bg-elegant-green-900/10">
                <ImageWithFallback
                  src={cake.fotoUrl}
                  alt={cake.nama}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3.5 right-3.5 bg-elegant-green-950/80 border border-accent-gold/30 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <Cake size={11} className="text-accent-gold" />
                  <span className="text-[9px] font-mono tracking-widest text-[#a6bca2] uppercase font-semibold">
                    Custom Baker
                  </span>
                </div>
              </div>

              {/* Information Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-display text-base font-extrabold text-white group-hover:text-accent-gold transition-colors duration-200 uppercase tracking-tight line-clamp-1">
                      {cake.nama}
                    </h3>
                    <div className="text-right">
                      <span className="block text-[8px] font-mono tracking-widest text-accent-gold/60 uppercase">Mulai Dari</span>
                      <span className="text-accent-gold font-display font-black text-sm block">
                        Rp{cake.hargaMulai.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {cake.pilihanRasa && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cake.pilihanRasa.split(',').map((rasa, rIdx) => (
                        <span 
                          key={rIdx} 
                          className="bg-accent-gold/10 border border-accent-gold/20 text-accent-gold font-mono text-[9px] px-2.5 py-0.5 rounded-full"
                        >
                          {rasa.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-gray-400 text-xs sm:text-sm font-sans line-clamp-3 leading-relaxed">
                    {cake.deskripsi}
                  </p>
                </div>

                {/* Consult Trigger Action */}
                <button
                  onClick={() => handleConsultWa(cake.nama)}
                  className="w-full flex items-center justify-center gap-2 border border-accent-gold/25 bg-accent-gold/5 hover:bg-accent-gold hover:text-elegant-green-950 text-accent-gold py-3 rounded-xl text-xs font-display font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm"
                >
                  <MessageSquare size={12} />
                  Konsultasi Desain Kue
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Order Callout Box */}
        <div className="mt-16 bg-gradient-to-r from-elegant-green-950/80 to-elegant-green-900/80 border border-accent-gold/30 rounded-3xl p-8 sm:p-10 text-center max-w-4xl mx-auto backdrop-blur-md">
          <div className="max-w-2xl mx-auto space-y-5">
            <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Punya Inspirasi Desain Kue Sendiri?
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Kirimkan referensi gambar, pilih ukuran, dekorasi, dan rasa favorit Anda. Kami siap merespons dan mewujudkan mahakarya istimewa Anda dengan kalkulasi harga yang transparan.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleConsultWa('Desain Sendiri')}
                className="inline-flex items-center gap-2 bg-accent-gold hover:bg-white text-elegant-green-950 font-display uppercase tracking-widest text-xs font-extrabold px-8 py-4 rounded-full transition-all duration-300 cursor-pointer shadow-lg shadow-accent-gold/15"
              >
                <MessageSquare size={13} />
                Hubungi Pastry Chef Kami via WhatsApp
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
