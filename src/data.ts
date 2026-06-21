import { Produk, Launching, Event, Galeri, Cabang, FullDatabase, CustomCake } from './types';

// Dynamic date strings for promotional offer
const getFutureDateString = (daysAhead: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(23, 59, 59, 0);
  return date.toISOString();
};

const getPastDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const INITIAL_PRODUCTS: Produk[] = [
  {
    id: 'prod-1',
    nama: 'Kaktus Signature Latte',
    kategori: 'Coffee',
    harga: 32000,
    deskripsi: 'Latte specialty dengan racikan espreso house blend, sirup aren rahasia, dan hiasan latte art daun kaktus yang ikonik. Sangat lembut di lidah.',
    isBestSeller: true,
    fotoUrl: '/src/assets/images/kaktus_signature_latte_1781599670742.jpg'
  },
  {
    id: 'prod-2',
    nama: 'Espresso Double Shot',
    kategori: 'Coffee',
    harga: 22000,
    deskripsi: 'Ekstraksi kopi murni bertekanan tinggi dari biji kopi arabika lokal premium pilihan dengan crema tebal berwarna hazelnut.',
    isBestSeller: false,
    fotoUrl: 'https://images.unsplash.com/photo-1510707577719-ee7c182acb3d?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'prod-3',
    nama: 'Ice Charcoal Macchiato',
    kategori: 'Coffee',
    harga: 34000,
    deskripsi: 'Kombinasi espreso premium, susu segar dingin, dan bubuk charcoal aktif organik yang memberikan sensasi earthy yang seimbang.',
    isBestSeller: true,
    fotoUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'prod-4',
    nama: 'Emerald Matcha Latte',
    kategori: 'Non Coffee',
    harga: 28000,
    deskripsi: 'Matcha murni Uji, Jepang grade premium yang dikocok dengan susu oat hangat bebas laktosa dan sentuhan madu hutan liar.',
    isBestSeller: true,
    fotoUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'prod-5',
    nama: 'Lychee Clover Mojito',
    kategori: 'Non Coffee',
    harga: 26000,
    deskripsi: 'Minuman mocktail segar dengan buah leci pilihan, mint organik segar, jeruk nipis peras, dan air soda premium.',
    isBestSeller: false,
    fotoUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'prod-6',
    nama: 'Ruby Velvet Frappe',
    kategori: 'Non Coffee',
    harga: 29000,
    deskripsi: 'Red velvet premium bertekstur kental diblender halus dengan es batu, krim kocok rumahan, dan taburan chocolate shavings.',
    isBestSeller: false,
    fotoUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'prod-7',
    nama: 'Nasi Goreng Kaktus Special',
    kategori: 'Main Dish',
    harga: 42000,
    deskripsi: 'Nasi goreng bumbu rempah nusantara otentik, disajikan bersama sate ayam bumbu kacang, telur mata sapi, kerupuk udang, dan acar segar.',
    isBestSeller: true,
    fotoUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'prod-8',
    nama: 'Smoked Beef Aglio Olio',
    kategori: 'Main Dish',
    harga: 38000,
    deskripsi: 'Pasta al dente klasik yang ditumis dengan minyak zaitun extra virgin, irisan smoked beef tebal, bawang putih melimpah, dan cabai kering giling.',
    isBestSeller: false,
    fotoUrl: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'prod-9',
    nama: 'Grilled Chicken Herb Steak',
    kategori: 'Main Dish',
    harga: 55000,
    deskripsi: 'Dada ayam tanpa tulang empuk bermarinasi rempah dipanggang sempurna, disiram saus creamy mushroom liar, disajikan dengan kentang tumbuk lembut.',
    isBestSeller: true,
    fotoUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'prod-10',
    nama: 'Classic Butter Croissant',
    kategori: 'Dessert',
    harga: 24000,
    deskripsi: 'Croissant khas Perancis berlapis-lapis renyah di luar, berongga lembut di dalam dengan wangi mentega premium yang menggugah selera.',
    isBestSeller: false,
    fotoUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'prod-11',
    nama: 'Lavish Chocolate Lava',
    kategori: 'Dessert',
    harga: 35000,
    deskripsi: 'Kue cokelat hangat dengan lelehan cokelat hitam kental Belgia di bagian tengah, disajikan berdampingan satu sekop es krim vanila bourbon.',
    isBestSeller: true,
    fotoUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'prod-12',
    nama: 'Matcha Gateau Tiramisu',
    kategori: 'Dessert',
    harga: 36000,
    deskripsi: 'Lapisan biskuit ladyfinger yang direndam espresso dan matcha, dilapisi krim mascarpone manis dan taburan bubuk teh hijau rami premium.',
    isBestSeller: false,
    fotoUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop'
  }
];

export const INITIAL_LAUNCHES: Launching[] = [
  {
    id: 'launch-1',
    nama: 'Minty Emerald Cactus Cold Brew',
    hargaNormal: 38000,
    hargaPromo: 28000,
    tanggalMulai: getPastDateString(1),
    tanggalSelesai: getFutureDateString(3),
    badge: '🚀 Launching',
    fotoUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop',
    isActive: true
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'event-1',
    nama: 'Galesong Acoustica Live',
    deskripsi: 'Nikmati suasana senja pantai yang damai ditemani penampilan live band akustik yang membawakan lagu-lagu Top 40 terpilih untuk bersantai.',
    tanggal: 'Setiap Jumat Malam, 19:30 - Selesai',
    fotoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'event-2',
    nama: 'Big Match Nobar Bersama',
    deskripsi: 'Dukung klub sepakbola favoritmu dalam duel sengit babak final UCL di layar proyektor raksasa. Rasakan keseruan gemuruh suporter di cabang Parangloe.',
    tanggal: 'Sabtu Malam, 23:00 - Selesai',
    fotoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'event-3',
    nama: 'Community Coffee Gathering',
    deskripsi: 'Kelas menyeduh manual (V60 & French Press) santai bersama Barista Champions kami. Bagikan cerita kopi favoritmu di cabang Budi Luhur.',
    tanggal: 'Minggu Pagi, 09:00 - 11:30',
    fotoUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600&auto=format&fit=crop'
  }
];

export const INITIAL_GALLERY: Galeri[] = [
  { id: 'gal-1', fotoUrl: '/src/assets/images/kaktus_hero_banner_1781599649978.jpg', deskripsi: 'Interior elegan Kaktus Galesong dengan tanaman gurun minimalis' },
  { id: 'gal-2', fotoUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop', deskripsi: 'Espresso extraction berkualitas tinggi dengan crema cokelat merata' },
  { id: 'gal-3', fotoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop', deskripsi: 'Pojok membaca santai di bawah bayangan pohon tropis hijau' },
  { id: 'gal-4', fotoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop', deskripsi: 'Pelanggan menikmati sore hari di area outdoor Kaktus Parangloe' },
  { id: 'gal-5', fotoUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&auto=format&fit=crop', deskripsi: 'Sajian Latte hangat dengan latte art premium buatan barista bersertifikat' },
  { id: 'gal-6', fotoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop', deskripsi: 'Meeting Room eksklusif di cabang Budi Luhur berkapasitas hingga 15 orang' }
];

export const INITIAL_BRANCHES: Cabang[] = [
  {
    id: 'cab-1',
    nama: 'Kaktus Galesong',
    alamat: 'Jl. Poros Galesong Utara No. 89, Takalar (Dekat Dermaga Galesong Pantai Kuning)',
    jamOperasional: 'Senin - Minggu: 09:00 - 23:00',
    mapsUrl: 'https://maps.google.com/?q=-5.321853,119.366479',
    noWa: '6285738662165',
    fotoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'cab-2',
    nama: 'Kaktus Parangloe',
    alamat: 'Kawasan Industri Parangloe Raya Blok C-12, Makassar (Samping Kantor Bea Cukai)',
    jamOperasional: 'Senin - Sabtu: 08:00 - 22:00 (Minggu Tutup)',
    mapsUrl: 'https://maps.google.com/?q=-5.111452,119.467812',
    noWa: '6285738662165',
    fotoUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'cab-3',
    nama: 'Kaktus Budi Luhur',
    alamat: 'Jl. Budi Luhur No. 45, Rappocini, Makassar (Dekat Kampus Universitas Negeri)',
    jamOperasional: 'Senin - Minggu: 07:00 - 24:00',
    mapsUrl: 'https://maps.google.com/?q=-5.161094,119.431289',
    noWa: '6285738662165',
    fotoUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=600&auto=format&fit=crop'
  }
];

export const INITIAL_CUSTOM_CAKE: CustomCake[] = [
  {
    id: 'cake-1',
    nama: 'Chocolatier Velvet Cactus Cake',
    deskripsi: 'Kue lapis cokelat premium Belgia bertingkat yang dihias dengan fondant kaktus xerofit estetik buatan tangan. Cocok untuk ulang tahun bertema gurun pasir modern.',
    hargaMulai: 250000,
    fotoUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop',
    pilihanRasa: 'Triple Dark Chocolate, Hazelnut Mousse',
    isActive: true
  },
  {
    id: 'cake-2',
    nama: 'Emerald Matcha Succulent Cake',
    deskripsi: 'Kue berbahan dasar teh hijau matcha Uji murni yang mewah, dihias cantik menggunakan buttercream succulent membentuk aneka tanaman kaktus hias mini hijau yang menawan.',
    hargaMulai: 220000,
    fotoUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?q=80&w=600&auto=format&fit=crop',
    pilihanRasa: 'Matcha Green Tea, Vanilla Bean',
    isActive: true
  },
  {
    id: 'cake-3',
    nama: 'Rustic Terracotta Arid Cake',
    deskripsi: 'Kue pernikahan bertema rustic gurun pasir elegan. Menggunakan dekorasi bunga terracotta kering yang eksotis dipadukan fondant bertekstur pasir koral halus.',
    hargaMulai: 450000,
    fotoUrl: 'https://images.unsplash.com/photo-1511018556340-d16986a1c194?q=80&w=600&auto=format&fit=crop',
    pilihanRasa: 'Salted Caramel, Classic Madagascar Vanilla',
    isActive: true
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    nama: 'Rian Adisatya',
    peran: 'Creative Director',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    ulasan: 'Kaktus Galesong adalah tempat penenang terbaik saya sepulang kerja. Kaktus Signature Latte rasanya luar biasa lembut dan tidak terlalu manis, pas berpadu dengan deburan angin pantai.'
  },
  {
    id: 2,
    nama: 'Sarah Amanda',
    peran: 'Freelance Illustrator',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    ulasan: 'Wi-Fi super kencang di cabang Budi Luhur sangat menunjang deadline ilustrasi saya. Makanan beratnya seperti Smoked Beef Aglio Olio porsinya mengenyangkan dan gurihnya pas!'
  },
  {
    id: 3,
    nama: 'Hendra Wijaya',
    peran: 'Startup Founder',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    ulasan: 'Saya sering memesan Meeting Room di Kaktus Parangloe bersama klien industri saya. Tempatnya sangat representatif, layanan tenang, ramah, dan hidangan makanan premium.'
  }
];

export const INITIAL_DATABASE: FullDatabase = {
  produk: INITIAL_PRODUCTS,
  launching: INITIAL_LAUNCHES,
  event: INITIAL_EVENTS,
  galeri: INITIAL_GALLERY,
  cabang: INITIAL_BRANCHES,
  customCake: INITIAL_CUSTOM_CAKE,
  admins: [],
  config: {
    linkGrabFood: 'https://food.grab.com/id/id/restaurant/kaktus-coffee-eatery-galesong-delivery/6-CY3EFH3KLJK3J8',
    noWaCake: '6285738662165'
  },
  banners: []
};
