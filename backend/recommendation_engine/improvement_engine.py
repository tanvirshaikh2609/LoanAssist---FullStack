from typing import List

class ImprovementEngine:
    """
    Rule-based engine to suggest improvements based on rejection reasons.
    Does not use ML.
    """

    @staticmethod
    def generate_home_loan_improvements(rejection_reasons: List[str]) -> List[str]:
        suggestions_set = set()
        suggestions_ordered = []
        
        def add_suggestion(text: str):
            if text not in suggestions_set:
                suggestions_set.add(text)
                suggestions_ordered.append(text)

        for reason in rejection_reasons:
            if reason == "Applicant income is too low for requested loan amount":
                add_suggestion("Increase your monthly income before reapplying.")
                add_suggestion("Consider applying for a smaller loan amount that better aligns with your income.")
            elif reason == "Poor credit history":
                add_suggestion("Maintain timely repayments to improve your credit history.")
            elif reason == "High debt-to-income ratio":
                add_suggestion("Reduce your outstanding debt to improve your debt-to-income ratio.")
            elif reason == "Existing financial obligations are already high":
                add_suggestion("Pay off existing loans to lower your financial obligations.")
            elif reason == "Savings are insufficient for this loan amount":
                add_suggestion("Increase your savings to meet the required threshold for this loan amount.")
            elif reason == "Requested loan amount is too high compared to current income":
                add_suggestion("Consider applying for a smaller loan amount that better aligns with your income.")

        if not suggestions_ordered:
            add_suggestion("Consult with a financial advisor to improve overall eligibility.")
            
        return suggestions_ordered

    @staticmethod
    def generate_credit_card_improvements(rejection_reasons: List[str]) -> List[str]:
        suggestions_set = set()
        suggestions_ordered = []
        
        def add_suggestion(text: str):
            if text not in suggestions_set:
                suggestions_set.add(text)
                suggestions_ordered.append(text)
                
        for reason in rejection_reasons:
            if reason in ["Annual income is not sufficient to support additional credit lines", "Annual income does not meet the minimum eligibility criteria"]:
                add_suggestion("Increase your documented annual income.")
            elif reason == "Credit score does not meet the minimum requirement":
                add_suggestion("Work on improving your credit score by making timely payments.")
            elif reason == "High outstanding debt relative to annual income":
                add_suggestion("Reduce your outstanding debt to improve your debt-to-income ratio.")
            elif reason == "Average bank balance is lower than required":
                add_suggestion("Maintain a higher average bank balance over the coming months.")
            elif reason == "Too many existing active credit cards":
                add_suggestion("Avoid applying for multiple credit cards within a short timeframe.")

        if not suggestions_ordered:
            add_suggestion("Consult with a financial advisor to improve credit profile.")
            
        return suggestions_ordered

