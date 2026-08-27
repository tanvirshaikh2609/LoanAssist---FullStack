import { Link } from 'react-router-dom';
import { Shield, ArrowUp, CheckCircle2 } from 'lucide-react';
import Logo from '../shared/Logo';

const Footer = () => {
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer" className="bg-[#07170E] dark:bg-[#060F0A] text-white pt-20 pb-12 relative overflow-hidden border-t border-[#132A1C] dark:border-[#132A1C]">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-2.5 group w-fit cursor-pointer">
              <Logo showText={true} size="md" light={true} />
            </Link>
            <p className="text-sm text-emerald-100/70 max-w-sm leading-relaxed">
              Empowering individuals with intelligent, bank-grade financial predictions. Compare loans, match credit cards, and map your financial horizon with confidence.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-300">
                <Shield size={13} className="text-emerald-400" /> 256-Bit SSL Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-300">
                <CheckCircle2 size={13} className="text-emerald-400" /> 100% Free
              </span>
            </div>
          </div>

          {/* Product Col */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5 text-emerald-300">
              Solutions
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/dashboard/loan" className="text-emerald-100/70 hover:text-white transition-colors">
                  Loan Eligibility Prediction
                </Link>
              </li>
              <li>
                <Link to="/dashboard/cards" className="text-emerald-100/70 hover:text-white transition-colors">
                  Smart Credit Card Matching
                </Link>
              </li>
              <li>
                <Link to="/dashboard/emi-calculator" className="text-emerald-100/70 hover:text-white transition-colors">
                  Interactive EMI Planner
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-emerald-100/70 hover:text-white transition-colors">
                  Financial Health Scorecard
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5 text-emerald-300">
              Explore
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <a href="#about" className="text-emerald-100/70 hover:text-white transition-colors">
                  About LoanAssist
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-emerald-100/70 hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#predictions" className="text-emerald-100/70 hover:text-white transition-colors">
                  Predictions
                </a>
              </li>
              <li>
                <a href="#features" className="text-emerald-100/70 hover:text-white transition-colors">
                  Core Features
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-emerald-100/70 hover:text-white transition-colors">
                  User Testimonials
                </a>
              </li>
              <li>
                <a href="#faq" className="text-emerald-100/70 hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Access */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5 text-emerald-300">
              Get Started
            </h4>
            <div className="space-y-4">
              <p className="text-xs text-emerald-100/60 leading-relaxed">
                Take the guesswork out of loan and credit card approvals in under 3 minutes.
              </p>
              <Link 
                to="/register"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-900/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-100/50">
          <p>© {new Date().getFullYear()} LoanAssist. Built for modern financial clarity.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors"
            >
              Back to Top <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
