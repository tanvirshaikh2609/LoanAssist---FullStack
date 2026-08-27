import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ShieldCheck, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Logo from '../components/shared/Logo';
import ThemeToggle from '../components/shared/ThemeToggle';
import { validateEmail, normalizeEmail } from '../utils/validators';

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string()
    .min(1, 'Email address is required')
    .refine((val) => validateEmail(val).isValid, {
      message: 'Please enter a valid email address.'
    })
    .transform((val) => normalizeEmail(val)),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string()
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score += 1;
  if (password.match(/\d/)) score += 1;
  if (password.match(/[^a-zA-Z\d]/)) score += 1;
  return score;
};

const BrandedPanel = () => (
  <div className="hidden lg:flex flex-col justify-between w-full lg:w-[50%] bg-gradient-to-br from-[#0D2818] via-[#166534] to-[#15803D] p-14 lg:p-16 relative overflow-hidden border-r border-border-subtle/50 text-white">
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
        Join the future of intelligent finance.
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

const RegisterPage = () => {
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const passwordValue = watch("password", "");
  const strength = calculatePasswordStrength(passwordValue);

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-border-subtle';
    if (strength <= 1) return 'bg-danger';
    if (strength <= 2) return 'bg-amber-500';
    if (strength <= 3) return 'bg-emerald-500';
    return 'bg-primary';
  };
  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    return 'Strong';
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setGlobalError('');
    try {
      await registerUser(data);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 400 && typeof err.response.data === 'object') {
        const errorData = err.response.data;
        Object.keys(errorData).forEach((field) => {
          if (Array.isArray(errorData[field])) {
            setError(field, { type: 'server', message: errorData[field][0] });
          } else if (typeof errorData[field] === 'string') {
            setError(field, { type: 'server', message: errorData[field] });
          } else {
            setGlobalError('An error occurred during registration.');
          }
        });
      } else {
        setGlobalError(err.response?.data?.message || err.response?.data?.detail || 'Registration failed. Please try again.');
      }
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

      <div className="w-full max-w-[1240px] bg-surface rounded-[2.5rem] shadow-[0_12px_40px_rgba(15,41,30,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-border-subtle overflow-hidden flex flex-col lg:flex-row relative z-10 min-h-[820px]">
        <BrandedPanel />

        <div className="w-full lg:w-[50%] flex flex-col items-center justify-center p-8 sm:p-12 lg:p-14">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[440px]"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 flex justify-center">
              <Link to="/" className="cursor-pointer">
                <Logo showText={true} size="md" />
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-forest tracking-tight mb-2">Create an account</h2>
              <p className="text-text-secondary text-sm">Enter your details to start checking loan & card matches.</p>
            </div>
            
            <AnimatePresence>
              {globalError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-3.5 bg-danger/10 text-danger text-sm font-medium rounded-xl border border-danger/20">
                    <AlertCircle size={18} />
                    {globalError}
                  </div>
                </motion.div>
              )}
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-sm font-bold rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                    <CheckCircle2 size={18} className="text-primary dark:text-emerald-400" />
                    Account created successfully! Redirecting to dashboard...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-forest mb-1.5 uppercase tracking-wider">First Name</label>
                  <input
                    {...register('first_name')}
                    className={`w-full px-4 py-2.5 bg-surface-sub border ${errors.first_name ? 'border-danger focus:ring-danger/20' : 'border-border-subtle focus:ring-primary/20 focus:border-primary'} bg-surface-subtle rounded-xl focus:ring-4 outline-none transition-all text-sm text-forest`}
                    placeholder="John"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-xs font-semibold text-danger">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest mb-1.5 uppercase tracking-wider">Last Name</label>
                  <input
                    {...register('last_name')}
                    className={`w-full px-4 py-2.5 bg-surface-subtle border ${errors.last_name ? 'border-danger focus:ring-danger/20' : 'border-border-subtle focus:ring-primary/20 focus:border-primary'} rounded-xl focus:ring-4 outline-none transition-all text-sm text-forest`}
                    placeholder="Doe"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-xs font-semibold text-danger">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest mb-1.5 uppercase tracking-wider">Username</label>
                <input
                  {...register('username')}
                  className={`w-full px-4 py-2.5 bg-surface-subtle border ${errors.username ? 'border-danger focus:ring-danger/20' : 'border-border-subtle focus:ring-primary/20 focus:border-primary'} rounded-xl focus:ring-4 outline-none transition-all text-sm text-forest`}
                  placeholder="johndoe123"
                />
                {errors.username && (
                  <p className="mt-1 text-xs font-semibold text-danger">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-forest mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full px-4 py-2.5 bg-surface-subtle border ${errors.email ? 'border-danger focus:ring-danger/20' : 'border-border-subtle focus:ring-primary/20 focus:border-primary'} rounded-xl focus:ring-4 outline-none transition-all text-sm text-forest`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-semibold text-danger">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-forest mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className={`w-full px-4 py-2.5 bg-surface-subtle border ${errors.password ? 'border-danger focus:ring-danger/20' : 'border-border-subtle focus:ring-primary/20 focus:border-primary'} rounded-xl focus:ring-4 outline-none transition-all text-sm text-forest`}
                  placeholder="••••••••"
                />
                {/* Password Strength */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex h-1.5 gap-1 rounded-full overflow-hidden bg-surface-subtle">
                    <div className={`flex-1 ${strength >= 1 ? getStrengthColor() : 'bg-border-subtle'} transition-colors`} />
                    <div className={`flex-1 ${strength >= 2 ? getStrengthColor() : 'bg-border-subtle'} transition-colors`} />
                    <div className={`flex-1 ${strength >= 3 ? getStrengthColor() : 'bg-border-subtle'} transition-colors`} />
                    <div className={`flex-1 ${strength >= 4 ? getStrengthColor() : 'bg-border-subtle'} transition-colors`} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">
                    {getStrengthLabel()}
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs font-semibold text-danger">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-forest mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <input
                  {...register('password_confirm')}
                  type="password"
                  className={`w-full px-4 py-2.5 bg-surface-subtle border ${errors.password_confirm ? 'border-danger focus:ring-danger/20' : 'border-border-subtle focus:ring-primary/20 focus:border-primary'} rounded-xl focus:ring-4 outline-none transition-all text-sm text-forest`}
                  placeholder="••••••••"
                />
                {errors.password_confirm && (
                  <p className="mt-1 text-xs font-semibold text-danger">{errors.password_confirm.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || showSuccess}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-md shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all hover-lift disabled:opacity-70 mt-4 cursor-pointer"
              >
                {isSubmitting || showSuccess ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {showSuccess ? 'Redirecting...' : 'Creating account...'}
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-primary dark:text-emerald-400 hover:text-primary-dark transition-colors font-bold">
                Log in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
