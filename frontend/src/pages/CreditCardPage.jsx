import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { predictCard } from '../api/cards';
import { useApplicationHistory } from '../store/historyStore';
import CreditCardCard from '../components/shared/CreditCardCard';
import FinancialHealthGauge from '../components/shared/FinancialHealthGauge';
import { ReasonCard, SuggestionCard } from '../components/shared/ReasonCard';
import { formatConfidence } from '../utils/formatters';
import CompareCardsPanel from '../components/cards/CompareCardsPanel';
import ExploreAllCards from '../components/cards/ExploreAllCards';
import CreditCardDetailsModal from '../components/cards/CreditCardDetailsModal';

const cardSchema = z.object({
  age: z.number({ invalid_type_error: "Please enter your age" }).min(18, "Must be at least 18").max(100),
  annual_income: z.number({ invalid_type_error: "Please enter your annual income" }).min(0, "Cannot be negative"),
  credit_score: z.number({ invalid_type_error: "Please enter your credit score" }).min(300, "Typically between 300-900").max(900, "Typically between 300-900"),
  employment_status: z.enum(['employed', 'self_employed', 'unemployed', 'student', 'retired']),
  existing_credit_cards: z.number({ invalid_type_error: "Please enter number of existing cards" }).min(0).max(50),
  total_debt: z.number({ invalid_type_error: "Please enter total outstanding debt" }).min(0),
  monthly_housing_payment: z.number({ invalid_type_error: "Please enter monthly housing payment" }).min(0),
  bank_balance: z.number({ invalid_type_error: "Please enter your bank balance" }).min(0),
  selected_credit_card: z.string().optional().nullable(),
});

const ResultSection = ({ result, onReset, onViewDetails, onCompare, isCompareDisabled }) => {
  if (!result) return null;

  const isApproved = result.prediction === 'Approved';
  const confidencePercent = formatConfidence(result.confidence_score);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12"
    >
      <div className={`p-8 md:p-12 rounded-[2.5rem] border shadow-lg relative overflow-hidden ${
        isApproved 
          ? 'bg-gradient-to-br from-emerald-50 via-emerald-50/60 dark:from-[#092215] dark:via-[#0c2b1b] to-surface border-border-emerald shadow-emerald-950/5' 
          : 'bg-gradient-to-br from-red-50 via-red-50/60 dark:from-[#260e0e] dark:via-[#1f0b0b] to-surface border-red-200 dark:border-red-900/40 shadow-red-950/5'
      }`}>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.4, delay: 0.15 }}
            className={`w-24 h-24 rounded-3xl flex items-center justify-center shrink-0 shadow-md ${
              isApproved ? 'bg-primary text-white shadow-primary/25' : 'bg-red-600 text-white shadow-red-600/25'
            }`}
          >
            {isApproved ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-surface/90 dark:bg-[#07190f] border border-border-subtle dark:border-emerald-700/60 text-forest dark:text-emerald-300">
              <Sparkles size={13} className={isApproved ? "text-primary dark:text-emerald-400" : "text-red-500"} />
              Match Result
            </div>
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight mb-2 ${
              isApproved ? 'text-forest dark:text-white' : 'text-red-600 dark:text-red-400'
            }`}>
              {isApproved ? 'Approved for Curated Cards' : 'Not Eligible for Current Filters'}
            </h2>
            <p className="text-base text-slate-700 dark:text-emerald-100 font-medium max-w-xl leading-relaxed">
              {isApproved 
                ? 'Your profile successfully qualifies for prime cashback, reward, and travel card offers.'
                : 'Your profile does not currently satisfy the qualification benchmarks for these card categories.'
              }
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 px-8 py-5 rounded-2xl bg-surface/95 dark:bg-[#07170E] backdrop-blur-md border border-border-subtle dark:border-emerald-700/70 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-emerald-300/90 mb-1">AI Confidence</span>
            <span className={`text-4xl font-black ${
              isApproved ? 'text-primary dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {confidencePercent}%
            </span>
          </div>
        </div>

        {!isApproved && (
          <div className="mt-8 flex justify-center md:justify-start">
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0D2818] hover:bg-[#163e27] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold transition-all shadow-md hover-lift cursor-pointer"
            >
              <RotateCcw size={18} />
              Adjust Profile & Try Again
            </button>
          </div>
        )}
      </div>

      {!isApproved && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {result.rejection_reasons?.length > 0 && (
            <div className="bg-surface p-7 rounded-3xl border border-border-subtle shadow-sm">
              <h3 className="text-lg font-bold text-forest mb-4">Key Observations</h3>
              <div className="space-y-3">
                {result.rejection_reasons.map((r, i) => <ReasonCard key={i} reason={r} />)}
              </div>
            </div>
          )}
          {result.improvement_suggestions?.length > 0 && (
            <div className="bg-surface p-7 rounded-3xl border border-border-subtle shadow-sm">
              <h3 className="text-lg font-bold text-forest mb-4">Recommendations to Qualify</h3>
              <div className="space-y-3">
                {result.improvement_suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {isApproved && result.recommended_cards?.length > 0 && (
        <div className="mt-12">
          <div className="mb-8 p-6 sm:p-7 rounded-3xl border shadow-sm transition-all bg-emerald-50/90 dark:bg-[#092215] border-emerald-200/90 dark:border-emerald-700/60 shadow-emerald-950/5 dark:shadow-emerald-950/30">
            <h3 className="text-xl font-extrabold text-forest dark:text-white mb-2 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500 dark:text-amber-400" />
              Recommendation Summary
            </h3>
            <p className="text-sm sm:text-base text-slate-700 dark:text-emerald-100 font-medium leading-relaxed">
              Out of <span className="font-bold text-forest dark:text-emerald-300">{result.total_available_cards || 19} analyzed cards</span>,{' '}
              <span className="font-extrabold text-primary dark:text-[#A7F3D0] underline decoration-emerald-500/40 underline-offset-4">
                {result.total_eligible_cards || result.recommended_cards.length} cards matched
              </span>{' '}
              your credit tier and spending habits. The top recommendations are presented below.
            </p>
          </div>
          
          <h3 className="text-2xl font-bold text-forest mb-6 flex items-center gap-2.5">
            Top Matched Cards
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald">
              {result.recommended_cards.length} Premium Picks
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.recommended_cards.map((card, index) => (
              <CreditCardCard 
                key={index} 
                card={card} 
                rank={index + 1} 
                onViewDetails={onViewDetails}
                onCompare={onCompare}
                isCompareDisabled={isCompareDisabled}
              />
            ))}
          </div>
        </div>
      )}

      {result.financial_health && (
        <FinancialHealthGauge health={result.financial_health} />
      )}
    </motion.div>
  );
};

const CreditCardPage = () => {
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  const [selectedCardForDetails, setSelectedCardForDetails] = useState(null);
  const [compareCards, setCompareCards] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  
  const resultRef = useRef(null);
  const formRef = useRef(null);
  const { addApplication } = useApplicationHistory();

  const { register, handleSubmit, watch, formState: { errors }, setError, setValue } = useForm({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      age: 25,
      annual_income: 600000,
      credit_score: 750,
      employment_status: 'employed',
      existing_credit_cards: 0,
      total_debt: 0,
      monthly_housing_payment: 10000,
      bank_balance: 50000,
      selected_credit_card: ''
    }
  });

  const handleZeroFocus = (e) => {
    if (e.target.value === '0') e.target.value = '';
  };

  const handleZeroBlur = (e, fieldName) => {
    if (e.target.value === '') {
      setValue(fieldName, 0, { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setGlobalError('');
    setResult(null);
    
    try {
      const payload = { ...data };
      if (!payload.selected_credit_card) {
        payload.selected_credit_card = null;
      }
      
      const response = await predictCard(payload);
      setResult(response);
      
      addApplication({
        type: 'card',
        result: response.prediction,
        score: response.financial_health?.score,
        confidence: response.confidence_score
      });

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      if (err.response?.status === 400 && typeof err.response.data === 'object') {
        const errorData = err.response.data;
        Object.keys(errorData).forEach((field) => {
          if (Array.isArray(errorData[field])) {
            setError(field, { type: 'server', message: errorData[field][0] });
          }
        });
        setGlobalError('Please fix the errors in the form.');
      } else {
        setGlobalError('We couldn\'t process your application — please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleViewDetails = (card) => {
    setSelectedCardForDetails(card);
  };

  const handleCompare = (card) => {
    setCompareCards(prev => {
      if (prev.find(c => c.card_id === card.card_id)) return prev;
      const newCards = [...prev, card];
      if (newCards.length > 3) newCards.shift();
      return newCards;
    });
    setIsCompareOpen(true);
  };

  const handleRemoveCompareCard = (cardId) => {
    setCompareCards(prev => prev.filter(c => c.card_id !== cardId));
    if (compareCards.length <= 1) {
      setIsCompareOpen(false);
    }
  };

  const isCompareDisabled = compareCards.length >= 3;

  const FieldError = ({ name }) => (
    <AnimatePresence>
      {errors[name] && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs font-semibold text-danger">
          {errors[name]?.message}
        </motion.p>
      )}
    </AnimatePresence>
  );

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="mb-10" ref={formRef}>
        <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-border-emerald mb-3">
          Smart Match Engine
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight mb-2">Find Matching Credit Cards</h1>
        <p className="text-text-secondary text-base max-w-2xl">
          Get real-time AI eligibility scores and unlock credit cards tailored to your lifestyle, income tier, and cashback preferences.
        </p>
      </div>

      <AnimatePresence>
        {globalError && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 bg-danger/10 text-danger text-sm font-medium rounded-2xl border border-danger/20">
              <AlertCircle size={18} />
              {globalError}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface rounded-3xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="p-8 md:p-10 border-b border-border-subtle">
          <h2 className="text-xl font-bold text-forest mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald flex items-center justify-center text-sm font-bold">1</span>
            Your Profile & Financial Standing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Age</label>
              <input type="number" {...register('age', { valueAsNumber: true })} className="w-full px-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-forest" />
              <FieldError name="age" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Employment Status</label>
              <select {...register('employment_status')} className="w-full px-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm font-medium text-forest">
                <option value="employed">Employed (Salaried)</option>
                <option value="self_employed">Self Employed / Business</option>
                <option value="unemployed">Unemployed</option>
                <option value="student">Student</option>
                <option value="retired">Retired</option>
              </select>
              <FieldError name="employment_status" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Annual Gross Income</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-text-secondary font-bold">₹</span>
                <input type="number" {...register('annual_income', { valueAsNumber: true })} className="w-full pl-8 pr-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-forest" />
              </div>
              <FieldError name="annual_income" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Credit Score *</label>
              <input type="number" placeholder="300 - 900" {...register('credit_score', { valueAsNumber: true })} className="w-full px-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-forest" />
              <FieldError name="credit_score" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Number of Existing Cards</label>
              <input type="number" {...register('existing_credit_cards', { valueAsNumber: true, onBlur: (e) => handleZeroBlur(e, 'existing_credit_cards') })} onFocus={handleZeroFocus} className="w-full px-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-forest" />
              <FieldError name="existing_credit_cards" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Total Outstanding Debt</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-text-secondary font-bold">₹</span>
                <input type="number" {...register('total_debt', { valueAsNumber: true, onBlur: (e) => handleZeroBlur(e, 'total_debt') })} onFocus={handleZeroFocus} className="w-full pl-8 pr-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-forest" />
              </div>
              <FieldError name="total_debt" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Monthly Rent / Housing Payment</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-text-secondary font-bold">₹</span>
                <input type="number" {...register('monthly_housing_payment', { valueAsNumber: true })} className="w-full pl-8 pr-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-forest" />
              </div>
              <FieldError name="monthly_housing_payment" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Current Bank Savings Balance</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-text-secondary font-bold">₹</span>
                <input type="number" {...register('bank_balance', { valueAsNumber: true })} className="w-full pl-8 pr-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-forest" />
              </div>
              <FieldError name="bank_balance" />
            </div>
          </div>
        </div>

        <div className="p-8 bg-surface-subtle/50 border-t border-border-subtle flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-10 rounded-full shadow-lg shadow-primary/20 text-base font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all hover-lift disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Matching Best Cards...
              </>
            ) : (
              'Match Eligible Cards →'
            )}
          </button>
        </div>
      </form>

      <div ref={resultRef}>
        <ResultSection 
          result={result} 
          onReset={handleReset} 
          onViewDetails={handleViewDetails}
          onCompare={handleCompare}
          isCompareDisabled={isCompareDisabled}
        />
      </div>

      <ExploreAllCards 
        onViewDetails={handleViewDetails}
        onCompare={handleCompare}
        isCompareDisabled={isCompareDisabled}
      />

      <CompareCardsPanel 
        cards={compareCards}
        recommendedCards={result?.recommended_cards || []}
        isOpen={isCompareOpen}
        onClose={() => {
          setIsCompareOpen(false);
          setCompareCards([]);
        }}
        onRemoveCard={handleRemoveCompareCard}
        onAddCard={handleCompare}
      />

      <CreditCardDetailsModal 
        card={selectedCardForDetails}
        isOpen={!!selectedCardForDetails}
        onClose={() => setSelectedCardForDetails(null)}
      />
    </div>
  );
};

export default CreditCardPage;
