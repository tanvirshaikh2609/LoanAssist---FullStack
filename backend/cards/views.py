from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import CreditCardPredictionSerializer, CreditCardApplicationHistorySerializer, CreditCardCatalogSerializer
from .models import CreditCardApplication, CreditCard
from .card_service import CreditCardService


class CreditCardPredictionAPIView(APIView):
    """
    API endpoint for Credit Card eligibility evaluation.
    Requires JWT authentication.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = CreditCardPredictionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create CreditCardApplication record linked to the authenticated user
            application = serializer.save(user=request.user, status='PENDING')

            # Evaluate eligibility using the service layer
            result = CreditCardService.evaluate_card_eligibility(application)

            # Map prediction outcome to status and persist in database
            prediction_label = result.get('prediction', 'Rejected')
            conf_score = result.get('confidence_score', 0.0)
            new_status = 'APPROVED' if prediction_label == 'Approved' else 'REJECTED'

            application.prediction = prediction_label
            application.confidence_score = conf_score
            application.status = new_status
            application.save()

            return Response(
                {
                    "application_id": application.id,
                    "prediction": application.prediction,
                    "confidence_score": application.confidence_score,
                    "status": application.status,
                    "recommended_cards": result.get("recommended_cards", []),
                    "total_eligible_cards": result.get("total_eligible_cards", 0),
                    "total_available_cards": result.get("total_available_cards", 0),
                    "rejection_reasons": result.get("rejection_reasons", []),
                    "improvement_suggestions": result.get("improvement_suggestions", []),
                    "financial_health": result.get("financial_health", {}),
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": "An unexpected error occurred while processing the credit card prediction."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CreditCardHistoryAPIView(APIView):
    """
    API endpoint to retrieve the logged-in user's credit card application history.
    Requires JWT authentication.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # SECURITY BUG FIX: Must filter by the authenticated user
        applications = CreditCardApplication.objects.filter(user=request.user).order_by('-created_at')
        serializer = CreditCardApplicationHistorySerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreditCardCatalogAPIView(APIView):
    """
    API endpoint to retrieve all active credit cards for the catalog.
    Publicly accessible to allow instant catalog browsing.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        cards = CreditCard.objects.filter(is_active=True).order_by('bank_name', 'card_name')
        serializer = CreditCardCatalogSerializer(cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
