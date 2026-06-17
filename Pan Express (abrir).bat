@echo off
title Pan Express
chcp 65001 >nul
cd /d "%~dp0server"

echo.
echo   ==========================================
echo      PAN EXPRESS - Iniciando tu aplicacion
echo   ==========================================
echo.

REM Instalar dependencias la primera vez
if not exist "node_modules" (
  echo   Instalando componentes por primera vez, espera un momento...
  call npm install
  echo.
)

REM Abrir el navegador 3 segundos despues (cuando el servidor ya este listo)
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo   La app se abrira en tu navegador en unos segundos.
echo.
echo   IMPORTANTE: deja esta ventana abierta mientras usas la app.
echo   Para cerrar la app, cierra esta ventana.
echo.

REM Iniciar el servidor (primer plano; al cerrar la ventana se apaga la app)
node --no-warnings server.js

pause
