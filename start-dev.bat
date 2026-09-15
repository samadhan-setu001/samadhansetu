@echo off
title Samadhan Setu Development Server
echo ========================================================
echo        Starting Samadhan Setu Civic Trust Platform
echo ========================================================
echo.
cd /d "%~dp0frontend\samadhan-setu"
echo Starting Next.js development server...
echo The server runs continuously in this window. Keep this open!
echo Opening http://localhost:3000 in your browser...
echo.
start http://localhost:3000
cmd /c npm run dev
pause
