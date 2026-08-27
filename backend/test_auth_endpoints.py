import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:8000/api/auth"

def make_request(method, url, data=None, headers=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            status_code = resp.getcode()
            response_body = json.loads(resp.read().decode("utf-8"))
            return status_code, response_body
    except urllib.error.HTTPError as e:
        status_code = e.code
        try:
            response_body = json.loads(e.read().decode("utf-8"))
        except Exception:
            response_body = {"error": "Non-JSON error body"}
        return status_code, response_body

def run_tests():
    print("=== 1. TEST REGISTER ===")
    reg_payload = {
        "username": "testuser_phase3",
        "email": "testuser_phase3@example.com",
        "password": "StrongPassword!2026",
        "password_confirm": "StrongPassword!2026",
        "first_name": "Phase3",
        "last_name": "Tester"
    }
    status_code, resp_body = make_request("POST", f"{BASE_URL}/register/", reg_payload)
    print("Request Body:", json.dumps(reg_payload, indent=2))
    print("HTTP Status Code:", status_code)
    print("Response Body:", json.dumps(resp_body, indent=2))
    print("\n" + "="*40 + "\n")

    print("=== 2. TEST LOGIN ===")
    login_payload = {
        "username": "testuser_phase3",
        "password": "StrongPassword!2026"
    }
    status_code, login_resp = make_request("POST", f"{BASE_URL}/login/", login_payload)
    print("Request Body:", json.dumps(login_payload, indent=2))
    print("HTTP Status Code:", status_code)
    print("Response Body:", json.dumps(login_resp, indent=2))
    print("\n" + "="*40 + "\n")

    access_token = login_resp.get("access")
    refresh_token = login_resp.get("refresh")

    print("=== 3. TEST REFRESH TOKEN ===")
    refresh_payload = {
        "refresh": refresh_token
    }
    status_code, refresh_resp = make_request("POST", f"{BASE_URL}/token/refresh/", refresh_payload)
    print("Request Body:", json.dumps(refresh_payload, indent=2))
    print("HTTP Status Code:", status_code)
    print("Response Body:", json.dumps(refresh_resp, indent=2))
    print("\n" + "="*40 + "\n")

    print("=== 4. TEST GET PROFILE (AUTHENTICATED) ===")
    auth_headers = {"Authorization": f"Bearer {access_token}"}
    status_code, profile_resp = make_request("GET", f"{BASE_URL}/profile/", headers=auth_headers)
    print("HTTP Status Code:", status_code)
    print("Response Body:", json.dumps(profile_resp, indent=2))
    print("\n" + "="*40 + "\n")

    print("=== 5. TEST UPDATE PROFILE (AUTHENTICATED) ===")
    update_payload = {
        "first_name": "UpdatedPhase3",
        "last_name": "TesterPro",
        "profile": {
            "phone_number": "+1-555-0199",
            "monthly_income": "8500.00",
            "credit_score": 760,
            "employment_status": "employed",
            "address": "100 Innovation Way, Tech City"
        }
    }
    status_code, update_resp = make_request("PATCH", f"{BASE_URL}/profile/", data=update_payload, headers=auth_headers)
    print("Request Body:", json.dumps(update_payload, indent=2))
    print("HTTP Status Code:", status_code)
    print("Response Body:", json.dumps(update_resp, indent=2))
    print("\n" + "="*40 + "\n")

    print("=== 6. TEST UNAUTHORIZED ACCESS (NO TOKEN) ===")
    status_code, unauth_resp = make_request("GET", f"{BASE_URL}/profile/")
    print("HTTP Status Code:", status_code)
    print("Response Body:", json.dumps(unauth_resp, indent=2))
    print("\n" + "="*40 + "\n")

if __name__ == "__main__":
    run_tests()
