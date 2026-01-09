"""
AI Medical Chatbot API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import openai
import os
from datetime import datetime

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User, ChatMessage

router = APIRouter()

# Configure OpenAI API (set your API key in environment variables)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: datetime


class MessageHistory(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


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

Remember: You are here to educate and support, not replace professional medical care."""


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with AI medical assistant
    """
    try:
        # Generate session ID if not provided
        session_id = request.session_id or f"session_{current_user.id}_{datetime.now().timestamp()}"
        
        # Get conversation history for context
        history = db.query(ChatMessage).filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at.desc()).limit(10).all()
        
        # Build messages for OpenAI
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add history (in reverse order)
        for msg in reversed(history):
            messages.append({"role": msg.role, "content": msg.content})
        
        # Add current user message
        messages.append({"role": "user", "content": request.message})
        
        # Save user message
        user_message = ChatMessage(
            user_id=current_user.id,
            role="user",
            content=request.message,
            session_id=session_id
        )
        db.add(user_message)
        db.commit()
        
        # Get AI response
        if OPENAI_API_KEY:
            try:
                response = openai.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=500,
                    temperature=0.7
                )
                ai_response = response.choices[0].message.content
            except Exception as e:
                print(f"OpenAI API error: {e}")
                ai_response = get_fallback_response(request.message)
        else:
            ai_response = get_fallback_response(request.message)
        
        # Save AI response
        assistant_message = ChatMessage(
            user_id=current_user.id,
            role="assistant",
            content=ai_response,
            session_id=session_id
        )
        db.add(assistant_message)
        db.commit()
        
        return ChatResponse(
            response=ai_response,
            session_id=session_id,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat: {str(e)}"
        )


@router.get("/history", response_model=List[MessageHistory])
async def get_chat_history(
    session_id: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get chat history for current user
    """
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
    """
    Clear chat history for a session
    """
    db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.session_id == session_id
    ).delete()
    db.commit()
    
    return {"message": "Chat history cleared successfully"}


def get_fallback_response(message: str) -> str:
    """
    Fallback response when OpenAI API is not available
    """
    message_lower = message.lower()
    
    # Common health queries
    if "diabetes" in message_lower:
        return """Diabetes is a chronic condition that affects how your body processes blood sugar (glucose). 
        
There are two main types:
- **Type 1**: The body doesn't produce insulin
- **Type 2**: The body doesn't use insulin properly

Common symptoms include increased thirst, frequent urination, extreme fatigue, and blurred vision.

**Important:** This is general information. Please consult with a healthcare provider for proper diagnosis and treatment. You can also use our Diabetes Risk Assessment tool for an AI-powered evaluation.

⚠️ Medical Disclaimer: This information is for educational purposes only and should not replace professional medical advice."""
    
    elif "brain tumor" in message_lower or "headache" in message_lower:
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
    
    elif "heart" in message_lower or "chest pain" in message_lower:
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
    
    elif "emergency" in message_lower or "urgent" in message_lower:
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
    
    else:
        return f"""Hello! I'm HealthGenie AI, your medical assistant. I'm here to help answer general health questions and provide information.

I can help you with:
- General health information
- Understanding medical conditions
- Explaining symptoms
- Preventive care tips
- Medication information
- Lifestyle and wellness advice

However, I cannot:
- Diagnose medical conditions
- Prescribe medications
- Replace professional medical care
- Handle medical emergencies

**Your question:** "{message}"

For specific medical concerns, I recommend:
1. Using our AI prediction tools (Brain Tumor Detection, Diabetes Assessment)
2. Scheduling a video consultation with a doctor
3. Consulting your healthcare provider

Could you please provide more details about your health concern so I can better assist you?

⚠️ Medical Disclaimer: This is general information only. Always consult healthcare professionals for medical advice."""
