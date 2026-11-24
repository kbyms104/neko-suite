import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PetMenu } from './components/PetMenu';
import { DesktopPet } from './components/DesktopPet';
import { TimerHUD } from './components/TimerHUD';
import { SpeechBubble } from './components/SpeechBubble';
import { SettingsModal } from './components/SettingsModal';
import { SessionMode, CatMotion, TimerSettings } from './types';
import { Language, translations } from './i18n';
import { sounds } from './sound';

const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  enablePurr: true,
  enableChime: true,
  clickThrough: false,
};

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('purr_focus_lang');
      if (saved === 'en' || saved === 'ko') return saved;
    } catch {}
    return 'ko';
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('purr_focus_muted') === 'true';
      sounds.setMuted(saved);
      return saved;
    } catch {
      return false;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Settings (never boot locked into clickThrough)
  const [settings, setSettings] = useState<TimerSettings>(() => {
    try {
      const saved = localStorage.getItem('purr_focus_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved), clickThrough: false };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('purr_focus_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === getTodayKey() && typeof parsed.count === 'number') {
          return parsed.count;
        }
      }
    } catch {}
    return 0;
  });

  // Pomodoro timer states
  const [mode, setMode] = useState<SessionMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [motion, setMotion] = useState<CatMotion>('loafing');
  const [adviceIndex, setAdviceIndex] = useState<number>(0);

  const timeLeftRef = useRef<number>(timeLeft);
  timeLeftRef.current = timeLeft;
  const endTimeRef = useRef<number | null>(Date.now() + settings.focusMinutes * 60 * 1000);

  const t = translations[lang];
  const isBreak = mode === 'break';
  const totalDuration = isBreak ? settings.breakMinutes * 60 : settings.focusMinutes * 60;

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem(
        'purr_focus_stats',
        JSON.stringify({ date: getTodayKey(), count: completedSessions })
      );
    } catch {}
  }, [completedSessions]);

  // Listen to backend click-through state changes (e.g., from System Tray)
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    async function setupListener() {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        unlisten = await listen<boolean>('click-through-changed', (event) => {
          setSettings((prev) => ({ ...prev, clickThrough: event.payload }));
        });
      } catch {}
    }
    setupListener();
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  // Active advice message
  const speechMessage = useMemo(() => {
    if (isBreak) {
      return t.advice[adviceIndex % t.advice.length];
    } else {
      return t.focusQuotes[adviceIndex % t.focusQuotes.length];
    }
  }, [isBreak, adviceIndex, t]);

  // Switch session on timer complete
  const handleSessionComplete = useCallback(
    (naturalCompletion: boolean = true) => {
      if (mode === 'focus') {
        if (naturalCompletion) {
          setCompletedSessions((prev) => prev + 1);
        }
        const nextSecs = settings.breakMinutes * 60;
        setMode('break');
        setTimeLeft(nextSecs);
        timeLeftRef.current = nextSecs;
        endTimeRef.current = isRunning ? Date.now() + nextSecs * 1000 : null;
        setMotion('kneading');
        setAdviceIndex((prev) => prev + 1);

        if (settings.enableChime) {
          sounds.playChime(true);
        }
        if (settings.enablePurr && !isMuted) {
          sounds.startPurrLoop();
        }
      } else {
        const nextSecs = settings.focusMinutes * 60;
        setMode('focus');
        setTimeLeft(nextSecs);
        timeLeftRef.current = nextSecs;
        endTimeRef.current = isRunning ? Date.now() + nextSecs * 1000 : null;
        setMotion('loafing');
        setAdviceIndex((prev) => prev + 1);
        sounds.stopPurrLoop();

        if (settings.enableChime) {
          sounds.playChime(false);
        }
      }
    },
    [mode, settings, isRunning, isMuted]
  );

  const handleSessionCompleteRef = useRef(handleSessionComplete);
  handleSessionCompleteRef.current = handleSessionComplete;

  // Drift-free timestamp-based countdown loop
  useEffect(() => {
    if (!isRunning) {
      endTimeRef.current = null;
      return;
    }

    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + timeLeftRef.current * 1000;
    }

    const interval = window.setInterval(() => {
      if (endTimeRef.current === null) return;
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        handleSessionCompleteRef.current(true);
      } else if (remaining !== timeLeftRef.current) {
        setTimeLeft(remaining);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Toggle Timer Play/Pause
  const handleToggleTimer = () => {
    const nextRunning = !isRunning;
    if (nextRunning) {
      endTimeRef.current = Date.now() + timeLeftRef.current * 1000;
      if (isBreak && settings.enablePurr && !isMuted) {
        sounds.startPurrLoop();
      }
    } else {
      endTimeRef.current = null;
      sounds.stopPurrLoop();
    }
    setIsRunning(nextRunning);
  };

  // Skip Session (manual skip doesn't award a focus fish)
  const handleSkipSession = () => {
    handleSessionComplete(false);
  };

  // Reset Timer
  const handleResetTimer = () => {
    const resetSecs = isBreak ? settings.breakMinutes * 60 : settings.focusMinutes * 60;
    setTimeLeft(resetSecs);
    timeLeftRef.current = resetSecs;
    endTimeRef.current = isRunning ? Date.now() + resetSecs * 1000 : null;
  };

  // Pet the cat
  const handlePetCat = () => {
    setMotion('alert');
    setTimeout(() => {
      setMotion(isBreak ? 'kneading' : 'loafing');
    }, 2500);
  };

  // Click-Through toggle
  const handleToggleClickThrough = async () => {
    const next = !settings.clickThrough;
    setSettings((prev) => ({ ...prev, clickThrough: next }));
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_click_through', { enable: next });
    } catch {}
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    try {
      localStorage.setItem('purr_focus_muted', String(next));
    } catch {}
    if (!next) {
      sounds.playPop();
      if (isBreak && settings.enablePurr) {
        sounds.startPurrLoop();
      }
    } else {
      sounds.stopPurrLoop();
    }
  };

  // Language toggle
  const handleToggleLang = () => {
    sounds.playPop();
    setLang((prev) => {
      const next = prev === 'ko' ? 'en' : 'ko';
      try {
        localStorage.setItem('purr_focus_lang', next);
      } catch {}
      return next;
    });
  };

  // Handle window drag on any empty background or non-interactive space
  const handleWindowMouseDown = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, [data-no-drag]')) return;
    if (e.button === 0) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('start_drag_window');
      } catch {
        try {
          const { getCurrentWindow } = await import('@tauri-apps/api/window');
          await getCurrentWindow().startDragging();
        } catch {}
      }
    }
  };

  return (
    <div
      onMouseDown={handleWindowMouseDown}
      data-tauri-drag-region
      className="w-screen h-screen relative flex flex-col items-center justify-between p-3 select-none overflow-hidden bg-transparent cursor-move"
    >
      {/* 1. Top Mini Control Bar (Drag Handle, Settings, Mute) */}
      <PetMenu
        lang={lang}
        onToggleLang={handleToggleLang}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        clickThrough={settings.clickThrough}
        onToggleClickThrough={handleToggleClickThrough}
        completedSessions={completedSessions}
        onOpenSettings={() => {
          sounds.playPop();
          setIsSettingsOpen(true);
        }}
      />

      {/* 2. Middle: Speech Bubble & Interactive Cat */}
      <div
        onMouseDown={handleWindowMouseDown}
        data-tauri-drag-region
        className="flex flex-col items-center justify-center my-auto cursor-move"
      >
        <SpeechBubble message={speechMessage} mode={mode} />
        <DesktopPet
          mode={mode}
          motion={motion}
          isPaused={!isRunning}
          onPet={handlePetCat}
        />
      </div>

      {/* 3. Bottom: Floating Timer HUD */}
      <div data-no-drag className="w-full flex justify-center cursor-default">
        <TimerHUD
          mode={mode}
          timeLeft={timeLeft}
          totalDuration={totalDuration}
          isRunning={isRunning}
          onToggleTimer={handleToggleTimer}
          onSkipSession={handleSkipSession}
          onResetTimer={handleResetTimer}
          onOpenSettings={() => {
            sounds.playPop();
            setIsSettingsOpen(true);
          }}
          lang={lang}
        />
      </div>

      {/* 4. Settings Modal Overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          try {
            const { clickThrough: _ignored, ...persistable } = newSettings;
            localStorage.setItem('purr_focus_settings', JSON.stringify(persistable));
          } catch {}
          const nextSecs =
            mode === 'focus' ? newSettings.focusMinutes * 60 : newSettings.breakMinutes * 60;
          setTimeLeft(nextSecs);
          timeLeftRef.current = nextSecs;
          endTimeRef.current = isRunning ? Date.now() + nextSecs * 1000 : null;
        }}
        lang={lang}
      />
    </div>
  );
}
