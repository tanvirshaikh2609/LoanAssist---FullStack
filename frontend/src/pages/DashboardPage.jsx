import { useMemo, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { useApplicationHistory } from '../store/historyStore';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { 
  FileText, CreditCard, Activity, TrendingUp, CheckCircle2, 
  XCircle, Clock, ArrowRight, Scale, Calculator, Sparkles,
  Wallet, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const fadeInStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const StatCard = ({ icon: Icon, label, value, subtext, badge }) => (
  <motion.div variants={fadeUpVariant} className="bg-surface p-6 rounded-3xl border border-border-subtle hover:border-border-emerald shadow-sm hover-lift flex flex-col h-full transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-2xl bg-surface-subtle flex items-center justify-center text-primary dark:text-emerald-400 border border-border-emerald shadow-xs">
        <Icon size={20} />
      </div>
      {badge && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.colorClass}`}>
          {badge.text}
        </span>
      )}
    </div>
    <div className="mt-auto">
      <div className="text-3xl font-black text-forest mb-1 tracking-tight">
        {typeof value === 'number' ? <AnimatedCounter value={value} duration={1} /> : value}
      </div>
      <div className="text-sm font-bold text-text-secondary">{label}</div>
      {subtext && <div className="text-xs text-text-secondary/80 mt-1 font-medium">{subtext}</div>}
    </div>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, tag, title, description, to, ctaText, highlighted = false }) => (
  <motion.div
    variants={fadeUpVariant}
    className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between group shadow-sm hover-lift relative overflow-hidden ${
      highlighted
        ? 'bg-gradient-to-br from-emerald-50 via-surface to-surface dark:from-emerald-950/40 dark:via-surface dark:to-surface border-border-emerald ring-1 ring-primary/20 dark:ring-emerald-400/20'
        : 'bg-surface border-border-subtle hover:border-border-emerald'
    }`}
  >
    {highlighted && (
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
    )}
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
          highlighted
            ? 'bg-primary dark:bg-emerald-600 text-white shadow-md shadow-primary/25'
            : 'bg-emerald-50 dark:bg-emerald-950/60 border border-border-emerald text-primary dark:text-emerald-300'
        }`}>
          <Icon size={22} />
        </div>
        {tag && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-subtle border border-border-subtle text-text-secondary">
            {tag}
          </span>
        )}
      </div>

      <h3 className="text-lg font-black text-forest mb-2 group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium mb-6">
        {description}
      </p>
    </div>

    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black px-5 py-2.5 rounded-full transition-all w-fit cursor-pointer ${
        highlighted
          ? 'bg-primary hover:bg-primary-dark text-white shadow-sm shadow-primary/20'
          : 'bg-surface-subtle hover:bg-surface border border-border-subtle text-forest hover:text-primary dark:hover:text-emerald-400'
      }`}
    >
      {ctaText}
      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
    </Link>
  </motion.div>
);

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { history, fetchHistory, isLoading } = useApplicationHistory();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const displayName = user?.first_name || user?.username || 'User';
  
  const currentDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }).format(new Date());

  const loanApps = history.filter(h => h.type === 'loan').length;
  const cardApps = history.filter(h => h.type === 'card').length;
  
  const approvedCount = history.filter(h => h.result === 'Approved').length;
  const rejectedCount = history.filter(h => h.result === 'Rejected').length;
  const pendingCount = history.filter(h => h.result === 'Pending').length;

  const latestScore = history.length > 0 ? (history[0].score || 0) : 0;
  
  const getScoreBadge = (score) => {
    if (score >= 80) return { text: 'Excellent', colorClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' };
    if (score >= 60) return { text: 'Good', colorClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' };
    if (score >= 40) return { text: 'Fair', colorClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' };
    return { text: 'Poor', colorClass: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300' };
  };

  const chartData = [
    { name: 'Approved', value: approvedCount, color: isDark ? '#22C55E' : '#166534' },
    { name: 'Rejected', value: rejectedCount, color: '#EF4444' },
    { name: 'Pending', value: pendingCount, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-forest tracking-tight">Welcome back, {displayName} 👋</h1>
          <p className="text-text-secondary mt-1 text-sm">{currentDate} — Here's your credit & intelligence overview.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link 
            to="/dashboard/loan" 
            className="px-4 sm:px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-sm shadow-primary/20 transition-all hover-lift flex items-center gap-1.5 cursor-pointer"
          >
            Check Loan <ArrowRight size={14} />
          </Link>
          <Link 
            to="/dashboard/compare-loans" 
            className="px-4 sm:px-5 py-2.5 rounded-full bg-surface border border-border-subtle hover:border-border-emerald text-forest hover:text-primary dark:hover:text-emerald-400 font-bold text-xs sm:text-sm shadow-sm transition-all hover-lift flex items-center gap-1.5 cursor-pointer"
          >
            <Scale size={14} /> Compare Loans
          </Link>
          <Link 
            to="/dashboard/cards" 
            className="px-4 sm:px-5 py-2.5 rounded-full bg-surface border border-border-subtle text-forest hover:text-primary dark:hover:text-emerald-400 hover:border-border-emerald font-bold text-xs sm:text-sm shadow-sm transition-all hover-lift cursor-pointer"
          >
            Find Cards
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={fadeInStagger}
        initial="hidden"
        animate="show"
      >
        <StatCard 
          icon={FileText} 
          label="Loan Applications" 
          value={loanApps} 
          subtext="Total evaluations"
        />
        <StatCard 
          icon={CreditCard} 
          label="Card Applications" 
          value={cardApps} 
          subtext="Total evaluations"
        />
        <StatCard 
          icon={Activity} 
          label="Latest Health Score" 
          value={history.length > 0 ? latestScore : '-'} 
          badge={history.length > 0 ? getScoreBadge(latestScore) : null}
          subtext="Based on last application"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Overall Approvals" 
          value={`${approvedCount}`} 
          subtext={`${approvedCount} Approved / ${rejectedCount} Rejected`}
          badge={{ text: 'Live Status', colorClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' }}
        />
      </motion.div>

      {/* 🌟 Features Section (Including Compare Loans) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-primary dark:text-emerald-400">
              LoanAssist Suite
            </span>
            <h2 className="text-2xl font-black text-forest tracking-tight">Features & Financial Tools</h2>
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={fadeInStagger}
          initial="hidden"
          animate="show"
        >
          {/* 1. Loan Eligibility */}
          <FeatureCard
            icon={Wallet}
            tag="AI Underwriting"
            title="Loan Eligibility Checker"
            description="Check if you qualify for home loans with instant approval probabilities and matched partner banks."
            to="/dashboard/loan"
            ctaText="Check Eligibility"
          />

          {/* 2. Compare Loans (New Dedicated Feature) */}
          <FeatureCard
            icon={Scale}
            tag="Smart Choice"
            title="Compare Loans"
            description="Compare multiple loan options, understand their EMI and total repayment, and find the option that best fits your financial situation."
            to="/dashboard/compare-loans"
            ctaText="Compare Loans"
            highlighted={true}
          />

          {/* 3. Credit Cards */}
          <FeatureCard
            icon={CreditCard}
            tag="Cashback & Perks"
            title="Credit Card Matchmaker"
            description="Discover tier-ranked cards matching your spending habits, annual fee criteria, and milestone benefits."
            to="/dashboard/cards"
            ctaText="Find Cards"
          />

          {/* 4. EMI Calculator */}
          <FeatureCard
            icon={Calculator}
            tag="Amortization"
            title="EMI Calculator"
            description="Simulate monthly installments, interest vs principal breakdown, and explore prepayment savings."
            to="/dashboard/emi-calculator"
            ctaText="Calculate EMI"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <motion.div variants={fadeUpVariant} initial="hidden" animate="show" className="lg:col-span-1 bg-surface p-7 rounded-3xl border border-border-subtle shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-forest mb-4">Approval Ratio</h2>
          
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '14px', 
                      background: isDark ? '#121E17' : '#FFFFFF',
                      border: isDark ? '1px solid #234934' : '1px solid #D4E2D8', 
                      boxShadow: '0 8px 16px -2px rgba(0,0,0,0.2)',
                      color: isDark ? '#F1F5F2' : '#0F291E'
                    }}
                    itemStyle={{ fontWeight: 700, color: isDark ? '#F1F5F2' : '#0F291E' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(val) => <span className="text-xs font-semibold text-text-secondary">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-surface-subtle rounded-2xl flex items-center justify-center mx-auto mb-3 border border-border-subtle text-primary dark:text-emerald-400">
                  <Activity size={24} />
                </div>
                <p className="text-sm font-bold text-forest mb-1">No evaluations yet</p>
                <p className="text-xs text-text-secondary mb-4 max-w-[200px] mx-auto">Check your eligibility to generate real-time metrics.</p>
                <Link to="/dashboard/loan" className="text-xs font-bold text-primary dark:text-emerald-400 hover:text-primary-dark inline-flex items-center gap-1">
                  Start an evaluation &rarr;
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeUpVariant} initial="hidden" animate="show" className="lg:col-span-2 bg-surface p-7 rounded-3xl border border-border-subtle shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-forest">Recent Activity</h2>
            {history.length > 0 && (
              <span className="text-xs font-bold text-text-secondary bg-surface-subtle px-3 py-1 rounded-full border border-border-subtle">
                Showing last 5
              </span>
            )}
          </div>

          <div className="flex-1">
            {history.length > 0 ? (
              <div className="space-y-3.5">
                {history.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl border border-border-subtle hover:border-border-emerald bg-surface-subtle/40 hover:bg-surface-subtle transition-all cursor-default group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface border border-border-emerald flex items-center justify-center text-primary dark:text-emerald-400 group-hover:scale-105 transition-transform shadow-xs">
                        {app.type === 'loan' ? <FileText size={18} /> : <CreditCard size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-forest">
                          {app.type === 'loan' ? 'Loan Eligibility Check' : 'Credit Card Match'}
                        </p>
                        <p className="text-xs text-text-secondary font-medium">
                          {new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        {app.result === 'Approved' && <CheckCircle2 size={14} className="text-emerald-500" />}
                        {app.result === 'Rejected' && <XCircle size={14} className="text-red-500" />}
                        {app.result === 'Pending' && <Clock size={14} className="text-amber-500" />}
                        <span className={`text-xs font-bold ${
                          app.result === 'Approved' ? 'text-emerald-600 dark:text-emerald-400' :
                          app.result === 'Rejected' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {app.result}
                        </span>
                      </div>
                      {app.confidence && (
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                          {app.confidence}% Confidence
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 bg-surface-subtle rounded-2xl flex items-center justify-center mx-auto mb-3 border border-border-subtle text-text-secondary">
                  <Clock size={24} />
                </div>
                <p className="text-sm font-bold text-forest mb-1">No recent activity</p>
                <p className="text-xs text-text-secondary mb-4 max-w-[250px] mx-auto">Your recent eligibility checks and card matches will appear here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
