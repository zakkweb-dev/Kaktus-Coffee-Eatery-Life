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
}

export interface AdminCredentials {
  email: string;
  passwordHash: string; // Stored password
}

export interface DatabaseConfig {
  googleScriptUrl: string; // Apps Script Web App URL
  useGoogleSheets: boolean;
}

export interface FullDatabase {
  produk: Produk[];
  launching: Launching[];
  event: Event[];
  galeri: Galeri[];
  cabang: Cabang[];
  admin: AdminCredentials;
  config: DatabaseConfig;
}
