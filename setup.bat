@echo off
echo ============================================
echo  Sadgen Enrollment Portal — Setup Script
echo ============================================

cd /d "%~dp0"

echo [1/4] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    pause
    exit /b
)

echo [2/4] Creating virtual environment...
if not exist "backend\venv" (
    python -m venv backend\venv
    echo Virtual environment created in backend\venv.
) else (
    echo Virtual environment already exists in backend\venv. Skipping.
)

echo [3/4] Upgrading pip and installing dependencies...
call backend\venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

echo [4/4] Setup complete!
echo.
echo To start the app, you can now run 'start.bat'
echo.
pause
