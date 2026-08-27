"""
Tests for the FOIR affordability guardrail added to LoanService.

Two key scenarios:
  1. Unaffordable case  — low income + high loan → must be Rejected.
  2. Affordable case    — high income + same loan → must stay Approved.
"""

import os
import sys
import unittest
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from loans.loan_service import LoanService, _apply_affordability_guardrail, FOIR_LIMIT
from financial_engine.emi_calculator import EMICalculator


# ── helpers ───────────────────────────────────────────────────────────────────

_BASE_INPUT = {
    'gender': 'Male',
    'married': False,
    'dependents': '0',
    'education': 'Graduate',
    'self_employed': True,
    'credit_history': 1.0,
    'existing_loans': 0,
    'savings': 100000,
    'debt_ratio': 0.0,
    'property_area': 'Urban',
    'loan_amount': 1280000,
    'loan_amount_term': 120,
    'coapplicant_income': 0,
}


# ── unit tests for the guardrail function itself ─────────────────────────────

class TestApplyAffordabilityGuardrail(unittest.TestCase):
    """Tests targeting _apply_affordability_guardrail in isolation."""

    def test_does_not_touch_rejections(self):
        """ML rejections must never be modified by the guardrail."""
        result = {'prediction': 'Rejected', 'confidence_score': 0.85}
        data = {**_BASE_INPUT, 'applicant_income': 5000}
        out = _apply_affordability_guardrail(dict(result), data)
        assert out['prediction'] == 'Rejected'
        assert out['confidence_score'] == 0.85  # unchanged
        assert '_affordability_override' not in out

    def test_overrides_unaffordable_approval(self):
        """An ML approval with FOIR > 50 % must be flipped to Rejected."""
        result = {'prediction': 'Approved', 'confidence_score': 0.9}
        data = {**_BASE_INPUT, 'applicant_income': 5000}
        out = _apply_affordability_guardrail(dict(result), data)

        assert out['prediction'] == 'Rejected'
        assert out['_affordability_override'] is True
        assert out['_estimated_foir'] > FOIR_LIMIT
        assert 0.5 <= out['confidence_score'] <= 0.95

    def test_passes_affordable_approval(self):
        """An ML approval with FOIR ≤ 50 % must remain Approved."""
        result = {'prediction': 'Approved', 'confidence_score': 0.9}
        data = {**_BASE_INPUT, 'applicant_income': 100000}
        out = _apply_affordability_guardrail(dict(result), data)

        assert out['prediction'] == 'Approved'
        assert '_affordability_override' not in out

    def test_zero_income_triggers_override(self):
        """Zero total income should give FOIR = inf → always override."""
        result = {'prediction': 'Approved', 'confidence_score': 0.9}
        data = {**_BASE_INPUT, 'applicant_income': 0, 'coapplicant_income': 0}
        out = _apply_affordability_guardrail(dict(result), data)

        assert out['prediction'] == 'Rejected'
        assert out['_affordability_override'] is True

    def test_coapplicant_income_contributes(self):
        """Co-applicant income should reduce FOIR and potentially save an approval."""
        result = {'prediction': 'Approved', 'confidence_score': 0.9}
        # Income alone insufficient, but with co-applicant it becomes affordable
        data = {**_BASE_INPUT, 'applicant_income': 20000, 'coapplicant_income': 80000}
        out = _apply_affordability_guardrail(dict(result), data)

        # With 100k combined income on a 1.28M / 10-year loan the EMI should be
        # around 15,880 → FOIR ≈ 0.159 → should stay Approved
        assert out['prediction'] == 'Approved'


# ── integration tests through the full LoanService pipeline ──────────────────

class TestLoanServiceAffordabilityIntegration(unittest.TestCase):
    """End-to-end tests through LoanService.evaluate_loan_eligibility."""

    def test_unaffordable_case_rejected(self):
        """
        Exact scenario from the ticket:
        applicant_income=5000, loan=1,280,000, 10-year term.
        EMI ≈ ₹15,880 → FOIR ≈ 3.18 → must be Rejected.
        """
        data = {**_BASE_INPUT, 'applicant_income': 5000}
        result = LoanService.evaluate_loan_eligibility(data)

        assert result['prediction'] == 'Rejected', (
            f"Expected Rejected but got {result['prediction']}"
        )
        # Rejection reasons must be present
        assert len(result.get('rejection_reasons', [])) > 0, (
            f"Rejection reasons missing from: {result}"
        )

        # Improvement suggestions must be present
        assert len(result.get('improvement_suggestions', [])) > 0, (
            f"Improvement suggestions missing from: {result}"
        )

        # Internal debug keys must NOT leak into the response
        assert '_affordability_override' not in result
        assert '_estimated_foir' not in result

    def test_affordable_case_still_approved(self):
        """
        High-income applicant with the same loan should remain Approved —
        the guardrail must not create false rejections.
        """
        data = {**_BASE_INPUT, 'applicant_income': 100000}
        result = LoanService.evaluate_loan_eligibility(data)

        assert result['prediction'] == 'Approved', (
            f"Expected Approved but got {result['prediction']}. "
            f"Reasons: {result.get('rejection_reasons')}"
        )
        assert result.get('recommended_banks') is not None
        assert '_affordability_override' not in result

    def test_debug_keys_stripped(self):
        """Internal _affordability_override / _estimated_foir keys must not
        appear in the returned dict regardless of outcome."""
        for income in [5000, 100000]:
            data = {**_BASE_INPUT, 'applicant_income': income}
            result = LoanService.evaluate_loan_eligibility(data)
            assert '_affordability_override' not in result
            assert '_estimated_foir' not in result


# ── manual-run convenience ───────────────────────────────────────────────────

def _manual_demo():
    """Quick demonstration when running the file directly."""
    print("=" * 70)
    print("  FOIR Affordability Guardrail — Manual Test")
    print("=" * 70)

    for label, income in [("UNAFFORDABLE", 5000), ("AFFORDABLE", 100000)]:
        data = {**_BASE_INPUT, 'applicant_income': income}
        result = LoanService.evaluate_loan_eligibility(data)
        print(f"\n--- {label} (income={income}) ---")
        print(f"  Prediction       : {result['prediction']}")
        print(f"  Confidence       : {result['confidence_score']}")
        print(f"  Rejection reasons: {result.get('rejection_reasons', [])}")
        print(f"  Suggestions      : {result.get('improvement_suggestions', [])}")
        print(f"  Debug keys leak? : "
              f"{'YES ⚠️' if '_affordability_override' in result else 'No ✓'}")

    print("\n" + "=" * 70)
    print("  Done.")
    print("=" * 70)


if __name__ == '__main__':
    _manual_demo()
