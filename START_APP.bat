@echo off
REM Awlad Elsaman POS - Application Launcher
REM This script starts the application

title Awlad Elsaman POS - Starting...

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║            Awlad Elsaman Building Materials POS               ║
echo ║                      Version 1.0.0                             ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    echo After installation, close and reopen this command prompt.
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js found: 
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm is not installed
    echo.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo.
    echo [INFO] First run setup - installing dependencies...
    echo This may take 2-5 minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build if needed
if not exist "dist\index.html" (
    echo.
    echo [INFO] Building application...
    echo.
    call npm run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Build failed
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Starting Awlad Elsaman POS...
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║ The application window will open in a moment...               ║
echo ║                                                                ║
echo ║ Demo Accounts (all password: 123456):                         ║
echo ║  • admin         - Full access                                ║
echo ║  • manager1      - Manager access                             ║
echo ║  • accountant1   - Accountant access                          ║
echo ║  • cashier1      - Cashier access                             ║
echo ║                                                                ║
echo ║ Keep this window open while using the application.           ║
echo ║ If the window closes, the app will stop.                     ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Start the application
call npm run electron:dev

if errorlevel 1 (
    echo.
    echo [ERROR] Application encountered an error
    echo.
    pause
    exit /b 1
)
