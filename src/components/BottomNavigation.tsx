import { Home, Compass, Coffee, MapPin, Calendar, ShieldCheck } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateToAdmin: () => void;
  isAdminMode: boolean;
  onExitAdmin: () => void;
}

export default function BottomNavigation({
  activeTab,
  setActiveTab,
  onNavigateToAdmin,
  isAdminMode,
  onExitAdmin
}: BottomNavigationProps) {
  const navItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'promo', label: 'Launch', icon: Compass },
    { id: 'menu', label: 'Menu', icon: Coffee },
    { id: 'branch', label: 'Cabang', icon: MapPin },
    { id: 'reserve', label: 'Reservasi', icon: Calendar }
  ];

  if (isAdminMode) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-elegant-green-950/95 border-t border-accent-gold/20 backdrop-blur-xl py-2 px-4 shadow-2xl flex justify-around items-center">
        <button
          onClick={onExitAdmin}
          className="flex flex-col items-center justify-center p-1.5 text-gray-400 hover:text-white transition-colors"
        >
          <Home size={20} />
          <span className="text-[10px] sm:text-xs mt-0.5">Keluar Admin</span>
        </button>
        <span className="text-xs font-display text-accent-gold uppercase font-semibold border-l border-r border-accent-gold/10 px-4">
          Admin Dashboard
        </span>
        <div className="flex flex-col items-center justify-center p-1.5 text-accent-gold animate-pulse">
          <ShieldCheck size={20} />
          <span className="text-[10px] sm:text-xs mt-0.5">Live</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-elegant-green-950/90 border-t border-accent-gold/15 backdrop-blur-xl py-2 shadow-2xl flex justify-between items-center px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              const element = document.getElementById(item.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-300 ${
              isActive ? 'text-accent-gold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
            <span className="text-[10px] font-medium mt-0.5 tracking-tight font-display">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Admin Quick Button on Mobile Nav */}
      <button
        onClick={onNavigateToAdmin}
        className="flex flex-col items-center justify-center flex-1 py-1.5 text-gray-400 hover:text-accent-gold transition-all duration-300"
      >
        <ShieldCheck size={20} className="stroke-[1.8px]" />
        <span className="text-[10px] font-medium mt-0.5 tracking-tight font-display">Admin</span>
      </button>
    </nav>
  );
}
