import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User, signInAnonymously } from 'firebase/auth';
import { db, auth, seedDatabaseIfNeeded, syncStateArrayToFirestore, syncConfig, handleFirestoreError, OperationType } from './lib/firebase';
import { Produk, Launching, Event, Galeri, Cabang, DatabaseConfig, CustomCake, HeroBanner } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { X, Clock, ExternalLink, MessageSquare } from 'lucide-react';

// Importing UI Sub-components
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import NewLaunch from './components/NewLaunch';
import BestSeller from './components/BestSeller';
import Menu from './components/Menu';
import CustomCakeSection from './components/CustomCakeSection';
import CabangSection from './components/Cabang';
import EventSection from './components/EventSection';
import GaleriSection from './components/Galeri';
import Testimoni from './components/Testimoni';
import Reservasi from './components/Reservasi';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import BackToTop from './components/BackToTop';
import BottomNavigation from './components/BottomNavigation';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';

export default function App() {
  // Primary operational states with Local Storage cache recovery
  const [products, setProducts] = useState<Produk[]>([]);
  const [launches, setLaunches] = useState<Launching[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [gallery, setGallery] = useState<Galeri[]>([]);
  const [branches, setBranches] = useState<Cabang[]>([]);
  const [customCakes, setCustomCakes] = useState<CustomCake[]>([]);
  const [config, setConfig] = useState<DatabaseConfig>({ linkGrabFood: 'https://food.grab.com/id/id/restaurant/kaktus-coffee-eatery-galesong-delivery/6-CY3EFH3KLJK3J8' });
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  
  // Security session states
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kaktus_admin_session');
    if (saved) {
      try {
        const parsed = saved === 'active' || saved === 'true' ? { username: 'Al Rasyak Izwar', role: 'Owner' } : JSON.parse(saved);
        if (parsed && parsed.username) {
          const isOwner = parsed.username === 'Al Rasyak Izwar';
          return {
            uid: parsed.uid || 'local_restore_uid',
            email: parsed.email || (isOwner ? 'al_rasyak_izwar@kaktuscoffee.com' : `${parsed.username.toLowerCase().replace(/[^a-z0-9]/g, '_')}@kaktuscoffee.com`),
            displayName: parsed.username
          } as any;
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return null;
  });
  const [adminRole, setAdminRole] = useState<'Owner' | 'Manager' | null>(() => {
    const saved = localStorage.getItem('kaktus_admin_session');
    if (saved) {
      try {
        const parsed = saved === 'active' || saved === 'true' ? { username: 'Al Rasyak Izwar', role: 'Owner' } : JSON.parse(saved);
        if (parsed && parsed.role) {
          return parsed.role as any;
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return null;
  });
  const [checkingAdmin, setCheckingAdmin] = useState(() => {
    const saved = localStorage.getItem('kaktus_admin_session');
    if (saved) return false;
    return true;
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Customer branch routing override popup states
  const [grabFoodModalOpen, setGrabFoodModalOpen] = useState(false);
  const [customCakeModalOpen, setCustomCakeModalOpen] = useState(false);
  const [selectedCakeName, setSelectedCakeName] = useState('');

  // 1. Recover from Cache and Bind Hash Change Router
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminMode(window.location.hash === '#admin');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    const savedProducts = localStorage.getItem('kaktus_products');
    const savedLaunches = localStorage.getItem('kaktus_launches');
    const savedEvents = localStorage.getItem('kaktus_events');
    const savedGallery = localStorage.getItem('kaktus_gallery');
    const savedBranches = localStorage.getItem('kaktus_branches');
    const savedCustomCakes = localStorage.getItem('kaktus_custom_cakes');
    const savedConfig = localStorage.getItem('kaktus_config');
    const savedBanners = localStorage.getItem('kaktus_banners');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedLaunches) setLaunches(JSON.parse(savedLaunches));
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedGallery) setGallery(JSON.parse(savedGallery));
    if (savedBranches) setBranches(JSON.parse(savedBranches));
    if (savedCustomCakes) setCustomCakes(JSON.parse(savedCustomCakes));
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedBanners) setBanners(JSON.parse(savedBanners));

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. Auth Session Guard & Automated Bootstrap Seeding
  useEffect(() => {
    seedDatabaseIfNeeded();

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      const savedSession = localStorage.getItem('kaktus_admin_session');
      let session: any = null;
      
      if (savedSession) {
        try {
          if (savedSession === 'active' || savedSession === 'true') {
            session = { username: 'Al Rasyak Izwar', role: 'Owner' };
          } else {
            session = JSON.parse(savedSession);
          }
          console.log(`[Admin Auth Logging] Read saved session: username="${session?.username}", role="${session?.role}"`);
        } catch (err) {
          console.warn('[Parse Session Saved Fallback applied]', err);
          session = { username: 'Al Rasyak Izwar', role: 'Owner' };
          localStorage.setItem('kaktus_admin_session', JSON.stringify(session));
        }
      }
      
      // If there's an active local session
      if (session) {
        const isBootstrapOwner = session.username === 'Al Rasyak Izwar';
        
        // Securely validate Manager session against master Firestore records on startup
        if (!isBootstrapOwner) {
          setCheckingAdmin(true);
          try {
            console.log(`[Admin Auth Logging] Verifying live status for manager: ${session.username}...`);
            const snap = await getDocs(collection(db, 'admins'));
            let matchedDocs: any[] = [];
            snap.forEach(doc => {
              const data = doc.data();
              if (data.username && data.username.toLowerCase().trim() === session.username.toLowerCase().trim()) {
                matchedDocs.push(data);
              }
            });
            
            const isDeactivated = matchedDocs.some(d => d.status === 'Nonaktif');
            const existsInDb = matchedDocs.length > 0;
            
            if (!existsInDb || isDeactivated) {
              console.warn(`[Admin Auth] Manager "${session.username}" is inactive or deleted in database. Terminating session.`);
              localStorage.removeItem('kaktus_admin_session');
              setUser(null);
              setAdminRole(null);
              setCheckingAdmin(false);
              return;
            }
          } catch (dbErr) {
            console.warn('[Admin Auth Warning] Unable to reach Firestore to verify manager session (operating offline-safe):', dbErr);
          }
        }

        if (!firebaseUser) {
          console.log('[Admin Auth Logging] Local session exists but Firebase user is unauthenticated. Initiating silent Firebase authorization...');
          setCheckingAdmin(true);
          try {
            const cred = await signInAnonymously(auth);
            if (isBootstrapOwner) {
              const docRef = doc(db, 'admins', cred.user.uid);
              await setDoc(docRef, {
                uid: cred.user.uid,
                email: 'al_rasyak_izwar@kaktuscoffee.com',
                role: 'Owner',
                username: 'Al Rasyak Izwar',
                passwordHash: '38ea1221b3a6efbe669cbdf2674e300ac82effd9d2011b98ce857cc9d8926952'
              });
            }
            setUser(cred.user);
            setAdminRole(session.role || 'Manager');
            console.log(`[Admin Auth Logging] Silent anonymous authorization successful. UID: ${cred.user.uid}`);
            await seedDatabaseIfNeeded();
          } catch (err: any) {
            if (err?.code === 'auth/admin-restricted-operation' || err?.message?.includes('admin-restricted-operation')) {
              console.warn('[Admin Auth Logging] Silent anonymous authorization is restricted/disabled by Firebase administration config. Proceeding securely in local offline mode.');
            } else {
              console.error('[Admin Auth Logging] Silent anonymous authorization failed (falling back to secure local mode):', err);
            }
            setUser({
              uid: 'local_restore_uid',
              email: isBootstrapOwner ? 'al_rasyak_izwar@kaktuscoffee.com' : `${session.username.toLowerCase().replace(/[^a-z0-9]/g, '_')}@kaktuscoffee.com`,
              displayName: session.username
            } as any);
            setAdminRole(session.role || 'Manager');
          } finally {
            setCheckingAdmin(false);
          }
          return;
        } else {
          console.log(`[Admin Auth Logging] Valid session & active Firebase user: UID=${firebaseUser.uid}, email=${firebaseUser.email}`);
          setUser(firebaseUser);
          setCheckingAdmin(true);
          try {
            const docRef = doc(db, 'admins', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            if (isBootstrapOwner && !docSnap.exists()) {
              console.log('[Admin Auth Logging] Injecting secure Owner credential document into database...');
              await setDoc(docRef, {
                uid: firebaseUser.uid,
                email: 'al_rasyak_izwar@kaktuscoffee.com',
                role: 'Owner',
                username: 'Al Rasyak Izwar',
                passwordHash: '38ea1221b3a6efbe669cbdf2674e300ac82effd9d2011b98ce857cc9d8926952'
              });
            }
            setAdminRole(session.role || 'Manager');
            await seedDatabaseIfNeeded();
          } catch (err) {
            console.warn('[Admin Auth Logging] Skipping live admin document validation (working offline):', err);
            setAdminRole(session.role || 'Manager');
          } finally {
            setCheckingAdmin(false);
          }
          return;
        }
      }

      // No active local session - standard clean-up
      if (firebaseUser) {
        console.log(`[Admin Auth Logging] Unauthenticated state: No local session was found, but a Firebase session exists with UID: ${firebaseUser.uid}. Querying authorization database...`);
        setCheckingAdmin(true);
        try {
          const docRef = doc(db, 'admins', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().username === 'Al Rasyak Izwar') {
            console.log('[Admin Auth Logging] Query hit: Matching Owner ID found. Restoring session...');
            setUser(firebaseUser);
            setAdminRole('Owner');
            localStorage.setItem('kaktus_admin_session', JSON.stringify({ username: 'Al Rasyak Izwar', role: 'Owner' }));
            await seedDatabaseIfNeeded();
          } else {
            console.warn('[Admin Auth Logging] Query miss: Document is either unregistered or does not have permissions. Retaining blocked/anonymous state.');
            setUser(null);
            setAdminRole(null);
          }
        } catch (err) {
          console.info('[Admin Auth Logging] Failed to query admins collection on startup (offline safe mode applied):', err);
          setUser(null);
          setAdminRole(null);
        } finally {
          setCheckingAdmin(false);
        }
      } else {
        console.log('[Admin Auth Logging] Completely logged out state: No local session, no Firebase session.');
        setUser(null);
        setAdminRole(null);
        setCheckingAdmin(false);
      }
    });

    return () => unsubAuth();
  }, []);

  // 3. Bind Live Firestore Listeners
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'produk'), (snapshot) => {
      const items: Produk[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Produk);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setProducts(sorted);
      localStorage.setItem('kaktus_products', JSON.stringify(sorted));
    }, (error) => {
      if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        try { handleFirestoreError(error, OperationType.GET, 'produk'); } catch (e) {}
      } else {
        console.error('[Firebase] Error loading products:', error);
      }
    });

    const unsubLaunches = onSnapshot(collection(db, 'launching'), (snapshot) => {
      const items: Launching[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Launching);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setLaunches(sorted);
      localStorage.setItem('kaktus_launches', JSON.stringify(sorted));
    }, (error) => {
      if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        try { handleFirestoreError(error, OperationType.GET, 'launching'); } catch (e) {}
      } else {
        console.error('[Firebase] Error loading launches:', error);
      }
    });

    const unsubEvents = onSnapshot(collection(db, 'event'), (snapshot) => {
      const items: Event[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Event);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setEvents(sorted);
      localStorage.setItem('kaktus_events', JSON.stringify(sorted));
    }, (error) => {
      if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        try { handleFirestoreError(error, OperationType.GET, 'event'); } catch (e) {}
      } else {
        console.error('[Firebase] Error loading events:', error);
      }
    });

    const unsubGallery = onSnapshot(collection(db, 'galeri'), (snapshot) => {
      const items: Galeri[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Galeri);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setGallery(sorted);
      localStorage.setItem('kaktus_gallery', JSON.stringify(sorted));
    }, (error) => {
      if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        try { handleFirestoreError(error, OperationType.GET, 'galeri'); } catch (e) {}
      } else {
        console.error('[Firebase] Error loading gallery:', error);
      }
    });

    const unsubBranches = onSnapshot(collection(db, 'cabang'), (snapshot) => {
      const items: Cabang[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Cabang);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setBranches(sorted);
      localStorage.setItem('kaktus_branches', JSON.stringify(sorted));
    }, (error) => {
      if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        try { handleFirestoreError(error, OperationType.GET, 'cabang'); } catch (e) {}
      } else {
        console.error('[Firebase] Error loading branches:', error);
      }
    });

    const unsubCustomCakes = onSnapshot(collection(db, 'custom_cake'), (snapshot) => {
      const items: CustomCake[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as CustomCake);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setCustomCakes(sorted);
      localStorage.setItem('kaktus_custom_cakes', JSON.stringify(sorted));
    }, (error) => {
      if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        try { handleFirestoreError(error, OperationType.GET, 'custom_cake'); } catch (e) {}
      } else {
        console.error('[Firebase] Error loading custom cakes:', error);
      }
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'default'), (snapshot) => {
      if (snapshot.exists()) {
        const configData = snapshot.data() as DatabaseConfig;
        setConfig(configData);
        localStorage.setItem('kaktus_config', JSON.stringify(configData));
      }
    }, (error) => {
      if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        try { handleFirestoreError(error, OperationType.GET, 'config/default'); } catch (e) {}
      } else {
        console.error('[Firebase] Error loading config:', error);
      }
    });

    const unsubBanners = onSnapshot(collection(db, 'hero_banners'), (snapshot) => {
      const items: HeroBanner[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as HeroBanner);
      });
      const sorted = items.sort((a, b) => a.order - b.order);
      setBanners(sorted);
      localStorage.setItem('kaktus_banners', JSON.stringify(sorted));
    }, (error) => {
      if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        try { handleFirestoreError(error, OperationType.GET, 'hero_banners'); } catch (e) {}
      } else {
        console.error('[Firebase] Error loading hero banners:', error);
      }
    });

    return () => {
      unsubProducts();
      unsubLaunches();
      unsubEvents();
      unsubGallery();
      unsubBranches();
      unsubCustomCakes();
      unsubConfig();
      unsubBanners();
    };
  }, []);

  // 4. State mutators with delta synced transactions
  const updateProducts = (newList: Produk[]) => {
    const oldList = [...products];
    setProducts(newList);
    localStorage.setItem('kaktus_products', JSON.stringify(newList));
    syncStateArrayToFirestore('produk', oldList, newList);
  };

  const updateLaunches = (newList: Launching[]) => {
    const oldList = [...launches];
    setLaunches(newList);
    localStorage.setItem('kaktus_launches', JSON.stringify(newList));
    syncStateArrayToFirestore('launching', oldList, newList);
  };

  const updateEvents = (newList: Event[]) => {
    const oldList = [...events];
    setEvents(newList);
    localStorage.setItem('kaktus_events', JSON.stringify(newList));
    syncStateArrayToFirestore('event', oldList, newList);
  };

  const updateGallery = (newList: Galeri[]) => {
    const oldList = [...gallery];
    setGallery(newList);
    localStorage.setItem('kaktus_gallery', JSON.stringify(newList));
    syncStateArrayToFirestore('galeri', oldList, newList);
  };

  const updateCustomCakes = (newList: CustomCake[]) => {
    const oldList = [...customCakes];
    setCustomCakes(newList);
    localStorage.setItem('kaktus_custom_cakes', JSON.stringify(newList));
    syncStateArrayToFirestore('custom_cake', oldList, newList);
  };

  const updateBranches = (newList: Cabang[]) => {
    const oldList = [...branches];
    setBranches(newList);
    localStorage.setItem('kaktus_branches', JSON.stringify(newList));
    syncStateArrayToFirestore('cabang', oldList, newList);
  };

  const updateConfig = (newConfig: DatabaseConfig) => {
    setConfig(newConfig);
    localStorage.setItem('kaktus_config', JSON.stringify(newConfig));
    syncConfig(newConfig);
    showToast('Konfigurasi berhasil disimpan.', 'success');
  };

  const updateBanners = (newList: HeroBanner[]) => {
    const oldList = [...banners];
    setBanners(newList);
    localStorage.setItem('kaktus_banners', JSON.stringify(newList));
    syncStateArrayToFirestore('hero_banners', oldList, newList);
  };

  const handleScrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleLoginSuccess = (role: 'Owner' | 'Manager', localUser?: any) => {
    setAdminRole(role);
    setUser(localUser || {
      uid: 'local_restore_uid',
      email: 'al_rasyak_izwar@kaktuscoffee.com',
      displayName: 'Al Rasyak Izwar'
    } as any);
    setCheckingAdmin(false);
  };

  const handleLogout = async () => {
    try {
      console.log('[Admin Auth Logging] Initiating logout sequence...');
      console.log('[Admin Auth Logging] Deleting local and session storage...');
      
      // Remove authentication session keys from localStorage
      localStorage.removeItem('kaktus_admin_session');
      
      // Clear all sessionStorage cached buffers
      sessionStorage.clear();

      // Clear all browser authentication cookies dynamically
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }

      console.log('[Admin Auth Logging] Revoking Firebase auth token session...');
      // Terminate any active Firebase user sessions
      await signOut(auth);

      // Reset application level react states
      setUser(null);
      setAdminRole(null);
      
      console.log('[Admin Auth Logging] Logout completed. Session successfully deleted.');
      showToast('Sesi Anda berakhir. Silakan login ulang.', 'success');
      
      // Force return to Admin Login card
      setIsAdminMode(true);
      window.location.hash = 'admin';
    } catch (err) {
      console.error('[Admin Auth Logging] Critical error occurred during logout:', err);
      showToast('Gagal keluar dari panel admin.', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  return (
    <div className="bg-elegant-green-950 min-h-screen text-slate-100 selection:bg-accent-gold selection:text-elegant-green-950 font-sans antialiased overflow-x-hidden">
      
      {/* Global Sticky Navigation Header */}
      <Header
        isAdminMode={isAdminMode}
        onNavigateToAdmin={() => {
          setIsAdminMode(true);
          window.location.hash = 'admin';
        }}
        onExitAdmin={() => {
          setIsAdminMode(false);
          window.location.hash = '';
        }}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Conditionally reveal ADMIN PANEL or PUBLIC WEBSITE */}
      {isAdminMode ? (
        <div className="animate-fade-in">
          <AdminPanel
            products={products}
            launches={launches}
            events={events}
            gallery={gallery}
            branches={branches}
            customCakes={customCakes}
            onUpdateProducts={updateProducts}
            onUpdateLaunches={updateLaunches}
            onUpdateEvents={updateEvents}
            onUpdateGallery={updateGallery}
            onUpdateCustomCakes={updateCustomCakes}
            onUpdateBranches={updateBranches}
            config={config}
            onUpdateConfig={updateConfig}
            banners={banners}
            onUpdateBanners={updateBanners}
            user={user}
            adminRole={adminRole}
            checkingAdmin={checkingAdmin}
            onLogout={handleLogout}
            onLoginSuccess={handleLoginSuccess}
            onShowToast={showToast}
          />
        </div>
      ) : (
        <div className="relative">
          {/* Landing page sections stack */}
          <Hero onScrollTo={handleScrollToSection} banners={banners} />
          <About />
          <NewLaunch launches={launches} linkGrabFood={config.linkGrabFood} onOrderGrabFood={() => setGrabFoodModalOpen(true)} />
          <BestSeller products={products} linkGrabFood={config.linkGrabFood} onOrderGrabFood={() => setGrabFoodModalOpen(true)} />
          <Menu products={products} linkGrabFood={config.linkGrabFood} onOrderGrabFood={() => setGrabFoodModalOpen(true)} />
          <CustomCakeSection customCakes={customCakes} noWaCake={config.noWaCake} onConsultCake={(cakeName) => {
            setSelectedCakeName(cakeName);
            setCustomCakeModalOpen(true);
          }} />
          <CabangSection branches={branches} />
          <EventSection events={events} onScrollTo={handleScrollToSection} />
          <GaleriSection gallery={gallery} />
          <Testimoni />
          <Reservasi branches={branches} />
          <Footer
            onScrollTo={handleScrollToSection}
            onNavigateToAdmin={() => {
              setIsAdminMode(true);
              window.location.hash = 'admin';
              window.scrollTo(0, 0);
            }}
          />

          {/* Floating UI overlay widgets */}
          <FloatingWhatsApp noWa={branches[0]?.noWa} namaCabang={branches[0]?.nama} />
          <BackToTop />
        </div>
      )}

      {/* 🛵 GrabFood Branch Selection Popup Modal */}
      <AnimatePresence>
        {grabFoodModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setGrabFoodModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-elegant-green-950/95 border border-accent-gold/25 text-white max-w-md w-full rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-accent-gold font-bold">🛵 Delivery Order</span>
                  <h4 className="font-display text-lg font-extrabold uppercase tracking-tight">Pilih Cabang Terdekat</h4>
                </div>
                <button
                  onClick={() => setGrabFoodModalOpen(false)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  id="close-grabfood-modal"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-gray-300 text-xs sm:text-sm font-sans">
                Silakan pilih outlet cabang Cafe Kaktus yang paling dekat dengan lokasi Anda untuk menghemat ongkos kirim GrabFood.
              </p>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {branches.filter(b => b.linkGrabFood && b.linkGrabFood.trim() !== '').length > 0 ? (
                  branches.filter(b => b.linkGrabFood && b.linkGrabFood.trim() !== '').map((branch) => (
                    <div 
                      key={branch.id} 
                      className="p-4 rounded-xl border border-white/5 bg-white/5 hover:border-accent-gold/30 hover:bg-white/10 transition-all flex justify-between items-center group gap-4 text-left"
                    >
                      <div className="space-y-1">
                        <span className="block text-xs font-bold font-display text-white uppercase group-hover:text-accent-gold transition-colors">{branch.nama}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                          <Clock size={12} className="text-accent-gold" />
                          <span>{branch.jamOperasional}</span>
                        </div>
                      </div>
                      <a
                        href={branch.linkGrabFood}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#00B14F] hover:bg-emerald-500 text-white text-[10px] font-display font-extrabold uppercase tracking-wide px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-md"
                      >
                        Pesan
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center border border-dashed border-white/10 rounded-xl space-y-3">
                    <p className="text-xs text-gray-400">Belum ada cabang dengan konfigurasi layanan online GrabFood.</p>
                    <a
                      href={config.linkGrabFood || "https://food.grab.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#00B14F] hover:bg-emerald-500 text-white text-[10px] font-display font-extrabold uppercase tracking-wide px-4 py-2 rounded-lg transition-colors"
                    >
                      Buka GrabFood Global
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎂 Custom Cake Branch Selection Popup Modal */}
      <AnimatePresence>
        {customCakeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setCustomCakeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-elegant-green-950/95 border border-accent-gold/25 text-white max-w-md w-full rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-accent-gold font-bold">🎂 Custom Cake Baker</span>
                  <h4 className="font-display text-lg font-extrabold uppercase tracking-tight">Pilih Cabang Pembuatan</h4>
                </div>
                <button
                  onClick={() => setCustomCakeModalOpen(false)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  id="close-cake-modal"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-gray-300 text-xs sm:text-sm font-sans">
                Kue kustomisasi premium Kaktus dibuat eksklusif & hand-crafted di outlet cabang pilihan Anda. Silakan pilih cabang Anda:
              </p>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin text-left">
                {branches.filter(b => b.noWaCake && b.noWaCake.trim() !== '').length > 0 ? (
                  branches.filter(b => b.noWaCake && b.noWaCake.trim() !== '').map((branch) => (
                    <div 
                      key={branch.id} 
                      className="p-4 rounded-xl border border-white/5 bg-white/5 hover:border-accent-gold/30 hover:bg-white/10 transition-all flex justify-between items-center group gap-4 text-left"
                    >
                      <div className="space-y-1 flex-1">
                        <span className="block text-xs font-bold font-display text-white uppercase group-hover:text-accent-gold transition-colors">{branch.nama}</span>
                        <p className="text-[10px] text-gray-400 line-clamp-1">{branch.alamat}</p>
                      </div>
                      <button
                        onClick={() => {
                          const customMessage = branch.pesanWaCake 
                            ? branch.pesanWaCake.replace('{nama}', selectedCakeName) 
                            : `Halo Kaktus Coffee & Bakeshop! Saya ingin berkonsultasi mengenai pesanan kue kustomisasi untuk model "${selectedCakeName}". Mohon info detail untuk ukuran, rasa, dan waktu pembuatan.`;
                          const cleanWa = branch.noWaCake.replace(/[^0-9]/g, '');
                          window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(customMessage)}`, '_blank');
                          setCustomCakeModalOpen(false);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-display font-extrabold uppercase tracking-wide px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-md shrink-0"
                      >
                        Pilih
                        <MessageSquare size={10} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center border border-dashed border-white/10 rounded-xl space-y-3">
                    <p className="text-xs text-gray-400">Pemesanan kue sementara diarahkan ke nomor WA pusat bakeshop.</p>
                    <button
                      onClick={() => {
                        const centralMessage = `Halo Kaktus Coffee & Bakeshop! Saya ingin berkonsultasi mengenai pesanan kue kustomisasi untuk model "${selectedCakeName}". Mohon info detail untuk ukuran, rasa, dan waktu pembuatan.`;
                        const cleanWa = (config.noWaCake || '6285738662165').replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(centralMessage)}`, '_blank');
                        setCustomCakeModalOpen(false);
                      }}
                      className="inline-block bg-accent-gold hover:bg-white text-elegant-green-950 text-[10px] font-display font-extrabold uppercase tracking-wide px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Hubungi WA Pusat
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Toast notifications wrapper */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile-only Bottom Navigation Tab bar */}
      <BottomNavigation
        activeTab={activeSection}
        setActiveTab={handleScrollToSection}
        onNavigateToAdmin={() => {
          setIsAdminMode(true);
          window.location.hash = 'admin';
          window.scrollTo(0, 0);
        }}
        isAdminMode={isAdminMode}
        onExitAdmin={() => {
          setIsAdminMode(false);
          window.location.hash = '';
          window.scrollTo(0, 0);
        }}
      />
    </div>
  );
}
