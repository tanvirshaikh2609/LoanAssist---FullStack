import { motion } from 'framer-motion';
import { Building2, Percent, IndianRupee } from 'lucide-react';
import { useEffect } from 'react';

const BankCard = ({ bank, rank }) => {
  useEffect(() => {
    if (!bank.bank_name) {
      console.warn("BankCard: 'bank_name' field is missing or null in the bank object. Check backend API response.", bank);
    }
  }, [bank]);

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 12px 24px -6px rgba(13, 40, 24, 0.12)" }}
      className={`relative bg-surface rounded-3xl p-6 border transition-all ${
        rank === 1 
          ? 'border-border-emerald bg-gradient-to-br from-emerald-50/40 dark:from-emerald-950/30 to-surface shadow-md' 
          : 'border-border-subtle shadow-xs'
      }`}
    >
      <div className={`absolute -top-3 -right-2 px-3 py-0.5 rounded-full flex items-center justify-center font-extrabold text-xs shadow-xs ${
        rank === 1 
          ? 'bg-amber-400 text-[#0D2818] border border-amber-300 font-black' 
          : 'bg-surface-subtle text-text-secondary border border-border-subtle'
      }`}>
        {rank === 1 ? '⭐ #1 Match' : `#${rank}`}
      </div>
      
      <div className="flex items-center gap-3.5 mb-5 border-b border-border-subtle pb-4">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-border-emerald flex items-center justify-center text-primary dark:text-emerald-400 shrink-0">
          <Building2 size={22} />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Lending Partner</span>
          <h4 className="font-extrabold text-forest text-base leading-tight">{bank.bank_name || 'Partner Bank'}</h4>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-text-secondary flex items-center gap-1.5 font-medium"><Percent size={14} className="text-primary dark:text-emerald-400" /> Interest Rate</span>
          <span className="font-extrabold text-forest">{bank.interest_rate || '8.5'}% p.a.</span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-text-secondary flex items-center gap-1.5 font-medium"><IndianRupee size={14} className="text-primary dark:text-emerald-400" /> Proc. Fee</span>
          <span className="font-extrabold text-forest">₹{bank.processing_fee || '10,000'}</span>
        </div>
      </div>

      {bank.reason && (
        <div className="mt-4 pt-3.5 border-t border-border-subtle">
          <p className="text-xs text-text-secondary bg-surface-subtle p-3 rounded-xl border border-border-subtle leading-relaxed font-medium">
            <span className="font-bold text-forest">AI Insight:</span> {bank.reason}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default BankCard;
