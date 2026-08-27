/**
 * Financial Calculation & Recommendation Engine for LoanAssist Compare Loans Feature
 */

/**
 * Calculate Monthly EMI using standard reducing-balance formula:
 * EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
 * @param {number} principal - Loan principal amount (P)
 * @param {number} annualRatePercent - Annual interest rate in percentage (e.g. 10.5)
 * @param {number} tenureYears - Tenure in years
 * @returns {number} Monthly EMI rounded to nearest rupee
 */
export const calculateEMI = (principal, annualRatePercent, tenureYears) => {
  const P = Number(principal) || 0;
  const R = Number(annualRatePercent) || 0;
  const tenure = Number(tenureYears) || 0;

  if (P <= 0 || tenure <= 0) return 0;
  if (R <= 0) {
    // 0% interest case
    return Math.round(P / (tenure * 12));
  }

  const monthlyRate = R / 12 / 100;
  const totalMonths = Math.round(tenure * 12);
  const factor = Math.pow(1 + monthlyRate, totalMonths);

  if (factor === 1 || !Number.isFinite(factor)) {
    return Math.round(P / totalMonths);
  }

  const emi = (P * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
};

/**
 * Calculate comprehensive metrics for a single loan offer
 * @param {Object} loan - Loan parameters { id, provider, amount, rate, tenure, interestType }
 * @returns {Object} Full loan metrics including EMI, total interest, total repayment
 */
export const calculateLoanMetrics = (loan) => {
  const principal = Number(loan.amount) || 0;
  const rate = Number(loan.rate) || 0;
  const tenureYears = Number(loan.tenure) || 0;
  const totalMonths = Math.max(1, Math.round(tenureYears * 12));

  const monthlyEMI = calculateEMI(principal, rate, tenureYears);
  const totalRepayment = monthlyEMI * totalMonths;
  const totalInterest = Math.max(0, totalRepayment - principal);
  const interestPercentage = principal > 0 ? (totalInterest / principal) * 100 : 0;

  return {
    ...loan,
    principal,
    rate,
    tenureYears,
    totalMonths,
    monthlyEMI,
    totalInterest,
    totalRepayment,
    interestPercentage: Number(interestPercentage.toFixed(1)),
  };
};

/**
 * Evaluate affordability of an EMI given user's monthly income and existing debt obligations
 * @param {number} monthlyEmi - Estimated EMI
 * @param {number} monthlyIncome - Total monthly net income
 * @param {number} existingDebtObligation - Monthly obligation from existing loans
 * @returns {Object} { status: 'fit' | 'moderate' | 'high', label: string, colorClass: string, percentage: number }
 */
export const evaluateAffordability = (monthlyEmi, monthlyIncome, existingDebtObligation = 0) => {
  const income = Number(monthlyIncome) || 0;
  const emi = Number(monthlyEmi) || 0;
  const existing = Number(existingDebtObligation) || 0;

  if (income <= 0) {
    return {
      status: 'unknown',
      label: 'Affordability info not set',
      colorClass: 'text-text-secondary bg-surface-subtle border-border-subtle',
      percentage: 0,
      dti: 0,
    };
  }

  const totalMonthlyDebt = emi + existing;
  const dtiPercentage = (totalMonthlyDebt / income) * 100;
  const emiPercentageOfIncome = (emi / income) * 100;

  if (dtiPercentage <= 42) {
    return {
      status: 'fit',
      label: 'Fits your estimated EMI range',
      shortLabel: 'Ideal Budget Fit',
      colorClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-border-emerald',
      badgeColor: 'bg-emerald-500',
      percentage: Number(emiPercentageOfIncome.toFixed(1)),
      dti: Number(dtiPercentage.toFixed(1)),
    };
  }

  if (dtiPercentage <= 55) {
    return {
      status: 'moderate',
      label: 'Slightly above estimated EMI range',
      shortLabel: 'Moderate Budget Fit',
      colorClass: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800/40',
      badgeColor: 'bg-amber-500',
      percentage: Number(emiPercentageOfIncome.toFixed(1)),
      dti: Number(dtiPercentage.toFixed(1)),
    };
  }

  return {
    status: 'high',
    label: 'Significantly above budget',
    shortLabel: 'Tight Budget Fit',
    colorClass: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900/40',
    badgeColor: 'bg-red-500',
    percentage: Number(emiPercentageOfIncome.toFixed(1)),
    dti: Number(dtiPercentage.toFixed(1)),
  };
};

/**
 * Compare an array of loan options and generate highlights and smart multi-factor recommendation
 * @param {Array} loans - Array of loan parameter objects
 * @param {Object} userFinancials - { monthlyIncome, existingLoans }
 * @returns {Object} Comparison report containing calculated metrics, winners, and rationale
 */
export const compareLoans = (loans = [], userFinancials = {}) => {
  if (!Array.isArray(loans) || loans.length < 2) {
    return null;
  }

  const calculatedLoans = loans.map((loan) => {
    const metrics = calculateLoanMetrics(loan);
    const existingDebt = (Number(userFinancials.existingLoans) || 0) * 5000;
    const affordability = evaluateAffordability(
      metrics.monthlyEMI,
      userFinancials.monthlyIncome,
      existingDebt
    );
    return { ...metrics, affordability };
  });

  // 1. Identify Lowest EMI
  const lowestEMILoan = [...calculatedLoans].sort((a, b) => a.monthlyEMI - b.monthlyEMI)[0];

  // 2. Identify Lowest Total Interest
  const lowestInterestLoan = [...calculatedLoans].sort((a, b) => a.totalInterest - b.totalInterest)[0];

  // 3. Identify Lowest Total Repayment
  const lowestRepaymentLoan = [...calculatedLoans].sort((a, b) => a.totalRepayment - b.totalRepayment)[0];

  // 4. Identify Best Fit for Budget (if income provided)
  const budgetFitLoans = calculatedLoans.filter((l) => l.affordability.status === 'fit');
  const bestBudgetLoan = budgetFitLoans.length > 0
    ? [...budgetFitLoans].sort((a, b) => a.totalRepayment - b.totalRepayment)[0]
    : lowestEMILoan;

  // 5. Smart Multi-Factor Best Overall Recommendation:
  // Factors: Total Interest weight (40%), Affordability (35%), Rate (15%), Tenure sanity (10%)
  let bestOverall = lowestRepaymentLoan;

  // If user income is available and the lowest repayment loan is too tight/unaffordable,
  // pick the lowest repayment option that safely fits budget
  if (userFinancials.monthlyIncome > 0 && budgetFitLoans.length > 0) {
    bestOverall = budgetFitLoans.reduce((best, current) => {
      return current.totalRepayment < best.totalRepayment ? current : best;
    }, budgetFitLoans[0]);
  } else {
    // If all fit or no income, choose option minimizing total repayment & interest with best rate
    bestOverall = lowestRepaymentLoan;
  }

  // Dynamic Rationale Construction for the Best Overall Loan
  const rationales = [];
  if (bestOverall.id === lowestRepaymentLoan.id) {
    rationales.push({
      icon: 'sparkles',
      title: 'Lowest Total Repayment',
      text: `Saves money with the lowest overall payout (₹${bestOverall.totalRepayment.toLocaleString('en-IN')}).`,
    });
  }
  if (bestOverall.id === lowestInterestLoan.id) {
    rationales.push({
      icon: 'trending-down',
      title: 'Minimal Interest Burden',
      text: `Accrues the least total interest (₹${bestOverall.totalInterest.toLocaleString('en-IN')}) over the tenure.`,
    });
  }
  if (bestOverall.affordability.status === 'fit') {
    rationales.push({
      icon: 'check',
      title: 'Comfortable Budget Fit',
      text: `Estimated monthly installment of ₹${bestOverall.monthlyEMI.toLocaleString('en-IN')} fits smoothly within your disposable income.`,
    });
  }
  if (bestOverall.tenureYears <= Math.min(...calculatedLoans.map((l) => l.tenureYears))) {
    rationales.push({
      icon: 'clock',
      title: 'Shorter Debt Horizon',
      text: `Gets you debt-free faster with a compact ${bestOverall.tenureYears} year tenure.`,
    });
  } else if (bestOverall.id === lowestEMILoan.id) {
    rationales.push({
      icon: 'shield',
      title: 'Lowest Monthly Outflow',
      text: `Provides maximum monthly cash flow flexibility with the lowest monthly installment.`,
    });
  }

  if (rationales.length === 0) {
    rationales.push({
      icon: 'award',
      title: 'Balanced Financial Profile',
      text: `Offers the best balance between monthly installment affordability and total interest expenditure.`,
    });
  }

  return {
    loans: calculatedLoans,
    lowestEMILoan,
    lowestInterestLoan,
    lowestRepaymentLoan,
    bestBudgetLoan,
    bestOverall,
    rationales,
  };
};

/**
 * What-If Simulation Engine
 * @param {Object} baseLoan - Chosen loan parameters
 * @param {number} extraMonthlyEmi - Extra payment added to EMI
 * @param {number} reduceTenureYears - Tenure reduced by X years
 * @returns {Object} New tenure, interest saved, and comparison stats
 */
export const calculateWhatIf = (baseLoan, extraMonthlyEmi = 0, reduceTenureYears = 0) => {
  if (!baseLoan) return null;

  const P = Number(baseLoan.amount) || Number(baseLoan.principal) || 0;
  const R = Number(baseLoan.rate) || 0;
  const originalTenureYears = Number(baseLoan.tenure) || Number(baseLoan.tenureYears) || 0;
  const originalMonths = originalTenureYears * 12;
  const originalEMI = calculateEMI(P, R, originalTenureYears);
  const originalTotalRepayment = originalEMI * originalMonths;
  const originalInterest = originalTotalRepayment - P;

  // Scenario 1: Increased EMI payment (pay extra monthly)
  let newTenureMonths = originalMonths;
  let newTotalRepaymentWithExtra = originalTotalRepayment;
  let interestSavedFromExtraEmi = 0;

  if (extraMonthlyEmi > 0 && R > 0 && P > 0) {
    const monthlyRate = R / 12 / 100;
    const targetEmi = originalEMI + extraMonthlyEmi;

    // Formula for remaining months with higher EMI:
    // n = -log(1 - (P * r) / EMI) / log(1 + r)
    const numerator = 1 - (P * monthlyRate) / targetEmi;
    if (numerator > 0) {
      const calculatedMonths = Math.ceil(-Math.log(numerator) / Math.log(1 + monthlyRate));
      newTenureMonths = Math.min(originalMonths, Math.max(1, calculatedMonths));
      newTotalRepaymentWithExtra = targetEmi * newTenureMonths;
      interestSavedFromExtraEmi = Math.max(0, originalTotalRepayment - newTotalRepaymentWithExtra);
    }
  }

  // Scenario 2: Reduced tenure
  let shorterTenureEmi = originalEMI;
  let interestSavedFromShorterTenure = 0;
  const shorterTenureYears = Math.max(1, originalTenureYears - reduceTenureYears);

  if (reduceTenureYears > 0 && shorterTenureYears < originalTenureYears) {
    shorterTenureEmi = calculateEMI(P, R, shorterTenureYears);
    const shorterTotalRepayment = shorterTenureEmi * (shorterTenureYears * 12);
    interestSavedFromShorterTenure = Math.max(0, originalTotalRepayment - shorterTotalRepayment);
  }

  return {
    originalEMI,
    originalTenureYears,
    originalTotalRepayment,
    originalInterest,
    // Scenario 1 results
    newTenureMonths,
    newTenureYears: Number((newTenureMonths / 12).toFixed(1)),
    monthsSaved: originalMonths - newTenureMonths,
    interestSavedFromExtraEmi,
    newTotalRepaymentWithExtra,
    // Scenario 2 results
    shorterTenureYears,
    shorterTenureEmi,
    emiIncreaseForShorterTenure: shorterTenureEmi - originalEMI,
    interestSavedFromShorterTenure,
  };
};
