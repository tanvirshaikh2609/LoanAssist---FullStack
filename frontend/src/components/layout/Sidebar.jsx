import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, Scale, CreditCard, Calculator, User, LogOut, X } from 'lucide-react';
import clsx from 'clsx';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../shared/Logo';
import ThemeToggle from '../shared/ThemeToggle';

const Sidebar = ({ isMobileOpen, closeMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Loan Eligibility', path: '/dashboard/loan', icon: Wallet },
    { name: 'Compare Loans', path: '/dashboard/compare-loans', icon: Scale },
    { name: 'Credit Cards', path: '/dashboard/cards', icon: CreditCard },
    { name: 'EMI Calculator', path: '/dashboard/emi-calculator', icon: Calculator },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const displayName = user?.first_name || user?.username || 'User';

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-surface border-r border-border-subtle overflow-y-auto">
      {/* Header / Logo */}
      <div className="h-20 flex items-center justify-between px-4 lg:px-6 border-b border-border-subtle shrink-0">
        <Link to="/" className="flex items-center gap-2 group truncate cursor-pointer w-full justify-center lg:justify-start">
          <Logo showText={false} size="sm" className="hidden md:flex lg:hidden justify-center" />
          <Logo showText={true} size="sm" className="flex md:hidden lg:flex" />
        </Link>
        <button onClick={closeMobile} className="md:hidden text-text-secondary hover:text-forest dark:hover:text-white p-1.5 rounded-lg hover:bg-surface-subtle">
          <X size={20} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-6 px-3.5 space-y-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={clsx(
                "group flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all relative overflow-hidden",
                isActive 
                  ? "text-primary dark:text-[#A7F3D0] bg-emerald-50 dark:bg-emerald-950/40 border border-border-emerald dark:border-emerald-800/40 shadow-sm shadow-primary/5" 
                  : "text-text-secondary dark:text-slate-300 hover:bg-surface-subtle hover:text-forest dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.div layoutId="sidebar-active-bar" className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary dark:bg-[#34D399] rounded-r-full" />
              )}
              <Icon size={20} className={clsx("shrink-0", isActive ? "text-primary dark:text-[#34D399]" : "text-text-secondary dark:text-slate-400 group-hover:text-forest dark:group-hover:text-white")} />
              <span className="truncate md:hidden lg:block">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Theme Toggle, User & Logout */}
      <div className="p-4 border-t border-border-subtle shrink-0 space-y-2.5">
        {/* Theme Toggle */}
        <div className="hidden lg:block">
          <ThemeToggle variant="sidebar" />
        </div>
        <div className="lg:hidden flex justify-center py-1">
          <ThemeToggle variant="icon" />
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-border-subtle">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            {getInitials(displayName)}
          </div>
          <div className="flex-1 min-w-0 md:hidden lg:block">
            <p className="text-sm font-bold text-forest truncate">{displayName}</p>
            <p className="text-[11px] font-semibold text-text-secondary truncate">Verified Profile</p>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-text-secondary dark:text-slate-400 hover:text-danger dark:hover:text-red-400 hover:bg-danger/10 transition-colors cursor-pointer"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="md:hidden lg:block">Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg: 256px, md: 80px) */}
      <aside className="hidden md:block w-20 lg:w-64 shrink-0 transition-all duration-300">
        <div className="fixed top-0 bottom-0 w-20 lg:w-64 z-40">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed top-0 bottom-0 left-0 w-[280px] z-50 md:hidden shadow-2xl"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
