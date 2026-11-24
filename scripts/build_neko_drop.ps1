# PowerShell Release Build Script for Neko Drop
$ErrorActionPreference = "Stop"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "🐾 Neko Drop 릴리즈 배포 빌드를 시작합니다..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$AppDir = Join-Path $PSScriptRoot "..\apps\neko-drop"
Set-Location $AppDir

Write-Host "`n[1/3] 프론트엔드 빌드 검사..." -ForegroundColor Yellow
npm run build

Write-Host "`n[2/3] Tauri 릴리즈 패키징 빌드 (최적화 적용)..." -ForegroundColor Yellow
npm run tauri build

$ReleaseExe = Join-Path $AppDir "src-tauri\target\release\neko-drop.exe"
$PortableDir = Join-Path $PSScriptRoot "..\portable"
$WebDownloadsDir = Join-Path $PSScriptRoot "..\apps\web\public\downloads"

if (-not (Test-Path $PortableDir)) { New-Item -ItemType Directory -Path $PortableDir | Out-Null }
if (-not (Test-Path $WebDownloadsDir)) { New-Item -ItemType Directory -Path $WebDownloadsDir | Out-Null }

if (Test-Path $ReleaseExe) {
    Copy-Item $ReleaseExe (Join-Path $PortableDir "Neko Drop.exe") -Force
    Copy-Item $ReleaseExe (Join-Path $WebDownloadsDir "Neko Drop.exe") -Force
}

$BundleDir = Join-Path $AppDir "src-tauri\target\release\bundle"
Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "🎉 Neko Drop 릴리즈 배포 패키징이 완료되었습니다!" -ForegroundColor Green
Write-Host "산출물 위치: $BundleDir" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

if (Test-Path $BundleDir) {
    Get-ChildItem -Path $BundleDir -Recurse -Include *.exe, *.msi | ForEach-Object {
        Write-Host "  📦 $($_.Name) ($([math]::Round($_.Length / 1MB, 2)) MB)" -ForegroundColor White
    }
}
