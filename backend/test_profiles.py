import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cards.card_service import CreditCardService
from cards.models import CreditCard

def run_test(name, profile):
    print(f"\n{'='*50}\nTEST: {name}\n{'='*50}")
    try:
        res = CreditCardService.evaluate_card_eligibility(profile)
        print(f"Prediction: {res['prediction']}")
        
        cards = res.get('recommended_cards', [])
        print(f"Total Recommended: {len(cards)}")
        for i, c in enumerate(cards, 1):
            print(f"{i}. {c['card_name']} | Tier/Cat: {c.get('best_for', 'Unknown')} | Score: {c['recommendation_score']}")
            print(f"   Reasons: {c.get('ai_reasons')}")
    except Exception as e:
        import traceback
        traceback.print_exc()

profiles = {
    "1. Student profile (Low income, 0 cards)": {
        'age': 20, 'annual_income': 150000, 'credit_score': 680, 
        'employment_status': 'student', 'existing_credit_cards': 0, 
        'total_debt': 0, 'monthly_housing_payment': 0, 
        'bank_balance': 10000, 'selected_credit_card': ''
    },
    "2. Low-income profile (Salaried low income, 1 card)": {
        'age': 25, 'annual_income': 350000, 'credit_score': 720, 
        'employment_status': 'employed', 'existing_credit_cards': 1, 
        'total_debt': 20000, 'monthly_housing_payment': 8000, 
        'bank_balance': 20000, 'selected_credit_card': ''
    },
    "3. Medium-income profile (Salaried mid income)": {
        'age': 28, 'annual_income': 700000, 'credit_score': 750, 
        'employment_status': 'employed', 'existing_credit_cards': 1, 
        'total_debt': 50000, 'monthly_housing_payment': 15000, 
        'bank_balance': 50000, 'selected_credit_card': ''
    },
    "4. High-income profile (Salaried high income)": {
        'age': 32, 'annual_income': 1500000, 'credit_score': 790, 
        'employment_status': 'employed', 'existing_credit_cards': 2, 
        'total_debt': 100000, 'monthly_housing_payment': 30000, 
        'bank_balance': 200000, 'selected_credit_card': ''
    },
    "5. Premium profile (Very High income, high bank balance, excellent score)": {
        'age': 40, 'annual_income': 3500000, 'credit_score': 820, 
        'employment_status': 'employed', 'existing_credit_cards': 3, 
        'total_debt': 200000, 'monthly_housing_payment': 50000, 
        'bank_balance': 1500000, 'selected_credit_card': ''
    },
    "6. Traveller profile (High income, >2 cards)": {
        'age': 35, 'annual_income': 1800000, 'credit_score': 780, 
        'employment_status': 'employed', 'existing_credit_cards': 4, 
        'total_debt': 150000, 'monthly_housing_payment': 40000, 
        'bank_balance': 300000, 'selected_credit_card': ''
    },
    "7. High debt profile (High income but very high debt)": {
        'age': 36, 'annual_income': 1800000, 'credit_score': 710, 
        'employment_status': 'employed', 'existing_credit_cards': 2, 
        'total_debt': 1000000, 'monthly_housing_payment': 60000, 
        'bank_balance': 50000, 'selected_credit_card': ''
    }
}

for name, data in profiles.items():
    run_test(name, data)
