from django.contrib import admin
from .models import Bank, LoanApplication


@admin.register(Bank)
class BankAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'bank_name',
        'loan_type',
        'interest_rate',
        'processing_fee',
        'minimum_income',
        'minimum_credit_score',
        'maximum_loan_amount',
        'is_active',
    )
    search_fields = ('bank_name', 'loan_type')
    list_filter = ('loan_type', 'is_active', 'minimum_credit_score')
    ordering = ('bank_name', 'interest_rate')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(LoanApplication)
class LoanApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'loan_amount',
        'loan_amount_term',
        'applicant_income',
        'status',
        'prediction',
        'confidence_score',
        'created_at',
    )
    search_fields = ('user__username', 'user__email', 'id')
    list_filter = ('status', 'prediction', 'property_area', 'education', 'self_employed', 'created_at')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
