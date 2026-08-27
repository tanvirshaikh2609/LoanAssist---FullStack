from typing import Union, Dict, Any
from ml_models.predictor import predict_loan
from recommendation_engine.bank_recommender import BankRecommender
from recommendation_engine.rejection_analyzer import RejectionAnalyzer
from recommendation_engine.improvement_engine import ImprovementEngine
from financial_engine.emi_calculator import EMICalculator
from financial_engine.financial_health import FinancialHealthAnalyzer


# ---------------------------------------------------------------------------
# Affordability guardrail — FOIR (Fixed Obligation to Income Ratio) check
# ---------------------------------------------------------------------------
FOIR_LIMIT = 0.50  # EMI should not exceed 50 % of monthly income


def _apply_affordability_guardrail(result: Dict[str, Any],
                                   data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Override an ML 'Approved' prediction when the estimated EMI exceeds a
    reasonable share of the applicant's monthly income (FOIR check).

    ML rejections are never touched — only approvals are subject to this
    guardrail.
    """
    if result['prediction'] != 'Approved':
        return result  # ML rejections stand as-is

    total_income = (
        float(data_dict.get('applicant_income', 0) or 0)
        + float(data_dict.get('coapplicant_income', 0) or 0)
    )
    loan_amount = float(data_dict.get('loan_amount', 0) or 0)
    term_months = int(data_dict.get('loan_amount_term', 360) or 360)
    tenure_years = max(1, term_months // 12)

    emi_info = EMICalculator.calculate_emi(loan_amount, 8.5, tenure_years)
    est_emi = emi_info.get('monthly_emi', 0)
    foir = (est_emi / total_income) if total_income > 0 else float('inf')

    if foir > FOIR_LIMIT:
        result['prediction'] = 'Rejected'
        # Blend a confidence score that reflects how far over the limit they are
        result['confidence_score'] = round(min(0.95, 0.5 + (foir - FOIR_LIMIT)), 4)
        result['_affordability_override'] = True
        result['_estimated_foir'] = round(foir, 3)

    return result


class LoanService:
    """
    Service layer for Home Loan applications.
    Handles input conversion, invokes the ML prediction pipeline,
    and returns prediction along with confidence score and rule-based bank recommendations.
    """

    @staticmethod
    def evaluate_loan_eligibility(input_data: Union[Dict[str, Any], Any]) -> Dict[str, Any]:
        """
        Evaluates home loan eligibility using the trained ML model and generates bank recommendations.
        
        Args:
            input_data: Either a validated dictionary of features or a LoanApplication model instance.
            
        Returns:
            dict with keys:
                - 'prediction': 'Approved' or 'Rejected'
                - 'confidence_score': float between 0.0 and 1.0
                - 'recommended_banks': list of recommended bank dictionaries
                - 'rejection_reasons': list of reasons for rejection
                - 'improvement_suggestions': list of suggestions for improvement
                - 'financial_health': dictionary containing financial health score and details
                - 'emi_details': dict with EMI calculation (only if approved)
        """
        # Convert model instance to dictionary if necessary
        if hasattr(input_data, '__dict__') and not isinstance(input_data, dict):
            data_dict = {
                'gender': getattr(input_data, 'gender', 'Male'),
                'married': getattr(input_data, 'married', False),
                'dependents': getattr(input_data, 'dependents', '0'),
                'education': getattr(input_data, 'education', 'Graduate'),
                'self_employed': getattr(input_data, 'self_employed', False),
                'applicant_income': getattr(input_data, 'applicant_income', 0.0),
                'coapplicant_income': getattr(input_data, 'coapplicant_income', 0.0),
                'loan_amount': getattr(input_data, 'loan_amount', 0.0),
                'loan_amount_term': getattr(input_data, 'loan_amount_term', 360),
                'credit_history': getattr(input_data, 'credit_history', 1.0),
                'property_area': getattr(input_data, 'property_area', 'Urban'),
                'savings': getattr(input_data, 'savings', 0.0),
                'debt_ratio': getattr(input_data, 'debt_ratio', 0.0),
                'existing_loans': getattr(input_data, 'existing_loans', 0),
            }
        else:
            data_dict = dict(input_data)

        # Run inference via ml_models predictor
        result = predict_loan(data_dict)

        # --- Affordability guardrail (FOIR) — may override Approved → Rejected ---
        result = _apply_affordability_guardrail(result, data_dict)

        # Generate rule-based recommendations if prediction is Approved
        if result['prediction'] == 'Approved':
            recommended_banks = BankRecommender.recommend_banks(data_dict, top_n=3)
            result['recommended_banks'] = recommended_banks
            result['rejection_reasons'] = []
            result['improvement_suggestions'] = []
            
            # EMI Calculation
            try:
                loan_amt = float(data_dict.get('loan_amount', 0.0))
                tenure_months = int(data_dict.get('loan_amount_term', 360))
                tenure_years = max(1, tenure_months // 12)
            except (ValueError, TypeError):
                loan_amt, tenure_years = 0.0, 30
                
            interest_rate = 8.5 # fallback
            if recommended_banks and 'interest_rate' in recommended_banks[0]:
                try:
                    interest_rate = float(recommended_banks[0]['interest_rate'])
                except (ValueError, TypeError):
                    pass
                    
            result['emi_details'] = EMICalculator.calculate_emi(loan_amt, interest_rate, tenure_years)
        else:
            result['recommended_banks'] = []
            reasons = RejectionAnalyzer.analyze_home_loan_rejection(data_dict)
            result['rejection_reasons'] = reasons
            result['improvement_suggestions'] = ImprovementEngine.generate_home_loan_improvements(reasons)

            # If the guardrail triggered the override, prepend affordability-
            # specific reason / suggestion so the user understands *why*.
            if result.get('_affordability_override'):
                result['rejection_reasons'].insert(
                    0,
                    "Your estimated EMI would consume more than 50% of your monthly "
                    "income, indicating limited repayment capacity",
                )
                result['improvement_suggestions'].insert(
                    0,
                    "Consider a smaller loan amount, a longer tenure, or adding a "
                    "co-applicant's income to improve your eligibility.",
                )

        # Always calculate financial health
        result['financial_health'] = FinancialHealthAnalyzer.analyze_loan_health(data_dict)

        # If input_data was a model instance, optionally update fields in memory (caller decides when to save)
        if hasattr(input_data, '__dict__') and not isinstance(input_data, dict):
            setattr(input_data, 'prediction', result['prediction'])
            setattr(input_data, 'confidence_score', result['confidence_score'])

        # Strip internal debug keys — keep them out of the API response
        result.pop('_affordability_override', None)
        result.pop('_estimated_foir', None)

        return result
