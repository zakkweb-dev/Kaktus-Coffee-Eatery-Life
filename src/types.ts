export interface Produk {
  id: string;
  nama: string;
  kategori: 'Coffee' | 'Non Coffee' | 'Main Dish' | 'Dessert';
  harga: number;
  deskripsi: string;
  isBestSeller: boolean;
  fotoUrl: string;
}

export interface Launching {
  id: string;
  nama: string;
  hargaNormal: number;
  hargaPromo: number;
  tanggalMulai: string; 
  tanggalSelesai: string; 
  badge: '🔥 New' | '🚀 Launching' | '🎉 Promo' | '⭐ Best Seller' | string;
  fotoUrl: string;
  isActive: boolean;
}

export interface Event {
  id: string;
  nama: string;
  deskripsi: string;
  tanggal: string; // YYYY-MM-DD
  fotoUrl: string;
}

export interface Galeri {
  id: string;
  fotoUrl: string;
  deskripsi: string;
}

export interface Cabang {
  id: string;
  nama: string;
  alamat: string;
  jamOperasional: string;
  mapsUrl: string;
  noWa: string;
  fotoUrl: string;
  linkGrabFood?: string;
  noWaCake?: string;
  pesanWaCake?: string;
}

export interface CustomCake {
  id: string;
  nama: string;
  deskripsi: string;
  hargaMulai: number;
  fotoUrl: string;
  pilihanRasa?: string;
  isActive: boolean;
}

export interface AdminCredentials {
  uid: string;
  email: string;
  role: 'Owner' | 'Manager';
}

export interface DatabaseConfig {
  linkGrabFood: string; // URL for GrabFood
  noWaCake: string; // WhatsApp number for Custom Cake orders
  logoUrl?: string; // Custom Logo URL
}

export interface Review {
  id: string;
  nama: string;
  rating: number; // 1-5
  ulasan: string;
  status: 'pending' | 'approved';
  createdAt: number; // timestamp
}

export interface HeroBanner {
  id: string;
  fotoUrl: string;
  title?: string;
  subtitle?: string;
  isActive: boolean;
  order: number;
}

export interface FullDatabase {
  produk: Produk[];
  launching: Launching[];
  event: Event[];
  galeri: Galeri[];
  cabang: Cabang[];
  customCake: CustomCake[];
  admins: AdminCredentials[];
  config: DatabaseConfig;
  banners: HeroBanner[];
}
