from rest_framework import serializers
from .models import LoanApplication


class LoanPredictionSerializer(serializers.ModelSerializer):
    """
    Serializer to validate incoming Home Loan application data.
    Validates features required for prediction without ML or recommendation logic.
    """
    class Meta:
        model = LoanApplication
        fields = [
            'gender',
            'married',
            'dependents',
            'education',
            'self_employed',
            'applicant_income',
            'coapplicant_income',
            'loan_amount',
            'loan_amount_term',
            'credit_history',
            'property_area',
            'savings',
            'debt_ratio',
            'existing_loans',
        ]


class LoanApplicationHistorySerializer(serializers.ModelSerializer):
    """
    Serializer to format past loan applications for the dashboard history.
    """
    class Meta:
        model = LoanApplication
        fields = [
            'id',
            'created_at',
            'prediction',
            'confidence_score',
            'status',
            'loan_amount',
        ]

