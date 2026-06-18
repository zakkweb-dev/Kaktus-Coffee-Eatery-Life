import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../data';

export default function Testimoni() {
  return (
    <section id="testimonial" className="py-24 bg-elegant-green-900 border-t border-b border-accent-gold/10 relative overflow-hidden">
      {/* Decorative Blur and quote watermarks */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute left-10 top-1/2 text-white/5 font-serif text-[180px] select-none pointer-events-none leading-none">
        &ldquo;
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="font-mono text-accent-gold uppercase tracking-widest text-xs font-semibold block">
            Guest Experiences
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight">
            Apa <span className="text-accent-gold">Kata Mereka?</span>
          </h2>
          <div className="w-16 h-[2px] bg-accent-gold mx-auto my-3" />
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto font-sans">
            Ulasan jujur dari para pecinta kopi, ilustrator, hingga komunitas bisnis yang rutin menghabiskan hari di ruang kolaboratif kami.
          </p>
        </div>

        {/* 3-Column Reviews Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="glass-panel p-8 rounded-2xl flex flex-col justify-between border border-accent-gold/15 relative hover:border-accent-gold/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Rating stars */}
                <div className="flex gap-1 text-accent-gold">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-accent-gold" />
                  ))}
                </div>

                <p className="text-gray-300 text-xs sm:text-sm font-sans leading-relaxed italic relative">
                  &ldquo;{review.ulasan}&rdquo;
                </p>
              </div>

              {/* Guest Profile card bottom row */}
              <div className="flex items-center gap-4.5 pt-6 border-t border-white/5 mt-6">
                <img
                  src={review.foto}
                  alt={review.nama}
                  className="w-11 h-11 rounded-full object-cover border border-accent-gold/25"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-display text-sm font-bold text-white uppercase tracking-tight">
                    {review.nama}
                  </h4>
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-accent-gold/80 font-semibold">
                    {review.peran}
                  </span>
                </div>
                <Quote size={20} className="ml-auto text-white/10 shrink-0" />
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
