#!/bin/bash

# CuraGenie Quick Start Script
# This script helps you quickly set up and run the CuraGenie platform

set -e  # Exit on error

echo "======================================"
echo "  CuraGenie - Quick Start"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed.${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Backend .env created${NC}"
else
    echo -e "${GREEN}✓ Backend .env already exists${NC}"
fi

if [ ! -f frontend/.env.local ]; then
    echo -e "${YELLOW}Creating frontend .env.local file...${NC}"
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}✓ Frontend .env.local created${NC}"
else
    echo -e "${GREEN}✓ Frontend .env.local already exists${NC}"
fi

echo ""
echo "======================================"
echo "  Starting Services"
echo "======================================"
echo ""

# Ask user what to do
echo "What would you like to do?"
echo "1) Start all services with Docker Compose"
echo "2) Start backend only"
echo "3) Start frontend only"
echo "4) Stop all services"
echo "5) View logs"
echo "6) Reset and rebuild"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo -e "${YELLOW}Starting all services...${NC}"
        docker-compose up -d
        echo ""
        echo -e "${GREEN}✓ All services started successfully!${NC}"
        echo ""
        echo "Services are running at:"
        echo "  • Frontend:  http://localhost:3000"
        echo "  • Backend:   http://localhost:8000"
        echo "  • API Docs:  http://localhost:8000/api/docs"
        echo "  • PostgreSQL: localhost:5432"
        echo "  • Redis:     localhost:6379"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop: docker-compose down"
        ;;
    2)
        echo -e "${YELLOW}Starting backend services only...${NC}"
        docker-compose up -d postgres redis backend celery_worker
        echo ""
        echo -e "${GREEN}✓ Backend services started!${NC}"
        echo ""
        echo "Backend running at: http://localhost:8000"
        echo "API Docs: http://localhost:8000/api/docs"
        ;;
    3)
        echo -e "${YELLOW}Starting frontend only...${NC}"
        docker-compose up -d frontend
        echo ""
        echo -e "${GREEN}✓ Frontend started!${NC}"
        echo ""
        echo "Frontend running at: http://localhost:3000"
        ;;
    4)
        echo -e "${YELLOW}Stopping all services...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ All services stopped${NC}"
        ;;
    5)
        echo -e "${YELLOW}Viewing logs (Ctrl+C to exit)...${NC}"
        docker-compose logs -f
        ;;
    6)
        echo -e "${YELLOW}Resetting and rebuilding...${NC}"
        docker-compose down -v
        docker-compose up --build -d
        echo ""
        echo -e "${GREEN}✓ Services rebuilt and started!${NC}"
        echo ""
        echo "Services are running at:"
        echo "  • Frontend:  http://localhost:3000"
        echo "  • Backend:   http://localhost:8000"
        echo "  • API Docs:  http://localhost:8000/api/docs"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "  Quick Start Complete!"
echo "======================================"
