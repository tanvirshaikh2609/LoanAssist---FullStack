import { motion } from 'framer-motion';
import { CreditCard as CardIcon, IndianRupee, Gift, Check, Star, Sparkles, TrendingUp, Info, Scale } from 'lucide-react';
import { getCardImage } from '../../utils/cardImages';

const categoryColors = {
  'travel': 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40',
  'cashback': 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40',
  'rewards': 'bg-emerald-100 dark:bg-emerald-950/70 text-primary dark:text-emerald-300 border border-border-emerald',
  'student': 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40',
  'business': 'bg-surface-subtle text-forest border border-border-subtle',
  'premium': 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/40',
  'default': 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
};

const CreditCardCard = ({ card, rank, onViewDetails, onCompare, isCompareDisabled }) => {
  const categoryStr = card.category?.toLowerCase() || 'default';
  const badgeStyle = categoryColors[categoryStr] || categoryColors.default;

  const image = getCardImage(card.card_name);

  return (
    <motion.div 
      className="relative bg-surface rounded-3xl border border-border-subtle hover:border-border-emerald shadow-sm hover:shadow-xl hover:shadow-emerald-950/10 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col group"
    >
      {/* Image Header */}
      <div className="h-[175px] w-full relative bg-[#07170E] flex items-center justify-center overflow-hidden">
        {image ? (
          <>
            <img
              src={image}
              alt={card.card_name}
              className="max-w-[90%] max-h-[88%] object-contain object-center z-10 relative transition-transform duration-300 group-hover:scale-105"
            />
            <div 
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(7,23,14,0.75), rgba(7,23,14,0.1))' }}
            ></div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0D2818] via-[#166534] to-[#0D2818] relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
             <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
             <CardIcon size={48} className="absolute bottom-4 right-4 text-white/10" />
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          {rank === 1 ? (
            <span className="bg-amber-400 text-[#0D2818] text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Star size={12} className="fill-[#0D2818]" /> TOP PICK
            </span>
          ) : (
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#0D2818]/90 text-emerald-200 border border-emerald-700/60 backdrop-blur-md">
              {card.category || 'Featured'}
            </span>
          )}
          
          <div className="flex items-center gap-1 bg-[#0D2818]/90 backdrop-blur-md px-3 py-1 rounded-full shadow-xs border border-emerald-700/60">
            <span className="font-black text-emerald-200 text-xs">
              {card.recommendation_score !== undefined && card.recommendation_score !== null 
                ? `✨ ${card.recommendation_score}% Match`
                : '⭐ Verified Card'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 pb-5 flex-1 flex flex-col bg-gradient-to-b from-surface to-surface-subtle/40">
        
        {/* Title and Category Chips */}
        <div className="mt-4 flex flex-col">
          <div className="text-[11px] tracking-[0.18em] uppercase font-black text-emerald-800 dark:text-emerald-300">
            {card.bank_name || 'Partner Bank'}
          </div>
          <div className="text-xl font-black leading-snug tracking-tight text-forest dark:text-white mt-1">
            {card.card_name || 'Credit Card'}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${badgeStyle}`}>
            {card.category || 'Rewards'}
          </span>
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100/90 dark:bg-[#0c2e1b] text-emerald-950 dark:text-[#6EE7B7] border border-emerald-300 dark:border-emerald-700/70 shadow-2xs">
            Best For: {card.best_for || card.category || 'All Spends'}
          </span>
        </div>
        
        {/* Key Features */}
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="space-y-2.5 bg-surface-subtle/80 dark:bg-[#071d11] p-3.5 rounded-2xl border border-border-subtle dark:border-emerald-800/60 shadow-xs">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-600 dark:text-emerald-200/80 flex items-center gap-1.5 font-semibold">
                <IndianRupee size={14} className="text-emerald-600 dark:text-[#34D399]" /> Annual Fee
              </span>
              <span className="font-black text-forest dark:text-white">
                {Number(card.annual_fee) === 0 ? (
                  <span className="text-emerald-700 dark:text-[#6EE7B7] font-black">Lifetime Free</span>
                ) : (
                  `₹${Number(card.annual_fee).toLocaleString('en-IN')}`
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-600 dark:text-emerald-200/80 flex items-center gap-1.5 font-semibold">
                <Gift size={14} className="text-emerald-600 dark:text-[#34D399]" /> Reward Type
              </span>
              <span className="font-bold text-forest dark:text-emerald-100 truncate max-w-[130px] text-right" title={card.reward_type}>
                {card.reward_type || 'Cashback'}
              </span>
            </div>
          </div>
          
          <div className="bg-emerald-50/95 dark:bg-[#082918] border border-emerald-300/80 dark:border-emerald-600/70 p-3.5 rounded-2xl flex items-center justify-between shadow-xs transition-all">
            <span className="text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5 text-xs sm:text-sm font-extrabold">
              <TrendingUp size={16} className="text-emerald-700 dark:text-[#34D399]" /> Est. Savings
            </span>
            <span className="text-emerald-800 dark:text-[#A7F3D0] font-black text-sm sm:text-base">
              {card.estimated_savings ? (
                `₹${Number(card.estimated_savings).toLocaleString('en-IN')}/yr`
              ) : Number(card.annual_fee) === 0 ? (
                `₹0 Joining Fee`
              ) : (
                `₹8,000+ Value`
              )}
            </span>
          </div>
        </div>

        {/* AI Recommendation Reason */}
        {card.ai_reasons && card.ai_reasons.length > 0 && (
          <div className="bg-surface-subtle/80 dark:bg-[#071d11] border border-border-subtle dark:border-emerald-800/60 rounded-2xl p-4 mt-3">
            <h4 className="text-xs font-extrabold text-forest dark:text-white mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-500 dark:text-amber-400" /> Why AI Recommended This
            </h4>
            <ul className="space-y-1.5">
              {card.ai_reasons.slice(0, 2).map((reason, idx) => (
                <li key={idx} className="text-xs text-slate-700 dark:text-emerald-100 flex items-start gap-2 font-semibold leading-relaxed">
                  <Check size={15} className="text-emerald-600 dark:text-[#34D399] shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-4 grid grid-cols-2 gap-2.5">
          <button 
            onClick={(e) => { e.preventDefault(); onCompare?.(card); }}
            disabled={isCompareDisabled}
            className={`flex items-center justify-center gap-1.5 h-11 rounded-full border text-xs font-extrabold transition-all cursor-pointer ${
              isCompareDisabled 
                ? 'bg-surface-subtle border-border-subtle text-text-secondary/50 cursor-not-allowed'
                : 'bg-surface-subtle dark:bg-[#071d11] border-border-subtle dark:border-emerald-700/60 hover:border-border-emerald text-forest dark:text-emerald-100 hover:text-primary dark:hover:text-[#6EE7B7] shadow-xs'
            }`}
          >
            <Scale size={14} /> {isCompareDisabled ? 'Max 3 Cards' : 'Compare'}
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); onViewDetails?.(card); }}
            className="flex items-center justify-center gap-1.5 h-11 rounded-full bg-primary hover:bg-primary-dark shadow-md shadow-primary/20 text-white text-xs font-black transition-all hover-lift cursor-pointer"
          >
            <Info size={14} /> Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CreditCardCard;
