#!/bin/bash

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Activate virtual environment and start server
./venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
