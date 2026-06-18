import { Calendar, Users, Music, Film, ArrowRight } from 'lucide-react';
import { Event } from '../types';

interface EventSectionProps {
  events: Event[];
  onScrollTo: (id: string) => void;
}

export default function EventSection({ events, onScrollTo }: EventSectionProps) {
  // Map icons based on titles for a brilliant visual touch!
  const getEventIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('akustik') || lowercaseName.includes('music') || lowercaseName.includes('live')) {
      return <Music size={16} />;
    } else if (lowercaseName.includes('nobar') || lowercaseName.includes('match') || lowercaseName.includes('champions')) {
      return <Film size={16} />;
    } else {
      return <Users size={16} />;
    }
  };

  return (
    <section id="event" className="py-24 bg-elegant-green-900 border-t border-b border-accent-gold/10 relative overflow-hidden">
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="font-mono text-accent-gold uppercase tracking-widest text-xs font-semibold block">
            Co-Living & Entertainment
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight">
            Agenda & <span className="text-accent-gold">Event Seru</span>
          </h2>
          <div className="w-16 h-[2px] bg-accent-gold mx-auto my-3" />
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto font-sans">
            Bergabunglah dalam keseruan komunitas kreatif kami. Temukan live gig, pemutaran film, talkshow, kelas eksklusif, hingga nobar seru.
          </p>
        </div>

        {/* Masonry or Clean Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-accent-gold/45 duration-300 pointer-events-auto"
            >
              {/* Event Image Banner */}
              <div className="relative aspect-[16/10] overflow-hidden bg-elegant-green-950/40">
                <img
                  src={evt.fotoUrl}
                  alt={evt.nama}
                  className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                
                {/* Floating Date Tag */}
                <div className="absolute bottom-3 left-3 bg-elegant-green-950/95 border border-accent-gold/25 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                  <Calendar size={12} className="text-accent-gold" />
                  <span className="text-[10px] font-mono tracking-wider font-semibold text-accent-gold uppercase">
                    {evt.tanggal}
                  </span>
                </div>
              </div>

              {/* Event Detailed Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent-gold font-mono text-[10px] tracking-widest uppercase">
                    {getEventIcon(evt.nama)}
                    <span>Kaktus Gathering</span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-white group-hover:text-accent-gold transition-colors uppercase tracking-tight line-clamp-1">
                    {evt.nama}
                  </h3>

                  <p className="text-gray-300 text-sm font-sans leading-relaxed line-clamp-3">
                    {evt.deskripsi}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 mt-auto">
                  <button
                    onClick={() => onScrollTo('reserve')}
                    className="flex items-center gap-1 text-xs font-display font-bold uppercase tracking-wider text-accent-gold hover:text-white transition-colors cursor-pointer"
                  >
                    Booking Meja Sekarang
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
