@echo off
echo ========================================================
echo       Deploying Samadhan Setu to Vercel Production
echo ========================================================
cd /d "%~dp0frontend\samadhan-setu"
echo Directory: %CD%
echo.

echo Checking Vercel login status...
call npx vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo --------------------------------------------------------
    echo Step 1: Please log into your Vercel account
    echo --------------------------------------------------------
    echo.
    call npx vercel login
    if %errorlevel% neq 0 (
        echo.
        echo Login failed or was cancelled.
        pause
        exit /b 1
    )
)

echo.
echo --------------------------------------------------------
echo Step 2: Deploying to Production with Supabase Config
echo --------------------------------------------------------
call npx vercel --prod

echo.
pause
