import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, RotateCcw, X, CreditCard as CardIcon, SlidersHorizontal, Sparkles } from 'lucide-react';
import { getCardCatalog } from '../../api/cards';
import { motion, AnimatePresence } from 'framer-motion';
import CreditCardCard from '../shared/CreditCardCard';

const CATEGORIES = ['All', 'Cashback', 'Travel', 'Shopping', 'Premium', 'Student', 'Rewards', 'Lifetime Free'];

const BANK_OPTIONS = [
  'All',
  'HDFC Bank',
  'SBI Card',
  'ICICI Bank',
  'Axis Bank',
  'IDFC FIRST Bank',
  'Bank of Baroda',
  'IndusInd Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Union Bank of India',
  'Canara Bank',
];

const ExploreAllCards = ({ onViewDetails, onCompare, isCompareDisabled }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBank, setSelectedBank] = useState('All');
  const [feeFilter, setFeeFilter] = useState('all');
  const [creditScoreFilter, setCreditScoreFilter] = useState('all');
  const [minIncomeFilter, setMinIncomeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lowest_fee');

  // Load catalog on component mount
  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getCardCatalog();
      setCatalog(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load card catalog:', err);
      setError('Unable to load card catalog. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset all filters
  const handleClearAllFilters = () => {
    setSearchTerm('');
    setActiveCategory('All');
    setSelectedBank('All');
    setFeeFilter('all');
    setCreditScoreFilter('all');
    setMinIncomeFilter('all');
    setSortBy('lowest_fee');
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim() !== '') count++;
    if (activeCategory !== 'All') count++;
    if (selectedBank !== 'All') count++;
    if (feeFilter !== 'all') count++;
    if (creditScoreFilter !== 'all') count++;
    if (minIncomeFilter !== 'all') count++;
    return count;
  }, [searchTerm, activeCategory, selectedBank, feeFilter, creditScoreFilter, minIncomeFilter]);

  // Comprehensive, robust filtering logic
  const filteredCards = useMemo(() => {
    if (!catalog || catalog.length === 0) return [];

    return catalog.filter((card) => {
      // 1. Search Query Filter (Searches card_name, bank_name, reward_type, category, benefits)
      if (searchTerm.trim() !== '') {
        const term = searchTerm.trim().toLowerCase();
        const cardName = (card.card_name || '').toLowerCase();
        const bankName = (card.bank_name || '').toLowerCase();
        const rewardType = (card.reward_type || '').toLowerCase();
        const category = (card.category || '').toLowerCase();
        const benefitsStr = Array.isArray(card.benefits) ? card.benefits.join(' ').toLowerCase() : '';

        const matchesSearch =
          cardName.includes(term) ||
          bankName.includes(term) ||
          rewardType.includes(term) ||
          category.includes(term) ||
          benefitsStr.includes(term);

        if (!matchesSearch) return false;
      }

      // 2. Category Filter
      if (activeCategory !== 'All') {
        const cardCat = (card.category || '').toLowerCase();
        const cardName = (card.card_name || '').toLowerCase();
        const fee = Number(card.annual_fee) || 0;

        if (activeCategory === 'Lifetime Free') {
          if (fee !== 0) return false;
        } else if (activeCategory.toLowerCase() === 'shopping') {
          const isShopping =
            cardCat === 'shopping' ||
            cardName.includes('flipkart') ||
            cardName.includes('simplyclick') ||
            cardName.includes('amazon');
          if (!isShopping) return false;
        } else if (activeCategory.toLowerCase() === 'cashback') {
          const isCashback = cardCat === 'cashback' || (card.reward_type || '').toLowerCase().includes('cashback');
          if (!isCashback) return false;
        } else if (activeCategory.toLowerCase() === 'travel') {
          const isTravel =
            cardCat === 'travel' ||
            (card.reward_type || '').toLowerCase().includes('miles') ||
            (card.reward_type || '').toLowerCase().includes('travel') ||
            (card.reward_type || '').toLowerCase().includes('vistara');
          if (!isTravel) return false;
        } else if (activeCategory.toLowerCase() === 'premium') {
          const isPremium = cardCat === 'premium' || fee >= 2499 || Number(card.minimum_income) >= 1200000;
          if (!isPremium) return false;
        } else if (activeCategory.toLowerCase() === 'student') {
          const isStudent = cardCat === 'student' || (cardName.includes('millennia') && cardName.includes('first'));
          if (!isStudent) return false;
        } else if (activeCategory.toLowerCase() === 'rewards') {
          const isRewards =
            cardCat === 'rewards' ||
            (card.reward_type || '').toLowerCase().includes('reward') ||
            (card.reward_type || '').toLowerCase().includes('point');
          if (!isRewards) return false;
        } else {
          if (cardCat !== activeCategory.toLowerCase()) return false;
        }
      }

      // 3. Bank Filter
      if (selectedBank !== 'All') {
        const bank = (card.bank_name || '').toLowerCase();
        if (!bank.includes(selectedBank.toLowerCase())) return false;
      }

      // 4. Annual Fee Filter
      const annualFee = Number(card.annual_fee) || 0;
      if (feeFilter === 'free') {
        if (annualFee !== 0) return false;
      } else if (feeFilter === 'under_1000') {
        if (annualFee > 1000) return false;
      } else if (feeFilter === 'under_3000') {
        if (annualFee > 3000) return false;
      } else if (feeFilter === 'premium') {
        if (annualFee < 3000) return false;
      }

      // 5. Credit Score Requirement Filter
      const minScore = Number(card.minimum_credit_score) || 600;
      if (creditScoreFilter !== 'all') {
        const targetScore = Number(creditScoreFilter);
        if (targetScore > 0 && minScore > targetScore) return false;
      }

      // 6. Minimum Income Filter
      const minInc = Number(card.minimum_income) || 0;
      if (minIncomeFilter === 'under_3l') {
        if (minInc > 300000) return false;
      } else if (minIncomeFilter === '3l_6l') {
        if (minInc < 300000 || minInc > 600000) return false;
      } else if (minIncomeFilter === '6l_12l') {
        if (minInc < 600000 || minInc > 1200000) return false;
      } else if (minIncomeFilter === 'above_12l') {
        if (minInc < 1200000) return false;
      }

      return true;
    });
  }, [catalog, searchTerm, activeCategory, selectedBank, feeFilter, creditScoreFilter, minIncomeFilter]);

  // Sorted cards
  const sortedCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => {
      const feeA = Number(a.annual_fee) || 0;
      const feeB = Number(b.annual_fee) || 0;
      const incA = Number(a.minimum_income) || 0;
      const incB = Number(b.minimum_income) || 0;
      const scoreA = Number(a.minimum_credit_score) || 0;
      const scoreB = Number(b.minimum_credit_score) || 0;

      if (sortBy === 'lowest_fee') return feeA - feeB;
      if (sortBy === 'highest_fee') return feeB - feeA;
      if (sortBy === 'min_income_asc') return incA - incB;
      if (sortBy === 'min_income_desc') return incB - incA;
      if (sortBy === 'credit_score_asc') return scoreA - scoreB;
      if (sortBy === 'name_asc') return (a.card_name || '').localeCompare(b.card_name || '');
      return 0;
    });
  }, [filteredCards, sortBy]);

  return (
    <div className="mt-20 border-t border-border-subtle pt-12">
      {/* Header with Counter and Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-border-emerald mb-2">
            <Sparkles size={13} className="text-amber-500" />
            Complete Database
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">Explore All Partner Credit Cards</h2>
          <p className="text-text-secondary text-base mt-1">
            Browse our verified repository of {catalog.length > 0 ? catalog.length : '19'} tier-ranked financial cards across major partner banks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald font-bold text-xs hover:bg-primary hover:text-white dark:hover:bg-emerald-600 transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw size={13} />
              Clear Filters ({activeFiltersCount})
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-surface border border-border-subtle hover:border-border-emerald text-forest dark:text-emerald-100 font-bold shadow-xs transition-all hover:shadow-md cursor-pointer"
          >
            {isOpen ? 'Collapse Catalog' : 'View Full Catalog'}
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} />
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Filters & Search Control Hub */}
            <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-sm mb-8 space-y-6">
              {/* Row 1: Search, Bank Selector, Sort */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Search */}
                <div className="relative md:col-span-6">
                  <Search size={18} className="absolute left-4 top-3.5 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search by card name, bank, lounge, cashback, perks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-10 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-forest"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3.5 top-3 text-text-secondary hover:text-forest dark:hover:text-white cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Bank Filter */}
                <div className="md:col-span-3">
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer text-sm font-semibold text-forest"
                  >
                    <option value="All">All Banks ({catalog.length})</option>
                    {BANK_OPTIONS.filter((b) => b !== 'All').map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div className="md:col-span-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer text-sm font-semibold text-forest"
                  >
                    <option value="lowest_fee">Lowest Annual Fee First</option>
                    <option value="highest_fee">Highest Annual Fee First</option>
                    <option value="min_income_asc">Lowest Min Income</option>
                    <option value="min_income_desc">Highest Min Income</option>
                    <option value="credit_score_asc">Lowest Credit Score</option>
                    <option value="name_asc">Card Name (A - Z)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Secondary Dropdowns (Annual Fee & Credit Score filters) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-border-subtle/60">
                {/* Annual Fee Filter */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Annual Fee
                  </label>
                  <select
                    value={feeFilter}
                    onChange={(e) => setFeeFilter(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-semibold text-forest focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="all">Any Annual Fee</option>
                    <option value="free">Lifetime Free (₹0)</option>
                    <option value="under_1000">₹1,000 or less / year</option>
                    <option value="under_3000">₹3,000 or less / year</option>
                    <option value="premium">Premium (Above ₹3,000 / year)</option>
                  </select>
                </div>

                {/* Credit Score Eligibility */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Min. Credit Score
                  </label>
                  <select
                    value={creditScoreFilter}
                    onChange={(e) => setCreditScoreFilter(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-semibold text-forest focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="all">Any Credit Score</option>
                    <option value="600">Qualifies with Score 600+</option>
                    <option value="650">Qualifies with Score 650+</option>
                    <option value="700">Qualifies with Score 700+</option>
                    <option value="740">Qualifies with Score 740+</option>
                  </select>
                </div>

                {/* Minimum Income Requirement */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Min. Annual Income
                  </label>
                  <select
                    value={minIncomeFilter}
                    onChange={(e) => setMinIncomeFilter(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-semibold text-forest focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="all">Any Annual Income</option>
                    <option value="under_3l">Under ₹3 Lakh / year</option>
                    <option value="3l_6l">₹3 Lakh - ₹6 Lakh / year</option>
                    <option value="6l_12l">₹6 Lakh - ₹12 Lakh / year</option>
                    <option value="above_12l">₹12 Lakh+ / year</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Category Pills */}
              <div className="pt-2 border-t border-border-subtle/60">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center gap-1.5 mr-2 text-text-secondary text-xs font-bold uppercase tracking-wider">
                    <Filter size={13} /> Categories:
                  </div>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-primary text-white shadow-sm shadow-primary/25'
                          : 'bg-surface-subtle border border-border-subtle text-text-secondary hover:border-border-emerald hover:text-forest dark:hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filter Chips (if any active) */}
              {activeFiltersCount > 0 && (
                <div className="pt-3 border-t border-border-subtle/60 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mr-1">
                    Active Filters:
                  </span>

                  {searchTerm && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald text-xs font-bold">
                      Search: &ldquo;{searchTerm}&rdquo;
                      <button onClick={() => setSearchTerm('')} className="hover:text-forest dark:hover:text-white">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {activeCategory !== 'All' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald text-xs font-bold">
                      Category: {activeCategory}
                      <button onClick={() => setActiveCategory('All')} className="hover:text-forest dark:hover:text-white">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {selectedBank !== 'All' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald text-xs font-bold">
                      Bank: {selectedBank}
                      <button onClick={() => setSelectedBank('All')} className="hover:text-forest dark:hover:text-white">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {feeFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald text-xs font-bold">
                      Fee: {feeFilter === 'free' ? 'Lifetime Free' : feeFilter}
                      <button onClick={() => setFeeFilter('all')} className="hover:text-forest dark:hover:text-white">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {creditScoreFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald text-xs font-bold">
                      Score: {creditScoreFilter}+
                      <button onClick={() => setCreditScoreFilter('all')} className="hover:text-forest dark:hover:text-white">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {minIncomeFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald text-xs font-bold">
                      Income: {minIncomeFilter}
                      <button onClick={() => setMinIncomeFilter('all')} className="hover:text-forest dark:hover:text-white">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={handleClearAllFilters}
                    className="text-xs font-bold text-danger hover:underline ml-2 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Results Grid / States */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-primary dark:text-emerald-400 gap-4">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="font-bold text-base text-forest">Loading full card catalogue...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center bg-danger/5 rounded-3xl border border-danger/10 p-6">
                <p className="text-danger font-semibold mb-3">{error}</p>
                <button
                  onClick={loadCatalog}
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            ) : catalog.length === 0 ? (
              <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border-subtle">
                <CardIcon className="mx-auto text-text-secondary/40 mb-3" size={40} />
                <p className="text-base text-text-secondary font-medium">No cards are currently available in the catalogue.</p>
                <button
                  onClick={loadCatalog}
                  className="mt-3 px-6 py-2 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs cursor-pointer"
                >
                  Reload Catalogue
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="font-bold text-xs uppercase tracking-wider text-text-secondary">
                    Showing <span className="text-forest font-black">{sortedCards.length}</span> of{' '}
                    <span className="text-forest font-black">{catalog.length}</span> available cards
                  </div>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleClearAllFilters}
                      className="text-xs font-bold text-primary dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> Clear all active filters
                    </button>
                  )}
                </div>

                {sortedCards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCards.map((card) => (
                      <CreditCardCard
                        key={card.id}
                        card={{ ...card, card_id: card.id, best_for: card.category }}
                        rank={null}
                        onViewDetails={onViewDetails}
                        onCompare={onCompare}
                        isCompareDisabled={isCompareDisabled}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border-subtle p-8">
                    <SlidersHorizontal className="mx-auto text-text-secondary/40 mb-3" size={36} />
                    <h3 className="text-lg font-bold text-forest mb-1">No cards match your selected filters</h3>
                    <p className="text-sm text-text-secondary max-w-md mx-auto">
                      Try removing some filters, broadening your search term, or clearing all active filters to view all {catalog.length} partner cards.
                    </p>
                    <button
                      onClick={handleClearAllFilters}
                      className="mt-5 px-7 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-all hover-lift cursor-pointer"
                    >
                      Clear All Active Filters ({activeFiltersCount})
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExploreAllCards;
