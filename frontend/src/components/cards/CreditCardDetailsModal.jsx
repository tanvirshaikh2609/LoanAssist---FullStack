import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard as CardIcon, IndianRupee, Briefcase, TrendingUp, Sparkles, Star } from 'lucide-react';
import { getCardImage } from '../../utils/cardImages';

const CreditCardDetailsModal = ({ card, isOpen, onClose }) => {
  if (!isOpen || !card) return null;

  const minIncome = card.minimum_income || card.min_income || card.monthly_income_requirement;
  const minCreditScore = card.minimum_credit_score || card.credit_score_requirement || card.min_credit_score;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface rounded-3xl shadow-2xl border border-border-subtle z-10"
        >
          {/* Header Area */}
          <div className="relative p-8 pb-10 bg-gradient-to-br from-[#0D2818] via-[#166534] to-[#0D2818] text-white overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent pointer-events-none"></div>
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md z-10 text-white cursor-pointer"
            >
              <X size={22} />
            </button>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start mt-2">
              {/* Card Image */}
              <div className="w-64 h-40 rounded-2xl bg-white/10 border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden shrink-0 backdrop-blur-sm p-2">
                {getCardImage(card.card_name) ? (
                  <img src={getCardImage(card.card_name)} alt={card.card_name} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-white/60 flex flex-col items-center">
                    <CardIcon size={48} className="mb-2" />
                    <span className="text-xs uppercase tracking-widest font-bold">{card.bank_name}</span>
                  </div>
                )}
              </div>

              {/* Title & Badges */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                    {card.category}
                  </span>
                  {card.recommendation_score && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-[#0D2818] backdrop-blur-md flex items-center gap-1">
                      <Sparkles size={12} /> {card.recommendation_score}% Match
                    </span>
                  )}
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-1 text-white">{card.card_name}</h2>
                <p className="text-base text-emerald-100 font-semibold">{card.bank_name}</p>
              </div>
            </div>
          </div>

          {/* Body Area */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Fees & Savings */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-surface-subtle dark:bg-[#071d11] p-6 rounded-2xl border border-border-subtle dark:border-emerald-800/70 shadow-xs">
                  <h3 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-4">Fees & Charges</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-emerald-200/80 font-semibold mb-0.5">Annual Fee</div>
                      <div className="text-xl font-black text-forest dark:text-white">
                        {Number(card.annual_fee) === 0 ? <span className="text-emerald-600 dark:text-[#6EE7B7]">Lifetime Free</span> : `₹${Number(card.annual_fee).toLocaleString('en-IN')}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-emerald-200/80 font-semibold mb-0.5">Joining Fee</div>
                      <div className="text-lg font-black text-forest dark:text-white">
                        {Number(card.joining_fee) === 0 ? 'Free' : `₹${Number(card.joining_fee).toLocaleString('en-IN')}`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/95 dark:bg-[#082918] p-6 rounded-2xl border border-emerald-300 dark:border-emerald-600/70 shadow-sm">
                  <h3 className="text-xs font-black text-forest dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-600 dark:text-[#34D399]" /> Est. Yearly Savings
                  </h3>
                  <div className="text-3xl font-black text-emerald-800 dark:text-[#A7F3D0]">
                    {card.estimated_savings ? `₹${Number(card.estimated_savings).toLocaleString('en-IN')}` : '₹10,000+'}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-emerald-200 font-medium mt-2">Calculated based on your financial tier.</p>
                </div>
              </div>

              {/* Right Column: Features & Eligibility */}
              <div className="md:col-span-2 space-y-7">
                
                {/* AI Reasons */}
                {card.ai_reasons && card.ai_reasons.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-forest dark:text-white mb-3 flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-500 dark:text-amber-400" /> AI Recommendation Insights
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {card.ai_reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-emerald-50/90 dark:bg-[#071d11] p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70">
                          <Check size={16} className="text-emerald-600 dark:text-[#34D399] shrink-0 mt-0.5" />
                          <span className="text-xs font-bold text-forest dark:text-emerald-100 leading-snug">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eligibility */}
                <div>
                  <h3 className="text-lg font-bold text-forest dark:text-white mb-3">Eligibility Benchmarks</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    <div className="bg-surface-subtle dark:bg-[#071d11] p-4 rounded-2xl border border-border-subtle dark:border-emerald-800/70 shrink-0 min-w-[160px]">
                      <div className="text-[10px] text-slate-500 dark:text-emerald-300 font-bold uppercase tracking-wider mb-1">Min. Annual Income</div>
                      <div className="text-lg font-black text-forest dark:text-white">
                        {minIncome ? `₹${Number(minIncome).toLocaleString('en-IN')}` : 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-emerald-200/70 mt-0.5">per annum</div>
                    </div>
                    <div className="bg-surface-subtle dark:bg-[#071d11] p-4 rounded-2xl border border-border-subtle dark:border-emerald-800/70 shrink-0 min-w-[160px]">
                      <div className="text-[10px] text-slate-500 dark:text-emerald-300 font-bold uppercase tracking-wider mb-1">Min. Credit Score</div>
                      <div className="text-lg font-black text-forest dark:text-white">
                        {minCreditScore ? minCreditScore : 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-emerald-200/70 mt-0.5">CIBIL / Experian</div>
                    </div>
                  </div>
                </div>

                {/* Features list */}
                {card.benefits && Array.isArray(card.benefits) && card.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-forest dark:text-white mb-3">Key Privileges & Benefits</h3>
                    <ul className="space-y-2.5">
                      {card.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Star size={16} className="text-amber-500 shrink-0 mt-0.5 fill-amber-400" />
                          <span className="text-xs sm:text-sm text-slate-700 dark:text-emerald-100 font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreditCardDetailsModal;
