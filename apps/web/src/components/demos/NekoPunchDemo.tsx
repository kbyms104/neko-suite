import React, { useState } from 'react';
import { Sparkles, Terminal, RefreshCw, Download, Star, Plus, X } from 'lucide-react';
import { sounds } from '../../sound';
import { useLanguage } from '../../context/LanguageContext';
import catPawImg from '../../assets/cat_paw.png';
import catBoxerImg from '../../assets/cat_boxer.png';
import catSleepImg from '../../assets/cat_sleep.png';

interface ProcessItem {
  id: string;
  port: number;
  name: string;
  pid: number;
  memory: string;
  status: 'alive' | 'killing' | 'dead';
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { id: '1', port: 8080, name: 'node.exe (Dev Server)', pid: 14208, memory: '142 MB', status: 'alive' },
  { id: '2', port: 3000, name: 'python.exe (FastAPI Worker)', pid: 8294, memory: '68 MB', status: 'alive' },
  { id: '3', port: 5432, name: 'postgres.exe (Zombie Connection)', pid: 3102, memory: '54 MB', status: 'alive' },
];

export const NekoPunchDemo: React.FC = () => {
  const { t } = useLanguage();
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);
  const [filter, setFilter] = useState<'all' | 'custom'>('all');
  const [customPorts, setCustomPorts] = useState<number[]>([3000, 8080]);
  const [punchedId, setPunchedId] = useState<string | null>(null);

  const aliveCount = processes.filter((p) => p.status !== 'dead').length;
  const currentCatImg = punchedId ? catPawImg : aliveCount === 0 ? catSleepImg : catBoxerImg;
  const statusBadge = punchedId
    ? '💥 냥펀치!'
    : aliveCount === 0
    ? '💤 낮잠 중'
    : '👀 감시 중';
  const badgeColor = punchedId
    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    : aliveCount === 0
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : 'bg-amber-500/20 text-amber-400 border-amber-500/30';

  const togglePin = (port: number) => {
    sounds.playPop();
    setCustomPorts((prev) =>
      prev.includes(port) ? prev.filter((p) => p !== port) : [...prev, port]
    );
  };

  const handlePunch = (id: string) => {
    setPunchedId(id);
    sounds.playPunch();

    setProcesses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'killing' } : p))
    );

    setTimeout(() => {
      setProcesses((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'dead' } : p))
      );
      setPunchedId(null);
    }, 1800);
  };

  const handleReset = () => {
    sounds.playPop();
    setProcesses(INITIAL_PROCESSES);
  };

  const displayedProcesses = processes.filter((proc) => {
    if (filter === 'custom') {
      return customPorts.includes(proc.port);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-cat-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#202230] to-[#2a2d40] border border-cat-border p-1 shadow-md shrink-0 flex items-center justify-center">
            <img src={currentCatImg} alt="Boxer Cat" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white font-brand">{t.nekoPunch.title}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                {statusBadge}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {aliveCount === 0 ? '포트 충돌 없음 • 평화로운 낮잠 중' : t.nekoPunch.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cat-card hover:bg-cat-cardHover border border-cat-border text-xs text-gray-300 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.nekoPunch.resetBtn}</span>
          </button>

          <a
            href="./downloads/Neko Punch.exe"
            download="Neko Punch.exe"
            onClick={() => sounds.playSuccess()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{t.nekoPunch.downloadBtn}</span>
          </a>
        </div>
      </div>

      {/* Main Table / Interaction Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Port Table */}
        <div className="lg:col-span-8 rounded-2xl bg-cat-bg border border-cat-border p-5 space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cat-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {t.nekoPunch.listTitle}
              </span>
            </div>

            {/* Quick Demo Tabs */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => {
                  sounds.playPop();
                  setFilter('all');
                }}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-cat-primary text-gray-950 font-bold'
                    : 'bg-cat-card text-gray-400 hover:text-white border border-cat-border'
                }`}
              >
                전체 ({processes.length})
              </button>
              <button
                onClick={() => {
                  sounds.playPop();
                  setFilter('custom');
                }}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  filter === 'custom'
                    ? 'bg-amber-400 text-gray-950 font-bold'
                    : 'bg-cat-card text-amber-300 border border-amber-500/30'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>내 포트 ({customPorts.length})</span>
              </button>
            </div>
          </div>

          {/* Process List */}
          <div className="space-y-2.5">
            {displayedProcesses.map((proc) => {
              const isPinned = customPorts.includes(proc.port);
              if (proc.status === 'dead') {
                return (
                  <div
                    key={proc.id}
                    className="p-3 rounded-xl bg-cat-card/20 border border-cat-border/30 opacity-40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-gray-500 line-through">
                        :{proc.port}
                      </span>
                      <span className="text-xs text-gray-500 line-through">{proc.name}</span>
                    </div>
                    <span className="text-xs text-rose-400 font-mono font-bold">{t.nekoPunch.killed}</span>
                  </div>
                );
              }

              const isPunching = punchedId === proc.id;

              return (
                <div
                  key={proc.id}
                  className={`relative p-3.5 rounded-xl border transition-all flex items-center justify-between overflow-hidden ${
                    isPunching
                      ? 'bg-rose-950/40 border-rose-500/60 scale-95'
                      : 'bg-cat-card hover:bg-cat-cardHover border-cat-border'
                  }`}
                >
                  {/* Big Cat Paw Punch Animation */}
                  {isPunching && (
                    <>
                      <div className="absolute inset-y-0 right-10 z-20 flex items-center pointer-events-none animate-punch">
                        <div className="w-20 h-20 filter drop-shadow-[0_0_24px_rgba(244,114,182,0.95)]">
                          <img
                            src={catPawImg}
                            alt="Punch Paw"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="absolute right-28 top-1/2 -translate-y-1/2 z-30 pointer-events-none animate-pop-hearts flex items-center gap-1.5">
                        <span className="text-xl">💖</span>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg border border-white/80">
                          냥! 🐾
                        </span>
                        <span className="text-lg">✨</span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePin(proc.port)}
                      className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-amber-400 transition-colors"
                      title={isPinned ? '내 포트에서 제거' : '내 포트에 고정 ⭐'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isPinned ? 'fill-amber-400 text-amber-400' : 'text-gray-500'
                        }`}
                      />
                    </button>

                    <span className="px-2 py-1 rounded bg-cat-primary/10 border border-cat-primary/30 text-cat-primary font-mono text-xs font-bold">
                      :{proc.port}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-gray-200">{proc.name}</div>
                      <div className="text-[11px] font-mono text-gray-400">
                        PID: {proc.pid} • RAM: {proc.memory}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePunch(proc.id)}
                    disabled={isPunching}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs shadow transition-all active:scale-90"
                    title="Terminate process"
                  >
                    <span>{t.nekoPunch.punchBtn}</span>
                    <span>🐾</span>
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 text-center pt-2">
            {t.nekoPunch.hint}
          </p>
        </div>

        {/* Right: Feature Highlights */}
        <div className="lg:col-span-4 rounded-2xl bg-cat-bg border border-cat-border p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cat-primary" />
            <span>{t.nekoPunch.featuresTitle}</span>
          </h4>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
              <strong className="text-cat-fur block mb-1">{t.nekoPunch.f1Title}</strong>
              {t.nekoPunch.f1Desc}
            </div>

            <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
              <strong className="text-cat-fur block mb-1">{t.nekoPunch.f2Title}</strong>
              {t.nekoPunch.f2Desc}
            </div>

            <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
              <strong className="text-cat-fur block mb-1">{t.nekoPunch.f3Title}</strong>
              {t.nekoPunch.f3Desc}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
