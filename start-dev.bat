@echo off
title Samadhan Setu Development Server
echo ========================================================
echo        Starting Samadhan Setu Civic Trust Platform
echo ========================================================
echo.
cd /d "%~dp0frontend\samadhan-setu"
echo Starting Next.js development server...
echo Waiting a few seconds for the dev server to initialize before opening your browser...
echo The server runs continuously in this window. Keep this window open!
echo.
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 6; Start-Process 'http://localhost:3000'"
npm run dev
pause
