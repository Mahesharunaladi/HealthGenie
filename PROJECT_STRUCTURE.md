# CuraGenie Project Structure

```
HealthGenie/
│
├── README.md                          # Main project documentation
├── SETUP.md                           # Setup and installation guide
├── API_DOCUMENTATION.md               # API documentation
├── .gitignore                         # Git ignore file
├── docker-compose.yml                 # Docker Compose configuration
│
├── backend/                           # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI application entry point
│   │   │
│   │   ├── core/                     # Core configurations
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # Application settings
│   │   │   └── database.py          # Database configuration
│   │   │
│   │   ├── models/                   # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   └── models.py            # Database models
│   │   │
│   │   ├── schemas/                  # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   └── schemas.py           # Request/response schemas
│   │   │
│   │   ├── api/                      # API routes
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py          # Authentication routes
│   │   │       ├── patients.py      # Patient routes
│   │   │       ├── doctors.py       # Doctor routes
│   │   │       ├── ml_predictions.py # ML prediction routes
│   │   │       └── reports.py       # Report routes
│   │   │
│   │   └── services/                 # Business logic services
│   │       ├── __init__.py
│   │       ├── ml_service.py        # ML inference service
│   │       ├── image_preprocessing.py # Image preprocessing
│   │       └── websocket_manager.py  # WebSocket manager
│   │
│   ├── models/                       # ML model files
│   │   ├── brain_tumor_model.h5     # Brain tumor CNN model
│   │   └── diabetes_model.pkl       # Diabetes prediction model
│   │
│   ├── uploads/                      # Uploaded files directory
│   │
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Backend Docker configuration
│   ├── .env.example                  # Environment variables example
│   └── .env                          # Environment variables (not in git)
│
└── frontend/                         # Next.js Frontend
    ├── app/                          # Next.js app directory
    │   ├── layout.tsx               # Root layout
    │   ├── page.tsx                 # Home page
    │   ├── globals.css              # Global styles
    │   │
    │   ├── login/                   # Login page
    │   │   └── page.tsx
    │   │
    │   ├── register/                # Registration page
    │   │   └── page.tsx
    │   │
    │   ├── dashboard/               # Dashboard pages
    │   │   ├── page.tsx            # Main dashboard
    │   │   ├── patient/            # Patient dashboard
    │   │   └── doctor/             # Doctor dashboard
    │   │
    │   └── predictions/             # Predictions pages
    │       ├── brain-tumor/        # Brain tumor prediction
    │       └── diabetes/           # Diabetes prediction
    │
    ├── components/                   # React components
    │   ├── ui/                      # UI components (shadcn/ui)
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   └── ...
    │   │
    │   ├── layout/                  # Layout components
    │   │   ├── Header.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── Footer.tsx
    │   │
    │   └── features/                # Feature components
    │       ├── PredictionCard.tsx
    │       ├── UploadForm.tsx
    │       └── ResultsDisplay.tsx
    │
    ├── lib/                         # Utility functions
    │   └── utils.ts                 # Helper utilities
    │
    ├── services/                     # API services
    │   └── api.ts                   # API client
    │
    ├── hooks/                        # Custom React hooks
    │   ├── useAuth.ts
    │   ├── usePrediction.ts
    │   └── useWebSocket.ts
    │
    ├── types/                        # TypeScript types
    │   └── index.ts
    │
    ├── store/                        # State management
    │   └── authStore.ts
    │
    ├── package.json                  # Node dependencies
    ├── tsconfig.json                 # TypeScript configuration
    ├── next.config.js                # Next.js configuration
    ├── tailwind.config.js            # Tailwind CSS configuration
    ├── postcss.config.js             # PostCSS configuration
    ├── Dockerfile                    # Frontend Docker configuration
    ├── .env.example                  # Environment variables example
    └── .env.local                    # Environment variables (not in git)
```

## Key Directories Explained

### Backend (`backend/`)

#### `app/core/`
- **config.py**: Application configuration, environment variables, and settings
- **database.py**: Database connection, session management, and SQLAlchemy setup

#### `app/models/`
- Database models using SQLAlchemy ORM
- Defines tables: users, patients, doctors, predictions, medical_records, etc.

#### `app/schemas/`
- Pydantic models for request/response validation
- Type checking and data validation

#### `app/api/v1/`
- API endpoints organized by feature
- Authentication, patient management, doctor management, ML predictions, reports

#### `app/services/`
- **ml_service.py**: ML model loading and inference logic
- **image_preprocessing.py**: Medical image preprocessing (MRI, X-rays)
- **websocket_manager.py**: Real-time communication management

#### `models/`
- Trained ML models (brain tumor detection, diabetes prediction)
- Place your `.h5` and `.pkl` model files here

### Frontend (`frontend/`)

#### `app/`
- Next.js 15 App Router pages
- File-based routing
- Layout components and page components

#### `components/`
- **ui/**: Reusable UI components (buttons, cards, dialogs)
- **layout/**: Layout components (header, sidebar, footer)
- **features/**: Feature-specific components

#### `services/`
- API client for backend communication
- Authentication, ML predictions, patient/doctor APIs

#### `lib/`
- Utility functions and helpers
- Class name utilities, formatting functions

#### `hooks/`
- Custom React hooks
- Authentication, data fetching, WebSocket connections

#### `types/`
- TypeScript type definitions
- Interfaces and types for data models

#### `store/`
- Global state management using Zustand
- Authentication state, user data, etc.

## Configuration Files

### Backend
- **requirements.txt**: Python package dependencies
- **.env**: Environment variables (DATABASE_URL, SECRET_KEY, etc.)
- **Dockerfile**: Container configuration

### Frontend
- **package.json**: Node.js dependencies
- **tsconfig.json**: TypeScript compiler options
- **next.config.js**: Next.js configuration
- **tailwind.config.js**: Tailwind CSS customization
- **.env.local**: Environment variables (API URLs)

## Database Schema

```
users
├── id (PK)
├── email (unique)
├── hashed_password
├── full_name
├── role (patient/doctor/admin)
├── is_active
├── is_verified
└── timestamps

patients
├── id (PK)
├── user_id (FK -> users)
├── date_of_birth
├── gender
├── blood_group
├── medical_history (JSON)
└── timestamps

doctors
├── id (PK)
├── user_id (FK -> users)
├── specialization
├── license_number
├── years_of_experience
└── timestamps

predictions
├── id (PK)
├── patient_id (FK -> patients)
├── prediction_type
├── input_data (JSON)
├── result
├── confidence_score
├── risk_level
├── detailed_analysis (JSON)
├── reviewed_by
├── doctor_notes
├── status
└── timestamps

medical_records
├── id (PK)
├── patient_id (FK -> patients)
├── record_type
├── file_path
├── file_url
├── description
└── timestamps
```

## Technology Stack Summary

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Relational database
- **Redis**: Caching and task queue
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation
- **TensorFlow/Keras**: Deep learning for brain tumor detection
- **scikit-learn**: Diabetes risk prediction
- **Celery**: Asynchronous task processing

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Component library
- **Axios**: HTTP client
- **Zustand**: State management
- **React Hook Form**: Form management

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Vercel**: Frontend deployment
- **Railway/Render**: Backend deployment

## API Flow

1. **User Registration/Login**
   ```
   Frontend → POST /api/v1/auth/register
   Frontend → POST /api/v1/auth/login → JWT Token
   ```

2. **Brain Tumor Prediction**
   ```
   Frontend → Upload MRI Image
   → POST /api/v1/ml/predict-brain-tumor
   → Image Preprocessing
   → CNN Model Inference
   → Store in Database
   → Return Prediction Results
   ```

3. **Diabetes Risk Prediction**
   ```
   Frontend → Submit Clinical Data
   → POST /api/v1/ml/predict-diabetes
   → Feature Extraction
   → Logistic Regression Model
   → Store in Database
   → Return Risk Assessment
   ```

4. **Doctor Review**
   ```
   Frontend → POST /api/v1/doctors/review-prediction/{id}
   → Update Prediction Status
   → Add Doctor Notes
   → Notify Patient (WebSocket)
   ```

## Development Workflow

1. **Start Backend**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/api/docs

## Docker Deployment

```bash
docker-compose up --build
```

This starts all services:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 8000)
- Celery Worker
- Frontend (port 3000)

---

For more details, see:
- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Setup instructions
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
