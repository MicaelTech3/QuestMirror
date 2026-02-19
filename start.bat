@echo off
title Quest Mirror - Servidor
color 0A

echo.
echo  ==========================================
echo   Quest Mirror - Iniciando servidor...
echo  ==========================================
echo.

:: Verifica se o Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERRO] Node.js nao encontrado!
    echo.
    echo  Instale o Node.js em: https://nodejs.org
    echo  Baixe a versao LTS e instale normalmente.
    echo.
    pause
    exit /b 1
)

:: Verifica se as dependencias estao instaladas
if not exist "node_modules" (
    echo  [INFO] Instalando dependencias pela primeira vez...
    echo.
    call npm install
    echo.
)

:: Pega o IP local automaticamente
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1" ^| findstr /v "169.254"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
:: Remove espaço inicial
set LOCAL_IP=%LOCAL_IP: =%

echo  ==========================================
echo   Servidor rodando!
echo  ==========================================
echo.
echo   IP do servidor: %LOCAL_IP%
echo.
echo   Abra no Quest (Meta Browser):
echo   http://%LOCAL_IP%:3000/sender.html
echo.
echo   Abra no Chrome para o Chromecast:
echo   http://%LOCAL_IP%:3000/viewer.html
echo.
echo   IMPORTANTE: Nao feche esta janela!
echo  ==========================================
echo.

node server.js

pause