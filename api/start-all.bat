@echo off
REM Inicia MongoDB y luego el backend Node.js

REM Iniciar MongoDB como servicio (si está instalado como servicio)
net start MongoDB

REM Esperar 3 segundos para asegurar que MongoDB arranque
ping 127.0.0.1 -n 4 > nul

REM Iniciar el backend Node.js
cd /d %~dp0
npm start
pause
