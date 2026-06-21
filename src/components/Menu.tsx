import { useState, useMemo } from 'react';
import { Search, Coffee, Snowflake, Utensils, Cake, MessageCircle, ExternalLink } from 'lucide-react';
import { Produk } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface MenuProps {
  products: Produk[];
  linkGrabFood?: string;
  onOrderGrabFood?: () => void;
}

export default function Menu({ products, linkGrabFood, onOrderGrabFood }: MenuProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Coffee' | 'Non Coffee' | 'Main Dish' | 'Dessert'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'All', label: 'Semua', icon: Search },
    { id: 'Coffee', label: 'Coffee', icon: Coffee },
    { id: 'Non Coffee', label: 'Non Coffee', icon: Snowflake },
    { id: 'Main Dish', label: 'Main Dish', icon: Utensils },
    { id: 'Dessert', label: 'Dessert', icon: Cake }
  ] as const;

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.kategori === activeCategory;
      const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleOrderWa = (name: string, price: number) => {
    const message = encodeURIComponent(
      `Halo Kaktus Coffee! Saya tertarik untuk memesan "${name}" dengan harga Rp${price.toLocaleString(
        'id-ID'
      )} dari Menu Website Anda. Mohon informasi ketersediaannya.`
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
    <section id="menu" className="py-24 bg-elegant-green-900 border-t border-b border-accent-gold/10 relative">
      <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <span className="font-mono text-accent-gold uppercase tracking-widest text-xs font-semibold block">
            Crafted Gastronomy
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight">
            Eksplorasi <span className="text-accent-gold">Menu Kaktus</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto font-sans">
            Sajian premium kualitas terbaik yang diseduh, dipanggang, dan digoreng langsung oleh koki & barista berpengalaman kami.
          </p>
        </div>

        {/* Categories Tabs & Search Input Block */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 bg-elegant-green-950/80 border border-accent-gold/15 p-4 rounded-2xl backdrop-blur-md">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-accent-gold text-elegant-green-950 shadow-md shadow-accent-gold/15'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={12} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-3.5 top-2.5 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari menu favoritmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold transition-colors font-sans"
            />
          </div>
        </div>

        {/* Dynamic Menu Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="glass-panel-light rounded-xl overflow-hidden flex flex-col justify-between group hover:border-accent-gold/45 transition-all duration-300 border border-white/5"
              >
                {/* Thumb */}
                <div className="relative aspect-[4/3] overflow-hidden bg-elegant-green-950/40">
                  <ImageWithFallback
                    src={item.fotoUrl}
                    alt={item.nama}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.isBestSeller && (
                    <div className="absolute top-2.5 right-2.5 bg-accent-gold text-elegant-green-950 font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow">
                      BEST SELLER
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-display text-sm font-bold text-white group-hover:text-accent-gold transition-all line-clamp-1 uppercase">
                        {item.nama}
                      </h3>
                      <span className="text-accent-gold font-display font-bold text-xs">
                        Rp{item.harga.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <p className="text-[#a6bca2] text-[10px] uppercase font-mono tracking-wider">
                      {item.kategori}
                    </p>

                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => handleOrderWa(item.nama, item.harga)}
                      className="flex items-center justify-center gap-1 bg-white/5 hover:bg-[#25D366] hover:text-white text-gray-300 text-[10px] font-display font-semibold uppercase tracking-wider py-2 rounded-lg border border-white/10 hover:border-[#25D366] transition-all duration-300 cursor-pointer"
                    >
                      <MessageCircle size={11} />
                      WhatsApp
                    </button>
                    <button
                      onClick={handleGrabFood}
                      className="flex items-center justify-center gap-1 bg-[#00B14F] hover:bg-emerald-500 text-white text-[10px] font-display font-semibold uppercase tracking-wider py-2 rounded-lg transition-all duration-300 cursor-pointer"
                    >
                      <ExternalLink size={11} />
                      GrabFood
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel text-center py-12 rounded-2xl">
            <Coffee className="mx-auto text-gray-500 mb-3" size={32} />
            <p className="text-gray-400 text-sm font-sans font-medium">
              Menu yang Anda cari tidak ditemukan. Coba kata kunci lain atau pilih kategori yang berbeda.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
