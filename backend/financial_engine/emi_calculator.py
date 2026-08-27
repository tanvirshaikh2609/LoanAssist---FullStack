class EMICalculator:
    """
    Financial Engine module for calculating Equated Monthly Installments.
    Does not use ML or Database logic.
    """

    @staticmethod
    def calculate_emi(loan_amount: float, annual_interest_rate: float, tenure_years: int) -> dict:
        """
        Calculates the monthly EMI, total interest, and total payment.

        Args:
            loan_amount: Principal loan amount.
            annual_interest_rate: Annual interest rate in percentage.
            tenure_years: Loan tenure in years.

        Returns:
            Dictionary containing EMI details.
        """
        try:
            loan_amount = float(loan_amount)
            annual_interest_rate = float(annual_interest_rate)
            tenure_years = int(tenure_years)
        except (ValueError, TypeError):
            return {}

        if loan_amount <= 0 or tenure_years <= 0:
            return {}

        if annual_interest_rate == 0:
            monthly_emi = loan_amount / (tenure_years * 12)
            total_payment = loan_amount
            total_interest = 0.0
        else:
            monthly_rate = annual_interest_rate / 12 / 100
            tenure_months = tenure_years * 12

            # EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
            math_pow = (1 + monthly_rate) ** tenure_months
            monthly_emi = loan_amount * monthly_rate * math_pow / (math_pow - 1)
            
            total_payment = monthly_emi * tenure_months
            total_interest = total_payment - loan_amount

        return {
            "monthly_emi": round(monthly_emi, 2),
            "total_interest": round(total_interest, 2),
            "total_payment": round(total_payment, 2),
            "interest_rate": annual_interest_rate,
            "tenure_years": tenure_years,
            "loan_amount": round(loan_amount, 2)
        }
