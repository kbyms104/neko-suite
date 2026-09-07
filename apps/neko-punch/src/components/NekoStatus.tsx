import React, { useState } from 'react';
import { sounds } from '../sound';
import catBoxerImg from '../assets/cat_boxer.png';
import catSleepImg from '../assets/cat_sleep.png';
import catPawImg from '../assets/cat_paw.png';

interface NekoStatusProps {
  portCount: number;
  lastMessage: string | null;
  isPunching: boolean;
}

export const NekoStatus: React.FC<NekoStatusProps> = ({
  portCount,
  lastMessage,
  isPunching,
}) => {
  const [bounce, setBounce] = useState(false);

  const handleClick = () => {
    sounds.playMeow();
    setBounce(true);
    setTimeout(() => setBounce(false), 600);
  };

  const handleDragStart = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    if (e.button === 0) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('start_drag_window');
      } catch (err) {
        console.log('start_drag_window fallback');
      }
    }
  };

  // 고양이 캐릭터 상태별 이미지 선택
  let currentCatImg = catBoxerImg;
  let statusBadge = '👀 감시 중';
  let badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';

  if (isPunching) {
    currentCatImg = catPawImg;
    statusBadge = '💥 냥펀치!';
    badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  } else if (portCount === 0) {
    currentCatImg = catSleepImg;
    statusBadge = '💤 낮잠 중';
    badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }

  return (
    <div 
      onMouseDown={handleDragStart}
      data-tauri-drag-region
      className="px-3.5 py-2 bg-[#171822] border-b border-cat-border/60 flex items-center justify-between select-none"
    >
      <div className="flex items-center gap-2.5 overflow-hidden pointer-events-none">
        <button
          onClick={handleClick}
          title="복서냥이 클릭 시 야옹! 🐾"
          className={`pointer-events-auto relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#202230] to-[#2a2d40] border border-cat-border/80 flex items-center justify-center p-1 shadow-md hover:scale-110 active:scale-90 transition-all shrink-0 ${
            bounce ? 'animate-bounce' : ''
          }`}
        >
          <img
            src={currentCatImg}
            alt="Neko Mascot"
            className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          />
        </button>

        <div className="min-w-0 pointer-events-none">
          <div className="text-xs font-semibold text-gray-200 truncate flex items-center gap-1.5">
            {lastMessage ? (
              <span className="text-cat-primary font-bold">{lastMessage}</span>
            ) : portCount === 0 ? (
              <span className="text-gray-300">포트 충돌 없음 • 평화로운 낮잠 중</span>
            ) : (
              <span>점유 중인 포트 <strong className="text-amber-400 font-bold">{portCount}개</strong> 감지됨</span>
            )}
          </div>
          <div className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
            {isPunching ? '포트 점유 프로세스를 강제 종료하는 중...' : '원하는 포트의 [냥펀치 🐾]를 누르세요'}
          </div>
        </div>
      </div>

      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor} shrink-0 pointer-events-none`}>
        {statusBadge}
      </div>
    </div>
  );
};
