import { useEffect, useState } from 'react';
import { Menu, X, Shield, Coffee } from 'lucide-react';

interface HeaderProps {
  onNavigateToAdmin: () => void;
  isAdminMode: boolean;
  onExitAdmin: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Header({
  onNavigateToAdmin,
  isAdminMode,
  onExitAdmin,
  activeSection,
  setActiveSection
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'Cerita Kami' },
    { id: 'promo', label: 'New Launch' },
    { id: 'bestseller', label: 'Terlaris' },
    { id: 'menu', label: 'Menu' },
    { id: 'branch', label: 'Cabang' },
    { id: 'event', label: 'Event' },
    { id: 'gallery', label: 'Galeri' },
    { id: 'reserve', label: 'Reservasi' }
  ];

  const handleScrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-elegant-green-950/85 backdrop-blur-md border-b border-accent-gold/15 py-3 shadow-md'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => {
            if (isAdminMode) {
              onExitAdmin();
            } else {
              handleScrollTo('hero');
            }
          }}
          className="flex items-center gap-2 group text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full border border-accent-gold/25 bg-elegant-green-900/60 flex items-center justify-center text-accent-gold transition-transform duration-500 group-hover:rotate-12">
            <Coffee size={20} />
          </div>
          <div>
            <span className="block font-display text-base font-extrabold tracking-wider text-white uppercase sm:text-lg">
              Kaktus <span className="text-accent-gold font-light">Coffee</span>
            </span>
            <span className="block text-[9px] -mt-1 tracking-widest text-[#a6bca2] uppercase font-mono">
              Eatery & Life
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        {!isAdminMode ? (
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScrollTo(link.id)}
                className={`text-xs font-display uppercase tracking-widest transition-colors duration-200 cursor-pointer ${
                  activeSection === link.id
                    ? 'text-accent-gold font-semibold'
                    : 'text-gray-300 hover:text-accent-gold'
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={onNavigateToAdmin}
              className="ml-4 flex items-center gap-1.5 border border-accent-gold/30 bg-accent-gold/10 px-3.5 py-1.5 rounded-full text-xs font-display uppercase tracking-widest text-accent-gold hover:bg-accent-gold hover:text-elegant-green-950 transition-all duration-300 cursor-pointer"
            >
              <Shield size={12} />
              Admin
            </button>
          </nav>
        ) : (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-accent-gold/15 border border-accent-gold/35 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold font-semibold">
                Admin Mode
              </span>
            </div>
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 border border-white/20 bg-white/5 px-4 py-1.5 rounded-full text-xs font-display uppercase tracking-widest text-white hover:bg-white hover:text-elegant-green-950 transition-all duration-300"
            >
              Keluar Panel
            </button>
          </div>
        )}

        {/* Mobile Hamburger (Only in user mode) */}
        {!isAdminMode && (
          <div className="flex xl:hidden items-center gap-3">
            <button
              onClick={onNavigateToAdmin}
              className="p-1.5 border border-accent-gold/20 bg-accent-gold/5 rounded-full text-accent-gold hover:bg-accent-gold/15"
              title="Dashboard Admin"
            >
              <Shield size={16} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-gray-300 hover:text-accent-gold rounded-md"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Panel (Slide down drawers) */}
      {!isAdminMode && isMobileMenuOpen && (
        <div className="xl:hidden bg-elegant-green-950/95 backdrop-blur-xl border-b border-accent-gold/15 py-4 px-6 animate-fade-in">
          <div className="flex flex-col gap-3.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScrollTo(link.id)}
                className={`text-left text-sm font-display uppercase tracking-widest py-1 duration-200 ${
                  activeSection === link.id
                    ? 'text-accent-gold font-bold'
                    : 'text-gray-300 hover:text-accent-gold'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-accent-gold/10 pt-3 flex justify-between items-center">
              <span className="text-xs text-gray-400 font-mono">Tautan Khusus:</span>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigateToAdmin();
                }}
                className="flex items-center gap-1.5 border border-accent-gold/30 bg-accent-gold/20 px-4 py-1.5 rounded-full text-xs font-display uppercase tracking-widest text-accent-gold"
              >
                <Shield size={12} />
                Dashboard Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
