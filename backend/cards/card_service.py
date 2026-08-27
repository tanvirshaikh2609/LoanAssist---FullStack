from typing import Union, Dict, Any
from ml_models.predictor import predict_credit_card
from recommendation_engine.card_recommender import CardRecommender
from recommendation_engine.rejection_analyzer import RejectionAnalyzer
from recommendation_engine.improvement_engine import ImprovementEngine
from financial_engine.financial_health import FinancialHealthAnalyzer
from cards.models import CreditCard


class CreditCardService:
    """
    Service layer for Credit Card eligibility evaluations.
    Handles input conversion, invokes the ML prediction pipeline,
    and returns prediction along with confidence score and rule-based card recommendations.
    """

    @staticmethod
    def evaluate_card_eligibility(input_data: Union[Dict[str, Any], Any]) -> Dict[str, Any]:
        """
        Evaluates credit card eligibility using the trained ML model and generates card recommendations.
        
        Args:
            input_data: Either a validated dictionary of features or a CreditCardApplication model instance.
            
        Returns:
            dict with keys:
                - 'prediction': 'Approved' or 'Rejected'
                - 'confidence_score': float between 0.0 and 1.0
                - 'recommended_cards': list of recommended card dictionaries
                - 'rejection_reasons': list of reasons for rejection
                - 'improvement_suggestions': list of suggestions for improvement
                - 'financial_health': dictionary containing financial health score and details
        """
        if hasattr(input_data, '__dict__') and not isinstance(input_data, dict):
            # If selected_credit_card is a ForeignKey instance, extract card_name or str representation
            selected_card = getattr(input_data, 'selected_credit_card', None)
            selected_card_name = getattr(selected_card, 'card_name', str(selected_card)) if selected_card else ''
            
            data_dict = {
                'age': getattr(input_data, 'age', 30),
                'annual_income': getattr(input_data, 'annual_income', 0.0),
                'credit_score': getattr(input_data, 'credit_score', 700),
                'employment_status': getattr(input_data, 'employment_status', 'employed'),
                'existing_credit_cards': getattr(input_data, 'existing_credit_cards', 0),
                'total_debt': getattr(input_data, 'total_debt', 0.0),
                'monthly_housing_payment': getattr(input_data, 'monthly_housing_payment', 0.0),
                'bank_balance': getattr(input_data, 'bank_balance', 0.0),
                'selected_credit_card': selected_card_name,
            }
        else:
            data_dict = dict(input_data)

        has_specific_card = bool(data_dict.get('selected_credit_card'))

        if has_specific_card:
            # Existing behavior: ML evaluates fitness for exactly this card
            result = predict_credit_card(data_dict)
        else:
            # General evaluation: don't let the ML model silently substitute
            # a random specific card. Instead, ask the rule-based recommender
            # directly — it already filters the real catalog by this
            # applicant's actual income/credit score against each card's
            # real minimum_income/minimum_credit_score.
            recommend_result = CardRecommender.recommend_cards(data_dict, top_n=5)
            candidate_cards = recommend_result.get("recommended_cards", [])
            total_eligible = recommend_result.get("total_eligible_cards", 0)
            total_available = recommend_result.get("total_available_cards", 0)
            
            if candidate_cards:
                top_score = candidate_cards[0].get('recommendation_score', 70)
                result = {
                    'prediction': 'Approved',
                    'confidence_score': round(min(top_score / 100, 0.95), 4),
                    'total_eligible_cards': total_eligible,
                    'total_available_cards': total_available,
                }
            else:
                result = {
                    'prediction': 'Rejected',
                    'confidence_score': 0.75,
                }

        # Generate rule-based recommendations if prediction is Approved
        if result['prediction'] == 'Approved':
            if has_specific_card:
                rec_res = CardRecommender.recommend_cards(data_dict, top_n=5)
                result['recommended_cards'] = rec_res.get("recommended_cards", [])
                result['total_eligible_cards'] = rec_res.get("total_eligible_cards", 0)
                result['total_available_cards'] = rec_res.get("total_available_cards", 0)
            else:
                result['recommended_cards'] = candidate_cards
            result['rejection_reasons'] = []
            result['improvement_suggestions'] = []
        else:
            result['recommended_cards'] = []
            result['total_eligible_cards'] = 0
            result['total_available_cards'] = CreditCard.objects.filter(is_active=True).count()
            reasons = RejectionAnalyzer.analyze_credit_card_rejection(data_dict)
            
            if not has_specific_card and len(reasons) == 1 and "Overall financial profile" in reasons[0]:
                credit_score = int(data_dict.get('credit_score', 0))
                
                # Find the cheapest-to-reach card in the full catalog
                # Lowest minimum_income among cards where credit_score already qualifies
                cheapest_card = CreditCard.objects.filter(is_active=True, minimum_credit_score__lte=credit_score).order_by('minimum_income').first()
                
                # Or vice versa if credit score doesn't qualify for anything
                if not cheapest_card:
                    annual_income = float(data_dict.get('annual_income', 0.0))
                    cheapest_card = CreditCard.objects.filter(is_active=True, minimum_income__lte=annual_income).order_by('minimum_credit_score').first()
                
                # If STILL nothing (neither income nor credit score meets ANY card's individual requirement), just get the absolute easiest card
                if not cheapest_card:
                    cheapest_card = CreditCard.objects.filter(is_active=True).order_by('minimum_income', 'minimum_credit_score').first()

                if cheapest_card:
                    reasons = [f"You're close — increasing your annual income to ₹{cheapest_card.minimum_income:,.0f} or your credit score to {cheapest_card.minimum_credit_score} would qualify you for {cheapest_card.card_name}."]

            result['rejection_reasons'] = reasons
            result['improvement_suggestions'] = ImprovementEngine.generate_credit_card_improvements(reasons)

        # Always calculate financial health
        result['financial_health'] = FinancialHealthAnalyzer.analyze_card_health(data_dict)

        # If input_data was a model instance, optionally update fields in memory
        if hasattr(input_data, '__dict__') and not isinstance(input_data, dict):
            setattr(input_data, 'prediction', result['prediction'])
            setattr(input_data, 'confidence_score', result['confidence_score'])

        return result
