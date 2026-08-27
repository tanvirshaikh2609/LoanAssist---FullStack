import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cards.card_service import CreditCardService
from cards.models import CreditCard
import json

def run_tests():
    print("Running CreditCardService fix tests...")
    
    # 1. Test Approval Case
    data_approved = {
        'annual_income': 600000,
        'credit_score': 750,
        'employment_status': 'employed',
        'existing_credit_cards': 0,
        'total_debt': 0,
        'monthly_housing_payment': 10000,
        'bank_balance': 50000,
        'selected_credit_card': None
    }
    
    result_approved = CreditCardService.evaluate_card_eligibility(data_approved)
    print("\n--- Approval Case ---")
    print(f"Prediction: {result_approved['prediction']}")
    print(f"Recommended Cards Count: {len(result_approved.get('recommended_cards', []))}")
    if result_approved.get('recommended_cards'):
        print(f"First Card: {result_approved['recommended_cards'][0]['card_name']}")
    assert result_approved['prediction'] == 'Approved'
    assert len(result_approved.get('recommended_cards', [])) > 0
    
    # 2. Test Rejection Case
    data_rejected = {
        'annual_income': 150000,
        'credit_score': 580,
        'employment_status': 'employed',
        'existing_credit_cards': 0,
        'total_debt': 0,
        'monthly_housing_payment': 10000,
        'bank_balance': 5000,
        'selected_credit_card': None
    }
    
    result_rejected = CreditCardService.evaluate_card_eligibility(data_rejected)
    print("\n--- Rejection Case ---")
    print(f"Prediction: {result_rejected['prediction']}")
    print(f"Rejection Reasons: {result_rejected.get('rejection_reasons', [])}")
    assert result_rejected['prediction'] == 'Rejected'
    assert len(result_rejected.get('rejection_reasons', [])) > 0

if __name__ == "__main__":
    run_tests()
