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
    appointment_type = Column(String, default="consultation")  # consultation, video_call, follow_up
    duration = Column(Integer, default=30)  # minutes
    video_room_id = Column(String, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, in_progress, completed, cancelled
    notes = Column(Text)
    prescription = Column(JSON, nullable=True)
    payment_status = Column(String, default="pending")  # pending, paid, refunded
    payment_amount = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ChatMessage(Base):
    """AI Chatbot conversation history"""
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    role = Column(String, nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    message_metadata = Column(JSON, nullable=True)  # attachments, context, etc.
    session_id = Column(String, nullable=True)  # group conversations
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HealthMetric(Base):
    """Real-time health monitoring metrics"""
    __tablename__ = "health_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"))
    metric_type = Column(String, nullable=False)  # heart_rate, blood_pressure, glucose, oxygen, temperature
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)  # bpm, mmHg, mg/dL, %, °F
    systolic = Column(Float, nullable=True)  # for blood pressure
    diastolic = Column(Float, nullable=True)  # for blood pressure
    device_id = Column(String, nullable=True)  # wearable device identifier
    notes = Column(Text, nullable=True)
    is_alert = Column(Boolean, default=False)  # triggered alert
    alert_message = Column(String, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Prescription(Base):
    """Doctor prescriptions"""
    __tablename__ = "prescriptions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    appointment_id = Column(String, ForeignKey("appointments.id"))
    patient_id = Column(String, ForeignKey("patients.id"))
    doctor_id = Column(String, ForeignKey("doctors.id"))
    medications = Column(JSON, nullable=False)  # [{name, dosage, frequency, duration}]
    diagnosis = Column(Text, nullable=False)
    instructions = Column(Text)
    valid_until = Column(DateTime)
    status = Column(String, default="active")  # active, expired, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FamilyMember(Base):
    """Family members for family health management"""
    __tablename__ = "family_members"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    primary_user_id = Column(String, ForeignKey("users.id"))  # Parent/Guardian
    full_name = Column(String, nullable=False)
    relationship = Column(String, nullable=False)  # parent, spouse, child, sibling, grandparent
    date_of_birth = Column(DateTime, nullable=False)
    gender = Column(String)
    blood_group = Column(String)
    phone = Column(String)
    email = Column(String)
    photo_url = Column(String)
    
    # Medical information
    medical_history = Column(JSON)  # [{condition, diagnosed_date, status}]
    allergies = Column(JSON)  # [allergy_name]
    chronic_conditions = Column(JSON)  # [condition_name]
    current_medications = Column(JSON)  # [{name, dosage, frequency}]
    emergency_contact = Column(String)
    insurance_info = Column(JSON)  # {provider, policy_number, group_number}
    
    # Genetic & Family Health
    genetic_risk_factors = Column(JSON)  # [{condition, risk_level, notes}]
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FamilyHealthTimeline(Base):
    """Timeline of health events for family"""
    __tablename__ = "family_health_timeline"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    family_member_id = Column(String, ForeignKey("family_members.id"))
    event_type = Column(String, nullable=False)  # diagnosis, surgery, vaccination, checkup, emergency
    event_title = Column(String, nullable=False)
    event_description = Column(Text)
    event_date = Column(DateTime, nullable=False)
    doctor_name = Column(String)
    hospital = Column(String)
    attachments = Column(JSON)  # [{file_name, file_url, file_type}]
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DoctorAvailability(Base):
    """Doctor availability schedule for appointments"""
    __tablename__ = "doctor_availability"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doctor_id = Column(String, ForeignKey("doctors.id"))
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String, nullable=False)  # "09:00"
    end_time = Column(String, nullable=False)  # "17:00"
    is_available = Column(Boolean, default=True)
    slot_duration = Column(Integer, default=30)  # minutes
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    """Payment records for appointments and services"""
    __tablename__ = "payments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    appointment_id = Column(String, ForeignKey("appointments.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    payment_method = Column(String)  # credit_card, debit_card, insurance, cash
    payment_provider = Column(String)  # stripe, paypal, etc.
    transaction_id = Column(String, unique=True)
    status = Column(String, default="pending")  # pending, completed, failed, refunded
    payment_date = Column(DateTime)
    receipt_url = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
