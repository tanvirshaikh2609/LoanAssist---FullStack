from django.db import models
from django.conf import settings
from django.utils import timezone


class Bank(models.Model):
    LOAN_TYPE_CHOICES = (
        ('home', 'Home Loan'),
        ('personal', 'Personal Loan'),
        ('education', 'Education Loan'),
        ('car', 'Car Loan'),
        ('business', 'Business Loan'),
    )

    bank_name = models.CharField(max_length=255)
    loan_type = models.CharField(max_length=50, choices=LOAN_TYPE_CHOICES, default='home')
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Annual interest rate in %")
    processing_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Processing fee in INR")
    minimum_income = models.DecimalField(max_digits=12, decimal_places=2, default=25000.00, help_text="Minimum monthly income required (INR)")
    minimum_credit_score = models.IntegerField(default=650)
    maximum_loan_amount = models.DecimalField(max_digits=15, decimal_places=2, default=10000000.00, help_text="Maximum loan amount in INR")
    website = models.URLField(blank=True, null=True)
    logo = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bank Offering"
        verbose_name_plural = "Bank Offerings"
        ordering = ['bank_name', 'interest_rate']

    def __str__(self):
        return f"{self.bank_name} - {self.get_loan_type_display()} ({self.interest_rate}%)"


class LoanApplication(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )

    DEPENDENTS_CHOICES = (
        ('0', '0'),
        ('1', '1'),
        ('2', '2'),
        ('3+', '3+'),
    )

    EDUCATION_CHOICES = (
        ('Graduate', 'Graduate'),
        ('Not Graduate', 'Not Graduate'),
    )

    PROPERTY_AREA_CHOICES = (
        ('Urban', 'Urban'),
        ('Semiurban', 'Semiurban'),
        ('Rural', 'Rural'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('PROCESSING', 'Processing'),
    )

    PREDICTION_CHOICES = (
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    # Relationship
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='loan_applications'
    )

    # ML Input Features (Home Loan Dataset)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    married = models.BooleanField(default=False)
    dependents = models.CharField(max_length=10, choices=DEPENDENTS_CHOICES, default='0')
    education = models.CharField(max_length=20, choices=EDUCATION_CHOICES, default='Graduate')
    self_employed = models.BooleanField(default=False)

    applicant_income = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Monthly applicant income")
    coapplicant_income = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Monthly co-applicant income")
    loan_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Loan amount requested")
    loan_amount_term = models.IntegerField(default=360, help_text="Term of loan in months")
    credit_history = models.FloatField(null=True, blank=True, help_text="Credit history score (1.0 for good, 0.0 for bad)")
    property_area = models.CharField(max_length=20, choices=PROPERTY_AREA_CHOICES, default='Urban')

    # Extended ML input features
    savings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Total savings amount")
    debt_ratio = models.FloatField(null=True, blank=True, help_text="Debt-to-income ratio")
    existing_loans = models.IntegerField(default=0, help_text="Number of existing active loans")

    # Lifecycle & ML Output fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    prediction = models.CharField(max_length=20, choices=PREDICTION_CHOICES, null=True, blank=True, help_text="ML model decision")
    confidence_score = models.FloatField(null=True, blank=True, help_text="ML model confidence score (0.0 to 1.0)")

    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Loan Application"
        verbose_name_plural = "Loan Applications"
        ordering = ['-created_at']

    def __str__(self):
        return f"LoanApp #{self.id} - {self.user.username} (${self.loan_amount}) - {self.status}"
