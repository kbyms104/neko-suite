@echo off
chcp 65001 > nul
echo ===================================================
echo 🐾 Purr Focus 릴리즈 배포 빌드를 시작합니다...
echo ===================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build_purr_focus.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 빌드 중 오류가 발생했습니다!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ 빌드가 성공적으로 완료되었습니다!
pause
