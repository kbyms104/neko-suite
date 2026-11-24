import React, { useState, useEffect, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { sounds } from "./sound";
import {
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Minus,
  X,
  Sparkles,
  Zap,
  Settings2,
  FileCode2,
  ArrowRight,
  Pin,
  Volume2,
  VolumeX,
  History,
  EyeOff,
} from "lucide-react";

import catSitImg from "./assets/cat_sit.png";
import catOpenImg from "./assets/cat_open.png";
import catHappyImg from "./assets/cat_happy.png";
import catRejectImg from "./assets/cat_reject.png";

type CatState = "IDLE" | "DRAG_OVER" | "EATING" | "SUCCESS" | "REJECT";
type InputFormat = "csv" | "parquet" | "json" | "xlsx";
type Language = "ko" | "en";

interface TargetMap {
  csv: "parquet" | "json" | "jsonl";
  parquet: "csv" | "json" | "jsonl";
  json: "csv" | "parquet" | "jsonl";
  xlsx: "csv" | "parquet" | "json" | "jsonl";
}

const DEFAULT_TARGETS: TargetMap = {
  csv: "parquet",
  parquet: "csv",
  json: "csv",
  xlsx: "csv",
};

const TOTAL_WALK_FRAMES = 87;
const walkFramePaths: string[] = Array.from({ length: TOTAL_WALK_FRAMES }, (_, i) => {
  return `/cat_walk_frames/f_${String(i).padStart(3, "0")}.png`;
});

interface ConversionResult {
  source_path: string;
  output_path: string;
  format_from: string;
  format_to: string;
  row_count: number;
  elapsed_ms: number;
  file_size_bytes: number;
}

const i18nText = {
  ko: {
    idleTitle: "파일을 가져오면 고양이가 ",
    idleAccent: "다가와 입을 벌립니다!",
    idleSub: "CSV • Parquet • JSON/JSONL • XLSX 다중 드롭 변환",
    dragOver: "냥! 맛있는 먹이다! 입 속으로 쏙 넣어줘!",
    eating: "우걱우걱 소화시키는 중... 🐾",
    batchProgress: (cur: number, total: number) => `배치 처리 중 (${cur}/${total})...`,
    success: "맛있다냥! (꺼억~) 변환 완료!",
    batchSuccess: (ok: number, total: number) => `${ok}/${total}개 파일 변환 완료다냥!`,
    rowsUnit: "행",
    rejectDefault: "퉷! 못 먹는 거다냥!",
    unsupportedExt: (ext: string) => `.${ext || "알수없음"} 포맷은 맛이 없다냥!`,
    settingsLabel: "포맷별 변환 설정:",
    onDrop: "드롭 시",
    openFolder: "저장된 폴더 열기",
    historyTitle: "최근 변환 기록",
    historyEmpty: "아직 변환한 파일이 없다냥.",
    pinTitle: "항상 위에 고정",
    muteTitle: "효과음 켜기/끄기",
    hideTitle: "트레이로 숨기기",
    quitTitle: "완전 종료",
    minimizeTitle: "최소화",
  },
  en: {
    idleTitle: "Drop files & the cat will ",
    idleAccent: "open wide to eat them!",
    idleSub: "CSV • Parquet • JSON/JSONL • XLSX Batch Converter",
    dragOver: "Meow! Tasty data! Drop it right in!",
    eating: "Munching & digesting... 🐾",
    batchProgress: (cur: number, total: number) => `Batch processing (${cur}/${total})...`,
    success: "Delicious! (Burp~) Converted!",
    batchSuccess: (ok: number, total: number) => `Converted ${ok}/${total} files!`,
    rowsUnit: "rows",
    rejectDefault: "Yuck! Can't eat that!",
    unsupportedExt: (ext: string) => `.${ext || "unknown"} format isn't tasty!`,
    settingsLabel: "Output Target:",
    onDrop: "drop ->",
    openFolder: "Open Output Folder",
    historyTitle: "Recent Conversions",
    historyEmpty: "No files converted yet.",
    pinTitle: "Toggle Always on Top",
    muteTitle: "Toggle Sound",
    hideTitle: "Hide to Tray",
    quitTitle: "Quit App",
    minimizeTitle: "Minimize",
  },
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("neko_drop_lang");
      if (saved === "en" || saved === "ko") return saved;
    } catch {}
    return "ko";
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("neko_drop_muted") === "true";
      sounds.setMuted(saved);
      return saved;
    } catch {
      return false;
    }
  });

  const [alwaysOnTop, setAlwaysOnTop] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const [catState, setCatState] = useState<CatState>("IDLE");
  const [lastResult, setLastResult] = useState<ConversionResult | null>(null);
  const [history, setHistory] = useState<ConversionResult[]>(() => {
    try {
      const saved = localStorage.getItem("neko_drop_history");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [batchStatus, setBatchStatus] = useState<{ current: number; total: number; ok: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [chewFrame, setChewFrame] = useState<0 | 1>(0);
  const [frameIdx, setFrameIdx] = useState(0);

  const [targets, setTargets] = useState<TargetMap>(() => {
    try {
      const saved = localStorage.getItem("neko_drop_targets");
      if (saved) return { ...DEFAULT_TARGETS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_TARGETS;
  });

  const [activeTab, setActiveTab] = useState<InputFormat>("csv");
  const eatingIntervalRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  const catStateRef = useRef(catState);
  catStateRef.current = catState;
  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const langRef = useRef(lang);
  langRef.current = lang;

  const t = i18nText[lang];

  // Persist user preferences
  useEffect(() => {
    try {
      localStorage.setItem("neko_drop_lang", lang);
    } catch {}
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem("neko_drop_targets", JSON.stringify(targets));
    } catch {}
  }, [targets]);

  useEffect(() => {
    try {
      localStorage.setItem("neko_drop_history", JSON.stringify(history));
    } catch {}
  }, [history]);

  // Preload walk frames
  useEffect(() => {
    walkFramePaths.forEach((path) => {
      const img = new Image();
      img.src = path;
    });
  }, []);

  // Idle walk cycle
  useEffect(() => {
    if (catState !== "IDLE") return;
    const interval = window.setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % TOTAL_WALK_FRAMES);
    }, 83);
    return () => clearInterval(interval);
  }, [catState]);

  const getTargetForExt = (ext: string, currentTargets: TargetMap): string | null => {
    if (ext === "csv") return currentTargets.csv;
    if (ext === "parquet") return currentTargets.parquet;
    if (ext === "json" || ext === "jsonl") {
      // If dropping .jsonl and target was accidentally jsonl, prefer csv
      return ext === "jsonl" && currentTargets.json === "jsonl" ? "csv" : currentTargets.json;
    }
    if (ext === "xlsx" || ext === "xls") return currentTargets.xlsx;
    return null;
  };

  // Multi-file Batch Processing
  const handleFilePathsDrop = useCallback(async (rawPaths: string[]) => {
    if (!rawPaths || rawPaths.length === 0) return;
    if (catStateRef.current === "EATING") return;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    const supportedExts = ["csv", "parquet", "xlsx", "xls", "json", "jsonl"];
    const validPaths: string[] = [];
    let firstInvalidExt = "";

    for (const p of rawPaths) {
      const ext = p.split(".").pop()?.toLowerCase() || "";
      if (supportedExts.includes(ext)) {
        validPaths.push(p);
      } else if (!firstInvalidExt) {
        firstInvalidExt = ext;
      }
    }

    if (validPaths.length === 0) {
      setCatState("REJECT");
      setErrorMessage(i18nText[langRef.current].unsupportedExt(firstInvalidExt));
      sounds.playRejectPunch();
      resetTimerRef.current = window.setTimeout(() => {
        setCatState("IDLE");
        setErrorMessage(null);
      }, 2500);
      return;
    }

    // Switch tab to first dropped file's format
    const firstExt = validPaths[0].split(".").pop()?.toLowerCase() || "";
    if (firstExt === "csv") setActiveTab("csv");
    else if (firstExt === "parquet") setActiveTab("parquet");
    else if (firstExt === "json" || firstExt === "jsonl") setActiveTab("json");
    else if (firstExt === "xlsx" || firstExt === "xls") setActiveTab("xlsx");

    setCatState("EATING");
    setErrorMessage(null);
    setLastResult(null);
    setShowHistory(false);

    const isBatch = validPaths.length > 1;
    setBatchStatus(isBatch ? { current: 1, total: validPaths.length, ok: 0 } : null);

    let count = 0;
    sounds.playMunch();
    eatingIntervalRef.current = window.setInterval(() => {
      count++;
      setChewFrame((count % 2) as 0 | 1);
      if (count % 2 === 0) {
        sounds.playMunch();
      } else {
        sounds.playChomp();
      }
    }, 160);

    let successCount = 0;
    let latestResult: ConversionResult | null = null;
    let lastError: string | null = null;
    const newItems: ConversionResult[] = [];

    const startTime = Date.now();
    for (let i = 0; i < validPaths.length; i++) {
      const filePath = validPaths[i];
      const ext = filePath.split(".").pop()?.toLowerCase() || "";
      const targetFormat = getTargetForExt(ext, targetsRef.current) || "csv";
      if (isBatch) {
        setBatchStatus({ current: i + 1, total: validPaths.length, ok: successCount });
      }
      try {
        const res = await invoke<ConversionResult>("convert_file", {
          filePath,
          targetFormat,
        });
        successCount++;
        latestResult = res;
        newItems.unshift(res);
      } catch (err: unknown) {
        lastError = String(err);
      }
    }

    // Ensure eating animation lasts at least 650ms for visual feedback
    const elapsed = Date.now() - startTime;
    if (elapsed < 650) {
      await new Promise((r) => setTimeout(r, 650 - elapsed));
    }

    if (eatingIntervalRef.current) {
      clearInterval(eatingIntervalRef.current);
      eatingIntervalRef.current = null;
    }

    if (newItems.length > 0) {
      setHistory((prev) => [...newItems, ...prev].slice(0, 10));
    }

    if (successCount > 0 && latestResult) {
      setCatState("SUCCESS");
      setLastResult(latestResult);
      setBatchStatus(isBatch ? { current: validPaths.length, total: validPaths.length, ok: successCount } : null);
      sounds.playSuccessBurp();

      resetTimerRef.current = window.setTimeout(() => {
        setCatState((curr) => (curr === "SUCCESS" ? "IDLE" : curr));
      }, 3500);
    } else {
      setCatState("REJECT");
      setBatchStatus(null);
      setErrorMessage(lastError || i18nText[langRef.current].rejectDefault);
      sounds.playRejectPunch();

      resetTimerRef.current = window.setTimeout(() => {
        setCatState("IDLE");
        setErrorMessage(null);
      }, 2500);
    }
  }, []);

  // Register Tauri v2 drag & drop listener once
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    async function setupTauriDragDrop() {
      try {
        const webview = getCurrentWebview();
        unlisten = await webview.onDragDropEvent((event) => {
          if (event.payload.type === "over") {
            if (catStateRef.current !== "EATING") setCatState("DRAG_OVER");
          } else if (event.payload.type === "leave") {
            if (catStateRef.current === "DRAG_OVER") setCatState("IDLE");
          } else if (event.payload.type === "drop") {
            const paths = event.payload.paths;
            if (paths && paths.length > 0) {
              handleFilePathsDrop(paths);
            } else {
              setCatState("IDLE");
            }
          }
        });
      } catch (err) {
        console.warn("Tauri drag-drop listener fallback:", err);
      }
    }

    setupTauriDragDrop();
    return () => {
      if (unlisten) unlisten();
    };
  }, [handleFilePathsDrop]);

  // HTML5 Drag & Drop Fallback
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (catState !== "EATING") setCatState("DRAG_OVER");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (catState === "DRAG_OVER") setCatState("IDLE");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const paths = Array.from(e.dataTransfer.files).map(
        (f) => (f as unknown as { path?: string }).path || f.name
      );
      handleFilePathsDrop(paths);
    }
  };

  const handleOpenFolder = (outputPath: string) => {
    sounds.playPop();
    invoke("open_file_folder", { filePath: outputPath }).catch(() => {});
  };

  const handleToggleAlwaysOnTop = async () => {
    sounds.playPop();
    try {
      const next = await invoke<boolean>("toggle_always_on_top");
      setAlwaysOnTop(next);
    } catch {
      setAlwaysOnTop((prev) => !prev);
    }
  };

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    try {
      localStorage.setItem("neko_drop_muted", String(next));
    } catch {}
    if (!next) sounds.playPop();
  };

  const handleToggleLang = () => {
    sounds.playPop();
    setLang((prev) => (prev === "ko" ? "en" : "ko"));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const fileNameOnly = (fullPath: string) => fullPath.split(/[\\/]/).pop() || fullPath;

  const renderCat = () => {
    if (catState === "DRAG_OVER") {
      return (
        <img
          src={catOpenImg}
          alt="Open Mouth Cat"
          className="w-44 h-44 object-contain pointer-events-none select-none anim-surprise-dash filter drop-shadow-[0_14px_28px_rgba(245,158,11,0.5)]"
        />
      );
    }
    if (catState === "EATING") {
      return (
        <img
          src={chewFrame === 0 ? catOpenImg : catSitImg}
          alt="Eating Cat"
          className="w-44 h-44 object-contain pointer-events-none select-none anim-munching filter drop-shadow-[0_14px_28px_rgba(245,158,11,0.55)]"
        />
      );
    }
    if (catState === "SUCCESS") {
      return (
        <img
          src={catHappyImg}
          alt="Happy Cat"
          className="w-44 h-44 object-contain pointer-events-none select-none anim-happy-wave filter drop-shadow-[0_14px_28px_rgba(16,185,129,0.5)]"
        />
      );
    }
    if (catState === "REJECT") {
      return (
        <img
          src={catRejectImg}
          alt="Reject Cat"
          className="w-44 h-44 object-contain pointer-events-none select-none anim-reject-shake filter drop-shadow-[0_14px_28px_rgba(244,63,94,0.6)]"
        />
      );
    }

    return (
      <img
        src={walkFramePaths[frameIdx]}
        alt="Natural Walking Cat"
        className="w-full h-full object-contain pointer-events-none select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] scale-110"
      />
    );
  };

  const targetOptions: Record<InputFormat, Array<{ value: string; label: string }>> = {
    csv: [
      { value: "parquet", label: "Parquet" },
      { value: "json", label: "JSON" },
      { value: "jsonl", label: "JSONL" },
    ],
    parquet: [
      { value: "csv", label: "CSV" },
      { value: "json", label: "JSON" },
      { value: "jsonl", label: "JSONL" },
    ],
    json: [
      { value: "csv", label: "CSV" },
      { value: "parquet", label: "Parquet" },
      { value: "jsonl", label: "JSONL" },
    ],
    xlsx: [
      { value: "csv", label: "CSV" },
      { value: "parquet", label: "Parquet" },
      { value: "json", label: "JSON" },
      { value: "jsonl", label: "JSONL" },
    ],
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-full rounded-3xl bg-[#14151e] border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl ${
        catState === "DRAG_OVER"
          ? "border-[#f59e0b] dropzone-glow scale-[1.01]"
          : catState === "REJECT"
          ? "border-rose-500 dropzone-error-glow"
          : catState === "SUCCESS"
          ? "border-emerald-400 dropzone-success-glow"
          : "border-[#262838]"
      }`}
    >
      {/* 윈도우 헤더 */}
      <header
        data-tauri-drag-region
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button")) return;
          if (e.button === 0) invoke("start_drag_window").catch(() => {});
        }}
        className="w-full h-11 px-3 flex items-center justify-between bg-[#191b26]/90 border-b border-[#262838]/60 cursor-grab active:cursor-grabbing z-30 shrink-0"
      >
        <div className="flex items-center space-x-1.5 pointer-events-none">
          <span className="text-base">🐾</span>
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-[#f59e0b] to-[#fb7185] bg-clip-text text-transparent">
            Neko Drop
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* History Drawer Toggle */}
          <button
            onClick={() => {
              sounds.playPop();
              setShowHistory((prev) => !prev);
            }}
            title={t.historyTitle}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
              showHistory
                ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                : "hover:bg-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <History size={13} />
          </button>

          {/* Always on Top Toggle */}
          <button
            onClick={handleToggleAlwaysOnTop}
            title={t.pinTitle}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
              alwaysOnTop
                ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                : "hover:bg-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <Pin size={13} className={alwaysOnTop ? "rotate-45" : ""} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={t.muteTitle}
            className="w-6 h-6 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#f59e0b] flex items-center justify-center transition"
          >
            {isMuted ? <VolumeX size={13} className="text-gray-500" /> : <Volume2 size={13} />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={handleToggleLang}
            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#252736] hover:bg-[#323548] text-gray-300 transition"
          >
            {lang === "ko" ? "ENG" : "KR"}
          </button>

          <div className="w-[1px] h-3 bg-[#2c2e40] mx-0.5" />

          {/* Hide to Tray */}
          <button
            onClick={() => {
              sounds.playPop();
              invoke("hide_window").catch(() => {});
            }}
            title={t.hideTitle}
            className="w-6 h-6 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <EyeOff size={12} />
          </button>

          {/* Minimize */}
          <button
            onClick={() => {
              sounds.playPop();
              invoke("minimize_window").catch(() => {});
            }}
            title={t.minimizeTitle}
            className="w-6 h-6 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <Minus size={13} />
          </button>

          {/* Quit */}
          <button
            onClick={() => invoke("exit_app").catch(() => invoke("close_window"))}
            title={t.quitTitle}
            className="w-6 h-6 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition"
          >
            <X size={13} />
          </button>
        </div>
      </header>

      {/* 메인 고양이 / 히스토리 렌더링 영역 */}
      {showHistory ? (
        <main className="relative flex-1 flex flex-col p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <History size={13} className="text-[#f59e0b]" /> {t.historyTitle} ({history.length})
            </span>
            {history.length > 0 && (
              <button
                onClick={() => {
                  sounds.playPop();
                  setHistory([]);
                }}
                className="text-[10px] text-gray-400 hover:text-rose-400 transition"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {history.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                {t.historyEmpty}
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={`${item.output_path}-${idx}`}
                  className="p-2 rounded-xl bg-[#1a1c28] border border-[#2a2d3e] flex items-center justify-between gap-2 text-[11px]"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-200 truncate">
                      {fileNameOnly(item.output_path)}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                      <span>{item.format_from} ➔ {item.format_to}</span>
                      <span>•</span>
                      <span>{item.row_count.toLocaleString()} {t.rowsUnit}</span>
                      <span>•</span>
                      <span className="text-[#f59e0b]">{formatBytes(item.file_size_bytes)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenFolder(item.output_path)}
                    title={t.openFolder}
                    className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 shrink-0 transition"
                  >
                    <FolderOpen size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      ) : (
        <main className="relative flex-1 flex flex-col items-center justify-center px-2 pt-1 pb-2 min-h-0">
          <div className="relative w-full h-48 flex items-center justify-center overflow-visible">
            {catState === "DRAG_OVER" && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 animate-surprise pointer-events-none">
                <span className="text-xl font-black px-2.5 py-0.5 rounded-full bg-[#f59e0b] text-black shadow-xl border-2 border-white">
                  !
                </span>
              </div>
            )}

            {catState === "SUCCESS" && (
              <div className="absolute -top-4 flex space-x-4 animate-bounce z-30 pointer-events-none">
                <Sparkles className="text-amber-300 w-6 h-6" />
                <span className="text-2xl animate-pulse">💖</span>
                <Sparkles className="text-emerald-300 w-6 h-6" />
              </div>
            )}

            {catState === "REJECT" && (
              <div className="absolute -top-3 right-12 z-30 anim-angry pointer-events-none">
                <span className="text-2xl font-black text-rose-500 drop-shadow-[0_2px_8px_rgba(244,63,94,0.8)]">
                  💢
                </span>
              </div>
            )}

            <div className="relative w-full h-full flex items-center justify-center">
              {renderCat()}
            </div>
          </div>

          {/* 텍스트 피드백 */}
          <div className="mt-1 text-center px-2">
            {catState === "IDLE" && (
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-gray-200">
                  {t.idleTitle}
                  <span className="text-[#f59e0b]">{t.idleAccent}</span> 🐾
                </p>
                <p className="text-[10px] text-gray-400">{t.idleSub}</p>
              </div>
            )}

            {catState === "DRAG_OVER" && (
              <p className="text-xs font-bold text-[#f59e0b] animate-pulse flex items-center justify-center gap-1">
                <Zap size={14} /> {t.dragOver}
              </p>
            )}

            {catState === "EATING" && (
              <div className="flex flex-col items-center space-y-1">
                <p className="text-xs font-bold text-amber-300">
                  {batchStatus
                    ? t.batchProgress(batchStatus.current, batchStatus.total)
                    : t.eating}
                </p>
                <div className="w-36 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fb7185] animate-pulse w-full" />
                </div>
              </div>
            )}

            {catState === "SUCCESS" && lastResult && (
              <div className="space-y-0.5 animate-fadeIn">
                <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 size={14} />{" "}
                  {batchStatus ? t.batchSuccess(batchStatus.ok, batchStatus.total) : t.success}
                </p>
                <div className="text-[10px] text-gray-300 flex items-center justify-center gap-1.5">
                  <span>
                    {lastResult.format_from} ➔ <b className="text-emerald-300">{lastResult.format_to}</b>
                  </span>
                  <span>•</span>
                  <span>
                    {lastResult.row_count.toLocaleString()} {t.rowsUnit}
                  </span>
                  <span>•</span>
                  <span className="text-[#f59e0b] font-medium">{lastResult.elapsed_ms}ms</span>
                </div>
              </div>
            )}

            {catState === "REJECT" && (
              <p className="text-xs font-bold text-rose-400 flex items-center justify-center gap-1">
                <AlertCircle size={14} /> {errorMessage || t.rejectDefault}
              </p>
            )}
          </div>
        </main>
      )}

      {/* 하단 스마트 제어 패널 */}
      <footer className="w-full px-3.5 py-2.5 bg-[#191b26] border-t border-[#262838] flex flex-col space-y-2 z-20 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-gray-300">
          <span className="flex items-center gap-1 font-semibold text-gray-400 text-[10px]">
            <Settings2 size={11} /> {t.settingsLabel}
          </span>
          <div className="flex bg-[#101117] p-0.5 rounded-lg border border-[#2b2d3d]">
            {(["csv", "parquet", "json", "xlsx"] as InputFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  sounds.playPop();
                  setActiveTab(fmt);
                }}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition ${
                  activeTab === fmt
                    ? "bg-[#2d3042] text-[#f59e0b] shadow"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#12131b] p-2 rounded-xl border border-[#262838] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-300 shrink-0">
            <FileCode2 size={13} className="text-[#f59e0b]" />
            <span className="uppercase text-amber-300">{activeTab}</span>
            <ArrowRight size={11} className="text-gray-500" />
          </div>

          <div className="flex space-x-1 flex-wrap justify-end">
            {targetOptions[activeTab].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  sounds.playPop();
                  setTargets((prev) => ({ ...prev, [activeTab]: opt.value }));
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  targets[activeTab] === opt.value
                    ? "bg-[#f59e0b] text-black shadow-sm"
                    : "bg-[#1c1e2a] text-gray-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {lastResult && (
          <button
            onClick={() => handleOpenFolder(lastResult.output_path)}
            className="w-full py-1.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
          >
            <FolderOpen size={13} /> {t.openFolder} ({formatBytes(lastResult.file_size_bytes)})
          </button>
        )}
      </footer>
    </div>
  );
}
