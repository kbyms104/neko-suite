# 🐾 Neko Suite (고양이 테마 4종 초경량 데스크톱 유틸리티)

Tauri v2 + Rust + React/TypeScript 기반의 100% 로컬 오프라인 고양이 유틸리티 스위트입니다.

---

## 📦 포함된 애플리케이션 목록

| 앱 번호 | 앱 이름 | 버전 | 한 줄 설명 | 주요 기술 스택 | 배포 상태 | 바로 실행 |
|---|---|---|---|---|---|---|
| **1호** | **Neko Drop** | `v0.1.0` | 대용량 데이터 파일 변환기 (CSV/Parquet/JSON/XLSX) | Tauri v2, Polars, Calamine | ✅ **배포 완료** | [`portable/Neko Drop.exe`](file:///c:/Users/yun/Desktop/project/desktop_app/portable/Neko%20Drop.exe) |
| **2호** | **Neko Punch** | `v0.2.0` | 포트 충돌 & 좀비 프로세스 킬러 ('내 포트 ⭐' 커스텀 탭 탑재) | Tauri v2, Sysinfo, Windows API | ✅ **배포 완료** | [`portable/Neko Punch.exe`](file:///c:/Users/yun/Desktop/project/desktop_app/portable/Neko%20Punch.exe) |
| **3호** | **Bongo Format** | `v0.3.0` | 클립보드 데이터 포맷터 (JSON/SQL/CSV/JWT/Text) | Tauri v2, Arboard, sqlformat, csv | ✅ **배포 완료** | [`portable/Bongo Format.exe`](file:///c:/Users/yun/Desktop/project/desktop_app/portable/Bongo%20Format.exe) |
| **4호** | **Purr Focus** | `v0.4.0` | 꾹꾹이 데스크톱 펫 & 포모도로 타이머 (투명 오버레이/클릭투과) | Tauri v2 (Transparent/Always-on-Top), Web Audio 32Hz | ✅ **배포 완료** | [`portable/Purr Focus.exe`](file:///c:/Users/yun/Desktop/project/desktop_app/portable/Purr%20Focus.exe) |

---

## 🛠️ 공통 기술 스펙 & 개발 원칙

1. **프레임워크**: Tauri v2 + Rust (Backend) + Vite / TypeScript / Tailwind CSS (Frontend)
2. **성능 원칙**:
   - 가볍고 빠른 구동 및 효율적인 시스템 자원 관리
   - 완전한 로컬 오프라인: 외부 네트워크 통신 0%, 안전한 프라이빗 로컬 연산
3. **패키징**: 단일 Windows 무설치 포터블 실행 파일(`.exe`) 또는 `.msi` 인스톨러

---

## 🚀 빠른 시작 (개발 환경)

### 필수 요구사항
- [Rust & Cargo](https://www.rust-lang.org/) (최신 stable)
- [Node.js](https://nodejs.org/) (v18+ 권장)
- C++ Build Tools (Windows 환경)

### 개별 앱 개발 실행
```bash
# 루트 디렉토리에서

# 1호 앱 Neko Drop 실행
npm run dev:neko-drop        # 웹 UI 개발 서버 (http://localhost:5173)
npm run tauri:neko-drop dev  # 데스크톱 앱 개발 모드 실행

# 2호 앱 Neko Punch 실행
npm run dev:neko-punch       # 웹 UI 개발 서버 (http://localhost:1421)
npm run tauri:neko-punch dev # 데스크톱 앱 개발 모드 실행

# 3호 앱 Bongo Format 실행
npm run dev:bongo-format        # 웹 UI 개발 서버 (http://localhost:1422)
npm run tauri:bongo-format dev  # 데스크톱 앱 개발 모드 실행

# 4호 앱 Purr Focus 실행
npm run dev:purr-focus        # 웹 UI 개발 서버 (http://localhost:1423)
npm run tauri:purr-focus dev  # 데스크톱 앱 개발 모드 실행

# 공식 쇼케이스 웹사이트 실행
npm run dev:web              # 쇼케이스 웹 (http://localhost:5174)
```

---

## 📦 배포 및 설치 (Release & Distribution)

### 🌟 1. Windows 공식 패키지 관리자 (WinGet) 설치
Windows 10 / 11의 터미널(PowerShell 또는 CMD)에서 한 줄 명령어로 즉시 설치할 수 있습니다:

```powershell
# 1호 Neko Drop 설치
winget install NekoSuite.NekoDrop

# 2호 Neko Punch 설치
winget install NekoSuite.NekoPunch

# 3호 Bongo Format 설치
winget install NekoSuite.BongoFormat

# 4호 Purr Focus 설치
winget install NekoSuite.PurrFocus
```

> **WinGet 공식 커뮤니티 저장소(`microsoft/winget-pkgs`) PR 현황**:
> - 🐾 [Purr Focus PR #431215](https://github.com/microsoft/winget-pkgs/pull/431215)
> - 🐟 [Neko Drop PR #431216](https://github.com/microsoft/winget-pkgs/pull/431216)
> - 🥊 [Neko Punch PR #431217](https://github.com/microsoft/winget-pkgs/pull/431217)
> - 🐱 [Bongo Format PR #431218](https://github.com/microsoft/winget-pkgs/pull/431218)
>
> *(로컬 매니페스트로 지금 즉시 설치하려면: `winget install -m winget-pkgs/manifests/n/NekoSuite/<App>/<Version>`)*

---

### 🍦 2. Scoop 패키지 관리자 설치
Scoop을 사용하는 개발자라면 저장소 버킷을 추가하여 즉시 설치할 수 있습니다:

```powershell
# Neko Suite 버킷 추가
scoop bucket add neko https://github.com/kbyms104/neko-suite

# 원하는 도구 설치
scoop install purr-focus
scoop install bongo-format
scoop install neko-punch
scoop install neko-drop
```

---

### 🚀 3. 무설치 단일 포터블 실행 (.exe 직접 다운로드)
- 설치 과정이나 추가 부속 파일(DLL, 런타임 등)이 **일절 필요 없는 단 1개의 독립 `.exe` 파일**입니다.
- 바탕화면, 다운로드 폴더, USB 등 어디서나 더블 클릭하여 바로 실행할 수 있습니다.
- **공식 릴리즈 배포 페이지**: 👉 **[GitHub Releases (v1.0.0)](https://github.com/kbyms104/neko-suite/releases/tag/v1.0.0)**
- **1호 앱**: [`portable/Neko Drop.exe`](file:///c:/Users/yun/Desktop/project/desktop_app/portable/Neko%20Drop.exe) (~34.1 MB)
- **2호 앱**: [`portable/Neko Punch.exe`](file:///c:/Users/yun/Desktop/project/desktop_app/portable/Neko%20Punch.exe) (~7.1 MB)
- **3호 앱**: [`portable/Bongo Format.exe`](file:///c:/Users/yun/Desktop/project/desktop_app/portable/Bongo%20Format.exe) (~4.4 MB)
- **4호 앱**: [`portable/Purr Focus.exe`](file:///c:/Users/yun/Desktop/project/desktop_app/portable/Purr%20Focus.exe) (~6.0 MB)

### 2. 로컬 빌드 스크립트 (원클릭 빌드)
- **1호 Neko Drop 빌드**:
  - 더블 클릭: `scripts/build_neko_drop.bat`
  - PowerShell: `.\scripts\build_neko_drop.ps1`
- **2호 Neko Punch 빌드**:
  - 더블 클릭: `scripts/build_neko_punch.bat`
  - PowerShell: `.\scripts\build_neko_punch.ps1`
- **3호 Bongo Format 빌드**:
  - 더블 클릭: `scripts/build_bongo_format.bat`
  - PowerShell: `.\scripts\build_bongo_format.ps1`
- **4호 Purr Focus 빌드**:
  - 더블 클릭: `scripts/build_purr_focus.bat`
  - PowerShell: `.\scripts\build_purr_focus.ps1`

### 3. GitHub Actions 자동 릴리즈 (CI/CD)
- 워크플로우 구성 완료: 태그 푸시 시 GitHub Releases에 무설치 단일 실행 파일(`.exe`)이 자동 업로드됩니다.

---

## 🌐 공식 쇼케이스 웹사이트 (`apps/web`)

Neko Suite 4종 앱을 한곳에서 살펴보고, 브라우저 인터랙티브 시뮬레이터 체험 및 최신 포터블 바이너리를 다운로드할 수 있는 공식 쇼케이스 웹사이트입니다.

- 🔗 **온라인 웹사이트 바로가기**: **[https://kbyms104.github.io/neko-suite/](https://kbyms104.github.io/neko-suite/)**
- **로컬 개발 서버 실행**: `npm run dev:web` (접속: `http://localhost:5174`)
- **프로덕션 빌드**: `npm run build:web`
- **핵심 기능**:
  - 🐟 **Neko Drop**: 브라우저 파일 드롭 & 변환 인터랙션 미리보기 및 `.exe` 다운로드
  - 🥊 **Neko Punch**: 포트 실시간 감지, 하트 젤리 냥펀치 타격 인터랙션, '내 포트 ⭐' 탭 체험 및 `.exe` 다운로드
  - 🎹 **Bongo Format**: 봉고캣 애니메이션 및 JSON/SQL/CSV 포맷팅 프리뷰
  - 🍞 **Purr Focus**: 25분 집중 ↔ 5분 휴식 꾹꾹이 & 골골송(Purring) 시뮬레이터
  - 🌐 **다국어 지원**: 상단 `KR` / `ENG` 1클릭 전환 지원
