import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowRight, Calculator, Sparkles } from 'lucide-react';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import { useTheme } from '../context/ThemeContext';

const EMICalculatorPage = () => {
  const [loanAmount, setLoanAmount] = useState(5000000); // 50 Lakhs default
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% default
  const [tenureYears, setTenureYears] = useState(20); // 20 years default
  const { isDark } = useTheme();

  // Calculate EMI
  const { monthlyEmi, totalPayment, totalInterest } = useMemo(() => {
    const monthlyRate = interestRate / 12 / 100;
    const tenureMonths = tenureYears * 12;
    
    let emi = 0;
    let payment = 0;
    let interest = 0;
    
    if (interestRate === 0) {
      emi = loanAmount / tenureMonths;
      payment = loanAmount;
      interest = 0;
    } else {
      const factor = Math.pow(1 + monthlyRate, tenureMonths);
      emi = (loanAmount * monthlyRate * factor) / (factor - 1);
      payment = emi * tenureMonths;
      interest = payment - loanAmount;
    }

    return {
      monthlyEmi: emi,
      totalPayment: payment,
      totalInterest: interest
    };
  }, [loanAmount, interestRate, tenureYears]);

  const pieData = [
    { name: 'Principal Amount', value: loanAmount, color: isDark ? '#22C55E' : '#166534' },
    { name: 'Total Interest', value: totalInterest, color: '#F59E0B' },
  ];

  const formatRupee = (val) => new Intl.NumberFormat('en-IN').format(val);

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="mb-10">
        <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-border-emerald mb-3">
          Interactive Financial Tool
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight mb-2 flex items-center gap-3">
          <Calculator className="text-primary dark:text-emerald-400" size={32} />
          EMI Planner & Optimizer
        </h1>
        <p className="text-text-secondary text-base max-w-2xl">
          Simulate monthly installments, compare principal vs interest distributions, and optimize your tenure before applying.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-7 bg-surface p-8 rounded-3xl border border-border-subtle shadow-sm">
          
          {/* Loan Amount Input */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-forest">Loan Amount</label>
              <div className="relative w-1/2">
                <span className="absolute left-3 top-2 text-text-secondary font-bold">₹</span>
                <input 
                  type="number"
                  min={50000}
                  max={20000000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm text-right text-forest"
                />
              </div>
            </div>
            <input 
              type="range"
              min={50000}
              max={20000000}
              step={50000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs font-semibold text-text-secondary mt-2">
              <span>₹50K</span>
              <span>₹2 Cr</span>
            </div>
          </div>

          {/* Interest Rate Input */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-forest">Interest Rate (% p.a.)</label>
              <div className="relative w-1/3">
                <input 
                  type="number"
                  min={5}
                  max={20}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full pl-3 pr-7 py-1.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm text-right text-forest"
                />
                <span className="absolute right-3 top-2 text-text-secondary font-bold text-xs">%</span>
              </div>
            </div>
            <input 
              type="range"
              min={5}
              max={20}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs font-semibold text-text-secondary mt-2">
              <span>5%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Tenure Input */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-forest">Tenure (Years)</label>
              <div className="relative w-1/3">
                <input 
                  type="number"
                  min={1}
                  max={30}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-1.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm text-right text-forest"
                />
                <span className="absolute right-3 top-2 text-text-secondary font-bold text-xs">Yrs</span>
              </div>
            </div>
            <input 
              type="range"
              min={1}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs font-semibold text-text-secondary mt-2">
              <span>1 Yr</span>
              <span>30 Yrs</span>
            </div>
          </div>

        </div>

        {/* Right Column: Results (Sticky) */}
        <div className="lg:col-span-7 sticky top-24 space-y-6">
          <div className="bg-surface rounded-3xl border border-border-subtle shadow-lg overflow-hidden relative">
            <div className="p-8 md:p-10 text-center relative z-10 border-b border-border-subtle bg-gradient-to-b from-emerald-50/60 dark:from-emerald-950/30 to-surface">
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 block">Monthly Installment (EMI)</span>
              <AnimatedCounter 
                value={monthlyEmi} 
                prefix="₹" 
                duration={0.6}
                wrapperClassName="flex flex-col items-center justify-center"
                className="text-5xl md:text-6xl font-black text-forest tracking-tight"
              />
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <AnimatedCounter 
                  value={loanAmount} 
                  label="Principal Amount" 
                  prefix="₹" 
                  duration={0.6}
                  wrapperClassName="flex flex-col items-start"
                  className="text-2xl font-black text-primary dark:text-emerald-400"
                />
                <AnimatedCounter 
                  value={totalInterest} 
                  label="Total Interest Payable" 
                  prefix="₹" 
                  duration={0.6}
                  wrapperClassName="flex flex-col items-start"
                  className="text-2xl font-black text-amber-600 dark:text-amber-400"
                />
                <AnimatedCounter 
                  value={totalPayment} 
                  label="Total Payment (Principal + Interest)" 
                  prefix="₹" 
                  duration={0.6}
                  wrapperClassName="flex flex-col items-start"
                  className="text-2xl font-black text-forest"
                />
              </div>

              <div className="h-[240px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₹${formatRupee(Math.round(value))}`}
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
              </div>
            </div>
          </div>

          <Link 
            to="/dashboard/loan" 
            state={{ prefillAmount: loanAmount }}
            className="group flex items-center justify-between bg-gradient-to-r from-emerald-50 dark:from-emerald-950/40 to-surface border border-border-emerald rounded-3xl p-6 hover:shadow-md transition-all hover-lift cursor-pointer"
          >
            <div>
              <p className="text-forest font-bold text-base flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                Check Approval for ₹{formatRupee(loanAmount)}
              </p>
              <p className="text-xs text-text-secondary mt-0.5 font-medium">Verify your exact probability and get matched bank offers</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-sm group-hover:bg-primary-dark transition-colors shrink-0">
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EMICalculatorPage;
