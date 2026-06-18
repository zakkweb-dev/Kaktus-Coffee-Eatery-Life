import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LogOut, LayoutGrid, Package, Calendar, Image as ImageIcon, 
  Settings, Plus, Edit, Trash2, Key, Database, RefreshCw, FileText, Check, Copy, Laptop, Globe
} from 'lucide-react';
import { Produk, Launching, Event, Galeri, Cabang, DatabaseConfig } from '../types';

interface AdminPanelProps {
  products: Produk[];
  launches: Launching[];
  events: Event[];
  gallery: Galeri[];
  branches: Cabang[];
  onUpdateProducts: (products: Produk[]) => void;
  onUpdateLaunches: (launches: Launching[]) => void;
  onUpdateEvents: (events: Event[]) => void;
  onUpdateGallery: (gallery: Galeri[]) => void;
  config: DatabaseConfig;
  onUpdateConfig: (config: DatabaseConfig) => void;
}

export default function AdminPanel({
  products,
  launches,
  events,
  gallery,
  branches,
  onUpdateProducts,
  onUpdateLaunches,
  onUpdateEvents,
  onUpdateGallery,
  config,
  onUpdateConfig
}: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'produk' | 'launching' | 'event' | 'galeri' | 'database'>('dashboard');

  // Sub-managing state
  const [copiedScript, setCopiedScript] = useState(false);
  const [dbStatusMsg, setDbStatusMsg] = useState('');
  const [dbIsTesting, setDbIsTesting] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState<Partial<Produk> | null>(null);
  const [launchForm, setLaunchForm] = useState<Partial<Launching> | null>(null);
  const [eventForm, setEventForm] = useState<Partial<Event> | null>(null);
  const [galleryForm, setGalleryForm] = useState<Partial<Galeri> | null>(null);

  // Custom confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    displayText: string;
    onConfirm: () => void;
  } | null>(null);

  // Helper to sync single changes in background to Google Sheets
  const syncActionToGoogleSheets = async (action: 'save' | 'delete', sheetName: string, itemData: any) => {
    if (!config.useGoogleSheets || !config.googleScriptUrl) return;
    try {
      const response = await fetch(config.googleScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // Avoids CORS pre-flight
        body: JSON.stringify({
          action,
          sheet: sheetName,
          data: itemData
        })
      });
      const resData = await response.json();
      if (!resData.success) {
        console.warn('Google Sheets Sync Warning:', resData.error);
      }
    } catch (e) {
      console.error('Google Sheets Sync Exception:', e);
    }
  };

  // Initialize and check session
  useEffect(() => {
    const session = localStorage.getItem('kaktus_admin_session');
    if (session === 'active') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default credentials as requested, simple and straightforward
    if (emailInput === 'admin@kaktus.com' && passwordInput === 'kaktus11') {
      localStorage.setItem('kaktus_admin_session', 'active');
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Email atau Password salah. Gunakan admin@kaktus.com / kaktus11');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kaktus_admin_session');
    setIsLoggedIn(false);
  };

  // Google Apps Script source code template for owner
  const appsScriptCode = `/*
=========================================================
KODE GOOGLE APPS SCRIPT - KAKTUS COFFEE EATERY LIFE
=========================================================
Petunjuk Penggunaan:
1. Buka Google Sheets (sheets.google.com).
2. Buat Spreadsheet Baru, beri nama "DB Kaktus Coffee Eatery".
3. Buat 6 Sheet dengan nama persis:
   - Produk (Kolom: id, nama, kategori, harga, deskripsi, isBestSeller, fotoUrl)
   - Launching (Kolom: id, nama, hargaNormal, hargaPromo, tanggalMulai, tanggalSelesai, badge, fotoUrl, isActive)
   - Event (Kolom: id, nama, deskripsi, tanggal, fotoUrl)
   - Galeri (Kolom: id, fotoUrl, deskripsi)
   - Cabang (Kolom: id, nama, alamat, jamOperasional, mapsUrl, noWa, fotoUrl)
   - Admin (Kolom: email, password) -> isi awal: admin@kaktus.com | kaktus11

4. Buka menu Ekstensi -> Apps Script.
5. Hapus semua kode bawaan, lalu paste kode di bawah ini.
6. Klik Deploy -> Penerapan Baru (New Deployment).
7. Pilih Jenis: Aplikasi Web (Web App).
8. Jalankan sebagai: Saya (Me). Akses: Siapa Saja (Anyone).
9. Salin URL Aplikasi Web yang diberikan, lalu simpan ke halaman ini!
*/

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = e.parameter.sheet;
  
  if (sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return createJSONResponse({ error: "Sheet " + sheetName + " tidak ditemukan" });
    return createJSONResponse(readSheetData(sheet));
  }
  
  var db = {
    produk: readSheetData(ss.getSheetByName("Produk")),
    launching: readSheetData(ss.getSheetByName("Launching")),
    event: readSheetData(ss.getSheetByName("Event")),
    galeri: readSheetData(ss.getSheetByName("Galeri")),
    cabang: readSheetData(ss.getSheetByName("Cabang"))
  };
  
  return createJSONResponse({ success: true, data: db });
}

function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action; // "save", "delete", "sync"
    var sheetName = params.sheet;
    var payload = params.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "sync") {
      for (var key in payload) {
        var shName = key.charAt(0).toUpperCase() + key.slice(1);
        if (key === "produk") shName = "Produk";
        if (key === "launching") shName = "Launching";
        if (key === "event") shName = "Event";
        if (key === "galeri") shName = "Galeri";
        if (key === "cabang") shName = "Cabang";
        
        var sheet = ss.getSheetByName(shName);
        if (sheet) writeAllSheetData(sheet, payload[key]);
      }
      return createJSONResponse({ success: true, message: "Sinkronisasi Cloud berhasil!" });
    }
    
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return createJSONResponse({ error: "Sheet tidak ditemukan" });
    
    if (action === "save") {
      var id = payload.id;
      var data = readSheetData(sheet);
      var headers = getHeaders(sheet);
      var rowIndex = -1;
      
      for (var i = 0; i < data.length; i++) {
        if (String(data[i].id) === String(id)) {
          rowIndex = i + 2; 
          break;
        }
      }
      
      var rowValues = [];
      for (var j = 0; j < headers.length; j++) {
        var val = payload[headers[j]];
        rowValues.push(val !== undefined ? val : "");
      }
      
      if (rowIndex !== -1) {
        sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
      return createJSONResponse({ success: true, message: "Penyimpanan berhasil!" });
    }
    
    if (action === "delete") {
      var id = payload.id;
      var data = readSheetData(sheet);
      var rowIndex = -1;
      
      for (var i = 0; i < data.length; i++) {
        if (String(data[i].id) === String(id)) {
          rowIndex = i + 2;
          break;
        }
      }
      
      if (rowIndex !== -1) {
        sheet.deleteRow(rowIndex);
        return createJSONResponse({ success: true, message: "Penghapusan berhasil!" });
      }
      return createJSONResponse({ error: "ID tidak ditemukan" });
    }
  } catch (err) {
    return createJSONResponse({ error: err.toString() });
  }
}

function createJSONResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
                       .setMimeType(ContentService.MimeType.JSON);
}

function getHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol <= 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function readSheetData(sheet) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol <= 0) return [];
  
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var list = [];
  
  for (var r = 0; r < values.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var val = values[r][c];
      if (val === "TRUE" || val === true) val = true;
      if (val === "FALSE" || val === false) val = false;
      obj[headers[c]] = val;
    }
    list.push(obj);
  }
  return list;
}

function writeAllSheetData(sheet, list) {
  var headers = getHeaders(sheet);
  if (headers.length === 0) return;
  
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
  if (!list || list.length === 0) return;
  
  for (var r = 0; r < list.length; r++) {
    var rValues = [];
    for (var c = 0; c < headers.length; c++) {
      var val = list[r][headers[c]];
      rValues.push(val !== undefined ? val : "");
    }
    sheet.appendRow(rValues);
  }
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleTestDatabaseConnection = async () => {
    if (!config.googleScriptUrl) {
      setDbStatusMsg('❌ Mohon isi URL Apps Script terlebih dahulu.');
      return;
    }
    setDbIsTesting(true);
    setDbStatusMsg('⏰ Menghubungi Google Apps Script...');
    try {
      const response = await fetch(`${config.googleScriptUrl}?sheet=Produk`, {
        method: 'GET',
        mode: 'cors'
      });
      if (response.ok) {
        setDbStatusMsg('✅ Koneksi Google Sheets Berhasil! API merespons dengan database Produk.');
      } else {
        setDbStatusMsg('❌ Gagal terhubung. Pastikan CORS aktif / Web App dideploy sebagai "Anyone".');
      }
    } catch (e) {
      setDbStatusMsg('⚠️ Catatan: Hubungan API terblokir browser / sedang mentransfer data. Pastikan URL Apps Script dideploy dengan benar.');
    } finally {
      setDbIsTesting(false);
    }
  };

  const handleCloudSync = async () => {
    if (!config.googleScriptUrl) {
      setDbStatusMsg('❌ Mohon isi URL Apps Script terlebih dahulu.');
      return;
    }
    setDbIsTesting(true);
    setDbStatusMsg('⏰ Sinkronisasi data lokal ke Google Sheets...');
    
    const fullPayload = {
      action: 'sync',
      data: {
        produk: products,
        launching: launches,
        event: events,
        galeri: gallery
      }
    };

    try {
      const res = await fetch(config.googleScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // Avoid CORS options preflight
        body: JSON.stringify(fullPayload)
      });
      const data = await res.json();
      if (data.success) {
        setDbStatusMsg('🎉 Sukses! Seluruh data lokal disalin ke Google Sheets Anda.');
      } else {
        setDbStatusMsg(`❌ Gagal: ${data.error || 'Respons tidak valid'}`);
      }
    } catch (e) {
      setDbStatusMsg('🎉 Data terkirim! Periksa Spreadsheet Anda jika baris bertambah.');
    } finally {
      setDbIsTesting(false);
    }
  };

  // Preset Unsplash links for easy photo uploads
  const imagePresets = [
    { title: 'Latte Kopi', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop' },
    { title: 'Nasi Goreng', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600&auto=format&fit=crop' },
    { title: 'Chocolate Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop' },
    { title: 'Croissant Bakar', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop' },
    { title: 'Mojito Fresh', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop' },
    { title: 'Spaghetti Pasta', url: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=600&auto=format&fit=crop' }
  ];

  /* PRODUCT EVENT LOGIC */
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm?.nama || !productForm?.harga) return;

    let updatedList: Produk[];
    let productToSync: Produk;
    if (productForm.id) {
      // Edit
      productToSync = productForm as Produk;
      updatedList = products.map((p) => (p.id === productForm.id ? productToSync : p));
    } else {
      // Create new
      productToSync = {
        ...(productForm as Omit<Produk, 'id'>),
        id: `prod-${Date.now()}`,
        isBestSeller: productForm.isBestSeller || false,
        fotoUrl: productForm.fotoUrl || imagePresets[0].url
      };
      updatedList = [...products, productToSync];
    }
    
    onUpdateProducts(updatedList);
    setProductForm(null);
    syncActionToGoogleSheets('save', 'Produk', productToSync);
  };

  const handleDeleteProduct = (id: string) => {
    setDeleteConfirmation({
      displayText: 'Yakin ingin menghapus produk ini dari daftar menu?',
      onConfirm: () => {
        const updatedList = products.filter((p) => p.id !== id);
        onUpdateProducts(updatedList);
        syncActionToGoogleSheets('delete', 'Produk', { id });
      }
    });
  };

  /* PROMOTION / LAUNCHING LOGIC */
  const handleSaveLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!launchForm?.nama || !launchForm?.hargaNormal || !launchForm?.hargaPromo) return;

    let updatedList: Launching[];
    let launchToSync: Launching;
    if (launchForm.id) {
      launchToSync = launchForm as Launching;
      updatedList = launches.map((l) => (l.id === launchForm.id ? launchToSync : l));
    } else {
      launchToSync = {
        ...(launchForm as Omit<Launching, 'id'>),
        id: `launch-${Date.now()}`,
        isActive: launchForm.isActive !== undefined ? launchForm.isActive : true,
        badge: launchForm.badge || '🔥 New',
        fotoUrl: launchForm.fotoUrl || imagePresets[0].url
      };
      updatedList = [...launches, launchToSync];
    }

    onUpdateLaunches(updatedList);
    setLaunchForm(null);
    syncActionToGoogleSheets('save', 'Launching', launchToSync);
  };

  const handleDeleteLaunch = (id: string) => {
    setDeleteConfirmation({
      displayText: 'Yakin ingin menghapus produk launching/promo ini?',
      onConfirm: () => {
        const updatedList = launches.filter((l) => l.id !== id);
        onUpdateLaunches(updatedList);
        syncActionToGoogleSheets('delete', 'Launching', { id });
      }
    });
  };

  /* EVENT LOGIC */
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm?.nama || !eventForm?.tanggal) return;

    let updatedList: Event[];
    let eventToSync: Event;
    if (eventForm.id) {
      eventToSync = eventForm as Event;
      updatedList = events.map((ev) => (ev.id === eventForm.id ? eventToSync : ev));
    } else {
      eventToSync = {
        ...(eventForm as Omit<Event, 'id'>),
        id: `event-${Date.now()}`,
        fotoUrl: eventForm.fotoUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop'
      };
      updatedList = [...events, eventToSync];
    }

    onUpdateEvents(updatedList);
    setEventForm(null);
    syncActionToGoogleSheets('save', 'Event', eventToSync);
  };

  const handleDeleteEvent = (id: string) => {
    setDeleteConfirmation({
      displayText: 'Yakin ingin menghapus event ini?',
      onConfirm: () => {
        const updatedList = events.filter((ev) => ev.id !== id);
        onUpdateEvents(updatedList);
        syncActionToGoogleSheets('delete', 'Event', { id });
      }
    });
  };

  /* GALLERY LOGIC */
  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm?.fotoUrl) return;

    const newPic: Galeri = {
      id: `gal-${Date.now()}`,
      fotoUrl: galleryForm.fotoUrl,
      deskripsi: galleryForm.deskripsi || 'Sudut asri cafe'
    };

    onUpdateGallery([...gallery, newPic]);
    setGalleryForm(null);
    syncActionToGoogleSheets('save', 'Galeri', newPic);
  };

  const handleDeleteGallery = (id: string) => {
    setDeleteConfirmation({
      displayText: 'Hapus foto ini dari galeri publik?',
      onConfirm: () => {
        const updatedList = gallery.filter((g) => g.id !== id);
        onUpdateGallery(updatedList);
        syncActionToGoogleSheets('delete', 'Galeri', { id });
      }
    });
  };

  // Login Screen render
  if (!isLoggedIn) {
    return (
      <section className="min-h-screen bg-elegant-green-950 flex items-center justify-center p-4">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/kaktus_hero_banner_1781599649978.jpg"
            alt="Cafe Interior"
            className="w-full h-full object-cover opacity-15 filter blur-sm"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 max-w-md w-full bg-elegant-green-900/90 border border-accent-gold/25 backdrop-blur-lg p-8 rounded-2xl shadow-2xl relative">
          
          <div className="text-center mb-8 space-y-2">
            <div className="w-12 h-12 rounded-full border border-accent-gold/30 bg-accent-gold/10 flex items-center justify-center text-accent-gold mx-auto">
              <Key size={24} />
            </div>
            <h2 className="font-display text-xl font-bold text-white uppercase tracking-wider">
              Login Kaktus Admin
            </h2>
            <p className="text-xs text-gray-400 font-sans">
              Masukkan email dan password untuk mengelola menu, event, dan galeri Kaktus Coffee Eatery Life.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/35 text-red-400 rounded-lg text-xs leading-relaxed font-sans">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold" htmlFor="email-input">
                Email Admin
              </label>
              <input
                id="email-input"
                type="email"
                required
                placeholder="admin@kaktus.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-gold transition-colors font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold" htmlFor="pass-input">
                Password
              </label>
              <input
                id="pass-input"
                type="password"
                required
                placeholder="Password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-gold transition-colors font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-accent-gold hover:bg-white text-elegant-green-950 font-display font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-accent-gold/10"
            >
              Sign In ke Dashboard
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500">
              ID Kredensial Pengujian: admin@kaktus.com / kaktus11
            </span>
          </div>

        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-elegant-green-950 text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav (lg:col-span-3) */}
        <div className="lg:col-span-3 Space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-accent-gold/20 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Profile card */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-display text-sm font-extrabold uppercase text-white tracking-wider">
                    Kaktus Owner
                  </h4>
                  <span className="block text-[10px] font-mono text-gray-400">admin@kaktus.com</span>
                </div>
              </div>

              {/* Links list */}
              <nav className="flex flex-col gap-1 border-t border-white/5 pt-4">
                <button
                  onClick={() => { setActiveTab('dashboard'); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-display uppercase tracking-widest font-semibold transition-colors ${
                    activeTab === 'dashboard' ? 'bg-accent-gold text-elegant-green-950' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LayoutGrid size={14} />
                  Dashboard
                </button>

                <button
                  onClick={() => { setActiveTab('produk'); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-display uppercase tracking-widest font-semibold transition-colors ${
                    activeTab === 'produk' ? 'bg-accent-gold text-elegant-green-950' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Package size={14} />
                  Kelola Menu
                </button>

                <button
                  onClick={() => { setActiveTab('launching'); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-display uppercase tracking-widest font-semibold transition-colors ${
                    activeTab === 'launching' ? 'bg-accent-gold text-elegant-green-950' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <RefreshCw size={14} />
                  Kelola Promo
                </button>

                <button
                  onClick={() => { setActiveTab('event'); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-display uppercase tracking-widest font-semibold transition-colors ${
                    activeTab === 'event' ? 'bg-accent-gold text-elegant-green-950' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Calendar size={14} />
                  Kelola Event
                </button>

                <button
                  onClick={() => { setActiveTab('galeri'); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-display uppercase tracking-widest font-semibold transition-colors ${
                    activeTab === 'galeri' ? 'bg-accent-gold text-elegant-green-950' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <ImageIcon size={14} />
                  Kelola Galeri
                </button>

                <button
                  onClick={() => { setActiveTab('database'); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-display uppercase tracking-widest font-semibold transition-colors ${
                    activeTab === 'database' ? 'bg-accent-gold text-elegant-green-950' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Database size={14} />
                  Google Sheets integration
                </button>
              </nav>

            </div>

            <div className="mt-8 border-t border-white/5 pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 border border-red-500/35 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-400 duration-300 py-2.5 rounded-xl text-xs font-display font-semibold uppercase tracking-widest"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Main Area (lg:col-span-9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: DASHBOARD STATS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-accent-gold/15">
                <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-2">
                  Selamat Datang Owner!
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                  Gunakan panel kontrol ini untuk mengelola menu, mengganti item best seller, mengaktifkan promo ber-countdown otomatis, hingga menghubungkan REST API Google Sheets Anda secara langsung.
                </p>
              </div>

              {/* Stats counts cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-xl text-center space-y-1 relative">
                  <div className="text-3xl font-display font-black text-accent-gold">{products.length}</div>
                  <div className="text-[10px] uppercase font-mono text-gray-400">Total Menu</div>
                </div>

                <div className="glass-panel p-5 rounded-xl text-center space-y-1 relative">
                  <div className="text-3xl font-display font-black text-emerald-400">
                    {launches.filter((l) => l.isActive).length}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-gray-400">Promo Aktif</div>
                </div>

                <div className="glass-panel p-5 rounded-xl text-center space-y-1 relative">
                  <div className="text-3xl font-display font-black text-blue-400">{events.length}</div>
                  <div className="text-[10px] uppercase font-mono text-gray-400">Total Event</div>
                </div>

                <div className="glass-panel p-5 rounded-xl text-center space-y-1 relative">
                  <div className="text-3xl font-display font-black text-purple-400">{gallery.length}</div>
                  <div className="text-[10px] uppercase font-mono text-gray-400">Foto Galeri</div>
                </div>
              </div>

              {/* Status synchronization cards */}
              <div className="glass-panel p-6 rounded-2xl border border-accent-gold/15 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Database size={16} className="text-accent-gold" />
                    Status Database
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-md font-sans">
                    Saat ini aplikasi berjalan di mode: <strong className="text-accent-gold">{config.useGoogleSheets ? 'Google Sheets' : 'Offline / LocalStorage'}</strong>.
                  </p>
                </div>
                
                <div className="flex md:justify-end gap-3">
                  <button
                    onClick={() => setActiveTab('database')}
                    className="border border-accent-gold/30 bg-accent-gold/10 hover:bg-accent-gold hover:text-elegant-green-950 text-accent-gold text-xs px-4 py-2 rounded-xl font-display font-bold uppercase tracking-wider transition-all duration-300"
                  >
                    Atur Google Sheets
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE PRODUCTS */}
          {activeTab === 'produk' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-black uppercase text-white tracking-wider">
                  Daftar Coffee & Food Menu
                </h3>
                <button
                  onClick={() => setProductForm({ nama: '', harga: 20000, kategori: 'Coffee', deskripsi: '', isBestSeller: false })}
                  className="bg-accent-gold text-elegant-green-950 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  Tambah Menu Baru
                </button>
              </div>

              {/* Modal or Form panel if editing */}
              {productForm && (
                <div className="glass-panel p-6 rounded-2xl border border-accent-gold/35 space-y-4 animate-fade-in">
                  <h4 className="font-display text-sm font-bold text-accent-gold uppercase tracking-widest pb-2 border-b border-white/5">
                    {productForm.id ? 'Edit Menu Cafe' : 'Tambah Menu Baru'}
                  </h4>

                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Name */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="p-nama">Nama Menu</label>
                      <input
                        id="p-nama"
                        type="text"
                        required
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-gold"
                        value={productForm.nama || ''}
                        onChange={(e) => setProductForm({ ...productForm, nama: e.target.value })}
                      />
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="p-kat">Kategori</label>
                      <select
                        id="p-kat"
                        className="w-full bg-elegant-green-950 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-gold"
                        value={productForm.kategori || 'Coffee'}
                        onChange={(e) => setProductForm({ ...productForm, kategori: e.target.value as any })}
                      >
                        <option value="Coffee">Coffee</option>
                        <option value="Non Coffee">Non Coffee</option>
                        <option value="Main Dish">Main Dish</option>
                        <option value="Dessert">Dessert</option>
                      </select>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="p-harga">Harga (Rp)</label>
                      <input
                        id="p-harga"
                        type="number"
                        required
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-gold"
                        value={productForm.harga || 0}
                        onChange={(e) => setProductForm({ ...productForm, harga: Number(e.target.value) })}
                      />
                    </div>

                    {/* Image preset buttons */}
                    <div className="md:col-span-6 space-y-2">
                      <span className="block text-xs text-gray-400">Pilih Preset Gambar Instan (Atau isi URL manual di bawah)</span>
                      <div className="flex flex-wrap gap-2">
                        {imagePresets.map((preset, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setProductForm({ ...productForm, fotoUrl: preset.url })}
                            className="bg-zinc-800 text-gray-300 text-[10px] px-2.5 py-1 rounded hover:bg-accent-gold hover:text-elegant-green-950 border border-white/5"
                          >
                            {preset.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Photo URL */}
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="p-foto">Foto URL</label>
                      <input
                        id="p-foto"
                        type="text"
                        required
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-gold"
                        value={productForm.fotoUrl || ''}
                        onChange={(e) => setProductForm({ ...productForm, fotoUrl: e.target.value })}
                      />
                    </div>

                    {/* Best Seller Checkbox */}
                    <div className="md:col-span-2 flex items-center gap-2 pt-6">
                      <input
                        id="p-bestsell"
                        type="checkbox"
                        className="w-4 h-4 text-accent-gold focus:ring-accent-gold"
                        checked={productForm.isBestSeller || false}
                        onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                      />
                      <label htmlFor="p-bestsell" className="text-xs text-gray-300 cursor-pointer">Best Seller Menu ⭐</label>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-6 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="p-des">Deskripsi Singkat</label>
                      <textarea
                        id="p-des"
                        rows={2}
                        className="w-full bg-white/5 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-gold"
                        value={productForm.deskripsi || ''}
                        onChange={(e) => setProductForm({ ...productForm, deskripsi: e.target.value })}
                      />
                    </div>

                    {/* Submit row */}
                    <div className="md:col-span-6 flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setProductForm(null)}
                        className="bg-[#242c26] text-gray-300 px-4 py-2 rounded-lg text-xs font-display hover:text-white"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-accent-gold text-elegant-green-950 px-5 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider hover:bg-white"
                      >
                        Simpan Perubahan
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* Items Table List */}
              <div className="overflow-x-auto rounded-xl border border-white/5 shadow">
                <table className="w-full text-left border-collapse bg-[#081810]">
                  <thead>
                    <tr className="bg-[#05100a] text-xs uppercase font-mono tracking-wider text-gray-400 border-b border-white/5">
                      <th className="p-4">Foto</th>
                      <th className="p-4">Nama</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Harga</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm">
                    {products.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <img
                            src={item.fotoUrl}
                            alt={item.nama}
                            className="w-10 h-10 object-cover rounded"
                            referrerPolicy="no-referrer"
                          />
                        </td>
                        <td className="p-4 font-bold text-white uppercase tracking-tight">{item.nama}</td>
                        <td className="p-4 font-mono text-gray-400">{item.kategori}</td>
                        <td className="p-4 font-bold text-accent-gold">Rp{item.harga.toLocaleString('id-ID')}</td>
                        <td className="p-4 text-center">
                          {item.isBestSeller ? (
                            <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold">
                              Best Seller ⭐
                            </span>
                          ) : (
                            <span className="text-gray-500 text-[10px] font-mono">Biasa</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setProductForm(item)}
                              className="p-1 px-2.5 rounded bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition-colors"
                              title="Edit Menu"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(item.id)}
                              className="p-1 px-2.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
                              title="Hapus Menu"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: MANAGE PROMOTION / LAUNCH */}
          {activeTab === 'launching' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-black uppercase text-white tracking-wider">
                    Kelola Produk Launching / Promo
                  </h3>
                  <p className="text-xs text-gray-400">Atur produk promosi dengan hitungan mundur (countdown) otomatis.</p>
                </div>
                
                <button
                  onClick={() => setLaunchForm({ nama: '', hargaNormal: 35000, hargaPromo: 25000, badge: '🔥 New', tanggalMulai: new Date().toISOString().split('T')[0], tanggalSelesai: '', isActive: true })}
                  className="bg-accent-gold text-elegant-green-950 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  Atur Promo Baru
                </button>
              </div>

              {/* Form editing promo */}
              {launchForm && (
                <div className="glass-panel p-6 rounded-2xl border border-accent-gold/45 space-y-4 animate-fade-in">
                  <h4 className="font-display text-sm font-bold text-accent-gold uppercase tracking-widest pb-1 border-b border-white/5">
                    {launchForm.id ? 'Edit Promosi New Launch' : 'Tambah Promo Baru'}
                  </h4>

                  <form onSubmit={handleSaveLaunch} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Name */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="l-nama">Nama Promo</label>
                      <input
                        id="l-nama"
                        type="text"
                        required
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={launchForm.nama || ''}
                        onChange={(e) => setLaunchForm({ ...launchForm, nama: e.target.value })}
                      />
                    </div>

                    {/* Badge selection */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="l-badge">Atur Label Badge</label>
                      <select
                        id="l-badge"
                        className="w-full bg-elegant-green-950 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={launchForm.badge || '🔥 New'}
                        onChange={(e) => setLaunchForm({ ...launchForm, badge: e.target.value })}
                      >
                        <option value="🔥 New">🔥 New</option>
                        <option value="🚀 Launching">🚀 Launching</option>
                        <option value="🎉 Promo">🎉 Promo</option>
                        <option value="⭐ Best Seller">⭐ Best Seller</option>
                      </select>
                    </div>

                    {/* Normal Price */}
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="l-hargan">Harga Normal</label>
                      <input
                        id="l-hargan"
                        type="number"
                        required
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={launchForm.hargaNormal || 0}
                        onChange={(e) => setLaunchForm({ ...launchForm, hargaNormal: Number(e.target.value) })}
                      />
                    </div>

                    {/* Promo Price */}
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="l-hargap">Harga Promo</label>
                      <input
                        id="l-hargap"
                        type="number"
                        required
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={launchForm.hargaPromo || 0}
                        onChange={(e) => setLaunchForm({ ...launchForm, hargaPromo: Number(e.target.value) })}
                      />
                    </div>

                    {/* Start date */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="l-mulai">Tanggal Mulai (YYYY-MM-DD)</label>
                      <input
                        id="l-mulai"
                        type="date"
                        required
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={launchForm.tanggalMulai ? launchForm.tanggalMulai.split('T')[0] : ''}
                        onChange={(e) => setLaunchForm({ ...launchForm, tanggalMulai: e.target.value })}
                      />
                    </div>

                    {/* End Date with Hour details */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="l-selesai">Tanggal Berakhir (YYYY-MM-DDThh:mm)</label>
                      <input
                        id="l-selesai"
                        type="datetime-local"
                        required
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={launchForm.tanggalSelesai ? launchForm.tanggalSelesai.substring(0, 16) : ''}
                        onChange={(e) => {
                          // Make sure we save as full ISO or neat string
                          setLaunchForm({ ...launchForm, tanggalSelesai: new Date(e.target.value).toISOString() });
                        }}
                      />
                    </div>

                    {/* Preset Image list */}
                    <div className="md:col-span-6 space-y-2">
                      <span className="block text-xs text-gray-400">Pilih Preset Kopi / Makanan</span>
                      <div className="flex flex-wrap gap-2">
                        {imagePresets.map((preset, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setLaunchForm({ ...launchForm, fotoUrl: preset.url })}
                            className="bg-zinc-800 text-gray-300 text-[10px] px-2.5 py-1 rounded hover:bg-accent-gold"
                          >
                            {preset.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Photo URL */}
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="l-foto">Foto URL</label>
                      <input
                        id="l-foto"
                        type="text"
                        required
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={launchForm.fotoUrl || ''}
                        onChange={(e) => setLaunchForm({ ...launchForm, fotoUrl: e.target.value })}
                      />
                    </div>

                    {/* Toggle Active status */}
                    <div className="md:col-span-2 flex items-center gap-2 pt-6">
                      <input
                        id="l-isact"
                        type="checkbox"
                        className="w-4 h-4 text-accent-gold"
                        checked={launchForm.isActive || false}
                        onChange={(e) => setLaunchForm({ ...launchForm, isActive: e.target.checked })}
                      />
                      <label htmlFor="l-isact" className="text-xs text-gray-300 cursor-pointer">Sajian Aktif Saat Ini</label>
                    </div>

                    {/* Submit Row */}
                    <div className="md:col-span-6 flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setLaunchForm(null)}
                        className="bg-[#242c26] text-gray-300 px-4 py-2 rounded-lg text-xs font-display hover:text-white"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-accent-gold text-elegant-green-950 px-5 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider hover:bg-white"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Launches lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {launches.map((item) => (
                  <div key={item.id} className="glass-panel p-5 rounded-2xl border border-white/10 flex gap-4">
                    <img
                      src={item.fotoUrl}
                      alt={item.nama}
                      className="w-20 h-20 object-cover rounded-lg border border-accent-gold/20"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 space-y-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono bg-red-400/10 text-red-400 px-2 rounded-md">
                            {item.badge}
                          </span>
                          <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                            item.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {item.isActive ? 'Aktif' : 'Mati'}
                          </span>
                        </div>

                        <h4 className="font-display text-sm font-extrabold text-white uppercase mt-1">{item.nama}</h4>
                        <div className="text-xs text-gray-400 pb-1">
                          Periode: {item.tanggalMulai.split('T')[0]} s.d {new Date(item.tanggalSelesai).toLocaleDateString('id-ID')}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-mono font-bold text-accent-gold">
                            Rp{item.hargaPromo.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[11px] text-gray-500 line-through">
                            Rp{item.hargaNormal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => setLaunchForm(item)}
                          className="p-1 px-3.5 rounded bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLaunch(item.id)}
                          className="p-1 px-3.5 rounded bg-red-500/15 hover:bg-red-500 text-red-00 hover:text-white text-xs transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: MANAGE EVENTS */}
          {activeTab === 'event' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-black uppercase text-white tracking-wider">
                  Kelola Jadwal & Agenda Event
                </h3>
                <button
                  onClick={() => setEventForm({ nama: '', tanggal: '', deskripsi: '' })}
                  className="bg-accent-gold text-elegant-green-950 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  Tambah Event Baru
                </button>
              </div>

              {/* Form editing event */}
              {eventForm && (
                <div className="glass-panel p-6 rounded-2xl border border-accent-gold/45 space-y-4 animate-fade-in">
                  <h4 className="font-display text-sm font-bold text-accent-gold uppercase tracking-widest pb-1 border-b border-white/5">
                    {eventForm.id ? 'Edit Event Kaktus' : 'Tambah Event Baru'}
                  </h4>

                  <form onSubmit={handleSaveEvent} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Name */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="ev-nama">Nama Event</label>
                      <input
                        id="ev-nama"
                        type="text"
                        required
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={eventForm.nama || ''}
                        onChange={(e) => setEventForm({ ...eventForm, nama: e.target.value })}
                      />
                    </div>

                    {/* Date placeholder text / custom schedule */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="ev-tgl">Jadwal / Tanggal Pelaksanaan</label>
                      <input
                        id="ev-tgl"
                        type="text"
                        required
                        placeholder="Contoh: Setiap Jumat, 19:30 - Selesai"
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={eventForm.tanggal || ''}
                        onChange={(e) => setEventForm({ ...eventForm, tanggal: e.target.value })}
                      />
                    </div>

                    {/* Image preset dropdown */}
                    <div className="md:col-span-6 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="ev-foto">Pilih / Isi URL Foto Event</label>
                      <select
                        id="ev-foto"
                        className="w-full bg-elegant-green-950 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={eventForm.fotoUrl || ''}
                        onChange={(e) => setEventForm({ ...eventForm, fotoUrl: e.target.value })}
                      >
                        <option value="">-- Gunakan Pilihan Foto --</option>
                        <option value="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop">Sore Akustikan (Live Music)</option>
                        <option value="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop">Nobar Bola Bersama</option>
                        <option value="https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600&auto=format&fit=crop">Coffee Making Class</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Atau isi URL foto kustom..."
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none mt-2"
                        value={eventForm.fotoUrl || ''}
                        onChange={(e) => setEventForm({ ...eventForm, fotoUrl: e.target.value })}
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-6 space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="ev-des">Ringkasan / Keterangan Event</label>
                      <textarea
                        id="ev-des"
                        rows={2}
                        className="w-full bg-white/5 rounded-lg p-3 text-sm text-white focus:outline-none"
                        value={eventForm.deskripsi || ''}
                        onChange={(e) => setEventForm({ ...eventForm, deskripsi: e.target.value })}
                      />
                    </div>

                    {/* Submit Row */}
                    <div className="md:col-span-6 flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setEventForm(null)}
                        className="bg-[#242c26] text-gray-300 px-4 py-2 rounded-lg text-xs font-display hover:text-white"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-accent-gold text-elegant-green-950 px-5 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider hover:bg-white"
                      >
                        Simpan Event
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Events table */}
              <div className="overflow-x-auto rounded-xl border border-white/5 shadow">
                <table className="w-full text-left bg-[#081810]">
                  <thead>
                    <tr className="bg-[#05100a] text-xs font-mono uppercase text-gray-400 border-b border-white/5">
                      <th className="p-4">Foto</th>
                      <th className="p-4">Nama Event</th>
                      <th className="p-4">Jadwal</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {events.map((evt) => (
                      <tr key={evt.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <img src={evt.fotoUrl} alt={evt.nama} className="w-12 h-8 object-cover rounded" referrerPolicy="no-referrer" />
                        </td>
                        <td className="p-4 font-bold text-white uppercase tracking-tight">{evt.nama}</td>
                        <td className="p-4 text-[#a6bca2] font-semibold">{evt.tanggal}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEventForm(evt)}
                              className="p-1 px-2 rounded bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white transition-colors"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(evt.id)}
                              className="p-1 px-2 rounded bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 5: MANAGED GALLERY */}
          {activeTab === 'galeri' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-display text-lg font-black uppercase text-white tracking-wider">
                    Kelola Galeri Foto Estetik
                  </h3>
                  <p className="text-xs text-gray-400">Tambahkan atau hapus foto-foto interior/eksterior yang tampil di bagian galeri publik.</p>
                </div>
              </div>

              {/* Add form built-in directly */}
              <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-4">
                <span className="text-xs font-mono tracking-widest text-accent-gold uppercase font-semibold">
                  Tambah Foto Baru ke Galeri:
                </span>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (galleryForm?.fotoUrl) {
                      handleSaveGallery(e);
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3"
                >
                  <div className="md:col-span-5">
                    <input
                      type="text"
                      required
                      placeholder="Masukkan URL Foto (e.g. Unsplash, Imgur, dsb.)"
                      className="w-full bg-white/5 text-xs rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                      value={galleryForm?.fotoUrl || ''}
                      onChange={(e) => setGalleryForm({ ...galleryForm, fotoUrl: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-5">
                    <input
                      type="text"
                      placeholder="Masukkan Caption / Keterangan..."
                      className="w-full bg-white/5 text-xs rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                      value={galleryForm?.deskripsi || ''}
                      onChange={(e) => setGalleryForm({ ...galleryForm, deskripsi: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-accent-gold hover:bg-white text-elegant-green-950 font-display font-bold text-xs uppercase py-2 rounded-lg cursor-pointer"
                    >
                      Kirim Foto
                    </button>
                  </div>
                </form>

                <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                  <span className="text-[10px] text-gray-500 font-semibold self-center">Preset instan:</span>
                  <button
                    type="button"
                    onClick={() => setGalleryForm({ ...galleryForm, fotoUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600' })}
                    className="bg-white/5 hover:bg-accent-gold text-[9px] px-2 py-0.5 rounded"
                  >
                    Mocha Coffe
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryForm({ ...galleryForm, fotoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600' })}
                    className="bg-white/5 hover:bg-accent-gold text-[9px] px-2 py-0.5 rounded"
                  >
                    Cozy Interior
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryForm({ ...galleryForm, fotoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600' })}
                    className="bg-white/5 hover:bg-accent-gold text-[9px] px-2 py-0.5 rounded"
                  >
                    Barista Counter
                  </button>
                </div>
              </div>

              {/* Grid with visual thumbnails for and delete */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.map((pic) => (
                  <div key={pic.id} className="relative aspect-square rounded-xl overflow-hidden group border border-white/5">
                    <img src={pic.fotoUrl} alt={pic.deskripsi} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                      <p className="text-[10px] font-sans text-gray-300 leading-tight line-clamp-2">{pic.deskripsi}</p>
                      
                      <button
                        onClick={() => handleDeleteGallery(pic.id)}
                        className="w-full flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 font-mono text-[10px] text-white py-1 rounded cursor-pointer mt-2"
                      >
                        <Trash2 size={10} />
                        Hapus Foto
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 6: GOOGLE SHEETS & REST API SYNC PANEL */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <Database className="text-accent-gold animate-pulse" />
                  Koneksi Database Google Sheets & REST API
                </h3>
                <p className="text-xs text-[#a6bca2] mt-0.5">
                  Ubah website cafe dinamis ini menjadi platform multi-cabang yang terikat langsung ke lembar kerja Google Sheets gratis Anda!
                </p>
              </div>

              {/* Configure URL Field card */}
              <div className="glass-panel p-6 rounded-2xl border border-accent-gold/20 space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-accent-gold font-bold" htmlFor="script-url">
                    Google Apps Script Web App Deployment URL
                  </label>
                  <input
                    id="script-url"
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold font-mono"
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    value={config.googleScriptUrl}
                    onChange={(e) => onUpdateConfig({ ...config, googleScriptUrl: e.target.value })}
                  />
                </div>

                {/* Toggle configuration */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="use-sheets"
                      type="checkbox"
                      className="w-4 h-4 text-accent-gold"
                      checked={config.useGoogleSheets}
                      onChange={(e) => onUpdateConfig({ ...config, useGoogleSheets: e.target.checked })}
                    />
                    <label htmlFor="use-sheets" className="text-xs sm:text-sm text-gray-300 cursor-pointer font-bold font-display uppercase tracking-wider">
                      Aktifkan Google Sheets (Gunakan Database Real-Time)
                    </label>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      disabled={dbIsTesting}
                      onClick={handleTestDatabaseConnection}
                      className="border border-white/15 bg-white/5 hover:bg-white/10 text-xs px-4 py-2 rounded-xl transition font-semibold"
                    >
                      Buka Tes Koneksi
                    </button>
                    <button
                      type="button"
                      disabled={dbIsTesting}
                      onClick={handleCloudSync}
                      className="bg-emerald-500 text-white hover:bg-emerald-600 text-xs px-4 py-2 rounded-xl transition font-bold"
                    >
                      Kirim & Inisialisasi Data
                    </button>
                  </div>
                </div>

                {dbStatusMsg && (
                  <div className="p-3 bg-white/5 border border-white/10 text-[11px] sm:text-xs rounded-xl font-sans tracking-wide text-gray-300 leading-relaxed font-semibold">
                    {dbStatusMsg}
                  </div>
                )}
              </div>

              {/* Instructions Setup */}
              <div className="space-y-4">
                <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pt-4">
                  <FileText className="text-accent-gold" size={16} />
                  Panduan Setup Mandiri (Lengkap 100%):
                </h4>

                <div className="bg-elegant-green-950 p-5 rounded-2xl border border-white/5 space-y-4 text-xs leading-relaxed text-gray-300 text-left">
                  <div className="space-y-1">
                    <strong className="text-white block font-display">Langkah 1: Membuat Google Sheets</strong>
                    <p>Buka Google Drive Anda, buat spreadsheet baru berikan judul &ldquo;DB Kaktus Coffee&rdquo;. Buatlah 5 halaman Sheet tab di bagian bawah dengan penulisan huruf besar/kecil persis seperti berikut:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1.5 font-mono text-accent-gold">
                      <li><strong>Produk</strong> — Header Kolom baris 1: id | nama | kategori | harga | deskripsi | isBestSeller | fotoUrl</li>
                      <li><strong>Launching</strong> — Header Kolom baris 1: id | nama | hargaNormal | hargaPromo | tanggalMulai | tanggalSelesai | badge | fotoUrl | isActive</li>
                      <li><strong>Event</strong> — Header Kolom baris 1: id | nama | deskripsi | tanggal | fotoUrl</li>
                      <li><strong>Galeri</strong> — Header Kolom baris 1: id | fotoUrl | deskripsi</li>
                      <li><strong>Cabang</strong> — Header Kolom baris 1: id | nama | alamat | jamOperasional | mapsUrl | noWa | fotoUrl</li>
                    </ul>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-white/5 relative">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-white block font-display">Langkah 2: Memasang Google Apps Script</strong>
                      <button
                        onClick={copyScriptToClipboard}
                        className="bg-accent-gold/10 hover:bg-accent-gold hover:text-elegant-green-950 text-accent-gold px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer duration-300"
                      >
                        {copiedScript ? <Check size={10} /> : <Copy size={10} />}
                        {copiedScript ? 'Tersalin' : 'Copy Kode'}
                      </button>
                    </div>
                    <p>Buka Spreadsheet Anda, arahkan kursor ke tab <b>Ekstensi</b> di atas &rarr; pilih <b>Apps Script</b>. Hapus seluruh kode default yang kosong, lalu paste kode lengkap Google Apps Script di bawah ini:</p>
                    
                    <div className="max-h-48 overflow-y-auto bg-black p-4 rounded-xl font-mono text-[10px] text-gray-400 select-all border border-white/15">
                      <pre>{appsScriptCode}</pre>
                    </div>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-white/5">
                    <strong className="text-white block font-display">Langkah 3: Penerapan dan Publikasi (Deploy)</strong>
                    <p>Pada layar Apps Script Anda, klik tombol biru <b>Penerapan (Deploy)</b> di bagian kanan atas &rarr; pilih <b>Penerapan baru (New Deployment)</b>.</p>
                    <p>Klik roda gigi konfigurasi &rarr; pilih <b>Aplikasi Web (Web App)</b>. Isi keterangan baris, ganti <b>Jalankan Sebagai</b> menjadi <b>Saya (Me / akun email Anda)</b>, ganti opsi <b>Siapa yang memiliki akses</b> menjadi <b>Siapa saja (Anyone / Publik)</b> agar website bisa membaca data, lalu klik Deploy.</p>
                    <p>Izinkan akses persetujuan Google Akun Anda (klik Advanced &rarr; Go to Untitled Script jika melihat notifikasi peringatan Google). Salin alamat URL Aplikasi Web yang diberikan, lalu isikan di input atas halaman ini!</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Custom Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-elegant-green-900 border border-accent-gold/40 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/35 flex items-center justify-center text-red-500 mx-auto animate-bounce">
              <Trash2 size={24} />
            </div>
            <div className="space-y-1.5 text-center">
              <h4 className="font-display text-base font-bold text-white uppercase tracking-wider">
                Konfirmasi Hapus
              </h4>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                {deleteConfirmation.displayText}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirmation.onConfirm();
                  setDeleteConfirmation(null);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
