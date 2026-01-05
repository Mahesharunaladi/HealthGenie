"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration"""
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class PredictionType(str, Enum):
    """Prediction type enumeration"""
    BRAIN_TUMOR = "brain_tumor"
    DIABETES = "diabetes"


class RiskLevel(str, Enum):
    """Risk level enumeration"""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


# Patient Schemas
class PatientBase(BaseModel):
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    pass


class PatientResponse(PatientBase):
    id: str
    user_id: str
    medical_history: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Doctor Schemas
class DoctorBase(BaseModel):
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    years_of_experience: Optional[int] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    hospital_affiliation: Optional[str] = None


class DoctorCreate(DoctorBase):
    pass


class DoctorUpdate(DoctorBase):
    pass


class DoctorResponse(DoctorBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Medical Record Schemas
class MedicalRecordBase(BaseModel):
    record_type: str
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class MedicalRecordCreate(MedicalRecordBase):
    pass


class MedicalRecordResponse(MedicalRecordBase):
    id: str
    patient_id: str
    file_path: Optional[str] = None
    file_url: Optional[str] = None
    uploaded_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Prediction Schemas
class DiabetesInput(BaseModel):
    pregnancies: int = Field(ge=0, le=20)
    glucose_level: float = Field(ge=0, le=300)
    blood_pressure: float = Field(ge=0, le=200)
    skin_thickness: float = Field(ge=0, le=100)
    insulin: float = Field(ge=0, le=900)
    bmi: float = Field(ge=0, le=70)
    diabetes_pedigree: float = Field(ge=0, le=3)
    age: int = Field(ge=1, le=120)


class PredictionBase(BaseModel):
    prediction_type: PredictionType
    input_data: Dict[str, Any]


class PredictionCreate(PredictionBase):
    patient_id: str
    medical_record_id: Optional[str] = None


class PredictionResponse(PredictionBase):
    id: str
    patient_id: str
    result: str
    confidence_score: float
    risk_level: str
    detailed_analysis: Optional[Dict[str, Any]] = None
    reviewed_by: Optional[str] = None
    doctor_notes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class BrainTumorPredictionResponse(BaseModel):
    prediction_id: str
    result: str
    confidence_score: float
    tumor_detected: bool
    risk_level: str
    analysis: Dict[str, Any]
    recommendations: List[str]


class DiabetesPredictionResponse(BaseModel):
    prediction_id: str
    result: str
    probability: float
    risk_level: str
    risk_factors: List[str]
    recommendations: List[str]


# Appointment Schemas
class AppointmentBase(BaseModel):
    doctor_id: str
    appointment_date: datetime
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    patient_id: str


class AppointmentResponse(AppointmentBase):
    id: str
    patient_id: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Report Schemas
class ReportGenerate(BaseModel):
    prediction_id: str
    include_medical_history: bool = True
    include_recommendations: bool = True


class ReportResponse(BaseModel):
    report_id: str
    report_url: str
    generated_at: datetime
