import { ArrowRight, Calendar, ArrowDown } from 'lucide-react';

interface HeroProps {
  onScrollTo: (id: string) => void;
}

export default function Hero({ onScrollTo }: HeroProps) {
  return (
    <section id="hero" className="relative min-h-[95vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-elegant-green-950 pt-16">
      {/* Background Image Layer with Luxury Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/kaktus_hero_banner_1781599649978.jpg"
          alt="Kaktus Coffee Eatery Interior Background"
          className="w-full h-full object-cover object-center scale-105 animate-pulse-slow"
          referrerPolicy="no-referrer"
        />
        {/* Multi-layered dark gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-elegant-green-950 via-elegant-green-950/80 to-elegant-green-950/45 z-10" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-elegant-green-950/90 z-10" />
      </div>

      {/* Decorative Golden Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent-gold/10 rounded-full blur-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl z-10 pointer-events-none" />

      {/* Main Content Card */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 pb-20 md:py-32">
        {/* Top welcome micro-pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-accent-gold shadow-md shadow-accent-gold/50"></span>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#d8e7d5] font-semibold">
            Premium Jaringan Cafe Multi-Cabang
          </span>
        </div>

        {/* Large Aesthetic Titles */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-8xl font-black text-white leading-tight tracking-tight uppercase">
          KAKTUS <span className="text-accent-gold font-light block sm:inline">COFFEE</span>
        </h1>
        
        {/* Serif script-like subtitle */}
        <p className="font-serif italic text-lg sm:text-2xl text-[#b9ceb6] mt-2 mb-6">
          Eatery & Life
        </p>

        {/* Brand Tagline */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 font-sans tracking-wide leading-relaxed mb-10">
          Temukan harmoni cita rasa kopi istimewa, hidangan lezat berkelas, dan hangatnya kebersamaan. Kami menghadirkan ruang kolaboratif modern berdesain minimalis yang asri di setiap cabang kami.
        </p>

        {/* Interactive Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => onScrollTo('menu')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent-gold text-elegant-green-950 px-8 py-3.5 rounded-full font-display uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-elegant-green-950 hover:shadow-lg hover:shadow-accent-gold/15 transition-all duration-300 cursor-pointer"
          >
            Lihat Coffee Menu
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => onScrollTo('reserve')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-accent-gold/40 bg-elegant-green-950/70 text-accent-gold px-8 py-3.5 rounded-full font-display uppercase tracking-widest text-xs font-bold hover:bg-accent-gold/10 hover:border-accent-gold transition-all duration-300 cursor-pointer"
          >
            <Calendar size={14} />
            Reservasi Meja
          </button>
        </div>
      </div>

      {/* Embedded statistics layout overlay at bottom */}
      <div className="absolute bottom-6 left-0 right-0 z-20 hidden md:flex justify-center">
        <button
          onClick={() => onScrollTo('about')}
          className="flex flex-col items-center text-gray-400 hover:text-accent-gold transition-colors text-xs font-mono tracking-widest cursor-pointer uppercase gap-2 py-2"
        >
          <span>Jelajahi Sejarah Kami</span>
          <ArrowDown size={14} className="animate-bounce" />
        </button>
      </div>
    </section>
  );
}
