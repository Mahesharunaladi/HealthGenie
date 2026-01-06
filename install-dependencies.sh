#!/bin/bash

# CuraGenie - Dependency Installation Script
# This script installs all required dependencies for the project

set -e  # Exit on error

echo "======================================"
echo "  CuraGenie - Installing Dependencies"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check current directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Backend Installation
echo -e "${YELLOW}Installing Backend Dependencies...${NC}"
if [ -d "backend" ]; then
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    echo "Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    echo "Upgrading pip..."
    pip install --upgrade pip
    
    # Install dependencies
    echo "Installing Python packages..."
    pip install -r requirements.txt
    
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    
    # Deactivate virtual environment
    deactivate
    
    cd ..
else
    echo -e "${RED}Backend directory not found${NC}"
fi

echo ""

# Frontend Installation
echo -e "${YELLOW}Installing Frontend Dependencies...${NC}"
if [ -d "frontend" ]; then
    cd frontend
    
    # Install Node dependencies
    echo "Installing Node packages..."
    npm install
    
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    
    cd ..
else
    echo -e "${RED}Frontend directory not found${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}  Installation Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Configure environment variables:"
echo "   cp backend/.env.example backend/.env"
echo "   cp frontend/.env.example frontend/.env.local"
echo ""
echo "2. Start the application:"
echo "   ./quick-start.sh"
echo ""
echo "Or start manually:"
echo "   Backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "   Frontend: cd frontend && npm run dev"
echo ""
