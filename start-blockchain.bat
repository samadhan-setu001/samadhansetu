@echo off
title VeriCity Local Blockchain (Hardhat)
echo ========================================================
echo        Starting VeriCity Local Hardhat Node
echo ========================================================
echo.
echo Running local Ethereum JSON-RPC node at http://127.0.0.1:8545
echo Keep this window open while testing locally!
echo.
cd /d "%~dp0blockchain"
cmd /c npm run node
pause
