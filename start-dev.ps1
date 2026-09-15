# Launch Samadhan Setu development server bypassing PowerShell script restriction
Set-Location -LiteralPath "$PSScriptRoot\frontend\samadhan-setu"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Starting Samadhan Setu Civic Trust Platform" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Local URL: http://localhost:3000`n" -ForegroundColor Yellow
Start-Process "http://localhost:3000"
& cmd /c npm run dev
