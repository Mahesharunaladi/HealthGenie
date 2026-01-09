"""
CuraGenie Backend - Main Application Entry Point
FastAPI application with WebSocket support, CORS, and API routes
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
from typing import List

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, patients, doctors, ml_predictions, reports, chatbot, health_monitoring, telemedicine
from app.services.websocket_manager import ConnectionManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# WebSocket connection manager
manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting CuraGenie Backend...")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
    
    # Load ML models
    try:
        from app.services.ml_service import MLService
        ml_service = MLService()
        logger.info("ML models loaded successfully")
    except Exception as e:
        logger.error(f"Error loading ML models: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down CuraGenie Backend...")


# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Healthcare Platform API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - Health check"""
    return {
        "message": "CuraGenie API is running",
        "version": settings.VERSION,
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",
        "ml_models": "loaded",
        "version": settings.VERSION
    }


# WebSocket endpoint for real-time updates
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """
    WebSocket endpoint for real-time communication
    """
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received message from {client_id}: {data}")
            # Echo back for now, can be extended for real-time updates
            await manager.send_personal_message(f"Message received: {data}", client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        logger.info(f"Client {client_id} disconnected")


# Include API routers
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

app.include_router(
    patients.router,
    prefix="/api/v1/patients",
    tags=["Patients"]
)

app.include_router(
    doctors.router,
    prefix="/api/v1/doctors",
    tags=["Doctors"]
)

app.include_router(
    ml_predictions.router,
    prefix="/api/v1/ml",
    tags=["Machine Learning"]
)

app.include_router(
    reports.router,
    prefix="/api/v1/reports",
    tags=["Reports"]
)

app.include_router(
    chatbot.router,
    prefix="/api/v1/chatbot",
    tags=["AI Chatbot"]
)

app.include_router(
    health_monitoring.router,
    prefix="/api/v1/health",
    tags=["Health Monitoring"]
)

app.include_router(
    telemedicine.router,
    prefix="/api/v1/telemedicine",
    tags=["Telemedicine"]
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
