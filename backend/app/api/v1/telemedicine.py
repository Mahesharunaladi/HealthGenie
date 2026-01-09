"""
Telemedicine Video Consultation API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User, Appointment, Patient, Doctor, Prescription

router = APIRouter()


class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: datetime
    appointment_type: str = "video_call"  # consultation, video_call, follow_up
    duration: int = 30
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    appointment_date: datetime
    appointment_type: str
    duration: int
    video_room_id: Optional[str]
    status: str
    notes: Optional[str]
    payment_status: str
    payment_amount: Optional[float]
    created_at: datetime


class VideoRoomResponse(BaseModel):
    room_id: str
    appointment_id: str
    join_url: str
    expires_at: datetime


class PrescriptionCreate(BaseModel):
    appointment_id: str
    patient_id: str
    medications: List[dict]  # [{name, dosage, frequency, duration}]
    diagnosis: str
    instructions: Optional[str] = None
    valid_days: int = 30


class PrescriptionResponse(BaseModel):
    id: str
    appointment_id: str
    patient_id: str
    doctor_id: str
    medications: List[dict]
    diagnosis: str
    instructions: Optional[str]
    valid_until: datetime
    status: str
    created_at: datetime


class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


@router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(
    appointment: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new appointment (patient only)
    """
    # Verify user is a patient
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can book appointments"
        )
    
    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Calculate payment amount (example pricing)
    pricing = {
        "consultation": 50.0,
        "video_call": 75.0,
        "follow_up": 30.0
    }
    payment_amount = pricing.get(appointment.appointment_type, 50.0)
    
    # Create appointment
    new_appointment = Appointment(
        patient_id=patient.id,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        appointment_type=appointment.appointment_type,
        duration=appointment.duration,
        notes=appointment.notes,
        status="scheduled",
        payment_status="pending",
        payment_amount=payment_amount
    )
    
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    
    return AppointmentResponse(
        id=new_appointment.id,
        patient_id=new_appointment.patient_id,
        doctor_id=new_appointment.doctor_id,
        appointment_date=new_appointment.appointment_date,
        appointment_type=new_appointment.appointment_type,
        duration=new_appointment.duration,
        video_room_id=new_appointment.video_room_id,
        status=new_appointment.status,
        notes=new_appointment.notes,
        payment_status=new_appointment.payment_status,
        payment_amount=new_appointment.payment_amount,
        created_at=new_appointment.created_at
    )


@router.get("/appointments", response_model=List[AppointmentResponse])
async def get_appointments(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get appointments for current user (patient or doctor)
    """
    query = db.query(Appointment)
    
    # Filter based on user role
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    
    if patient:
        query = query.filter(Appointment.patient_id == patient.id)
    elif doctor:
        query = query.filter(Appointment.doctor_id == doctor.id)
    else:
        return []
    
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    
    appointments = query.order_by(Appointment.appointment_date.desc()).all()
    
    return [
        AppointmentResponse(
            id=a.id,
            patient_id=a.patient_id,
            doctor_id=a.doctor_id,
            appointment_date=a.appointment_date,
            appointment_type=a.appointment_type,
            duration=a.duration,
            video_room_id=a.video_room_id,
            status=a.status,
            notes=a.notes,
            payment_status=a.payment_status,
            payment_amount=a.payment_amount,
            created_at=a.created_at
        )
        for a in appointments
    ]


@router.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific appointment details
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Verify user has access
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    
    if patient and appointment.patient_id != patient.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if doctor and appointment.doctor_id != doctor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if not patient and not doctor:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return AppointmentResponse(
        id=appointment.id,
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        appointment_type=appointment.appointment_type,
        duration=appointment.duration,
        video_room_id=appointment.video_room_id,
        status=appointment.status,
        notes=appointment.notes,
        payment_status=appointment.payment_status,
        payment_amount=appointment.payment_amount,
        created_at=appointment.created_at
    )


@router.patch("/appointments/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    update: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update appointment status or notes
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    if update.status:
        appointment.status = update.status
    if update.notes:
        appointment.notes = update.notes
    
    db.commit()
    db.refresh(appointment)
    
    return AppointmentResponse(
        id=appointment.id,
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        appointment_type=appointment.appointment_type,
        duration=appointment.duration,
        video_room_id=appointment.video_room_id,
        status=appointment.status,
        notes=appointment.notes,
        payment_status=appointment.payment_status,
        payment_amount=appointment.payment_amount,
        created_at=appointment.created_at
    )


@router.post("/appointments/{appointment_id}/start-video", response_model=VideoRoomResponse)
async def start_video_session(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate video room for appointment
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Generate room ID if not exists
    if not appointment.video_room_id:
        appointment.video_room_id = f"room_{uuid.uuid4().hex[:16]}"
        appointment.status = "in_progress"
        db.commit()
    
    # In production, integrate with Twilio/Agora/Daily.co
    # For now, return a simple WebRTC room identifier
    join_url = f"/telemedicine/room/{appointment.video_room_id}"
    expires_at = appointment.appointment_date + timedelta(minutes=appointment.duration + 15)
    
    return VideoRoomResponse(
        room_id=appointment.video_room_id,
        appointment_id=appointment_id,
        join_url=join_url,
        expires_at=expires_at
    )


@router.post("/prescriptions", response_model=PrescriptionResponse)
async def create_prescription(
    prescription: PrescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create prescription (doctors only)
    """
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can create prescriptions"
        )
    
    # Verify appointment exists
    appointment = db.query(Appointment).filter(Appointment.id == prescription.appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    valid_until = datetime.now() + timedelta(days=prescription.valid_days)
    
    new_prescription = Prescription(
        appointment_id=prescription.appointment_id,
        patient_id=prescription.patient_id,
        doctor_id=doctor.id,
        medications=prescription.medications,
        diagnosis=prescription.diagnosis,
        instructions=prescription.instructions,
        valid_until=valid_until,
        status="active"
    )
    
    db.add(new_prescription)
    db.commit()
    db.refresh(new_prescription)
    
    return PrescriptionResponse(
        id=new_prescription.id,
        appointment_id=new_prescription.appointment_id,
        patient_id=new_prescription.patient_id,
        doctor_id=new_prescription.doctor_id,
        medications=new_prescription.medications,
        diagnosis=new_prescription.diagnosis,
        instructions=new_prescription.instructions,
        valid_until=new_prescription.valid_until,
        status=new_prescription.status,
        created_at=new_prescription.created_at
    )


@router.get("/prescriptions", response_model=List[PrescriptionResponse])
async def get_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get prescriptions for current user
    """
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    
    query = db.query(Prescription)
    
    if patient:
        query = query.filter(Prescription.patient_id == patient.id)
    elif doctor:
        query = query.filter(Prescription.doctor_id == doctor.id)
    else:
        return []
    
    prescriptions = query.order_by(Prescription.created_at.desc()).all()
    
    return [
        PrescriptionResponse(
            id=p.id,
            appointment_id=p.appointment_id,
            patient_id=p.patient_id,
            doctor_id=p.doctor_id,
            medications=p.medications,
            diagnosis=p.diagnosis,
            instructions=p.instructions,
            valid_until=p.valid_until,
            status=p.status,
            created_at=p.created_at
        )
        for p in prescriptions
    ]
