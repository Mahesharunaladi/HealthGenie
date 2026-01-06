"""
Machine Learning prediction routes
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import shutil
from pathlib import Path
import uuid

from app.core.database import get_db
from app.core.config import settings
from app.api.v1.auth import get_current_user
from app.models.models import User, Prediction, MedicalRecord
from app.schemas.schemas import (
    DiabetesInput,
    BrainTumorPredictionResponse,
    DiabetesPredictionResponse,
    PredictionResponse
)
from app.services.ml_service import ml_service
from app.services.image_preprocessing import image_preprocessor

router = APIRouter()


@router.post("/predict-brain-tumor", response_model=BrainTumorPredictionResponse)
async def predict_brain_tumor(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predict brain tumor from MRI scan
    """
    # Validate file
    content_type = file.content_type or ""
    if not content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Save uploaded file
    file_id = str(uuid.uuid4())
    filename = file.filename or "upload.jpg"
    file_ext = Path(filename).suffix
    file_path = settings.UPLOAD_DIR / f"{file_id}{file_ext}"
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Validate image
        is_valid, message = image_preprocessor.validate_image(str(file_path))
        if not is_valid:
            file_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # Preprocess image
        preprocessed_image = image_preprocessor.preprocess_mri_image(str(file_path))
        
        # Make prediction
        prediction_result = ml_service.predict_brain_tumor(preprocessed_image)
        
        # Save medical record
        medical_record = MedicalRecord(
            patient_id=current_user.patient_profile.id if current_user.patient_profile else None,
            record_type="mri_brain",
            file_path=str(file_path),
            description="MRI scan for brain tumor detection",
            uploaded_by=current_user.id
        )
        db.add(medical_record)
        db.commit()
        db.refresh(medical_record)
        
        # Save prediction
        prediction = Prediction(
            patient_id=current_user.patient_profile.id if current_user.patient_profile else None,
            prediction_type="brain_tumor",
            input_data={"file_path": str(file_path)},
            result=prediction_result["result"],
            confidence_score=prediction_result["confidence_score"],
            risk_level=prediction_result["risk_level"],
            detailed_analysis=prediction_result["analysis"],
            medical_record_id=medical_record.id,
            status="pending"
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        
        return BrainTumorPredictionResponse(
            prediction_id=str(prediction.id),
            result=prediction_result["result"],
            confidence_score=prediction_result["confidence_score"],
            tumor_detected=prediction_result["tumor_detected"],
            risk_level=prediction_result["risk_level"],
            analysis=prediction_result["analysis"],
            recommendations=prediction_result["recommendations"]
        )
    
    except Exception as e:
        # Clean up file if error occurs
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )


@router.post("/predict-diabetes", response_model=DiabetesPredictionResponse)
async def predict_diabetes(
    data: DiabetesInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predict diabetes risk from clinical data
    """
    try:
        # Convert input to dictionary
        features = {
            "pregnancies": data.pregnancies,
            "glucose_level": data.glucose_level,
            "blood_pressure": data.blood_pressure,
            "skin_thickness": data.skin_thickness,
            "insulin": data.insulin,
            "bmi": data.bmi,
            "diabetes_pedigree": data.diabetes_pedigree,
            "age": data.age
        }
        
        # Make prediction
        prediction_result = ml_service.predict_diabetes(features)
        
        # Save prediction
        prediction = Prediction(
            patient_id=current_user.patient_profile.id if current_user.patient_profile else None,
            prediction_type="diabetes",
            input_data=features,
            result=prediction_result["result"],
            confidence_score=prediction_result["probability"],
            risk_level=prediction_result["risk_level"],
            detailed_analysis={
                "risk_factors": prediction_result["risk_factors"]
            },
            status="pending"
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        
        return DiabetesPredictionResponse(
            prediction_id=str(prediction.id),
            result=prediction_result["result"],
            probability=prediction_result["probability"],
            risk_level=prediction_result["risk_level"],
            risk_factors=prediction_result["risk_factors"],
            recommendations=prediction_result["recommendations"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error making prediction: {str(e)}"
        )


@router.get("/predictions", response_model=list[PredictionResponse])
async def get_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all predictions for the current user
    """
    if str(current_user.role) == "patient" and current_user.patient_profile:
        predictions = db.query(Prediction).filter(
            Prediction.patient_id == current_user.patient_profile.id
        ).offset(skip).limit(limit).all()
    else:
        # Doctors can see all predictions
        predictions = db.query(Prediction).offset(skip).limit(limit).all()
    
    return predictions


@router.get("/predictions/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(
    prediction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific prediction by ID
    """
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Check permissions
    if str(current_user.role) == "patient":
        if not current_user.patient_profile or prediction.patient_id != current_user.patient_profile.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this prediction"
            )
    
    return prediction


@router.get("/health")
async def ml_health_check():
    """
    Check ML service health
    """
    return {
        "status": "healthy",
        "brain_tumor_model": "loaded" if ml_service.brain_tumor_model else "not loaded",
        "diabetes_model": "loaded" if ml_service.diabetes_model else "not loaded"
    }
