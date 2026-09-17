@echo off
title Run VeriCity Nightly Cron (Merkle Anchor & Reputation)
echo ========================================================
echo        Running VeriCity Nightly Anchoring Cron
echo ========================================================
echo.
cd /d "%~dp0backend"
cmd /c npm run cron:anchor
echo.
echo Cron job finished!
pause
