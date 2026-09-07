@echo off
chcp 65001 > nul
setlocal

echo ===================================================
echo 🐱 Bongo Format 릴리즈 배포 빌드를 시작합니다...
echo ===================================================

cd /d "%~dp0..\apps\bongo-format"

echo [1/3] 프론트엔드 빌드 검사...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] 프론트엔드 빌드 실패
    pause
    exit /b %ERRORLEVEL%
)

echo [2/3] Tauri 릴리즈 패키징 빌드...
call npm run tauri build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Tauri 패키징 빌드 실패
    pause
    exit /b %ERRORLEVEL%
)

if not exist "%~dp0..\portable" mkdir "%~dp0..\portable"
if not exist "%~dp0..\apps\web\public\downloads" mkdir "%~dp0..\apps\web\public\downloads"

copy /Y "src-tauri\target\release\bongo-format.exe" "%~dp0..\portable\Bongo Format.exe"
copy /Y "src-tauri\target\release\bongo-format.exe" "%~dp0..\apps\web\public\downloads\Bongo Format.exe"

echo ===================================================
echo 🎉 Bongo Format 릴리즈 배포 패키징 완료!
echo 포터블 파일: portable\Bongo Format.exe
echo ===================================================
pause
