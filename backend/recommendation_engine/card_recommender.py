from decimal import Decimal
from typing import Dict, Any, List
from cards.models import CreditCard

CARD_METADATA = {
    "Infinia Metal Edition": {"tier": "premium", "category": "premium"},
    "Magnus Credit Card": {"tier": "premium", "category": "travel"},
    "Regalia Gold Credit Card": {"tier": "premium", "category": "rewards"},
    "Atlas Credit Card": {"tier": "premium", "category": "travel"},
    "Sapphiro Credit Card": {"tier": "premium", "category": "travel"},
    "Eterna Credit Card": {"tier": "premium", "category": "premium"},
    "SBI Card ELITE": {"tier": "premium", "category": "travel"},

    "Millennia Credit Card": {"tier": "mid", "category": "cashback"},
    "Amazon Pay ICICI Credit Card": {"tier": "mid", "category": "cashback"},
    "SimplyCLICK SBI Card": {"tier": "mid", "category": "shopping"},
    "Flipkart Axis Bank Credit Card": {"tier": "mid", "category": "shopping"},
    "FIRST Select Credit Card": {"tier": "mid", "category": "rewards"},
    "Legend Credit Card": {"tier": "mid", "category": "rewards"},
    "Zen Signature Credit Card": {"tier": "mid", "category": "rewards"},
    "RuPay Select Credit Card": {"tier": "mid", "category": "cashback"},

    "Standard Credit Card": {"tier": "entry", "category": "rewards"},
    "Platinum RuPay Credit Card": {"tier": "entry", "category": "cashback"},
    "FIRST Millennia Credit Card": {"tier": "entry", "category": "student"},
    "SimplySAVE SBI Card": {"tier": "entry", "category": "cashback"},
}

class CardRecommender:
    """
    Purely rule-based Credit Card Recommendation Engine using Django ORM and Python.
    Never uses Machine Learning for ranking or recommending credit cards.
    """

    @staticmethod
    def recommend_cards(application_data: Dict[str, Any], top_n: int = 5) -> Dict[str, Any]:
        try:
            annual_income = float(application_data.get('annual_income', 0.0) or 0.0)
        except (ValueError, TypeError):
            annual_income = 0.0

        try:
            credit_score = int(application_data.get('credit_score', 650) or 650)
        except (ValueError, TypeError):
            credit_score = 650
            
        try:
            bank_balance = float(application_data.get('bank_balance', 0.0) or 0.0)
        except (ValueError, TypeError):
            bank_balance = 0.0
            
        try:
            total_debt = float(application_data.get('total_debt', 0.0) or 0.0)
        except (ValueError, TypeError):
            total_debt = 0.0

        try:
            existing_cards = int(application_data.get('existing_credit_cards', 0) or 0)
        except (ValueError, TypeError):
            existing_cards = 0
            
        debt_ratio = (total_debt / annual_income) if annual_income > 0 else 0.0

        # 1. Determine User Profile Tier
        if annual_income >= 2000000:
            user_tier = "premium"
            user_tier_val = 3
        elif annual_income >= 1000000:
            user_tier = "high"
            user_tier_val = 2
        elif annual_income >= 500000:
            user_tier = "mid"
            user_tier_val = 1
        else:
            user_tier = "low"
            user_tier_val = 0

        # Step 2: Load active credit cards
        active_cards = list(CreditCard.objects.filter(is_active=True))
        total_available = len(active_cards)

        # Step 3: Hard Eligibility Filtering
        eligible_cards = []
        for card in active_cards:
            if annual_income >= float(card.minimum_income) and credit_score >= card.minimum_credit_score:
                eligible_cards.append(card)

        total_eligible = len(eligible_cards)

        if not eligible_cards:
            return {
                "total_available_cards": total_available,
                "total_eligible_cards": total_eligible,
                "recommended_cards": []
            }

        # Step 4: Compute Weighted Factors (Total 100 Points)
        scored_cards_pool = []
        for c in eligible_cards:
            meta = CARD_METADATA.get(c.card_name, {"tier": "entry", "category": "rewards"})
            card_tier = meta["tier"]
            card_cat = meta["category"]
            
            card_tier_val = 2 if card_tier == "premium" else 1 if card_tier == "mid" else 0

            score = 0.0
            reasons = []

            # A. Income Fit (25 Points)
            min_inc = float(c.minimum_income) if c.minimum_income > 0 else 1.0
            inc_ratio = annual_income / min_inc
            if inc_ratio >= 1.0 and inc_ratio < 4.0:
                score += 25
                reasons.append("Perfect income match")
            elif inc_ratio >= 4.0:
                score += 10 # Overqualified
                reasons.append("Income comfortably meets requirements")
            else:
                score += 0

            # B. Credit Score Fit (25 Points)
            if credit_score >= c.minimum_credit_score + 50:
                score += 25
                reasons.append("Excellent credit score match")
            elif credit_score >= c.minimum_credit_score:
                score += 20
                reasons.append("Good credit score match")

            # C. Card Tier Match & Premium Filtering (20 Points)
            if user_tier_val >= 2 and card_tier_val == 2:
                score += 20
            elif user_tier_val == 1 and card_tier_val == 1:
                score += 20
            elif user_tier_val == 0 and card_tier_val == 0:
                score += 20
            elif user_tier_val == 2 and card_tier_val == 1:
                score += 10
            elif user_tier_val == 1 and card_tier_val == 0:
                score += 10
            elif user_tier_val == 1 and card_tier_val == 2:
                score += 10
            elif user_tier_val == 0 and card_tier_val == 1:
                score += 5
            
            # Heavy Penalties
            if user_tier_val >= 2 and credit_score >= 780 and card_tier_val == 0:
                score -= 50 # Premium users shouldn't see entry cards
            if user_tier_val == 0 and card_tier_val == 2:
                score -= 50 # Low income users shouldn't see premium cards

            # D. Reward Category Match (15 Points) + Existing Cards/Debt (15 Points)
            cat_score = 0
            if user_tier == "premium" or user_tier == "high":
                if card_cat in ["premium", "travel"]: cat_score += 15; reasons.append("Matches premium lifestyle")
                elif card_cat == "rewards": cat_score += 10; reasons.append("Strong premium rewards")
                if card_cat in ["student", "entry"]: cat_score -= 20
            elif user_tier == "mid":
                if card_cat in ["cashback", "shopping"]: cat_score += 15; reasons.append("Great for everyday shopping")
                elif card_cat == "rewards": cat_score += 10; reasons.append("Good everyday rewards")
            elif user_tier == "low":
                if card_cat in ["cashback", "student"]: cat_score += 15; reasons.append("Excellent for savings & building credit")
                elif card_cat == "rewards": cat_score += 10
                
            if existing_cards == 0:
                if card_cat in ["student", "cashback", "rewards"] and card_tier_val == 0:
                    cat_score += 10
                    reasons.append("Great first card")
            elif existing_cards >= 2:
                if card_cat in ["premium", "travel"]:
                    cat_score += 10
                    reasons.append("Excellent addition for frequent travellers")

            if bank_balance > 500000 and card_tier_val == 2:
                cat_score += 5
                
            if debt_ratio > 0.3:
                if card_tier_val == 2: cat_score -= 15
                if card_cat == "cashback": cat_score += 10; reasons.append("Helps save money with cashback")
                
            score += min(max(cat_score, -20), 30)

            # Keep score realistically bounded
            final_score = round(min(max(score, 40.0), 99.0))
            
            # Savings Heuristic
            fee_annual = float(c.annual_fee)
            assumed_spend = min(annual_income * 0.20, 1000000)
            multipliers = { 'cashback': 0.05, 'travel': 0.08, 'premium': 0.10, 'shopping': 0.06, 'rewards': 0.04, 'student': 0.02, 'business': 0.07 }
            mult = multipliers.get(card_cat, 0.03)
            raw_savings = assumed_spend * mult
            estimated_savings = max(round((raw_savings - fee_annual) / 100) * 100, 500)

            # Limit reasons
            ai_reasons = list(dict.fromkeys(reasons))[:4] # deduplicate and limit
            
            scored_cards_pool.append({
                "card_id": c.id,
                "bank_name": c.bank_name,
                "card_name": c.card_name,
                "annual_fee": fee_annual,
                "joining_fee": float(c.joining_fee),
                "reward_type": c.reward_type or "Rewards",
                "category": card_cat, # use metadata category for frontend badge
                "benefits": c.benefits if c.benefits else [],
                "image_url": c.image if c.image else None,
                "recommendation_score": final_score,
                "estimated_savings": estimated_savings,
                "ai_reasons": ai_reasons,
                "best_for": card_cat.capitalize(),
                "minimum_income": float(c.minimum_income),
                "minimum_credit_score": c.minimum_credit_score,
                "internal_cat": card_cat
            })

        # Sort pool by score descending
        scored_cards_pool.sort(key=lambda x: x["recommendation_score"], reverse=True)

        # Step 5: Diversity Rule & Final Selection
        final_selection = []
        category_counts = {}

        for card in scored_cards_pool:
            if len(final_selection) >= top_n:
                break
                
            cat = card["internal_cat"]
            
            # Apply diversity penalty if this category is already heavily represented
            if category_counts.get(cat, 0) >= 2:
                card["recommendation_score"] = max(40, card["recommendation_score"] - 15)
                
            final_selection.append(card)
            category_counts[cat] = category_counts.get(cat, 0) + 1
            
        # Re-sort final selection just in case diversity penalties changed the order
        final_selection.sort(key=lambda x: x["recommendation_score"], reverse=True)
        
        # Cleanup internal keys
        for card in final_selection:
            card.pop("internal_cat", None)

        return {
            "total_available_cards": total_available,
            "total_eligible_cards": total_eligible,
            "recommended_cards": final_selection
        }
