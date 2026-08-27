import pandas as pd
import numpy as np
from .model_loader import ModelLoader


def preprocess_loan_input(data: dict) -> np.ndarray:
    """
    Cleans and structures raw input dictionary for Home Loan prediction,
    and applies the serialized fitted ColumnTransformer preprocessor.
    """
    numerical_cols = [
        'applicant_income', 'coapplicant_income', 'loan_amount',
        'loan_amount_term', 'credit_history', 'savings',
        'debt_ratio', 'existing_loans'
    ]
    categorical_cols = [
        'gender', 'married', 'dependents', 'education',
        'self_employed', 'property_area'
    ]
    
    row = {}
    for col in numerical_cols:
        val = data.get(col, 0.0)
        try:
            row[col] = float(val) if val is not None else np.nan
        except (ValueError, TypeError):
            row[col] = np.nan
            
    for col in categorical_cols:
        val = data.get(col, '')
        if val is None or val == '' or str(val).lower() == 'nan':
            row[col] = np.nan
        else:
            # Handle boolean mapping for married and self_employed if passed as bool from Django model
            if isinstance(val, bool):
                row[col] = 'Yes' if val else 'No'
            elif str(val).lower() in ['true', 'yes', '1']:
                row[col] = 'Yes'
            elif str(val).lower() in ['false', 'no', '0'] and col in ['married', 'self_employed']:
                row[col] = 'No'
            else:
                row[col] = str(val)
                
    df = pd.DataFrame([row])
    preprocessor = ModelLoader.get_loan_preprocessor()
    transformed_features = preprocessor.transform(df)
    return transformed_features


def preprocess_card_input(data: dict) -> np.ndarray:
    """
    Cleans and structures raw input dictionary for Credit Card prediction,
    and applies the serialized fitted ColumnTransformer preprocessor.
    """
    numerical_cols = [
        'age', 'annual_income', 'credit_score', 'existing_credit_cards',
        'total_debt', 'monthly_housing_payment', 'bank_balance'
    ]
    categorical_cols = [
        'employment_status', 'selected_credit_card'
    ]
    
    row = {}
    for col in numerical_cols:
        val = data.get(col, 0.0)
        try:
            row[col] = float(val) if val is not None else np.nan
        except (ValueError, TypeError):
            row[col] = np.nan
            
    for col in categorical_cols:
        val = data.get(col, '')
        if val is None or val == '' or str(val).lower() == 'nan':
            row[col] = np.nan
        else:
            row[col] = str(val)
            
    df = pd.DataFrame([row])
    preprocessor = ModelLoader.get_card_preprocessor()
    transformed_features = preprocessor.transform(df)
    return transformed_features
