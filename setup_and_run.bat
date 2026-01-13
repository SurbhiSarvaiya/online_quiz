@echo off
TITLE Online Quiz App Setup & Run
echo Checking for Node.js...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is NOT installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/ and restart this script.
    pause
    exit
)

echo Node.js is installed. Starting setup...

echo.
echo ==========================================
echo Setting up Backend...
echo ==========================================
cd backend
if not exist node_modules (
    echo Installing Backend Dependencies...
    call npm install
) else (
    echo Backend dependencies already installed.
)

echo Starting Backend Server...
start "Quiz Backend" npm start
cd ..

echo.
echo ==========================================
echo Setting up Frontend...
echo ==========================================
cd frontend
if not exist node_modules (
    echo Installing Frontend Dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed.
)

echo Starting Frontend...
start "Quiz Frontend" npm run dev

echo.
echo ==========================================
echo Application launching...
echo Backend running on Port 5000
echo Frontend running on Port 5173
echo ==========================================
echo.
echo Please wait for the browser to open...
timeout /t 5
start http://localhost:5173

pause
