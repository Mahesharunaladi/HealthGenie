# CuraGenie API Documentation

## Base URL
```
Development: http://localhost:8000
Production: https://api.curagenie.com
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "role": "patient"  // or "doctor"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "patient",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-01-05T00:00:00"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword

Response: 200 OK
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "patient",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-01-05T00:00:00"
}
```

---

## Machine Learning Predictions

### Predict Brain Tumor
```http
POST /api/v1/ml/predict-brain-tumor
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <MRI_IMAGE_FILE>

Response: 200 OK
{
  "prediction_id": "uuid",
  "result": "Tumor Detected",
  "confidence_score": 0.87,
  "tumor_detected": true,
  "risk_level": "high",
  "analysis": {
    "confidence_percentage": "87.00%",
    "model_version": "v1.0",
    "image_quality": "good"
  },
  "recommendations": [
    "Consult with a neurologist immediately",
    "Schedule an MRI with contrast for detailed imaging",
    ...
  ]
}
```

### Predict Diabetes Risk
```http
POST /api/v1/ml/predict-diabetes
Authorization: Bearer <token>
Content-Type: application/json

{
  "pregnancies": 2,
  "glucose_level": 148.0,
  "blood_pressure": 72.0,
  "skin_thickness": 35.0,
  "insulin": 100.0,
  "bmi": 33.6,
  "diabetes_pedigree": 0.627,
  "age": 50
}

Response: 200 OK
{
  "prediction_id": "uuid",
  "result": "Diabetes Risk Detected",
  "probability": 0.85,
  "risk_level": "high",
  "risk_factors": [
    "High blood glucose level",
    "High BMI (obesity)",
    "Age over 45"
  ],
  "recommendations": [
    "Consult with an endocrinologist urgently",
    "Get a comprehensive diabetes screening test",
    ...
  ]
}
```

### Get All Predictions
```http
GET /api/v1/ml/predictions?skip=0&limit=100
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "prediction_type": "brain_tumor",
    "result": "Tumor Detected",
    "confidence_score": 0.87,
    "risk_level": "high",
    "status": "pending",
    "created_at": "2026-01-05T00:00:00",
    ...
  }
]
```

### Get Single Prediction
```http
GET /api/v1/ml/predictions/{prediction_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "patient_id": "uuid",
  "prediction_type": "diabetes",
  "input_data": {...},
  "result": "Diabetes Risk Detected",
  "confidence_score": 0.85,
  "risk_level": "high",
  "detailed_analysis": {...},
  "reviewed_by": null,
  "doctor_notes": null,
  "status": "pending",
  "created_at": "2026-01-05T00:00:00",
  "updated_at": null
}
```

---

## Patient Endpoints

### Get Patient Profile
```http
GET /api/v1/patients/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  "date_of_birth": "1990-01-01T00:00:00",
  "gender": "male",
  "blood_group": "O+",
  "phone": "+1234567890",
  "address": "123 Main St",
  "emergency_contact": "+0987654321",
  "medical_history": {...},
  "created_at": "2026-01-05T00:00:00"
}
```

### Update Patient Profile
```http
PUT /api/v1/patients/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "date_of_birth": "1990-01-01T00:00:00",
  "gender": "male",
  "blood_group": "O+",
  "phone": "+1234567890",
  "address": "123 Main St",
  "emergency_contact": "+0987654321"
}

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  ...updated fields...
}
```

---

## Doctor Endpoints

### Get Doctor Profile
```http
GET /api/v1/doctors/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  "specialization": "Neurology",
  "license_number": "MD123456",
  "years_of_experience": 10,
  "phone": "+1234567890",
  "bio": "Experienced neurologist...",
  "hospital_affiliation": "City Hospital",
  "created_at": "2026-01-05T00:00:00"
}
```

### Update Doctor Profile
```http
PUT /api/v1/doctors/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "specialization": "Neurology",
  "license_number": "MD123456",
  "years_of_experience": 10,
  "phone": "+1234567890",
  "bio": "Experienced neurologist...",
  "hospital_affiliation": "City Hospital"
}

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  ...updated fields...
}
```

### Review Prediction
```http
POST /api/v1/doctors/review-prediction/{prediction_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor_notes": "Patient needs immediate attention...",
  "approve": true
}

Response: 200 OK
{
  "message": "Prediction reviewed successfully",
  "prediction_id": "uuid"
}
```

---

## Reports

### Generate Report
```http
POST /api/v1/reports/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prediction_id": "uuid"
}

Response: 200 OK
{
  "message": "Report generation initiated",
  "prediction_id": "uuid",
  "report_url": "/reports/{prediction_id}.pdf"
}
```

### Get Report
```http
GET /api/v1/reports/{report_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Report endpoint",
  "report_id": "uuid"
}
```

---

## WebSocket

### Connect to WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/{client_id}')

ws.onopen = () => {
  console.log('Connected')
}

ws.onmessage = (event) => {
  console.log('Message received:', event.data)
}

ws.onerror = (error) => {
  console.error('WebSocket error:', error)
}

ws.onclose = () => {
  console.log('Disconnected')
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error message"
}
```

---

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Authenticated users: 1000 requests per minute

---

## Data Models

### User Roles
- `patient`: Regular patient user
- `doctor`: Healthcare provider
- `admin`: System administrator

### Prediction Types
- `brain_tumor`: Brain tumor detection from MRI
- `diabetes`: Diabetes risk prediction

### Risk Levels
- `low`: Low risk (< 40%)
- `moderate`: Moderate risk (40-70%)
- `high`: High risk (> 70%)

### Prediction Status
- `pending`: Awaiting doctor review
- `reviewed`: Reviewed by doctor
- `approved`: Approved by doctor
- `rejected`: Rejected by doctor

---

## Best Practices

1. **Always include Authorization header** for authenticated endpoints
2. **Handle token expiration** gracefully and refresh when needed
3. **Validate file uploads** before sending to API
4. **Implement error handling** for all API calls
5. **Use appropriate HTTP methods** (GET, POST, PUT, DELETE)
6. **Follow rate limits** to avoid being throttled

---

## Support

For API support and questions:
- Documentation: http://localhost:8000/api/docs
- Email: api-support@curagenie.com
- GitHub Issues: https://github.com/Mahesharunaladi/HealthGenie/issues
