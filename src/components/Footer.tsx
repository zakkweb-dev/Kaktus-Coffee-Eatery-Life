import { Instagram, MapPin, Phone, Music2, Share2, Compass, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onScrollTo: (id: string) => void;
  onNavigateToAdmin: () => void;
  logoUrl?: string;
}

export default function Footer({ onScrollTo, onNavigateToAdmin, logoUrl }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-elegant-green-950 border-t border-accent-gold/15 text-gray-400 font-sans pb-28 md:pb-12 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Branch / Brand Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo Kaktus" 
                className="h-10 w-auto max-w-[120px] object-contain rounded-md"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <span className="font-display text-lg font-black tracking-wider text-white uppercase sm:text-xl">
              Kaktus <span className="text-accent-gold font-light">Coffee</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
            Eatery & Life. Jaringan cafe multi-cabang berdesain minimalis estetik tropis dengan kualitas penyajian biji kopi arabika pilihan serta menu makanan nusantara dan barat premium.
          </p>

          {/* Social Icons list */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://www.instagram.com/kaktus_coffeeeaterylife"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-accent-gold hover:text-accent-gold flex items-center justify-center transition-colors hover:scale-105 active:scale-95"
              title="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://www.tiktok.com/@kaktus.coffeeeaterylife"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-accent-gold hover:text-accent-gold flex items-center justify-center transition-colors hover:scale-105 active:scale-95"
              title="TikTok"
            >
              <Music2 size={16} />
            </a>
            <a
              href="https://wa.me/6285738662165"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-accent-gold hover:text-accent-gold flex items-center justify-center transition-colors hover:scale-105 active:scale-95"
              title="WhatsApp CS Pusat"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        {/* Links Column */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="font-display text-xs font-bold text-white uppercase tracking-widest">
            Link Navigasi
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <button
                onClick={() => onScrollTo('hero')}
                className="hover:text-accent-gold transition-colors block cursor-pointer text-left py-0.5"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => onScrollTo('about')}
                className="hover:text-accent-gold transition-colors block cursor-pointer text-left py-0.5"
              >
                Cerita Kami
              </button>
            </li>
            <li>
              <button
                onClick={() => onScrollTo('menu')}
                className="hover:text-accent-gold transition-colors block cursor-pointer text-left py-0.5"
              >
                Eksplorasi Menu
              </button>
            </li>
            <li>
              <button
                onClick={() => onScrollTo('branch')}
                className="hover:text-accent-gold transition-colors block cursor-pointer text-left py-0.5"
              >
                Lokasi Cabang
              </button>
            </li>
            <li>
              <button
                onClick={() => onScrollTo('event')}
                className="hover:text-accent-gold transition-colors block cursor-pointer text-left py-0.5"
              >
                Agenda Event
              </button>
            </li>
          </ul>
        </div>

        {/* Operational / Hubungi Kami */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="font-display text-xs font-bold text-white uppercase tracking-widest">
            Hubungi Kami
          </h4>
          <ul className="space-y-3 text-xs sm:text-sm">
            <li className="flex gap-2.5 items-start">
              <MapPin size={16} className="text-accent-gold shrink-0 mt-0.5" />
              <span>Galesong, Parangloe Utara, & Rappocini Budi Luhur, Makassar</span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Phone size={16} className="text-accent-gold shrink-0" />
              <span>+62 857-3866-2165 (Customer Service)</span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Compass size={16} className="text-accent-gold shrink-0" />
              <span>kaktus.coffee.life@gmail.com</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-xs">
        <div>
          &copy; {currentYear} <strong className="text-white">Kaktus Coffee Eatery Life</strong>. All Rights Reserved.
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateToAdmin}
            className="flex items-center gap-1 hover:text-accent-gold transition-colors font-mono tracking-widest uppercase cursor-pointer"
          >
            <ShieldCheck size={14} />
            Dashboard Admin
          </button>
        </div>
      </div>
    </footer>
  );
}
