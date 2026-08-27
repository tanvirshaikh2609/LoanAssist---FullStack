import os
import shutil
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def evaluate_model(model, X_test, y_test, model_name="Model"):
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, pos_label=1, zero_division=0)
    rec = recall_score(y_test, y_pred, pos_label=1, zero_division=0)
    f1 = f1_score(y_test, y_pred, pos_label=1, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"\n==========================================")
    print(f" Evaluation Results: {model_name}")
    print(f"==========================================")
    print(f"Accuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"Confusion Matrix:\n{cm}")
    return {"accuracy": acc, "precision": prec, "recall": rec, "f1_score": f1}


def print_feature_importance_report(rf_model, all_feature_names):
    """
    Print a comprehensive feature importance report.
    Groups one-hot-encoded categorical features back to their parent feature.
    Highlights key underwriting variables.
    """
    importances = rf_model.feature_importances_
    fi_df = pd.DataFrame({
        'feature': all_feature_names,
        'importance': importances
    }).sort_values('importance', ascending=False)

    print("\n" + "=" * 70)
    print(" FEATURE IMPORTANCE REPORT")
    print("=" * 70)

    print("\n-- Individual Feature Importances --\n")
    for _, row in fi_df.iterrows():
        bar = '#' * int(row['importance'] * 100)
        print(f"  {row['feature']:35s} {row['importance']:.4f}  {bar}")

    # Group by parent feature (collapse one-hot categories)
    print("\n-- Grouped Feature Importances --\n")
    grouped = {}
    for feat, imp in zip(all_feature_names, importances):
        # Determine parent: e.g., "gender_Male" -> "gender"
        parent = feat
        for prefix in ['gender_', 'married_', 'dependents_', 'education_',
                        'self_employed_', 'property_area_']:
            if feat.startswith(prefix):
                parent = prefix.rstrip('_')
                break
        grouped[parent] = grouped.get(parent, 0.0) + imp

    grouped_sorted = sorted(grouped.items(), key=lambda x: x[1], reverse=True)
    for feat, imp in grouped_sorted:
        bar = '#' * int(imp * 100)
        print(f"  {feat:35s} {imp:.4f}  {bar}")

    # Highlight key underwriting variables
    print("\n-- Key Underwriting Variable Summary --\n")
    key_vars = {
        'FOIR-related (income + loan_amount)': 0.0,
        'credit_history': 0.0,
        'savings': 0.0,
        'debt_ratio': 0.0,
        'existing_loans': 0.0,
        'Demographics (gender+married+dependents)': 0.0,
    }
    for feat, imp in grouped.items():
        if feat in ['applicant_income', 'coapplicant_income', 'loan_amount',
                     'loan_amount_term']:
            key_vars['FOIR-related (income + loan_amount)'] += imp
        elif feat == 'credit_history':
            key_vars['credit_history'] += imp
        elif feat == 'savings':
            key_vars['savings'] += imp
        elif feat == 'debt_ratio':
            key_vars['debt_ratio'] += imp
        elif feat == 'existing_loans':
            key_vars['existing_loans'] += imp
        elif feat in ['gender', 'married', 'dependents']:
            key_vars['Demographics (gender+married+dependents)'] += imp

    for name, imp in key_vars.items():
        flag = ""
        if name == 'Demographics (gender+married+dependents)':
            flag = " <-- should be LOW" if imp < 0.10 else " [!] TOO HIGH"
        elif name == 'FOIR-related (income + loan_amount)':
            flag = " <-- should be HIGH" if imp >= 0.15 else " [!] TOO LOW"
        print(f"  {name:45s} {imp:.4f} ({imp*100:.1f}%){flag}")

    total_underwriting = sum(v for k, v in key_vars.items()
                             if k != 'Demographics (gender+married+dependents)')
    demo_total = key_vars['Demographics (gender+married+dependents)']
    print(f"\n  Underwriting factors combined: {total_underwriting:.4f} ({total_underwriting*100:.1f}%)")
    print(f"  Demographic factors combined: {demo_total:.4f} ({demo_total*100:.1f}%)")
    if demo_total < 0.10:
        print("  [OK] Demographics have minimal influence - model is fair")
    else:
        print("  [!] Demographics may still influence decisions - review dataset")

    print("=" * 70)


def stability_test(model, preprocessor, numerical_cols, categorical_cols):
    """
    Run stability tests to verify the model behaves like a real bank.
    Tests small perturbations in income and demographic-only changes.
    """
    print("\n" + "=" * 70)
    print(" PREDICTION STABILITY TESTS")
    print("=" * 70)

    def predict_one(data_dict):
        row = {}
        for col in numerical_cols:
            row[col] = data_dict.get(col, 0.0)
        for col in categorical_cols:
            row[col] = data_dict.get(col, 'Male')
        df = pd.DataFrame([row])
        transformed = preprocessor.transform(df)
        pred = model.predict(transformed)[0]
        proba = model.predict_proba(transformed)[0]
        return pred, proba

    # Test 1: Small income change should NOT flip prediction
    print("\n-- Test 1: Income Stability (Rs.500 change) --")
    base_case = {
        'applicant_income': 74000, 'coapplicant_income': 0,
        'loan_amount': 3000000, 'loan_amount_term': 360,
        'credit_history': 1.0, 'savings': 500000,
        'debt_ratio': 0.2, 'existing_loans': 0,
        'gender': 'Male', 'married': 'Yes', 'dependents': '0',
        'education': 'Graduate', 'self_employed': 'No',
        'property_area': 'Urban'
    }

    pred1, prob1 = predict_one(base_case)
    base_case_plus = base_case.copy()
    base_case_plus['applicant_income'] = 74500
    pred2, prob2 = predict_one(base_case_plus)

    label1 = "Approved" if pred1 == 1 else "Rejected"
    label2 = "Approved" if pred2 == 1 else "Rejected"
    print(f"  Income Rs.74,000 -> {label1}  (proba: {prob1})")
    print(f"  Income Rs.74,500 -> {label2}  (proba: {prob2})")
    if pred1 == pred2:
        print("  [OK] STABLE: Small income change did not flip prediction")
    else:
        print("  [!] FLIPPED: Small income change changed prediction "
              "(may be near decision boundary)")

    # Test 2: Demographic change should NOT flip prediction
    print("\n-- Test 2: Demographic Stability --")
    good_applicant = {
        'applicant_income': 100000, 'coapplicant_income': 0,
        'loan_amount': 2000000, 'loan_amount_term': 360,
        'credit_history': 1.0, 'savings': 800000,
        'debt_ratio': 0.15, 'existing_loans': 0,
        'gender': 'Male', 'married': 'Yes', 'dependents': '0',
        'education': 'Graduate', 'self_employed': 'No',
        'property_area': 'Urban'
    }
    pred_base, prob_base = predict_one(good_applicant)

    # Flip gender
    variant_g = good_applicant.copy()
    variant_g['gender'] = 'Female'
    pred_g, prob_g = predict_one(variant_g)

    # Flip marital status
    variant_m = good_applicant.copy()
    variant_m['married'] = 'No'
    pred_m, prob_m = predict_one(variant_m)

    # Change dependents
    variant_d = good_applicant.copy()
    variant_d['dependents'] = '3+'
    pred_d, prob_d = predict_one(variant_d)

    base_label = "Approved" if pred_base == 1 else "Rejected"
    print(f"  Base (Male, Married, 0 deps)   -> {base_label}  proba={prob_base}")
    print(f"  Gender -> Female               -> {'Approved' if pred_g==1 else 'Rejected'}  proba={prob_g}")
    print(f"  Married -> No                  -> {'Approved' if pred_m==1 else 'Rejected'}  proba={prob_m}")
    print(f"  Dependents -> 3+               -> {'Approved' if pred_d==1 else 'Rejected'}  proba={prob_d}")

    flips = sum([pred_base != pred_g, pred_base != pred_m, pred_base != pred_d])
    if flips == 0:
        print("  [OK] ALL STABLE: Demographic changes did not flip prediction")
    else:
        print(f"  [!] {flips}/3 predictions flipped due to demographic changes")

    # Test 3: Strong approval candidate should always be approved
    print("\n-- Test 3: Strong Approval Case --")
    strong = {
        'applicant_income': 150000, 'coapplicant_income': 50000,
        'loan_amount': 2000000, 'loan_amount_term': 360,
        'credit_history': 1.0, 'savings': 1000000,
        'debt_ratio': 0.10, 'existing_loans': 0,
        'gender': 'Male', 'married': 'Yes', 'dependents': '1',
        'education': 'Graduate', 'self_employed': 'No',
        'property_area': 'Urban'
    }
    pred_s, prob_s = predict_one(strong)
    print(f"  High income, low FOIR, good credit -> {'Approved' if pred_s==1 else 'Rejected'}  proba={prob_s}")
    if pred_s == 1:
        print("  [OK] CORRECT: Strong candidate approved")
    else:
        print("  [!] ISSUE: Strong candidate rejected")

    # Test 4: Weak rejection case
    print("\n-- Test 4: Clear Rejection Case --")
    weak = {
        'applicant_income': 20000, 'coapplicant_income': 0,
        'loan_amount': 5000000, 'loan_amount_term': 360,
        'credit_history': 0.0, 'savings': 10000,
        'debt_ratio': 0.60, 'existing_loans': 3,
        'gender': 'Male', 'married': 'No', 'dependents': '0',
        'education': 'Not Graduate', 'self_employed': 'No',
        'property_area': 'Rural'
    }
    pred_w, prob_w = predict_one(weak)
    print(f"  Low income, high FOIR, no credit -> {'Approved' if pred_w==1 else 'Rejected'}  proba={prob_w}")
    if pred_w == 0:
        print("  [OK] CORRECT: Weak candidate rejected")
    else:
        print("  [!] ISSUE: Weak candidate approved")

    print("=" * 70)


def train_loan_pipeline(base_dir):
    print("\n\n############################################################")
    print(" 1. TRAINING HOME LOAN PREDICTION PIPELINE (Random Forest)")
    print("    Phase ML 2.0 - Realistic Banking Underwriting")
    print("############################################################")
    
    dataset_path = os.path.join(base_dir, "datasets", "home_loan_dataset_v3.xlsx")
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found. Run regenerate_training_data.py first.")
        return
    df = pd.read_excel(dataset_path)
    print(f"Loaded Home Loan dataset (v3): {df.shape[0]} rows")
    
    # Robustly rename columns to match snake_case used in the backend API
    column_mapping = {
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
    # Only rename columns that exist in the mapping to avoid issues if they are already snake_case
    df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns}, inplace=True)
    
    # Target encoding
    if 'loan_status' not in df.columns:
        print("Error: Target column 'loan_status' missing from dataset after mapping.")
        return

    df['target'] = df['loan_status'].astype(str).str.strip().str.upper().map({'Y': 1, 'N': 0, 'YES': 1, 'NO': 0})
    df = df.dropna(subset=['target'])
    
    numerical_cols = [
        'applicant_income', 'coapplicant_income', 'loan_amount',
        'loan_amount_term', 'credit_history', 'savings',
        'debt_ratio', 'existing_loans'
    ]
    categorical_cols = [
        'gender', 'married', 'dependents', 'education',
        'self_employed', 'property_area'
    ]
    
    # Validate missing columns
    missing = [c for c in numerical_cols + categorical_cols if c not in df.columns]
    if missing:
        print(f"Warning: The following required columns are missing and will be initialized as empty/NaN: {missing}")
        for c in missing:
            df[c] = np.nan

    # Clean data
    for col in numerical_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    for col in categorical_cols:
        df[col] = df[col].astype(str).replace({'nan': np.nan, 'None': np.nan, '': np.nan})
        
    X = df[numerical_cols + categorical_cols]
    y = df['target'].astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Preprocessor (same structure as before — no changes)
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    preprocessor = ColumnTransformer([
        ('num', num_pipeline, numerical_cols),
        ('cat', cat_pipeline, categorical_cols)
    ])
    
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)
    
    # Train — upgraded Random Forest for Phase ML 2.0
    rf_model = RandomForestClassifier(
        n_estimators=500,
        max_depth=12,
        min_samples_leaf=5,
        random_state=42,
        class_weight='balanced'
    )
    rf_model.fit(X_train_transformed, y_train)
    metrics = evaluate_model(rf_model, X_test_transformed, y_test, "Home Loan - Random Forest (ML 2.0)")
    
    # --- Feature importance report ---
    num_feature_names = numerical_cols[:]
    cat_feature_names = []
    cat_encoder = preprocessor.named_transformers_['cat'].named_steps['encoder']
    cat_feature_names = list(cat_encoder.get_feature_names_out(categorical_cols))
    all_feature_names = num_feature_names + cat_feature_names

    print_feature_importance_report(rf_model, all_feature_names)

    # --- Stability tests ---
    stability_test(rf_model, preprocessor, numerical_cols, categorical_cols)

    # Save (with backup of old models)
    output_dir = os.path.join(base_dir, "ml_models")
    os.makedirs(output_dir, exist_ok=True)

    model_path = os.path.join(output_dir, "loan_model.joblib")
    prep_path = os.path.join(output_dir, "loan_preprocessor.joblib")

    # Backup existing models before overwriting
    for src, bak_name in [(model_path, "loan_model_v2_backup.joblib"),
                          (prep_path, "loan_preprocessor_v2_backup.joblib")]:
        bak_path = os.path.join(output_dir, bak_name)
        if os.path.exists(src) and not os.path.exists(bak_path):
            shutil.copy2(src, bak_path)
            print(f"  Backed up: {os.path.basename(src)} -> {bak_name}")

    joblib.dump(preprocessor, prep_path)
    joblib.dump(rf_model, model_path)
    print("Saved Home Loan model and preprocessor (ML 2.0).")


def train_card_pipeline(base_dir):
    print("\n\n############################################################")
    print(" 2. TRAINING CREDIT CARD PIPELINE (Random Forest)")
    print("############################################################")
    
    dataset_path = os.path.join(base_dir, "datasets", "credit_card_dataset_v2.xlsx")
    df = pd.read_excel(dataset_path)
    print(f"Loaded Credit Card dataset: {df.shape[0]} rows")
    
    # Column mapping just in case dataset has different casing
    column_mapping = {
        'Age': 'age',
        'Annual_Income': 'annual_income',
        'Credit_Score': 'credit_score',
        'Existing_Credit_Cards': 'existing_credit_cards',
        'Total_Debt': 'total_debt',
        'Monthly_Housing_Payment': 'monthly_housing_payment',
        'Bank_Balance': 'bank_balance',
        'Employment_Status': 'employment_status',
        'Selected_Credit_Card': 'selected_credit_card',
        'Card_Eligibility': 'card_eligibility'
    }
    df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns}, inplace=True)
    
    if 'card_eligibility' not in df.columns:
        print("Error: Target column 'card_eligibility' missing from dataset after mapping.")
        return

    df['target'] = df['card_eligibility'].astype(str).str.strip().str.upper().map({'APPROVED': 1, 'REJECTED': 0})
    df = df.dropna(subset=['target'])
        
    numerical_cols = [
        'age', 'annual_income', 'credit_score', 'existing_credit_cards',
        'total_debt', 'monthly_housing_payment', 'bank_balance'
    ]
    categorical_cols = [
        'employment_status', 'selected_credit_card'
    ]
    
    missing = [c for c in numerical_cols + categorical_cols if c not in df.columns]
    if missing:
        print(f"Warning: The following required columns are missing and will be initialized as empty/NaN: {missing}")
        for c in missing:
            df[c] = np.nan

    for col in numerical_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    for col in categorical_cols:
        df[col] = df[col].astype(str).replace({'nan': np.nan, 'None': np.nan, '': np.nan})
        
    X = df[numerical_cols + categorical_cols]
    y = df['target'].astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Preprocessor
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    preprocessor = ColumnTransformer([
        ('num', num_pipeline, numerical_cols),
        ('cat', cat_pipeline, categorical_cols)
    ])
    
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)
    
    # Train
    rf_model = RandomForestClassifier(n_estimators=200, random_state=42, class_weight='balanced', max_depth=10)
    rf_model.fit(X_train_transformed, y_train)
    evaluate_model(rf_model, X_test_transformed, y_test, "Credit Card - Random Forest")
        
    output_dir = os.path.join(base_dir, "ml_models")
    os.makedirs(output_dir, exist_ok=True)
    joblib.dump(preprocessor, os.path.join(output_dir, "credit_card_preprocessor.joblib"))
    joblib.dump(rf_model, os.path.join(output_dir, "credit_card_model.joblib"))
    print("Saved Credit Card model and preprocessor.")


if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    print(f"Project Base Directory: {base_dir}")
    train_loan_pipeline(base_dir)
    train_card_pipeline(base_dir)
    print("\nAll training and serialization completed successfully!")
