from rest_framework import serializers
from .models import CreditCardApplication, CreditCard


class FlexibleCreditCardField(serializers.PrimaryKeyRelatedField):
    """
    Accepts either an integer primary key or the exact card name as string, or null.
    """
    def __init__(self, **kwargs):
        kwargs.setdefault('queryset', CreditCard.objects.all())
        kwargs.setdefault('required', False)
        kwargs.setdefault('allow_null', True)
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        if data is None or data == "" or str(data).lower() == 'null':
            return None
        if isinstance(data, int) or (isinstance(data, str) and data.isdigit()):
            try:
                return CreditCard.objects.get(pk=int(data))
            except CreditCard.DoesNotExist:
                pass
        if isinstance(data, str):
            try:
                return CreditCard.objects.get(card_name__iexact=data)
            except CreditCard.DoesNotExist:
                raise serializers.ValidationError(f"Credit card '{data}' not found.")
        raise serializers.ValidationError("Invalid credit card ID or card name.")


class CreditCardPredictionSerializer(serializers.ModelSerializer):
    """
    Serializer to validate incoming Credit Card eligibility evaluation data.
    Validates features without ML or recommendation logic.
    """
    selected_credit_card = FlexibleCreditCardField()

    class Meta:
        model = CreditCardApplication
        fields = [
            'age',
            'annual_income',
            'credit_score',
            'employment_status',
            'existing_credit_cards',
            'total_debt',
            'monthly_housing_payment',
            'bank_balance',
            'selected_credit_card',
        ]


class CreditCardApplicationHistorySerializer(serializers.ModelSerializer):
    """
    Serializer to format past credit card applications for the dashboard history.
    """
    class Meta:
        model = CreditCardApplication
        fields = [
            'id',
            'created_at',
            'prediction',
            'confidence_score',
            'status',
        ]


class CreditCardCatalogSerializer(serializers.ModelSerializer):
    """
    Serializer to format the active credit card catalog for the Explore All Cards view.
    """
    image_url = serializers.URLField(source='image', read_only=True)

    class Meta:
        model = CreditCard
        fields = [
            'id', 'bank_name', 'card_name', 'annual_fee', 'joining_fee',
            'minimum_income', 'minimum_credit_score', 'reward_type',
            'category', 'benefits', 'image_url'
        ]
