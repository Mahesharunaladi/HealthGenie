"""
AI Medical Chatbot API — voice-ready chat, rash screening, cold/cough clinic.
"""

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
import os
import shutil
import tempfile
from datetime import datetime

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User, ChatMessage
from app.services.rash_analyzer import rash_analyzer
from app.services.symptom_clinic import (
    FIRST_AID,
    apply_cold_cough_answer,
    detect_intent,
    start_cold_cough,
)

router = APIRouter()

try:
    import openai
except ImportError:
    openai = None  # type: ignore

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if OPENAI_API_KEY and openai is not None:
    openai.api_key = OPENAI_API_KEY

# Guided-clinic state per user session (in-memory for demo)
_clinic_sessions: Dict[str, Dict[str, Any]] = {}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    speak: bool = False


class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: datetime
    spoken_text: Optional[str] = None
    intent: Optional[str] = None
    urgency: Optional[str] = None
    clinic: Optional[Dict[str, Any]] = None
    first_aid: Optional[List[Dict[str, Any]]] = None


class MessageHistory(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


class SymptomAnswer(BaseModel):
    session_id: str
    selected: List[str]


SYSTEM_PROMPT = """You are HealthGenie AI, a helpful medical assistant chatbot.
You provide general health information, answer medical questions, and help users understand health conditions.

IMPORTANT GUIDELINES:
1. Always provide accurate, evidence-based medical information
2. Never diagnose conditions - recommend consulting a doctor for diagnosis
3. For emergencies, immediately advise calling emergency services
4. Be empathetic and supportive
5. Explain medical terms in simple language
6. When discussing symptoms, ask clarifying questions
7. Always add medical disclaimers when appropriate
8. You can guide home care for common cold and cough, and discuss rash photos as screening only
9. Keep spoken-friendly answers: short sentences, no markdown tables

Remember: You are here to educate and support, not replace professional medical care."""


def _clinic_key(user_id: str, session_id: str) -> str:
    return f"{user_id}:{session_id}"


def _save_messages(db: Session, user_id: str, session_id: str, user_text: str, assistant_text: str, metadata: Optional[dict] = None) -> None:
    db.add(ChatMessage(user_id=user_id, role="user", content=user_text, session_id=session_id, message_metadata=metadata))
    db.add(ChatMessage(user_id=user_id, role="assistant", content=assistant_text, session_id=session_id, message_metadata=metadata))
    db.commit()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        session_id = request.session_id or f"session_{current_user.id}_{datetime.now().timestamp()}"
        intent = detect_intent(request.message)
        key = _clinic_key(str(current_user.id), session_id)

        if intent == "cold_cough":
            clinic = start_cold_cough()
            _clinic_sessions[key] = clinic
            _save_messages(db, str(current_user.id), session_id, request.message, clinic["assistant_message"], {"intent": "cold_cough"})
            return ChatResponse(
                response=clinic["assistant_message"],
                session_id=session_id,
                timestamp=datetime.now(),
                spoken_text=clinic.get("spoken"),
                intent="cold_cough",
                urgency="green",
                clinic=clinic,
            )

        if intent == "first_aid":
            text = (
                "Here are quick first-aid cards. Tap one, or tell me if this is choking, bleeding, a burn, fainting, or fever.\n\n"
                "If the person is unresponsive or not breathing, call emergency services and start CPR if you are trained."
            )
            _save_messages(db, str(current_user.id), session_id, request.message, text, {"intent": "first_aid"})
            return ChatResponse(
                response=text,
                session_id=session_id,
                timestamp=datetime.now(),
                spoken_text=text,
                intent="first_aid",
                urgency="yellow",
                first_aid=FIRST_AID,
            )

        if intent == "rash":
            text = (
                "I can screen a rash photo. Tap **Scan rash photo**, then take or upload a close, well-lit picture of the affected skin. "
                "I will estimate the rash pattern and share home-care steps and warning signs.\n\n"
                "This is not a dermatologist diagnosis."
            )
            _save_messages(db, str(current_user.id), session_id, request.message, text, {"intent": "rash"})
            return ChatResponse(
                response=text,
                session_id=session_id,
                timestamp=datetime.now(),
                spoken_text=text,
                intent="rash",
                urgency="green",
            )

        history = db.query(ChatMessage).filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at.desc()).limit(10).all()

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in reversed(history):
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": request.message})

        user_message = ChatMessage(
            user_id=current_user.id,
            role="user",
            content=request.message,
            session_id=session_id
        )
        db.add(user_message)
        db.commit()

        if OPENAI_API_KEY and openai is not None:
            try:
                response = openai.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=500,
                    temperature=0.7
                )
                ai_response = response.choices[0].message.content or get_fallback_response(request.message)
            except Exception as e:
                print(f"OpenAI API error: {e}")
                ai_response = get_fallback_response(request.message)
        else:
            ai_response = get_fallback_response(request.message)

        assistant_message = ChatMessage(
            user_id=current_user.id,
            role="assistant",
            content=ai_response,
            session_id=session_id
        )
        db.add(assistant_message)
        db.commit()

        spoken = _to_spoken(ai_response)
        return ChatResponse(
            response=ai_response,
            session_id=session_id,
            timestamp=datetime.now(),
            spoken_text=spoken,
            intent="general",
            urgency=_urgency_from_text(request.message + " " + ai_response),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat: {str(e)}"
        )


@router.post("/analyze-rash")
async def analyze_rash(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a photo of the rash.")

    suffix = os.path.splitext(file.filename or "rash.jpg")[1] or ".jpg"
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        result = rash_analyzer.analyze(tmp_path)
        user_line = "Uploaded a rash photo for screening."
        assistant_text = (
            f"**Rash screening:** {result['primary_condition']} "
            f"(confidence {int(result['confidence'] * 100)}%)\n\n"
            f"{result['findings'][0]['summary']}\n\n"
            "**Do now:**\n" + "\n".join(f"- {x}" for x in result["care_plan"]["do_now"]) + "\n\n"
            "**See a doctor if:**\n" + "\n".join(f"- {x}" for x in result["care_plan"]["red_flags"]) + "\n\n"
            f"{result['disclaimer']}"
        )
        _save_messages(
            db,
            str(current_user.id),
            session_id,
            user_line,
            assistant_text,
            {"intent": "rash", "rash": result},
        )
        return {
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "response": assistant_text,
            "spoken_text": result["spoken_summary"],
            "intent": "rash",
            "urgency": result["urgency"],
            "rash": result,
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not analyze the photo: {exc}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@router.post("/symptom-check")
async def symptom_check(
    payload: SymptomAnswer,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    key = _clinic_key(str(current_user.id), payload.session_id)
    state = _clinic_sessions.get(key) or start_cold_cough()
    next_state = apply_cold_cough_answer(state, payload.selected or ["none"])
    _clinic_sessions[key] = next_state

    user_text = ", ".join(payload.selected) if payload.selected else "skipped"
    assistant_text = next_state.get("assistant_message") or next_state.get("spoken") or "Updated."
    _save_messages(
        db,
        str(current_user.id),
        payload.session_id,
        user_text,
        assistant_text,
        {"intent": "cold_cough", "complete": next_state.get("complete")},
    )

    spoken = next_state.get("spoken")
    return {
        "session_id": payload.session_id,
        "timestamp": datetime.now().isoformat(),
        "response": assistant_text,
        "spoken_text": spoken,
        "intent": "cold_cough",
        "urgency": next_state.get("urgency", "green"),
        "clinic": next_state,
    }


@router.get("/first-aid")
async def first_aid_cards(current_user: User = Depends(get_current_user)):
    return {"cards": FIRST_AID}


@router.get("/history", response_model=List[MessageHistory])
async def get_chat_history(
    session_id: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)

    if session_id:
        query = query.filter(ChatMessage.session_id == session_id)

    messages = query.order_by(ChatMessage.created_at.desc()).limit(limit).all()

    return [
        MessageHistory(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at
        )
        for msg in reversed(messages)
    ]


@router.delete("/history/{session_id}")
async def clear_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.session_id == session_id
    ).delete()
    db.commit()
    _clinic_sessions.pop(_clinic_key(str(current_user.id), session_id), None)
    return {"message": "Chat history cleared successfully"}


def _to_spoken(text: str) -> str:
    cleaned = text.replace("**", "").replace("•", "").replace("⚠️", "")
    return " ".join(cleaned.split())[:900]


def _urgency_from_text(text: str) -> str:
    lower = text.lower()
    red = ("chest pain", "can't breathe", "cannot breathe", "unconscious", "emergency", "stroke", "bleeding heavily")
    if any(word in lower for word in red):
        return "red"
    return "green"


def get_fallback_response(message: str) -> str:
    message_lower = message.lower()

    if "diabetes" in message_lower:
        return """Diabetes is a chronic condition that affects how your body processes blood sugar (glucose).

There are two main types:
- **Type 1**: The body doesn't produce insulin
- **Type 2**: The body doesn't use insulin properly

Common symptoms include increased thirst, frequent urination, extreme fatigue, and blurred vision.

**Important:** This is general information. Please consult with a healthcare provider for proper diagnosis and treatment. You can also use our Diabetes Risk Assessment tool for an AI-powered evaluation.

⚠️ Medical Disclaimer: This information is for educational purposes only and should not replace professional medical advice."""

    if "brain tumor" in message_lower or "headache" in message_lower:
        return """Brain tumors are abnormal growths of cells in the brain. Symptoms can vary depending on location and size.

Common symptoms include:
- Persistent headaches
- Seizures
- Vision or hearing problems
- Balance difficulties
- Memory problems

**Important:** Most headaches are NOT caused by brain tumors. However, if you have persistent or severe symptoms, please consult a doctor immediately.

Our Brain Tumor Detection tool can analyze MRI scans, but this should only be used as a screening tool, not for diagnosis.

⚠️ Medical Disclaimer: Seek immediate medical attention for severe symptoms."""

    if "heart" in message_lower or "chest pain" in message_lower:
        return """❗ **IMPORTANT**: If you're experiencing chest pain, shortness of breath, or other heart attack symptoms, call emergency services immediately!

Heart health is crucial. Common risk factors include:
- High blood pressure
- High cholesterol
- Smoking
- Diabetes
- Obesity
- Sedentary lifestyle

For preventive care, regular check-ups and a healthy lifestyle are essential.

⚠️ Emergency: Call 911 for chest pain, severe shortness of breath, or suspected heart attack."""

    if "emergency" in message_lower or "urgent" in message_lower:
        return """🚨 **EMERGENCY GUIDANCE**

If this is a medical emergency, please:
1. Call emergency services (911 in US) IMMEDIATELY
2. Do NOT wait for online advice
3. Seek immediate medical attention

Emergency signs include:
- Chest pain or pressure
- Difficulty breathing
- Severe bleeding
- Loss of consciousness
- Severe allergic reaction
- Stroke symptoms (face drooping, arm weakness, speech difficulty)

This chatbot cannot handle emergencies. Always prioritize professional emergency care."""

    return f"""Hello! I'm HealthGenie AI. I can talk with you by voice, screen a rash photo, and walk you through cold and cough home care.

I can help you with:
- Voice questions — tap the mic and I will speak the answer
- Rash photo screening and precautions
- Guided common-cold / cough clinic
- First-aid cards
- General health information

I cannot diagnose, prescribe, or replace a doctor.

**Your question:** "{message}"

Try saying “I have a cough”, “scan my rash”, or “first aid”.

⚠️ Medical Disclaimer: This is general information only. Always consult healthcare professionals for medical advice."""
