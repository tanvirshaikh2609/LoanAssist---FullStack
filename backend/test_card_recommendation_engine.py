import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from cards.models import CreditCardApplication, CreditCard
from cards.card_service import CreditCardService
from recommendation_engine.card_recommender import CardRecommender

User = get_user_model()


def run_verification():
    print("==================================================================")
    print(" STARTING VERIFICATION FOR PHASE 7B: CREDIT CARD RECOMMENDATIONS")
    print("==================================================================\n")

    # Ensure master data cards are seeded/available
    cards_count = CreditCard.objects.filter(is_active=True).count()
    print(f"Active Credit Cards in Database: {cards_count}")
    assert cards_count > 0, "No active Credit Cards found in database. Did you run seed_master_data?"

    # Setup test profiles
    strong_applicant = {
        "age": 35,
        "annual_income": 1800000.00,
        "credit_score": 780,
        "employment_status": "employed",
        "existing_credit_cards": 2,
        "total_debt": 100000.00,
        "monthly_housing_payment": 30000.00,
        "bank_balance": 800000.00,
        "selected_credit_card": "Infinia Metal Edition"
    }

    weak_applicant = {
        "age": 22,
        "annual_income": 150000.00,
        "credit_score": 580,
        "employment_status": "unemployed",
        "existing_credit_cards": 5,
        "total_debt": 500000.00,
        "monthly_housing_payment": 20000.00,
        "bank_balance": 5000.00,
        "selected_credit_card": "Infinia Metal Edition"
    }

    # 1. Test CardRecommender directly
    print("\n[Test 1] Verifying CardRecommender module directly...")
    recs = CardRecommender.recommend_cards(strong_applicant, top_n=3)
    print(f"-> Strong Applicant generated {len(recs)} card recommendations:")
    for r in recs:
        print(f"   * {r['bank_name']} - {r['card_name']} | Annual Fee: INR {r['annual_fee']} | Score: {r['recommendation_score']} | Reason: {r['recommendation_reason']}")
    
    assert len(recs) <= 3, "Returned more than Top 3 cards!"
    assert len(recs) > 0, "Expected recommendations for strong applicant!"
    
    # Check sorting and no duplicates
    scores = [r["recommendation_score"] for r in recs]
    assert scores == sorted(scores, reverse=True), f"Scores not sorted descending: {scores}"
    card_ids = [r["card_id"] for r in recs]
    assert len(card_ids) == len(set(card_ids)), "Duplicate cards found in recommendations!"
    
    # Check required fields
    required_keys = {"card_id", "bank_name", "card_name", "annual_fee", "joining_fee", "reward_type", "category", "recommendation_score", "recommendation_reason"}
    for r in recs:
        assert required_keys.issubset(r.keys()), f"Missing keys in recommendation: {r.keys()}"
        assert 0 <= r["recommendation_score"] <= 100, f"Score out of bounds: {r['recommendation_score']}"
    print("[PASS] CardRecommender direct tests passed (sorting, top 3, no duplicates, schema valid).\n")

    # 2. Test CreditCardService integration
    print("[Test 2] Verifying CreditCardService integration...")
    res_strong = CreditCardService.evaluate_card_eligibility(strong_applicant)
    assert res_strong["prediction"] == "Approved", f"Expected Approved, got {res_strong['prediction']}"
    assert "recommended_cards" in res_strong
    assert len(res_strong["recommended_cards"]) > 0
    print(f"-> Strong Applicant prediction: {res_strong['prediction']} (Confidence: {res_strong['confidence_score']}) | Recommended Cards count: {len(res_strong['recommended_cards'])}")

    res_weak = CreditCardService.evaluate_card_eligibility(weak_applicant)
    assert res_weak["prediction"] == "Rejected", f"Expected Rejected, got {res_weak['prediction']}"
    assert "recommended_cards" in res_weak
    assert res_weak["recommended_cards"] == [], f"Expected empty list for Rejected applicant, got {res_weak['recommended_cards']}"
    print(f"-> Weak Applicant prediction: {res_weak['prediction']} (Confidence: {res_weak['confidence_score']}) | Recommended Cards count: {len(res_weak['recommended_cards'])}")
    print("[PASS] CreditCardService integration tests passed (Approved -> Top 3 cards, Rejected -> []).\n")

    # 3. Test REST API endpoint (POST /api/cards/predict/)
    print("[Test 3] Verifying CreditCardPredictionAPIView (/api/cards/predict/) via test client...")
    client = Client()
    test_username = "test_card_rec_user"
    test_password = "CardRecPassword123!"
    
    User.objects.filter(username=test_username).delete()
    user = User.objects.create_user(username=test_username, password=test_password)
    
    login_res = client.post('/api/auth/login/', data={'username': test_username, 'password': test_password}, content_type='application/json')
    access_token = login_res.json()['access']
    auth_header = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}

    # API request for Approved applicant
    api_res_strong = client.post('/api/cards/predict/', data=strong_applicant, content_type='application/json', **auth_header)
    assert api_res_strong.status_code == 200, f"API call failed: {api_res_strong.content}"
    strong_json = api_res_strong.json()
    
    print("\n-> API Response for Approved Credit Card Application:")
    print(json.dumps(strong_json, indent=2))
    
    assert "application_id" in strong_json
    assert strong_json["prediction"] == "Approved"
    assert "recommended_cards" in strong_json
    assert len(strong_json["recommended_cards"]) > 0
    assert strong_json["status"] == "APPROVED"

    # API request for Rejected applicant
    api_res_weak = client.post('/api/cards/predict/', data=weak_applicant, content_type='application/json', **auth_header)
    assert api_res_weak.status_code == 200, f"API call failed: {api_res_weak.content}"
    weak_json = api_res_weak.json()
    
    print("\n-> API Response for Rejected Credit Card Application:")
    print(json.dumps(weak_json, indent=2))
    
    assert weak_json["prediction"] == "Rejected"
    assert weak_json["recommended_cards"] == []
    assert weak_json["status"] == "REJECTED"
    print("[PASS] CreditCardPredictionAPIView REST tests passed.\n")

    print("==================================================================")
    print(" ALL PHASE 7B VERIFICATION CHECKS PASSED SUCCESSFULLY! [PASS]")
    print("==================================================================")


if __name__ == '__main__':
    run_verification()
