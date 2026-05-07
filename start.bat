@echo off
echo ============================================
echo  Sadgen Enrollment Portal — Backend
echo ============================================

cd /d "%~dp0"

if not exist "backend\venv" (
    echo [ERROR] Virtual environment not found in backend\. Please run 'setup.bat' first.
    pause
    exit /b
)

echo [1/2] Activating environment...
call backend\venv\Scripts\activate.bat

echo [2/2] Starting FastAPI server...
echo.
echo  Backend running at: http://localhost:8000
echo  API Docs available: http://localhost:8000/docs
echo.

:: Automatically open the browser
start http://localhost:8000

:: Move into backend to run the app correctly
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Application failed to start.
    pause
)
