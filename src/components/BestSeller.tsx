import { Star, MessageCircle } from 'lucide-react';
import { Produk } from '../types';

interface BestSellerProps {
  products: Produk[];
}

export default function BestSeller({ products }: BestSellerProps) {
  // Filter for best seller products and cap at 6 items max
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 6);

  if (bestSellers.length === 0) {
    return null;
  }

  const handleOrderWa = (name: string, price: number) => {
    const message = encodeURIComponent(
      `Halo Kaktus Coffee! Saya ingin memesan salah satu Best Seller favorit Anda: "${name}" seharga Rp${price.toLocaleString(
        'id-ID'
      )}. Mohon informasi ketersediaannya.`
    );
    window.open(`https://wa.me/6285738662165?text=${message}`, '_blank');
  };

  return (
    <section id="bestseller" className="py-24 bg-elegant-green-950 relative overflow-hidden">
      {/* Decorative Blur Ambient */}
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="font-mono text-accent-gold uppercase tracking-widest text-xs font-semibold block">
            Most Loved Specialties
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight">
            Menu <span className="text-accent-gold">Terlaris Kami</span>
          </h2>
          <div className="w-16 h-[2px] bg-accent-gold mx-auto my-3" />
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto font-sans">
            Rekomendasi terbaik yang paling sering dipesan oleh pelanggan setia kami di seluruh cabang Kaktus Coffee.
          </p>
        </div>

        {/* 3x2 Grid for Desktop, list on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {bestSellers.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-2xl overflow-hidden group hover:border-accent-gold/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Product Photo Box */}
              <div className="relative aspect-[4/3] overflow-hidden bg-elegant-green-950/20 border-b border-accent-gold/10">
                <img
                  src={item.fotoUrl}
                  alt={item.nama}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                
                {/* Visual Glass Tag */}
                <div className="absolute top-3 left-3 bg-elegant-green-950/80 border border-accent-gold/30 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Star size={12} className="fill-accent-gold text-accent-gold" />
                  <span className="text-[10px] font-mono tracking-wider text-accent-gold uppercase font-semibold">
                    Best Seller
                  </span>
                </div>
              </div>

              {/* Product Info Block */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-accent-gold transition-colors uppercase tracking-tight line-clamp-1">
                      {item.nama}
                    </h3>
                    <span className="text-accent-gold font-display font-black text-sm px-2.5 py-0.5 rounded bg-accent-gold/10 whitespace-nowrap">
                      Rp{item.harga.toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  {/* Category Pill */}
                  <span className="inline-block text-[9px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    {item.kategori}
                  </span>

                  <p className="text-gray-400 text-xs sm:text-sm font-sans line-clamp-3 leading-relaxed pt-1">
                    {item.deskripsi}
                  </p>
                </div>

                {/* Card Button */}
                <div className="pt-5 mt-auto">
                  <button
                    onClick={() => handleOrderWa(item.nama, item.harga)}
                    className="w-full flex items-center justify-center gap-2 border border-accent-gold/20 bg-accent-gold/5 group-hover:bg-accent-gold group-hover:text-elegant-green-950 text-accent-gold py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all duration-300"
                  >
                    <MessageCircle size={14} />
                    Pesan Menu Ini
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
