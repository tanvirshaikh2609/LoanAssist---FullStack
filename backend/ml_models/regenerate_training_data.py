"""
regenerate_training_data.py
===========================
Re-derives the `Loan_Status` label in the home loan dataset using a
deterministic, realistic banking underwriting score.

Zero randomness — approval is 100% determined by financial fundamentals:
  FOIR (Fixed Obligation to Income Ratio)   45%
  Credit History                            25%
  Savings Coverage (Savings / Loan Amount)  15%
  Debt Ratio                                10%
  Existing Loans                             5%

Gender, Married, and Dependents have NO influence on the label.

Reads:  backend/datasets/home_loan_dataset_v2.xlsx
Writes: backend/datasets/home_loan_dataset_v3.xlsx

Usage:
    cd backend
    python ml_models/regenerate_training_data.py
"""

import os
import sys
import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Configuration — NO randomness
# ---------------------------------------------------------------------------
INTEREST_RATE = 8.5          # annual %, same as backend EMICalculator

# Underwriting score component weights (must sum to 1.00 exactly)
W_FOIR = 0.45
W_CREDIT_HISTORY = 0.25
W_SAVINGS_COVERAGE = 0.15
W_DEBT_RATIO = 0.10
W_EXISTING_LOANS = 0.05
# Total = 1.00 — zero noise


def _compute_monthly_emi(loan_amount: float,
                         annual_rate: float,
                         tenure_months: int) -> float:
    """Replicate the backend EMICalculator formula."""
    if loan_amount <= 0 or tenure_months <= 0:
        return 0.0
    if annual_rate == 0:
        return loan_amount / tenure_months
    monthly_rate = annual_rate / 12 / 100
    factor = (1 + monthly_rate) ** tenure_months
    return loan_amount * monthly_rate * factor / (factor - 1)


def _score_foir(foir_value: float) -> float:
    """
    Map FOIR to a 0-1 score using realistic banking guidelines.

    FOIR ≤ 30%   -> 1.00  (Excellent)
    FOIR 30–40%  -> 0.80  (Good)         — linear from 1.0 to 0.60
    FOIR 40–50%  -> 0.50  (Acceptable)   — linear from 0.60 to 0.40
    FOIR 50–60%  -> 0.25  (Risky)        — linear from 0.40 to 0.10
    FOIR > 60%   -> 0.00  (Very Poor)    — linear down to 0.0 at 80%

    Smooth piecewise-linear mapping instead of hard thresholds.
    """
    if foir_value <= 0.30:
        return 1.0
    elif foir_value <= 0.40:
        # Linear interpolation from 1.0 -> 0.60 over [0.30, 0.40]
        return 1.0 - (foir_value - 0.30) / 0.10 * 0.40
    elif foir_value <= 0.50:
        # Linear interpolation from 0.60 -> 0.35 over [0.40, 0.50]
        return 0.60 - (foir_value - 0.40) / 0.10 * 0.25
    elif foir_value <= 0.60:
        # Linear interpolation from 0.35 -> 0.10 over [0.50, 0.60]
        return 0.35 - (foir_value - 0.50) / 0.10 * 0.25
    elif foir_value <= 0.80:
        # Linear interpolation from 0.10 -> 0.0 over [0.60, 0.80]
        return 0.10 - (foir_value - 0.60) / 0.20 * 0.10
    else:
        return 0.0


def _score_credit_history(credit_hist: float) -> float:
    """Binary: 1.0 for good credit history, 0.0 for poor."""
    return 1.0 if credit_hist >= 1.0 else 0.0


def _score_savings_coverage(savings: float, loan_amount: float) -> float:
    """
    Savings Coverage = Savings / Loan Amount

    Coverage ≥ 30%  -> 1.0  (Excellent buffer)
    Coverage 20–30% -> 0.75 (Good)
    Coverage 10–20% -> 0.50 (Moderate)
    Coverage 5–10%  -> 0.30 (Low)
    Coverage < 5%   -> 0.10 (Very Poor)

    Smooth piecewise-linear mapping.
    """
    if loan_amount <= 0:
        return 0.5  # No loan = neutral
    ratio = savings / loan_amount
    if ratio >= 0.30:
        return 1.0
    elif ratio >= 0.20:
        # Linear from 0.75 -> 1.0 over [0.20, 0.30]
        return 0.75 + (ratio - 0.20) / 0.10 * 0.25
    elif ratio >= 0.10:
        # Linear from 0.50 -> 0.75 over [0.10, 0.20]
        return 0.50 + (ratio - 0.10) / 0.10 * 0.25
    elif ratio >= 0.05:
        # Linear from 0.30 -> 0.50 over [0.05, 0.10]
        return 0.30 + (ratio - 0.05) / 0.05 * 0.20
    elif ratio >= 0.0:
        # Linear from 0.10 -> 0.30 over [0.0, 0.05]
        return 0.10 + ratio / 0.05 * 0.20
    else:
        return 0.10


def _score_debt_ratio(debt_ratio: float) -> float:
    """
    Lower debt ratio -> higher score (gradual, no hard cutoffs).

    debt_ratio ≤ 0.10 -> 1.00
    debt_ratio 0.10–0.30 -> linear from 1.0 -> 0.60
    debt_ratio 0.30–0.50 -> linear from 0.60 -> 0.30
    debt_ratio 0.50–0.70 -> linear from 0.30 -> 0.10
    debt_ratio > 0.70 -> 0.0
    """
    dr = max(0.0, debt_ratio)
    if dr <= 0.10:
        return 1.0
    elif dr <= 0.30:
        return 1.0 - (dr - 0.10) / 0.20 * 0.40
    elif dr <= 0.50:
        return 0.60 - (dr - 0.30) / 0.20 * 0.30
    elif dr <= 0.70:
        return 0.30 - (dr - 0.50) / 0.20 * 0.20
    else:
        return 0.0


def _score_existing_loans(num_loans: int) -> float:
    """
    0 loans -> 1.00 (Excellent)
    1 loan  -> 0.75 (Good)
    2 loans -> 0.50 (Moderate)
    3+ loans-> 0.25 (Poor — but NOT zero; does not auto-reject)
    """
    num = int(max(0, num_loans))
    if num == 0:
        return 1.00
    elif num == 1:
        return 0.75
    elif num == 2:
        return 0.50
    else:
        return 0.25


def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    src_path = os.path.join(base_dir, "datasets", "home_loan_dataset_v2.xlsx")
    dst_path = os.path.join(base_dir, "datasets", "home_loan_dataset_v3.xlsx")

    print("=" * 70)
    print("  Home Loan Dataset — Realistic Underwriting Labels (v2 -> v3)")
    print("  Zero randomness | FOIR-dominant scoring")
    print("=" * 70)

    # ------------------------------------------------------------------
    # 1. Load and normalise column names
    # ------------------------------------------------------------------
    df = pd.read_excel(src_path)
    print(f"\nLoaded {src_path}")
    print(f"  Rows: {df.shape[0]}  |  Columns: {list(df.columns)}")

    col_map = {
        'ApplicantIncome': 'applicant_income',
        'CoapplicantIncome': 'coapplicant_income',
        'LoanAmount': 'loan_amount',
        'Loan_Amount_Term': 'loan_amount_term',
        'Credit_History': 'credit_history',
        'Savings_Balance': 'savings',
        'Debt_To_Income': 'debt_ratio',
        'Existing_Loans': 'existing_loans',
        'Gender': 'gender',
        'Married': 'married',
        'Dependents': 'dependents',
        'Education': 'education',
        'Self_Employed': 'self_employed',
        'Property_Area': 'property_area',
        'Loan_Status': 'loan_status',
    }
    rev_map = {v: k for k, v in col_map.items()}
    df.rename(columns={k: v for k, v in col_map.items() if k in df.columns},
              inplace=True)

    # Coerce numerics
    for c in ['applicant_income', 'coapplicant_income', 'loan_amount',
              'loan_amount_term', 'credit_history', 'savings',
              'debt_ratio', 'existing_loans']:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors='coerce')

    # Fill NaN with safe defaults
    df['applicant_income'] = df['applicant_income'].fillna(0)
    df['coapplicant_income'] = df['coapplicant_income'].fillna(0)
    df['loan_amount'] = df['loan_amount'].fillna(0)
    df['loan_amount_term'] = df['loan_amount_term'].fillna(360)
    df['credit_history'] = df['credit_history'].fillna(0)
    df['savings'] = df['savings'].fillna(0)
    df['debt_ratio'] = df['debt_ratio'].fillna(0)
    df['existing_loans'] = df['existing_loans'].fillna(0)

    # Record original approval rate
    orig_labels = (df['loan_status'].astype(str).str.strip().str.upper()
                   .map({'Y': 1, 'N': 0, 'YES': 1, 'NO': 0}))
    orig_approval_rate = orig_labels.mean()
    print(f"\n  Original approval rate: {orig_approval_rate:.3f} "
          f"({int(orig_labels.sum())}/{len(orig_labels)})")

    # ------------------------------------------------------------------
    # 2. Compute per-row underwriting score (DETERMINISTIC, no randomness)
    # ------------------------------------------------------------------
    n = len(df)

    # --- FOIR component (45% weight) ---
    emi = df.apply(
        lambda r: _compute_monthly_emi(
            r['loan_amount'],
            INTEREST_RATE,
            int(r['loan_amount_term']) if r['loan_amount_term'] > 0 else 360
        ), axis=1
    )
    total_income = df['applicant_income'] + df['coapplicant_income']
    # Avoid division by zero; treat zero income as extremely high FOIR
    foir_values = np.where(total_income > 0, emi / total_income, 10.0)
    foir_score = np.array([_score_foir(f) for f in foir_values])

    # --- Credit History component (25% weight) ---
    credit_score = np.array([
        _score_credit_history(ch) for ch in df['credit_history'].values
    ])

    # --- Savings Coverage component (15% weight) ---
    savings_score = np.array([
        _score_savings_coverage(s, la)
        for s, la in zip(df['savings'].values, df['loan_amount'].values)
    ])

    # --- Debt Ratio component (10% weight) ---
    debt_score = np.array([
        _score_debt_ratio(dr) for dr in df['debt_ratio'].values
    ])

    # --- Existing Loans component (5% weight) ---
    existing_score = np.array([
        _score_existing_loans(el) for el in df['existing_loans'].values
    ])

    # --- Weighted composite (NO noise, NO randomness) ---
    composite = (
        W_FOIR * foir_score
        + W_CREDIT_HISTORY * credit_score
        + W_SAVINGS_COVERAGE * savings_score
        + W_DEBT_RATIO * debt_score
        + W_EXISTING_LOANS * existing_score
    )

    # ------------------------------------------------------------------
    # 3. Calibrate threshold to roughly match original approval rate
    # ------------------------------------------------------------------
    target_n_approved = max(1, int(round(orig_approval_rate * n)))
    threshold = np.sort(composite)[::-1][target_n_approved - 1]

    new_labels = (composite >= threshold).astype(int)
    new_approval_rate = new_labels.mean()

    print(f"  New approval rate:      {new_approval_rate:.3f} "
          f"({int(new_labels.sum())}/{n})")
    print(f"  Score threshold used:   {threshold:.4f}")

    # ------------------------------------------------------------------
    # 4. Detailed diagnostics
    # ------------------------------------------------------------------
    print("\n  -- Underwriting Score Component Statistics --")
    for name, arr in [("FOIR Score", foir_score),
                      ("Credit Score", credit_score),
                      ("Savings Score", savings_score),
                      ("Debt Score", debt_score),
                      ("Existing Loans Score", existing_score),
                      ("COMPOSITE", composite)]:
        print(f"    {name:25s}  mean={np.mean(arr):.4f}  "
              f"std={np.std(arr):.4f}  "
              f"min={np.min(arr):.4f}  max={np.max(arr):.4f}")

    print("\n  -- FOIR Distribution --")
    foir_pct = foir_values * 100
    for label, lo, hi in [("<=30% (Excellent)", 0, 30),
                          ("30-40% (Good)", 30, 40),
                          ("40-50% (Acceptable)", 40, 50),
                          ("50-60% (Risky)", 50, 60),
                          (">60% (Very Poor)", 60, 9999)]:
        count = np.sum((foir_pct > lo) & (foir_pct <= hi)) if lo > 0 else np.sum(foir_pct <= hi)
        print(f"    {label:25s}  {count:5d}  ({count/n*100:.1f}%)")

    print("\n  -- Correlation with NEW label --")
    for col in ['applicant_income', 'coapplicant_income', 'loan_amount',
                'loan_amount_term', 'credit_history', 'savings',
                'debt_ratio', 'existing_loans']:
        corr = np.corrcoef(df[col].values.astype(float), new_labels)[0, 1]
        orig_corr = np.corrcoef(df[col].values.astype(float),
                                orig_labels.values)[0, 1]
        delta = corr - orig_corr
        print(f"    {col:25s}  new={corr:+.4f}  old={orig_corr:+.4f}  "
              f"delta={delta:+.4f}")

    # Verify demographic independence
    print("\n  -- Demographic Independence Check --")
    for col in ['gender', 'married', 'dependents']:
        if col in df.columns:
            grouped = df.groupby(col).apply(
                lambda g: new_labels[g.index].mean()
            )
            diff = grouped.max() - grouped.min()
            status = "[PASS]" if diff < 0.10 else "[CHECK]"
            print(f"    {col:15s}  approval rates: {dict(grouped.round(3))}  "
                  f"max_diff={diff:.3f}  {status}")

    # ------------------------------------------------------------------
    # 5. Write v3 dataset
    # ------------------------------------------------------------------
    df['loan_status'] = np.where(new_labels == 1, 'Y', 'N')

    # Rename columns back to original headers
    df.rename(columns={v: k for k, v in col_map.items()
                       if v in df.columns and k != v},
              inplace=True)

    df.to_excel(dst_path, index=False)
    print(f"\n  [OK] Saved: {dst_path}")
    print(f"\n  SUMMARY")
    print(f"  |-- Noise weight:       0%  (fully deterministic)")
    print(f"  |-- FOIR weight:       45%  (dominant factor)")
    print(f"  |-- Credit History:    25%")
    print(f"  |-- Savings Coverage:  15%")
    print(f"  |-- Debt Ratio:        10%")
    print(f"  +-- Existing Loans:     5%")
    print("=" * 70)


if __name__ == '__main__':
    main()
