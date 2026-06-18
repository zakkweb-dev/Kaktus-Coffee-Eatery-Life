import { MapPin, Clock, MessageSquare, ExternalLink } from 'lucide-react';
import { Cabang } from '../types';

interface CabangProps {
  branches: Cabang[];
}

export default function CabangSection({ branches }: CabangProps) {
  const handleOpenWaBranch = (branch: Cabang) => {
    const text = encodeURIComponent(
      `Halo CS ${branch.nama}! Saya ingin bertanya mengenai ketersediaan meja atau reservasi grup hari ini.`
    );
    window.open(`https://wa.me/${branch.noWa}?text=${text}`, '_blank');
  };

  return (
    <section id="branch" className="py-24 bg-elegant-green-950 relative overflow-hidden">
      {/* Absolute decorative glow circles */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="font-mono text-accent-gold uppercase tracking-widest text-xs font-semibold block">
            Our Prime Locations
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight">
            Cabang <span className="text-accent-gold">Kaktus Coffee</span>
          </h2>
          <div className="w-16 h-[2px] bg-accent-gold mx-auto my-3" />
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto font-sans">
            Kunjungi cabang terdekat di kota Anda. Nikmati standar kualitas rasa dan keramahan layanan terbaik yang seragam di seluruh cabang kami.
          </p>
        </div>

        {/* Swipe Horizontal on Mobile; Grid on Desktop */}
        {/* Utilizing tailwind classes e.g. flex overflow-x-auto snap-x snap-mandatory md:grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory pb-8 gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:pb-0 scroll-smooth scrollbar-none">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="min-w-[85vw] sm:min-w-[450px] md:min-w-0 snap-center glass-panel rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-accent-gold/45 transition-all duration-300 transform"
            >
              {/* Photo */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={branch.fotoUrl}
                  alt={branch.nama}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <h3 className="font-display text-lg sm:text-xl font-extrabold text-white uppercase tracking-tight">
                    {branch.nama}
                  </h3>
                </div>
              </div>

              {/* Info Blocks */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  
                  {/* Address */}
                  <div className="flex gap-3 items-start">
                    <span className="p-1.5 rounded-lg bg-accent-gold/15 text-accent-gold mt-0.5">
                      <MapPin size={16} />
                    </span>
                    <div>
                      <span className="block text-[10px] uppercase font-mono tracking-widest text-[#a6bca2] font-semibold">
                        Alamat Resmi
                      </span>
                      <p className="text-gray-300 text-xs sm:text-sm font-sans mt-0.5 leading-relaxed">
                        {branch.alamat}
                      </p>
                    </div>
                  </div>

                  {/* Operasional Hours */}
                  <div className="flex gap-3 items-start">
                    <span className="p-1.5 rounded-lg bg-accent-gold/15 text-accent-gold mt-0.5">
                      <Clock size={16} />
                    </span>
                    <div>
                      <span className="block text-[10px] uppercase font-mono tracking-widest text-[#a6bca2] font-semibold">
                        Jam Operasional
                      </span>
                      <p className="text-gray-300 text-xs sm:text-sm font-sans mt-0.5 font-medium">
                        {branch.jamOperasional}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Branch CTA Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                  <a
                    href={branch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white hover:text-elegant-green-950 text-white py-2.5 rounded-xl text-xs font-display uppercase tracking-widest transition-all duration-300 font-semibold"
                  >
                    <ExternalLink size={12} />
                    Google Maps
                  </a>

                  <button
                    onClick={() => handleOpenWaBranch(branch)}
                    className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-display uppercase tracking-widest transition-all duration-300 font-bold"
                  >
                    <MessageSquare size={12} />
                    Hubungi WA
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Horizontal scroll indicators ONLY visible on mobile viewports */}
        <div className="flex md:hidden justify-center items-center gap-1.5 mt-4">
          {branches.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === 0 ? 'w-6 bg-accent-gold' : 'w-1.5 bg-gray-600'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
