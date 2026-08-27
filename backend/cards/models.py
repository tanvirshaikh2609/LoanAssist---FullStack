from django.db import models
from django.conf import settings
from django.utils import timezone


class CreditCard(models.Model):
    CATEGORY_CHOICES = (
        ('travel', 'Travel'),
        ('cashback', 'Cashback'),
        ('rewards', 'Rewards'),
        ('student', 'Student'),
        ('business', 'Business'),
        ('premium', 'Premium'),
    )

    bank_name = models.CharField(max_length=255, default="Partner Bank")
    card_name = models.CharField(max_length=255, default="Standard Card")
    annual_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    joining_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    minimum_income = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Minimum annual income required")
    minimum_credit_score = models.IntegerField(default=650)
    reward_type = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., Cashback, Reward Points, Air Miles")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='rewards')
    benefits = models.JSONField(default=list, blank=True, help_text="List of structured benefits or bullet points")
    image = models.URLField(blank=True, null=True, help_text="Card image URL")
    is_active = models.BooleanField(default=True, help_text="Set to False to hide card from catalog without deleting historical applications")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Credit Card"
        verbose_name_plural = "Credit Cards"
        ordering = ['bank_name', 'card_name']

    def __str__(self):
        return f"{self.bank_name} - {self.card_name}"


class CreditCardApplication(models.Model):
    EMPLOYMENT_STATUS_CHOICES = (
        ('employed', 'Employed'),
        ('self_employed', 'Self Employed'),
        ('unemployed', 'Unemployed'),
        ('student', 'Student'),
        ('retired', 'Retired'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    PREDICTION_CHOICES = (
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='card_applications'
    )
    selected_credit_card = models.ForeignKey(
        CreditCard,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications',
        help_text="Target credit card (null if applying for general recommendation)"
    )

    # ML Input Features (Credit Card Eligibility Dataset)
    age = models.IntegerField(null=True, blank=True)
    annual_income = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Applicant annual income")
    credit_score = models.IntegerField(null=True, blank=True)
    employment_status = models.CharField(max_length=30, choices=EMPLOYMENT_STATUS_CHOICES, default='employed')
    existing_credit_cards = models.IntegerField(default=0, help_text="Number of existing credit cards held")
    total_debt = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Total current debt")
    monthly_housing_payment = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    bank_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # Lifecycle & ML Output fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    prediction = models.CharField(max_length=20, choices=PREDICTION_CHOICES, null=True, blank=True, help_text="ML predicted outcome")
    confidence_score = models.FloatField(null=True, blank=True, help_text="ML model confidence score (0.0 to 1.0)")

    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Credit Card Application"
        verbose_name_plural = "Credit Card Applications"
        ordering = ['-created_at']

    def __str__(self):
        card_name = self.selected_credit_card.card_name if self.selected_credit_card else "General Evaluation"
        return f"CardApp #{self.id} - {self.user.username} ({card_name}) - {self.status}"
