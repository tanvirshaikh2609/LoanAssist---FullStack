from typing import Dict, Any

class FinancialHealthAnalyzer:
    """
    Analyzes applicant data to generate a rule-based financial health score out of 100.
    Does not use ML.
    """

    @staticmethod
    def _determine_grade(score: int) -> str:
        if score >= 90:
            return "Excellent"
        elif score >= 75:
            return "Good"
        elif score >= 60:
            return "Fair"
        return "Poor"

    @staticmethod
    def analyze_loan_health(data: Dict[str, Any]) -> dict:
        score = 0
        strengths = []
        weaknesses = []
        recommendations = []

        try:
            income = float(data.get('applicant_income', 0.0) or 0.0)
            savings = float(data.get('savings', 0.0) or 0.0)
            debt_ratio = float(data.get('debt_ratio', 0.0) or 0.0)
            existing_loans = int(data.get('existing_loans', 0) or 0)
            credit_history = float(data.get('credit_history', 1.0) or 1.0)
            loan_amount = float(data.get('loan_amount', 0.0) or 0.0)
        except (ValueError, TypeError):
            income = savings = debt_ratio = credit_history = loan_amount = 0.0
            existing_loans = 0

        # 1. Applicant Income (20 points)
        if loan_amount > 0 and income >= (loan_amount / 24): # Income covers loan within 2 years
            score += 20
            strengths.append("Strong income relative to requested loan amount")
        elif loan_amount > 0 and income >= (loan_amount / 60):
            score += 10
            recommendations.append("Income is acceptable, but consider increasing it for faster repayment.")
        else:
            weaknesses.append("Income is low compared to requested loan amount")
            recommendations.append("Consider applying for a smaller loan amount.")

        # 2. Savings (20 points)
        if loan_amount > 0 and savings >= (loan_amount * 0.2):
            score += 20
            strengths.append("Excellent savings balance")
        elif loan_amount > 0 and savings >= (loan_amount * 0.05):
            score += 10
            recommendations.append("Increase your savings to provide a better financial buffer.")
        else:
            weaknesses.append("Savings are critically low")
            recommendations.append("Build a robust emergency savings fund.")

        # 3. Debt Ratio (20 points)
        if debt_ratio <= 0.2 or (debt_ratio <= 20.0 and debt_ratio > 1.0):
            score += 20
            strengths.append("Very healthy debt-to-income ratio")
        elif debt_ratio <= 0.4 or (debt_ratio <= 40.0 and debt_ratio > 1.0):
            score += 10
            recommendations.append("Maintain or lower your current debt levels.")
        else:
            weaknesses.append("High debt-to-income ratio")
            recommendations.append("Prioritize paying off high-interest debts to lower your ratio.")

        # 4. Existing Loans (20 points)
        if existing_loans == 0:
            score += 20
            strengths.append("No existing loan obligations")
        elif existing_loans == 1:
            score += 10
            recommendations.append("Avoid taking on more debt while repaying current loans.")
        else:
            weaknesses.append("Multiple existing active loans")
            recommendations.append("Focus on closing at least one active loan before applying for new credit.")

        # 5. Credit History (20 points)
        if credit_history >= 1.0:
            score += 20
            strengths.append("Strong credit history")
        else:
            weaknesses.append("Poor credit history")
            recommendations.append("Ensure timely payments on all existing accounts to rebuild credit.")

        grade = FinancialHealthAnalyzer._determine_grade(score)

        return {
            "score": score,
            "grade": grade,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": list(set(recommendations))
        }

    @staticmethod
    def analyze_card_health(data: Dict[str, Any]) -> dict:
        score = 0
        strengths = []
        weaknesses = []
        recommendations = []

        try:
            annual_income = float(data.get('annual_income', 0.0) or 0.0)
            credit_score = int(data.get('credit_score', 0) or 0)
            bank_balance = float(data.get('bank_balance', 0.0) or 0.0)
            total_debt = float(data.get('total_debt', 0.0) or 0.0)
            existing_cards = int(data.get('existing_credit_cards', 0) or 0)
        except (ValueError, TypeError):
            annual_income = bank_balance = total_debt = 0.0
            credit_score = existing_cards = 0

        # 1. Annual Income (20 points)
        if annual_income >= 500000:
            score += 20
            strengths.append("High annual income")
        elif annual_income >= 250000:
            score += 10
            recommendations.append("A higher income will qualify you for premium credit cards.")
        else:
            weaknesses.append("Low annual income")
            recommendations.append("Seek opportunities to increase primary or secondary income.")

        # 2. Credit Score (20 points)
        if credit_score >= 750:
            score += 20
            strengths.append("Excellent credit score")
        elif credit_score >= 650:
            score += 10
            recommendations.append("Maintain good habits to further boost your credit score.")
        else:
            weaknesses.append("Credit score is below average")
            recommendations.append("Pay all bills on time and lower credit utilization to improve credit score.")

        # 3. Bank Balance (20 points)
        if bank_balance >= 50000:
            score += 20
            strengths.append("Strong average bank balance")
        elif bank_balance >= 10000:
            score += 10
            recommendations.append("Grow your average bank balance to demonstrate financial stability.")
        else:
            weaknesses.append("Low bank balance")
            recommendations.append("Reduce unnecessary expenses to increase your bank balance.")

        # 4. Total Debt (20 points)
        if annual_income > 0 and (total_debt / annual_income) <= 0.15:
            score += 20
            strengths.append("Very low outstanding debt")
        elif annual_income > 0 and (total_debt / annual_income) <= 0.35:
            score += 10
            recommendations.append("Try to clear existing debts to free up more credit capacity.")
        else:
            weaknesses.append("High outstanding debt burden")
            recommendations.append("Create a strict repayment plan to eliminate existing debt.")

        # 5. Existing Credit Cards (20 points)
        if existing_cards <= 1:
            score += 20
            strengths.append("Minimal existing credit lines")
        elif existing_cards <= 3:
            score += 10
            recommendations.append("Monitor usage across your multiple cards carefully.")
        else:
            weaknesses.append("High number of existing credit cards")
            recommendations.append("Avoid applying for additional credit cards to prevent negative credit impact.")

        grade = FinancialHealthAnalyzer._determine_grade(score)

        return {
            "score": score,
            "grade": grade,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": list(set(recommendations))
        }
