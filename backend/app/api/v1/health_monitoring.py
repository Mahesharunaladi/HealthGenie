"""
Real-time Health Monitoring API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from pydantic import BaseModel
from datetime import datetime, timedelta
import json

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User, HealthMetric, Patient

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_json(message)


manager = ConnectionManager()


class HealthMetricCreate(BaseModel):
    metric_type: str  # heart_rate, blood_pressure, glucose, oxygen, temperature
    value: float
    unit: str
    systolic: Optional[float] = None
    diastolic: Optional[float] = None
    device_id: Optional[str] = None
    notes: Optional[str] = None


class HealthMetricResponse(BaseModel):
    id: str
    metric_type: str
    value: float
    unit: str
    systolic: Optional[float]
    diastolic: Optional[float]
    is_alert: bool
    alert_message: Optional[str]
    recorded_at: datetime
    created_at: datetime


class HealthStats(BaseModel):
    metric_type: str
    average: float
    min: float
    max: float
    latest: float
    trend: str  # increasing, decreasing, stable
    unit: str


def check_metric_alerts(metric_type: str, value: float, systolic: Optional[float] = None, 
                        diastolic: Optional[float] = None) -> tuple[bool, Optional[str]]:
    """
    Check if health metric triggers an alert
    Returns: (is_alert, alert_message)
    """
    alerts = {
        "heart_rate": {
            "low": (60, "Heart rate is below normal range (bradycardia)"),
            "high": (100, "Heart rate is above normal range (tachycardia)"),
            "critical_low": (40, "CRITICAL: Dangerously low heart rate"),
            "critical_high": (120, "CRITICAL: Dangerously high heart rate")
        },
        "blood_pressure": {
            "high_systolic": (140, "High blood pressure (systolic)"),
            "high_diastolic": (90, "High blood pressure (diastolic)"),
            "critical_systolic": (180, "CRITICAL: Hypertensive crisis"),
            "critical_diastolic": (120, "CRITICAL: Hypertensive crisis")
        },
        "glucose": {
            "low": (70, "Low blood sugar (hypoglycemia)"),
            "high": (140, "High blood sugar (hyperglycemia)"),
            "critical_low": (54, "CRITICAL: Severe hypoglycemia"),
            "critical_high": (200, "CRITICAL: Severe hyperglycemia")
        },
        "oxygen": {
            "low": (95, "Low oxygen saturation"),
            "critical_low": (90, "CRITICAL: Dangerously low oxygen level")
        },
        "temperature": {
            "low": (97.0, "Low body temperature"),
            "high": (99.5, "Elevated temperature (fever)"),
            "critical_high": (103.0, "CRITICAL: High fever - seek medical attention")
        }
    }
    
    if metric_type == "blood_pressure" and systolic and diastolic:
        if systolic >= 180 or diastolic >= 120:
            return True, alerts["blood_pressure"]["critical_systolic"]
        elif systolic >= 140 or diastolic >= 90:
            return True, "Blood pressure is elevated"
    
    if metric_type in alerts:
        thresholds = alerts[metric_type]
        
        # Check critical levels first
        if "critical_high" in thresholds and value >= thresholds["critical_high"][0]:
            return True, thresholds["critical_high"][1]
        if "critical_low" in thresholds and value <= thresholds["critical_low"][0]:
            return True, thresholds["critical_low"][1]
        
        # Check warning levels
        if "high" in thresholds and value >= thresholds["high"][0]:
            return True, thresholds["high"][1]
        if "low" in thresholds and value <= thresholds["low"][0]:
            return True, thresholds["low"][1]
    
    return False, None


@router.post("/metrics", response_model=HealthMetricResponse)
async def add_health_metric(
    metric: HealthMetricCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new health metric measurement
    """
    # Get patient profile
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )
    
    # Check for alerts
    is_alert, alert_message = check_metric_alerts(
        metric.metric_type, 
        metric.value, 
        metric.systolic, 
        metric.diastolic
    )
    
    # Create metric record
    health_metric = HealthMetric(
        patient_id=patient.id,
        metric_type=metric.metric_type,
        value=metric.value,
        unit=metric.unit,
        systolic=metric.systolic,
        diastolic=metric.diastolic,
        device_id=metric.device_id,
        notes=metric.notes,
        is_alert=is_alert,
        alert_message=alert_message,
        recorded_at=datetime.now()
    )
    
    db.add(health_metric)
    db.commit()
    db.refresh(health_metric)
    
    # Send real-time update via WebSocket
    if is_alert:
        await manager.send_personal_message({
            "type": "alert",
            "metric_type": metric.metric_type,
            "value": metric.value,
            "message": alert_message
        }, current_user.id)
    
    return HealthMetricResponse(
        id=health_metric.id,
        metric_type=health_metric.metric_type,
        value=health_metric.value,
        unit=health_metric.unit,
        systolic=health_metric.systolic,
        diastolic=health_metric.diastolic,
        is_alert=health_metric.is_alert,
        alert_message=health_metric.alert_message,
        recorded_at=health_metric.recorded_at,
        created_at=health_metric.created_at
    )


@router.get("/metrics", response_model=List[HealthMetricResponse])
async def get_health_metrics(
    metric_type: Optional[str] = None,
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get health metrics for current user
    """
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )
    
    query = db.query(HealthMetric).filter(
        HealthMetric.patient_id == patient.id,
        HealthMetric.recorded_at >= datetime.now() - timedelta(days=days)
    )
    
    if metric_type:
        query = query.filter(HealthMetric.metric_type == metric_type)
    
    metrics = query.order_by(HealthMetric.recorded_at.desc()).all()
    
    return [
        HealthMetricResponse(
            id=m.id,
            metric_type=m.metric_type,
            value=m.value,
            unit=m.unit,
            systolic=m.systolic,
            diastolic=m.diastolic,
            is_alert=m.is_alert,
            alert_message=m.alert_message,
            recorded_at=m.recorded_at,
            created_at=m.created_at
        )
        for m in metrics
    ]


@router.get("/stats", response_model=List[HealthStats])
async def get_health_stats(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get statistical summary of health metrics
    """
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        return []
    
    metric_types = ["heart_rate", "blood_pressure", "glucose", "oxygen", "temperature"]
    stats_list = []
    
    for metric_type in metric_types:
        metrics = db.query(HealthMetric).filter(
            HealthMetric.patient_id == patient.id,
            HealthMetric.metric_type == metric_type,
            HealthMetric.recorded_at >= datetime.now() - timedelta(days=days)
        ).order_by(HealthMetric.recorded_at).all()
        
        if not metrics:
            continue
        
        values = [m.value for m in metrics]
        average = sum(values) / len(values)
        min_val = min(values)
        max_val = max(values)
        latest = values[-1]
        
        # Calculate trend
        if len(values) >= 2:
            first_half = sum(values[:len(values)//2]) / (len(values)//2)
            second_half = sum(values[len(values)//2:]) / (len(values) - len(values)//2)
            if second_half > first_half * 1.05:
                trend = "increasing"
            elif second_half < first_half * 0.95:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "stable"
        
        stats_list.append(HealthStats(
            metric_type=metric_type,
            average=round(average, 2),
            min=min_val,
            max=max_val,
            latest=latest,
            trend=trend,
            unit=metrics[0].unit
        ))
    
    return stats_list


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, db: Session = Depends(get_db)):
    """
    WebSocket endpoint for real-time health monitoring
    """
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for testing
            await manager.send_personal_message({"message": "Connected"}, user_id)
    except WebSocketDisconnect:
        manager.disconnect(user_id)
