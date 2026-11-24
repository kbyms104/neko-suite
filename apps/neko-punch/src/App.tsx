import { useState, useEffect, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { NekoStatus } from './components/NekoStatus';
import { PortTable, PortProcess } from './components/PortTable';
import { Language, translations } from './i18n';
import { sounds } from './sound';

const MOCK_PORTS: PortProcess[] = [
  { port: 8080, pid: 14208, name: 'node.exe', cmd_hint: 'next · my-web', memory_mb: 142.5, protocol: 'TCP', local_addr: '0.0.0.0:8080' },
  { port: 3000, pid: 8294, name: 'python.exe', cmd_hint: 'uvicorn · api', memory_mb: 68.2, protocol: 'TCP', local_addr: '0.0.0.0:3000' },
  { port: 5173, pid: 21904, name: 'vite.exe', cmd_hint: 'vite · frontend', memory_mb: 85.0, protocol: 'TCP', local_addr: '0.0.0.0:5173' },
  { port: 5432, pid: 3102, name: 'postgres.exe', cmd_hint: 'pgdata', memory_mb: 54.1, protocol: 'TCP', local_addr: '0.0.0.0:5432' },
  { port: 6379, pid: 5120, name: 'redis-server.exe', cmd_hint: '', memory_mb: 32.4, protocol: 'TCP', local_addr: '0.0.0.0:6379' },
];

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('neko_punch_lang');
      if (saved === 'en' || saved === 'ko') return saved;
    } catch {}
    return 'ko';
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('neko_punch_muted') === 'true';
      sounds.setMuted(saved);
      return saved;
    } catch {
      return false;
    }
  });
  const [ports, setPorts] = useState<PortProcess[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isPunching, setIsPunching] = useState<boolean>(false);

  const t = translations[lang];

  const toggleLang = () => {
    sounds.playPop();
    setLang((prev) => {
      const next = prev === 'ko' ? 'en' : 'ko';
      try {
        localStorage.setItem('neko_punch_lang', next);
      } catch {}
      return next;
    });
  };

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.setMuted(nextState);
    try {
      localStorage.setItem('neko_punch_muted', String(nextState));
    } catch {}
    if (!nextState) {
      sounds.playPop();
    }
  };

  // 포트 스캔 함수
  const fetchPorts = useCallback(async (isSilent: boolean = false) => {
    if (!isSilent) setIsScanning(true);

    try {
      // Tauri core invoke 동적 로드
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<PortProcess[]>('scan_listening_ports');
      setPorts(res);
      if (!isSilent) {
        setLastMessage(t.status.portsFound(res.length));
      }
    } catch (err) {
      console.warn('Tauri invoke failed, fallback to mock ports:', err);
      setPorts(MOCK_PORTS);
      if (!isSilent) {
        setLastMessage(t.status.portsFound(MOCK_PORTS.length));
      }
    } finally {
      if (!isSilent) setIsScanning(false);
    }
  }, [lang]);

  // 최초 로드 및 3초 주기 자동 감시
  useEffect(() => {
    fetchPorts();

    const interval = setInterval(() => {
      fetchPorts(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchPorts]);

  // 냥펀치 프로세스 종료
  const handlePunch = async (proc: PortProcess): Promise<boolean> => {
    setIsPunching(true);

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('punch_process', { pid: proc.pid });

      sounds.playSuccess();
      setLastMessage(t.status.killedSuccess(proc.port, proc.name));

      // 목록에서 즉시 제거
      setPorts((prev) => prev.filter((p) => p.pid !== proc.pid));
      setIsPunching(false);
      return true;
    } catch (err) {
      console.warn('Tauri punch_process failed (using mock fallback):', err);

      // 브라우저 개발 모드 fallback
      sounds.playSuccess();
      setLastMessage(t.status.killedSuccess(proc.port, proc.name));
      setPorts((prev) => prev.filter((p) => p.pid !== proc.pid));
      setIsPunching(false);
      return true;
    }
  };

  // 일괄 냥펀치 프로세스 종료
  const handleBatchPunch = async (procs: PortProcess[]): Promise<number[]> => {
    const killablePids = Array.from(new Set(procs.filter((p) => p.pid > 4).map((p) => p.pid)));
    if (killablePids.length === 0) return [];
    setIsPunching(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const killed = await invoke<number[]>('punch_processes', { pids: killablePids });
      sounds.playSuccess();
      setLastMessage(t.filters.batchKilledSuccess(killed.length));
      const killedSet = new Set(killed);
      setPorts((prev) => prev.filter((p) => !killedSet.has(p.pid)));
      setIsPunching(false);
      return killed;
    } catch {
      sounds.playSuccess();
      setLastMessage(t.filters.batchKilledSuccess(killablePids.length));
      const killedSet = new Set(killablePids);
      setPorts((prev) => prev.filter((p) => !killedSet.has(p.pid)));
      setIsPunching(false);
      return killablePids;
    }
  };

  return (
    <div className="w-full h-full p-1 bg-transparent select-none antialiased">
      <div className="w-full h-full bg-[#14151e] text-gray-100 flex flex-col overflow-hidden rounded-3xl border-2 border-[#2b2d3b] shadow-2xl">
        {/* 1. Custom Title Bar */}
        <TitleBar
          lang={lang}
          onToggleLang={toggleLang}
          isMuted={isMuted}
          onToggleSound={toggleSound}
          onRefresh={() => fetchPorts(false)}
          isScanning={isScanning}
        />

        {/* 2. Mascot & Status Notification Bar */}
        <NekoStatus
          portCount={ports.length}
          lastMessage={lastMessage}
          isPunching={isPunching}
        />

        {/* 3. Port & Process Table */}
        <PortTable
          ports={ports}
          lang={lang}
          onPunch={handlePunch}
          onBatchPunch={handleBatchPunch}
          isScanning={isScanning}
        />
      </div>
    </div>
  );
}
