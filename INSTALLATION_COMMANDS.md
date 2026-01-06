# 🚀 CuraGenie - Installation Commands Quick Reference

## Prerequisites Check

```bash
# Check Node.js version (should be 18+)
node --version

# Check Python version (should be 3.10+)
python --version

# Check Docker
docker --version
docker-compose --version

# Check PostgreSQL (if installing locally)
psql --version

# Check Redis (if installing locally)
redis-cli --version
```

---

## 🐳 Docker Installation (Recommended)

### Quick Start
```bash
# Navigate to project
cd /Users/mahesharunaladi/Documents/HealthGenie/HealthGenie

# Make quick-start script executable
chmod +x quick-start.sh

# Run interactive quick-start
./quick-start.sh

# Or manually start everything
docker-compose up --build
```

### Individual Services
```bash
# Start only database services
docker-compose up -d postgres redis

# Start backend
docker-compose up -d backend celery_worker

# Start frontend
docker-compose up -d frontend

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

---

## 💻 Local Installation (Without Docker)

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env file (use your favorite editor)
nano .env  # or code .env, or vim .env

# Install and start PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb curagenie

# Install and start Redis (macOS with Homebrew)
brew install redis
brew services start redis

# Run database migrations (when implemented)
# alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# In a new terminal, start Celery worker
cd backend
source venv/bin/activate
celery -A app.tasks worker --loglevel=info
```

### Step 2: Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install
# or
yarn install

# Create environment file
cp .env.example .env.local

# Edit .env.local
nano .env.local

# Start development server
npm run dev
# or
yarn dev
```

---

## 🔧 Database Setup Commands

### PostgreSQL

```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux

# Access PostgreSQL
psql postgres

# Create user
CREATE USER curagenie_user WITH PASSWORD 'your_password';

# Create database
CREATE DATABASE curagenie OWNER curagenie_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE curagenie TO curagenie_user;

# Exit
\q
```

### Redis

```bash
# Start Redis
brew services start redis  # macOS
sudo systemctl start redis # Linux

# Test Redis connection
redis-cli ping
# Should return: PONG
```

---

## 📦 Dependency Installation Details

### Backend Python Packages

```bash
cd backend
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install sqlalchemy==2.0.23
pip install psycopg2-binary==2.9.9
pip install python-jose[cryptography]==3.3.0
pip install passlib[bcrypt]==1.7.4
pip install pydantic-settings==2.1.0
pip install tensorflow==2.15.0
pip install scikit-learn==1.3.2
pip install opencv-python==4.8.1.78
pip install pillow==10.1.0
pip install celery==5.3.4
pip install redis==5.0.1

# Or install all at once
pip install -r requirements.txt
```

### Frontend Node Packages

```bash
cd frontend
npm install next@15.4.5
npm install react@18.3.1 react-dom@18.3.1
npm install typescript@5.0.0
npm install tailwindcss@3.3.6
npm install @radix-ui/react-avatar
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install axios
npm install lucide-react
npm install zustand

# Or install all at once
npm install
```

---

## 🧪 Testing Installation

### Test Backend

```bash
# Check if backend is running
curl http://localhost:8000

# Check health endpoint
curl http://localhost:8000/health

# Check API docs (open in browser)
open http://localhost:8000/api/docs
```

### Test Frontend

```bash
# Check if frontend is running
curl http://localhost:3000

# Open in browser
open http://localhost:3000
```

### Test Database Connection

```bash
# Test PostgreSQL
psql -h localhost -U postgres -d curagenie -c "SELECT 1;"

# Test Redis
redis-cli ping
```

---

## 🔐 Environment Variables Setup

### Backend (.env)

```bash
cd backend
cp .env.example .env

# Minimum required variables:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/curagenie
# REDIS_URL=redis://localhost:6379/0
# SECRET_KEY=your-secret-key-here
# ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```bash
cd frontend
cp .env.example .env.local

# Required variables:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

## 🐛 Troubleshooting Commands

### Port Already in Use

```bash
# Check what's using port 8000
lsof -i :8000

# Kill process on port 8000
kill -9 $(lsof -t -i:8000)

# Check what's using port 3000
lsof -i :3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)
```

### Docker Issues

```bash
# Remove all containers
docker-compose down

# Remove all volumes
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache

# View container logs
docker-compose logs backend
docker-compose logs frontend

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Database Issues

```bash
# Reset database
dropdb curagenie
createdb curagenie

# Check database connection
psql postgresql://postgres:postgres@localhost:5432/curagenie

# View tables
psql curagenie -c "\dt"
```

### Python Virtual Environment Issues

```bash
# Deactivate virtual environment
deactivate

# Remove virtual environment
rm -rf venv

# Create new virtual environment
python -m venv venv

# Activate and reinstall
source venv/bin/activate
pip install -r requirements.txt
```

### Node Modules Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## 🚀 Production Deployment Commands

### Backend (Railway/Render)

```bash
# Build command
pip install -r requirements.txt

# Start command
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Deploy to production
vercel --prod
```

---

## 📊 Useful Commands

### Git Commands

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete CuraGenie platform"

# Add remote
git remote add origin https://github.com/Mahesharunaladi/HealthGenie.git

# Push to GitHub
git push -u origin main
```

### Database Backup

```bash
# Backup database
pg_dump curagenie > backup.sql

# Restore database
psql curagenie < backup.sql
```

### View Logs

```bash
# Backend logs (if using systemd)
journalctl -u curagenie-backend -f

# Frontend logs (if using pm2)
pm2 logs curagenie-frontend

# Docker logs
docker-compose logs -f --tail=100
```

---

## ✅ Verification Checklist

Run these commands to verify everything is working:

```bash
# 1. Check backend health
curl http://localhost:8000/health

# 2. Check frontend
curl http://localhost:3000

# 3. Check database
psql curagenie -c "SELECT version();"

# 4. Check Redis
redis-cli ping

# 5. Test API endpoint
curl http://localhost:8000/api/v1/auth/me

# 6. Open in browser
open http://localhost:3000
open http://localhost:8000/api/docs
```

---

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Backend responds at http://localhost:8000
- ✅ API docs accessible at http://localhost:8000/api/docs
- ✅ Frontend loads at http://localhost:3000
- ✅ No error messages in terminal
- ✅ Database connection successful
- ✅ Redis connection successful
- ✅ Can register a new user
- ✅ Can login and get JWT token

---

## 📞 Need Help?

If you encounter issues:

1. Check the error logs carefully
2. Review SETUP.md for detailed instructions
3. Search existing GitHub issues
4. Create a new issue with error details

**Happy coding! 🚀**
