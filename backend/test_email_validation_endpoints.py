import urllib.request
import urllib.error
import json
import uuid

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
    print("==================================================")
    print("RUNNING EMAIL VALIDATION TEST SUITE ON BACKEND API")
    print("==================================================\n")

    invalid_cases = [
        ("test@gmail.comt", "Invalid TLD .comt on gmail"),
        ("test@gmail", "Missing TLD"),
        ("test@", "Missing domain"),
        ("@gmail.com", "Missing local part"),
        ("testgmail.com", "Missing @ symbol"),
        ("test@@gmail.com", "Double @ symbol"),
        ("test @gmail.com", "Space before @"),
        ("test@gmail..com", "Consecutive dots in domain"),
        ("test@gmail.co", "Invalid gmail extension .co"),
        ("test@gmail.com123", "Numeric extension on gmail"),
        ("", "Empty email"),
        ("   ", "Whitespace only email"),
        ("user..name@gmail.com", "Consecutive dots in local part"),
        (".user@gmail.com", "Leading dot in local part"),
    ]

    all_passed = True

    print("--- 1. TESTING INVALID EMAIL REGISTRATION CASES (EXPECT 400 BAD REQUEST) ---")
    for email, desc in invalid_cases:
        unique_username = f"user_{uuid.uuid4().hex[:8]}"
        payload = {
            "username": unique_username,
            "email": email,
            "password": "StrongPassword!2026",
            "password_confirm": "StrongPassword!2026",
            "first_name": "Test",
            "last_name": "User"
        }
        status_code, resp = make_request("POST", f"{BASE_URL}/register/", payload)
        if status_code == 400 and "email" in resp:
            print(f"  [PASS] '{email}' ({desc}) -> Rejected with 400: {resp['email']}")
        else:
            print(f"  [FAIL] '{email}' ({desc}) -> Expected 400 with 'email' error, got {status_code}: {resp}")
            all_passed = False

    print("\n--- 2. TESTING VALID EMAIL REGISTRATION CASES (EXPECT 201 CREATED) ---")
    valid_cases = [
        (f"test_{uuid.uuid4().hex[:6]}@gmail.com", "standard valid gmail"),
        (f"john.doe.{uuid.uuid4().hex[:6]}@gmail.com", "valid dot gmail"),
        (f"user123_{uuid.uuid4().hex[:6]}@gmail.com", "valid number gmail"),
        (f"  space_{uuid.uuid4().hex[:6]}@gmail.com  ", "valid with leading/trailing whitespace (normalized)"),
        (f"user_{uuid.uuid4().hex[:6]}@yahoo.com", "valid yahoo email"),
        (f"user_{uuid.uuid4().hex[:6]}@loanassist.org", "valid custom domain"),
    ]

    for email, desc in valid_cases:
        unique_username = f"user_{uuid.uuid4().hex[:8]}"
        payload = {
            "username": unique_username,
            "email": email,
            "password": "StrongPassword!2026",
            "password_confirm": "StrongPassword!2026",
            "first_name": "Test",
            "last_name": "User"
        }
        status_code, resp = make_request("POST", f"{BASE_URL}/register/", payload)
        if status_code == 201:
            stored_email = resp.get("user", {}).get("email")
            expected_normalized = email.strip().lower()
            if stored_email == expected_normalized:
                print(f"  [PASS] '{email}' ({desc}) -> 201 Created with normalized email: '{stored_email}'")
            else:
                print(f"  [FAIL] '{email}' -> Created but email not normalized correctly: '{stored_email}' vs '{expected_normalized}'")
                all_passed = False
        else:
            print(f"  [FAIL] '{email}' ({desc}) -> Expected 201, got {status_code}: {resp}")
            all_passed = False

    print("\n--- 3. TESTING DUPLICATE EMAIL CHECK (CASE-INSENSITIVE) ---")
    dup_email = f"dup_check_{uuid.uuid4().hex[:6]}@gmail.com"
    first_payload = {
        "username": f"user_{uuid.uuid4().hex[:8]}",
        "email": dup_email,
        "password": "StrongPassword!2026",
        "password_confirm": "StrongPassword!2026",
        "first_name": "First",
        "last_name": "User"
    }
    status1, _ = make_request("POST", f"{BASE_URL}/register/", first_payload)
    
    second_payload = {
        "username": f"user_{uuid.uuid4().hex[:8]}",
        "email": dup_email.upper(), # test case-insensitivity
        "password": "StrongPassword!2026",
        "password_confirm": "StrongPassword!2026",
        "first_name": "Second",
        "last_name": "User"
    }
    status2, resp2 = make_request("POST", f"{BASE_URL}/register/", second_payload)
    if status1 == 201 and status2 == 400 and "email" in resp2:
        print(f"  [PASS] Duplicate registration rejected with 400: {resp2['email']}")
    else:
        print(f"  [FAIL] Duplicate check failed: status1={status1}, status2={status2}, resp2={resp2}")
        all_passed = False

    print("\n==================================================")
    if all_passed:
        print("RESULT: ALL EMAIL VALIDATION TESTS PASSED (100% SUCCESS)!")
    else:
        print("RESULT: SOME TESTS FAILED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
