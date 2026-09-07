import React, { useState, useRef } from 'react';
import { Download, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { sounds } from '../../sound';
import { useLanguage } from '../../context/LanguageContext';
import catSitImg from '../../assets/cat_sit.png';
import catOpenImg from '../../assets/cat_open.png';
import catHappyImg from '../../assets/cat_happy.png';

interface SampleFile {
  name: string;
  from: string;
  to: string;
  size: string;
}

const SAMPLE_FILES: SampleFile[] = [
  { name: 'finance_data.csv', from: 'CSV', to: 'PARQUET', size: '184 MB → 14 MB (Snappy)' },
  { name: 'access_logs.json', from: 'JSON', to: 'CSV', size: '64 MB → 28 MB' },
  { name: 'sales_report.xlsx', from: 'XLSX', to: 'PARQUET', size: '32 MB → 5 MB' },
];

export const NekoDropDemo: React.FC = () => {
  const { t } = useLanguage();
  const [state, setState] = useState<'IDLE' | 'EATING' | 'SUCCESS'>('IDLE');
  const [activeFile, setActiveFile] = useState<SampleFile | null>(null);
  const [chew, setChew] = useState<0 | 1>(0);

  const chewIntervalRef = useRef<number | null>(null);

  const runSimulation = (file: SampleFile) => {
    if (state === 'EATING') return;

    setActiveFile(file);
    setState('EATING');

    let count = 0;
    chewIntervalRef.current = window.setInterval(() => {
      setChew((prev) => (prev === 0 ? 1 : 0));
      sounds.playMunch();
      count++;
      if (count >= 5) {
        if (chewIntervalRef.current) clearInterval(chewIntervalRef.current);
        setState('SUCCESS');
        sounds.playSuccess();
      }
    }, 140);
  };

  const reset = () => {
    setState('IDLE');
    setActiveFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-cat-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white font-brand">{t.nekoDrop.title}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {t.nekoDrop.badge}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {t.nekoDrop.subtitle}
          </p>
        </div>

        <a
          href="/downloads/Neko Drop.exe"
          download="Neko Drop.exe"
          onClick={() => sounds.playSuccess()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cat-primary hover:bg-cat-primaryHover text-gray-950 font-bold text-sm shadow-md shadow-cat-primary/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>{t.nekoDrop.downloadBtn}</span>
        </a>
      </div>

      {/* Interactive Simulator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Drag / Select Stage */}
        <div className="lg:col-span-7 rounded-2xl bg-cat-bg border border-cat-border p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {t.nekoDrop.simTitle}
              </span>
              {state !== 'IDLE' && (
                <button
                  onClick={reset}
                  className="flex items-center gap-1 text-xs text-cat-primary hover:underline"
                >
                  <RefreshCw className="w-3 h-3" /> {t.nekoDrop.resetBtn}
                </button>
              )}
            </div>

            {/* Drop / Eating Zone */}
            <div 
              className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center min-h-[220px] ${
                state === 'EATING'
                  ? 'border-cat-primary bg-cat-primary/5 animate-pulse'
                  : state === 'SUCCESS'
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-cat-border hover:border-cat-primary/50 bg-cat-card/40'
              }`}
            >
              {/* Cat Avatar with states */}
              <div className="w-28 h-28 relative flex items-center justify-center mb-2">
                {state === 'IDLE' && (
                  <img
                    src={catSitImg}
                    alt="Cat Sitting"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                )}
                {state === 'EATING' && (
                  <img
                    src={chew === 0 ? catOpenImg : catSitImg}
                    alt="Cat Eating"
                    className="w-full h-full object-contain filter drop-shadow-md scale-110"
                  />
                )}
                {state === 'SUCCESS' && (
                  <img
                    src={catHappyImg}
                    alt="Cat Happy"
                    className="w-full h-full object-contain filter drop-shadow-md scale-110"
                  />
                )}
              </div>

              {/* Status Message */}
              {state === 'IDLE' && (
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    {t.nekoDrop.idlePrompt}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t.nekoDrop.idleHint}
                  </p>
                </div>
              )}

              {state === 'EATING' && (
                <div className="space-y-1 animate-bounce-gentle">
                  <p className="text-sm font-bold text-cat-primary">
                    {t.nekoDrop.processing}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {t.nekoDrop.processingDetail}
                  </p>
                </div>
              )}

              {state === 'SUCCESS' && activeFile && (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.nekoDrop.complete}</span>
                  </div>
                  <p className="text-xs text-gray-300 font-mono">
                    {activeFile.from} → {activeFile.to} {t.nekoDrop.completeDetail}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sample File Buttons */}
          <div className="mt-4">
            <span className="text-xs font-medium text-gray-400 block mb-2">
              {t.nekoDrop.samplePrompt}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_FILES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => runSimulation(sample)}
                  disabled={state === 'EATING'}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-cat-card hover:bg-cat-cardHover border border-cat-border hover:border-cat-primary/50 text-left transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[11px] font-bold text-cat-primary group-hover:text-cat-fur">
                      {sample.from} → {sample.to}
                    </span>
                    <span className="text-[10px] text-gray-400">{sample.size}</span>
                  </div>
                  <span className="text-xs text-gray-200 font-medium truncate w-full">
                    {sample.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Technical Details & Metrics */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="rounded-2xl bg-cat-bg border border-cat-border p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cat-primary" />
              <span>{t.nekoDrop.featuresTitle}</span>
            </h4>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
                <div className="text-xs font-semibold text-cat-fur">{t.nekoDrop.f1Title}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  {t.nekoDrop.f1Desc}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
                <div className="text-xs font-semibold text-cat-fur">{t.nekoDrop.f2Title}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  {t.nekoDrop.f2Desc}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
                <div className="text-xs font-semibold text-cat-fur">{t.nekoDrop.f3Title}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  {t.nekoDrop.f3Desc}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-cat-card to-cat-cardHover border border-cat-border p-4">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>바이너리: <strong className="text-white">{t.nekoDrop.specBinary}</strong></span>
              <span>네트워크: <strong className="text-white">{t.nekoDrop.specNetwork}</strong></span>
              <span>OS: <strong className="text-white">{t.nekoDrop.specOs}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
