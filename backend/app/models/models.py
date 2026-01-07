"""
Database models for CuraGenie
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class User(Base):
    """Base user model"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # patient, doctor, admin
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)


class Patient(Base):
    """Patient profile model"""
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    date_of_birth = Column(DateTime)
    gender = Column(String)
    blood_group = Column(String)
    phone = Column(String)
    address = Column(Text)
    emergency_contact = Column(String)
    medical_history = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")
    medical_records = relationship("MedicalRecord", back_populates="patient")
    predictions = relationship("Prediction", back_populates="patient")


class Doctor(Base):
    """Doctor profile model"""
    __tablename__ = "doctors"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    specialization = Column(String)
    license_number = Column(String, unique=True)
    years_of_experience = Column(Integer)
    phone = Column(String)
    bio = Column(Text)
    hospital_affiliation = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    reviews = relationship("DoctorReview", back_populates="doctor")


class MedicalRecord(Base):
    """Medical records model"""
    __tablename__ = "medical_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"))
    record_type = Column(String)  # mri, xray, blood_test, etc.
    file_path = Column(String)
    file_url = Column(String)
    description = Column(Text)
    uploaded_by = Column(String)
    record_metadata = Column(JSON)  # Renamed from 'metadata' to avoid SQLAlchemy conflict
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="medical_records")


class Prediction(Base):
    """ML Prediction results model"""
    __tablename__ = "predictions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"))
    prediction_type = Column(String)  # brain_tumor, diabetes, etc.
    input_data = Column(JSON)
    result = Column(String)
    confidence_score = Column(Float)
    risk_level = Column(String)
    detailed_analysis = Column(JSON)
    medical_record_id = Column(String, ForeignKey("medical_records.id"), nullable=True)
    reviewed_by = Column(String, nullable=True)
    doctor_notes = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, reviewed, approved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="predictions")


class DoctorReview(Base):
    """Doctor reviews and ratings"""
    __tablename__ = "doctor_reviews"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doctor_id = Column(String, ForeignKey("doctors.id"))
    patient_id = Column(String, ForeignKey("patients.id"))
    rating = Column(Integer)  # 1-5
    review = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    doctor = relationship("Doctor", back_populates="reviews")


class Appointment(Base):
    """Appointments model"""
    __tablename__ = "appointments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"))
    doctor_id = Column(String, ForeignKey("doctors.id"))
    appointment_date = Column(DateTime)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
