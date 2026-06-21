import { useEffect, useState } from 'react';
import { Calendar, Flame, MessageCircle, ExternalLink } from 'lucide-react';
import { Launching } from '../types';

interface NewLaunchProps {
  launches: Launching[];
  linkGrabFood?: string;
  onOrderGrabFood?: () => void;
}

export default function NewLaunch({ launches, linkGrabFood, onOrderGrabFood }: NewLaunchProps) {
  // Find the first active promotional launch whose end date is in the future
  const activeLaunches = launches.filter(
    (l) => l.isActive && new Date(l.tanggalSelesai).getTime() > Date.now()
  );

  if (activeLaunches.length === 0) {
    return null;
  }

  const promo = activeLaunches[0];

  return <LaunchItem promo={promo} linkGrabFood={linkGrabFood} onOrderGrabFood={onOrderGrabFood} />;
}

function LaunchItem({ promo, linkGrabFood, onOrderGrabFood }: { promo: Launching; linkGrabFood?: string; onOrderGrabFood?: () => void }) {
  const [timeLeft, setTimeLeft] = useState({
    hari: 0,
    jam: 0,
    menit: 0,
    detik: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(promo.tanggalSelesai).getTime() - Date.now();
      
      if (difference <= 0) {
        setTimeLeft((prev) => ({ ...prev, isExpired: true }));
        return;
      }

      setTimeLeft({
        hari: Math.floor(difference / (1000 * 60 * 60 * 24)),
        jam: Math.floor((difference / (1000 * 60 * 60)) % 24),
        menit: Math.floor((difference / 1000 / 60) % 60),
        detik: Math.floor((difference / 1000) % 60),
        isExpired: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [promo.tanggalSelesai]);

  if (timeLeft.isExpired) {
    return null;
  }

  const handleOrderWa = () => {
    const message = encodeURIComponent(
      `Halo Kaktus Coffee! Saya tertarik memesan promo terbaru "${promo.nama}" seharga Rp${promo.hargaPromo.toLocaleString('id-ID')} (Harga normal Rp${promo.hargaNormal.toLocaleString('id-ID')}). Mohon infonya.`
    );
    window.open(`https://wa.me/6285738662165?text=${message}`, '_blank');
  };

  const handleGrabFood = () => {
    if (onOrderGrabFood) {
      onOrderGrabFood();
    } else {
      const url = linkGrabFood || 'https://food.grab.com/id/id/restaurant/kaktus-coffee-eatery-galesong-delivery/6-CY3EFH3KLJK3J8';
      window.open(url, '_blank');
    }
  };

  return (
    <section id="promo" className="py-20 bg-elegant-green-900 relative overflow-hidden">
      {/* Decorative vector shape background */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-elegant-green-950 to-transparent" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/15 border border-red-500/30 rounded-full text-red-400 font-mono text-[10px] tracking-widest uppercase mb-4">
            <Flame size={12} className="animate-pulse" />
            Limited Promotional Offer
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            PROMO NEW <span className="text-accent-gold">LAUNCHING</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm font-sans mt-2 max-w-lg mx-auto">
            Jangan sampai ketinggalan penawaran terbatas dari kami. Nikmati menu terbaru dengan potongan harga spesial hari ini!
          </p>
        </div>

        {/* Promo Landing Ticket Card Box */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-accent-gold/25 relative overflow-hidden">
          {/* Top aesthetic corner badges */}
          <div className="absolute top-0 right-0 bg-accent-gold text-elegant-green-950 text-[10px] sm:text-xs font-mono font-bold px-5 py-2.5 rounded-bl-3xl tracking-widest uppercase shadow-md shadow-elegant-green-950/20 z-10 flex items-center gap-1">
            {promo.badge}
          </div>

          {/* Product Image Column */}
          <div className="md:col-span-5 relative group overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
            <img
              src={promo.fotoUrl}
              alt={promo.nama}
              className="w-full aspect-[4/3] md:aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-elegant-green-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="text-xs text-white bg-elegant-green-950/80 px-3 py-1 rounded-full border border-accent-gold/20 backdrop-blur-sm">
                Diskon Terbatas
              </span>
            </div>
          </div>

          {/* Info and Timer Column */}
          <div className="md:col-span-7 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-3">
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight uppercase tracking-tight">
                {promo.nama}
              </h3>
              
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-display font-black text-accent-gold">
                  Rp{promo.hargaPromo.toLocaleString('id-ID')}
                </span>
                <span className="text-sm sm:text-base text-gray-500 line-through">
                  Rp{promo.hargaNormal.toLocaleString('id-ID')}
                </span>
                <span className="bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-md">
                  Hemat {Math.round(((promo.hargaNormal - promo.hargaPromo) / promo.hargaNormal) * 100)}%
                </span>
              </div>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Paduan rasa unik yang dirancang khusus oleh master rasa kami untuk perayaan bulan ini. Nikmati sensasi signature premium dalam genggaman Anda.
              </p>
            </div>

            {/* Countdown Grid */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-gray-400 block font-semibold">
                Promo Berakhir Dalam:
              </span>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-sm">
                {/* Days */}
                <div className="bg-elegant-green-950/70 border border-accent-gold/15 p-2 sm:p-3 rounded-xl text-center backdrop-blur-sm">
                  <div className="text-lg sm:text-2xl font-mono font-bold text-white">
                    {String(timeLeft.hari).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-gray-400 tracking-wide mt-0.5">Hari</div>
                </div>
                {/* Hours */}
                <div className="bg-elegant-green-950/70 border border-accent-gold/15 p-2 sm:p-3 rounded-xl text-center backdrop-blur-sm">
                  <div className="text-lg sm:text-2xl font-mono font-bold text-white">
                    {String(timeLeft.jam).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-gray-400 tracking-wide mt-0.5">Jam</div>
                </div>
                {/* Min */}
                <div className="bg-elegant-green-950/70 border border-accent-gold/15 p-2 sm:p-3 rounded-xl text-center backdrop-blur-sm">
                  <div className="text-lg sm:text-2xl font-mono font-bold text-white">
                    {String(timeLeft.menit).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-gray-400 tracking-wide mt-0.5 font-semibold">Mnt</div>
                </div>
                {/* Sec */}
                <div className="bg-elegant-green-950/70 border border-accent-gold/15 p-2 sm:p-3 rounded-xl text-center backdrop-blur-sm relative overflow-hidden group">
                  <div className="text-lg sm:text-2xl font-mono font-bold text-accent-gold animate-pulse">
                    {String(timeLeft.detik).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-gray-400 tracking-wide mt-0.5">Det</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleOrderWa}
                className="inline-flex items-center justify-center gap-2 bg-accent-gold hover:bg-white text-elegant-green-950 font-display uppercase tracking-widest text-xs font-bold px-6 py-3.5 rounded-full transition-all duration-300 w-full sm:w-auto text-center cursor-pointer shadow-lg shadow-accent-gold/15"
              >
                <MessageCircle size={14} />
                Pesan via WhatsApp
              </button>
              <button
                onClick={handleGrabFood}
                className="inline-flex items-center justify-center gap-2 bg-[#00B14F] hover:bg-emerald-500 text-white font-display uppercase tracking-widest text-xs font-bold px-6 py-3.5 rounded-full transition-all duration-300 w-full sm:w-auto text-center cursor-pointer shadow-lg shadow-emerald-500/15"
              >
                <ExternalLink size={14} />
                Order via GrabFood
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
