# CuraGenie - Setup Guide

## Backend Setup

### Prerequisites
- Python 3.10+
- PostgreSQL 14+
- Redis 7+
- pip

### Installation Steps

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create and activate virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate  # On Windows
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start PostgreSQL and Redis:**
```bash
# Using Homebrew on macOS
brew services start postgresql
brew services start redis

# Or use Docker
docker run --name curagenie-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:14
docker run --name curagenie-redis -p 6379:6379 -d redis:7-alpine
```

6. **Create database:**
```bash
createdb curagenie
```

7. **Run the application:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

8. **Start Celery worker (in a new terminal):**
```bash
cd backend
source venv/bin/activate
celery -A app.tasks worker --loglevel=info
```

The backend will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/api/docs`

---

## Frontend Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation Steps

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Run the development server:**
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

---

## Docker Setup (Recommended for Development)

### Prerequisites
- Docker
- Docker Compose

### Installation Steps

1. **Clone the repository:**
```bash
git clone https://github.com/Mahesharunaladi/HealthGenie.git
cd HealthGenie
```

2. **Create environment files:**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. **Build and start all services:**
```bash
docker-compose up --build
```

4. **Run in detached mode:**
```bash
docker-compose up -d
```

5. **View logs:**
```bash
docker-compose logs -f
```

6. **Stop services:**
```bash
docker-compose down
```

**Services will be available at:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/api/docs`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

---

## ML Models Setup

The application requires trained ML models for predictions:

1. **Brain Tumor Detection Model:**
   - Place your trained model at: `backend/models/brain_tumor_model.h5`
   - Or the model will create a dummy model for development

2. **Diabetes Prediction Model:**
   - Place your trained model at: `backend/models/diabetes_model.pkl`
   - Or the model will create a dummy model for development

### Training Models (Optional)

If you want to train your own models, refer to the training scripts in the `ml_training/` directory (to be added).

---

## Database Migrations

Using Alembic for database migrations:

1. **Initialize migrations (first time only):**
```bash
cd backend
alembic init alembic
```

2. **Create a migration:**
```bash
alembic revision --autogenerate -m "Initial migration"
```

3. **Apply migrations:**
```bash
alembic upgrade head
```

4. **Rollback migration:**
```bash
alembic downgrade -1
```

---

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## Production Deployment

### Backend Deployment (Railway/Render)

1. **Create a new project on Railway/Render**

2. **Connect your GitHub repository**

3. **Set environment variables:**
   - All variables from `.env.example`
   - Update `DATABASE_URL` with production database
   - Update `REDIS_URL` with production Redis
   - Set a strong `SECRET_KEY`

4. **Deploy**

### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel
```

3. **Set environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_API_URL` - Your production API URL
   - `NEXT_PUBLIC_WS_URL` - Your production WebSocket URL

---

## Common Issues

### Issue: Database connection error
**Solution:** Ensure PostgreSQL is running and DATABASE_URL is correct

### Issue: Redis connection error
**Solution:** Ensure Redis is running and REDIS_URL is correct

### Issue: Module import errors
**Solution:** Ensure all dependencies are installed with `pip install -r requirements.txt`

### Issue: Frontend build errors
**Solution:** Delete `node_modules` and `.next`, then reinstall: `npm install`

---

## Development Tips

1. **API Documentation:** Visit `http://localhost:8000/api/docs` for interactive API documentation

2. **Hot Reload:** Both frontend and backend support hot reload during development

3. **Database GUI:** Use tools like pgAdmin or DBeaver to inspect the PostgreSQL database

4. **Redis GUI:** Use Redis Commander or RedisInsight to inspect Redis data

5. **Logs:** Check terminal logs for errors and debugging information

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/Mahesharunaladi/HealthGenie/issues
- Email: support@curagenie.com

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
