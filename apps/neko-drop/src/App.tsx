import React, { useState, useEffect, useRef } from "react";
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
  ArrowRight
} from "lucide-react";

import catSitImg from "./assets/cat_sit.png";
import catOpenImg from "./assets/cat_open.png";
import catHappyImg from "./assets/cat_happy.png";
import catRejectImg from "./assets/cat_reject.png";

type CatState = "IDLE" | "DRAG_OVER" | "EATING" | "SUCCESS" | "REJECT";
type InputFormat = "csv" | "parquet" | "json" | "xlsx";

const TOTAL_WALK_FRAMES = 87; // 2.875s ~ 10.0s 수학적으로 오차 0인 완벽한 닫힌 루프
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

export default function App() {
  const [catState, setCatState] = useState<CatState>("IDLE");
  const [lastResult, setLastResult] = useState<ConversionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [chewFrame, setChewFrame] = useState<0 | 1>(0);

  // 10초 풀 비디오 1:1 보행 프레임 인덱스
  const [frameIdx, setFrameIdx] = useState(0);

  // 포맷별 목적지 타깃 설정
  const [targets, setTargets] = useState<{
    csv: "parquet" | "json";
    parquet: "csv" | "json";
    json: "csv" | "parquet";
    xlsx: "csv" | "parquet" | "json";
  }>({
    csv: "parquet",
    parquet: "csv",
    json: "csv",
    xlsx: "csv",
  });

  const [activeTab, setActiveTab] = useState<InputFormat>("csv");
  const eatingIntervalRef = useRef<number | null>(null);

  // 프레임 이미지 브라우저 메모리 프리로딩 (끊김 0%)
  useEffect(() => {
    walkFramePaths.forEach((path) => {
      const img = new Image();
      img.src = path;
    });
  }, []);

  // 10초 풀 비디오 무한 연속 자연스러운 걷기 & 몸 돌리기 턴 엔진 (12fps, 83.3ms)
  useEffect(() => {
    if (catState !== "IDLE") return;

    const interval = window.setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % TOTAL_WALK_FRAMES);
    }, 83); // 12fps = 83.3ms

    return () => clearInterval(interval);
  }, [catState]);

  // Tauri v2 드래그 & 드롭 이벤트 등록
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function setupTauriDragDrop() {
      try {
        const webview = getCurrentWebview();
        unlisten = await webview.onDragDropEvent((event) => {
          if (event.payload.type === "over") {
            if (catState !== "EATING") setCatState("DRAG_OVER");
          } else if (event.payload.type === "leave") {
            if (catState === "DRAG_OVER") setCatState("IDLE");
          } else if (event.payload.type === "drop") {
            const paths = event.payload.paths;
            if (paths && paths.length > 0) {
              handleFilePathDrop(paths[0]);
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
  }, [catState, targets]);

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
      const file = e.dataTransfer.files[0];
      const path = (file as unknown as { path?: string }).path || file.name;
      handleFilePathDrop(path);
    }
  };

  // 핵심 파일 변환 처리
  const handleFilePathDrop = async (filePath: string) => {
    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    const supportedExts = ["csv", "parquet", "xlsx", "xls", "json", "jsonl"];

    if (!supportedExts.includes(ext)) {
      setCatState("REJECT");
      setErrorMessage(`.${ext || "알수없음"} 포맷은 맛이 없다냥!`);
      sounds.playRejectPunch();

      setTimeout(() => {
        setCatState("IDLE");
        setErrorMessage(null);
      }, 2500);
      return;
    }

    let targetFormat: string = "csv";
    if (ext === "csv") targetFormat = targets.csv;
    else if (ext === "parquet") targetFormat = targets.parquet;
    else if (ext === "json" || ext === "jsonl") targetFormat = targets.json;
    else if (ext === "xlsx" || ext === "xls") targetFormat = targets.xlsx;

    if (ext === "csv") setActiveTab("csv");
    else if (ext === "parquet") setActiveTab("parquet");
    else if (ext === "json" || ext === "jsonl") setActiveTab("json");
    else if (ext === "xlsx" || ext === "xls") setActiveTab("xlsx");

    setCatState("EATING");
    setErrorMessage(null);
    setLastResult(null);

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

    try {
      const [result] = await Promise.all([
        invoke<ConversionResult>("convert_file", {
          filePath,
          targetFormat,
        }),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);

      if (eatingIntervalRef.current) clearInterval(eatingIntervalRef.current);

      setCatState("SUCCESS");
      setLastResult(result);
      sounds.playSuccessBurp();

      setTimeout(() => {
        setCatState((curr) => (curr === "SUCCESS" ? "IDLE" : curr));
      }, 3500);
    } catch (err: unknown) {
      if (eatingIntervalRef.current) clearInterval(eatingIntervalRef.current);
      setCatState("REJECT");
      setErrorMessage(String(err));
      sounds.playRejectPunch();

      setTimeout(() => {
        setCatState("IDLE");
        setErrorMessage(null);
      }, 2500);
    }
  };

  const handleOpenFolder = (outputPath: string) => {
    invoke("open_file_folder", { filePath: outputPath });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 현재 상태에 따른 고양이 렌더링
  const renderCat = () => {
    if (catState === "DRAG_OVER") {
      return (
        <img
          src={catOpenImg}
          alt="Open Mouth Cat"
          className="w-48 h-48 object-contain pointer-events-none select-none anim-surprise-dash filter drop-shadow-[0_14px_28px_rgba(245,158,11,0.5)]"
        />
      );
    }
    if (catState === "EATING") {
      return (
        <img
          src={chewFrame === 0 ? catOpenImg : catSitImg}
          alt="Eating Cat"
          className="w-48 h-48 object-contain pointer-events-none select-none anim-munching filter drop-shadow-[0_14px_28px_rgba(245,158,11,0.55)]"
        />
      );
    }
    if (catState === "SUCCESS") {
      return (
        <img
          src={catHappyImg}
          alt="Happy Cat"
          className="w-48 h-48 object-contain pointer-events-none select-none anim-happy-wave filter drop-shadow-[0_14px_28px_rgba(16,185,129,0.5)]"
        />
      );
    }
    if (catState === "REJECT") {
      return (
        <img
          src={catRejectImg}
          alt="Reject Cat"
          className="w-48 h-48 object-contain pointer-events-none select-none anim-reject-shake filter drop-shadow-[0_14px_28px_rgba(244,63,94,0.6)]"
        />
      );
    }

    // IDLE 상태: 10초 풀 비디오 무한 연속 자연스러운 걷기 & 몸 돌리기 턴 렌더러
    return (
      <img
        src={walkFramePaths[frameIdx]}
        alt="Natural Walking Cat"
        className="w-full h-full object-contain pointer-events-none select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] scale-110"
      />
    );
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
        className="w-full h-11 px-4 flex items-center justify-between bg-[#191b26]/90 border-b border-[#262838]/60 cursor-grab active:cursor-grabbing z-30"
      >
        <div className="flex items-center space-x-2 pointer-events-none">
          <span className="text-lg">🐾</span>
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-[#f59e0b] to-[#fb7185] bg-clip-text text-transparent">
            Neko Drop
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] font-semibold">
            True Motion
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => invoke("minimize_window")}
            className="w-6 h-6 rounded-full hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={() => invoke("close_window")}
            className="w-6 h-6 rounded-full hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition"
          >
            <X size={13} />
          </button>
        </div>
      </header>

      {/* 메인 고양이 렌더링 영역 */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-2 pt-1 pb-2">
        <div className="relative w-full h-52 flex items-center justify-center overflow-visible">
          {/* 드래그 시 깜짝 느낌표 */}
          {catState === "DRAG_OVER" && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 animate-surprise pointer-events-none">
              <span className="text-xl font-black px-2.5 py-0.5 rounded-full bg-[#f59e0b] text-black shadow-xl border-2 border-white">
                !
              </span>
            </div>
          )}

          {/* 성공 시 축하 파티클 & 하트 */}
          {catState === "SUCCESS" && (
            <div className="absolute -top-4 flex space-x-4 animate-bounce z-30 pointer-events-none">
              <Sparkles className="text-amber-300 w-6 h-6" />
              <span className="text-2xl animate-pulse">💖</span>
              <Sparkles className="text-emerald-300 w-6 h-6" />
            </div>
          )}

          {/* 미지원 거부 시 분노 앵그리 마크 */}
          {catState === "REJECT" && (
            <div className="absolute -top-3 right-12 z-30 anim-angry pointer-events-none">
              <span className="text-2xl font-black text-rose-500 drop-shadow-[0_2px_8px_rgba(244,63,94,0.8)]">
                💢
              </span>
            </div>
          )}

          {/* 고양이 메인 뷰 */}
          <div className="relative w-full h-full flex items-center justify-center">
            {renderCat()}
          </div>
        </div>

        {/* 텍스트 피드백 */}
        <div className="mt-1 text-center">
          {catState === "IDLE" && (
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-gray-200">
                파일을 가져오면 고양이가 <span className="text-[#f59e0b]">다가와 입을 벌립니다!</span> 🐾
              </p>
              <p className="text-[10px] text-gray-400">
                CSV • Parquet • JSON • XLSX 초고속 변환
              </p>
            </div>
          )}

          {catState === "DRAG_OVER" && (
            <p className="text-xs font-bold text-[#f59e0b] animate-pulse flex items-center justify-center gap-1">
              <Zap size={14} /> 냥! 맛있는 먹이다! 입 속으로 쏙 넣어줘!
            </p>
          )}

          {catState === "EATING" && (
            <div className="flex flex-col items-center space-y-1">
              <p className="text-xs font-bold text-amber-300">
                우걱우걱 소화시키는 중... 🐾
              </p>
              <div className="w-36 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fb7185] animate-pulse w-full" />
              </div>
            </div>
          )}

          {catState === "SUCCESS" && lastResult && (
            <div className="space-y-0.5 animate-fadeIn">
              <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 size={14} /> 맛있다냥! (꺼억~) 변환 완료!
              </p>
              <div className="text-[10px] text-gray-300 flex items-center justify-center gap-1.5">
                <span>{lastResult.format_from} ➔ <b className="text-emerald-300">{lastResult.format_to}</b></span>
                <span>•</span>
                <span>{lastResult.row_count.toLocaleString()}행</span>
                <span>•</span>
                <span className="text-[#f59e0b] font-medium">{lastResult.elapsed_ms}ms</span>
              </div>
            </div>
          )}

          {catState === "REJECT" && (
            <p className="text-xs font-bold text-rose-400 flex items-center justify-center gap-1">
              <AlertCircle size={14} /> {errorMessage || "퉷! 못 먹는 거다냥!"}
            </p>
          )}
        </div>
      </main>

      {/* 하단 스마트 제어 패널 */}
      <footer className="w-full px-4 py-3 bg-[#191b26] border-t border-[#262838] flex flex-col space-y-2.5 z-20">
        <div className="flex items-center justify-between text-[11px] text-gray-300">
          <span className="flex items-center gap-1 font-semibold text-gray-400">
            <Settings2 size={12} /> 포맷별 변환 설정:
          </span>
          <div className="flex bg-[#101117] p-0.5 rounded-lg border border-[#2b2d3d]">
            {(["csv", "parquet", "json", "xlsx"] as InputFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setActiveTab(fmt)}
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

        <div className="bg-[#12131b] p-2 rounded-xl border border-[#262838] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
            <FileCode2 size={14} className="text-[#f59e0b]" />
            <span className="uppercase text-amber-300">{activeTab}</span> 드롭 시
            <ArrowRight size={12} className="text-gray-500" />
          </div>

          <div className="flex space-x-1">
            {activeTab === "csv" && (
              <>
                <button
                  onClick={() => setTargets((prev) => ({ ...prev, csv: "parquet" }))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    targets.csv === "parquet"
                      ? "bg-[#f59e0b] text-black shadow-sm"
                      : "bg-[#1c1e2a] text-gray-400 hover:text-white"
                  }`}
                >
                  Parquet
                </button>
                <button
                  onClick={() => setTargets((prev) => ({ ...prev, csv: "json" }))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    targets.csv === "json"
                      ? "bg-[#f59e0b] text-black shadow-sm"
                      : "bg-[#1c1e2a] text-gray-400 hover:text-white"
                  }`}
                >
                  JSON
                </button>
              </>
            )}

            {activeTab === "parquet" && (
              <>
                <button
                  onClick={() => setTargets((prev) => ({ ...prev, parquet: "csv" }))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    targets.parquet === "csv"
                      ? "bg-[#f59e0b] text-black shadow-sm"
                      : "bg-[#1c1e2a] text-gray-400 hover:text-white"
                  }`}
                >
                  CSV
                </button>
                <button
                  onClick={() => setTargets((prev) => ({ ...prev, parquet: "json" }))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    targets.parquet === "json"
                      ? "bg-[#f59e0b] text-black shadow-sm"
                      : "bg-[#1c1e2a] text-gray-400 hover:text-white"
                  }`}
                >
                  JSON
                </button>
              </>
            )}

            {activeTab === "json" && (
              <>
                <button
                  onClick={() => setTargets((prev) => ({ ...prev, json: "csv" }))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    targets.json === "csv"
                      ? "bg-[#f59e0b] text-black shadow-sm"
                      : "bg-[#1c1e2a] text-gray-400 hover:text-white"
                  }`}
                >
                  CSV
                </button>
                <button
                  onClick={() => setTargets((prev) => ({ ...prev, json: "parquet" }))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    targets.json === "parquet"
                      ? "bg-[#f59e0b] text-black shadow-sm"
                      : "bg-[#1c1e2a] text-gray-400 hover:text-white"
                  }`}
                >
                  Parquet
                </button>
              </>
            )}

            {activeTab === "xlsx" && (
              <>
                <button
                  onClick={() => setTargets((prev) => ({ ...prev, xlsx: "csv" }))}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                    targets.xlsx === "csv"
                      ? "bg-[#f59e0b] text-black shadow-sm"
                      : "bg-[#1c1e2a] text-gray-400 hover:text-white"
                  }`}
                >
                  CSV
                </button>
                <button
                  onClick={() => setTargets((prev) => ({ ...prev, xlsx: "parquet" }))}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                    targets.xlsx === "parquet"
                      ? "bg-[#f59e0b] text-black shadow-sm"
                      : "bg-[#1c1e2a] text-gray-400 hover:text-white"
                  }`}
                >
                  Parquet
                </button>
                <button
                  onClick={() => setTargets((prev) => ({ ...prev, xlsx: "json" }))}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                    targets.xlsx === "json"
                      ? "bg-[#f59e0b] text-black shadow-sm"
                      : "bg-[#1c1e2a] text-gray-400 hover:text-white"
                  }`}
                >
                  JSON
                </button>
              </>
            )}
          </div>
        </div>

        {lastResult && (
          <button
            onClick={() => handleOpenFolder(lastResult.output_path)}
            className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
          >
            <FolderOpen size={14} /> 저장된 폴더 열기 ({formatBytes(lastResult.file_size_bytes)})
          </button>
        )}
      </footer>
    </div>
  );
}
