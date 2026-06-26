import React, { useState } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
  signInAnonymously
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  getDocs,
  getDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { 
  ShieldCheck, LogOut, LayoutGrid, Package, Calendar, Image as ImageIcon, 
  Settings, Plus, Edit, Trash2, Database, Sliders, Cake, RefreshCw, Key,
  UserPlus, ShieldAlert, Loader2, Upload, MessageSquare, ExternalLink, Users, Star, Check, Trash, Clock, CheckCircle2
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Review, Produk, Launching, Event, Galeri, Cabang, DatabaseConfig, HeroBanner, CustomCake, AdminCredentials } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';
import ImageWithFallback from './ImageWithFallback';

interface AdminPanelProps {
  products: Produk[];
  launches: Launching[];
  events: Event[];
  gallery: Galeri[];
  branches: Cabang[];
  customCakes: CustomCake[];
  onUpdateProducts: (products: Produk[]) => void;
  onUpdateLaunches: (launches: Launching[]) => void;
  onUpdateEvents: (events: Event[]) => void;
  onUpdateGallery: (gallery: Galeri[]) => void;
  onUpdateCustomCakes: (customCakes: CustomCake[]) => void;
  onUpdateBranches?: (branches: Cabang[]) => void;
  config: DatabaseConfig;
  onUpdateConfig: (config: DatabaseConfig) => void;
  banners: HeroBanner[];
  onUpdateBanners: (banners: HeroBanner[]) => void;
  user: any;
  adminRole: 'Owner' | 'Manager' | null;
  checkingAdmin: boolean;
  onLogout: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onLoginSuccess?: (role: 'Owner' | 'Manager', localUser?: any) => void;
}

export default function AdminPanel({
  products,
  launches,
  events,
  gallery,
  branches,
  customCakes,
  onUpdateProducts,
  onUpdateLaunches,
  onUpdateEvents,
  onUpdateGallery,
  onUpdateCustomCakes,
  onUpdateBranches,
  config,
  onUpdateConfig,
  banners,
  onUpdateBanners,
  user,
  adminRole,
  checkingAdmin,
  onLogout,
  onShowToast,
  onLoginSuccess
}: AdminPanelProps) {
  
  // Tab control states (Supporting Cabang and Manager Accounts)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'produk' | 'launching' | 'event' | 'galeri' | 'custom_cake' | 'hero_banner' | 'cabang' | 'settings' | 'admins' | 'reviews'>('dashboard');

  // Customer Reviews state
  const [panelReviews, setPanelReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Load reviews real-time
  React.useEffect(() => {
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
      setPanelReviews(list);
      setLoadingReviews(false);
    }, (error) => {
      console.warn("[Admin Panel] Error loading reviews (possibly unauthenticated admin panel load):", error);
      setLoadingReviews(false);
      try { handleFirestoreError(error, OperationType.GET, 'reviews'); } catch (e) {}
    });
    return () => unsubscribe();
  }, []);

  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [deleteConfirmReviewId, setDeleteConfirmReviewId] = useState<string | null>(null);

  // Authentication form states - Standard Username and Password ONLY (Google and public registers removed)
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Manager Accounts creation state - Exclusive to Owner
  const [newManagerUsername, setNewManagerUsername] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('');
  const [addManagerLoading, setAddManagerLoading] = useState(false);

  // Global upload process indicator
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadingSection, setUploadingSection] = useState<'product' | 'launching' | 'event' | 'gallery' | 'cake' | 'banner' | 'cabang' | null>(null);

  // Local file picker FileReader base64 preview states for isolated, instant, real-time image previews
  const [productPreviewUrl, setProductPreviewUrl] = useState<string | null>(null);
  const [launchPreviewUrl, setLaunchPreviewUrl] = useState<string | null>(null);
  const [eventPreviewUrl, setEventPreviewUrl] = useState<string | null>(null);
  const [galleryPreviewUrl, setGalleryPreviewUrl] = useState<string | null>(null);
  const [cakePreviewUrl, setCakePreviewUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [cabangPreviewUrl, setCabangPreviewUrl] = useState<string | null>(null);

  // CRUD Item editing/creation states
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Produk>>({
    nama: '', kategori: 'Coffee', harga: 0, deskripsi: '', isBestSeller: false, fotoUrl: ''
  });

  const [editLaunchId, setEditLaunchId] = useState<string | null>(null);
  const [launchForm, setLaunchForm] = useState<Partial<Launching>>({
    nama: '', hargaNormal: 0, hargaPromo: 0, tanggalMulai: '', tanggalSelesai: '', badge: '🚀 Launching', isActive: true, fotoUrl: ''
  });

  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<Partial<Event>>({
    nama: '', deskripsi: '', tanggal: '', fotoUrl: ''
  });

  const [editGalleryId, setEditGalleryId] = useState<string | null>(null);
  const [galleryForm, setGalleryForm] = useState<Partial<Galeri>>({
    fotoUrl: '', deskripsi: ''
  });

  const [editCakeId, setEditCakeId] = useState<string | null>(null);
  const [cakeForm, setCakeForm] = useState<Partial<CustomCake>>({
    nama: '', deskripsi: '', hargaMulai: 0, fotoUrl: '', pilihanRasa: '', isActive: true
  });

  const [editBannerId, setEditBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<Partial<HeroBanner>>({
    fotoUrl: '', title: 'KAKTUS COFFEE', subtitle: 'Eatery & Life', isActive: true, order: 1
  });

  // Cabang edit/creation states
  const [editCabangId, setEditCabangId] = useState<string | null>(null);
  const [cabangForm, setCabangForm] = useState<Partial<Cabang>>({
    nama: '', alamat: '', jamOperasional: '', mapsUrl: '', noWa: '', fotoUrl: '', linkGrabFood: '', noWaCake: '', pesanWaCake: ''
  });

  // Settings administrator listing state
  const [teamAdmins, setTeamAdmins] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Fetch administrator team list (Owner view only)
  const fetchTeamAdmins = async () => {
    if (adminRole !== 'Owner') return;
    if (!auth.currentUser) {
      console.warn('[Admin Panel] Skipping fetchTeamAdmins: No active Firebase Auth session.');
      return;
    }
    setLoadingTeam(true);
    try {
      const snap = await getDocs(collection(db, 'admins'));
      const list: any[] = [];
      const seenUsernames = new Set<string>();
      snap.forEach(doc => {
        const data = doc.data();
        if (data.username) {
          const lowerName = data.username.toLowerCase().trim();
          if (!seenUsernames.has(lowerName)) {
            seenUsernames.add(lowerName);
            list.push(data);
          }
        }
      });
      setTeamAdmins(list);
    } catch (err) {
      console.warn('[Admin Panel] Failed to load admin list from server, returning local catalog:', err);
      try {
        const localAdmins = JSON.parse(localStorage.getItem('kaktus_admins') || '[]');
        const list: any[] = [];
        const seenUsernames = new Set<string>();
        localAdmins.forEach((adm: any) => {
          if (adm.username) {
            const lowerName = adm.username.toLowerCase().trim();
            if (!seenUsernames.has(lowerName)) {
              seenUsernames.add(lowerName);
              list.push(adm);
            }
          }
        });
        setTeamAdmins(list);
      } catch (e) {}
    } finally {
      setLoadingTeam(false);
    }
  };

  React.useEffect(() => {
    if ((activeTab === 'settings' || activeTab === 'admins') && adminRole === 'Owner') {
      fetchTeamAdmins();
    }
  }, [activeTab, adminRole, user]);

  // Translate Username to standard pseudo email representation
  const getPseudoEmail = (username: string) => {
    return username.toLowerCase().trim().replace(/[^a-z0-9]/g, '_') + '@kaktuscoffee.com';
  };

  // SHA256 Password Hash Engine
  const hashPassword = async (plainText: string) => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plainText);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error('[Hash Sg]', e);
      return '';
    }
  };

  // Auth Submit Handlers - Enforces standard Username & Password ONLY
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const rawUsername = usernameInput.trim();
      const inputPass = passwordInput;

      const isOwnerUser = 
        rawUsername.toLowerCase() === 'al rasyak izwar' || 
        rawUsername.toLowerCase() === 'alrazakiswar11@gmail.com' || 
        rawUsername.toLowerCase() === 'al_rasyak_izwar@kaktuscoffee.com' ||
        rawUsername.toLowerCase() === 'alrazakiswar11';

      if (isOwnerUser && (inputPass === 'kaktus123' || inputPass === 'kaktus 123')) {
        console.log(`[Admin Auth Logging] Success: Authenticated Owner 'Al Rasyak Izwar'. finalEmail='al_rasyak_izwar@kaktuscoffee.com'`);
        onShowToast('Memproses otorisasi admin...', 'info');
        
        const finalEmail = rawUsername.toLowerCase().includes('alrazakiswar11')
          ? 'alrazakiswar11@gmail.com'
          : 'al_rasyak_izwar@kaktuscoffee.com';

        try {
          // Authenticate anonymously with Firebase to authorize Firestore database writes
          const cred = await signInAnonymously(auth);
          console.log(`[Admin Auth Logging] Firebase anonymous login successful. userUID: ${cred.user.uid}`);
          
          // Write standard admin document matching strict firestore.rules
          const docRef = doc(db, 'admins', cred.user.uid);
          try {
            await setDoc(docRef, {
              uid: cred.user.uid,
              email: finalEmail,
              role: 'Owner',
              username: 'Al Rasyak Izwar',
              passwordHash: inputPass === 'kaktus 123' 
                ? 'a6e84d1c1e93c191cd2508c25442920f2dcf9977717a870391cc2a0e13430579' // For 'kaktus 123'
                : '38ea1221b3a6efbe669cbdf2674e300ac82effd9d2011b98ce857cc9d8926952' // For 'kaktus123'
            });
            console.log(`[Admin Auth Logging] Owner security document set in Firestore path: admins/${cred.user.uid}`);
          } catch (writeErr) {
            console.warn('[Admin Auth Logging] Firestore direct setDoc error, continuing locally:', writeErr);
            try { handleFirestoreError(writeErr, OperationType.WRITE, `admins/${cred.user.uid}`); } catch (e) {}
            throw writeErr;
          }
        } catch (authErr) {
          console.warn('[Admin Auth Warning] Firebase operation restricted, proceeding in local secure session mode.', authErr);
        }

        // Set local cached session state to preserve logins safely across refreshes
        console.log('[Admin Auth Logging] Creating active browser session in localStorage...');
        localStorage.setItem('kaktus_admin_session', JSON.stringify({ 
          username: 'Al Rasyak Izwar', 
          role: 'Owner',
          email: finalEmail
        }));

        // Trigger reactive parent state updates immediately
        if (onLoginSuccess) {
          onLoginSuccess('Owner', auth.currentUser || {
            uid: 'local_restore_uid',
            email: finalEmail,
            displayName: 'Al Rasyak Izwar'
          });
        }

        onShowToast('Selamat datang kembali di Panel Admin Cafe Kaktus!', 'success');
        setUsernameInput('');
        setPasswordInput('');
      } else {
        // Fallback secondary auth - query Firestore administrators collection for custom managers or secondary owners
        console.log(`[Admin Auth Logging] Initiating fallback query authentication for username='${rawUsername}'...`);
        onShowToast('Memproses otorisasi admin...', 'info');
        const hashedInput = await hashPassword(inputPass);
        
        let foundAdmin: any = null;
        try {
          // Authenticate anonymously first if available to satisfy Firestore rules
          if (!auth.currentUser) {
            try {
              console.log('[Admin Auth Logging] Ensuring active Firebase session for query operation...');
              await signInAnonymously(auth);
            } catch (authErr) {
              console.warn('[Admin Auth Warning] Firebase anonymous auth restricted, proceeding with public query fallback.', authErr);
            }
          }
          console.log('[Admin Auth Logging] Querying all records inside admins collection...');
          const adminsSnap = await getDocs(collection(db, 'admins'));
          adminsSnap.forEach((doc) => {
            const data = doc.data();
            if (
              data.username && 
              data.username.toLowerCase() === rawUsername.toLowerCase() && 
              data.passwordHash === hashedInput
            ) {
              foundAdmin = data;
            }
          });
        } catch (dbErr) {
          console.warn('[Admin DB Auth Query Error - Falling back to local catalogs]', dbErr);
          try { handleFirestoreError(dbErr, OperationType.GET, 'admins'); } catch (e) {}
        }

        if (!foundAdmin) {
          console.log('[Admin Auth Logging] Database query missed. Checking local offline backup caches...');
          const localAdmins = JSON.parse(localStorage.getItem('kaktus_admins') || '[]');
          foundAdmin = localAdmins.find((adm: any) => 
            adm.username && 
            adm.username.toLowerCase() === rawUsername.toLowerCase() && 
            adm.passwordHash === hashedInput
          );
        }

        if (foundAdmin) {
          console.log(`[Admin Auth Logging] Successful authenticated match: role='${foundAdmin.role}', username='${foundAdmin.username}'`);
          // Sync active anonymous Firebase auth session UID to Firestore so the current browser is authorized as Admin
          if (auth.currentUser && auth.currentUser.uid !== foundAdmin.uid) {
            try {
              const sessionEmail = foundAdmin.email || `${foundAdmin.username.toLowerCase().replace(/[^a-z0-9]/g, '_')}@kaktuscoffee.com`;
              console.log(`[Admin Auth Logging] Syncing session credentials to active Firebase UID: ${auth.currentUser.uid}`);
              await setDoc(doc(db, 'admins', auth.currentUser.uid), {
                uid: auth.currentUser.uid,
                email: sessionEmail,
                username: foundAdmin.username,
                role: foundAdmin.role,
                passwordHash: foundAdmin.passwordHash
              });
              console.log('[Admin Auth] Registered active session UID in Firestore:', auth.currentUser.uid);
            } catch (syncErr) {
              console.warn('[Admin Auth Warning] Skipping active session document writing (operating locally):', syncErr);
            }
          }

          console.log('[Admin Auth Logging] Setting localStorage active session metadata...');
          localStorage.setItem('kaktus_admin_session', JSON.stringify({ 
            username: foundAdmin.username, 
            role: foundAdmin.role,
            email: foundAdmin.email || `${foundAdmin.username.toLowerCase().replace(/[^a-z0-9]/g, '_')}@kaktuscoffee.com`
          }));

          if (onLoginSuccess) {
            onLoginSuccess(foundAdmin.role, auth.currentUser || {
              uid: foundAdmin.uid || 'local_restore_uid',
              email: foundAdmin.email || `${foundAdmin.username.toLowerCase().replace(/[^a-z0-9]/g, '_')}@kaktuscoffee.com`,
              displayName: foundAdmin.username
            });
          }

          onShowToast(`Selamat datang kembali, ${foundAdmin.role} ${foundAdmin.username}!`, 'success');
          setUsernameInput('');
          setPasswordInput('');
        } else {
          console.error(`[Admin Auth Logging] Authentication failed: No registered database match for username='${rawUsername}'`);
          throw new Error('Username atau kata sandi salah!');
        }
      }
    } catch (err: any) {
      console.warn('[Admin Auth Error]', err);
      const errMsg = 'Username atau sandi yang Anda masukkan salah! Silakan coba lagi.';
      setAuthError(errMsg);
      onShowToast(errMsg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // 1. PRODUCTS CRUD OPERATIONS
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const list = [...products];
    if (editProductId) {
      const index = list.findIndex(p => p.id === editProductId);
      if (index !== -1) {
        list[index] = { ...list[index], ...productForm } as Produk;
        onUpdateProducts(list);
        onShowToast('Informasi produk berhasil diperbarui!', 'success');
      }
    } else {
      const newId = `prod-${Date.now()}`;
      const newObj = { ...productForm, id: newId } as Produk;
      list.push(newObj);
      onUpdateProducts(list);
      onShowToast('Menu baru berhasil ditambahkan!', 'success');
    }
    setEditProductId(null);
    setProductForm({ nama: '', kategori: 'Coffee', harga: 0, deskripsi: '', isBestSeller: false, fotoUrl: '' });
    setProductPreviewUrl(null);
  };

  const handleProductDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${name}" dari menu?`)) {
      onUpdateProducts(products.filter(p => p.id !== id));
      onShowToast(`Produk "${name}" dihapus dari database.`, 'info');
    }
  };

  // 2. LAUNCHES CRUD OPERATIONS
  const handleSaveLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const list = [...launches];
    if (editLaunchId) {
      const index = list.findIndex(l => l.id === editLaunchId);
      if (index !== -1) {
        list[index] = { ...list[index], ...launchForm } as Launching;
        onUpdateLaunches(list);
        onShowToast('Data promo launching berhasil diperbarui!', 'success');
      }
    } else {
      const newId = `launch-${Date.now()}`;
      const newObj = { ...launchForm, id: newId } as Launching;
      list.push(newObj);
      onUpdateLaunches(list);
      onShowToast('Promo launching baru berhasil diterbitkan!', 'success');
    }
    setEditLaunchId(null);
    setLaunchForm({ nama: '', hargaNormal: 0, hargaPromo: 0, tanggalMulai: '', tanggalSelesai: '', badge: '🚀 Launching', isActive: true, fotoUrl: '' });
    setLaunchPreviewUrl(null);
  };

  const handleLaunchDelete = (id: string, name: string) => {
    if (confirm(`Hapus promo launching "${name}"?`)) {
      onUpdateLaunches(launches.filter(l => l.id !== id));
      onShowToast(`Promo "${name}" dihapus.`, 'info');
    }
  };

  // 3. EVENTS CRUD OPERATIONS
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const list = [...events];
    if (editEventId) {
      const index = list.findIndex(evt => evt.id === editEventId);
      if (index !== -1) {
        list[index] = { ...list[index], ...eventForm } as Event;
        onUpdateEvents(list);
        onShowToast('Event berhasil diperbarui!', 'success');
      }
    } else {
      const newId = `event-${Date.now()}`;
      const newObj = { ...eventForm, id: newId } as Event;
      list.push(newObj);
      onUpdateEvents(list);
      onShowToast('Event baru berhasil didaftarkan!', 'success');
    }
    setEditEventId(null);
    setEventForm({ nama: '', deskripsi: '', tanggal: '', fotoUrl: '' });
    setEventPreviewUrl(null);
  };

  const handleEventDelete = (id: string, name: string) => {
    if (confirm(`Hapus Event "${name}"?`)) {
      onUpdateEvents(events.filter(e => e.id !== id));
      onShowToast(`Event "${name}" dihapus.`, 'info');
    }
  };

  // 4. GALLERY CRUD OPERATIONS
  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.fotoUrl) return;
    const list = [...gallery];
    if (editGalleryId) {
      const index = list.findIndex(gal => gal.id === editGalleryId);
      if (index !== -1) {
        list[index] = { ...list[index], ...galleryForm } as Galeri;
        onUpdateGallery(list);
        onShowToast('Foto galeri diperbarui!', 'success');
      }
    } else {
      const newId = `gal-${Date.now()}`;
      const newObj = { ...galleryForm, id: newId } as Galeri;
      list.push(newObj);
      onUpdateGallery(list);
      onShowToast('Foto baru ditambahkan ke galeri!', 'success');
    }
    setEditGalleryId(null);
    setGalleryForm({ fotoUrl: '', deskripsi: '' });
    setGalleryPreviewUrl(null);
  };

  const handleGalleryDelete = (id: string) => {
    if (confirm('Hapus foto ini dari galeri?')) {
      onUpdateGallery(gallery.filter(g => g.id !== id));
      onShowToast('Foto dihapus dari galeri.', 'info');
    }
  };

  // 5. CUSTOM CAKE CRUD OPERATIONS
  const handleSaveCake = (e: React.FormEvent) => {
    e.preventDefault();
    const list = [...customCakes];
    if (editCakeId) {
      const index = list.findIndex(c => c.id === editCakeId);
      if (index !== -1) {
        list[index] = { ...list[index], ...cakeForm } as CustomCake;
        onUpdateCustomCakes(list);
        onShowToast('Kue kustomisasi berhasil diperbarui!', 'success');
      }
    } else {
      const newId = `cake-${Date.now()}`;
      const newObj = { ...cakeForm, id: newId } as CustomCake;
      list.push(newObj);
      onUpdateCustomCakes(list);
      onShowToast('Model kue kustom baru berhasil didaftarkan!', 'success');
    }
    setEditCakeId(null);
    setCakeForm({ nama: '', deskripsi: '', hargaMulai: 0, fotoUrl: '', pilihanRasa: '', isActive: true });
    setCakePreviewUrl(null);
  };

  const handleCakeDelete = (id: string, name: string) => {
    if (confirm(`Hapus model kue kustom "${name}"?`)) {
      onUpdateCustomCakes(customCakes.filter(c => c.id !== id));
      onShowToast(`Kue "${name}" dihapus dari galeri kue.`, 'info');
    }
  };

  // 6. HERO BANNERS CRUD OPERATIONS
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    const list = [...banners];
    if (editBannerId) {
      const index = list.findIndex(b => b.id === editBannerId);
      if (index !== -1) {
        list[index] = { ...list[index], ...bannerForm } as HeroBanner;
        onUpdateBanners(list);
        onShowToast('Banner slider diperbarui!', 'success');
      }
    } else {
      const newId = `banner-${Date.now()}`;
      const newObj = { ...bannerForm, id: newId } as HeroBanner;
      list.push(newObj);
      onUpdateBanners(list);
      onShowToast('Banner slider berhasil diterbitkan!', 'success');
    }
    setEditBannerId(null);
    setBannerForm({ fotoUrl: '', title: '', subtitle: '', isActive: true, order: banners.length + 1 });
    setBannerPreviewUrl(null);
  };

  const handleBannerDelete = (id: string) => {
    if (confirm('Hapus banner utama ini dari sli-der?')) {
      onUpdateBanners(banners.filter(b => b.id !== id));
      onShowToast('Banner dihapus dari slider.', 'info');
    }
  };

  // Cabang (Branch List) CRUD Operations
  const handleSaveCabang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateBranches) {
      onShowToast('Fungsi update cabang tidak terdefinisi', 'error');
      return;
    }
    const list = [...branches];
    if (editCabangId) {
      const index = list.findIndex(c => c.id === editCabangId);
      if (index !== -1) {
        list[index] = { ...list[index], ...cabangForm } as Cabang;
        onUpdateBranches(list);
        onShowToast('Data cabang berhasil diperbarui!', 'success');
      }
    } else {
      const newId = `cabang-${Date.now()}`;
      const newObj = { ...cabangForm, id: newId } as Cabang;
      list.push(newObj);
      onUpdateBranches(list);
      onShowToast('Cabang baru berhasil didaftarkan!', 'success');
    }
    setEditCabangId(null);
    setCabangForm({ nama: '', alamat: '', jamOperasional: '', mapsUrl: '', noWa: '', fotoUrl: '', linkGrabFood: '', noWaCake: '', pesanWaCake: '' });
    setCabangPreviewUrl(null);
  };

  const handleCabangDelete = (id: string, name: string) => {
    if (!onUpdateBranches) return;
    if (confirm(`Apakah Anda yakin ingin menghapus data Cabang "${name}"?`)) {
      onUpdateBranches(branches.filter(c => c.id !== id));
      onShowToast(`Cabang "${name}" dihapus dari platform.`, 'info');
    }
  };

  // Safe registration of alternative manager accounts by the Owner (Zero-LogOut)
  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminRole !== 'Owner') {
      onShowToast('Hanya Owner yang berhak mendaftarkan Manager baru.', 'error');
      return;
    }
    if (!newManagerUsername.trim() || !newManagerPassword.trim()) {
      onShowToast('Username dan kata sandi wajib diisi!', 'error');
      return;
    }

    setAddManagerLoading(true);
    try {
      const rawUsername = newManagerUsername.trim();
      
      // Strict dry-run unique username validation
      const usernameExists = teamAdmins.some(
        (adm: any) => adm.username && adm.username.toLowerCase().trim() === rawUsername.toLowerCase().trim()
      );
      if (usernameExists) {
        onShowToast(`Username "${rawUsername}" sudah terdaftar sebagai administrator!`, 'error');
        setAddManagerLoading(false);
        return;
      }

      const pseudoEmail = getPseudoEmail(rawUsername);
      const pwHash = await hashPassword(newManagerPassword);

      // Create manager document directly in Firestore to bypass restricted email/password provider registration
      const managerUid = `manager_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newMgr = {
        uid: managerUid,
        email: pseudoEmail,
        username: rawUsername,
        role: 'Manager',
        passwordHash: pwHash
      };

      // Save to offline resilient fallback catalog
      try {
        const localAdmins = JSON.parse(localStorage.getItem('kaktus_admins') || '[]');
        localAdmins.push(newMgr);
        localStorage.setItem('kaktus_admins', JSON.stringify(localAdmins));
      } catch (localStoreErr) {
        console.warn('[Local Admins Sync Warning]', localStoreErr);
      }

      let dbSuccess = true;
      try {
        await setDoc(doc(db, 'admins', managerUid), newMgr);
      } catch (dbErr) {
        console.warn('[Add Manager Firestore - Save cached locally only]', dbErr);
        dbSuccess = false;
      }

      if (dbSuccess) {
        onShowToast(`Manager "${rawUsername}" berhasil ditambahkan secara aman ke server!`, 'success');
      } else {
        onShowToast(`Manager "${rawUsername}" disimpan lokal secara mandiri.`, 'success');
      }

      setNewManagerUsername('');
      setNewManagerPassword('');
      fetchTeamAdmins();
    } catch (err: any) {
      console.warn('[Add Manager Secure Session]', err);
      try { handleFirestoreError(err, OperationType.WRITE, 'admins'); } catch (e) {}
      onShowToast(err.message || 'Gagal menambahkan Manager baru.', 'error');
    } finally {
      setAddManagerLoading(false);
    }
  };

  // Safe deletion of admin managers (Owner only)
  const handleDeleteAdmin = async (targetUid: string, email: string) => {
    if (email === 'alrazakiswar11@gmail.com' || email === 'al_rasyak_izwar@kaktuscoffee.com') {
      onShowToast('Pemegang saham utama (Owner) tidak dapat dinonaktifkan!', 'error');
      return;
    }
    if (confirm(`Cabut otorisasi admin untuk pengguna "${email}"?`)) {
      // Delete from local resilient storage
      try {
        const localAdmins = JSON.parse(localStorage.getItem('kaktus_admins') || '[]');
        const updatedLocals = localAdmins.filter((adm: any) => adm.uid !== targetUid && adm.email !== email);
        localStorage.setItem('kaktus_admins', JSON.stringify(updatedLocals));
      } catch (localErr) {
        console.warn('[Local Sync Auth Error]', localErr);
      }

      try {
        // Enforce cascading deletion of all session references for this administrator
        const snap = await getDocs(collection(db, 'admins'));
        const batch = writeBatch(db);
        let deletedSome = false;
        
        snap.forEach(d => {
          const data = d.data();
          if (data.email === email) {
            batch.delete(doc(db, 'admins', d.id));
            deletedSome = true;
          }
        });
        
        await deleteDoc(doc(db, 'admins', targetUid)); // fallback
        if (deletedSome) {
          await batch.commit();
        }
        onShowToast(`Hak admin untuk "${email}" dicabut.`, 'success');
        fetchTeamAdmins();
      } catch (err) {
        console.warn('[Firestore Delete Admin Error - Keeping local deletion]', err);
        try { handleFirestoreError(err, OperationType.DELETE, `admins/${targetUid}`); } catch (e) {}
        onShowToast(`Hak admin untuk "${email}" dicabut secara lokal.`, 'success');
        fetchTeamAdmins();
      }
    }
  };

  const handleApproveReview = async (id: string, customerName: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: 'approved' });
      onShowToast(`Ulasan dari "${customerName}" berhasil disetujui!`, 'success');
    } catch (err) {
      console.warn('[Admin Panel] Error approving review:', err);
      try { handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`); } catch (e) {}
      onShowToast('Gagal menyetujui ulasan.', 'error');
    }
  };

  const handleDeleteReview = async (id: string, customerName: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
      onShowToast(`Ulasan dari "${customerName}" berhasil dihapus.`, 'info');
    } catch (err) {
      console.warn('[Admin Panel] Error deleting review:', err);
      try { handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`); } catch (e) {}
      onShowToast('Gagal menghapus ulasan.', 'error');
    }
  };

  // RENDER SECURITY CARD PANEL if session verification fails
  if (checkingAdmin) {
    return (
      <div className="pt-32 pb-24 max-w-lg mx-auto px-4 text-center font-sans">
        <div className="glass-panel p-10 rounded-3xl border border-accent-gold/20 flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-accent-gold" size={40} />
          <h3 className="text-white font-display text-base uppercase font-bold tracking-widest leading-normal">
            Memverifikasi Hak Otorisasi...
          </h3>
          <p className="text-slate-400 text-xs">Mohon bersabar, kami sedang memeriksa ketersediaan sesi admin terenkripsi yang aman.</p>
        </div>
      </div>
    );
  }

  if (user && !adminRole) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 font-sans text-left">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-rose-500/25 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-md">
          {/* Accent decoration block */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full border border-rose-500/30 bg-rose-500/10 flex items-center justify-center text-rose-400 mx-auto animate-bounce">
              <ShieldAlert size={24} />
            </div>
            <h2 className="font-display text-xl font-black text-white uppercase tracking-wider">
              Akses Ditolak
            </h2>
            <p className="text-xs text-rose-300 font-mono text-center truncate">
              {user.email}
            </p>
            <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto text-center">
              Sesi terautentikasi berhasil dibaca, namun kredensial Anda **belum terdaftar** dalam kelompok administrator resmi Kaktus Coffee.
            </p>
          </div>

          <div className="bg-black/40 p-4 rounded-xl text-xs space-y-2 text-slate-300 leading-normal border border-white/5">
            <p className="font-bold text-white">💡 Catatan Keamanan:</p>
            <p>Hanya Owner utama (Al Rasyak Izwar) atau manajer tim resmi yang dapat memfasilitasi otorisasi di database. Hubungi administrasi cabang untuk didaftarkan secara manual.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onLogout}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-sans text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-white/10 duration-200"
            >
              <LogOut size={14} className="text-slate-400" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 font-sans text-left">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-accent-gold/25 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-md">
          {/* Accent decoration block */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-accent-gold" />
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full border border-accent-gold/30 bg-accent-gold/10 flex items-center justify-center text-accent-gold mx-auto">
              <ShieldCheck size={24} />
            </div>
            <h2 className="font-display text-xl font-black text-white uppercase tracking-wider">
              Login Kaktus Admin
            </h2>
            <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
              Panel CMS internal terbatas khusus Owner dan Manager Cafe Kaktus.
            </p>
          </div>

          {authError && (
            <div className="p-4 rounded-xl text-xs leading-relaxed border border-red-500/30 bg-red-950/20 text-red-200 flex gap-2">
              <ShieldAlert size={14} className="shrink-0 mt-0.5 text-rose-400" />
              <p>{authError}</p>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono uppercase tracking-widest block" htmlFor="auth-username">Username Admin</label>
              <input
                id="auth-username"
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Masukkan username..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono uppercase tracking-widest block" htmlFor="auth-password">Sandi Akun</label>
              <input
                id="auth-password"
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan sandi..."
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-accent-gold hover:bg-white text-elegant-green-950 hover:scale-[1.02] transform transition-all font-display text-xs uppercase font-extrabold tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:opacity-50"
            >
              {authLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                'Masuk Dashboard'
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[9px] text-slate-500 font-mono">ID KONEKSI: SECURE_KNP_95</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: User Profile & Tab Navigation Rail */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-accent-gold bg-accent-gold/10 flex items-center justify-center text-accent-gold font-bold uppercase text-sm">
                {user.email?.charAt(0) || 'A'}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white leading-none tracking-tight">
                  {user.displayName || 'Administrator'}
                </h3>
                <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-accent-gold block mt-1">
                  🛡️ {adminRole} Mode
                </span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 border border-red-500/30 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 font-display text-[10px] uppercase font-bold tracking-widest py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut size={12} />
              Keluar Sesi
            </button>
          </div>

          {/* Nav Rail Buttons list */}
          <div className="glass-panel p-2 rounded-2xl border border-white/5 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                activeTab === 'dashboard' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
              Ringkasan
            </button>

            <button
              onClick={() => setActiveTab('produk')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                activeTab === 'produk' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Package size={14} />
              Kelula Menu
            </button>

            <button
              onClick={() => setActiveTab('launching')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                activeTab === 'launching' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Sliders size={14} />
              Promo New Launch
            </button>

            <button
              onClick={() => setActiveTab('event')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                activeTab === 'event' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Calendar size={14} />
              Event Kafe
            </button>

            <button
              onClick={() => setActiveTab('galeri')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                activeTab === 'galeri' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ImageIcon size={14} />
              Galeri Foto
            </button>

            <button
              onClick={() => setActiveTab('custom_cake')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                activeTab === 'custom_cake' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Cake size={14} />
              Kue Kustom
            </button>

            <button
              onClick={() => setActiveTab('hero_banner')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                activeTab === 'hero_banner' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Sliders size={14} />
              Hero Banner
            </button>

             <button
              onClick={() => setActiveTab('cabang')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                activeTab === 'cabang' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
              Kelola Cabang
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                activeTab === 'settings' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings size={14} />
              Detail Setelan
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                activeTab === 'reviews' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MessageSquare size={14} />
              Review Customer
            </button>

            {adminRole === 'Owner' && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-display uppercase tracking-widest transition-all ${
                  activeTab === 'admins' ? 'bg-accent-gold text-elegant-green-950 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings size={14} />
                Kelola Akun Manager
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Admin Panel Views */}
        <div className="lg:col-span-9 bg-elegant-green-950/40 p-6 sm:p-8 rounded-3xl border border-white/5 min-h-[500px]">
          
          {/* TAB 1: OPERATIONAL OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-lg font-black uppercase text-white tracking-wider">
                  Ringkasan Operasional Kafe
                </h3>
                <p className="text-xs text-slate-400">Panel pengawasan real-time seluruh modul katalog pemasaran Kaktus Coffee.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-xl font-bold font-mono text-accent-gold">{products.length}</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Menu</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-xl font-bold font-mono text-accent-gold">{launches.length}</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Promo Launch</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-xl font-bold font-mono text-accent-gold">{customCakes.length}</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Kue Kustom</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-xl font-bold font-mono text-accent-gold">{events.length}</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Event Liburan</span>
                </div>
              </div>

              {/* Informational Guidance Box */}
              <div className="glass-panel p-6 rounded-2xl border border-accent-gold/25 bg-accent-gold/5 space-y-3">
                <h4 className="font-display text-xs font-bold text-accent-gold uppercase tracking-wider">
                  Sesi Pelayanan Administrator Aman
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Selamat bekerja, administrator! Seluruh perubahan operasional yang Anda simpan di sini akan dievaluasi dan diperbarui secara real-time bagi para pengunjung kafe. Untuk urusan foto, silakan manfaatkan penarik berkas (Drag & Drop) untuk langsung mengunggah foto kualitas asli Anda ke Firebase Storage.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: MENU PRODUCTS TAB */}
          {activeTab === 'produk' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-white/5 pb-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider">
                    Kelola Katalog Menu Utama
                  </h3>
                  <p className="text-xs text-slate-400">Tambahkan atau ubah data makanan berat, minuman kopi, dan makanan pencuci mulut.</p>
                </div>
              </div>

              {/* Product input / editing FORM */}
              <form onSubmit={handleSaveProduct} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="font-display text-xs font-extrabold uppercase text-accent-gold tracking-widest border-b border-white/5 pb-2">
                  {editProductId ? `📝 Ubah Produk: ${productForm.nama}` : '➕ Tambah Menu Istimewa Baru'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="prod-name-in">Nama Menu</label>
                    <input
                      id="prod-name-in"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={productForm.nama || ''}
                      onChange={(e) => setProductForm({ ...productForm, nama: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="prod-cat-in">Kategori Sajian</label>
                    <select
                      id="prod-cat-in"
                      className="w-full bg-elegant-green-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={productForm.kategori}
                      onChange={(e: any) => setProductForm({ ...productForm, kategori: e.target.value })}
                    >
                      <option value="Coffee">Coffee</option>
                      <option value="Non Coffee">Non Coffee</option>
                      <option value="Main Dish">Main Dish</option>
                      <option value="Dessert">Dessert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="prod-price-in">Harga Jual (Rupiah)</label>
                    <input
                      id="prod-price-in"
                      type="number"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                      value={productForm.harga || 0}
                      onChange={(e) => setProductForm({ ...productForm, harga: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="prod-desc-in">Keterangan / Deskripsi Rasa</label>
                  <textarea
                    id="prod-desc-in"
                    rows={2}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                    value={productForm.deskripsi || ''}
                    onChange={(e) => setProductForm({ ...productForm, deskripsi: e.target.value })}
                  />
                </div>

                {/* Secure Image File drag/drop selector */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-2">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="prod-img-text">Foto Produk Utama (.webp, .png, .jpg)</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
                      <div className="flex-1 flex gap-2">
                        <input
                          id="prod-img-text"
                          type="text"
                          required
                          placeholder="Masukkan URL atau path gambar (JPG, JPEG, PNG, WEBP)..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                          value={productForm.fotoUrl || ''}
                          onChange={(e) => setProductForm({ ...productForm, fotoUrl: e.target.value })}
                        />
                        {productForm.fotoUrl && (
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, fotoUrl: '' })}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                            title="Hapus URL Gambar"
                          >
                            Hapus URL
                          </button>
                        )}
                      </div>
                      {productForm.fotoUrl && (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-black/40">
                          <ImageWithFallback src={productForm.fotoUrl} alt="Preview Produk" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-4 flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer" htmlFor="prod-best-in">
                      <input
                        id="prod-best-in"
                        type="checkbox"
                        className="w-4 h-4 accent-accent-gold"
                        checked={productForm.isBestSeller || false}
                        onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                      />
                      <span className="text-xs text-white font-bold uppercase tracking-wider">🌟 Best Seller</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-white/5">
                  {editProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditProductId(null);
                        setProductForm({ nama: '', kategori: 'Coffee', harga: 0, deskripsi: '', isBestSeller: false, fotoUrl: '' });
                      }}
                      className="border border-white/10 hover:bg-white/5 text-gray-300 font-display text-xs uppercase font-extrabold px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-accent-gold hover:bg-white text-elegant-green-950 font-display text-xs uppercase font-extrabold px-6 py-2.5 rounded-xl cursor-pointer transition-colors"
                  >
                    {editProductId ? 'Simpan Perubahan' : 'Terbitkan Menu'}
                  </button>
                </div>
              </form>

              {/* Product Listing Table */}
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-white/5 text-gray-200 font-display text-[10px] uppercase font-bold tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3">Menu</th>
                      <th className="px-6 py-3">Kategori</th>
                      <th className="px-6 py-3">Harga</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {products.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={item.fotoUrl} alt={item.nama} className="w-10 h-10 rounded-lg object-cover bg-elegant-green-950" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-extrabold text-white block uppercase text-[11px]">{item.nama}</span>
                            {item.isBestSeller && <span className="text-[8px] bg-accent-gold/20 text-accent-gold font-mono px-1.5 py-0.5 rounded font-bold">BEST SELLER</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">{item.kategori}</td>
                        <td className="px-6 py-4 font-mono font-bold text-accent-gold">Rp{item.harga.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditProductId(item.id);
                                setProductForm(item);
                              }}
                              className="p-1.5 hover:bg-accent-gold/10 hover:text-accent-gold rounded duration-200 text-slate-300"
                              title="Ubah"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleProductDelete(item.id, item.nama)}
                              className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded duration-200 text-slate-300"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
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

          {/* TAB 3: PROMO NEW LAUNCHES */}
          {activeTab === 'launching' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  Kelola Promo New Launching
                </h3>
                <p className="text-xs text-slate-400">Buat atau manipulasi promo terbatas lengkap dengan countdown tunda real-time.</p>
              </div>

              {/* Form editing / creation launches */}
              <form onSubmit={handleSaveLaunch} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="font-display text-xs font-extrabold uppercase text-accent-gold tracking-widest border-b border-white/5 pb-2">
                  {editLaunchId ? '📝 Perbarui Promo' : '➕ Buat Promo Baru'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="laun-name-in">Nama Promo</label>
                    <input
                      id="laun-name-in"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={launchForm.nama || ''}
                      onChange={(e) => setLaunchForm({ ...launchForm, nama: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="laun-badge-in">Badge Aksesori (Contoh: 🔥 New)</label>
                    <input
                      id="laun-badge-in"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={launchForm.badge || ''}
                      onChange={(e) => setLaunchForm({ ...launchForm, badge: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="laun-hn-in">Harga Normal</label>
                    <input
                      id="laun-hn-in"
                      type="number"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                      value={launchForm.hargaNormal || 0}
                      onChange={(e) => setLaunchForm({ ...launchForm, hargaNormal: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="laun-hp-in">Harga Promo</label>
                    <input
                      id="laun-hp-in"
                      type="number"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                      value={launchForm.hargaPromo || 0}
                      onChange={(e) => setLaunchForm({ ...launchForm, hargaPromo: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="laun-start-in">Tanggal Mulai</label>
                    <input
                      id="laun-start-in"
                      type="date"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                      value={launchForm.tanggalMulai || ''}
                      onChange={(e) => setLaunchForm({ ...launchForm, tanggalMulai: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="laun-end-in">Tanggal Berakhir</label>
                    <input
                      id="laun-end-in"
                      type="date"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                      value={launchForm.tanggalSelesai || ''}
                      onChange={(e) => setLaunchForm({ ...launchForm, tanggalSelesai: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="laun-img-text">Foto Banner Promo (.webp, .png, .jpg)</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
                    <div className="flex-1 flex gap-2">
                      <input
                        id="laun-img-text"
                        type="text"
                        required
                        placeholder="Masukkan URL Gambar Promo..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                        value={launchForm.fotoUrl || ''}
                        onChange={(e) => setLaunchForm({ ...launchForm, fotoUrl: e.target.value })}
                      />
                      {launchForm.fotoUrl && (
                        <button
                          type="button"
                          onClick={() => setLaunchForm({ ...launchForm, fotoUrl: '' })}
                          className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                          title="Hapus URL Gambar"
                        >
                          Hapus URL
                        </button>
                      )}
                    </div>
                    {launchForm.fotoUrl && (
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-black/40">
                        <ImageWithFallback src={launchForm.fotoUrl} alt="Preview Promo" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  {editLaunchId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditLaunchId(null);
                        setLaunchForm({ nama: '', hargaNormal: 0, hargaPromo: 0, tanggalMulai: '', tanggalSelesai: '', badge: '🚀 Launching', isActive: true, fotoUrl: '' });
                      }}
                      className="border border-white/10 hover:bg-white/5 text-gray-300 font-display text-xs uppercase font-extrabold px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-accent-gold hover:bg-white text-elegant-green-950 font-display text-xs uppercase font-extrabold px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    Simpan Promo
                  </button>
                </div>
              </form>

              {/* Launches lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {launches.map(promo => (
                  <div key={promo.id} className="glass-panel p-4 rounded-2xl border border-white/5 flex gap-4 relative">
                    <img src={promo.fotoUrl} alt={promo.nama} className="w-16 h-16 rounded-xl object-cover bg-elegant-green-950 flex-shrink-0" referrerPolicy="no-referrer" />
                    <div className="space-y-1 flex-1">
                      <span className="text-[9px] bg-red-500/20 text-red-400 font-mono font-bold px-1.5 py-0.5 rounded uppercase">{promo.badge}</span>
                      <h4 className="text-white font-extrabold text-sm line-clamp-1 uppercase">{promo.nama}</h4>
                      <p className="text-xs text-accent-gold font-mono font-bold">
                        Rp{promo.hargaPromo.toLocaleString('id-ID')} <span className="text-[10px] text-gray-500 line-through">Rp{promo.hargaNormal.toLocaleString('id-ID')}</span>
                      </p>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-1">
                      <button
                        onClick={() => {
                          setEditLaunchId(promo.id);
                          setLaunchForm(promo);
                        }}
                        className="p-1.5 bg-white/5 hover:bg-accent-gold/15 text-slate-300 hover:text-accent-gold rounded duration-200"
                        title="Edit"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleLaunchDelete(promo.id, promo.nama)}
                        className="p-1.5 bg-white/5 hover:bg-red-500/15 text-slate-300 hover:text-red-400 rounded duration-200"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EVENTS CATALOG */}
          {activeTab === 'event' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  Kelola Event Terjadwal Kafe
                </h3>
                <p className="text-xs text-slate-400">Jadwalkan atau urus informasi live-music dan nonton bareng istimewa di sini.</p>
              </div>

              {/* CRUD Form for events */}
              <form onSubmit={handleSaveEvent} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="font-display text-xs font-extrabold uppercase text-accent-gold tracking-widest border-b border-white/5 pb-2">
                  {editEventId ? '📝 Edit Event' : '➕ Atur Jadwal Event Baru'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="evt-name-in">Nama Event</label>
                    <input
                      id="evt-name-in"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={eventForm.nama || ''}
                      onChange={(e) => setEventForm({ ...eventForm, nama: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="evt-date-in">Deskripsi Waktu Event (Contoh: Setiap Jumat, 19:30)</label>
                    <input
                      id="evt-date-in"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={eventForm.tanggal || ''}
                      onChange={(e) => setEventForm({ ...eventForm, tanggal: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="evt-desc-in">Deskripsi Event Lengkap</label>
                  <textarea
                    id="evt-desc-in"
                    rows={2}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                    value={eventForm.deskripsi || ''}
                    onChange={(e) => setEventForm({ ...eventForm, deskripsi: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="evt-img-text">Foto Poster Event (.webp, .png, .jpg)</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
                    <div className="flex-1 flex gap-2">
                      <input
                        id="evt-img-text"
                        type="text"
                        required
                        placeholder="Masukkan URL Gambar Poster Event..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                        value={eventForm.fotoUrl || ''}
                        onChange={(e) => setEventForm({ ...eventForm, fotoUrl: e.target.value })}
                      />
                      {eventForm.fotoUrl && (
                        <button
                          type="button"
                          onClick={() => setEventForm({ ...eventForm, fotoUrl: '' })}
                          className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                          title="Hapus URL Gambar"
                        >
                          Hapus URL
                        </button>
                      )}
                    </div>
                    {eventForm.fotoUrl && (
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-black/40">
                        <ImageWithFallback src={eventForm.fotoUrl} alt="Preview Event" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  {editEventId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditEventId(null);
                        setEventForm({ nama: '', deskripsi: '', tanggal: '', fotoUrl: '' });
                      }}
                      className="border border-white/10 hover:bg-white/5 text-gray-300 font-display text-xs uppercase font-extrabold px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-accent-gold hover:bg-white text-elegant-green-950 font-display text-xs uppercase font-extrabold px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    Simpan Event
                  </button>
                </div>
              </form>

              {/* Operational event list display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(evt => (
                  <div key={evt.id} className="glass-panel p-4 rounded-2xl border border-white/5 flex gap-4 relative">
                    <img src={evt.fotoUrl} alt={evt.nama} className="w-16 h-16 rounded-xl object-cover bg-elegant-green-950 flex-shrink-0" referrerPolicy="no-referrer" />
                    <div className="space-y-1 flex-1">
                      <h4 className="text-white font-extrabold text-sm line-clamp-1 uppercase">{evt.nama}</h4>
                      <p className="text-[10px] text-accent-gold font-mono font-bold tracking-wider">{evt.tanggal}</p>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{evt.deskripsi}</p>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-1">
                      <button
                        onClick={() => {
                          setEditEventId(evt.id);
                          setEventForm(evt);
                        }}
                        className="p-1.5 bg-white/5 hover:bg-accent-gold/15 text-slate-300 hover:text-accent-gold rounded"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleEventDelete(evt.id, evt.nama)}
                        className="p-1.5 bg-white/5 hover:bg-red-500/15 text-slate-300 hover:text-red-400 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY TAB */}
          {activeTab === 'galeri' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  Kelola Galeri Foto Aktivitas Kafe
                </h3>
                <p className="text-xs text-slate-400">Tambahkan potongan kenangan manis Kaktus Coffee yang memikat perhatian pelanggan.</p>
              </div>

              {/* CRUD Form for gallery */}
              <form onSubmit={handleSaveGallery} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="font-display text-xs font-extrabold uppercase text-accent-gold tracking-widest border-b border-white/5 pb-2">
                  {editGalleryId ? '📝 Edit Foto Galeri' : '➕ Tambah Foto Galeri Baru'}
                </h4>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="gal-desc-in">Keterangan / Caption Singkat</label>
                  <input
                    id="gal-desc-in"
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                    placeholder="Suasana outdoor senja..."
                    value={galleryForm.deskripsi || ''}
                    onChange={(e) => setGalleryForm({ ...galleryForm, deskripsi: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="gal-img-text">Foto Berkas (.webp, .png, .jpg)</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
                    <div className="flex-1 flex gap-2">
                      <input
                        id="gal-img-text"
                        type="text"
                        required
                        placeholder="Masukkan URL Gambar Galeri..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                        value={galleryForm.fotoUrl || ''}
                        onChange={(e) => setGalleryForm({ ...galleryForm, fotoUrl: e.target.value })}
                      />
                      {galleryForm.fotoUrl && (
                        <button
                          type="button"
                          onClick={() => setGalleryForm({ ...galleryForm, fotoUrl: '' })}
                          className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                          title="Hapus URL Gambar"
                        >
                          Hapus URL
                        </button>
                      )}
                    </div>
                    {galleryForm.fotoUrl && (
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-black/40">
                        <ImageWithFallback src={galleryForm.fotoUrl} alt="Preview Galeri" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  {editGalleryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditGalleryId(null);
                        setGalleryForm({ fotoUrl: '', deskripsi: '' });
                      }}
                      className="border border-white/10 hover:bg-white/5 text-gray-300 font-display text-xs uppercase font-extrabold px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-accent-gold hover:bg-white text-elegant-green-950 font-display text-xs uppercase font-extrabold px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    Simpan Foto
                  </button>
                </div>
              </form>

              {/* Gallery lists layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.map(pic => (
                  <div key={pic.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/5">
                    <img src={pic.fotoUrl} alt={pic.deskripsi} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-elegant-green-950/80 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between text-left">
                      <p className="text-white text-[10px] leading-relaxed line-clamp-3">{pic.deskripsi}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditGalleryId(pic.id);
                            setGalleryForm(pic);
                          }}
                          className="bg-white/10 hover:bg-accent-gold hover:text-elegant-green-950 text-white p-1 rounded transition-colors"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleGalleryDelete(pic.id)}
                          className="bg-white/10 hover:bg-red-500 hover:text-white text-white p-1 rounded transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: NEW DEV CUSTOM CAKE CATALOG */}
          {activeTab === 'custom_cake' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  Kelola Katalog Kue Kustom (Custom Cake)
                </h3>
                <p className="text-xs text-slate-400">Pajang model kue kustomisasi premium untuk momen pernikahan & ulang tahun.</p>
              </div>

              {/* Custom Cake Edit/Creation CRUD form */}
              <form onSubmit={handleSaveCake} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="font-display text-xs font-extrabold uppercase text-accent-gold tracking-widest border-b border-white/5 pb-2">
                  {editCakeId ? `📝 Edit Kue: ${cakeForm.nama}` : '➕ Mendaftarkan Model Kue Kustom Baru'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cake-name-in">Nama Model Kue</label>
                    <input
                      id="cake-name-in"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={cakeForm.nama || ''}
                      onChange={(e) => setCakeForm({ ...cakeForm, nama: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cake-price-in">Harga Mulai (IDR)</label>
                    <input
                      id="cake-price-in"
                      type="number"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                      value={cakeForm.hargaMulai || 0}
                      onChange={(e) => setCakeForm({ ...cakeForm, hargaMulai: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cake-flavor-in">Rasa Opsional (Pisahkan dengan koma)</label>
                    <input
                      id="cake-flavor-in"
                      type="text"
                      placeholder="Contoh: Dark Chocolate, Matcha Tea"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={cakeForm.pilihanRasa || ''}
                      onChange={(e) => setCakeForm({ ...cakeForm, pilihanRasa: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cake-desc-in">Spesifikasi Kue & Deskripsi Lengkap</label>
                  <textarea
                    id="cake-desc-in"
                    rows={2}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                    value={cakeForm.deskripsi || ''}
                    onChange={(e) => setCakeForm({ ...cakeForm, deskripsi: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-2">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cake-img-text">Foto Kue (.webp, .png, .jpg)</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
                      <div className="flex-1 flex gap-2">
                        <input
                          id="cake-img-text"
                          type="text"
                          required
                          placeholder="Masukkan URL Gambar Kue Custom..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                          value={cakeForm.fotoUrl || ''}
                          onChange={(e) => setCakeForm({ ...cakeForm, fotoUrl: e.target.value })}
                        />
                        {cakeForm.fotoUrl && (
                          <button
                            type="button"
                            onClick={() => setCakeForm({ ...cakeForm, fotoUrl: '' })}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                            title="Hapus URL Gambar"
                          >
                            Hapus URL
                          </button>
                        )}
                      </div>
                      {cakeForm.fotoUrl && (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-black/40">
                          <ImageWithFallback src={cakeForm.fotoUrl} alt="Preview Kue" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-4 flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer" htmlFor="cake-active-in">
                      <input
                        id="cake-active-in"
                        type="checkbox"
                        className="w-4 h-4 accent-accent-gold"
                        checked={cakeForm.isActive || false}
                        onChange={(e) => setCakeForm({ ...cakeForm, isActive: e.target.checked })}
                      />
                      <span className="text-xs text-white font-bold uppercase tracking-wider">🟢 Tampilkan Publik</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  {editCakeId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditCakeId(null);
                        setCakeForm({ nama: '', deskripsi: '', hargaMulai: 0, fotoUrl: '', pilihanRasa: '', isActive: true });
                      }}
                      className="border border-white/10 hover:bg-white/5 text-gray-300 font-display text-xs uppercase font-extrabold px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-accent-gold hover:bg-white text-elegant-green-950 font-display text-xs uppercase font-extrabold px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    Simpan Model Kue
                  </button>
                </div>
              </form>

              {/* Cakes list list */}
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-white/5 text-gray-200 font-display text-[10px] uppercase font-bold tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3">Nama Kue</th>
                      <th className="px-6 py-3">Rasa</th>
                      <th className="px-6 py-3">Mulai Dari</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {customCakes.map((cake) => (
                      <tr key={cake.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={cake.fotoUrl} alt={cake.nama} className="w-10 h-10 rounded-lg object-cover bg-elegant-green-950" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-extrabold text-white block uppercase text-[11px]">{cake.nama}</span>
                            {!cake.isActive && <span className="text-[8px] bg-red-500/20 text-red-400 font-mono px-1.5 py-0.5 rounded">DRAFT/NONAKTIF</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">{cake.pilihanRasa || '-'}</td>
                        <td className="px-6 py-4 font-mono font-bold text-accent-gold">Rp{cake.hargaMulai.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditCakeId(cake.id);
                                setCakeForm(cake);
                              }}
                              className="p-1.5 hover:bg-accent-gold/10 hover:text-accent-gold rounded text-slate-300"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleCakeDelete(cake.id, cake.nama)}
                              className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded text-slate-300"
                            >
                              <Trash2 size={14} />
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

          {/* TAB 7: HERO BANNER MANAGEMENT */}
          {activeTab === 'hero_banner' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  Kelola Carousels Hero Banner Utama
                </h3>
                <p className="text-xs text-slate-400">Atur slider promo visual utama di layar paling atas beranda.</p>
              </div>

              {/* Slider CRUD form */}
              <form onSubmit={handleSaveBanner} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="font-display text-xs font-extrabold uppercase text-accent-gold tracking-widest border-b border-white/5 pb-2">
                  {editBannerId ? '📝 Edit URL Latar Belakang Hero' : '➕ Tambah URL Latar Belakang Hero Baru'}
                </h4>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="ban-img-text">URL Foto Latar Belakang Hero (.webp, .png, .jpg)</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
                    <div className="flex-1 flex gap-2">
                      <input
                        id="ban-img-text"
                        type="text"
                        required
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                        value={bannerForm.fotoUrl || ''}
                        placeholder="Masukkan URL Gambar Latar Belakang Hero..."
                        onChange={(e) => setBannerForm({ ...bannerForm, fotoUrl: e.target.value })}
                      />
                      {bannerForm.fotoUrl && (
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, fotoUrl: '' })}
                          className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                          title="Hapus URL Gambar"
                        >
                          Hapus URL
                        </button>
                      )}
                    </div>
                    {bannerForm.fotoUrl && (
                      <div className="w-24 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-black/40">
                        <ImageWithFallback src={bannerForm.fotoUrl} alt="Preview Banner" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  {editBannerId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditBannerId(null);
                        setBannerForm({ fotoUrl: '', title: '', subtitle: '', isActive: true, order: 1 });
                      }}
                      className="border border-white/10 hover:bg-white/5 text-gray-300 font-display text-xs uppercase font-extrabold px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-accent-gold hover:bg-white text-elegant-green-950 font-display text-xs uppercase font-extrabold px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    Simpan Banner
                  </button>
                </div>
              </form>

              {/* Slider lists display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map(ban => (
                  <div key={ban.id} className="relative aspect-[16/9] rounded-2xl overflow-hidden group border border-white/5">
                    <img src={ban.fotoUrl} alt={ban.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-elegant-green-950/80 p-4 flex flex-col justify-between text-left opacity-0 group-hover:opacity-100 transition-opacity">
                      <div>
                        <span className="text-[8px] bg-accent-gold text-elegant-green-950 font-mono font-bold px-2 py-0.5 rounded">SLIDER #{ban.order}</span>
                        <h4 className="text-white font-extrabold text-sm uppercase mt-1.5">{ban.title || 'TANPA JUDUL'}</h4>
                        <p className="text-[10px] text-gray-400 font-sans line-clamp-1">{ban.subtitle || 'Tanpa subjudul'}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditBannerId(ban.id);
                            setBannerForm(ban);
                          }}
                          className="bg-white/10 hover:bg-accent-gold hover:text-elegant-green-950 text-white p-1.5 rounded transition-colors"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleBannerDelete(ban.id)}
                          className="bg-white/10 hover:bg-red-500 hover:text-white text-white p-1.5 rounded transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: GLOBAL SETTINGS & DETAIL KONTAK */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  Pengaturan Detail Kontak & Pemasaran
                </h3>
                <p className="text-xs text-slate-400">Konfigurasikan integrasi tautan operasional pemesanan online ojol dan komunikasi Whatsapp kustom.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* GrabFood setup card */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="font-display text-xs font-bold text-accent-gold uppercase tracking-widest pb-2 border-b border-white/5 flex items-center gap-2">
                    🛵 Integrasi Link GrabFood
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="set-grab-url">URL Toko GrabFood Merchant</label>
                      <input
                        id="set-grab-url"
                        type="text"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                        value={config.linkGrabFood || ''}
                        onChange={(e) => onUpdateConfig({ ...config, linkGrabFood: e.target.value })}
                        placeholder="https://food.grab.com/id/id/restaurant/..."
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Link GrabFood ini secara otomatis disematkan pada seluruh tombol aksi di halaman katalog produk depan.
                    </p>
                  </div>
                </div>

                {/* WhatsApp setup card */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="font-display text-xs font-bold text-accent-gold uppercase tracking-widest pb-2 border-b border-white/5 flex items-center gap-2">
                    💬 WhatsApp Center (Custom Cake)
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="set-wa-cake">Nomor WhatsApp (Sandi Negara, Contoh: 628123456789)</label>
                      <input
                        id="set-wa-cake"
                        type="text"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                        value={config.noWaCake || ''}
                        onChange={(e) => onUpdateConfig({ ...config, noWaCake: e.target.value })}
                        placeholder="6281211112222"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Nomor di atas akan menjadi kontak konsultasi pesanan di formulir kalkulasi custom-cake para calon pelanggan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: KELOLA CABANG (BRANCHES CRUD) */}
          {activeTab === 'cabang' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  Kelola Cabang Cafe Kaktus
                </h3>
                <p className="text-xs text-slate-400">Mendaftarkan, mengedit, atau menghapus informasi gerak cabang operasional Cafe Kaktus.</p>
              </div>

              {/* Cabang Form */}
              <form onSubmit={handleSaveCabang} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="font-display text-xs font-extrabold uppercase text-accent-gold tracking-widest border-b border-white/5 pb-2">
                  {editCabangId ? `📝 Edit Cabang: ${cabangForm.nama}` : '➕ Daftarkan Cabang Baru'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cab-name">Nama Cabang</label>
                    <input
                      id="cab-name"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={cabangForm.nama || ''}
                      onChange={(e) => setCabangForm({ ...cabangForm, nama: e.target.value })}
                      placeholder="Contoh: Kaktus Coffee & Eatery Salatiga"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cab-hours">Jam Operasional</label>
                    <input
                      id="cab-hours"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={cabangForm.jamOperasional || ''}
                      onChange={(e) => setCabangForm({ ...cabangForm, jamOperasional: e.target.value })}
                      placeholder="Contoh: Setiap Hari (10.00 - 23.00 WIB)"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cab-address">Alamat Lengkap Cabang</label>
                  <textarea
                    id="cab-address"
                    rows={2}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                    value={cabangForm.alamat || ''}
                    onChange={(e) => setCabangForm({ ...cabangForm, alamat: e.target.value })}
                    placeholder="Tuliskan detail jalan, kecamatan, kabupaten/kota..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cab-maps">Link Share Google Maps</label>
                    <input
                      id="cab-maps"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={cabangForm.mapsUrl || ''}
                      onChange={(e) => setCabangForm({ ...cabangForm, mapsUrl: e.target.value })}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cab-whatsapp">Nomor WhatsApp Cabang (Umum)</label>
                    <input
                      id="cab-whatsapp"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={cabangForm.noWa || ''}
                      onChange={(e) => setCabangForm({ ...cabangForm, noWa: e.target.value })}
                      placeholder="Contoh: 628123456789"
                    />
                  </div>
                </div>

                {/* Integration Links Section */}
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <h5 className="font-display text-[10px] uppercase tracking-wider font-extrabold text-accent-gold">🥗 Integrasi Layanan Cabang</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cab-grab">Link GrabFood Cabang</label>
                      <input
                        id="cab-grab"
                        type="url"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                        value={cabangForm.linkGrabFood || ''}
                        onChange={(e) => setCabangForm({ ...cabangForm, linkGrabFood: e.target.value })}
                        placeholder="https://food.grab.com/..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cab-wa-cake">Nomor WA Custom Cake Cabang</label>
                      <input
                        id="cab-wa-cake"
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                        value={cabangForm.noWaCake || ''}
                        onChange={(e) => setCabangForm({ ...cabangForm, noWaCake: e.target.value })}
                        placeholder="Contoh: 6285738662165"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cab-pesan-cake">Pesan Otomatis WhatsApp Custom Cake</label>
                    <textarea
                      id="cab-pesan-cake"
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={cabangForm.pesanWaCake || ''}
                      onChange={(e) => setCabangForm({ ...cabangForm, pesanWaCake: e.target.value })}
                      placeholder="Halo Kaktus Coffee! Saya hendak memesan custom cake di cabang ini..."
                    />
                  </div>
                </div>

                {/* Layout Image URL with Fallback Auto-Preview */}
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="cab-foto-text">URL Foto Cabang (.webp, .png, .jpg)</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
                    <div className="flex-1 flex gap-2">
                      <input
                        id="cab-foto-text"
                        type="text"
                        required
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono"
                        value={cabangForm.fotoUrl || ''}
                        onChange={(e) => setCabangForm({ ...cabangForm, fotoUrl: e.target.value })}
                        placeholder="Masukkan URL Gambar Cabang..."
                      />
                      {cabangForm.fotoUrl && (
                        <button
                          type="button"
                          onClick={() => setCabangForm({ ...cabangForm, fotoUrl: '' })}
                          className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                          title="Hapus URL Gambar"
                        >
                          Hapus URL
                        </button>
                      )}
                    </div>
                    {cabangForm.fotoUrl && (
                      <div className="w-24 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-black/40">
                        <ImageWithFallback src={cabangForm.fotoUrl} alt="Preview Lokasi" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  {editCabangId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditCabangId(null);
                        setCabangForm({ nama: '', alamat: '', jamOperasional: '', mapsUrl: '', noWa: '', fotoUrl: '', linkGrabFood: '', noWaCake: '', pesanWaCake: '' });
                        setCabangPreviewUrl(null);
                      }}
                      className="border border-white/10 hover:bg-white/5 text-gray-300 font-display text-xs uppercase font-extrabold px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-accent-gold hover:bg-white text-elegant-green-950 font-display text-xs uppercase font-extrabold px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    Simpan Cabang
                  </button>
                </div>
              </form>

              {/* Branches table view */}
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-white/5 text-gray-200 font-display text-[10px] uppercase font-bold tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3">Foto</th>
                      <th className="px-6 py-3">Nama Cabang</th>
                      <th className="px-6 py-3">Jam Operasional</th>
                      <th className="px-6 py-3">Kontak WA</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {branches.map(cab => (
                      <tr key={cab.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3 shrink-0">
                          <img src={cab.fotoUrl} alt={cab.nama} className="w-12 h-10 object-cover rounded-md border border-white/10" referrerPolicy="no-referrer" />
                        </td>
                        <td className="px-6 py-3 font-semibold text-white">
                          <div className="space-y-0.5">
                            <span>{cab.nama}</span>
                            <span className="block text-[10px] font-normal text-slate-500 line-clamp-1 max-w-xs">{cab.alamat}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-mono text-[10px]">{cab.jamOperasional}</td>
                        <td className="px-6 py-3 font-mono text-[10px]/none text-accent-gold">{cab.noWa}</td>
                        <td className="px-6 py-3 text-center">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => {
                                setEditCabangId(cab.id);
                                setCabangForm(cab);
                                setCabangPreviewUrl(cab.fotoUrl);
                              }}
                              className="bg-white/5 hover:bg-accent-gold hover:text-elegant-green-950 text-white p-2 rounded-xl transition-all"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleCabangDelete(cab.id, cab.nama)}
                              className="bg-white/5 hover:bg-red-500 hover:text-white text-white p-2 rounded-xl transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {branches.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">Belum ada cabang terdaftar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: KELOLA AKUN MANAGER (EXCLUSIVE OWNER REGISTER) */}
          {activeTab === 'admins' && adminRole === 'Owner' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  Kelola Akun Manager
                </h3>
                <p className="text-xs text-slate-400">Daftarkan akun administrator bertipe Manager baru atau berhentikan hak akses secara real-time.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form to add Manager */}
                <form onSubmit={handleAddManager} className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="font-display text-xs font-bold text-accent-gold uppercase tracking-widest pb-2 border-b border-white/5 flex items-center gap-1.5">
                    👥 Registrasikan Manager Baru
                  </h4>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="mgr-username">Username Baru</label>
                      <input
                        id="mgr-username"
                        type="text"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        value={newManagerUsername}
                        onChange={(e) => setNewManagerUsername(e.target.value)}
                        placeholder="Contoh: Budiman, Rasyak"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wide block" htmlFor="mgr-password">Kata Sandi Baru</label>
                      <input
                        id="mgr-password"
                        type="password"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                        value={newManagerPassword}
                        onChange={(e) => setNewManagerPassword(e.target.value)}
                        placeholder="Tentukan sandi login..."
                      />
                    </div>

                    <p className="text-[10px] text-gray-500 leading-normal">
                      Sandi pendaftaran akan disimpan secara terenkripsi (Hash SHA-256) demi menjaga kepatuhan privasi dan aspek keamanan internal CMS.
                    </p>

                    <button
                      type="submit"
                      disabled={addManagerLoading}
                      className="w-full bg-accent-gold hover:bg-white text-elegant-green-950 font-display text-[10px] uppercase font-bold tracking-widest py-3 rounded-xl flex items-center justify-center gap-1.5 duration-200 mt-2 disabled:opacity-50"
                    >
                      {addManagerLoading ? (
                        <Loader2 className="animate-spin text-elegant-green-950" size={14} />
                      ) : (
                        'Daftarkan Akun Manager'
                      )}
                    </button>
                  </div>
                </form>

                {/* Account list view */}
                <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="font-display text-xs font-bold text-accent-gold uppercase tracking-widest pb-2 border-b border-white/5 flex items-center gap-1.5">
                    📋 Anggota Tim Administrator Aktif
                  </h4>

                  {loadingTeam ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400 py-4">
                      <Loader2 size={14} className="animate-spin" />
                      Memuat daftar admin...
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl">
                      <table className="w-full text-left text-xs text-gray-400">
                        <thead className="bg-white/5 text-gray-200 font-mono text-[9px] uppercase tracking-wider border-b border-white/5">
                          <tr>
                            <th className="px-4 py-2">Identitas</th>
                            <th className="px-4 py-2">Peran</th>
                            <th className="px-4 py-2 text-right">Opsi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {teamAdmins.map((adm, index) => (
                            <tr key={adm.uid || index} className="hover:bg-white/[0.01]">
                              <td className="px-4 py-3 text-white">
                                <div className="space-y-0.5">
                                  <span className="font-bold block truncate max-w-[150px]">{adm.username || 'Admin Kaktus'}</span>
                                  <span className="text-[10px] text-gray-500 font-mono">{adm.email}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="bg-accent-gold/20 text-accent-gold text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold">
                                  {adm.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {adm.email !== 'alrazakiswar11@gmail.com' && adm.email !== 'al_rasyak_izwar@kaktuscoffee.com' ? (
                                  <button
                                    onClick={() => handleDeleteAdmin(adm.uid, adm.email)}
                                    className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[10px] px-2.5 py-1 rounded-lg transition-all"
                                  >
                                    Cabut Akses
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-500 italic">Sistem Utama</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: REVIEW CUSTOMER (REAL-TIME MODERATION PANEL) */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  Review & Testimoni Customer
                </h3>
                <p className="text-xs text-slate-400">Moderasi seluruh ulasan dari customer sebelum ditampilkan secara publik di beranda depan website Cafe Kaktus.</p>
              </div>

              {/* Status Stats Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">Total Ulasan</span>
                    <span className="text-2xl font-black font-display text-white mt-1 block">{panelReviews.length}</span>
                  </div>
                  <MessageSquare className="text-accent-gold" size={24} />
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-amber-400 font-mono uppercase font-bold tracking-wider">Menunggu Persetujuan</span>
                    <span className="text-2xl font-black font-display text-amber-500 mt-1 block">
                      {panelReviews.filter(r => r.status === 'pending').length}
                    </span>
                  </div>
                  <Clock className="text-amber-500" size={24} />
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-emerald-400 font-mono uppercase font-bold tracking-wider">Disetujui & Tampil</span>
                    <span className="text-2xl font-black font-display text-emerald-500 mt-1 block">
                      {panelReviews.filter(r => r.status === 'approved').length}
                    </span>
                  </div>
                  <CheckCircle2 className="text-emerald-500" size={24} />
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReviewFilter('all')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-display font-extrabold uppercase tracking-wider transition-all ${
                      reviewFilter === 'all'
                        ? 'bg-accent-gold text-elegant-green-950 shadow-lg'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Semua ({panelReviews.length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('pending')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-display font-extrabold uppercase tracking-wider transition-all ${
                      reviewFilter === 'pending'
                        ? 'bg-amber-500 text-elegant-green-950 shadow-lg'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Pending ({panelReviews.filter(r => r.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('approved')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-display font-extrabold uppercase tracking-wider transition-all ${
                      reviewFilter === 'approved'
                        ? 'bg-emerald-500 text-elegant-green-950 shadow-lg'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Disetujui ({panelReviews.filter(r => r.status === 'approved').length})
                  </button>
                </div>

                <div className="text-right text-[10px] text-gray-500 font-mono">
                  Sinkronisasi real-time Firebase Firestore
                </div>
              </div>

              {/* Reviews Display */}
              {loadingReviews ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="animate-spin text-accent-gold" size={32} />
                  <p className="text-slate-400 text-xs font-mono">Sinkronisasi real-time ulasan...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {panelReviews
                    .filter(r => reviewFilter === 'all' || r.status === reviewFilter)
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((rev) => {
                      const avatarSeed = encodeURIComponent(rev.nama || 'Anonymous');
                      const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;
                      const reviewDate = new Date(rev.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <div key={rev.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4 hover:border-white/10 transition-colors">
                          <div className="space-y-3">
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0 border border-white/10 overflow-hidden">
                                  <img 
                                    src={avatarUrl} 
                                    alt={`${rev.nama}'s avatar`} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="text-left">
                                  <span className="font-display font-extrabold text-white text-sm block uppercase leading-tight">{rev.nama}</span>
                                  <span className="text-[9px] text-gray-500 font-mono block mt-0.5">{reviewDate}</span>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div>
                                {rev.status === 'approved' ? (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                    Disetujui
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold animate-pulse">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stars Rating */}
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={`${
                                    star <= rev.rating
                                      ? 'text-accent-gold fill-accent-gold'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Review Content */}
                            <p className="text-gray-300 text-xs font-sans leading-relaxed text-left line-clamp-4 italic">
                              "{rev.ulasan}"
                            </p>
                          </div>

                          {/* Action Controls */}
                          <div className="flex justify-end items-center gap-2 pt-3 border-t border-white/5">
                            {deleteConfirmReviewId === rev.id ? (
                              <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/20 px-2 py-1 rounded-xl">
                                <span className="text-[10px] text-amber-400 font-sans font-bold select-none px-1">Yakin hapus?</span>
                                <button
                                  onClick={async () => {
                                    await handleDeleteReview(rev.id, rev.nama);
                                    setDeleteConfirmReviewId(null);
                                  }}
                                  className="bg-red-500 hover:bg-red-600 active:scale-95 text-white text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                  title="Konfirmasi hapus permanen"
                                >
                                  Ya
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmReviewId(null)}
                                  className="bg-white/10 hover:bg-white/20 active:scale-95 text-gray-200 text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmReviewId(rev.id)}
                                className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 text-[10px] font-display font-extrabold uppercase px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
                                title="Hapus permanen dari database"
                              >
                                <Trash size={12} />
                                Hapus
                              </button>
                            )}

                            {rev.status === 'pending' && (
                              <button
                                onClick={() => handleApproveReview(rev.id, rev.nama)}
                                className="bg-emerald-500 text-elegant-green-950 hover:bg-white text-[10px] font-display font-black uppercase px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
                                title="Setujui agar tampil publik"
                              >
                                <Check size={12} />
                                Approve
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {panelReviews.filter(r => reviewFilter === 'all' || r.status === reviewFilter).length === 0 && (
                    <div className="md:col-span-2 glass-panel py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-white/5 space-y-2">
                      <MessageSquare className="text-gray-600" size={32} />
                      <p className="text-gray-400 text-xs font-medium">Tidak ada ulasan dalam kategori ini.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
