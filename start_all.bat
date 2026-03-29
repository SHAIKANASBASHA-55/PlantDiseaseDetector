@echo off
title Plant Disease Detector Startup
echo ==============================================
echo   Plant Disease Detector - Full App Startup
echo ==============================================
echo.

echo [1/2] Starting Backend Server...
:: Open a new command window, navigate to the backend folder, and run the backend script
start "Backend API" cmd /k "cd backend && call start.bat"

echo [2/2] Starting Frontend Application...
:: Open a new command window, navigate to the frontend folder, install packages and run Vite dev server
start "Frontend UI" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ==============================================
echo Both services are starting up in new windows!
echo - Backend will run on http://localhost:8000
echo - Frontend will run on http://localhost:5173 
echo ==============================================
echo You can safely close this main window.
timeout /t 5 >nul
