import { useEffect, useState } from 'react';
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

  // 1. Initial State bootstrapping
  useEffect(() => {
    // Check if hashes exist in address bar to route directly
    const handleHashChange = () => {
      setIsAdminMode(window.location.hash === '#admin');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Clear #admin hash on fresh page load or refresh to prevent getting stuck in Admin mode,
    // and route user directly to the home landing page.
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setIsAdminMode(false);
    } else {
      handleHashChange();
    }

    // Load or bootstrap values in localStorage
    const savedProducts = localStorage.getItem('kaktus_products');
    const savedLaunches = localStorage.getItem('kaktus_launches');
    const savedEvents = localStorage.getItem('kaktus_events');
    const savedGallery = localStorage.getItem('kaktus_gallery');
    const savedBranches = localStorage.getItem('kaktus_branches');
    const savedConfig = localStorage.getItem('kaktus_config');

    if (savedProducts && savedLaunches && savedEvents && savedGallery && savedBranches && savedConfig) {
      setProducts(JSON.parse(savedProducts));
      setLaunches(JSON.parse(savedLaunches));
      setEvents(JSON.parse(savedEvents));
      setGallery(JSON.parse(savedGallery));
      setBranches(JSON.parse(savedBranches));
      setConfig(JSON.parse(savedConfig));
    } else {
      // Bootstrap with dynamic seed data
      localStorage.setItem('kaktus_products', JSON.stringify(INITIAL_DATABASE.produk));
      localStorage.setItem('kaktus_launches', JSON.stringify(INITIAL_DATABASE.launching));
      localStorage.setItem('kaktus_events', JSON.stringify(INITIAL_DATABASE.event));
      localStorage.setItem('kaktus_gallery', JSON.stringify(INITIAL_DATABASE.galeri));
      localStorage.setItem('kaktus_branches', JSON.stringify(INITIAL_DATABASE.cabang));
      localStorage.setItem('kaktus_config', JSON.stringify(INITIAL_DATABASE.config));

      setProducts(INITIAL_DATABASE.produk);
      setLaunches(INITIAL_DATABASE.launching);
      setEvents(INITIAL_DATABASE.event);
      setGallery(INITIAL_DATABASE.galeri);
      setBranches(INITIAL_DATABASE.cabang);
      setConfig(INITIAL_DATABASE.config);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. Fetch live data from Google Sheets if enabled
  useEffect(() => {
    if (!config.useGoogleSheets || !config.googleScriptUrl) {
      // If disabled, we rely gracefully on the local state loaded above
      return;
    }

    const fetchGoogleSheetsData = async () => {
      setIsLoadingCloud(true);
      setCloudError('');
      try {
        const response = await fetch(config.googleScriptUrl, {
          method: 'GET'
        });
        
        if (!response.ok) {
          throw new Error('Respons jaringan Server Apps Script tidak valid');
        }

        const resData = await response.json();
        
        if (resData && resData.success && resData.data) {
          const cloudData = resData.data;
          
          if (cloudData.produk && cloudData.produk.length > 0) {
            setProducts(cloudData.produk);
            localStorage.setItem('kaktus_products', JSON.stringify(cloudData.produk));
          }
          if (cloudData.launching && cloudData.launching.length > 0) {
            setLaunches(cloudData.launching);
            localStorage.setItem('kaktus_launches', JSON.stringify(cloudData.launching));
          }
          if (cloudData.event && cloudData.event.length > 0) {
            setEvents(cloudData.event);
            localStorage.setItem('kaktus_events', JSON.stringify(cloudData.event));
          }
          if (cloudData.galeri && cloudData.galeri.length > 0) {
            setGallery(cloudData.galeri);
            localStorage.setItem('kaktus_gallery', JSON.stringify(cloudData.galeri));
          }
          if (cloudData.cabang && cloudData.cabang.length > 0) {
            setBranches(cloudData.cabang);
            localStorage.setItem('kaktus_branches', JSON.stringify(cloudData.cabang));
          }
        } else {
          throw new Error('Isi formulir data Google Sheets kosong atau tidak berstruktur');
        }
      } catch (err: any) {
        console.warn('Google Sheets Fetch Error, falling back to LocalStorage:', err);
        setCloudError('Gagal memuat database cloud, menggunakan cadangan lokal offline.');
      } finally {
        setIsLoadingCloud(false);
      }
    };

    fetchGoogleSheetsData();
  }, [config.useGoogleSheets, config.googleScriptUrl]);

  // Sync state modifications to Local Storage
  const updateProducts = (newList: Produk[]) => {
    setProducts(newList);
    localStorage.setItem('kaktus_products', JSON.stringify(newList));
  };

  const updateLaunches = (newList: Launching[]) => {
    setLaunches(newList);
    localStorage.setItem('kaktus_launches', JSON.stringify(newList));
  };

  const updateEvents = (newList: Event[]) => {
    setEvents(newList);
    localStorage.setItem('kaktus_events', JSON.stringify(newList));
  };

  const updateGallery = (newList: Galeri[]) => {
    setGallery(newList);
    localStorage.setItem('kaktus_gallery', JSON.stringify(newList));
  };

  const updateConfig = (newConfig: DatabaseConfig) => {
    setConfig(newConfig);
    localStorage.setItem('kaktus_config', JSON.stringify(newConfig));
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
