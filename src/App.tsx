import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db, seedDatabaseIfNeeded, syncStateArrayToFirestore, syncConfig } from './lib/firebase';
import { INITIAL_DATABASE } from './data';
import { Produk, Launching, Event, Galeri, Cabang, DatabaseConfig } from './types';

// Importing sub-components
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import NewLaunch from './components/NewLaunch';
import BestSeller from './components/BestSeller';
import Menu from './components/Menu';
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

export default function App() {
  // State definitions loaded from localStorage or default static database values
  const [products, setProducts] = useState<Produk[]>([]);
  const [launches, setLaunches] = useState<Launching[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [gallery, setGallery] = useState<Galeri[]>([]);
  const [branches, setBranches] = useState<Cabang[]>([]);
  const [config, setConfig] = useState<DatabaseConfig>({ googleScriptUrl: '', useGoogleSheets: false });

  // Navigation route controls
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [cloudError, setCloudError] = useState('');

  // 1. Initial Route and Hash bootstrapping
  useEffect(() => {
    // Check if hashes exist in address bar to route directly
    const handleHashChange = () => {
      setIsAdminMode(window.location.hash === '#admin');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Check hash on initial load
    handleHashChange();

    // Recover from LocalStorage immediately for instant UI availability while fetching Firestore
    const savedProducts = localStorage.getItem('kaktus_products');
    const savedLaunches = localStorage.getItem('kaktus_launches');
    const savedEvents = localStorage.getItem('kaktus_events');
    const savedGallery = localStorage.getItem('kaktus_gallery');
    const savedBranches = localStorage.getItem('kaktus_branches');
    const savedConfig = localStorage.getItem('kaktus_config');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedLaunches) setLaunches(JSON.parse(savedLaunches));
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedGallery) setGallery(JSON.parse(savedGallery));
    if (savedBranches) setBranches(JSON.parse(savedBranches));
    if (savedConfig) setConfig(JSON.parse(savedConfig));

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. Real-time Firebase Firestore synchronizer
  useEffect(() => {
    // Bootstrap Firestore with default data if empty
    seedDatabaseIfNeeded();

    // Register live listeners
    const unsubProducts = onSnapshot(collection(db, 'produk'), (snapshot) => {
      const items: Produk[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Produk);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setProducts(sorted);
      localStorage.setItem('kaktus_products', JSON.stringify(sorted));
    });

    const unsubLaunches = onSnapshot(collection(db, 'launching'), (snapshot) => {
      const items: Launching[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Launching);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setLaunches(sorted);
      localStorage.setItem('kaktus_launches', JSON.stringify(sorted));
    });

    const unsubEvents = onSnapshot(collection(db, 'event'), (snapshot) => {
      const items: Event[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Event);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setEvents(sorted);
      localStorage.setItem('kaktus_events', JSON.stringify(sorted));
    });

    const unsubGallery = onSnapshot(collection(db, 'galeri'), (snapshot) => {
      const items: Galeri[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Galeri);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setGallery(sorted);
      localStorage.setItem('kaktus_gallery', JSON.stringify(sorted));
    });

    const unsubBranches = onSnapshot(collection(db, 'cabang'), (snapshot) => {
      const items: Cabang[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Cabang);
      });
      const sorted = items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setBranches(sorted);
      localStorage.setItem('kaktus_branches', JSON.stringify(sorted));
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'default'), (snapshot) => {
      if (snapshot.exists()) {
        const configData = snapshot.data() as DatabaseConfig;
        setConfig(configData);
        localStorage.setItem('kaktus_config', JSON.stringify(configData));
      }
    });

    return () => {
      unsubProducts();
      unsubLaunches();
      unsubEvents();
      unsubGallery();
      unsubBranches();
      unsubConfig();
    };
  }, []);

  // Sync state modifications to Firebase Cloud Storage with Local cache fallback
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

  const updateConfig = (newConfig: DatabaseConfig) => {
    setConfig(newConfig);
    localStorage.setItem('kaktus_config', JSON.stringify(newConfig));
    syncConfig(newConfig);
  };

  // Safe scroll trigger
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

  return (
    <div className="bg-elegant-green-950 min-h-screen text-slate-100 selection:bg-accent-gold selection:text-elegant-green-950 font-sans antialiased overflow-x-hidden">
      
      {/* Dynamic Cloud Data loading indicator at top */}
      {isLoadingCloud && (
        <div className="fixed top-0 left-0 right-0 z-[110] bg-accent-gold text-elegant-green-950 font-mono text-[10px] uppercase font-bold tracking-widest text-center py-1 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          Mendapatkan data segar dari Google Sheets...
        </div>
      )}

      {cloudError && (
        <div className="fixed top-1 left-4 z-[110] bg-red-500/90 text-white rounded px-3 py-1 text-[10px] font-mono shadow-md">
          ⚠️ {cloudError}
        </div>
      )}

      {/* Global sticky header */}
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
            onUpdateProducts={updateProducts}
            onUpdateLaunches={updateLaunches}
            onUpdateEvents={updateEvents}
            onUpdateGallery={updateGallery}
            config={config}
            onUpdateConfig={updateConfig}
          />
        </div>
      ) : (
        <div className="relative">
          {/* Landing page sections stack */}
          <Hero onScrollTo={handleScrollToSection} />
          <About />
          <NewLaunch launches={launches} />
          <BestSeller products={products} />
          <Menu products={products} />
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
