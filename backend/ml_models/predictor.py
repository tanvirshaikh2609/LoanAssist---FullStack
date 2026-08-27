from .model_loader import ModelLoader
from .preprocessing import preprocess_loan_input, preprocess_card_input

INTEREST_RATE = 8.5

def _compute_monthly_emi(loan_amount: float, annual_rate: float, tenure_months: int) -> float:
    if loan_amount <= 0 or tenure_months <= 0:
        return 0.0
    if annual_rate == 0:
        return loan_amount / tenure_months
    monthly_rate = annual_rate / 12 / 100
    factor = (1 + monthly_rate) ** tenure_months
    return loan_amount * monthly_rate * factor / (factor - 1)

def _get_foir_score(foir: float) -> float:
    if foir <= 0.25: return 40.0
    elif foir <= 0.30: return 40.0 - ((foir - 0.25) / 0.05) * 5.0
    elif foir <= 0.35: return 35.0 - ((foir - 0.30) / 0.05) * 5.0
    elif foir <= 0.40: return 30.0 - ((foir - 0.35) / 0.05) * 5.0
    elif foir <= 0.45: return 25.0 - ((foir - 0.40) / 0.05) * 5.0
    elif foir <= 0.50: return 20.0 - ((foir - 0.45) / 0.05) * 10.0
    elif foir <= 0.55: return 10.0 - ((foir - 0.50) / 0.05) * 10.0
    else: return 0.0

def _get_savings_score(coverage: float) -> float:
    if coverage >= 0.50: return 15.0
    return (coverage / 0.50) * 15.0

def _get_debt_score(dr: float) -> float:
    if dr <= 0.10: return 10.0
    elif dr >= 0.70: return 0.0
    else: return 10.0 - ((dr - 0.10) / 0.60) * 10.0

def _get_loans_score(loans: int) -> float:
    if loans <= 0: return 10.0
    elif loans == 1: return 8.0
    elif loans == 2: return 5.0
    elif loans == 3: return 2.0
    else: return 0.0

def _generate_explanation(prediction: str, foir: float, credit_history: float, savings_coverage: float, debt_ratio: float, hybrid_score: float) -> str:
    if prediction == "Approved":
        reasons = []
        if foir <= 0.35: reasons.append("excellent FOIR")
        elif foir <= 0.45: reasons.append("healthy FOIR")
        else: reasons.append("acceptable FOIR")
        if credit_history > 0: reasons.append("positive credit history")
        if savings_coverage >= 0.20: reasons.append("strong savings")
        
        if hybrid_score >= 75:
            return f"Approved because of {', '.join(reasons)}."
        else:
            return f"Approved with moderate confidence. Main factors: {', '.join(reasons)}."
    else:
        reasons = []
        if foir > 0.50: reasons.append("poor FOIR")
        elif foir > 0.40: reasons.append("high FOIR")
        if credit_history == 0: reasons.append("poor credit history")
        if debt_ratio > 0.50: reasons.append("high debt burden")
        
        if not reasons:
            reasons.append("overall weak financial profile")
            
        if savings_coverage >= 0.20 and foir > 0.50:
            return "Rejected because repayment capacity is insufficient despite savings."
            
        return f"Rejected because of {', '.join(reasons)}."


def predict_loan(data: dict) -> dict:
    """
    Runs preprocessing and inference for Home Loan application,
    followed by a realistic continuous banking underwriting safety layer.
    """
    features = preprocess_loan_input(data)
    model = ModelLoader.get_loan_model()
    
    probabilities = model.predict_proba(features)[0]
    approval_probability = float(probabilities[1])
    
    loan_amount = float(data.get('loan_amount', 0) or 0)
    loan_amount_term = float(data.get('loan_amount_term', 360) or 360)
    applicant_income = float(data.get('applicant_income', 0) or 0)
    coapplicant_income = float(data.get('coapplicant_income', 0) or 0)
    monthly_income = applicant_income + coapplicant_income
    
    savings = float(data.get('savings', 0) or 0)
    debt_ratio = float(data.get('debt_ratio', 0) or 0)
    existing_loans = int(data.get('existing_loans', 0) or 0)
    credit_history = float(data.get('credit_history', 0) or 0)
    
    estimated_emi = _compute_monthly_emi(loan_amount, INTEREST_RATE, int(loan_amount_term))
    foir = (estimated_emi / monthly_income) if monthly_income > 0 else 10.0
    savings_coverage = (savings / loan_amount) if loan_amount > 0 else 0.0
    
    # 1. Underwriting Score Components
    foir_score = _get_foir_score(foir)
    credit_score = credit_history * 25.0
    savings_score = _get_savings_score(savings_coverage)
    debt_score = _get_debt_score(debt_ratio)
    loans_score = _get_loans_score(existing_loans)
    
    underwriting_score = foir_score + credit_score + savings_score + debt_score + loans_score
    
    # 2. Hybrid Score (60% Underwriting, 40% ML Probability)
    ml_score = approval_probability * 100.0
    hybrid_score = (0.60 * underwriting_score) + (0.40 * ml_score)
    
    # 3. Continuous Decision Logic
    if hybrid_score >= 65:
        prediction_label = "Approved"
    elif hybrid_score >= 55:
        # Reject only if multiple financial factors are weak
        if foir > 0.45 or credit_history == 0 or debt_ratio > 0.50:
            prediction_label = "Rejected"
        else:
            prediction_label = "Approved"
    else:
        prediction_label = "Rejected"
        
    decision_reason = _generate_explanation(
        prediction_label, foir, credit_history, savings_coverage, debt_ratio, hybrid_score
    )
    
    # Scale confidence score based on hybrid score (0 to 1 scale)
    confidence_score = hybrid_score / 100.0
    
    return {
        "prediction": prediction_label,
        "confidence_score": round(confidence_score, 4),
        "approval_probability": round(approval_probability, 4),
        "foir": round(foir, 4),
        "estimated_emi": round(estimated_emi, 2),
        "decision_reason": decision_reason
    }


def predict_credit_card(data: dict) -> dict:
    """
    Runs preprocessing and inference for Credit Card application.
    Returns:
        {
            "prediction": "Approved" | "Rejected",
            "confidence_score": float (0.0 to 1.0)
        }
    """
    features = preprocess_card_input(data)
    model = ModelLoader.get_card_model()
    
    probabilities = model.predict_proba(features)[0]
    pred_class = model.predict(features)[0]
    
    prediction_label = "Approved" if pred_class == 1 else "Rejected"
    confidence_score = float(max(probabilities))
    
    return {
        "prediction": prediction_label,
        "confidence_score": round(confidence_score, 4)
    }
