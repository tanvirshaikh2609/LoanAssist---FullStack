import os
import joblib

class ModelLoader:
    """
    Singleton-style model loader that caches serialized models and preprocessors in memory
    to avoid repeated disk reads during inference.
    """
    _loan_model = None
    _loan_preprocessor = None
    _card_model = None
    _card_preprocessor = None

    @classmethod
    def get_base_dir(cls):
        return os.path.abspath(os.path.dirname(__file__))

    @classmethod
    def get_loan_model(cls):
        if cls._loan_model is None:
            model_path = os.path.join(cls.get_base_dir(), "loan_model.joblib")
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Loan model not found at {model_path}. Please run train_models.py first.")
            cls._loan_model = joblib.load(model_path)
        return cls._loan_model

    @classmethod
    def get_loan_preprocessor(cls):
        if cls._loan_preprocessor is None:
            prep_path = os.path.join(cls.get_base_dir(), "loan_preprocessor.joblib")
            if not os.path.exists(prep_path):
                raise FileNotFoundError(f"Loan preprocessor not found at {prep_path}. Please run train_models.py first.")
            cls._loan_preprocessor = joblib.load(prep_path)
        return cls._loan_preprocessor

    @classmethod
    def get_card_model(cls):
        if cls._card_model is None:
            model_path = os.path.join(cls.get_base_dir(), "credit_card_model.joblib")
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Credit card model not found at {model_path}. Please run train_models.py first.")
            cls._card_model = joblib.load(model_path)
        return cls._card_model

    @classmethod
    def get_card_preprocessor(cls):
        if cls._card_preprocessor is None:
            prep_path = os.path.join(cls.get_base_dir(), "credit_card_preprocessor.joblib")
            if not os.path.exists(prep_path):
                raise FileNotFoundError(f"Credit card preprocessor not found at {prep_path}. Please run train_models.py first.")
            cls._card_preprocessor = joblib.load(prep_path)
        return cls._card_preprocessor

    @classmethod
    def clear_cache(cls):
        """Clears in-memory cached models and preprocessors (useful for testing or re-loading)."""
        cls._loan_model = None
        cls._loan_preprocessor = None
        cls._card_model = None
        cls._card_preprocessor = None
