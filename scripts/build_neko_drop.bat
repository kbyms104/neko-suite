@echo off
chcp 65001 > nul
echo ===================================================
echo 🐾 Neko Drop 릴리즈 배포 빌드를 시작합니다...
echo ===================================================

cd /d "%~dp0\..\apps\neko-drop"

echo.
echo [1/3] 프론트엔드 빌드 검사...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] 프론트엔드 빌드 실패!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Tauri 릴리즈 패키징 빌드 (최적화 적용)...
call npm run tauri build
if %errorlevel% neq 0 (
    echo [ERROR] Tauri 패키징 빌드 실패!
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo 🎉 Neko Drop 릴리즈 배포 패키징이 완료되었습니다!
echo 산출물 위치:
echo apps\neko-drop\src-tauri\target\release\bundle\
echo ===================================================
pause
