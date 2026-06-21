import React, { useState, useEffect } from 'react';
import { Star, Quote, Plus, X, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Review } from '../types';

export default function Testimoni() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review submission state
  const [showForm, setShowForm] = useState(false);
  const [nama, setNama] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [ulasan, setUlasan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pagination limit for reviews display to keep page beautifully clean
  const [visibleCount, setVisibleCount] = useState(6);

  // Real-time listener for ALL reviews
  useEffect(() => {
    const reviewsRef = collection(db, 'reviews');
    const unsubscribe = onSnapshot(reviewsRef, (snapshot) => {
      const list: Review[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          nama: data.nama || '',
          rating: Number(data.rating) || 5,
          ulasan: data.ulasan || '',
          status: data.status || 'pending',
          createdAt: Number(data.createdAt) || Date.now()
        });
      });
      setReviews(list);
      setLoading(false);
    }, (error) => {
      if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        try {
          handleFirestoreError(error, OperationType.GET, 'reviews');
        } catch (err) {
          console.error("[Firebase Testimonial] Error loading reviews in real-time:", error);
        }
      } else {
        console.error("[Firebase Testimonial] Error loading reviews in real-time:", error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter approved and sort client-side (100% resilient to composite index errors!)
  const approvedReviews = reviews
    .filter(r => r.status === 'approved')
    .sort((a, b) => b.createdAt - a.createdAt);

  // Stats calculations
  const totalCount = approvedReviews.length;
  const averageRatingRaw = totalCount > 0 
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount 
    : 5.0;
  const averageRating = Math.round(averageRatingRaw * 10) / 10; // e.g. 4.8

  // Star breakdown calculation
  const starBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  approvedReviews.forEach(r => {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1|2|3|4|5;
    starBreakdown[rounded]++;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validations
    if (!nama.trim()) {
      setErrorMessage('Nama wajib diisi.');
      return;
    }
    if (nama.trim().length < 3) {
      setErrorMessage('Nama minimal terdiri dari 3 karakter.');
      return;
    }
    if (!ulasan.trim()) {
      setErrorMessage('Isi ulasan wajib diisi.');
      return;
    }
    if (ulasan.trim().length < 10) {
      setErrorMessage('Ulasan minimal terdiri dari 10 karakter.');
      return;
    }
    if (ulasan.trim().length > 500) {
      setErrorMessage('Ulasan maksimal terdiri dari 500 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const newReviewId = 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      
      const newReview: Review = {
        id: newReviewId,
        nama: nama.trim(),
        rating,
        ulasan: ulasan.trim(),
        status: 'pending', // Pending by default as requested!
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'reviews', newReviewId), newReview);
      
      // Success flow
      setSubmitSuccess(true);
      setNama('');
      setRating(5);
      setUlasan('');
      
      // Reset success status and hide form after 4 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 4000);

    } catch (err: any) {
      console.error("[Firebase Testimonial] Error adding review:", err);
      setErrorMessage('Gagal mengirim ulasan. Silakan coba sesaat lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format Indonesian Dates
  const formatIndonesianDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Star ratings labels
  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5: return 'Sangat Sempurna!';
      case 4: return 'Sangat Bagus & Lezat!';
      case 3: return 'Bagus, Cukup Memuaskan.';
      case 2: return 'Masih Perlu Peningkatan.';
      case 1: return 'Sangat Mengecewakan.';
      default: return '';
    }
  };

  return (
    <section id="testimonial" className="py-24 bg-elegant-green-950 border-t border-b border-accent-gold/10 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute left-10 top-1/2 text-white/5 font-serif text-[180px] select-none pointer-events-none leading-none">
        &ldquo;
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="font-mono text-accent-gold uppercase tracking-widest text-[10px] sm:text-xs font-semibold block">
            Guest Experiences
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight">
            Ulasan <span className="text-accent-gold">Customer</span>
          </h2>
          <div className="w-16 h-[2px] bg-accent-gold mx-auto my-3" />
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto font-sans leading-relaxed">
            Semua ulasan real-time yang secara jujur diberikan langsung oleh pengunjung setia bakeshop dan cafe kami.
          </p>
        </div>

        {/* Real-time statistics block */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-accent-gold/15 mb-12 flex flex-col md:flex-row gap-8 items-center justify-between shadow-xl">
          {/* Rating Large Panel */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start gap-2.5">
            <span className="text-gray-400 text-xs uppercase font-mono tracking-wider font-semibold">Rata-rata Rating</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-display font-black text-white">{totalCount > 0 ? averageRating.toFixed(1) : '5.0'}</span>
              <span className="text-lg text-gray-500 font-medium">/ 5.0</span>
            </div>
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex gap-1 text-accent-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    className={`${i < Math.round(averageRating) ? 'fill-accent-gold text-accent-gold' : 'text-gray-600'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 font-sans mt-1">Berdasarkan {totalCount} ulasan tervalidasi</span>
            </div>
          </div>

          {/* Star Breakdown Columns */}
          <div className="flex-1 max-w-xs sm:max-w-md w-full space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starBreakdown[stars as 1|2|3|4|5] || 0;
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2.5 text-xs text-gray-300 font-sans">
                  <span className="w-3 text-right font-bold text-gray-400">{stars}</span>
                  <Star size={11} className="fill-accent-gold text-accent-gold shrink-0" />
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="bg-accent-gold h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-500 font-mono">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Call to action - Write Review */}
          <div className="w-full md:w-auto text-center">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setSubmitSuccess(false);
                setErrorMessage('');
              }}
              className="w-full md:w-auto bg-accent-gold hover:bg-white text-elegant-green-950 px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider font-display font-black transition-all cursor-pointer shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              id="btn-tulis-ulasan"
            >
              {showForm ? <X size={15} /> : <Plus size={15} />}
              {showForm ? 'Batal Menulis' : 'Tulis Ulasan'}
            </button>
          </div>
        </div>

        {/* Collapsible Write Review Form with slide effects */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="bg-elegant-green-900/60 border border-accent-gold/25 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <MessageSquare size={22} className="text-accent-gold" />
                  <div>
                    <h3 className="font-display text-base font-bold text-white uppercase tracking-tight">Bagikan Pengalaman Anda</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">Masukan berharga Anda membantu kami memelihara kualitas kopi & pelayanan.</p>
                  </div>
                </div>

                {submitSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="py-10 text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-2">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">Ulasan Berhasil Dikirim!</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto font-sans">
                      Terima kasih atas ulasan manis Anda. Sebagai kebijakan moderasi kafe, ulasan Anda akan diperiksa & segera ditampilkan oleh admin.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {errorMessage && (
                      <div className="p-3.5 bg-red-500/15 border border-red-500/35 rounded-xl text-xs text-red-300 font-sans">
                        ⚠️ {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] uppercase font-mono tracking-widest text-gray-400 font-bold">Nama Customer</label>
                        <input
                          type="text"
                          required
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          placeholder="Masukkan nama lengkap"
                          className="w-full bg-elegant-green-950/80 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-accent-gold/50 focus:outline-none focus:ring-1 focus:ring-accent-gold/40 transition-all font-sans"
                        />
                      </div>

                      {/* Interactive Stars selector */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] uppercase font-mono tracking-widest text-gray-400 font-bold">Rating Bintang</label>
                        <div className="flex items-center gap-3 py-1">
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((starValue) => {
                              const active = starValue <= (hoveredRating ?? rating);
                              return (
                                <button
                                  type="button"
                                  key={starValue}
                                  onClick={() => setRating(starValue)}
                                  onMouseEnter={() => setHoveredRating(starValue)}
                                  onMouseLeave={() => setHoveredRating(null)}
                                  className="text-gray-600 hover:scale-110 transition-transform cursor-pointer"
                                >
                                  <Star 
                                    size={23} 
                                    className={`${active ? 'fill-accent-gold text-accent-gold' : 'text-gray-600'}`} 
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <span className="text-[11px] font-mono text-accent-gold font-bold uppercase shrink-0">
                            {getRatingLabel(hoveredRating ?? rating)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review text box */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between items-baseline">
                        <label className="block text-[11px] uppercase font-mono tracking-widest text-gray-400 font-bold">Ulasan Anda</label>
                        <span className="text-[10px] text-gray-500 font-mono">{ulasan.length}/500</span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        value={ulasan}
                        onChange={(e) => setUlasan(e.target.value.slice(0, 500))}
                        placeholder="Contoh: Kopinya sangat mantap dan creamyyy. Bakeshop kuenya juga lembut banget! Suasana tempat aduhaaaai..."
                        className="w-full bg-elegant-green-950/80 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-accent-gold/50 focus:outline-none focus:ring-1 focus:ring-accent-gold/40 transition-all font-sans resize-none"
                      />
                    </div>

                    {/* Action button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-accent-gold hover:bg-white text-elegant-green-950 border border-transparent hover:border-elegant-green-950 disabled:bg-gray-700 px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider font-display font-black transition-all cursor-pointer shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-3 h-3 border-2 border-elegant-green-950 border-t-transparent rounded-full animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send size={13} />
                            Kirim Ulasan Saya
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Approved reviews Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400 font-mono tracking-wider">MENGHUBUNGKAN SECARA REAL-TIME...</p>
          </div>
        ) : approvedReviews.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/2">
            <Quote size={28} className="text-gray-600 mx-auto mb-3" />
            <span className="block text-sm font-bold text-white font-display uppercase tracking-wider mb-1">Belum Ada Ulasan Publik</span>
            <p className="text-gray-400 text-xs font-sans max-w-sm mx-auto">
              Jadilah yang pertama menuliskan ulasan manis atau saran membara untuk Cafe Kaktus!
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 3-Column Reviews Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {approvedReviews.slice(0, visibleCount).map((review) => {
                // Consistency initials avatar URL matching the requirement
                const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(review.nama)}&backgroundType=gradientLinear&fontSize=42`;

                return (
                  <motion.div
                    key={review.id}
                    layoutId={review.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="glass-panel p-8 rounded-2xl flex flex-col justify-between border border-accent-gold/15 relative hover:border-accent-gold/40 transition-all duration-300 hover:-translate-y-1 shadow-md bg-elegant-green-900/45 text-left"
                  >
                    <div className="space-y-4">
                      {/* Rating stars & Date */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1 text-accent-gold">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={`${i < review.rating ? 'fill-accent-gold text-accent-gold' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {formatIndonesianDate(review.createdAt)}
                        </span>
                      </div>

                      {/* Review text */}
                      <p className="text-gray-300 text-xs sm:text-sm font-sans leading-relaxed italic relative">
                        &ldquo;{review.ulasan}&rdquo;
                      </p>
                    </div>

                    {/* Guest Profile card bottom row */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/5 mt-6">
                      <img
                        src={avatarUrl}
                        alt={review.nama}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-accent-gold/25"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h4 className="font-display text-sm font-bold text-white uppercase tracking-tight truncate">
                          {review.nama}
                        </h4>
                        <span className="block text-[8px] uppercase font-mono tracking-widest text-accent-gold font-bold">
                          Verified Guest
                        </span>
                      </div>
                      <Quote size={18} className="ml-auto text-white/10 shrink-0" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* View More Button if more reviews are available */}
            {approvedReviews.length > visibleCount && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="bg-transparent hover:bg-white/5 text-accent-gold border border-accent-gold/30 hover:border-accent-gold px-6 py-3 rounded-xl text-[10px] sm:text-xs uppercase tracking-widest font-mono font-bold transition-all cursor-pointer"
                >
                  Tampilkan Lebih Banyak
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
