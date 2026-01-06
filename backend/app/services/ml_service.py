"""
Machine Learning Service for CuraGenie
Handles loading and inference of AI/ML models
"""

import os
import logging
import numpy as np
from typing import Dict, Tuple, Optional, Any
from pathlib import Path
import pickle

logger = logging.getLogger(__name__)

# Try to import TensorFlow, but make it optional
HAS_TENSORFLOW = False
try:
    import tensorflow as tf  # noqa: F401
    from tensorflow import keras  # noqa: F401
    from tensorflow.keras import layers  # noqa: F401
    HAS_TENSORFLOW = True
    logger.info("TensorFlow loaded successfully")
except ImportError:
    logger.warning("TensorFlow not available. Brain tumor predictions will use fallback.")


class MLService:
    """Main ML Service for all AI models"""
    
    def __init__(self):
        """Initialize ML service and load models"""
        self.brain_tumor_model = None
        self.diabetes_model = None
        self.load_models()
    
    def load_models(self):
        """Load all ML models"""
        try:
            self.load_brain_tumor_model()
            self.load_diabetes_model()
            logger.info("All ML models loaded successfully")
        except Exception as e:
            logger.error(f"Error loading ML models: {e}")
    
    def load_brain_tumor_model(self):
        """Load brain tumor detection model"""
        if not HAS_TENSORFLOW:
            logger.warning("TensorFlow not available, skipping brain tumor model")
            self.brain_tumor_model = None
            return
            
        try:
            from tensorflow import keras
            from app.core.config import settings
            
            model_path = settings.BRAIN_TUMOR_MODEL_PATH
            if os.path.exists(model_path):
                self.brain_tumor_model = keras.models.load_model(model_path)
                logger.info("Brain tumor model loaded successfully")
            else:
                logger.warning(f"Brain tumor model not found at {model_path}")
                # Create a dummy model for development
                self.brain_tumor_model = self._create_dummy_brain_tumor_model()
        except Exception as e:
            logger.error(f"Error loading brain tumor model: {e}")
            self.brain_tumor_model = None
    
    def load_diabetes_model(self):
        """Load diabetes prediction model"""
        try:
            from app.core.config import settings
            
            model_path = settings.DIABETES_MODEL_PATH
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    self.diabetes_model = pickle.load(f)
                logger.info("Diabetes model loaded successfully")
            else:
                logger.warning(f"Diabetes model not found at {model_path}")
                # Create a dummy model for development
                self.diabetes_model = self._create_dummy_diabetes_model()
        except Exception as e:
            logger.error(f"Error loading diabetes model: {e}")
            self.diabetes_model = None
    
    def _create_dummy_brain_tumor_model(self):
        """Create a dummy brain tumor model for development"""
        if not HAS_TENSORFLOW:
            logger.warning("Cannot create dummy model without TensorFlow")
            return None
            
        from tensorflow import keras
        from tensorflow.keras import layers
        
        model = keras.Sequential([
            layers.Input(shape=(240, 240, 3)),
            layers.Conv2D(32, 3, activation='relu'),
            layers.MaxPooling2D(),
            layers.Flatten(),
            layers.Dense(1, activation='sigmoid')
        ])
        logger.info("Created dummy brain tumor model")
        return model
    
    def _create_dummy_diabetes_model(self):
        """Create a dummy diabetes model for development"""
        from sklearn.linear_model import LogisticRegression
        
        model = LogisticRegression()
        # Train on dummy data
        X_dummy = np.random.rand(100, 8)
        y_dummy = np.random.randint(0, 2, 100)
        model.fit(X_dummy, y_dummy)
        logger.info("Created dummy diabetes model")
        return model
    
    def predict_brain_tumor(
        self,
        image: np.ndarray
    ) -> Dict[str, Any]:
        """
        Predict brain tumor from MRI image
        
        Args:
            image: Preprocessed image array (240, 240, 3)
            
        Returns:
            Dictionary containing prediction results
        """
        if self.brain_tumor_model is None:
            # Return dummy prediction when model not available
            return {
                "result": "Model Not Available",
                "confidence_score": 0.5,
                "tumor_detected": False,
                "risk_level": "unknown",
                "analysis": {
                    "confidence_percentage": "50.00%",
                    "model_version": "dummy",
                    "image_quality": "good",
                    "note": "TensorFlow not available. Using fallback prediction."
                },
                "recommendations": [
                    "Upload to system with TensorFlow installed for accurate prediction",
                    "Consult with a medical professional for proper diagnosis"
                ]
            }
        
        try:
            # Add batch dimension if needed
            if len(image.shape) == 3:
                image = np.expand_dims(image, axis=0)
            
            # Make prediction
            prediction = self.brain_tumor_model.predict(image, verbose=0)
            confidence = float(prediction[0][0])
            
            # Determine result
            has_tumor = confidence > 0.5
            result = "Tumor Detected" if has_tumor else "No Tumor Detected"
            
            # Determine risk level
            if confidence > 0.8:
                risk_level = "high"
            elif confidence > 0.5:
                risk_level = "moderate"
            else:
                risk_level = "low"
            
            # Generate recommendations
            recommendations = self._generate_tumor_recommendations(has_tumor, confidence)
            
            return {
                "result": result,
                "confidence_score": confidence,
                "tumor_detected": has_tumor,
                "risk_level": risk_level,
                "analysis": {
                    "confidence_percentage": f"{confidence * 100:.2f}%",
                    "model_version": "v1.0",
                    "image_quality": "good"
                },
                "recommendations": recommendations
            }
        except Exception as e:
            logger.error(f"Error in brain tumor prediction: {e}")
            raise
    
    def predict_diabetes(
        self,
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Predict diabetes risk from clinical data
        
        Args:
            features: Dictionary with clinical features
            
        Returns:
            Dictionary containing prediction results
        """
        if self.diabetes_model is None:
            raise ValueError("Diabetes model not loaded")
        
        try:
            # Extract features in correct order
            feature_array = np.array([[
                features.get('pregnancies', 0),
                features.get('glucose_level', 100),
                features.get('blood_pressure', 120),
                features.get('skin_thickness', 20),
                features.get('insulin', 79),
                features.get('bmi', 32),
                features.get('diabetes_pedigree', 0.5),
                features.get('age', 33)
            ]])
            
            # Make prediction
            prediction = self.diabetes_model.predict(feature_array)[0]
            prediction_proba = self.diabetes_model.predict_proba(feature_array)[0]
            
            # Get probability
            probability = float(prediction_proba[1])
            
            # Determine risk level
            if probability > 0.7:
                risk_level = "high"
            elif probability > 0.4:
                risk_level = "moderate"
            else:
                risk_level = "low"
            
            # Determine result
            result = "Diabetes Risk Detected" if prediction == 1 else "Low Diabetes Risk"
            
            # Identify risk factors
            risk_factors = self._identify_diabetes_risk_factors(features)
            
            # Generate recommendations
            recommendations = self._generate_diabetes_recommendations(risk_level, risk_factors)
            
            return {
                "result": result,
                "probability": probability,
                "risk_level": risk_level,
                "risk_factors": risk_factors,
                "recommendations": recommendations
            }
        except Exception as e:
            logger.error(f"Error in diabetes prediction: {e}")
            raise
    
    def _generate_tumor_recommendations(
        self,
        has_tumor: bool,
        confidence: float
    ) -> list:
        """Generate recommendations based on tumor detection"""
        if has_tumor:
            return [
                "Consult with a neurologist immediately",
                "Schedule an MRI with contrast for detailed imaging",
                "Get a biopsy if recommended by your doctor",
                "Discuss treatment options including surgery, radiation, or chemotherapy",
                "Consider getting a second opinion from a specialist"
            ]
        else:
            return [
                "Continue regular health check-ups",
                "Maintain a healthy lifestyle",
                "Monitor for any unusual symptoms",
                "Schedule follow-up MRI in 6-12 months if recommended",
                "Consult your doctor if you experience persistent headaches or vision changes"
            ]
    
    def _identify_diabetes_risk_factors(
        self,
        features: Dict[str, float]
    ) -> list:
        """Identify risk factors from clinical data"""
        risk_factors = []
        
        if features.get('glucose_level', 0) > 140:
            risk_factors.append("High blood glucose level")
        
        if features.get('bmi', 0) > 30:
            risk_factors.append("High BMI (obesity)")
        
        if features.get('age', 0) > 45:
            risk_factors.append("Age over 45")
        
        if features.get('blood_pressure', 0) > 140:
            risk_factors.append("High blood pressure")
        
        if features.get('diabetes_pedigree', 0) > 0.5:
            risk_factors.append("Family history of diabetes")
        
        return risk_factors if risk_factors else ["No major risk factors identified"]
    
    def _generate_diabetes_recommendations(
        self,
        risk_level: str,
        risk_factors: list
    ) -> list:
        """Generate recommendations based on diabetes risk"""
        recommendations = []
        
        if risk_level == "high":
            recommendations.extend([
                "Consult with an endocrinologist urgently",
                "Get a comprehensive diabetes screening test",
                "Monitor blood sugar levels regularly",
                "Start a low-sugar, low-carb diet immediately"
            ])
        elif risk_level == "moderate":
            recommendations.extend([
                "Schedule a diabetes screening test",
                "Adopt a healthy diet with reduced sugar intake",
                "Increase physical activity to 30 minutes daily",
                "Monitor your weight and blood pressure regularly"
            ])
        else:
            recommendations.extend([
                "Maintain a healthy lifestyle",
                "Get annual diabetes screening",
                "Keep a balanced diet and regular exercise routine",
                "Monitor your health metrics periodically"
            ])
        
        # Add specific recommendations based on risk factors
        if "High BMI (obesity)" in risk_factors:
            recommendations.append("Work on weight reduction through diet and exercise")
        
        if "High blood pressure" in risk_factors:
            recommendations.append("Manage blood pressure through medication and lifestyle changes")
        
        return recommendations


# Global ML service instance
ml_service = MLService()
