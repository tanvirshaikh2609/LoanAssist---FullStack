import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';

const ThemeToggle = ({ 
  variant = 'icon', // 'icon' | 'pill' | 'sidebar'
  className = '',
  showLabel = false 
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={clsx(
          "relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-[#F3F7F4] dark:bg-[#14221A] border border-border-subtle dark:border-[#234231]",
          "text-xs font-bold text-forest dark:text-emerald-100",
          "hover:border-border-emerald transition-all shadow-xs hover:scale-105 active:scale-95",
          className
        )}
      >
        <span className="relative w-4 h-4 flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.span
                key="moon"
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                className="text-amber-300"
              >
                <Moon size={14} className="fill-amber-300/30" />
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                className="text-amber-500"
              >
                <Sun size={14} className="fill-amber-500/20" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span>{isDark ? 'Dark' : 'Light'}</span>
      </button>
    );
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={clsx(
          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold",
          "text-text-secondary hover:text-forest dark:text-slate-300 dark:hover:text-white",
          "hover:bg-[#F3F7F4] dark:hover:bg-[#14221A] transition-colors",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center text-primary dark:text-emerald-400">
            {isDark ? <Moon size={18} className="text-amber-300 fill-amber-300/30" /> : <Sun size={18} className="text-amber-500 fill-amber-500/20" />}
          </div>
          <span className="truncate md:hidden lg:block">Theme</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald dark:border-emerald-800/40 md:hidden lg:block">
          {isDark ? 'Dark' : 'Light'}
        </span>
      </button>
    );
  }

  // Default 'icon' button
  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      className={clsx(
        "relative w-9 h-9 rounded-full flex items-center justify-center",
        "bg-white/80 dark:bg-[#15241B] border border-border-subtle dark:border-[#234231]",
        "text-text-secondary dark:text-emerald-200",
        "hover:text-primary dark:hover:text-white hover:border-border-emerald dark:hover:border-emerald-700/60",
        "shadow-xs hover:shadow-md transition-all hover:scale-105 active:scale-95",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon-icon"
            initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="text-amber-300"
          >
            <Moon size={18} className="fill-amber-300/20" />
          </motion.div>
        ) : (
          <motion.div
            key="sun-icon"
            initial={{ rotate: 45, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -45, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="text-amber-500"
          >
            <Sun size={18} className="fill-amber-500/20" />
          </motion.div>
        )}
      </AnimatePresence>
      {showLabel && (
        <span className="ml-2 text-xs font-bold text-forest dark:text-white">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
