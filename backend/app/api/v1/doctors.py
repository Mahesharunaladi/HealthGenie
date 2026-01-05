"""
Doctor management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User, Doctor, Prediction
from app.schemas.schemas import DoctorResponse, DoctorUpdate, PredictionResponse

router = APIRouter()


@router.get("/profile", response_model=DoctorResponse)
async def get_doctor_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current doctor's profile"""
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access this endpoint"
        )
    
    if not current_user.doctor_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    
    return current_user.doctor_profile


@router.put("/profile", response_model=DoctorResponse)
async def update_doctor_profile(
    profile_data: DoctorUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current doctor's profile"""
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access this endpoint"
        )
    
    doctor = current_user.doctor_profile
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    
    # Update fields
    update_data = profile_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doctor, field, value)
    
    db.commit()
    db.refresh(doctor)
    
    return doctor


@router.post("/review-prediction/{prediction_id}")
async def review_prediction(
    prediction_id: str,
    doctor_notes: str,
    approve: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Review and approve/reject a prediction"""
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can review predictions"
        )
    
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    prediction.reviewed_by = current_user.id
    prediction.doctor_notes = doctor_notes
    prediction.status = "approved" if approve else "rejected"
    
    db.commit()
    db.refresh(prediction)
    
    return {"message": "Prediction reviewed successfully", "prediction_id": prediction.id}
