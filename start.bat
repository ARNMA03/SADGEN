@echo off
echo ============================================
echo  Efficio Enrollment Portal — Backend Setup
echo ============================================

cd /d "%~dp0"

echo [1/4] Creating Python virtual environment...
python -m venv venv

echo [2/4] Activating venv and installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo [3/4] Seeding database...
python seed.py

echo [4/4] Starting FastAPI server...
echo.
echo  Backend running at: http://localhost:8000
echo  API Docs available: http://localhost:8000/docs
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000
