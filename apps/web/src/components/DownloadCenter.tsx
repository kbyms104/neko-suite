import React, { useState } from 'react';
import { Download, Check, Copy, Shield, ArrowRight, CheckCircle2, Clock, Sparkles, Terminal } from 'lucide-react';
import { sounds } from '../sound';
import { useLanguage } from '../context/LanguageContext';
import catBoxerImg from '../assets/cat_boxer.png';
import catSitImg from '../assets/cat_sit.png';
import purrCatSleepImg from '../assets/purr/cat_sleep.png';

type DownloadApp = 'purr' | 'bongo' | 'punch' | 'drop';

export const DownloadCenter: React.FC = () => {
  const { t, lang } = useLanguage();
  const [selectedApp, setSelectedApp] = useState<DownloadApp>('purr'); // 방금 출시된 4호 앱을 기본 포커스
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedWinget, setCopiedWinget] = useState(false);

  const shaMap = {
    purr: '0c8235fa8f189073ae4212b9f27a295b224abbff1a6c1942f7bc2ef822efcdf1',
    bongo: '2782b7ebae91d42092ab3effc95e3c4c43350bb57118a8a782238b72f82e8c75',
    punch: '0cd0011fca14b5c0b104cee1fceb928fd4fd9d86a647f6e886532534516900eb',
    drop: 'cb8b009f13eea06562adda93d140705cfb3a2bf0766d14e02dd07e3c22eec695',
  };

  const wingetCmdMap = {
    purr: 'winget install NekoSuite.PurrFocus',
    bongo: 'winget install NekoSuite.BongoFormat',
    punch: 'winget install NekoSuite.NekoPunch',
    drop: 'winget install NekoSuite.NekoDrop',
  };

  const handleCopySha = () => {
    navigator.clipboard.writeText(shaMap[selectedApp]);
    setCopiedSha(true);
    sounds.playPop();
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleCopyWinget = () => {
    navigator.clipboard.writeText(wingetCmdMap[selectedApp]);
    setCopiedWinget(true);
    sounds.playPop();
    setTimeout(() => setCopiedWinget(false), 2000);
  };

  return (
    <section id="download" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cat-card border border-cat-border text-xs font-semibold text-cat-primary mb-3">
            <Download className="w-3.5 h-3.5" />
            <span>{t.download.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t.download.title}
          </h2>
          <p className="text-sm text-gray-400 mt-3">
            {t.download.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          {/* Main Download Card */}
          <div className="lg:col-span-7 rounded-3xl glass-panel-glow p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* App Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-cat-bg/80 border border-cat-border/80 mb-6 overflow-x-auto">
                <button
                  onClick={() => {
                    sounds.playPurr();
                    setSelectedApp('purr');
                  }}
                  className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedApp === 'purr'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🐾</span>
                  <span>4호: Purr</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-white/20 font-mono font-normal">NEW</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setSelectedApp('bongo');
                  }}
                  className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedApp === 'bongo'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🐱</span>
                  <span>3호: Bongo</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setSelectedApp('punch');
                  }}
                  className={`flex-1 min-w-[90px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedApp === 'punch'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🥊</span>
                  <span>2호: Punch</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setSelectedApp('drop');
                  }}
                  className={`flex-1 min-w-[85px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedApp === 'drop'
                      ? 'bg-gradient-to-r from-cat-primary to-cat-accent text-gray-950 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🐟</span>
                  <span>1호: Drop</span>
                </button>
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-1 text-2xl shadow-lg ${
                    selectedApp === 'purr'
                      ? 'bg-gradient-to-tr from-pink-500 to-rose-500 shadow-pink-500/30 text-white'
                      : selectedApp === 'bongo'
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/30 text-white'
                      : selectedApp === 'punch'
                      ? 'bg-gradient-to-tr from-[#202230] to-[#2a2d40] border border-amber-500/40 shadow-amber-500/20' 
                      : 'bg-gradient-to-tr from-cat-primary to-cat-accent shadow-cat-primary/30'
                  }`}>
                    {selectedApp === 'punch' ? (
                      <img src={catBoxerImg} alt="Boxer Cat" className="w-full h-full object-contain filter drop-shadow" />
                    ) : selectedApp === 'drop' ? (
                      <img src={catSitImg} alt="Neko Drop" className="w-full h-full object-contain filter drop-shadow" />
                    ) : selectedApp === 'purr' ? (
                      <img src={purrCatSleepImg} alt="Purr Focus" className="w-full h-full object-contain filter drop-shadow" />
                    ) : (
                      <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow p-0.5">
                        <polygon points="26,24 16,6 36,14" fill="#ffffff" stroke="#2b2d3b" strokeWidth="3" />
                        <polygon points="74,24 84,6 64,14" fill="#ffffff" stroke="#2b2d3b" strokeWidth="3" />
                        <ellipse cx="50" cy="34" rx="30" ry="24" fill="#ffffff" stroke="#2b2d3b" strokeWidth="3" />
                        <ellipse cx="38" cy="30" rx="3.5" ry="4.5" fill="#2b2d3b" />
                        <ellipse cx="62" cy="30" rx="3.5" ry="4.5" fill="#2b2d3b" />
                        <polygon points="50,35 48,37 52,37" fill="#ff9fb2" />
                        <rect x="20" y="58" width="60" height="18" rx="4" fill="#2c2d3d" stroke="#43465d" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-brand">
                      {selectedApp === 'purr'
                        ? 'Purr Focus v0.4.0'
                        : selectedApp === 'bongo'
                        ? 'Bongo Format v0.3.0'
                        : selectedApp === 'punch'
                        ? 'Neko Punch v0.2.0'
                        : t.download.cardTitle}
                    </h3>
                    <p className="text-xs text-pink-300 font-semibold">
                      {lang === 'ko' ? '공식 최신 릴리즈 (Windows x64)' : 'Official Latest Release (Windows x64)'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.download.readyBadge}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                {selectedApp === 'purr'
                  ? (lang === 'ko'
                      ? '화면 위에 상주하는 투명 프레임리스 고양이 데스크톱 펫입니다. 25분 식빵 굽기 집중과 5분 꾹꾹이 휴식 모션, 32Hz 저주파 골골송 및 스트레칭 조언을 제공합니다.'
                      : 'Transparent borderless desktop pet providing 25m focus loafing and 5m kneading breaks with 32Hz soothing purr synthesis and health tips.')
                  : selectedApp === 'bongo'
                  ? (lang === 'ko'
                      ? '클립보드에 복사된 JSON, SQL, CSV/TSV, JWT 데이터를 자동 감지하고 서식화된 인터랙티브 뷰어로 정렬해 주는 봉고캣 유틸리티입니다.'
                      : 'Auto-detects and pretty-prints JSON, SQL, CSV, and JWT from your clipboard with animated Bongo Cat.')
                  : selectedApp === 'punch'
                  ? (lang === 'ko'
                      ? '로컬 개발 중 충돌하는 포트(8080, 3000 등)를 확인하고 클릭 한 번으로 프로세스를 종료하는 시스템 트레이 유틸리티입니다.'
                      : 'Inspects listening ports (8080, 3000, etc.) and terminates stuck zombie processes with a single click.')
                  : t.download.cardDesc}
              </p>

              {/* System Specs List */}
              <div className="space-y-2 text-xs text-gray-400 mb-6 bg-cat-bg/70 p-4 rounded-xl border border-cat-border/60 font-mono">
                <div className="flex justify-between">
                  <span>{t.download.specPackage}</span>
                  <span className="text-gray-200">{t.download.specPackageVal}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.download.specSize}</span>
                  <span className="text-gray-200">{selectedApp === 'purr' ? '~4.5 MB' : selectedApp === 'bongo' ? '~8.5 MB' : selectedApp === 'punch' ? '~7.4 MB' : '~34 MB'}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.download.specOs}</span>
                  <span className="text-gray-200">{t.download.specOsVal}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.download.specNetwork}</span>
                  <span className="text-gray-200">{t.download.specNetworkVal}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={
                  selectedApp === 'purr'
                    ? './downloads/Purr Focus.exe'
                    : selectedApp === 'bongo'
                    ? './downloads/Bongo Format.exe'
                    : selectedApp === 'punch'
                    ? './downloads/Neko Punch.exe'
                    : './downloads/Neko Drop.exe'
                }
                download={
                  selectedApp === 'purr'
                    ? 'Purr Focus.exe'
                    : selectedApp === 'bongo'
                    ? 'Bongo Format.exe'
                    : selectedApp === 'punch'
                    ? 'Neko Punch.exe'
                    : 'Neko Drop.exe'
                }
                onClick={() => (selectedApp === 'purr' ? sounds.playPurr() : sounds.playSuccess())}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base shadow-xl hover:scale-[1.01] active:scale-95 transition-all group ${
                  selectedApp === 'purr'
                    ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-pink-500/30 hover:shadow-pink-500/50 text-white'
                    : selectedApp === 'bongo'
                    ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 shadow-purple-500/30 hover:shadow-purple-500/50 text-white'
                    : selectedApp === 'punch'
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 shadow-amber-500/30 hover:shadow-amber-500/50 text-gray-950'
                    : 'bg-gradient-to-r from-cat-primary via-orange-500 to-cat-accent shadow-cat-primary/30 hover:shadow-cat-primary/50 text-gray-950'
                }`}
              >
                <Download className="w-5 h-5 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
                <span>
                  {selectedApp === 'purr'
                    ? (lang === 'ko' ? 'Purr Focus.exe 다운로드' : 'Download Purr Focus.exe')
                    : selectedApp === 'bongo'
                    ? (lang === 'ko' ? 'Bongo Format.exe 다운로드' : 'Download Bongo Format.exe')
                    : selectedApp === 'punch'
                    ? (lang === 'ko' ? 'Neko Punch.exe 다운로드' : 'Download Neko Punch.exe')
                    : t.download.downloadBtn}
                </span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded-md font-mono">
                  {selectedApp === 'purr' ? '6.0MB' : selectedApp === 'bongo' ? '8.5MB' : selectedApp === 'punch' ? '7.4MB' : '34MB'}
                </span>
              </a>

              {/* WinGet Command Quick Box */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 font-mono text-xs">
                  <Terminal className="w-3.5 h-3.5 text-cat-primary shrink-0" />
                  <span className="text-gray-500 select-none">$</span>
                  <span className="text-gray-300 truncate select-all">{wingetCmdMap[selectedApp]}</span>
                </div>
                <button
                  onClick={handleCopyWinget}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-[11px] font-semibold text-white flex items-center gap-1 transition-all shrink-0"
                  title="WinGet 설치 명령어 복사"
                >
                  {copiedWinget ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedWinget ? '복사됨' : 'WinGet 복사'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.download.offlineNote}</span>
                </span>
                <button
                  onClick={handleCopySha}
                  className="hover:text-cat-primary flex items-center gap-1 font-mono transition-colors"
                >
                  {copiedSha ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSha ? t.download.shaCopied : t.download.shaConfirm}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: All 4 Utilities Lineup List */}
          <div className="lg:col-span-5 rounded-3xl glass-panel p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cat-primary" />
                <span>{t.download.roadmapTitle}</span>
              </h3>
              <p className="text-xs text-gray-400 mb-5">
                {t.download.roadmapSubtitle}
              </p>

              <div className="space-y-3">
                {[
                  {
                    id: 'purr' as const,
                    icon: '🐾',
                    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
                    btnColor: 'hover:bg-pink-500 hover:text-white',
                    title: t.download.step4Title,
                    size: t.download.step4Badge,
                    desc: t.download.step4Desc,
                    fileName: 'Purr Focus.exe',
                    href: './downloads/Purr Focus.exe',
                  },
                  {
                    id: 'bongo' as const,
                    icon: '🐱',
                    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
                    btnColor: 'hover:bg-purple-500 hover:text-white',
                    title: t.download.step3Title,
                    size: t.download.step3Badge,
                    desc: t.download.step3Desc,
                    fileName: 'Bongo Format.exe',
                    href: './downloads/Bongo Format.exe',
                  },
                  {
                    id: 'punch' as const,
                    icon: '🥊',
                    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
                    btnColor: 'hover:bg-amber-500 hover:text-gray-950',
                    title: t.download.step2Title,
                    size: t.download.step2Badge,
                    desc: t.download.step2Desc,
                    fileName: 'Neko Punch.exe',
                    href: './downloads/Neko Punch.exe',
                  },
                  {
                    id: 'drop' as const,
                    icon: '🐟',
                    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
                    btnColor: 'hover:bg-cat-primary hover:text-gray-950',
                    title: t.download.step1Title,
                    size: t.download.step1Badge,
                    desc: t.download.step1Desc,
                    fileName: 'Neko Drop.exe',
                    href: './downloads/Neko Drop.exe',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedApp(item.id);
                      sounds.playPop();
                    }}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                      selectedApp === item.id
                        ? 'bg-cat-card border-cat-primary/50 shadow-md'
                        : 'bg-cat-bg/70 border-cat-border/60 hover:border-cat-border'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base shrink-0 bg-gradient-to-tr ${item.color}`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold transition-colors truncate ${
                            selectedApp === item.id ? 'text-cat-primary' : 'text-white group-hover:text-cat-primary'
                          }`}>
                            {item.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300 font-mono shrink-0">
                            {item.size}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <a
                      href={item.href}
                      download={item.fileName}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.id === 'purr' ? sounds.playPurr() : sounds.playSuccess();
                      }}
                      title={`${item.fileName} 다운로드`}
                      className={`p-2 rounded-xl bg-cat-bg border border-cat-border text-gray-300 transition-all shrink-0 ${item.btnColor}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-cat-border flex items-center justify-between text-xs">
              <span className="text-[11px] text-gray-500">
                100% 무설치 포터블 (.exe)
              </span>
              <a
                href="https://github.com/kbyms104/neko-suite/releases/tag/v1.0.0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cat-primary hover:underline font-semibold"
              >
                <span>{t.download.githubLink}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
