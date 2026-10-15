@echo off
title Toolbox
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js non trovato.
  echo Scaricalo da https://nodejs.org - versione LTS - installalo, poi riavvia questo file.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Prima installazione: npm install in corso...
  call npm install
  if errorlevel 1 (
    echo Installazione fallita.
    pause
    exit /b 1
  )
)

start "" powershell -NoProfile -WindowStyle Hidden -Command "$u='http://localhost:3100/'; for($i=0;$i -lt 120;$i++){ try { Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 30 | Out-Null; Start-Process $u; break } catch { Start-Sleep -Milliseconds 500 } }"
echo Toolbox su http://localhost:3100 - chiudi questa finestra per fermarlo.
call npm run dev -- -p 3100
