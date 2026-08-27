from django.contrib import admin
from .models import CreditCard, CreditCardApplication


@admin.register(CreditCard)
class CreditCardAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'bank_name',
        'card_name',
        'category',
        'annual_fee',
        'minimum_income',
        'minimum_credit_score',
        'is_active',
        'created_at',
    )
    search_fields = ('bank_name', 'card_name', 'category')
    list_filter = ('category', 'is_active', 'bank_name', 'created_at')
    ordering = ('bank_name', 'card_name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CreditCardApplication)
class CreditCardApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'selected_credit_card',
        'annual_income',
        'credit_score',
        'status',
        'prediction',
        'confidence_score',
        'created_at',
    )
    search_fields = ('user__username', 'user__email', 'id')
    list_filter = ('status', 'prediction', 'employment_status', 'created_at')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
