#Requires -Version 5.1
<#
.SYNOPSIS
  Instala e ativa o tema Neon Cyber Pulse no Hydra Launcher local.

.DESCRIPTION
  1. Fecha o Hydra (se estiver aberto)
  2. Grava o CSS no banco de dados do launcher (LevelDB)
  3. Ativa o tema automaticamente
  4. Reabre o Hydra

.EXAMPLE
  .\install-neon-cyber-pulse.ps1
  .\install-neon-cyber-pulse.ps1 -NoRestart
#>
param(
    [switch]$NoRestart,
    [switch]$KeepHydraOpen
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$ScriptsDir = Join-Path $ProjectRoot "scripts"
$HydraExe = "C:\Program Files\Hydra\Hydra.exe"

function Write-Step($msg) {
    Write-Host "`n>> $msg" -ForegroundColor Cyan
}

function Stop-Hydra {
    $procs = Get-Process -Name "Hydra" -ErrorAction SilentlyContinue
    if ($procs) {
        Write-Step "Fechando Hydra Launcher..."
        $procs | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
}

function Start-Hydra {
    if (-not (Test-Path $HydraExe)) {
        Write-Host "Hydra não encontrado em: $HydraExe" -ForegroundColor Yellow
        Write-Host "Abra o Hydra manualmente para ver o tema." -ForegroundColor Yellow
        return
    }
    Write-Step "Abrindo Hydra Launcher..."
    Start-Process -FilePath $HydraExe
}

Write-Host ""
Write-Host "  NEON CYBER PULSE - Instalador de Tema" -ForegroundColor Magenta
Write-Host "  =====================================" -ForegroundColor Magenta

if (-not (Test-Path (Join-Path $ProjectRoot "themes\Neon-Cyber-Pulse-x5kbPVeQ\theme.css"))) {
    throw "Arquivo theme.css não encontrado. Execute este script na raiz do projeto."
}

if (-not $KeepHydraOpen) {
    Stop-Hydra
}

Write-Step "Instalando dependências do instalador (classic-level)..."
Push-Location $ScriptsDir
try {
    if (-not (Test-Path "node_modules\classic-level")) {
        npm install --silent 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao instalar dependências. Verifique se Node.js/npm está instalado."
        }
    }

    Write-Step "Gravando tema no Hydra e ativando..."
    node ".\install-neon-cyber-pulse.mjs"
    if ($LASTEXITCODE -ne 0) {
        throw "Instalação do tema falhou."
    }
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "  Tema instalado com sucesso!" -ForegroundColor Green
Write-Host "  Edite o CSS em: themes\Neon-Cyber-Pulse-x5kbPVeQ\theme.css" -ForegroundColor Gray
Write-Host "  Rode este script novamente após alterações para aplicar." -ForegroundColor Gray

if (-not $NoRestart) {
    Start-Hydra
}
