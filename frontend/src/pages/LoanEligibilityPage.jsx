import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, XCircle, RotateCcw, Sparkles, Scale, ArrowRight } from 'lucide-react';
import { predictLoan } from '../api/loans';
import { useApplicationHistory } from '../store/historyStore';
import BankCard from '../components/shared/BankCard';
import EMICard from '../components/shared/EMICard';
import FinancialHealthGauge from '../components/shared/FinancialHealthGauge';
import { ReasonCard, SuggestionCard } from '../components/shared/ReasonCard';
import { formatConfidence } from '../utils/formatters';

const loanSchema = z.object({
  gender: z.enum(['Male', 'Female', 'Other']),
  married: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return undefined;
  }, z.boolean({ required_error: 'Please select your marital status', invalid_type_error: 'Please select your marital status' })),
  dependents: z.enum(['0', '1', '2', '3+']),
  education: z.enum(['Graduate', 'Not Graduate']),
  self_employed: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return undefined;
  }, z.boolean({ required_error: 'Please select your employment type', invalid_type_error: 'Please select your employment type' })),
  
  applicant_income: z.number().min(10000, "Minimum income is ₹10,000").max(1000000, "Maximum income is ₹10,000,000"),
  coapplicant_income: z.preprocess(
    (val) => (val === '' || val === null || val === undefined || Number.isNaN(Number(val))) ? undefined : Number(val),
    z.number().min(0, "Income cannot be negative").max(1000000, "Maximum income is ₹10,00,000").optional()
  ),
  savings: z.preprocess(
    (val) => (val === '' || val === null || val === undefined || Number.isNaN(Number(val))) ? undefined : Number(val),
    z.number({ required_error: 'Savings amount is required', invalid_type_error: 'Savings must be a valid number' }).min(0, "Savings cannot be negative")
  ),
  existing_loans: z.preprocess(
    (val) => (val === '' || val === null || val === undefined || Number.isNaN(Number(val))) ? undefined : Number(val),
    z.number({ required_error: 'Please select number of existing loans' }).min(0, "Cannot be negative").max(10, "Maximum 10 loans allowed")
  ),
  
  loan_amount: z.number().min(1000, "Minimum loan amount is ₹1,000"),
  loan_amount_term: z.number(),
  property_area: z.enum(['Urban', 'Semiurban', 'Rural']),
  credit_history: z.preprocess((val) => {
    if (val === '1' || val === 1) return 1.0;
    if (val === '0' || val === 0) return 0.0;
    if (val === 'not_sure') return null;
    return undefined;
  }, z.union([z.literal(1.0), z.literal(0.0), z.null()], {
    required_error: 'Please select your credit history',
    invalid_type_error: 'Please select your credit history'
  })),
});

const ResultSection = ({ result, onReset }) => {
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
      {/* Main Result Card */}
      <div className={`p-8 md:p-12 rounded-[2.5rem] border shadow-lg relative overflow-hidden ${
        isApproved 
          ? 'bg-gradient-to-br from-emerald-50 dark:from-emerald-950/40 to-surface border-border-emerald shadow-emerald-950/5' 
          : 'bg-gradient-to-br from-red-50 dark:from-red-950/40 to-surface border-red-200 dark:border-red-900/40 shadow-red-950/5'
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-surface/80 border border-border-subtle text-text-secondary">
              <Sparkles size={13} className={isApproved ? "text-primary dark:text-emerald-400" : "text-red-500"} />
              Prediction Result
            </div>
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight mb-2 ${
              isApproved ? 'text-forest' : 'text-red-600 dark:text-red-400'
            }`}>
              {isApproved ? 'Congratulations! Eligible for Approval' : 'Not Eligible for Current Parameters'}
            </h2>
            <p className="text-base text-text-secondary font-medium max-w-xl">
              {isApproved 
                ? 'Based on your financial parameters, your profile matches high-probability lending criteria.'
                : 'Your profile does not currently satisfy the specific debt ratio or credit requirements for this loan.'
              }
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 px-8 py-5 rounded-2xl bg-surface/90 backdrop-blur-md border border-border-subtle shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">AI Confidence</span>
            <span className={`text-4xl font-black ${
              isApproved ? 'text-primary dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {confidencePercent}%
            </span>
          </div>
        </div>

        {/* Try Again CTA for Rejected */}
        {!isApproved && (
          <div className="mt-8 flex justify-center md:justify-start">
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0D2818] hover:bg-[#163e27] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold transition-all shadow-md hover-lift cursor-pointer"
            >
              <RotateCcw size={18} />
              Adjust Parameters & Try Again
            </button>
          </div>
        )}
      </div>

      {/* Compare Loans Connected CTA Banner (Flow B) */}
      {isApproved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 p-7 md:p-9 rounded-[2rem] bg-gradient-to-br from-[#0D2818] via-[#166534] to-[#0A1F13] text-white shadow-xl relative overflow-hidden border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30">
              <Scale size={13} />
              Next Step: Compare Offers
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Want to find the best loan option?
            </h3>
            <p className="text-emerald-100/90 text-sm max-w-xl font-medium">
              Compare multiple bank quotes for your <strong className="text-white font-black">₹{(result.formData?.loan_amount || result.emi_details?.loan_amount || 500000).toLocaleString('en-IN')}</strong> loan side-by-side to find the lowest EMI, lowest total interest, and optimal lender.
            </p>
          </div>

          <Link
            to="/dashboard/compare-loans"
            state={{
              fromEligibility: true,
              loanAmount: result.formData?.loan_amount || result.emi_details?.loan_amount || 500000,
              monthlyIncome: (result.formData?.applicant_income || 50000) + (result.formData?.coapplicant_income || 0),
              existingLoans: result.formData?.existing_loans || 0,
              recommendedBanks: result.recommended_banks || [],
            }}
            className="shrink-0 px-8 py-4 rounded-full bg-emerald-400 hover:bg-emerald-300 text-[#0D2818] dark:text-[#0D2818] font-black text-sm sm:text-base shadow-lg shadow-emerald-950/40 transition-all hover-lift flex items-center gap-2 cursor-pointer z-10"
          >
            Compare Loans <ArrowRight size={18} />
          </Link>
        </motion.div>
      )}

      {/* Rejection Reasons & Suggestions */}
      {!isApproved && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {result.rejection_reasons?.length > 0 && (
            <div className="bg-surface p-7 rounded-3xl border border-border-subtle shadow-sm">
              <h3 className="text-lg font-bold text-forest mb-4">Key Risk Factors</h3>
              <div className="space-y-3">
                {result.rejection_reasons.map((r, i) => <ReasonCard key={i} reason={r} />)}
              </div>
            </div>
          )}
          {result.improvement_suggestions?.length > 0 && (
            <div className="bg-surface p-7 rounded-3xl border border-border-subtle shadow-sm">
              <h3 className="text-lg font-bold text-forest mb-4">Actionable Improvement Steps</h3>
              <div className="space-y-3">
                {result.improvement_suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EMI Details */}
      {isApproved && result.emi_details && (
        <div className="mt-8">
          <EMICard emiDetails={result.emi_details} />
        </div>
      )}

      {/* Recommended Banks */}
      {isApproved && result.recommended_banks?.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-forest flex items-center gap-2.5">
              Top Matched Banks
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald">
                {result.recommended_banks.length} Lenders Available
              </span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.recommended_banks.map((bank, index) => (
              <BankCard key={index} bank={bank} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Financial Health */}
      {result.financial_health && (
        <FinancialHealthGauge health={result.financial_health} />
      )}
    </motion.div>
  );
};

const LoanEligibilityPage = () => {
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  const resultRef = useRef(null);
  const formRef = useRef(null);
  const { addApplication } = useApplicationHistory();

  const { register, handleSubmit, watch, formState: { errors, isValid }, setError } = useForm({
    resolver: zodResolver(loanSchema),
    mode: 'all',
    defaultValues: {
      married: '',
      self_employed: '',
      dependents: '0',
      education: 'Graduate',
      gender: 'Male',
      applicant_income: 50000,
      coapplicant_income: '',
      savings: '',
      existing_loans: '',
      loan_amount: 1000000,
      loan_amount_term: 120,
      property_area: 'Urban',
      credit_history: '',
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setGlobalError('');
    setResult(null);
    
    try {
      const finalData = { ...data, coapplicant_income: data.coapplicant_income || 0 };
      const totalIncome = finalData.applicant_income + finalData.coapplicant_income;

      const monthlyRate = 8.5 / 12 / 100;
      const tenureMonths = finalData.loan_amount_term || 360;
      const factor = Math.pow(1 + monthlyRate, tenureMonths);
      const estimatedNewEmi = finalData.loan_amount > 0
        ? (finalData.loan_amount * monthlyRate * factor) / (factor - 1)
        : 0;

      const existingLoanObligation = finalData.existing_loans * 5000;
      const totalMonthlyObligation = estimatedNewEmi + existingLoanObligation;

      finalData.debt_ratio = totalIncome > 0
        ? Math.min(totalMonthlyObligation / totalIncome, 5)
        : 1;

      const response = await predictLoan(finalData);
      setResult({ ...response, formData: finalData });
      
      addApplication({
        type: 'loan',
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
          AI Assessment Engine
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight mb-2">Check Home Loan Eligibility</h1>
        <p className="text-text-secondary text-base max-w-2xl">
          Enter your financial parameters below to get instant AI approval predictions, customized EMI schedules, and matched bank rates.
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
        {/* SECTION 1: Personal Details */}
        <div className="p-8 md:p-10 border-b border-border-subtle">
          <h2 className="text-xl font-bold text-forest mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald flex items-center justify-center text-sm font-bold">1</span>
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Gender</label>
              <select {...register('gender')} className="w-full px-4 py-3 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm font-medium text-forest">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <FieldError name="gender" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Marital Status</label>
              <div className="flex items-center gap-6 py-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="true" {...register('married')} className="w-4 h-4 text-primary accent-primary" />
                  <span className="text-sm font-semibold text-text-secondary">Married</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="false" {...register('married')} className="w-4 h-4 text-primary accent-primary" />
                  <span className="text-sm font-semibold text-text-secondary">Single</span>
                </label>
              </div>
              <FieldError name="married" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Dependents</label>
              <select {...register('dependents')} className="w-full px-4 py-3 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm font-medium text-forest">
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3+">3+</option>
              </select>
              <FieldError name="dependents" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Education</label>
              <select {...register('education')} className="w-full px-4 py-3 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm font-medium text-forest">
                <option value="Graduate">Graduate</option>
                <option value="Not Graduate">Not Graduate</option>
              </select>
              <FieldError name="education" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Employment Type</label>
              <div className="flex items-center gap-6 py-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="true" {...register('self_employed')} className="w-4 h-4 text-primary accent-primary" />
                  <span className="text-sm font-semibold text-text-secondary">Self Employed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="false" {...register('self_employed')} className="w-4 h-4 text-primary accent-primary" />
                  <span className="text-sm font-semibold text-text-secondary">Salaried</span>
                </label>
              </div>
              <FieldError name="self_employed" />
            </div>
          </div>
        </div>

        {/* SECTION 2: Income Details */}
        <div className="p-8 md:p-10 border-b border-border-subtle bg-surface-subtle/30">
          <h2 className="text-xl font-bold text-forest mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald flex items-center justify-center text-sm font-bold">2</span>
            Financial Parameters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2 flex justify-between">
                Monthly Income
                <span className="text-primary dark:text-emerald-400 font-black">
                  {watch('applicant_income') ? `₹${watch('applicant_income').toLocaleString('en-IN')}/month` : ''}
                </span>
              </label>
              <input 
                type="range" 
                min="10000" 
                max="1000000" 
                step="1000" 
                {...register('applicant_income', { valueAsNumber: true })} 
                className="w-full accent-primary h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer mt-3" 
              />
              <div className="flex justify-between text-xs text-text-secondary mt-2 font-semibold">
                <span>₹10K</span>
                <span>₹10L</span>
              </div>
              <FieldError name="applicant_income" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Co-applicant Income <span className="text-text-secondary font-normal">(Optional)</span></label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-text-secondary font-bold">₹</span>
                <input 
                  type="number" 
                  placeholder="e.g. 25000"
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                  }}
                  {...register('coapplicant_income')} 
                  className={`w-full pl-8 pr-4 py-2.5 bg-surface border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-forest ${errors.coapplicant_income ? 'border-danger' : 'border-border-subtle'}`} 
                />
              </div>
              <FieldError name="coapplicant_income" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Total Liquid Savings</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-text-secondary font-bold">₹</span>
                <input 
                  type="number" 
                  placeholder="e.g. 150000"
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                  }}
                  {...register('savings')} 
                  className={`w-full pl-8 pr-4 py-2.5 bg-surface border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-forest ${errors.savings ? 'border-danger' : 'border-border-subtle'}`} 
                />
              </div>
              <FieldError name="savings" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Number of Existing Loans</label>
              <select {...register('existing_loans', { valueAsNumber: true })} className={`w-full px-4 py-2.5 bg-surface border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm font-medium text-forest ${errors.existing_loans ? 'border-danger' : 'border-border-subtle'}`}>
                <option value="" disabled>Select number of loans</option>
                {[...Array(11).keys()].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <FieldError name="existing_loans" />
            </div>
          </div>
        </div>

        {/* SECTION 3: Loan Details */}
        <div className="p-8 md:p-10">
          <h2 className="text-xl font-bold text-forest mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald flex items-center justify-center text-sm font-bold">3</span>
            Loan Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2 flex justify-between">
                Required Loan Amount
                <span className="text-primary dark:text-emerald-400 font-black">₹{watch('loan_amount')?.toLocaleString('en-IN')}</span>
              </label>
              <input type="range" min="10000" max="5000000" step="10000" {...register('loan_amount', { valueAsNumber: true })} className="w-full accent-primary h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer mt-3" />
              <div className="flex justify-between text-xs text-text-secondary mt-2 font-semibold">
                <span>₹10K</span>
                <span>₹50L</span>
              </div>
              <FieldError name="loan_amount" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Loan Term</label>
              <select {...register('loan_amount_term', { valueAsNumber: true })} className="w-full px-4 py-3 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm font-medium text-forest">
                <option value="12">1 Year (12 months)</option>
                <option value="36">3 Years (36 months)</option>
                <option value="60">5 Years (60 months)</option>
                <option value="120">10 Years (120 months)</option>
                <option value="240">20 Years (240 months)</option>
                <option value="360">30 Years (360 months)</option>
              </select>
              <FieldError name="loan_amount_term" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Property Location</label>
              <div className="flex bg-surface-subtle rounded-xl p-1 border border-border-subtle">
                {['Urban', 'Semiurban', 'Rural'].map(area => (
                  <label key={area} className="flex-1 text-center">
                    <input type="radio" value={area} {...register('property_area')} className="hidden peer" />
                    <div className="py-2 text-xs sm:text-sm font-bold text-text-secondary rounded-lg cursor-pointer peer-checked:bg-surface peer-checked:text-primary dark:peer-checked:text-emerald-400 peer-checked:shadow-xs transition-all">
                      {area}
                    </div>
                  </label>
                ))}
              </div>
              <FieldError name="property_area" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Healthy Credit History?</label>
              <div className="flex items-center gap-6 py-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="1" {...register('credit_history')} className="w-4 h-4 text-primary accent-primary" />
                  <span className="text-sm font-semibold text-text-secondary">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="0" {...register('credit_history')} className="w-4 h-4 text-primary accent-primary" />
                  <span className="text-sm font-semibold text-text-secondary">No</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="not_sure" {...register('credit_history')} className="w-4 h-4 text-primary accent-primary" />
                  <span className="text-sm font-semibold text-text-secondary">Not Sure</span>
                </label>
              </div>
              <FieldError name="credit_history" />
            </div>
          </div>
        </div>

        <div className="p-8 bg-surface-subtle/50 border-t border-border-subtle flex justify-end">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-10 rounded-full shadow-lg shadow-primary/20 text-base font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all hover-lift disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyzing Eligibility...
              </>
            ) : (
              'Run AI Eligibility Check →'
            )}
          </button>
        </div>
      </form>

      <div ref={resultRef}>
        <ResultSection result={result} onReset={handleReset} />
      </div>
    </div>
  );
};

export default LoanEligibilityPage;
