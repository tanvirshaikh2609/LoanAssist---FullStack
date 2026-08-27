import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Logo from '../shared/Logo';
import ThemeToggle from '../shared/ThemeToggle';

const Navbar = () => {
  const { accessToken, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToastAndRedirect = (msg, path) => {
    setToast(msg);
    setTimeout(() => {
      setToast('');
      navigate(path);
    }, 1800);
  };

  const handleProtectedAction = (e, path, msg) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (accessToken) {
      navigate(path);
    } else {
      if (msg) {
        showToastAndRedirect(msg, '/login');
      } else {
        navigate('/login');
      }
    }
  };

  const handleSectionScroll = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (isHomePage) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-surface/95 dark:bg-surface/95 backdrop-blur-md border border-border-emerald shadow-xl px-6 py-3.5 rounded-full text-sm font-bold text-text-primary flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary-light animate-pulse"></span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <nav 
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled 
            ? "bg-surface/95 dark:bg-surface/95 backdrop-blur-md border-b border-border-subtle shadow-[0_4px_20px_rgba(15,41,30,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] py-3" 
            : "bg-surface/70 dark:bg-surface/70 backdrop-blur-md border-b border-border-subtle/50 py-4"
        )}
      >
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link 
            to="/" 
            onClick={(e) => isHomePage && handleSectionScroll(e, 'hero')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <Logo showText={true} size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            <a 
              href="#hero" 
              onClick={(e) => handleSectionScroll(e, 'hero')} 
              className="text-sm font-bold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              Home
            </a>
            <a 
              href="#about" 
              onClick={(e) => handleSectionScroll(e, 'about')} 
              className="text-sm font-bold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              About
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleSectionScroll(e, 'how-it-works')} 
              className="text-sm font-bold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#predictions" 
              onClick={(e) => handleSectionScroll(e, 'predictions')} 
              className="text-sm font-bold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              Predictions
            </a>
            <a 
              href="#features" 
              onClick={(e) => handleSectionScroll(e, 'features')} 
              className="text-sm font-bold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              Features
            </a>
            <a 
              href="#testimonials" 
              onClick={(e) => handleSectionScroll(e, 'testimonials')} 
              className="text-sm font-bold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              Testimonials
            </a>
            <a 
              href="#faq" 
              onClick={(e) => handleSectionScroll(e, 'faq')} 
              className="text-sm font-bold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              FAQ
            </a>
          </div>

          {/* Right Action Buttons + Theme Toggle */}
          <div className="hidden sm:flex items-center gap-3.5">
            <ThemeToggle variant="icon" />

            {accessToken ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-extrabold text-emerald-800 dark:text-[#A7F3D0] hover:text-emerald-950 dark:hover:text-[#6EE7B7] bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-200/90 dark:border-emerald-700/60 transition-all px-4 py-1.5 rounded-full shadow-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="text-sm font-semibold text-text-secondary hover:text-danger dark:text-slate-300 dark:hover:text-red-400 transition-colors px-4 py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-sm font-bold text-forest dark:text-emerald-100 hover:text-primary dark:hover:text-emerald-400 transition-colors px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="text-sm font-bold bg-[#2D4A22] hover:bg-[#1e3316] text-white px-5 py-2.5 rounded-full transition-all hover-lift shadow-sm flex items-center gap-1.5"
                >
                  Get Started
                  <ArrowUpRight size={15} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Bar with Theme Toggle & Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-forest dark:text-emerald-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-surface border-b border-border-subtle overflow-hidden px-6 py-5 shadow-xl"
            >
              <div className="flex flex-col space-y-4">
                <a 
                  href="#hero" 
                  onClick={(e) => handleSectionScroll(e, 'hero')} 
                  className="text-base font-semibold text-forest hover:text-primary dark:text-emerald-100 transition-colors py-1"
                >
                  Home
                </a>
                <a 
                  href="#about" 
                  onClick={(e) => handleSectionScroll(e, 'about')} 
                  className="text-base font-semibold text-forest hover:text-primary dark:text-emerald-100 transition-colors py-1"
                >
                  About LoanAssist
                </a>
                <a 
                  href="#how-it-works" 
                  onClick={(e) => handleSectionScroll(e, 'how-it-works')} 
                  className="text-base font-semibold text-forest hover:text-primary dark:text-emerald-100 transition-colors py-1"
                >
                  How It Works
                </a>
                <a 
                  href="#predictions" 
                  onClick={(e) => handleSectionScroll(e, 'predictions')} 
                  className="text-base font-semibold text-forest hover:text-primary dark:text-emerald-100 transition-colors py-1"
                >
                  Predictions
                </a>
                <a 
                  href="#features" 
                  onClick={(e) => handleSectionScroll(e, 'features')} 
                  className="text-base font-semibold text-forest hover:text-primary dark:text-emerald-100 transition-colors py-1"
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  onClick={(e) => handleSectionScroll(e, 'testimonials')} 
                  className="text-base font-semibold text-forest hover:text-primary dark:text-emerald-100 transition-colors py-1"
                >
                  Testimonials
                </a>
                <a 
                  href="#faq" 
                  onClick={(e) => handleSectionScroll(e, 'faq')} 
                  className="text-base font-semibold text-forest hover:text-primary dark:text-emerald-100 transition-colors py-1"
                >
                  FAQ
                </a>

                <div className="pt-4 border-t border-border-subtle space-y-3">
                  <a 
                    href="/dashboard/loan" 
                    onClick={(e) => handleProtectedAction(e, '/dashboard/loan', 'Please login to access Loan Eligibility.')} 
                    className="text-sm font-semibold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 block py-1"
                  >
                    Check Loan Eligibility
                  </a>
                  <a 
                    href="/dashboard/compare-loans" 
                    onClick={(e) => handleProtectedAction(e, '/dashboard/compare-loans', 'Please login to access Compare Loans.')} 
                    className="text-sm font-semibold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 block py-1"
                  >
                    Compare Loan Offers
                  </a>
                  <a 
                    href="/dashboard/cards" 
                    onClick={(e) => handleProtectedAction(e, '/dashboard/cards', 'Please login to access Card Recommendations.')} 
                    className="text-sm font-semibold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 block py-1"
                  >
                    Find Best Credit Card
                  </a>
                  <a 
                    href="/dashboard/emi-calculator" 
                    onClick={(e) => handleProtectedAction(e, '/dashboard/emi-calculator', 'Please login to access the EMI Calculator.')} 
                    className="text-sm font-semibold text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 block py-1"
                  >
                    EMI Calculator
                  </a>

                  {accessToken ? (
                    <div className="pt-2 flex flex-col gap-2">
                      <Link 
                        to="/dashboard" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-3 rounded-xl bg-primary text-white font-bold"
                      >
                        Go to Dashboard
                      </Link>
                      <button 
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="w-full text-center py-2.5 text-danger font-semibold"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 grid grid-cols-2 gap-3">
                      <Link 
                        to="/login" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-2.5 rounded-xl border border-border-subtle font-bold text-forest dark:text-emerald-100 hover:bg-forest/5"
                      >
                        Log In
                      </Link>
                      <Link 
                        to="/register" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
