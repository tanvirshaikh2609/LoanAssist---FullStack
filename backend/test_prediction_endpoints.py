import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from loans.models import LoanApplication
from cards.models import CreditCardApplication, CreditCard

User = get_user_model()

def run_all_tests():
    print("==================================================================")
    print(" STARTING VERIFICATION FOR PHASE 6A PREDICTION API ENDPOINTS")
    print("==================================================================\n")

    client = Client()

    # 1. Test Unauthenticated Access (Must return 401 Unauthorized)
    print("[Test 1] Verifying Anonymous Access Rejection...")
    res_unauth_loan = client.post('/api/loans/predict/', data={}, content_type='application/json')
    res_unauth_card = client.post('/api/cards/predict/', data={}, content_type='application/json')
    
    assert res_unauth_loan.status_code == 401, f"Expected 401 for loans, got {res_unauth_loan.status_code}"
    assert res_unauth_card.status_code == 401, f"Expected 401 for cards, got {res_unauth_card.status_code}"
    print("[PASS] Anonymous requests correctly returned 401 Unauthorized for both endpoints.\n")

    # 2. Setup Test User & Obtain JWT Access Token
    print("[Test 2] Setting up Test User & obtaining JWT Access Token...")
    test_email = "test_ml_user@example.com"
    test_username = "test_ml_user"
    test_password = "TestPassword123!"
    
    User.objects.filter(username=test_username).delete()
    user = User.objects.create_user(username=test_username, email=test_email, password=test_password)
    
    login_res = client.post('/api/auth/login/', data={
        'username': test_username,
        'password': test_password
    }, content_type='application/json')
    
    assert login_res.status_code == 200, f"Login failed with status {login_res.status_code}"
    access_token = login_res.json()['access']
    auth_header = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}
    print("[PASS] Test user created and JWT access token obtained successfully.\n")

    # 3. Test Serializer Validation (Must return 400 Bad Request on invalid payloads)
    print("[Test 3] Verifying Serializer Validation (400 Bad Request)...")
    invalid_loan_payload = {'applicant_income': 'INVALID_INCOME'}
    res_invalid_loan = client.post('/api/loans/predict/', data=invalid_loan_payload, content_type='application/json', **auth_header)
    assert res_invalid_loan.status_code == 400, f"Expected 400 for invalid loan payload, got {res_invalid_loan.status_code}"
    
    invalid_card_payload = {'selected_credit_card': 'Non-Existent Card Name XYZ'}
    res_invalid_card = client.post('/api/cards/predict/', data=invalid_card_payload, content_type='application/json', **auth_header)
    assert res_invalid_card.status_code == 400, f"Expected 400 for invalid card payload, got {res_invalid_card.status_code}"
    print("[PASS] Invalid payloads correctly returned 400 Bad Request along with validation error details.\n")

    # 4. Test Home Loan Prediction API (POST /api/loans/predict/)
    print("[Test 4] Testing Home Loan Prediction API (/api/loans/predict/)...")
    sample_loan_req = {
        "gender": "Male",
        "married": True,
        "dependents": "1",
        "education": "Graduate",
        "self_employed": False,
        "applicant_income": "250000.00",
        "coapplicant_income": "40000.00",
        "loan_amount": "6000000.00",
        "loan_amount_term": 120,
        "credit_history": 1.0,
        "property_area": "Semiurban",
        "savings": "9000000.00",
        "debt_ratio": 0.17,
        "existing_loans": 0
    }
    res_loan = client.post('/api/loans/predict/', data=sample_loan_req, content_type='application/json', **auth_header)
    assert res_loan.status_code == 200, f"Expected 200 OK for loan prediction, got {res_loan.status_code}: {res_loan.content}"
    loan_json = res_loan.json()
    
    print("-> Sample Loan Request Payload:")
    print(json.dumps(sample_loan_req, indent=2))
    print("-> Sample Loan Response JSON:")
    print(json.dumps(loan_json, indent=2))
    
    assert "application_id" in loan_json
    assert loan_json["prediction"] in ["Approved", "Rejected"]
    assert isinstance(loan_json["confidence_score"], float) and 0.0 <= loan_json["confidence_score"] <= 1.0
    assert loan_json["status"] in ["APPROVED", "REJECTED"]
    
    # Verify Database Entry
    db_loan_app = LoanApplication.objects.get(id=loan_json["application_id"])
    assert db_loan_app.user == user
    assert db_loan_app.prediction == loan_json["prediction"]
    assert db_loan_app.confidence_score == loan_json["confidence_score"]
    assert db_loan_app.status == loan_json["status"]
    print(f"[PASS] Verified Database Entry #{db_loan_app.id}: Status={db_loan_app.status}, Prediction={db_loan_app.prediction}, Confidence={db_loan_app.confidence_score}\n")

    # 5. Test Credit Card Prediction API (POST /api/cards/predict/)
    print("[Test 5] Testing Credit Card Prediction API (/api/cards/predict/)...")
    sample_card_req = {
        "age": 35,
        "annual_income": "1800000.00",
        "credit_score": 780,
        "employment_status": "employed",
        "existing_credit_cards": 2,
        "total_debt": "100000.00",
        "monthly_housing_payment": "30000.00",
        "bank_balance": "800000.00",
        "selected_credit_card": "Infinia Metal Edition"
    }
    res_card = client.post('/api/cards/predict/', data=sample_card_req, content_type='application/json', **auth_header)
    assert res_card.status_code == 200, f"Expected 200 OK for card prediction, got {res_card.status_code}: {res_card.content}"
    card_json = res_card.json()
    
    print("-> Sample Credit Card Request Payload:")
    print(json.dumps(sample_card_req, indent=2))
    print("-> Sample Credit Card Response JSON:")
    print(json.dumps(card_json, indent=2))
    
    assert "application_id" in card_json
    assert card_json["prediction"] in ["Approved", "Rejected"]
    assert isinstance(card_json["confidence_score"], float) and 0.0 <= card_json["confidence_score"] <= 1.0
    assert card_json["status"] in ["APPROVED", "REJECTED"]
    
    # Verify Database Entry
    db_card_app = CreditCardApplication.objects.get(id=card_json["application_id"])
    assert db_card_app.user == user
    assert db_card_app.prediction == card_json["prediction"]
    assert db_card_app.confidence_score == card_json["confidence_score"]
    assert db_card_app.status == card_json["status"]
    print(f"[PASS] Verified Database Entry #{db_card_app.id}: Status={db_card_app.status}, Prediction={db_card_app.prediction}, Confidence={db_card_app.confidence_score}\n")

    print("==================================================================")
    print(" ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! [PASS]")
    print("==================================================================")

if __name__ == '__main__':
    run_all_tests()
