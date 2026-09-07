import React, { useState } from 'react';
import { Download, Check, Copy, Shield, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { sounds } from '../sound';
import { useLanguage } from '../context/LanguageContext';
import catBoxerImg from '../assets/cat_boxer.png';

type DownloadApp = 'purr' | 'bongo' | 'punch' | 'drop';

export const DownloadCenter: React.FC = () => {
  const { t, lang } = useLanguage();
  const [selectedApp, setSelectedApp] = useState<DownloadApp>('purr'); // 방금 출시된 4호 앱을 기본 포커스
  const [copiedSha, setCopiedSha] = useState(false);

  const shaMap = {
    purr: 'c9f41e8f12d4b6c884210f9e1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0e4',
    bongo: 'd8a39e8f12d4b6c884210f9e1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0e3',
    punch: 'f7c20a9e8b1d4c682410a9e1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0e2',
    drop: 'a39e8f12d4b6c884210f9e1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1',
  };

  const handleCopySha = () => {
    navigator.clipboard.writeText(shaMap[selectedApp]);
    setCopiedSha(true);
    sounds.playPop();
    setTimeout(() => setCopiedSha(false), 2000);
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
                      <img src={catBoxerImg} alt="Boxer Cat" className="w-full h-full object-contain" />
                    ) : selectedApp === 'purr' ? '🐾' : selectedApp === 'bongo' ? '🐱' : '🐟'}
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
                  {selectedApp === 'purr' ? '4.5MB' : selectedApp === 'bongo' ? '8.5MB' : selectedApp === 'punch' ? '7.4MB' : '34MB'}
                </span>
              </a>

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

          {/* Right: Roadmap Timeline */}
          <div className="lg:col-span-5 rounded-3xl glass-panel p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cat-primary" />
                <span>{t.download.roadmapTitle}</span>
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                {t.download.roadmapSubtitle}
              </p>

              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-cat-border">
                {/* Step 1: Neko Drop */}
                <div className="relative flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-400 z-10 shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">{t.download.step1Title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        {t.download.step1Badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.download.step1Desc}
                    </p>
                  </div>
                </div>

                {/* Step 2: Neko Punch */}
                <div className="relative flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-400 z-10 shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">{t.download.step2Title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        {t.download.step2Badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.download.step2Desc}
                    </p>
                  </div>
                </div>

                {/* Step 3: Bongo Format */}
                <div className="relative flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-400 z-10 shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">{t.download.step3Title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        {t.download.step3Badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.download.step3Desc}
                    </p>
                  </div>
                </div>

                {/* Step 4: Purr Focus */}
                <div className="relative flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-400 z-10 shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">{t.download.step4Title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        {t.download.step4Badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.download.step4Desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-cat-border text-center">
              <a
                href="https://github.com"
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
