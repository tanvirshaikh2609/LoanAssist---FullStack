import { motion, useInView, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import Footer from '../components/layout/Footer';
import heroImage from '../assets/hero-nature.jpg';
import { 
  Brain, Banknote, CreditCard as CardIcon, 
  Calculator, Activity, TrendingUp,
  ChevronDown, Quote, ShieldCheck, Sparkles,
  ArrowRight, CheckCircle2, Award, Zap,
  Compass, BarChart3, Clock, Check, Eye
} from 'lucide-react';

const fadeInStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 }
  }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } 
  }
};

// 1. HERO SECTION (Minimal, Premium, Dominant Natural Landscape with Centered Sky Typography)
const HeroSection = () => {
  const { accessToken } = useAuthStore();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], ["0px", "30px"]);

  const handleExploreScroll = (e) => {
    e.preventDefault();
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <section 
      ref={heroRef}
      id="hero" 
      className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-start items-center overflow-hidden bg-background"
    >
      {/* 1. CLEAN HERO IMAGE AS DOMINANT VISUAL FOUNDATION */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
          src={heroImage} 
          alt="Lush green mountain landscape and sunrise with clear sky" 
          style={{ y: imageY, scale: imageScale }}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full h-full object-cover object-center will-change-transform dark:brightness-90 dark:contrast-105"
        />
        
        {/* Subtle dark mode ambient tint overlay */}
        <div className="hidden dark:block absolute inset-0 bg-[#0B1510]/50 mix-blend-multiply pointer-events-none" />
      </div>

      {/* 2. MINIMAL FINTECH TYPOGRAPHY IN THE OPEN SKY AREA */}
      <motion.div 
        style={{ opacity: contentOpacity, y: contentY }}
        className="max-w-[1280px] w-full mx-auto px-6 pt-32 sm:pt-36 md:pt-40 relative z-20 text-center flex flex-col items-center"
      >
        <motion.div
          variants={fadeInStagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl flex flex-col items-center"
        >
          {/* Main Headline */}
          <motion.h1 
            variants={fadeUpVariant} 
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-[1.12] mb-5 text-balance drop-shadow-xs"
          >
            Smarter Finance. <br className="hidden sm:inline" />
            <span className="text-[#166534] dark:text-emerald-400">Better Decisions.</span>
          </motion.h1>

          {/* Minimal Supporting Text */}
          <motion.p 
            variants={fadeUpVariant} 
            className="text-base sm:text-lg md:text-xl text-[#374151] dark:text-emerald-100/90 max-w-xl mx-auto mb-8 font-medium leading-relaxed drop-shadow-xs"
          >
            AI-powered loan eligibility evaluations and intelligent financial assistance.
          </motion.p>

          {/* Action CTAs */}
          <motion.div 
            variants={fadeUpVariant} 
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
          >
            <Link 
              to={accessToken ? "/dashboard/loan" : "/register"} 
              className="px-8 py-3.5 rounded-full bg-[#2D4A22] hover:bg-[#1e3316] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base transition-all hover-lift shadow-lg shadow-[#2D4A22]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              Check Your Eligibility
              <ArrowRight size={17} />
            </Link>
            <a 
              href="#about"
              onClick={handleExploreScroll}
              className="px-7 py-3.5 rounded-full bg-white/90 hover:bg-white text-[#0D2818] hover:text-[#166534] dark:bg-white/90 dark:hover:bg-white dark:text-[#0D2818] dark:hover:text-[#166534] border border-white/60 font-bold text-base transition-all hover-lift backdrop-blur-md shadow-md cursor-pointer"
            >
              Explore Insights
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// 1.5. HERO → FINTECH TRANSITION (Smooth Horizontal Marquee)
const MarqueeTransitionSection = () => {
  const marqueeItems = [
    "AI-POWERED LOAN DECISIONS",
    "SMART CREDIT ANALYSIS",
    "PERSONALIZED FINANCIAL RECOMMENDATIONS",
    "ML-POWERED PREDICTIONS",
    "REAL-TIME ELIGIBILITY ENGINE",
    "100% BANK-AGNOSTIC DATA"
  ];

  return (
    <div className="w-full my-8 sm:my-12 md:my-14 bg-background">
      <div className="w-full bg-surface-subtle border-y border-border-subtle py-4 overflow-hidden select-none">
        <div className="flex w-max">
          <motion.div 
            className="flex items-center gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, ease: "linear", repeat: Infinity }}
          >
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <div key={index} className="flex items-center gap-8">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-text-secondary/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-emerald-400 inline-block"></span>
                  {item}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// 2. AI-POWERED LOAN INTELLIGENCE
const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { accessToken } = useAuthStore();

  return (
    <section id="about" className="py-24 sm:py-32 bg-surface border-b border-border-subtle relative overflow-hidden" ref={ref}>
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Large Typography with Progressive Text Reveal & Word Highlight */}
          <motion.div 
            className="lg:col-span-6 flex flex-col items-start"
            variants={fadeInStagger}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            {/* Pill Tag */}
            <motion.div 
              variants={fadeUpVariant}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-border-emerald text-xs font-bold uppercase tracking-widest text-primary dark:text-emerald-300 mb-6"
            >
              <Sparkles size={13} className="text-primary dark:text-emerald-400" />
              LoanAssist Intelligence
            </motion.div>

            {/* Progressive Heading Reveal with Word Highlight */}
            <motion.h2 
              variants={fadeUpVariant}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-forest tracking-tight leading-[1.12] mb-6"
            >
              Financial decisions, <br />
              <span className="relative inline-block text-primary dark:text-emerald-400">
                <span className="relative z-10">made smarter.</span>
                <motion.span 
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-1.5 left-0 right-0 h-3.5 bg-emerald-200/50 dark:bg-emerald-800/40 -z-0 origin-left rounded-sm"
                />
              </span>
            </motion.h2>

            {/* Supporting Paragraph */}
            <motion.p 
              variants={fadeUpVariant}
              className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8 font-normal"
            >
              LoanAssist uses advanced machine learning algorithms trained on verified financial risk indicators to analyze your borrowing profile. We replace guesswork with instant, data-backed loan approval predictions and tailored credit recommendations.
            </motion.p>

            {/* Staggered Checklist */}
            <motion.div variants={fadeUpVariant} className="space-y-4 mb-10 w-full">
              {[
                {
                  title: "Objective Underwriting Simulation",
                  desc: "Evaluates DTI ratios, income stability, and obligations without touching your formal bureau score."
                },
                {
                  title: "Direct Partner Bank Matching",
                  desc: "Compare exact interest rate tiers and processing fee benchmarks across 50+ lenders."
                },
                {
                  title: "Actionable Financial Health Diagnostics",
                  desc: "Receive clear step-by-step guidance to optimize eligibility before formal bank submission."
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                  transition={{ duration: 0.6, delay: 0.3 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-3.5"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-primary dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-border-emerald">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest">{item.title}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Button */}
            <motion.div variants={fadeUpVariant}>
              <Link 
                to={accessToken ? "/dashboard/loan" : "/register"}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm sm:text-base transition-all hover-lift shadow-md shadow-primary/20 cursor-pointer"
              >
                Start Free Evaluation
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT: Realistic Fintech Dashboard Composition with Sequential Stagger */}
          <motion.div 
            className="lg:col-span-6 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-emerald-500/5 rounded-[3rem] blur-2xl pointer-events-none" />

            {/* Main Realistic Dashboard Card */}
            <div className="relative bg-surface rounded-3xl sm:rounded-[2.5rem] border border-border-subtle shadow-xl p-6 sm:p-8 space-y-6">
              
              {/* Card Header (Stagger 1) */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between border-b border-border-subtle pb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-border-emerald text-primary dark:text-emerald-400 flex items-center justify-center">
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-extrabold text-text-secondary">AI Prediction Engine</h3>
                    <p className="text-sm font-black text-forest">Underwriting Diagnostic #LA-902</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Model v2.4
                </span>
              </motion.div>

              {/* Core Prediction Metric Badges (Stagger 2 & 3) */}
              <div className="grid grid-cols-2 gap-4">
                {/* 1. Approval Confidence */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col justify-between"
                >
                  <span className="text-xs uppercase tracking-wider font-bold text-text-secondary">Approval Confidence</span>
                  <div className="mt-2">
                    <AnimatedCounter 
                      value={95.4} 
                      decimals={1} 
                      suffix="%" 
                      duration={1.2}
                      className="text-3xl sm:text-4xl font-black text-primary dark:text-emerald-400"
                      wrapperClassName="flex flex-col items-start"
                    />
                    <div className="w-full bg-border-subtle h-2 rounded-full mt-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={isInView ? { width: "95.4%" } : { width: "0%" }}
                        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-primary dark:bg-emerald-400 h-full rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* 2. Risk Assessment */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col justify-between"
                >
                  <span className="text-xs uppercase tracking-wider font-bold text-text-secondary">Risk Assessment</span>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-sm font-black uppercase tracking-wider mb-1 border border-border-emerald">
                      LOW RISK
                    </span>
                    <p className="text-xs text-text-secondary font-medium mt-1">Solvency Score: 88/100</p>
                  </div>
                </motion.div>
              </div>

              {/* 3. Recommended Loan Amount (Stagger 4) */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="p-5 rounded-2xl bg-[#0D2818] dark:bg-[#132A1D] text-white border border-transparent dark:border-emerald-800/40 flex items-center justify-between shadow-xs"
              >
                <div>
                  <p className="text-xs text-emerald-200/80 font-bold uppercase tracking-wider">Recommended Loan</p>
                  <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">₹8,50,000</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-200/80 font-bold uppercase tracking-wider">Suggested Tenure</p>
                  <p className="text-sm font-bold text-emerald-300 mt-0.5">15 Years • 8.60% p.a.</p>
                </div>
              </motion.div>

              {/* 4. Diagnostic Factors (Stagger 5) */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{ duration: 0.6, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-3 gap-2 pt-1 text-center"
              >
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle">
                  <p className="text-[11px] text-text-secondary font-bold uppercase">DTI Ratio</p>
                  <p className="text-sm font-black text-forest mt-0.5">28.2%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle">
                  <p className="text-[11px] text-text-secondary font-bold uppercase">Income Score</p>
                  <p className="text-sm font-black text-primary dark:text-emerald-400 mt-0.5">Strong</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle">
                  <p className="text-[11px] text-text-secondary font-bold uppercase">Decision Speed</p>
                  <p className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">2.4 Sec</p>
                </div>
              </motion.div>

            </div>

            {/* Subtle Floating Parallax Badge 1 */}
            <motion.div 
              className="hidden sm:flex absolute -top-5 -right-5 bg-surface px-4 py-2.5 rounded-2xl border border-border-emerald shadow-lg items-center gap-2.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-7 h-7 rounded-lg bg-primary dark:bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Bank-Agnostic</p>
                <p className="text-xs font-black text-forest">50+ Lenders Ranked</p>
              </div>
            </motion.div>

            {/* Subtle Floating Parallax Badge 2 */}
            <motion.div 
              className="hidden sm:flex absolute -bottom-5 -left-5 bg-surface px-4 py-2.5 rounded-2xl border border-border-subtle shadow-lg items-center gap-2.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Processing Time</p>
                <p className="text-xs font-black text-forest">&lt; 3 Seconds Instant</p>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

// 3. HOW LOANASSIST WORKS
const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.36) {
      setActiveStep(0);
    } else if (latest < 0.72) {
      setActiveStep(1);
    } else {
      setActiveStep(2);
    }
  });

  const steps = [
    {
      num: "01",
      title: "Tell us about yourself",
      desc: "Provide essential financial parameters including monthly income, co-applicant support, existing loan obligations, and preferred borrowing amount. No lengthy documentation required.",
      previewTitle: "Step 01: Profile Input",
      previewBadge: "Data Collection",
      previewContent: (
        <div className="space-y-3">
          <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle flex justify-between items-center text-xs">
            <span className="text-text-secondary font-medium">Monthly Net Income</span>
            <span className="font-extrabold text-forest">₹1,20,000 / mo</span>
          </div>
          <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle flex justify-between items-center text-xs">
            <span className="text-text-secondary font-medium">Existing EMI Obligations</span>
            <span className="font-extrabold text-forest">₹18,000 / mo</span>
          </div>
          <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle flex justify-between items-center text-xs">
            <span className="text-text-secondary font-medium">Desired Loan Amount</span>
            <span className="font-extrabold text-primary dark:text-emerald-400">₹15,00,000</span>
          </div>
        </div>
      )
    },
    {
      num: "02",
      title: "AI analyses your profile",
      desc: "Our dual machine learning risk models evaluate your Debt-to-Income ratios, credit solvency benchmarks, and risk distribution across historical approval datasets.",
      previewTitle: "Step 02: Model Inference",
      previewBadge: "Processing v2.4",
      previewContent: (
        <div className="space-y-3">
          <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-text-secondary font-medium">Multi-Factor Risk Assessment</span>
              <span className="font-extrabold text-primary dark:text-emerald-400">Calculated (0.12)</span>
            </div>
            <div className="w-full bg-border-subtle h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "88%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-primary dark:bg-emerald-400 h-full rounded-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-surface-subtle rounded-xl border border-border-subtle text-center">
              <p className="text-[10px] text-text-secondary uppercase font-bold">DTI Threshold</p>
              <p className="font-black text-emerald-700 dark:text-emerald-400 mt-0.5">24.5% (Optimal)</p>
            </div>
            <div className="p-2.5 bg-surface-subtle rounded-xl border border-border-subtle text-center">
              <p className="text-[10px] text-text-secondary uppercase font-bold">Credit Tier</p>
              <p className="font-black text-emerald-700 dark:text-emerald-400 mt-0.5">Prime A+</p>
            </div>
          </div>
        </div>
      )
    },
    {
      num: "03",
      title: "Get your recommendation",
      desc: "Instantly unlock your verified approval probability, interest rate rankings across 50+ banking partners, optimal EMI schedules, and top-tier credit card options.",
      previewTitle: "Step 03: Decision & Matches",
      previewBadge: "Results Ready",
      previewContent: (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-600 dark:bg-emerald-700 text-white rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-100">Status</p>
              <p className="text-sm font-black">✓ Approved (95.4% Confidence)</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-white/20 text-xs font-extrabold">Instant</span>
          </div>
          <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle flex justify-between items-center text-xs">
            <span className="text-text-secondary font-medium">Top Matched Bank</span>
            <span className="font-extrabold text-forest">HDFC Bank (8.50% p.a.)</span>
          </div>
          <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle flex justify-between items-center text-xs">
            <span className="text-text-secondary font-medium">Estimated EMI</span>
            <span className="font-extrabold text-forest">₹14,780 / month</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section ref={containerRef} id="how-it-works" className="py-24 sm:py-32 bg-background border-b border-border-subtle relative" >
      <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
          variants={fadeUpVariant}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-border-emerald mb-3 inline-block">
            Seamless Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-forest tracking-tight mb-4">
            How LoanAssist Works
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Three intelligent steps to transition from uncertainty to tailored financial clarity.
          </p>
        </motion.div>

        {/* Interactive Step-Driven Storytelling Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* LEFT: 3 Interactive Steps */}
          <div className="lg:col-span-7 relative">
            <div className="hidden sm:block absolute left-[3.25rem] top-12 bottom-12 w-0.5 bg-border-subtle z-0">
              <motion.div 
                className="w-full bg-primary dark:bg-emerald-400 origin-top"
                animate={{ 
                  height: activeStep === 0 ? '15%' : activeStep === 1 ? '55%' : '100%' 
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="space-y-5 relative z-10">
              {steps.map((step, index) => {
                const isActive = activeStep === index;
                return (
                  <motion.div
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`cursor-pointer p-6 sm:p-8 rounded-3xl border transition-all duration-400 ${
                      isActive 
                        ? 'bg-surface border-primary dark:border-emerald-400 shadow-xl shadow-primary/10 scale-[1.01]' 
                        : 'bg-surface/70 border-border-subtle hover:bg-surface hover:border-border-emerald opacity-70 hover:opacity-100'
                    }`}
                    whileHover={{ scale: isActive ? 1.01 : 1.005 }}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 transition-all duration-400 ${
                        isActive 
                          ? 'bg-primary dark:bg-emerald-600 text-white shadow-md shadow-primary/25 scale-105' 
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald'
                      }`}>
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-extrabold mb-2 transition-colors ${
                          isActive ? 'text-forest' : 'text-forest/75'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed font-normal">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Dynamic Stage Dashboard Visual */}
          <div className="lg:col-span-5">
            <div className="bg-surface rounded-3xl sm:rounded-[2.5rem] border border-border-subtle shadow-xl p-6 sm:p-8 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-text-secondary">Stage Simulation</span>
                  <h4 className="text-base font-extrabold text-forest">{steps[activeStep].previewTitle}</h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald text-xs font-bold">
                  {steps[activeStep].previewBadge}
                </span>
              </div>

              {/* Dynamic Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {steps[activeStep].previewContent}
                </motion.div>
              </AnimatePresence>

              {/* Stage Progress Bar */}
              <div className="mt-8 pt-4 border-t border-border-subtle flex items-center justify-between text-xs font-bold text-text-secondary">
                <span>Stage {activeStep + 1} of 3</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((dot) => (
                    <span 
                      key={dot} 
                      className={`h-1.5 rounded-full transition-all duration-400 ${
                        activeStep === dot ? 'w-6 bg-primary dark:bg-emerald-400' : 'w-2 bg-border-subtle'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// 4. MACHINE LEARNING PREDICTION SECTION
const PredictionShowcaseSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { accessToken } = useAuthStore();

  return (
    <section id="predictions" className="py-24 sm:py-32 bg-surface border-b border-border-subtle relative overflow-hidden" ref={ref}>
      <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Staggered Heading Reveal */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          variants={fadeInStagger}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          <motion.span 
            variants={fadeUpVariant}
            className="text-xs font-extrabold uppercase tracking-widest text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-border-emerald mb-3 inline-block"
          >
            Predictive Analytics
          </motion.span>
          <motion.h2 
            variants={fadeUpVariant}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-forest tracking-tight mb-4"
          >
            More than a prediction. <br />
            <span className="relative inline-block text-primary dark:text-emerald-400">
              <span className="relative z-10">A smarter decision.</span>
              <motion.span 
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-1 left-0 right-0 h-3 bg-emerald-200/50 dark:bg-emerald-800/40 -z-0 origin-left rounded-sm"
              />
            </span>
          </motion.h2>
          <motion.p 
            variants={fadeUpVariant}
            className="text-text-secondary text-base sm:text-lg"
          >
            Experience enterprise-grade predictive underwriting. Our algorithms provide actionable transparency behind every recommendation.
          </motion.p>
        </motion.div>

        {/* Large Realistic Fintech Dashboard */}
        <motion.div
          className="bg-surface rounded-3xl sm:rounded-[2.5rem] border border-border-subtle shadow-2xl p-6 sm:p-10 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 35 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0D2818] dark:bg-emerald-950 text-white dark:text-emerald-300 border border-transparent dark:border-emerald-800/40 flex items-center justify-center font-bold">
                <BarChart3 size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-forest">LOAN APPROVAL ANALYSIS</h3>
                <p className="text-xs text-text-secondary font-medium">Model Inference • ID: #LA-2026-984</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.span 
                initial={{ opacity: 0, scale: 0.85 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-border-emerald shadow-xs"
              >
                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> ELIGIBLE FOR LOAN
              </motion.span>
            </div>
          </div>

          {/* 4-Stat Indicator Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle"
            >
              <p className="text-xs uppercase font-bold text-text-secondary tracking-wider">Approval Confidence</p>
              <AnimatedCounter 
                value={95.4} 
                decimals={1} 
                suffix="%" 
                duration={1.4}
                className="text-3xl font-black text-primary dark:text-emerald-400 mt-1"
                wrapperClassName="flex flex-col items-start"
              />
              <p className="text-[11px] text-text-secondary mt-1 font-medium">High Probability Tier</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.6, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle"
            >
              <p className="text-xs uppercase font-bold text-text-secondary tracking-wider">Risk Assessment</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1.5">LOW RISK</p>
              <p className="text-[11px] text-text-secondary mt-1 font-medium">Score: 84 / 100</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.6, delay: 0.54, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle"
            >
              <p className="text-xs uppercase font-bold text-text-secondary tracking-wider">Income Strength</p>
              <p className="text-2xl font-black text-forest mt-1.5">STRONG</p>
              <p className="text-[11px] text-text-secondary mt-1 font-medium">Verified Stable Stream</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.6, delay: 0.66, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle"
            >
              <p className="text-xs uppercase font-bold text-text-secondary tracking-wider">Credit Profile</p>
              <p className="text-2xl font-black text-forest mt-1.5">GOOD</p>
              <p className="text-[11px] text-text-secondary mt-1 font-medium">Prime Tier Equivalent</p>
            </motion.div>
          </div>

          {/* Detailed Parameter Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-surface-subtle border border-border-subtle mb-8"
          >
            <div>
              <p className="text-xs uppercase font-bold text-text-secondary mb-1">Debt-to-Income (DTI)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-forest">28.4%</span>
                <span className="text-xs font-bold text-primary dark:text-emerald-400">(Safe Limit: 45%)</span>
              </div>
              <div className="w-full bg-border-subtle h-2 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={isInView ? { width: "28.4%" } : { width: "0%" }}
                  transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-primary dark:bg-emerald-400 h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-text-secondary mb-1">Monthly Disposable Surplus</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-forest">₹48,500</span>
                <span className="text-xs text-text-secondary font-medium">post obligations</span>
              </div>
              <p className="text-xs text-text-secondary mt-2">Sufficient buffer for monthly installments</p>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-text-secondary mb-1">Suggested Monthly EMI</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-primary dark:text-emerald-400">₹18,650</span>
                <span className="text-xs text-text-secondary font-medium">@ 8.65% p.a.</span>
              </div>
              <p className="text-xs text-text-secondary mt-2">15 Year optimized tenure</p>
            </div>
          </motion.div>

          {/* Matched Bank Offers Preview */}
          <div className="border-t border-border-subtle pt-6">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-text-secondary mb-4">Ranked Partner Lending Matches</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "HDFC Bank", details: "8.50% p.a. • 0.5% Fee", rank: "Rank 1", active: true },
                { name: "State Bank of India", details: "8.65% p.a. • Nil Fee", rank: "Rank 2", active: false },
                { name: "ICICI Bank", details: "8.75% p.a. • 0.5% Fee", rank: "Rank 3", active: false }
              ].map((bank, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ duration: 0.5, delay: 0.75 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    bank.active ? 'bg-surface border-border-emerald shadow-xs' : 'bg-surface border-border-subtle'
                  }`}
                >
                  <div>
                    <p className="font-bold text-forest text-sm">{bank.name}</p>
                    <p className={`text-xs font-semibold ${bank.active ? 'text-primary dark:text-emerald-400' : 'text-text-secondary'}`}>{bank.details}</p>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-md ${
                    bank.active ? 'text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-border-emerald' : 'text-text-secondary bg-surface-subtle'
                  }`}>{bank.rank}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 text-center pt-2"
          >
            <Link
              to={accessToken ? "/dashboard/loan" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm sm:text-base transition-all hover-lift shadow-md shadow-primary/20 cursor-pointer"
            >
              Run Your Live Assessment
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

// 5. WHY LOANASSIST
const WhyLoanAssistSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    {
      num: "01",
      title: "AI-Powered Analysis",
      desc: "Comprehensive multi-variable machine learning evaluating solvency beyond rudimentary credit scores for accurate borrowing assessment."
    },
    {
      num: "02",
      title: "Personalized Recommendations",
      desc: "Exact lender and credit card matches configured to minimize processing charges, fees, and long-term interest burden."
    },
    {
      num: "03",
      title: "Fast Predictions",
      desc: "Receive rigorous decision metrics and full affordability breakdowns in under 3 seconds without paperwork delays."
    },
    {
      num: "04",
      title: "Simple Financial Experience",
      desc: "Bank-agnostic transparency with zero spam calls, hidden fees, or biased referrals. Your financial clarity is our sole focus."
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-32 bg-background border-b border-border-subtle" ref={ref}>
      <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Large Statement Headline */}
        <motion.div 
          className="max-w-3xl mb-16 sm:mb-20"
          variants={fadeInStagger}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          <motion.span 
            variants={fadeUpVariant}
            className="text-xs font-extrabold uppercase tracking-widest text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-border-emerald mb-4 inline-block"
          >
            Why LoanAssist
          </motion.span>
          <motion.h2 
            variants={fadeUpVariant}
            className="text-3xl sm:text-5xl font-extrabold text-forest tracking-tight leading-tight"
          >
            Not just a loan calculator. <br />
            <span className="relative inline-block text-primary dark:text-emerald-400">
              <span className="relative z-10">Your intelligent financial assistant.</span>
              <motion.span 
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-1.5 left-0 right-0 h-3.5 bg-emerald-200/50 dark:bg-emerald-800/40 -z-0 origin-left rounded-sm"
              />
            </span>
          </motion.h2>
        </motion.div>

        {/* 4 Asymmetric Benefit Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((b, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7, delay: 0.2 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 sm:p-10 rounded-3xl bg-surface border border-border-subtle hover:border-border-emerald transition-all duration-300 hover-lift flex flex-col justify-between group shadow-xs"
            >
              <div>
                <span className="text-4xl sm:text-5xl font-black text-primary/20 dark:text-emerald-500/20 group-hover:text-primary/40 dark:group-hover:text-emerald-400/40 transition-colors block mb-6">
                  {b.num}
                </span>
                <h3 className="text-2xl font-extrabold text-forest mb-3">{b.title}</h3>
                <p className="text-text-secondary leading-relaxed text-sm sm:text-base font-normal">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

// 6. CARD RECOMMENDATION SECTION
const CardRecommendationSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { accessToken } = useAuthStore();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const cardParallaxY = useTransform(scrollYProgress, [0, 1], [-18, 18]);

  return (
    <section id="cards" className="py-24 sm:py-32 bg-surface border-b border-border-subtle relative overflow-hidden" ref={ref}>
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Realistic Digital Credit Card UI with Subtle Parallax */}
          <motion.div 
            className="lg:col-span-6 flex justify-center"
            style={{ y: cardParallaxY }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-full max-w-md bg-gradient-to-br from-[#0D2818] via-[#166534] to-[#0A1F13] text-white p-7 sm:p-8 rounded-[2rem] shadow-2xl border border-emerald-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top Row */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <motion.span 
                    initial={{ opacity: 0, y: -6 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-300"
                  >
                    Recommended for you
                  </motion.span>
                  <p className="text-lg font-black text-white mt-0.5">Premium Cashback Card</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-amber-300" />
                </div>
              </div>

              {/* Card Chip & Contactless Symbol */}
              <div className="flex items-center gap-3 mb-10">
                <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-500/40 shadow-xs flex items-center justify-center">
                  <div className="w-8 h-5 border border-amber-700/30 rounded-xs grid grid-cols-2 gap-0.5"></div>
                </div>
                <span className="text-emerald-200 text-xs font-mono">)))</span>
              </div>

              {/* Card Perks Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 mb-6 text-center">
                {[
                  { title: "High Rewards", val: "5% Back" },
                  { title: "Annual Fee", val: "₹0 / Free" },
                  { title: "Travel Perks", val: "8 Lounges" }
                ].map((perk, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, delay: 0.35 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className="p-2 rounded-lg bg-white/10 border border-white/10"
                  >
                    <p className="text-[10px] text-emerald-200 font-bold uppercase">{perk.title}</p>
                    <p className="text-xs font-black text-white mt-0.5">{perk.val}</p>
                  </motion.div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono text-emerald-200/80">
                <span>•••• •••• •••• 8842</span>
                <span className="font-sans font-bold text-white uppercase text-[11px] tracking-wider">Prime Member</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Editorial Card Recommendation Description */}
          <motion.div 
            className="lg:col-span-6 flex flex-col items-start"
            variants={fadeInStagger}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            <motion.div 
              variants={fadeUpVariant}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-border-emerald text-xs font-bold uppercase tracking-widest text-primary dark:text-emerald-300 mb-6"
            >
              <CardIcon size={13} className="text-primary dark:text-emerald-400" />
              Smart Card Matchmaker
            </motion.div>

            <motion.h2 
              variants={fadeUpVariant}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-forest tracking-tight leading-tight mb-6"
            >
              Credit cards tailored <br />
              <span className="relative inline-block text-primary dark:text-emerald-400">
                <span className="relative z-10">to how you spend.</span>
                <motion.span 
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-1 left-0 right-0 h-3 bg-emerald-200/50 dark:bg-emerald-800/40 -z-0 origin-left rounded-sm"
                />
              </span>
            </motion.h2>

            <motion.p 
              variants={fadeUpVariant}
              className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8 font-normal"
            >
              LoanAssist scans across 19+ tier-ranked credit cards from premier banks to match your income, spending habits, and desired perks — from airport lounge access to milestone cashback rewards.
            </motion.p>

            <motion.div variants={fadeUpVariant} className="space-y-3 mb-10 w-full">
              {[
                "Calculated annual reward value up to ₹24,000 / year",
                "Zero annual fee and fee-waiver eligibility conditions",
                "Side-by-side comparison across up to 3 cards"
              ].map((text, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -12 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                  transition={{ duration: 0.5, delay: 0.4 + idx * 0.12 }}
                  className="flex items-center gap-3 text-sm text-forest font-bold"
                >
                  <CheckCircle2 size={18} className="text-primary dark:text-emerald-400 shrink-0" />
                  <span>{text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUpVariant}>
              <Link 
                to={accessToken ? "/dashboard/cards" : "/register"}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm sm:text-base transition-all hover-lift shadow-md shadow-primary/20 cursor-pointer"
              >
                Find Matching Cards
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// 7. TRUST / STATISTICS SECTION
const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { value: 95, suffix: "%", label: "Loan Model Accuracy" },
    { value: 97, suffix: "%", label: "Card Recommendation Accuracy" },
    { value: 2, suffix: "", label: "Specialized ML Models" },
    { value: 24, suffix: "/7", label: "Smart Assistance" }
  ];

  return (
    <section id="stats" className="py-20 sm:py-24 bg-background border-b border-border-subtle relative" ref={ref}>
      <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Horizontal Connector Line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-0.5 bg-gradient-to-r from-transparent via-primary/20 dark:via-emerald-400/20 to-transparent mb-8 origin-center"
        />

        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          variants={fadeInStagger}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          {stats.map((s, index) => (
            <motion.div 
              key={index}
              variants={fadeUpVariant}
              className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-subtle shadow-xs"
            >
              <AnimatedCounter 
                value={s.value} 
                suffix={s.suffix} 
                duration={1.3}
                className="text-4xl sm:text-5xl font-black text-forest" 
                label={s.label}
                labelClassName="text-xs sm:text-sm text-text-secondary font-bold uppercase tracking-wider mt-2 block"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// 8. TESTIMONIALS SECTION
const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    { 
      quote: "LoanAssist completely changed how I evaluate credit. The AI matched me with a lifetime-free card with immense travel benefits that saved me thousands.",
      name: "Rahul Sharma", 
      role: "Software Engineer, Bengaluru" 
    },
    { 
      quote: "The financial health score was an eye-opener. The suggested debt-ratio adjustment helped me prepare, and my home loan was approved smoothly.",
      name: "Priya Desai", 
      role: "Marketing Director, Mumbai" 
    },
    { 
      quote: "I was confused by dozens of bank options. LoanAssist ranked the lowest processing fee lenders and showed exact EMI numbers within seconds.",
      name: "Arjun Reddy", 
      role: "Entrepreneur, Hyderabad" 
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-surface border-b border-border-subtle" ref={ref}>
      <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Section Header with Carousel Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-border-emerald mb-3 inline-block">
              User Experience
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-forest tracking-tight">
              Trusted by Borrowers Nationwide
            </h2>
          </motion.div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="w-11 h-11 rounded-full border border-border-subtle bg-surface hover:border-primary text-forest flex items-center justify-center shadow-xs transition-all hover-lift cursor-pointer"
            >
              <ChevronDown className="rotate-90" size={18} />
            </button>
            <button 
              onClick={handleNext}
              aria-label="Next testimonial"
              className="w-11 h-11 rounded-full border border-border-subtle bg-surface hover:border-primary text-forest flex items-center justify-center shadow-xs transition-all hover-lift cursor-pointer"
            >
              <ChevronDown className="-rotate-90" size={18} />
            </button>
          </div>
        </div>

        {/* Testimonials Grid / Carousel */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={fadeInStagger}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          {testimonials.map((t, i) => (
            <motion.div 
              key={i} 
              variants={fadeUpVariant} 
              className={`p-8 sm:p-10 rounded-3xl bg-surface-subtle border transition-all duration-300 flex flex-col justify-between ${
                currentIndex === i ? 'border-primary dark:border-emerald-400 shadow-lg bg-surface' : 'border-border-subtle'
              }`}
            >
              <div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  <Quote className="text-primary/30 dark:text-emerald-400/30 mb-6" size={36} />
                </motion.div>
                <p className="text-forest mb-8 leading-relaxed font-medium text-base">
                  "{t.quote}"
                </p>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="pt-6 border-t border-border-subtle flex items-center gap-3.5"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 font-black flex items-center justify-center text-sm border border-border-emerald">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-extrabold text-forest text-sm">{t.name}</p>
                  <p className="text-xs text-text-secondary font-medium">{t.role}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

// 9. FAQ SECTION
const FaqItem = ({ q, a, index, isInView }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-border-subtle py-6"
    >
      <button 
        className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-bold text-forest text-base sm:text-lg pr-4 group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors">{q}</span>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }} 
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-text-secondary shrink-0"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <motion.div 
        initial={false} 
        animate={{ 
          height: isOpen ? 'auto' : 0, 
          opacity: isOpen ? 1 : 0 
        }} 
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="pt-3 text-text-secondary leading-relaxed text-sm sm:text-base font-normal">{a}</p>
      </motion.div>
    </motion.div>
  );
};

const FaqSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const faqs = [
    { 
      q: "How does LoanAssist predict loan approval?", 
      a: "Our system evaluates your financial metrics — including monthly income, co-applicant support, debt obligations, savings, and credit profile — using trained machine learning models to calculate your approval probability and confidence score." 
    },
    { 
      q: "What information is required?", 
      a: "You only need basic financial information: monthly income, loan amount desired, existing loan obligations, and loan tenure. No preliminary document uploads are required." 
    },
    { 
      q: "How accurate are the predictions?", 
      a: "Our loan prediction models are calibrated on historical underwriting criteria and demonstrate 95%+ classification accuracy in estimating eligibility bands." 
    },
    { 
      q: "How does card recommendation work?", 
      a: "Credit cards are ranked based on how closely your income tier, spending categories (travel, dining, online shopping), and annual fee tolerance align with card reward structures." 
    },
    { 
      q: "Is my financial information secure?", 
      a: "Yes. We maintain strict security protocols with 256-bit encryption. Your financial evaluation inputs are never shared or sold to third-party telemarketers." 
    }
  ];

  return (
    <section id="faq" className="py-24 sm:py-32 bg-background" ref={ref}>
      <div className="max-w-[840px] mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-border-emerald mb-3 inline-block">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-forest tracking-tight mb-4">
            Clear Answers to Common Questions
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Everything you need to know about our predictive models and financial tools.
          </p>
        </motion.div>

        <div className="bg-surface rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-border-subtle shadow-sm">
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

// 10. FINAL CTA SECTION
const CtaSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { accessToken } = useAuthStore();

  return (
    <section ref={ref} id="cta" className="py-24 sm:py-32 bg-gradient-to-br from-[#0D2818] via-[#166534] to-[#0D2818] text-white relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 1.2 }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="max-w-[1280px] mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-emerald-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 mb-6 backdrop-blur-md">
            Start Your Assessment
          </span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight max-w-3xl mx-auto leading-tight"
        >
          Make your next financial decision{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-emerald-300">smarter.</span>
            <motion.span 
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-1.5 left-0 right-0 h-3.5 bg-emerald-500/30 -z-0 origin-left rounded-sm"
            />
          </span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="text-emerald-100/85 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Let machine learning help you understand your possibilities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link 
            to={accessToken ? "/dashboard/loan" : "/register"} 
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-white text-[#0D2818] hover:text-[#166534] dark:text-[#0D2818] dark:hover:text-[#166534] font-extrabold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 hover-lift shadow-lg cursor-pointer"
          >
            Check Your Eligibility →
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

// MAIN LANDING PAGE COMPONENT
const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <main className="flex-1">
        <HeroSection />
        <MarqueeTransitionSection />
        <AboutSection />
        <HowItWorksSection />
        <PredictionShowcaseSection />
        <WhyLoanAssistSection />
        <CardRecommendationSection />
        <StatsSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
