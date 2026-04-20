param(
    [int]$Port = 5174
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location -LiteralPath $repoRoot

$env:PATH = "C:\Program Files\nodejs;C:\Program Files\nodejs\node_modules\corepack\shims;$env:PATH"

Write-Host "Starting SteelLink seller app..." -ForegroundColor Cyan
Write-Host "Seller app: http://localhost:$Port" -ForegroundColor DarkGray

cmd /c "pnpm --filter @steellink/seller-app dev -- --host 0.0.0.0 --strictPort --port $Port"
