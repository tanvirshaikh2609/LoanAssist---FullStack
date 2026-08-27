import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Plus, Trash2, Sparkles, CheckCircle2, TrendingDown, 
  DollarSign, Clock, ShieldCheck, ArrowRight, RotateCcw, 
  AlertCircle, HelpCircle, ChevronRight, Sliders, Award,
  Check, Wallet, ArrowUpRight, BarChart3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { 
  calculateEMI, 
  calculateLoanMetrics, 
  compareLoans, 
  evaluateAffordability,
  calculateWhatIf 
} from '../utils/loanComparison';

const PROVIDER_PRESETS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Bank of Baroda',
  'Punjab National Bank (PNB)',
  'Union Bank of India',
  'Canara Bank',
  'IDFC FIRST Bank',
  'Custom Provider'
];

const TENURE_PRESETS = [
  { label: '1 Year', value: 1 },
  { label: '2 Years', value: 2 },
  { label: '3 Years', value: 3 },
  { label: '5 Years', value: 5 },
  { label: '7 Years', value: 7 },
  { label: '10 Years', value: 10 },
  { label: '15 Years', value: 15 },
  { label: '20 Years', value: 20 },
  { label: '30 Years', value: 30 },
];

const CompareLoansPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const resultsRef = useRef(null);

  // Flow B connection params from Eligibility Checker
  const eligibilityData = location.state || {};
  const isFromEligibility = !!eligibilityData.fromEligibility;

  // Affordability state
  const [monthlyIncome, setMonthlyIncome] = useState(
    eligibilityData.monthlyIncome || 65000
  );
  const [existingLoansCount, setExistingLoansCount] = useState(
    eligibilityData.existingLoans || 0
  );
  const [showAffordabilityConfig, setShowAffordabilityConfig] = useState(false);

  // Base loan amount to initialize
  const defaultPrincipal = eligibilityData.loanAmount || 500000;

  // Initialize 2-4 loan offers
  const [loans, setLoans] = useState(() => {
    if (isFromEligibility && eligibilityData.recommendedBanks?.length >= 2) {
      return eligibilityData.recommendedBanks.slice(0, 3).map((bank, index) => ({
        id: `loan-${index + 1}`,
        provider: bank.name || `Option ${index + 1}`,
        amount: defaultPrincipal,
        rate: bank.interest_rate || (10.5 + index * 0.4),
        tenure: 5,
        interestType: 'Floating',
      }));
    }

    return [
      {
        id: 'loan-1',
        provider: 'State Bank of India (SBI)',
        amount: defaultPrincipal,
        rate: 10.5,
        tenure: 5,
        interestType: 'Floating',
      },
      {
        id: 'loan-2',
        provider: 'HDFC Bank',
        amount: defaultPrincipal,
        rate: 11.2,
        tenure: 5,
        interestType: 'Fixed',
      },
    ];
  });

  const [errors, setErrors] = useState({});
  const [whatIfExtraEmi, setWhatIfExtraEmi] = useState(2000);
  const [whatIfTenureReduction, setWhatIfTenureReduction] = useState(1);
  const [selectedWhatIfLoanId, setSelectedWhatIfLoanId] = useState(null);

  // Calculate comparison data dynamically
  const userFinancials = useMemo(() => ({
    monthlyIncome: Number(monthlyIncome) || 0,
    existingLoans: Number(existingLoansCount) || 0,
  }), [monthlyIncome, existingLoansCount]);

  const comparisonResult = useMemo(() => {
    // Validate loans
    const hasInvalid = loans.some(
      (l) => !l.provider || Number(l.amount) <= 0 || Number(l.rate) <= 0 || Number(l.tenure) <= 0
    );
    if (hasInvalid) return null;

    return compareLoans(loans, userFinancials);
  }, [loans, userFinancials]);

  // Set default selected loan for What-If simulator
  useEffect(() => {
    if (comparisonResult?.bestOverall) {
      setSelectedWhatIfLoanId(comparisonResult.bestOverall.id);
    } else if (loans.length > 0) {
      setSelectedWhatIfLoanId(loans[0].id);
    }
  }, [comparisonResult?.bestOverall?.id, loans]);

  const selectedWhatIfLoan = useMemo(() => {
    if (!comparisonResult?.loans) return null;
    return comparisonResult.loans.find((l) => l.id === selectedWhatIfLoanId) || comparisonResult.loans[0];
  }, [comparisonResult, selectedWhatIfLoanId]);

  const whatIfResult = useMemo(() => {
    if (!selectedWhatIfLoan) return null;
    return calculateWhatIf(selectedWhatIfLoan, whatIfExtraEmi, whatIfTenureReduction);
  }, [selectedWhatIfLoan, whatIfExtraEmi, whatIfTenureReduction]);

  // Handlers for modifying loan list
  const handleAddLoan = () => {
    if (loans.length >= 4) return;
    const newId = `loan-${Date.now()}`;
    const defaultAmount = loans[0]?.amount || defaultPrincipal;
    const defaultTenure = loans[0]?.tenure || 5;

    const availablePresets = PROVIDER_PRESETS.filter(
      (p) => p !== 'Custom Provider' && !loans.some((l) => l.provider === p)
    );
    const nextProvider = availablePresets[0] || `Loan Option ${loans.length + 1}`;

    setLoans([
      ...loans,
      {
        id: newId,
        provider: nextProvider,
        amount: defaultAmount,
        rate: 10.8,
        tenure: defaultTenure,
        interestType: 'Floating',
      },
    ]);
  };

  const handleRemoveLoan = (id) => {
    if (loans.length <= 2) return;
    setLoans(loans.filter((l) => l.id !== id));
  };

  const handleUpdateLoan = (id, field, value) => {
    setLoans((prev) =>
      prev.map((loan) => {
        if (loan.id !== id) return loan;

        let formattedValue = value;
        if (field === 'amount' || field === 'rate' || field === 'tenure') {
          formattedValue = value === '' ? '' : Number(value);
        }
        return { ...loan, [field]: formattedValue };
      })
    );
  };

  const handleSyncAllAmounts = (amount) => {
    setLoans((prev) => prev.map((l) => ({ ...l, amount: Number(amount) || 0 })));
  };

  const handleSyncAllTenures = (tenure) => {
    setLoans((prev) => prev.map((l) => ({ ...l, tenure: Number(tenure) || 1 })));
  };

  const handleResetAll = () => {
    setLoans([
      {
        id: 'loan-1',
        provider: 'State Bank of India (SBI)',
        amount: 500000,
        rate: 10.5,
        tenure: 5,
        interestType: 'Floating',
      },
      {
        id: 'loan-2',
        provider: 'HDFC Bank',
        amount: 500000,
        rate: 11.2,
        tenure: 5,
        interestType: 'Fixed',
      },
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24">
      {/* 1. Header & Connected Flow Banner */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-border-emerald">
            <Scale size={13} className="text-primary dark:text-emerald-400" />
            Decision Intelligence
          </span>
          {isFromEligibility && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 size={13} />
              Pre-filled from Eligibility Result
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-forest tracking-tight">Compare Loan Offers</h1>
            <p className="text-text-secondary text-sm sm:text-base max-w-2xl mt-1 font-medium">
              Side-by-side financial evaluation of 2–4 loan quotes. Understand your exact monthly EMI, total interest, and find the smartest option for your budget.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleResetAll}
              className="px-4 py-2.5 rounded-full border border-border-subtle hover:border-border-emerald text-text-secondary hover:text-forest dark:hover:text-white bg-surface font-bold text-xs shadow-xs transition-all hover-lift flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <Link
              to="/dashboard/loan"
              className="px-5 py-2.5 rounded-full bg-surface-subtle hover:bg-surface border border-border-subtle text-forest dark:text-emerald-100 hover:text-primary dark:hover:text-emerald-400 font-bold text-xs transition-all hover-lift flex items-center gap-1.5 cursor-pointer"
            >
              <Wallet size={14} /> Check Eligibility
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Optional Affordability Config Card */}
      <div className="bg-surface rounded-3xl p-6 border border-border-subtle shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-border-emerald text-primary dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-forest">Personalized Affordability Benchmark</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Active
                </span>
              </div>
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                Monthly Income: <strong className="text-forest">₹{Number(monthlyIncome).toLocaleString('en-IN')}</strong> • Estimated Safe EMI Band: <strong className="text-primary dark:text-emerald-400">₹{Math.round(monthlyIncome * 0.35).toLocaleString('en-IN')} – ₹{Math.round(monthlyIncome * 0.45).toLocaleString('en-IN')}/mo</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAffordabilityConfig(!showAffordabilityConfig)}
            className="text-xs font-bold text-primary dark:text-emerald-400 hover:text-primary-dark inline-flex items-center gap-1 py-1.5 px-3 rounded-xl bg-surface-subtle hover:bg-surface border border-border-subtle transition-all cursor-pointer"
          >
            <Sliders size={13} />
            {showAffordabilityConfig ? 'Hide Settings' : 'Adjust Income / Debt'}
          </button>
        </div>

        <AnimatePresence>
          {showAffordabilityConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-hidden"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2 flex justify-between">
                  Monthly Net Income (₹)
                  <span className="text-primary dark:text-emerald-400 font-bold">₹{Number(monthlyIncome).toLocaleString('en-IN')}</span>
                </label>
                <input
                  type="range"
                  min="15000"
                  max="1000000"
                  step="5000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-border-subtle rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
                  Existing Monthly Debt / Loan Obligations
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={existingLoansCount}
                    onChange={(e) => setExistingLoansCount(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-bold text-forest outline-none focus:border-primary"
                  >
                    <option value={0}>No existing loans (₹0 / mo)</option>
                    <option value={1}>1 existing loan (~₹5,000 / mo)</option>
                    <option value={2}>2 existing loans (~₹10,000 / mo)</option>
                    <option value={3}>3 existing loans (~₹15,000 / mo)</option>
                    <option value={4}>4+ existing loans (~₹20,000+ / mo)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Multi-Loan Input Offer Cards (2 to 4 Offers) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-forest flex items-center gap-2">
              Loan Offers to Compare
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-surface-subtle border border-border-subtle text-text-secondary">
                {loans.length} of 4 Offers
              </span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5 font-medium">
              Enter the principal amount, interest rate, and tenure offered by each lender.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {loans.length < 4 && (
              <button
                onClick={handleAddLoan}
                className="px-4 py-2 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition-all hover-lift flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Add Another Loan
              </button>
            )}
          </div>
        </div>

        {/* Loan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {loans.map((loan, index) => {
            const metrics = calculateLoanMetrics(loan);
            const isWinner = comparisonResult?.bestOverall?.id === loan.id;

            return (
              <motion.div
                key={loan.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-surface rounded-3xl p-5 border transition-all duration-300 shadow-sm flex flex-col justify-between relative group ${
                  isWinner
                    ? 'border-primary dark:border-emerald-400 ring-2 ring-primary/20 dark:ring-emerald-400/20'
                    : 'border-border-subtle hover:border-border-emerald'
                }`}
              >
                {/* Winner Pill Tag */}
                {isWinner && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 rounded-full bg-primary dark:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Award size={12} />
                    Best Overall Choice
                  </div>
                )}

                <div>
                  {/* Card Header & Remove Button */}
                  <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-surface-subtle text-forest border border-border-subtle flex items-center justify-center font-bold text-[10px]">
                        {index + 1}
                      </span>
                      Option {String.fromCharCode(65 + index)}
                    </span>

                    {loans.length > 2 && (
                      <button
                        onClick={() => handleRemoveLoan(loan.id)}
                        className="p-1 text-text-secondary hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Remove this loan"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Provider Input / Preset */}
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-forest mb-1.5">
                        Lender / Provider
                      </label>
                      <input
                        type="text"
                        list={`providers-${loan.id}`}
                        value={loan.provider}
                        onChange={(e) => handleUpdateLoan(loan.id, 'provider', e.target.value)}
                        placeholder="e.g. SBI, HDFC"
                        className="w-full px-3.5 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-bold text-forest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                      <datalist id={`providers-${loan.id}`}>
                        {PROVIDER_PRESETS.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>

                    {/* Loan Amount */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-forest">
                          Loan Amount (₹)
                        </label>
                        {index === 0 && loans.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleSyncAllAmounts(loan.amount)}
                            className="text-[10px] font-bold text-primary dark:text-emerald-400 hover:underline"
                          >
                            Apply to all
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-text-secondary font-bold text-xs">₹</span>
                        <input
                          type="number"
                          value={loan.amount}
                          onChange={(e) => handleUpdateLoan(loan.id, 'amount', e.target.value)}
                          step="10000"
                          min="10000"
                          max="100000000"
                          className="w-full pl-7 pr-3 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-bold text-forest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Interest Rate & Type */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-forest mb-1.5">
                          Rate (% p.a.)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={loan.rate}
                            onChange={(e) => handleUpdateLoan(loan.id, 'rate', e.target.value)}
                            step="0.05"
                            min="1"
                            max="35"
                            className="w-full px-3 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-bold text-forest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-forest mb-1.5">
                          Interest Type
                        </label>
                        <select
                          value={loan.interestType}
                          onChange={(e) => handleUpdateLoan(loan.id, 'interestType', e.target.value)}
                          className="w-full px-2.5 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-bold text-forest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          <option value="Floating">Floating</option>
                          <option value="Fixed">Fixed</option>
                        </select>
                      </div>
                    </div>

                    {/* Tenure */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-forest">
                          Tenure (Years)
                        </label>
                        {index === 0 && loans.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleSyncAllTenures(loan.tenure)}
                            className="text-[10px] font-bold text-primary dark:text-emerald-400 hover:underline"
                          >
                            Apply to all
                          </button>
                        )}
                      </div>
                      <select
                        value={loan.tenure}
                        onChange={(e) => handleUpdateLoan(loan.id, 'tenure', e.target.value)}
                        className="w-full px-3 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-bold text-forest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        {TENURE_PRESETS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label} ({t.value * 12} mo)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Live Card Result Snapshot */}
                <div className="mt-5 pt-4 border-t border-border-subtle bg-surface-subtle/50 -mx-5 -mb-5 p-4 rounded-b-3xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-text-secondary">Monthly EMI</span>
                    <span className="text-sm font-black text-primary dark:text-emerald-400">
                      ₹{metrics.monthlyEMI.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-secondary font-medium">Total Interest</span>
                    <span className="font-bold text-forest">₹{metrics.totalInterest.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-secondary font-medium">Total Repayment</span>
                    <span className="font-black text-forest">₹{metrics.totalRepayment.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. Comparison Results & Visual Dashboard */}
      {comparisonResult && (
        <div ref={resultsRef} className="space-y-8 pt-4">
          
          {/* A. 4-Pillar Highlights Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Best Overall Winner */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-forest dark:from-emerald-700 dark:to-[#0A1A10] text-white border border-emerald-500/30 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                  🏆 Top Recommended
                </span>
                <span className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-emerald-200">
                  <Sparkles size={16} />
                </span>
              </div>
              <div>
                <h4 className="text-xl font-black truncate">{comparisonResult.bestOverall.provider}</h4>
                <p className="text-xs text-emerald-100 font-bold mt-1">
                  ₹{comparisonResult.bestOverall.monthlyEMI.toLocaleString('en-IN')}/mo • {comparisonResult.bestOverall.tenureYears} yrs @ {comparisonResult.bestOverall.rate}%
                </p>
              </div>
            </div>

            {/* 2. Lowest EMI */}
            <div className="p-5 rounded-3xl bg-surface border border-border-subtle shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">
                  💰 Lowest Monthly EMI
                </span>
                <span className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-400 flex items-center justify-center">
                  <DollarSign size={16} />
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-primary dark:text-emerald-400">
                  ₹{comparisonResult.lowestEMILoan.monthlyEMI.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-text-secondary">/mo</span>
                </p>
                <p className="text-xs text-text-secondary font-bold mt-1 truncate">
                  {comparisonResult.lowestEMILoan.provider} ({comparisonResult.lowestEMILoan.tenureYears} yrs)
                </p>
              </div>
            </div>

            {/* 3. Lowest Total Interest */}
            <div className="p-5 rounded-3xl bg-surface border border-border-subtle shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">
                  📉 Lowest Total Interest
                </span>
                <span className="w-7 h-7 rounded-xl bg-surface-subtle text-forest flex items-center justify-center">
                  <TrendingDown size={16} />
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-forest">
                  ₹{comparisonResult.lowestInterestLoan.totalInterest.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-text-secondary font-bold mt-1 truncate">
                  {comparisonResult.lowestInterestLoan.provider} ({comparisonResult.lowestInterestLoan.rate}% p.a.)
                </p>
              </div>
            </div>

            {/* 4. Lowest Total Repayment */}
            <div className="p-5 rounded-3xl bg-surface border border-border-subtle shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">
                  💵 Lowest Total Payout
                </span>
                <span className="w-7 h-7 rounded-xl bg-surface-subtle text-forest flex items-center justify-center">
                  <Wallet size={16} />
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-forest">
                  ₹{comparisonResult.lowestRepaymentLoan.totalRepayment.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-text-secondary font-bold mt-1 truncate">
                  {comparisonResult.lowestRepaymentLoan.provider}
                </p>
              </div>
            </div>
          </div>

          {/* B. Dynamic Side-by-Side Comparison Matrix */}
          <div className="bg-surface rounded-3xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-forest flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary dark:text-emerald-400" />
                  Side-by-Side Comparison Matrix
                </h3>
                <p className="text-xs text-text-secondary font-medium">
                  Detailed comparison across key borrowing parameters and total cash outflow.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-surface-subtle/80 border-b border-border-subtle">
                    <th className="p-4 font-bold text-text-secondary uppercase text-[11px] tracking-wider w-1/4">
                      Metric / Parameter
                    </th>
                    {comparisonResult.loans.map((loan, idx) => (
                      <th key={loan.id} className="p-4 font-black text-forest">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#0D2818] dark:bg-emerald-900 text-white dark:text-emerald-200 flex items-center justify-center text-[10px] font-bold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="truncate max-w-[140px] sm:max-w-none">{loan.provider}</span>
                          {comparisonResult.bestOverall.id === loan.id && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-border-emerald">
                              Recommended
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-border-subtle">
                  {/* Loan Amount */}
                  <tr className="hover:bg-surface-subtle/30 transition-colors">
                    <td className="p-4 font-bold text-text-secondary">Principal Amount</td>
                    {comparisonResult.loans.map((l) => (
                      <td key={l.id} className="p-4 font-bold text-forest">
                        ₹{l.principal.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>

                  {/* Interest Rate */}
                  <tr className="hover:bg-surface-subtle/30 transition-colors">
                    <td className="p-4 font-bold text-text-secondary">Interest Rate</td>
                    {comparisonResult.loans.map((l) => {
                      const isLowestRate = l.rate === Math.min(...comparisonResult.loans.map((x) => x.rate));
                      return (
                        <td key={l.id} className="p-4 font-bold text-forest">
                          <span className={isLowestRate ? 'text-primary dark:text-emerald-400 font-black' : ''}>
                            {l.rate}% p.a.
                          </span>
                          {isLowestRate && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">
                              Lowest Rate
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Tenure */}
                  <tr className="hover:bg-surface-subtle/30 transition-colors">
                    <td className="p-4 font-bold text-text-secondary">Tenure Duration</td>
                    {comparisonResult.loans.map((l) => (
                      <td key={l.id} className="p-4 font-semibold text-forest">
                        {l.tenureYears} Years ({l.totalMonths} months)
                      </td>
                    ))}
                  </tr>

                  {/* Interest Type */}
                  <tr className="hover:bg-surface-subtle/30 transition-colors">
                    <td className="p-4 font-bold text-text-secondary">Interest Type</td>
                    {comparisonResult.loans.map((l) => (
                      <td key={l.id} className="p-4 font-semibold text-text-secondary">
                        {l.interestType}
                      </td>
                    ))}
                  </tr>

                  {/* Monthly EMI */}
                  <tr className="hover:bg-surface-subtle/30 transition-colors bg-emerald-500/[0.02]">
                    <td className="p-4 font-bold text-forest">
                      Monthly EMI
                      <span className="block text-[10px] text-text-secondary font-normal">Reducing balance installment</span>
                    </td>
                    {comparisonResult.loans.map((l) => {
                      const isLowestEmi = l.id === comparisonResult.lowestEMILoan.id;
                      return (
                        <td key={l.id} className="p-4">
                          <span className={`text-base font-black ${isLowestEmi ? 'text-primary dark:text-emerald-400' : 'text-forest'}`}>
                            ₹{l.monthlyEMI.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-text-secondary"> /mo</span>
                          {isLowestEmi && (
                            <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                              ✓ Lowest Monthly Outflow
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Total Interest */}
                  <tr className="hover:bg-surface-subtle/30 transition-colors">
                    <td className="p-4 font-bold text-text-secondary">
                      Total Interest Accrued
                    </td>
                    {comparisonResult.loans.map((l) => {
                      const isLowestInterest = l.id === comparisonResult.lowestInterestLoan.id;
                      return (
                        <td key={l.id} className="p-4 font-bold text-forest">
                          <span className={isLowestInterest ? 'text-emerald-700 dark:text-emerald-400 font-black' : ''}>
                            ₹{l.totalInterest.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-text-secondary block">
                            ({l.interestPercentage}% of principal)
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Total Repayment */}
                  <tr className="hover:bg-surface-subtle/30 transition-colors bg-surface-subtle/40">
                    <td className="p-4 font-black text-forest">
                      Total Repayment (Principal + Interest)
                    </td>
                    {comparisonResult.loans.map((l) => {
                      const isLowestRepayment = l.id === comparisonResult.lowestRepaymentLoan.id;
                      return (
                        <td key={l.id} className="p-4">
                          <span className={`text-base font-black ${isLowestRepayment ? 'text-primary dark:text-emerald-400' : 'text-forest'}`}>
                            ₹{l.totalRepayment.toLocaleString('en-IN')}
                          </span>
                          {isLowestRepayment && (
                            <span className="block text-[10px] font-bold text-primary dark:text-emerald-400 mt-0.5">
                              ✓ Lowest Overall Payout
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Affordability Tag */}
                  <tr className="hover:bg-surface-subtle/30 transition-colors">
                    <td className="p-4 font-bold text-text-secondary">
                      Budget & Affordability Status
                    </td>
                    {comparisonResult.loans.map((l) => (
                      <td key={l.id} className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${l.affordability.colorClass}`}>
                          {l.affordability.status === 'fit' && <Check size={12} className="stroke-[3]" />}
                          {l.affordability.label}
                        </span>
                        {l.affordability.percentage > 0 && (
                          <span className="block text-[10px] text-text-secondary mt-1 font-medium">
                            Takes ~{l.affordability.percentage}% of your monthly income
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* C. Visual Comparison Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Visual Bar 1: Monthly EMI Comparison */}
            <div className="bg-surface rounded-3xl p-6 border border-border-subtle shadow-sm space-y-4">
              <h4 className="text-base font-bold text-forest flex items-center justify-between">
                <span>Monthly EMI Comparison</span>
                <span className="text-xs font-bold text-text-secondary">Lower is easier to pay monthly</span>
              </h4>

              <div className="space-y-3.5 pt-2">
                {comparisonResult.loans.map((l, idx) => {
                  const maxEmi = Math.max(...comparisonResult.loans.map((x) => x.monthlyEMI));
                  const percentage = maxEmi > 0 ? (l.monthlyEMI / maxEmi) * 100 : 0;
                  const isLowest = l.id === comparisonResult.lowestEMILoan.id;

                  return (
                    <div key={l.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-forest truncate max-w-[160px]">
                          {String.fromCharCode(65 + idx)}. {l.provider}
                        </span>
                        <span className={isLowest ? 'text-primary dark:text-emerald-400 font-black' : 'text-forest'}>
                          ₹{l.monthlyEMI.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                      <div className="h-3.5 w-full bg-surface-subtle rounded-full overflow-hidden p-0.5 border border-border-subtle/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${
                            isLowest ? 'bg-primary dark:bg-emerald-400' : 'bg-emerald-800/60 dark:bg-emerald-700/50'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Bar 2: Total Interest Burden Comparison */}
            <div className="bg-surface rounded-3xl p-6 border border-border-subtle shadow-sm space-y-4">
              <h4 className="text-base font-bold text-forest flex items-center justify-between">
                <span>Total Interest Cost Comparison</span>
                <span className="text-xs font-bold text-text-secondary">Total extra interest paid</span>
              </h4>

              <div className="space-y-3.5 pt-2">
                {comparisonResult.loans.map((l, idx) => {
                  const maxInterest = Math.max(...comparisonResult.loans.map((x) => x.totalInterest));
                  const percentage = maxInterest > 0 ? (l.totalInterest / maxInterest) * 100 : 0;
                  const isLowest = l.id === comparisonResult.lowestInterestLoan.id;

                  return (
                    <div key={l.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-forest truncate max-w-[160px]">
                          {String.fromCharCode(65 + idx)}. {l.provider}
                        </span>
                        <span className={isLowest ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-forest'}>
                          ₹{l.totalInterest.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="h-3.5 w-full bg-surface-subtle rounded-full overflow-hidden p-0.5 border border-border-subtle/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${
                            isLowest ? 'bg-emerald-500' : 'bg-amber-600/70 dark:bg-amber-500/60'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* D. “Why LoanAssist Recommends This Loan” Dynamic Section */}
          <div className="bg-gradient-to-br from-surface to-surface-subtle p-7 rounded-3xl border border-border-emerald shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-emerald-400">
                  Intelligent Decision Rationale
                </span>
                <h3 className="text-xl font-extrabold text-forest">
                  Why LoanAssist Recommends {comparisonResult.bestOverall.provider}
                </h3>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              Based on multi-variable financial optimization (interest minimization, cash outflow, and your ₹{Number(monthlyIncome).toLocaleString('en-IN')} monthly income profile), <strong>{comparisonResult.bestOverall.provider}</strong> delivers the best economic value.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              {comparisonResult.rationales.map((r, i) => (
                <div key={i} className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-primary dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 size={15} />
                    <span>{r.title}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-normal font-normal">
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* E. Interactive What-If Scenario Analysis */}
          <div className="bg-surface rounded-3xl p-7 border border-border-subtle shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-emerald-400">
                  Scenario Simulator
                </span>
                <h3 className="text-xl font-black text-forest flex items-center gap-2">
                  <Sliders size={20} className="text-primary dark:text-emerald-400" />
                  Explore Your Options (What-If Analysis)
                </h3>
                <p className="text-xs text-text-secondary font-medium mt-0.5">
                  See how paying a slightly higher EMI or choosing a shorter tenure saves lakhs in total interest.
                </p>
              </div>

              {/* Loan Selector for What-If */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary">Simulate for:</span>
                <select
                  value={selectedWhatIfLoanId}
                  onChange={(e) => setSelectedWhatIfLoanId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-bold text-forest outline-none focus:border-primary"
                >
                  {comparisonResult.loans.map((l, i) => (
                    <option key={l.id} value={l.id}>
                      Option {String.fromCharCode(65 + i)}: {l.provider}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {whatIfResult && selectedWhatIfLoan && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Scenario 1: Increase Monthly EMI */}
                <div className="p-6 rounded-2xl bg-surface-subtle/60 border border-border-subtle space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                      Scenario 1
                    </span>
                    <h4 className="text-base font-extrabold text-forest mt-0.5">
                      What if I pay an extra amount every month?
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-forest mb-2 flex justify-between">
                      Extra Monthly Contribution
                      <span className="text-primary dark:text-emerald-400 font-bold">+₹{whatIfExtraEmi.toLocaleString('en-IN')}/mo</span>
                    </label>
                    <div className="flex gap-2">
                      {[1000, 2000, 3000, 5000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setWhatIfExtraEmi(amt)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            whatIfExtraEmi === amt
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-surface border border-border-subtle text-text-secondary hover:text-forest dark:hover:text-white'
                          }`}
                        >
                          +₹{amt / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-surface border border-border-subtle">
                      <p className="text-[11px] font-bold text-text-secondary uppercase">Interest Saved</p>
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ₹{whatIfResult.interestSavedFromExtraEmi.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-text-secondary">Direct savings</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface border border-border-subtle">
                      <p className="text-[11px] font-bold text-text-secondary uppercase">Debt-Free Faster</p>
                      <p className="text-lg font-black text-forest mt-0.5">
                        {whatIfResult.monthsSaved} Months
                      </p>
                      <p className="text-[10px] text-text-secondary">Saved off loan term</p>
                    </div>
                  </div>
                </div>

                {/* Scenario 2: Shorter Tenure Selection */}
                <div className="p-6 rounded-2xl bg-surface-subtle/60 border border-border-subtle space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                      Scenario 2
                    </span>
                    <h4 className="text-base font-extrabold text-forest mt-0.5">
                      What if I choose a shorter tenure?
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-forest mb-2 flex justify-between">
                      Tenure Reduction
                      <span className="text-primary dark:text-emerald-400 font-bold">
                        {whatIfResult.shorterTenureYears} Years (Reduced by {whatIfTenureReduction} yr)
                      </span>
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3].filter((y) => y < selectedWhatIfLoan.tenureYears).map((y) => (
                        <button
                          key={y}
                          onClick={() => setWhatIfTenureReduction(y)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            whatIfTenureReduction === y
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-surface border border-border-subtle text-text-secondary hover:text-forest dark:hover:text-white'
                          }`}
                        >
                          -{y} Year{y > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-surface border border-border-subtle">
                      <p className="text-[11px] font-bold text-text-secondary uppercase">Interest Saved</p>
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ₹{whatIfResult.interestSavedFromShorterTenure.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-text-secondary">Over entire loan</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface border border-border-subtle">
                      <p className="text-[11px] font-bold text-text-secondary uppercase">New Monthly EMI</p>
                      <p className="text-lg font-black text-forest mt-0.5">
                        ₹{whatIfResult.shorterTenureEmi.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        (+₹{whatIfResult.emiIncreaseForShorterTenure.toLocaleString('en-IN')}/mo)
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* F. Final Action Summary Bar */}
          <div className="p-6 rounded-3xl bg-surface border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-primary dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-forest">Ready to apply or check pre-approval?</h4>
                <p className="text-xs text-text-secondary font-medium">
                  Run a complete AI risk simulation to confirm bank eligibility.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 sm:flex-none px-5 py-3 rounded-full border border-border-subtle text-forest dark:text-emerald-100 hover:bg-surface-subtle font-bold text-xs transition-all cursor-pointer text-center"
              >
                Compare Again
              </button>
              <Link
                to="/dashboard/loan"
                className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition-all hover-lift flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Apply for Loan <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CompareLoansPage;
