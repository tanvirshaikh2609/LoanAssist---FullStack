import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeToggle from '../shared/ThemeToggle';

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('compare-loans')) return 'Compare Loans';
    if (path === '/dashboard') return 'Overview';
    if (path.includes('loan')) return 'Loan Eligibility';
    if (path.includes('cards')) return 'Credit Cards';
    if (path.includes('emi')) return 'EMI Calculator';
    if (path.includes('profile')) return 'Profile';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen flex bg-background text-text-primary">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>

      <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Top bar with ThemeToggle */}
        <header className="h-16 bg-surface border-b border-border-subtle flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMobileSidebar}
              className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-forest">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="icon" />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
