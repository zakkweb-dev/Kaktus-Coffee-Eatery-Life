import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  noWa?: string;
  namaCabang?: string;
}

export default function FloatingWhatsApp({ noWa = '6285738662165', namaCabang = 'Kaktus Coffee' }: FloatingWhatsAppProps) {
  const message = encodeURIComponent(`Halo ${namaCabang}, saya ingin bertanya mengenai ketersediaan meja / menu hari ini.`);
  const waUrl = `https://wa.me/${noWa}?text=${message}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-8 right-6 z-40 flex items-center justify-center w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-all duration-300 group hover:scale-110 active:scale-95"
      title="Hubungi WhatsApp Kami"
    >
      {/* Ripple Wave effects */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping -z-10 group-hover:block" />
      <MessageCircle size={28} className="transition-transform duration-300 group-hover:rotate-12" />
      
      {/* Tooltip */}
      <span className="absolute right-16 bg-elegant-green-950 text-white border border-accent-gold/20 text-xs px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap hidden md:inline-block">
        Tanya Kaktus Barista
      </span>
    </a>
  );
}
