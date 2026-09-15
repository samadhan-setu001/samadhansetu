param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z0-9]{20}$')]
  [string]$ProjectRef
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$cli = Join-Path $root 'tools\supabase-cli\supabase.exe'
$envFile = Join-Path $root '.env'

if (-not (Test-Path -LiteralPath $cli)) { throw 'Supabase CLI is missing. Download it again or install Supabase CLI globally.' }
if (-not (Test-Path -LiteralPath $envFile)) { throw 'Create .env by copying .env.example, then fill every required value.' }
$required = 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'HMAC_SECRET', 'CRON_SECRET'
$settings = @{}
foreach ($line in Get-Content -LiteralPath $envFile) {
  if ($line -match '^\s*([A-Z0-9_]+)=(.*)$') { $settings[$Matches[1]] = $Matches[2].Trim() }
}
foreach ($name in $required) { if ([string]::IsNullOrWhiteSpace($settings[$name])) { throw "$name is blank in .env" } }

Push-Location $root
try {
  & $cli link --project-ref $ProjectRef
  & $cli db push
  & $cli secrets set --env-file .env
  'otp-verify-hook', 'complaints', 'authority-officers', 'authority-assignments', 'officer-cases', 'auth-password-change' | ForEach-Object { & $cli functions deploy $_ }
  & $cli functions deploy score-recompute --no-verify-jwt
  Write-Host 'Samadhan Setu backend deployed successfully.' -ForegroundColor Green
} finally {
  Pop-Location
}
