import React, { useState } from 'react';
import { Calendar, User, Clock, Users, ArrowRight, HelpCircle, ChevronDown } from 'lucide-react';
import { Cabang } from '../types';

interface ReservasiProps {
  branches: Cabang[];
}

export default function Reservasi({ branches }: ReservasiProps) {
  const [formData, setFormData] = useState({
    nama: '',
    cabangId: branches[0]?.id || '',
    jam: '',
    jumlahOrang: '2 Orang'
  });

  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const [messageSent, setMessageSent] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = [
    { value: '01', name: 'Januari' },
    { value: '02', name: 'Februari' },
    { value: '03', name: 'Maret' },
    { value: '04', name: 'April' },
    { value: '05', name: 'Mei' },
    { value: '06', name: 'Juni' },
    { value: '07', name: 'Juli' },
    { value: '08', name: 'Agustus' },
    { value: '09', name: 'September' },
    { value: '10', name: 'Oktober' },
    { value: '11', name: 'November' },
    { value: '12', name: 'Desember' }
  ];
  const years = ['2026', '2027', '2028'];

  const timeOptions = [
    // Pagi
    { value: '08:00 Pagi', label: '08:00 Pagi', period: 'Pagi' },
    { value: '09:00 Pagi', label: '09:00 Pagi', period: 'Pagi' },
    { value: '10:00 Pagi', label: '10:00 Pagi', period: 'Pagi' },
    { value: '11:00 Pagi', label: '11:00 Pagi', period: 'Pagi' },
    // Siang
    { value: '12:00 Siang', label: '12:00 Siang', period: 'Siang' },
    { value: '13:00 Siang', label: '13:00 Siang', period: 'Siang' },
    { value: '14:00 Siang', label: '14:00 Siang', period: 'Siang' },
    { value: '15:00 Siang', label: '15:00 Siang', period: 'Siang' },
    { value: '16:00 Siang', label: '16:00 Siang', period: 'Siang' },
    { value: '17:00 Siang', label: '17:00 Siang', period: 'Siang' },
    // Malam
    { value: '18:00 Malam', label: '18:00 Malam', period: 'Malam' },
    { value: '19:00 Malam', label: '19:00 Malam', period: 'Malam' },
    { value: '20:00 Malam', label: '20:00 Malam', period: 'Malam' },
    { value: '21:00 Malam', label: '21:00 Malam', period: 'Malam' },
    { value: '22:00 Malam', label: '22:00 Malam', period: 'Malam' },
    { value: '23:00 Malam', label: '23:00 Malam', period: 'Malam' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !selectedDay || !selectedMonth || !selectedYear || !formData.jam) {
      alert('Mohon lengkapi semua kolom reservasi.');
      return;
    }

    // Find the target branch details to route the WhatsApp message correctly
    const targetBranch = branches.find((b) => b.id === formData.cabangId) || branches[0];
    const waNumber = targetBranch ? targetBranch.noWa : '6285738662165';

    const monthName = months.find((m) => m.value === selectedMonth)?.name || '';
    const formattedDate = `${selectedDay} ${monthName} ${selectedYear}`;

    // Format WA message
    const waText = encodeURIComponent(
      `Halo CS ${targetBranch.nama}! Saya ingin melakukan reservasi meja atas nama:\n\n` +
      `👤 Nama: ${formData.nama}\n` +
      `📍 Cabang: ${targetBranch.nama}\n` +
      `📅 Tanggal: ${formattedDate}\n` +
      `⏰ Jam Datang: ${formData.jam}\n` +
      `👥 Jumlah Orang: ${formData.jumlahOrang}\n\n` +
      `Mohon konfirmasi ketersediaan meja kami. Terima kasih!`
    );

    const waUrl = `https://wa.me/${6285738662165}?text=${waText}`;
    window.open(waUrl, '_blank');
    setMessageSent(true);

    setTimeout(() => {
      setMessageSent(false);
    }, 4000);
  };

  return (
    <section id="reserve" className="py-24 bg-elegant-green-950 relative overflow-hidden">
      {/* Decorative vectors */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <span className="font-mono text-accent-gold uppercase tracking-widest text-xs font-semibold block">
            Table Reservations
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight">
            Reservasi <span className="text-accent-gold">Meja Anda</span>
          </h2>
          <div className="w-16 h-[2px] bg-accent-gold mx-auto my-3" />
          <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto font-sans">
            Amankan meja atau ruang pertemuan eksklusif Anda di cabang favorit lebih awal. Cepat, instan, dan terkonfirmasi langsung melalui CS Cabang.
          </p>
        </div>

        {/* Polished Reservation Card */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-accent-gold/25 relative overflow-hidden">
          {/* Subtle glow border at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent" />

          {messageSent && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-xs sm:text-sm rounded-xl text-center font-medium animate-fade-in">
              🎉 Reservasi berhasil dikirim! Silakan selesaikan pesan di jendela WhatsApp Anda.
            </div>
          )}

          <form onSubmit={handleBookSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold" htmlFor="nama">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    <User size={16} />
                  </span>
                  <input
                    id="nama"
                    type="text"
                    name="nama"
                    required
                    placeholder="Nama Anda..."
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold" htmlFor="cabangId">
                  Pilih Cabang Kaktus
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    <Calendar size={16} />
                  </span>
                  <select
                    id="cabangId"
                    name="cabangId"
                    value={formData.cabangId}
                    onChange={handleChange}
                    className="w-full bg-elegant-green-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30 transition-all font-sans appearance-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="bg-elegant-green-950">
                        {b.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold">
                  Pilih Tanggal Datang (Hari, Bulan, Tahun)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Tanggal */}
                  <div className="relative">
                    <select
                      id="selectedDay"
                      name="selectedDay"
                      required
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full bg-elegant-green-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30 transition-all font-sans appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-elegant-green-950 text-gray-400">Hari (dd)</option>
                      {days.map((d) => (
                        <option key={d} value={d} className="bg-elegant-green-950">
                          {d}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-accent-gold/80">
                      <ChevronDown size={14} />
                    </div>
                  </div>

                  {/* Bulan */}
                  <div className="relative">
                    <select
                      id="selectedMonth"
                      name="selectedMonth"
                      required
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full bg-elegant-green-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30 transition-all font-sans appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-elegant-green-950 text-gray-400">Bulan (mm)</option>
                      {months.map((m) => (
                        <option key={m.value} value={m.value} className="bg-elegant-green-950">
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-accent-gold/80">
                      <ChevronDown size={14} />
                    </div>
                  </div>

                  {/* Tahun */}
                  <div className="relative">
                    <select
                      id="selectedYear"
                      name="selectedYear"
                      required
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full bg-elegant-green-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30 transition-all font-sans appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-elegant-green-950 text-gray-400">Tahun (yy)</option>
                      {years.map((y) => (
                        <option key={y} value={y} className="bg-elegant-green-950">
                          {y}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-accent-gold/80">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold" htmlFor="jam">
                  Pilih Waktu / Jam
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 z-10">
                    <Clock size={16} />
                  </span>
                  <select
                    id="jam"
                    name="jam"
                    required
                    value={formData.jam}
                    onChange={handleChange}
                    className="w-full bg-elegant-green-950 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30 transition-all font-sans appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-elegant-green-950 text-gray-400">Pilih Jam...</option>
                    <optgroup label="☀️ PAGI" className="bg-elegant-green-950 font-semibold text-accent-gold">
                      {timeOptions.filter(t => t.period === 'Pagi').map((t) => (
                        <option key={t.value} value={t.value} className="bg-elegant-green-950 text-white font-normal">
                          {t.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌤️ SIANG" className="bg-elegant-green-950 font-semibold text-accent-gold">
                      {timeOptions.filter(t => t.period === 'Siang').map((t) => (
                        <option key={t.value} value={t.value} className="bg-elegant-green-950 text-white font-normal">
                          {t.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌙 MALAM" className="bg-elegant-green-950 font-semibold text-accent-gold">
                      {timeOptions.filter(t => t.period === 'Malam').map((t) => (
                        <option key={t.value} value={t.value} className="bg-elegant-green-950 text-white font-normal">
                          {t.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-accent-gold/80">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Total Pack */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold" htmlFor="jumlahOrang">
                  Berapa Banyak Orang?
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    <Users size={16} />
                  </span>
                  <select
                    id="jumlahOrang"
                    name="jumlahOrang"
                    value={formData.jumlahOrang}
                    onChange={handleChange}
                    className="w-full bg-elegant-green-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30 transition-all font-sans appearance-none"
                  >
                    <option value="1 Orang">1 Orang (Meja Bar / Solo)</option>
                    <option value="2 Orang">2 Orang (Pasangan)</option>
                    <option value="3-4 Orang">3-4 Orang (Keluarga Sedang / Teman)</option>
                    <option value="5-8 Orang">5-8 Orang (Grup Besar / Meeting Kecil)</option>
                    <option value="8+ Orang">8+ Orang (Meeting Ruang VIP Eksklusif)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Note text info */}
            <div className="flex items-start gap-2 text-[11px] text-gray-400 font-sans leading-relaxed pt-2">
              <HelpCircle size={14} className="text-accent-gold shrink-0 mt-0.5" />
              <p>
                Informasi: Mengirim form ini akan mengarahkan Anda langsung ke jendela WhatsApp nomor Customer Service cabang yang dipilih demi konfirmasi langsung yang instan tanpa sistem antrean manual.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-accent-gold text-elegant-green-950 px-8 py-4 rounded-xl font-display uppercase tracking-widest text-xs font-black hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-lg cursor-pointer"
              >
                Kirim Reservasi Ke WhatsApp Cabang
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>

      </div>
    </section>
  );
}
