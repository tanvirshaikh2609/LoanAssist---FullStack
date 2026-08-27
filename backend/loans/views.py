from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import LoanPredictionSerializer, LoanApplicationHistorySerializer
from .models import LoanApplication
from .loan_service import LoanService


class LoanPredictionAPIView(APIView):
    """
    API endpoint for Home Loan eligibility evaluation.
    Requires JWT authentication.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = LoanPredictionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create LoanApplication record linked to the authenticated user
            application = serializer.save(user=request.user, status='PENDING')

            # Evaluate eligibility using the service layer
            result = LoanService.evaluate_loan_eligibility(application)

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
                    "recommended_banks": result.get("recommended_banks", []),
                    "rejection_reasons": result.get("rejection_reasons", []),
                    "improvement_suggestions": result.get("improvement_suggestions", []),
                    "financial_health": result.get("financial_health", {}),
                    "emi_details": result.get("emi_details", {}),
                },
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"error": "An unexpected error occurred while processing the loan prediction."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoanHistoryAPIView(APIView):
    """
    API endpoint to retrieve the logged-in user's loan application history.
    Requires JWT authentication.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # SECURITY BUG FIX: Must filter by the authenticated user
        applications = LoanApplication.objects.filter(user=request.user).order_by('-created_at')
        serializer = LoanApplicationHistorySerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
