from decimal import Decimal
from typing import Dict, Any, List
from loans.models import Bank


class BankRecommender:
    """
    Purely rule-based Home Loan Recommendation Engine using Django ORM and Python.
    Never uses Machine Learning for ranking or recommending banks.
    """

    @staticmethod
    def recommend_banks(application_data: Dict[str, Any], top_n: int = 3) -> List[Dict[str, Any]]:
        """
        Filters eligible banks and ranks the Top N recommendations based on normalized scoring.
        
        Args:
            application_data: Dictionary containing applicant financial data.
            top_n: Maximum number of bank recommendations to return (default 3).
            
        Returns:
            List of dictionaries representing recommended banks sorted by recommendation_score DESC.
        """
        # Extract applicant details safely
        try:
            applicant_income = Decimal(str(application_data.get('applicant_income', 0.0) or 0.0))
        except (ValueError, TypeError):
            applicant_income = Decimal('0.0')

        try:
            loan_amount = Decimal(str(application_data.get('loan_amount', 0.0) or 0.0))
        except (ValueError, TypeError):
            loan_amount = Decimal('0.0')

        try:
            credit_history = float(application_data.get('credit_history', 1.0) or 1.0)
        except (ValueError, TypeError):
            credit_history = 1.0

        loan_type = str(application_data.get('loan_type', 'home')).lower()

        # Step 1: Load active banks matching the requested loan type
        active_banks = Bank.objects.filter(is_active=True, loan_type=loan_type)

        # Step 2: Filter Eligible Banks
        eligible_banks = []
        for bank in active_banks:
            # Check basic financial criteria
            if applicant_income >= bank.minimum_income and loan_amount <= bank.maximum_loan_amount:
                eligible_banks.append(bank)

        if not eligible_banks:
            return []

        # Step 3: Recommendation Scoring across eligible banks
        # Extract min and max bounds across eligible banks for min-max normalization
        rates = [float(b.interest_rate) for b in eligible_banks]
        fees = [float(b.processing_fee) for b in eligible_banks]
        max_amounts = [float(b.maximum_loan_amount) for b in eligible_banks]

        min_rate, max_rate = min(rates), max(rates)
        min_fee, max_fee = min(fees), max(fees)
        min_amt, max_amt = min(max_amounts), max(max_amounts)

        # Calculate raw eligibility margins for each bank
        # Margin = (income / min_income) + (max_loan_amount / loan_amount)
        raw_margins = []
        for b in eligible_banks:
            min_inc_float = float(b.minimum_income) if b.minimum_income > 0 else 1.0
            loan_amt_float = float(loan_amount) if loan_amount > 0 else 1.0
            
            inc_ratio = float(applicant_income) / min_inc_float
            amt_ratio = float(b.maximum_loan_amount) / loan_amt_float
            margin = inc_ratio + amt_ratio
            
            # Use credit_history only as an additional eligibility signal without numerical comparison
            if credit_history >= 1.0:
                margin *= 1.10 # 10% margin boost for good credit profile
            raw_margins.append(margin)

        min_margin, max_margin = min(raw_margins), max(raw_margins)

        scored_banks = []
        for i, b in enumerate(eligible_banks):
            rate_val = float(b.interest_rate)
            fee_val = float(b.processing_fee)
            amt_val = float(b.maximum_loan_amount)
            margin_val = raw_margins[i]

            # 40% Lowest Interest Rate (lower is better)
            if max_rate == min_rate:
                s_rate = 1.0
            else:
                s_rate = (max_rate - rate_val) / (max_rate - min_rate)

            # 25% Lowest Processing Fee (lower is better)
            if max_fee == min_fee:
                s_fee = 1.0
            else:
                s_fee = (max_fee - fee_val) / (max_fee - min_fee)

            # 20% Higher Maximum Loan Amount (higher is better)
            if max_amt == min_amt:
                s_amt = 1.0
            else:
                s_amt = (amt_val - min_amt) / (max_amt - min_amt)

            # 15% Eligibility Margin (higher is better)
            if max_margin == min_margin:
                s_margin = 1.0
            else:
                s_margin = (margin_val - min_margin) / (max_margin - min_margin)

            # Weighted combination normalized to 0 - 100 scale
            base_score = (0.40 * s_rate + 0.25 * s_fee + 0.20 * s_amt + 0.15 * s_margin) * 100.0
            score = round(base_score, 1)

            # Step 5: Dynamic Recommendation Reason
            factors = {
                "Lowest interest rate": s_rate,
                "Lowest processing fee": s_fee,
                "Highest loan eligibility": s_amt,
                "Strong income eligibility": s_margin
            }
            max_factor_val = max(factors.values())
            
            if max_factor_val > 0.8 and sum(v > 0.7 for v in factors.values()) >= 3:
                reason = "Excellent overall financial match"
            elif max_factor_val < 0.5:
                reason = "Balanced loan offering"
            else:
                best_factors = [k for k, v in factors.items() if v == max_factor_val]
                if "Lowest interest rate" in best_factors:
                    reason = "Lowest interest rate"
                elif "Lowest processing fee" in best_factors:
                    reason = "Lowest processing fee"
                elif "Highest loan eligibility" in best_factors:
                    reason = "Highest loan eligibility"
                else:
                    reason = "Strong income eligibility"

            scored_banks.append({
                "bank_id": b.id,
                "bank_name": b.bank_name,
                "interest_rate": float(b.interest_rate),
                "processing_fee": float(b.processing_fee),
                "maximum_loan_amount": float(b.maximum_loan_amount),
                "recommendation_score": score,
                "recommendation_reason": reason,
            })

        if not scored_banks:
            return []

        # Step 4: Sort by recommendation_score DESC first
        scored_banks.sort(key=lambda x: x["recommendation_score"], reverse=True)
        max_score = scored_banks[0]["recommendation_score"]
        
        # Tie-breaking logic: treat scores within 2.0 of max score as equivalent
        top_tier = [b for b in scored_banks if (max_score - b["recommendation_score"]) <= 2.0]
        rest = [b for b in scored_banks if (max_score - b["recommendation_score"]) > 2.0]
        
        # Sort top tier by lower interest rate, lower processing fee, higher max loan amount
        top_tier.sort(key=lambda x: (x["interest_rate"], x["processing_fee"], -x["maximum_loan_amount"]))
        
        final_banks = top_tier + rest
        
        return final_banks[:top_n]
