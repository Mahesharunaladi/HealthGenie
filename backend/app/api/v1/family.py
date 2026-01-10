"""
Family Health Records API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User, FamilyMember, FamilyHealthTimeline

router = APIRouter()


class FamilyMemberCreate(BaseModel):
    full_name: str
    relationship: str  # parent, spouse, child, sibling, grandparent
    date_of_birth: datetime
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    medical_history: Optional[List[dict]] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    current_medications: Optional[List[dict]] = None
    emergency_contact: Optional[str] = None
    genetic_risk_factors: Optional[List[dict]] = None


class FamilyMemberResponse(BaseModel):
    id: str
    full_name: str
    relationship: str
    date_of_birth: datetime
    gender: Optional[str]
    blood_group: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    medical_history: Optional[List[dict]]
    allergies: Optional[List[str]]
    chronic_conditions: Optional[List[str]]
    current_medications: Optional[List[dict]]
    emergency_contact: Optional[str]
    genetic_risk_factors: Optional[List[dict]]
    age: int
    created_at: datetime


class FamilyMemberUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    medical_history: Optional[List[dict]] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    current_medications: Optional[List[dict]] = None
    emergency_contact: Optional[str] = None
    genetic_risk_factors: Optional[List[dict]] = None


class TimelineEventCreate(BaseModel):
    family_member_id: str
    event_type: str  # diagnosis, surgery, vaccination, checkup, emergency
    event_title: str
    event_description: Optional[str] = None
    event_date: datetime
    doctor_name: Optional[str] = None
    hospital: Optional[str] = None
    attachments: Optional[List[dict]] = None
    notes: Optional[str] = None


class TimelineEventResponse(BaseModel):
    id: str
    family_member_id: str
    event_type: str
    event_title: str
    event_description: Optional[str]
    event_date: datetime
    doctor_name: Optional[str]
    hospital: Optional[str]
    attachments: Optional[List[dict]]
    notes: Optional[str]
    created_at: datetime


class FamilyHealthSummary(BaseModel):
    total_members: int
    genetic_risks: List[dict]
    common_conditions: List[str]
    upcoming_checkups: List[dict]


def calculate_age(birth_date: datetime) -> int:
    """Calculate age from date of birth"""
    today = datetime.now()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def member_to_response(member: FamilyMember) -> FamilyMemberResponse:
    """Convert ORM FamilyMember to Pydantic response model"""
    return FamilyMemberResponse(
        id=str(member.id),  # type: ignore
        full_name=str(member.full_name),  # type: ignore
        relationship=str(member.relationship),  # type: ignore
        date_of_birth=member.date_of_birth,  # type: ignore
        gender=str(member.gender) if member.gender else None,  # type: ignore
        blood_group=str(member.blood_group) if member.blood_group else None,  # type: ignore
        phone=str(member.phone) if member.phone else None,  # type: ignore
        email=str(member.email) if member.email else None,  # type: ignore
        medical_history=member.medical_history or [],  # type: ignore
        allergies=member.allergies or [],  # type: ignore
        chronic_conditions=member.chronic_conditions or [],  # type: ignore
        current_medications=member.current_medications or [],  # type: ignore
        emergency_contact=str(member.emergency_contact) if member.emergency_contact else None,  # type: ignore
        genetic_risk_factors=member.genetic_risk_factors or [],  # type: ignore
        age=calculate_age(member.date_of_birth),  # type: ignore
        created_at=member.created_at  # type: ignore
    )


@router.post("/members", response_model=FamilyMemberResponse)
async def add_family_member(
    member: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new family member
    """
    new_member = FamilyMember(
        primary_user_id=current_user.id,
        full_name=member.full_name,
        relationship=member.relationship,
        date_of_birth=member.date_of_birth,
        gender=member.gender,
        blood_group=member.blood_group,
        phone=member.phone,
        email=member.email,
        medical_history=member.medical_history or [],
        allergies=member.allergies or [],
        chronic_conditions=member.chronic_conditions or [],
        current_medications=member.current_medications or [],
        emergency_contact=member.emergency_contact,
        genetic_risk_factors=member.genetic_risk_factors or []
    )
    
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return member_to_response(new_member)


@router.get("/members", response_model=List[FamilyMemberResponse])
async def get_family_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all family members for current user
    """
    members = db.query(FamilyMember).filter(
        FamilyMember.primary_user_id == current_user.id,
        FamilyMember.is_active == True
    ).all()
    
    return [member_to_response(m) for m in members]


@router.get("/members/{member_id}", response_model=FamilyMemberResponse)
async def get_family_member(
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific family member details
    """
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.primary_user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    return member_to_response(member)


@router.patch("/members/{member_id}", response_model=FamilyMemberResponse)
async def update_family_member(
    member_id: str,
    update: FamilyMemberUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update family member information
    """
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.primary_user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    # Update fields
    if update.full_name:
        member.full_name = update.full_name
    if update.phone:
        member.phone = update.phone
    if update.email:
        member.email = update.email
    if update.medical_history is not None:
        member.medical_history = update.medical_history
    if update.allergies is not None:
        member.allergies = update.allergies
    if update.chronic_conditions is not None:
        member.chronic_conditions = update.chronic_conditions
    if update.current_medications is not None:
        member.current_medications = update.current_medications
    if update.emergency_contact:
        member.emergency_contact = update.emergency_contact
    if update.genetic_risk_factors is not None:
        member.genetic_risk_factors = update.genetic_risk_factors
    
    db.commit()
    db.refresh(member)
    
    return FamilyMemberResponse(
        id=member.id,
        full_name=member.full_name,
        relationship=member.relationship,
        date_of_birth=member.date_of_birth,
        gender=member.gender,
        blood_group=member.blood_group,
        phone=member.phone,
        email=member.email,
        medical_history=member.medical_history or [],
        allergies=member.allergies or [],
        chronic_conditions=member.chronic_conditions or [],
        current_medications=member.current_medications or [],
        emergency_contact=member.emergency_contact,
        genetic_risk_factors=member.genetic_risk_factors or [],
        age=calculate_age(member.date_of_birth),
        created_at=member.created_at
    )


@router.delete("/members/{member_id}")
async def delete_family_member(
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete (soft delete) a family member
    """
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.primary_user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    member.is_active = False
    db.commit()
    
    return {"message": "Family member removed successfully"}


@router.post("/timeline", response_model=TimelineEventResponse)
async def add_timeline_event(
    event: TimelineEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add health event to family timeline
    """
    # Verify family member belongs to user
    member = db.query(FamilyMember).filter(
        FamilyMember.id == event.family_member_id,
        FamilyMember.primary_user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    new_event = FamilyHealthTimeline(
        family_member_id=event.family_member_id,
        event_type=event.event_type,
        event_title=event.event_title,
        event_description=event.event_description,
        event_date=event.event_date,
        doctor_name=event.doctor_name,
        hospital=event.hospital,
        attachments=event.attachments or [],
        notes=event.notes
    )
    
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    return TimelineEventResponse(
        id=new_event.id,
        family_member_id=new_event.family_member_id,
        event_type=new_event.event_type,
        event_title=new_event.event_title,
        event_description=new_event.event_description,
        event_date=new_event.event_date,
        doctor_name=new_event.doctor_name,
        hospital=new_event.hospital,
        attachments=new_event.attachments,
        notes=new_event.notes,
        created_at=new_event.created_at
    )


@router.get("/timeline", response_model=List[TimelineEventResponse])
async def get_family_timeline(
    member_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get family health timeline events
    """
    # Get all family members for user
    member_ids = [m.id for m in db.query(FamilyMember).filter(
        FamilyMember.primary_user_id == current_user.id
    ).all()]
    
    query = db.query(FamilyHealthTimeline).filter(
        FamilyHealthTimeline.family_member_id.in_(member_ids)
    )
    
    if member_id:
        query = query.filter(FamilyHealthTimeline.family_member_id == member_id)
    
    events = query.order_by(FamilyHealthTimeline.event_date.desc()).all()
    
    return [
        TimelineEventResponse(
            id=e.id,
            family_member_id=e.family_member_id,
            event_type=e.event_type,
            event_title=e.event_title,
            event_description=e.event_description,
            event_date=e.event_date,
            doctor_name=e.doctor_name,
            hospital=e.hospital,
            attachments=e.attachments,
            notes=e.notes,
            created_at=e.created_at
        )
        for e in events
    ]


@router.get("/summary", response_model=FamilyHealthSummary)
async def get_family_health_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get family health summary with insights
    """
    members = db.query(FamilyMember).filter(
        FamilyMember.primary_user_id == current_user.id,
        FamilyMember.is_active == True
    ).all()
    
    # Aggregate genetic risks
    genetic_risks = {}
    all_conditions = []
    
    for member in members:
        if member.genetic_risk_factors:
            for risk in member.genetic_risk_factors:
                condition = risk.get('condition')
                if condition:
                    if condition not in genetic_risks:
                        genetic_risks[condition] = {
                            'condition': condition,
                            'affected_members': [],
                            'highest_risk': risk.get('risk_level', 'unknown')
                        }
                    genetic_risks[condition]['affected_members'].append(member.full_name)
        
        if member.chronic_conditions:
            all_conditions.extend(member.chronic_conditions)
    
    # Find common conditions
    from collections import Counter
    condition_counts = Counter(all_conditions)
    common_conditions = [cond for cond, count in condition_counts.most_common(5)]
    
    return FamilyHealthSummary(
        total_members=len(members),
        genetic_risks=list(genetic_risks.values()),
        common_conditions=common_conditions,
        upcoming_checkups=[]  # Can be enhanced with appointment data
    )
