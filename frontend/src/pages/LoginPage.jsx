import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Logo from '../components/shared/Logo';
import ThemeToggle from '../components/shared/ThemeToggle';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const BrandedPanel = () => (
  <div className="hidden lg:flex flex-col justify-between w-full lg:w-[55%] bg-gradient-to-br from-[#0D2818] via-[#166534] to-[#15803D] p-14 lg:p-16 relative overflow-hidden border-r border-border-subtle/50 text-white">
    {/* Ambient lighting */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
    
    <div className="relative z-10">
      <Link to="/" className="flex items-center gap-2.5 group w-fit cursor-pointer">
        <Logo showText={true} size="md" light={true} />
      </Link>
    </div>

    <div className="relative z-10 max-w-lg my-auto">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-8"
      >
        Smarter credit decisions start here.
      </motion.h2>
      
      <div className="space-y-4">
        {[
          { icon: ShieldCheck, text: "Bank-grade 256-bit security" },
          { icon: Zap, text: "Instant AI eligibility checks" },
          { icon: TrendingUp, text: "Actionable credit improvement insights" }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            className="flex items-center gap-4 text-emerald-50 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shadow-sm w-fit"
          >
            <div className="bg-white/15 p-2.5 rounded-xl text-amber-300">
              <item.icon size={20} />
            </div>
            <span className="font-semibold text-[15px]">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </div>

    <div className="relative z-10 text-xs font-medium text-emerald-100/60">
      © {new Date().getFullYear()} LoanAssist. Built for financial clarity.
    </div>
  </div>
);

const LoginPage = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8 relative overflow-hidden">
      {/* Floating Theme Toggle in top right */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle variant="icon" />
      </div>

      {/* Subtle Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[70%] -right-[10%] w-[40%] h-[50%] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-[1200px] bg-surface rounded-[2.5rem] shadow-[0_12px_40px_rgba(15,41,30,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-border-subtle overflow-hidden flex flex-col lg:flex-row relative z-10 min-h-[720px]">
        <BrandedPanel />

        <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[400px]"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden mb-10 flex justify-center">
              <Link to="/" className="cursor-pointer">
                <Logo showText={true} size="md" />
              </Link>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight mb-2">Welcome back</h2>
              <p className="text-text-secondary text-sm sm:text-base">Please enter your credentials to access your account.</p>
            </div>
            
            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4 bg-danger/10 text-danger text-sm font-medium rounded-2xl border border-danger/20">
                    <AlertCircle size={20} />
                    {errorMsg}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-bold text-forest mb-2">Username</label>
                <input
                  {...register('username')}
                  className={`w-full px-4 py-3 bg-surface-subtle border ${errors.username ? 'border-danger focus:ring-danger/20' : 'border-border-subtle focus:ring-primary/20 focus:border-primary'} rounded-xl focus:ring-4 outline-none transition-all text-sm font-medium text-forest`}
                  placeholder="Enter your username"
                />
                <AnimatePresence>
                  {errors.username && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-1.5 text-xs font-semibold text-danger"
                    >
                      {errors.username.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-sm font-bold text-forest mb-2">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className={`w-full px-4 py-3 bg-surface-subtle border ${errors.password ? 'border-danger focus:ring-danger/20' : 'border-border-subtle focus:ring-primary/20 focus:border-primary'} rounded-xl focus:ring-4 outline-none transition-all text-sm font-medium text-forest`}
                  placeholder="••••••••"
                />
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-1.5 text-xs font-semibold text-danger"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-md shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all hover-lift disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-none mt-4 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary dark:text-emerald-400 hover:text-primary-dark transition-colors font-bold">
                Register
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
