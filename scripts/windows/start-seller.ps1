param(
    [int]$Port = 5174
)

$ErrorActionPreference = "Stop"

function Invoke-Pnpm {
    param(
        [string[]]$Arguments
    )

    $pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue
    if ($pnpmCommand) {
        & $pnpmCommand.Source @Arguments
        return
    }

    $corepackCommand = Get-Command corepack -ErrorAction SilentlyContinue
    if ($corepackCommand) {
        & $corepackCommand.Source pnpm @Arguments
        return
    }

    throw "pnpm not found. Enable it with Corepack (`corepack enable pnpm`) or install pnpm globally."
}

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location -LiteralPath $repoRoot

Write-Host "Starting SteelLink seller app..." -ForegroundColor Cyan
Write-Host "Seller app: http://localhost:$Port" -ForegroundColor DarkGray

Invoke-Pnpm -Arguments @("--filter", "@steellink/seller-app", "dev", "--", "--host", "0.0.0.0", "--strictPort", "--port", "$Port")
