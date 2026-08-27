from django.urls import path
from .views import CreditCardPredictionAPIView, CreditCardHistoryAPIView, CreditCardCatalogAPIView

urlpatterns = [
    path('predict/', CreditCardPredictionAPIView.as_view(), name='card_predict'),
    path('history/', CreditCardHistoryAPIView.as_view(), name='card_history'),
    path('catalog/', CreditCardCatalogAPIView.as_view(), name='card_catalog'),
]
