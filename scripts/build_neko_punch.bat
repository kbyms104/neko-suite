@echo off
chcp 65001 > nul
echo ===================================================
echo 🐾 Neko Punch 릴리즈 배포 빌드를 시작합니다...
echo ===================================================

cd /d "%~dp0\..\apps\neko-punch"

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
echo [3/3] 단일 포터블 폴더 및 웹 다운로드로 복사...
if not exist "%~dp0\..\portable" mkdir "%~dp0\..\portable"
if not exist "%~dp0\..\apps\web\public\downloads" mkdir "%~dp0\..\apps\web\public\downloads"

copy /y "%~dp0\..\apps\neko-punch\src-tauri\target\release\neko-punch.exe" "%~dp0\..\portable\Neko Punch.exe" > nul
copy /y "%~dp0\..\apps\neko-punch\src-tauri\target\release\neko-punch.exe" "%~dp0\..\apps\web\public\downloads\Neko Punch.exe" > nul

echo.
echo ===================================================
echo 🎉 Neko Punch 릴리즈 배포 패키징이 완료되었습니다!
echo 포터블 파일 위치: portable\Neko Punch.exe
echo ===================================================
pause
