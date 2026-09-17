@echo off
title Deploy Contracts Locally (Hardhat)
echo ========================================================
echo     Deploying VeriCity Contracts to Local Blockchain
echo ========================================================
echo.
cd /d "%~dp0blockchain"
cmd /c npm run deploy:local
echo.
echo Deployment finished! You can close this window.
pause
