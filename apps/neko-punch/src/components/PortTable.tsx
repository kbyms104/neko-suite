import React, { useState } from 'react';
import { Search, Star, Plus, X } from 'lucide-react';
import { Language, translations } from '../i18n';
import { sounds } from '../sound';
import catPawImg from '../assets/cat_paw.png';
import catSleepImg from '../assets/cat_sleep.png';

export interface PortProcess {
  port: number;
  pid: number;
  name: string;
  memory_mb: number;
  protocol: string;
  local_addr: string;
}

interface PortTableProps {
  ports: PortProcess[];
  lang: Language;
  onPunch: (port: PortProcess) => Promise<boolean>;
  isScanning?: boolean;
}

type FilterTab = 'all' | 'web' | 'db' | 'custom';

const WEB_PORTS = [3000, 3001, 5173, 5174, 8000, 8080, 8081, 4000, 4200, 1420, 1421, 9000];
const DB_PORTS = [5432, 3306, 27017, 6379, 1433, 9200];

export const PortTable: React.FC<PortTableProps> = ({
  ports,
  lang,
  onPunch,
}) => {
  const t = translations[lang];
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [punchingPid, setPunchingPid] = useState<number | null>(null);
  const [killedPids, setKilledPids] = useState<Set<number>>(new Set());

  // 사용자 지정 커스텀 포트 목록 (LocalStorage 영구 보존)
  const [customPorts, setCustomPorts] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('neko_punch_custom_ports');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [3000, 8080, 5173]; // 초기 추천 기본 포트
  });
  const [newPortInput, setNewPortInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const saveCustomPorts = (newPorts: number[]) => {
    setCustomPorts(newPorts);
    try {
      localStorage.setItem('neko_punch_custom_ports', JSON.stringify(newPorts));
    } catch (e) {}
  };

  const handleTogglePin = (port: number) => {
    sounds.playPop();
    if (customPorts.includes(port)) {
      saveCustomPorts(customPorts.filter((p) => p !== port));
    } else {
      saveCustomPorts([...customPorts, port]);
    }
  };

  const handleAddPort = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const portNum = parseInt(newPortInput.trim(), 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setInputError(lang === 'ko' ? '1~65535' : '1-65535');
      setTimeout(() => setInputError(null), 2000);
      return;
    }
    if (customPorts.includes(portNum)) {
      setInputError(lang === 'ko' ? '이미 등록됨' : 'Exists');
      setTimeout(() => setInputError(null), 2000);
      return;
    }
    sounds.playPop();
    saveCustomPorts([...customPorts, portNum]);
    setNewPortInput('');
    setInputError(null);
  };

  const handleRemovePort = (port: number) => {
    sounds.playPop();
    saveCustomPorts(customPorts.filter((p) => p !== port));
  };

  const handlePunchClick = async (proc: PortProcess) => {
    if (punchingPid !== null) return;

    // 1. 화면에 귀여운 냥펀치 쇼 시작
    setPunchingPid(proc.pid);
    sounds.playPunch();

    // 2. 실제 프로세스는 딜레이 없이 즉시 종료! (OS 레벨 즉각 kill)
    const punchPromise = onPunch(proc);

    // 3. 화면 연출은 사용자가 귀여움을 충분히 감상할 수 있도록 1.8초 동안 여유 있게 유지
    setTimeout(async () => {
      const success = await punchPromise;
      if (success) {
        setKilledPids((prev) => new Set(prev).add(proc.pid));
      }
      setPunchingPid(null);
    }, 1800);
  };

  // 필터링 적용
  const filteredPorts = ports.filter((item) => {
    if (filterTab === 'web') {
      const isWebPort = WEB_PORTS.includes(item.port);
      const isWebProcess = ['node', 'python', 'java', 'vite', 'deno', 'bun', 'go', 'cargo'].some((p) =>
        item.name.toLowerCase().includes(p)
      );
      if (!isWebPort && !isWebProcess) return false;
    } else if (filterTab === 'db') {
      const isDbPort = DB_PORTS.includes(item.port);
      const isDbProcess = ['postgres', 'mysqld', 'redis', 'mongod', 'sql'].some((p) =>
        item.name.toLowerCase().includes(p)
      );
      if (!isDbPort && !isDbProcess) return false;
    } else if (filterTab === 'custom') {
      if (!customPorts.includes(item.port)) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchPort = item.port.toString().includes(query);
      const matchName = item.name.toLowerCase().includes(query);
      const matchPid = item.pid.toString().includes(query);
      return matchPort || matchName || matchPid;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#121319]">
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-cat-border/60 bg-[#151620] space-y-2.5 shrink-0">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-0.5">
          <button
            onClick={() => {
              sounds.playPop();
              setFilterTab('all');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filterTab === 'all'
                ? 'bg-cat-primary text-gray-950 font-bold shadow-sm'
                : 'bg-cat-card text-gray-400 hover:text-white border border-cat-border/80'
            }`}
          >
            {t.filters.all} ({ports.length})
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setFilterTab('web');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filterTab === 'web'
                ? 'bg-amber-400 text-gray-950 font-bold shadow-sm'
                : 'bg-cat-card text-gray-400 hover:text-white border border-cat-border/80'
            }`}
          >
            {t.filters.web}
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setFilterTab('db');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filterTab === 'db'
                ? 'bg-purple-400 text-gray-950 font-bold shadow-sm'
                : 'bg-cat-card text-gray-400 hover:text-white border border-cat-border/80'
            }`}
          >
            {t.filters.db}
          </button>

          {/* New: Custom '내 포트' Tab */}
          <button
            onClick={() => {
              sounds.playPop();
              setFilterTab('custom');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 shrink-0 ${
              filterTab === 'custom'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-950 font-bold shadow-sm'
                : 'bg-cat-card text-amber-300 hover:text-amber-200 border border-amber-500/30'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>{t.filters.custom} ({customPorts.length})</span>
          </button>
        </div>

        {/* Custom Ports Management Area (Only on 'custom' tab) */}
        {filterTab === 'custom' && (
          <div className="p-2.5 rounded-xl bg-[#0d0e13] border border-amber-500/30 space-y-2">
            {/* Add Port Input Form */}
            <form onSubmit={handleAddPort} className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={newPortInput}
                  onChange={(e) => setNewPortInput(e.target.value)}
                  placeholder={t.filters.customAddPlaceholder}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#161720] border border-cat-border/80 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                {inputError && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-rose-400 font-bold">
                    {inputError}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.filters.addBtn}</span>
              </button>
            </form>

            {/* Registered Port Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {customPorts.length === 0 ? (
                <span className="text-[11px] text-gray-500">
                  {t.filters.noCustomPorts}
                </span>
              ) : (
                customPorts.map((portNum) => (
                  <span
                    key={portNum}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold"
                  >
                    <span>:{portNum}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePort(portNum)}
                      className="hover:text-rose-400 transition-colors p-0.5"
                      title="포트 제거"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.filters.searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0e0f14] border border-cat-border/80 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-cat-primary transition-colors"
          />
        </div>
      </div>

      {/* Port List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredPorts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
            <div className="w-24 h-24 mb-3 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
              <img
                src={catSleepImg}
                alt="Sleeping Cat"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm font-bold text-gray-200">
              {searchQuery
                ? t.table.noFilterMatch
                : filterTab === 'custom'
                ? (customPorts.length === 0 ? t.filters.noCustomPorts : '등록된 내 포트 중 점유 중인 프로세스가 없습니다!')
                : t.table.emptyTitle}
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              {searchQuery
                ? '다른 포트 번호나 프로세스명을 입력해 보세요.'
                : filterTab === 'custom'
                ? '내가 지정한 포트들이 충돌 없이 평화롭게 비어있습니다. zZZ'
                : t.table.emptyDesc}
            </p>
          </div>
        ) : (
          filteredPorts.map((proc) => {
            const isPunching = punchingPid === proc.pid;
            const isDead = killedPids.has(proc.pid);
            const isPinned = customPorts.includes(proc.port);

            if (isDead) {
              return (
                <div
                  key={`${proc.port}-${proc.pid}`}
                  className="p-3 rounded-xl bg-pink-950/20 border border-pink-500/20 opacity-50 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2 font-mono text-xs text-gray-400 line-through">
                    <span>:{proc.port}</span>
                    <span>{proc.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-pink-400 font-bold font-mono">
                    <span>냥퇴치 완료!</span>
                    <span>💤</span>
                  </div>
                </div>
              );
            }

            const isCritical = proc.pid <= 4;

            return (
              <div
                key={`${proc.port}-${proc.pid}`}
                className={`relative p-3 rounded-xl border transition-all flex items-center justify-between overflow-hidden group ${
                  isPunching
                    ? 'bg-pink-950/40 border-pink-400/80 scale-98 animate-shake shadow-lg shadow-pink-500/20'
                    : 'bg-cat-card hover:bg-cat-cardHover/90 border-cat-border/80 hover:border-cat-border'
                }`}
              >
                {/* 냥펀치 하트 젤리 아기고양이 타격 애니메이션 */}
                {isPunching && (
                  <>
                    {/* 날아오는 하트 젤리 냥펀치 */}
                    <div className="absolute inset-y-0 right-8 z-30 flex items-center pointer-events-none animate-punch">
                      <div className="w-20 h-20 filter drop-shadow-[0_0_24px_rgba(244,114,182,0.95)]">
                        <img
                          src={catPawImg}
                          alt="Punch Paw"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* 퐁퐁 솟아오르는 하트 & 냥! 말풍선 */}
                    <div className="absolute right-28 top-1/2 -translate-y-1/2 z-40 pointer-events-none animate-pop-hearts flex items-center gap-1.5">
                      <span className="text-xl">💖</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg border border-white/80">
                        냥! 🐾
                      </span>
                      <span className="text-lg">✨</span>
                    </div>
                  </>
                )}

                {/* Left: Star Pin & Port & Process Info */}
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {/* Star Pin Button */}
                  <button
                    onClick={() => handleTogglePin(proc.port)}
                    title={isPinned ? '내 포트에서 제거' : '내 포트에 고정 ⭐'}
                    className="p-1 rounded hover:bg-white/10 text-gray-600 hover:text-amber-400 transition-colors shrink-0"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isPinned ? 'fill-amber-400 text-amber-400' : 'text-gray-500'
                      }`}
                    />
                  </button>

                  <div className="flex flex-col items-start shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-cat-primary/10 border border-cat-primary/30 text-cat-primary font-mono text-xs font-bold">
                      :{proc.port}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-100 truncate flex items-center gap-1.5">
                      <span>{proc.name}</span>
                      {isCritical && (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          시스템
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>PID: {proc.pid}</span>
                      <span>•</span>
                      <span>{proc.memory_mb > 0 ? `${proc.memory_mb} MB` : '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Punch Button */}
                <div className="shrink-0">
                  {isCritical ? (
                    <span className="text-[11px] text-gray-500 font-mono px-2 py-1">
                      보호됨
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePunchClick(proc)}
                      disabled={isPunching}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-amber-500/20 hover:from-pink-500 hover:via-rose-500 hover:to-orange-500 text-pink-200 hover:text-white border border-pink-500/40 hover:border-transparent font-bold text-xs shadow-sm shadow-pink-500/10 hover:shadow-pink-500/30 transition-all active:scale-90 disabled:opacity-50 group/btn"
                      title={`${proc.name} (PID: ${proc.pid}) 냥펀치로 강제 종료`}
                    >
                      <span className="font-semibold tracking-tight">{t.table.action}</span>
                      <div className="w-4 h-4 shrink-0 transition-transform group-hover/btn:scale-135 group-hover/btn:-rotate-12">
                        <img
                          src={catPawImg}
                          alt="paw"
                          className="w-full h-full object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                        />
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Tray Hint */}
      <div className="p-2.5 bg-[#14151d] border-t border-cat-border/60 text-center text-[10px] text-gray-500 shrink-0">
        {filterTab === 'custom' ? t.filters.customHint : t.footer.trayHint}
      </div>
    </div>
  );
};
