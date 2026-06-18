import { Award, Music, Shield, Store } from 'lucide-react';

export default function About() {
  const stats = [
    { id: 'stat-1', value: '3 Cabang', label: 'Makassar & Takalar', icon: Store },
    { id: 'stat-2', value: '300+ Review', label: 'Bintang 5 Google Maps', icon: Award },
    { id: 'stat-3', value: 'VIP Room', label: 'AC, proyektor & kedap suara', icon: Shield },
    { id: 'stat-4', value: 'Live Music', label: 'Hiburan akustik akhir pekan', icon: Music }
  ];

  return (
    <section id="about" className="py-24 bg-elegant-green-950 border-t border-accent-gold/10 relative overflow-hidden">
      {/* Subtle details background */}
      <div className="absolute right-0 top-1/2 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Aesthetic story block (left column) */}
          <div className="lg:col-span-7 space-y-6">
            <span className="font-mono text-accent-gold uppercase tracking-widest text-xs font-semibold block">
              About Our Heritage
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase">
              Bukan Sekadar Kopi, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-emerald-400 font-light italic">
                Ini Adalah Refleksi Gaya Hidup
              </span>
            </h2>
            
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Berdiri sejak tahun 2022, <strong className="text-white">Kaktus Coffee Eatery Life</strong> lahir dari kecintaan kami terhadap kopi specialty nusantara dan keinginan menciptakan wadah di mana setiap individu bisa bersantai, berkolaborasi, dan merayakan momen-momen berharga dalam hidup. Nama &lsquo;Kaktus&rsquo; melambangkan kekuatan, adaptasi tinggi, serta keindahan estetik yang tahan menghadapi segala iklim.
            </p>

            <blockquote className="border-l-2 border-accent-gold pl-4 font-serif italic text-gray-400 text-sm sm:text-base md:my-6">
              &ldquo;Kaktus adalah filosofi ketahanan. Kami berupaya untuk sekuat kaktus gurun, menghadirkan kesegaran oasis di tengah hiruk-pikuk kehidupan modern.&rdquo;
            </blockquote>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Di setiap cabang kami-baik di Galesong Utara, Kawasan Industri Parangloe, maupun Budi Luhur-kami mendesain tata ruang berkonsep industrial asri dipadukan dengan tanaman hias cacti eksotis. Tim barista profesional kami mengurasi biji kopi arabika pilihan dengan pemanggangan presisi, siap menyambut Anda setiap hari.
            </p>
          </div>

          {/* Stats Bento Grid (right column) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.id}
                  className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-accent-gold/45 transition-all duration-300 hover:-translate-y-1 block"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent-gold/10 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <div className="w-10 h-10 rounded-full bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold mb-4 group-hover:bg-accent-gold group-hover:text-elegant-green-950 transition-colors duration-300">
                    <Icon size={18} />
                  </div>
                  
                  <div className="text-2xl font-display font-extrabold text-white group-hover:text-accent-gold transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400 font-sans mt-1 group-hover:text-white transition-colors">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
