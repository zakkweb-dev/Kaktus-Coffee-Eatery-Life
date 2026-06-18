import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 md:bottom-8 left-6 z-40 flex items-center justify-center w-12 h-12 rounded-full border border-accent-gold/20 bg-elegant-green-950/80 backdrop-blur-md text-accent-gold shadow-lg hover:bg-accent-gold hover:text-elegant-green-950 transition-all duration-300 group ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      title="Kembali ke Atas"
      aria-label="Kembali ke Atas"
    >
      <ArrowUp size={20} className="transition-transform duration-300 group-hover:-translate-y-1" />
    </button>
  );
}
