from django.urls import path
from .views import LoanPredictionAPIView, LoanHistoryAPIView

urlpatterns = [
    path('predict/', LoanPredictionAPIView.as_view(), name='loan_predict'),
    path('history/', LoanHistoryAPIView.as_view(), name='loan_history'),
]
