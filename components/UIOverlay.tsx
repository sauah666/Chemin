import React, { useEffect, useState } from 'react';
import { GameStatus } from '../types';

interface UIOverlayProps {
  status: GameStatus;
  focus: number;
  xp: number;
  onStart: () => void;
  onResume: () => void;
  onExit: () => void;
  onNextLevel: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  status,
  focus,
  xp,
  onStart,
  onResume,
  onExit,
  onNextLevel,
}) => {
  const showHUD = status === GameStatus.PLAYING || status === GameStatus.PAUSED;
  const [titleVisible, setTitleVisible] = useState(false);

  // Trigger fade-in animation when entering start screen
  useEffect(() => {
    if (status === GameStatus.START_SCREEN) {
      setTitleVisible(false);
      const timer = setTimeout(() => {
        setTitleVisible(true);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none font-['Fredoka']">
      {/* HUD */}
      {showHUD && (
        <div className="absolute top-6 left-6 flex flex-col gap-2 w-72 z-10">
          <div className="relative">
            <span className="absolute -top-6 left-0 text-white/80 font-bold text-lg tracking-widest uppercase opacity-80" style={{textShadow: '1px 1px 0 #000'}}>Focus</span>
            <div className="w-full h-5 bg-black/40 border-2 border-white/90 rounded-full p-1 backdrop-blur-sm">
              <div
                className="h-full bg-yellow-300 rounded-full shadow-[0_0_10px_rgba(253,224,71,0.5)] transition-all duration-300"
                style={{ width: `${focus}%` }}
              />
            </div>
          </div>
          <div className="w-full h-3 bg-black/30 border border-white/60 rounded-full mt-1 ml-4 relative overflow-hidden">
             <div
                className="h-full bg-blue-400 opacity-80 rounded-full transition-all duration-300"
                style={{ width: `${xp}%` }}
              />
          </div>
        </div>
      )}

      {/* Start Screen - Constructed Scene */}
      {status === GameStatus.START_SCREEN && (
        <div 
            className="absolute inset-0 overflow-hidden pointer-events-auto cursor-pointer"
            onClick={onStart}
        >
          {/* Layer 1: Sky Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#94a3b8] via-[#f9a8d4] to-[#fb923c] z-0" />
          
          {/* Layer 2: Sun */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-b from-[#ef4444] to-[#f97316] blur-[1px] shadow-[0_0_40px_rgba(249,115,22,0.6)] z-0" />

          {/* Layer 3: Clouds (Subtle) */}
          <div className="absolute top-[20%] w-full h-32 opacity-30 z-0">
             <div className="absolute top-4 left-[20%] w-40 h-12 bg-white rounded-full blur-xl" />
             <div className="absolute top-10 right-[20%] w-60 h-16 bg-pink-200 rounded-full blur-xl" />
          </div>

          {/* Layer 4: Mountains (Back/Far) */}
          <svg className="absolute bottom-0 left-0 w-full h-full z-10" preserveAspectRatio="none" viewBox="0 0 1200 600">
             <path 
                d="M0 600 L0 350 C 200 250, 400 500, 600 520 C 800 500, 1000 200, 1200 400 L 1200 600 Z" 
                fill="#818cf8" 
                fillOpacity="0.4"
             />
          </svg>

          {/* Layer 5: Mountains (Front/Near) - The two peaks */}
          <svg className="absolute bottom-0 left-0 w-full h-full z-20" preserveAspectRatio="none" viewBox="0 0 1200 600">
             {/* Left Peak */}
             <path 
                d="M -100 600 L 100 250 Q 300 150 500 450 T 600 550 L 0 600 Z" 
                fill="#6366f1" 
                fillOpacity="0.6"
                className="drop-shadow-lg"
             />
             {/* Right Peak */}
             <path 
                d="M 1300 600 L 1100 250 Q 900 150 700 450 T 600 550 L 1200 600 Z" 
                fill="#6366f1" 
                fillOpacity="0.6"
                className="drop-shadow-lg"
             />
          </svg>

          {/* Layer 6: Bird */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-48 h-24 mt-4">
              <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-2xl">
                  {/* Stylized flying bird silhouette */}
                  <path 
                    d="M 100 60 
                       Q 60 40 20 20 
                       Q 50 50 90 70 
                       L 100 80 
                       L 110 70 
                       Q 150 50 180 20 
                       Q 140 40 100 60 Z" 
                    fill="#1e1b4b" 
                  />
              </svg>
          </div>

          {/* Layer 7: Vignette for atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b]/50 via-transparent to-[#1e1b4b]/20 z-30 mix-blend-multiply pointer-events-none" />

          {/* Layer 8: UI & Title (Front) */}
          <div className="absolute inset-0 flex flex-col items-center pt-16 z-40">
            <h1 
              className={`text-[8rem] text-[#1e3a8a] drop-shadow-sm transition-opacity duration-[2000ms] ${titleVisible ? 'opacity-90' : 'opacity-0'}`}
              style={{ fontFamily: 'Kaushan Script, cursive', textShadow: '2px 2px 4px rgba(255,255,255,0.2)' }}
            >
              Chemin
            </h1>
          </div>
          
          {/* Instruction to start (Optional, but good UX since button text is gone) */}
           <div className={`absolute bottom-12 w-full text-center z-40 transition-opacity duration-1000 ${titleVisible ? 'opacity-50' : 'opacity-0'}`}>
                <span className="text-white text-sm tracking-[0.5em] font-light animate-pulse">PRESS ANY KEY OR CLICK TO START</span>
           </div>

        </div>
      )}

      {/* Pause Menu */}
      {status === GameStatus.PAUSED && (
        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-center z-50 pointer-events-auto">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-12 tracking-wider">ПАУЗА</h2>
            <div className="flex flex-col gap-6">
              <button
                onClick={onResume}
                className="text-2xl text-white hover:text-yellow-300 transition-colors font-semibold"
              >
                Продолжить путь
              </button>
              <button
                onClick={onExit}
                className="text-xl text-slate-400 hover:text-red-400 transition-colors"
              >
                Вернуться
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Screen */}
      {status === GameStatus.LEVEL_COMPLETE && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 animate-fade-in pointer-events-auto">
          <h2 className="text-6xl font-bold text-yellow-100 mb-4 animate-pulse">Ты успел.</h2>
          <p className="text-blue-200 text-xl mb-12 opacity-80">Первый урок вот-вот начнется.</p>
          <button
            onClick={onNextLevel}
            className="px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-black transition-all"
          >
            ПРОДОЛЖИТЬ
          </button>
        </div>
      )}
    </div>
  );
};