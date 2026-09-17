@echo off  
title Deploy Contracts to Polygon Amoy Testnet  
echo ========================================================  
echo   Deploying VeriCity Contracts to Polygon Amoy Testnet  
echo ========================================================  
echo.  
cd /d "%~dp0blockchain"  
cmd /c npm run deploy:amoy  
echo.  
echo Deployment finished! Check Polygonscan Amoy links above.  
pause 
