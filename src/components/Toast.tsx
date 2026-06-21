import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: {
      bg: 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100',
      icon: <CheckCircle2 className="text-emerald-400" size={18} />
    },
    error: {
      bg: 'bg-red-950/95 border-red-500/40 text-red-100',
      icon: <AlertCircle className="text-red-400" size={18} />
    },
    info: {
      bg: 'bg-slate-900/95 border-accent-gold/45 text-slate-100',
      icon: <Info className="text-accent-gold" size={18} />
    }
  };

  const config = styles[type] || styles.info;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${config.bg}`}
      >
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 text-xs sm:text-sm font-sans tracking-wide leading-relaxed font-medium">
          {message}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors cursor-pointer p-0.5 rounded"
        >
          <X size={14} />
        </button>
      </motion.div>
    </div>
  );
}
