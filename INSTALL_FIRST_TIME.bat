@echo off
REM ========================================
REM  Awlad Elsaman POS - First Run Setup
REM ========================================

setlocal enabledelayedexpansion

title Awlad Elsaman POS - Installation

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        Awlad Elsaman Building Materials POS               ║
echo ║                Installation Setup                         ║
echo ║                Version 1.0.0                              ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check for Node.js
echo [Step 1/4] Checking for Node.js...
where /q node
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js is not installed!
    echo.
    echo This application requires Node.js to run.
    echo.
    echo Download from: https://nodejs.org/ (LTS version recommended)
    echo.
    echo After installation:
    echo   1. Restart your computer
    echo   2. Run this setup script again
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%A in ('node --version') do set NODE_VERSION=%%A
echo ✓ Found Node.js %NODE_VERSION%
echo.

REM Check for npm
echo [Step 2/4] Checking for npm...
where /q npm
if errorlevel 1 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)

for /f "tokens=*" %%A in ('npm --version') do set NPM_VERSION=%%A
echo ✓ Found npm %NPM_VERSION%
echo.

REM Install dependencies
echo [Step 3/4] Installing dependencies...
echo This may take 3-5 minutes on first run...
echo.

if not exist "node_modules" (
    call npm install --production
    if errorlevel 1 (
        echo.
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
)
echo ✓ Dependencies installed
echo.

REM Build React app
echo [Step 4/4] Building application...
if not exist "dist\index.html" (
    call npm run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Build failed!
        pause
        exit /b 1
    )
)
echo ✓ Application built
echo.

REM Success
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║         ✓ Installation Complete!                          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
echo Next Steps:
echo   1. Run START_APP.bat to launch the application
echo   2. Or run START_APP_QUICK.bat for faster startup
echo.
echo Demo Login Information:
echo   Username: admin
echo   Password: 123456
echo.
echo Additional demo accounts available:
echo   - manager1 (password: 123456)
echo   - accountant1 (password: 123456)
echo   -cashier1 (password: 123456)
echo.
pause
