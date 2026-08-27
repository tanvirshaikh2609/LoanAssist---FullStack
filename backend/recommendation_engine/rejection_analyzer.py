from typing import Dict, Any, List

class RejectionAnalyzer:
    """
    Rule-based engine to determine reasons for loan or credit card rejection.
    Does not use ML.
    """

    @staticmethod
    def analyze_home_loan_rejection(data: Dict[str, Any]) -> List[str]:
        reasons = []
        
        # Safely parse data
        try:
            income = float(data.get('applicant_income', 0.0) or 0.0)
        except (ValueError, TypeError):
            income = 0.0

        try:
            credit_history = float(data.get('credit_history', 1.0) or 1.0)
        except (ValueError, TypeError):
            credit_history = 1.0

        try:
            debt_ratio = float(data.get('debt_ratio', 0.0) or 0.0)
        except (ValueError, TypeError):
            debt_ratio = 0.0

        try:
            existing_loans = int(data.get('existing_loans', 0) or 0)
        except (ValueError, TypeError):
            existing_loans = 0

        try:
            savings = float(data.get('savings', 0.0) or 0.0)
        except (ValueError, TypeError):
            savings = 0.0

        try:
            loan_amount = float(data.get('loan_amount', 0.0) or 0.0)
        except (ValueError, TypeError):
            loan_amount = 0.0

        # Apply rules
        if credit_history < 1.0:
            reasons.append("Poor credit history")
            
        if (debt_ratio > 0.4 and debt_ratio < 10.0) or debt_ratio >= 40.0:
            reasons.append("High debt-to-income ratio")
            
        if existing_loans >= 2:
            reasons.append("Existing financial obligations are already high")
            
        if loan_amount > 0 and savings < (loan_amount * 0.1):
            reasons.append("Savings are insufficient for this loan amount")
            
        if income > 0 and loan_amount > (income * 60):
            reasons.append("Requested loan amount is too high compared to current income")
            
        if loan_amount > 0 and income > 0 and (loan_amount / income) > 80:
            reasons.append("Applicant income is too low for requested loan amount")

        if not reasons:
            reasons.append("Overall financial profile does not meet minimum eligibility criteria")

        return reasons

    @staticmethod
    def analyze_credit_card_rejection(data: Dict[str, Any]) -> List[str]:
        reasons = []
        
        try:
            income = float(data.get('annual_income', 0.0) or 0.0)
        except (ValueError, TypeError):
            income = 0.0

        try:
            credit_score = int(data.get('credit_score', 0) or 0)
        except (ValueError, TypeError):
            credit_score = 0

        try:
            total_debt = float(data.get('total_debt', 0.0) or 0.0)
        except (ValueError, TypeError):
            total_debt = 0.0

        try:
            bank_balance = float(data.get('bank_balance', 0.0) or 0.0)
        except (ValueError, TypeError):
            bank_balance = 0.0

        try:
            existing_cards = int(data.get('existing_credit_cards', 0) or 0)
        except (ValueError, TypeError):
            existing_cards = 0

        # Apply rules
        if credit_score > 0 and credit_score < 650:
            reasons.append("Credit score does not meet the minimum requirement")
            
        if income > 0 and total_debt > (income * 0.4):
            reasons.append("High outstanding debt relative to annual income")
            
        if bank_balance < 10000:
            reasons.append("Average bank balance is lower than required")
            
        if existing_cards >= 3:
            reasons.append("Too many existing active credit cards")
            
        if income < 300000 and (total_debt > income * 0.2 or existing_cards >= 2):
            reasons.append("Annual income is not sufficient to support additional credit lines")
        elif income < 150000:
            reasons.append("Annual income does not meet the minimum eligibility criteria")

        if not reasons:
            reasons.append("Overall financial profile does not meet minimum eligibility criteria")

        return reasons
