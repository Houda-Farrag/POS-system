@echo off
REM ========================================
REM  Quick Start - Launches the POS App
REM ========================================

setlocal enabledelayedexpansion

title Awlad Elsaman POS - Starting Application

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        Awlad Elsaman Building Materials POS               ║
echo ║                 Version 1.0.0                             ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verify Node.js is installed
where /q node
if errorlevel 1 (
    cls
    echo.
    echo [ERROR] Node.js not found!
    echo.
    echo Please:
    echo   1. Install Node.js from https://nodejs.org/
    echo   2. Restart your computer
    echo   3. Run this file again
    echo.
    pause
    exit /b 1
)

REM Check if this is first time
if not exist "node_modules" (
    echo First time setup detected...
    echo Please run INSTALL_FIRST_TIME.bat first
    echo.
    pause
    exit /b 1
)

if not exist "dist\index.html" (
    echo Application not built yet...
    echo Building application...
    call npm run build
)

echo.
echo Starting application...
echo Please wait...
echo.
echo ═══════════════════════════════════════════════════════════════
echo  Once the application appears, you may see messages below.
echo  These are normal - keep this window open while using the app.
echo ═══════════════════════════════════════════════════════════════
echo.

call npm run electron:dev

endlocal
