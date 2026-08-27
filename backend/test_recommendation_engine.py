import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from loans.models import LoanApplication, Bank
from loans.loan_service import LoanService
from recommendation_engine.bank_recommender import BankRecommender

User = get_user_model()


def run_verification():
    print("==================================================================")
    print(" STARTING VERIFICATION FOR PHASE 7A: HOME LOAN RECOMMENDATIONS")
    print("==================================================================\n")

    # Ensure master data banks are seeded/available
    home_banks_count = Bank.objects.filter(is_active=True, loan_type='home').count()
    print(f"Active Home Loan Banks in Database: {home_banks_count}")
    assert home_banks_count > 0, "No active Home Loan banks found in database. Did you run seed_master_data?"

    # Setup test profiles
    strong_applicant = {
        "gender": "Male",
        "married": True,
        "dependents": "1",
        "education": "Graduate",
        "self_employed": False,
        "applicant_income": 250000.00,
        "coapplicant_income": 40000.00,
        "loan_amount": 6000000.00,
        "loan_amount_term": 120,
        "credit_history": 1.0,
        "property_area": "Semiurban",
        "savings": 9000000.00,
        "debt_ratio": 0.17,
        "existing_loans": 0,
        "loan_type": "home"
    }

    weak_applicant = {
        "gender": "Male",
        "married": False,
        "dependents": "3+",
        "education": "Not Graduate",
        "self_employed": False,
        "applicant_income": 30000.00,
        "coapplicant_income": 10000.00,
        "loan_amount": 8000000.00,
        "loan_amount_term": 360,
        "credit_history": 0.0,
        "property_area": "Rural",
        "savings": 50000.00,
        "debt_ratio": 0.85,
        "existing_loans": 4,
        "loan_type": "home"
    }

    # 1. Test BankRecommender directly
    print("\n[Test 1] Verifying BankRecommender module directly...")
    recs = BankRecommender.recommend_banks(strong_applicant, top_n=3)
    print(f"-> Strong Applicant generated {len(recs)} bank recommendations:")
    for r in recs:
        print(f"   * {r['bank_name']} | Rate: {r['interest_rate']}% | Fee: INR {r['processing_fee']} | Score: {r['recommendation_score']} | Reason: {r['recommendation_reason']}")
    
    assert len(recs) <= 3, "Returned more than Top 3 banks!"
    assert len(recs) > 0, "Expected recommendations for strong applicant!"
    
    # Check sorting and no duplicates
    scores = [r["recommendation_score"] for r in recs]
    assert scores == sorted(scores, reverse=True), f"Scores not sorted descending: {scores}"
    bank_ids = [r["bank_id"] for r in recs]
    assert len(bank_ids) == len(set(bank_ids)), "Duplicate banks found in recommendations!"
    
    # Check required fields
    required_keys = {"bank_id", "bank_name", "interest_rate", "processing_fee", "maximum_loan_amount", "recommendation_score", "recommendation_reason"}
    for r in recs:
        assert required_keys.issubset(r.keys()), f"Missing keys in recommendation: {r.keys()}"
        assert 0 <= r["recommendation_score"] <= 100, f"Score out of bounds: {r['recommendation_score']}"
    print("[PASS] BankRecommender direct tests passed (sorting, top 3, no duplicates, schema valid).\n")

    # 2. Test LoanService integration
    print("[Test 2] Verifying LoanService integration...")
    res_strong = LoanService.evaluate_loan_eligibility(strong_applicant)
    assert res_strong["prediction"] == "Approved", f"Expected Approved, got {res_strong['prediction']}"
    assert "recommended_banks" in res_strong
    assert len(res_strong["recommended_banks"]) > 0
    print(f"-> Strong Applicant prediction: {res_strong['prediction']} (Confidence: {res_strong['confidence_score']}) | Recommended Banks count: {len(res_strong['recommended_banks'])}")

    res_weak = LoanService.evaluate_loan_eligibility(weak_applicant)
    assert res_weak["prediction"] == "Rejected", f"Expected Rejected, got {res_weak['prediction']}"
    assert "recommended_banks" in res_weak
    assert res_weak["recommended_banks"] == [], f"Expected empty list for Rejected applicant, got {res_weak['recommended_banks']}"
    print(f"-> Weak Applicant prediction: {res_weak['prediction']} (Confidence: {res_weak['confidence_score']}) | Recommended Banks count: {len(res_weak['recommended_banks'])}")
    print("[PASS] LoanService integration tests passed (Approved -> Top 3 banks, Rejected -> []).\n")

    # 3. Test REST API endpoint (POST /api/loans/predict/)
    print("[Test 3] Verifying LoanPredictionAPIView (/api/loans/predict/) via test client...")
    client = Client()
    test_username = "test_rec_user"
    test_password = "RecPassword123!"
    
    User.objects.filter(username=test_username).delete()
    user = User.objects.create_user(username=test_username, password=test_password)
    
    login_res = client.post('/api/auth/login/', data={'username': test_username, 'password': test_password}, content_type='application/json')
    access_token = login_res.json()['access']
    auth_header = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}

    # API request for Approved applicant
    api_res_strong = client.post('/api/loans/predict/', data=strong_applicant, content_type='application/json', **auth_header)
    assert api_res_strong.status_code == 200, f"API call failed: {api_res_strong.content}"
    strong_json = api_res_strong.json()
    
    print("\n-> API Response for Approved Home Loan Application:")
    print(json.dumps(strong_json, indent=2))
    
    assert "application_id" in strong_json
    assert strong_json["prediction"] == "Approved"
    assert "recommended_banks" in strong_json
    assert len(strong_json["recommended_banks"]) > 0
    assert strong_json["status"] == "APPROVED"

    # API request for Rejected applicant
    api_res_weak = client.post('/api/loans/predict/', data=weak_applicant, content_type='application/json', **auth_header)
    assert api_res_weak.status_code == 200, f"API call failed: {api_res_weak.content}"
    weak_json = api_res_weak.json()
    
    print("\n-> API Response for Rejected Home Loan Application:")
    print(json.dumps(weak_json, indent=2))
    
    assert weak_json["prediction"] == "Rejected"
    assert weak_json["recommended_banks"] == []
    assert weak_json["status"] == "REJECTED"
    print("[PASS] LoanPredictionAPIView REST tests passed.\n")

    print("==================================================================")
    print(" ALL PHASE 7A VERIFICATION CHECKS PASSED SUCCESSFULLY! [PASS]")
    print("==================================================================")


if __name__ == '__main__':
    run_verification()
