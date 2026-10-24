@echo off
setlocal
cd /d "%~dp0"
title English Quest v20 - Cloud Progress
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi.
  echo https://nodejs.org adresinden LTS surumunu kurup tekrar dene.
  pause
  exit /b 1
)
echo ============================================================
echo English Quest - muzik odullu hafif surum - Google bulut esitleme hazir
echo AI ses modeli yok. Python/PyTorch kurulumu gerekmiyor.
echo Tarayicinin/cihazin yerlesik Ingilizce sesi kullanilir.
echo ============================================================
start "English Quest Server" /D "%~dp0" cmd /k "npm start"
timeout /t 3 >nul
start "" "http://localhost:4319"
echo.
echo Sunucu ayri bir pencerede calisiyor. Kapatmak icin o pencereye donup Ctrl+C bas.
pause
