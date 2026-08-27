import { Calendar, Percent, IndianRupee } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const EMICard = ({ emiDetails }) => {
  if (!emiDetails) return null;

  return (
    <div className="bg-surface rounded-3xl p-6 border border-border-subtle shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-border-emerald flex items-center justify-center text-primary dark:text-emerald-400">
            <Calendar size={16} />
          </div>
          <h4 className="font-bold text-forest text-xs uppercase tracking-wider">Monthly Installment</h4>
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-xl font-black text-forest">₹</span>
          <AnimatedCounter value={emiDetails.monthly_emi || 0} duration={1.2} className="text-2xl font-black text-forest" />
        </div>
      </div>

      <div className="hidden md:block w-px h-12 bg-border-subtle"></div>

      <div className="flex-1">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Percent size={16} />
          </div>
          <h4 className="font-bold text-forest text-xs uppercase tracking-wider">Total Interest</h4>
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-xl font-black text-amber-600 dark:text-amber-400">₹</span>
          <AnimatedCounter value={emiDetails.total_interest || 0} duration={1.2} className="text-2xl font-black text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      <div className="hidden md:block w-px h-12 bg-border-subtle"></div>

      <div className="flex-1">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800/50 flex items-center justify-center text-primary dark:text-emerald-400">
            <IndianRupee size={16} />
          </div>
          <h4 className="font-bold text-forest text-xs uppercase tracking-wider">Total Repayment</h4>
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-xl font-black text-forest">₹</span>
          <AnimatedCounter value={emiDetails.total_payment || 0} duration={1.2} className="text-2xl font-black text-forest" />
        </div>
      </div>
    </div>
  );
};

export default EMICard;
