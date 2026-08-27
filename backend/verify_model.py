import os
import sklearn
import sys
import warnings

# We want to catch the InconsistentVersionWarning if it still happens, or verify it doesn't.
# By default, Python might not crash on a warning, so let's just make it visible.
warnings.simplefilter('always', UserWarning)

print(f"Current scikit-learn version: {sklearn.__version__}")

# Add backend directory to sys.path so we can import ml_models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml_models.model_loader import ModelLoader
from ml_models.predictor import predict_loan, predict_credit_card

def main():
    print("Testing ModelLoader...")
    
    try:
        # This will trigger the loading of the models (and thus any warnings if version mismatch)
        loan_model = ModelLoader.get_loan_model()
        loan_preprocessor = ModelLoader.get_loan_preprocessor()
        card_model = ModelLoader.get_card_model()
        card_preprocessor = ModelLoader.get_card_preprocessor()
        
        print("Models loaded successfully!")
    except FileNotFoundError as e:
        print(f"Error loading models: {e}")
        print("Make sure you run train_models.py first!")
        sys.exit(1)

    print("\nTesting Loan Prediction Pipeline...")
    dummy_loan_data = {
        'applicant_income': 50000,
        'coapplicant_income': 0,
        'loan_amount': 1000000,
        'loan_amount_term': 120,
        'credit_history': 1.0,
        'savings': 10000,
        'debt_ratio': 0.1,
        'existing_loans': 0,
        'gender': 'Male',
        'married': 'No',
        'dependents': '0',
        'education': 'Graduate',
        'self_employed': 'No',
        'property_area': 'Urban'
    }
    
    try:
        loan_result = predict_loan(dummy_loan_data)
        print(f"Loan Prediction Output: {loan_result}")
    except Exception as e:
        print(f"Error during loan prediction: {e}")

    print("\nTesting Credit Card Prediction Pipeline...")
    dummy_card_data = {
        'age': 25,
        'annual_income': 600000,
        'credit_score': 750,
        'existing_credit_cards': 0,
        'total_debt': 0,
        'monthly_housing_payment': 10000,
        'bank_balance': 50000,
        'employment_status': 'employed',
        'selected_credit_card': ''
    }
    
    try:
        card_result = predict_credit_card(dummy_card_data)
        print(f"Credit Card Prediction Output: {card_result}")
    except Exception as e:
        print(f"Error during credit card prediction: {e}")

    print("\nVerification Complete! If no InconsistentVersionWarning was printed above, the issue is fixed.")

if __name__ == "__main__":
    main()
