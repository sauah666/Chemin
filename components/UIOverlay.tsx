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
      // Soft fade in delay
      const timer = setTimeout(() => {
        setTitleVisible(true);
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none font-['Fredoka']">
      {/* HUD - Hand-drawn style */}
      {showHUD && (
        <div className="absolute top-6 left-6 flex flex-col gap-2 w-72 z-10">
          {/* Focus Bar */}
          <div className="relative">
            <span className="absolute -top-6 left-0 text-white/80 font-bold text-lg tracking-widest uppercase opacity-80" style={{textShadow: '1px 1px 0 #000'}}>Focus</span>
            <div className="w-full h-5 bg-black/40 border-2 border-white/90 rounded-full p-1 backdrop-blur-sm">
              <div
                className="h-full bg-yellow-300 rounded-full shadow-[0_0_10px_rgba(253,224,71,0.5)] transition-all duration-300"
                style={{ width: `${focus}%` }}
              />
            </div>
          </div>
          
          {/* XP Bar - Thinner, sketchier */}
          <div className="w-full h-3 bg-black/30 border border-white/60 rounded-full mt-1 ml-4 relative overflow-hidden">
             <div
                className="h-full bg-blue-400 opacity-80 rounded-full transition-all duration-300"
                style={{ width: `${xp}%` }}
              />
          </div>
        </div>
      )}

      {/* Start Screen */}
      {status === GameStatus.START_SCREEN && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto overflow-hidden bg-[#1e1b4b]">
          {/* Background Image */}
          {/* Attempts to load local 'cover.jpg'. Falls back to a similar Unsplash image if missing. */}
          <img 
            src="./cover.jpg" 
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1517544845501-16ea2f6700b9?q=80&w=2600&auto=format&fit=crop"; // Fallback watercolor mountains
            }}
            alt="Chemin Background"
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
          />
          
          {/* Vignette/Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center mt-[-5%]">
            <h1 
              className={`text-9xl text-[#1e3a8a] mb-8 drop-shadow-md transition-opacity duration-[3000ms] ease-in-out ${titleVisible ? 'opacity-90' : 'opacity-0'}`}
              style={{ fontFamily: 'Kaushan Script, cursive', textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}
            >
              Chemin
            </h1>

            {/* Buttons fade in later */}
            <div className={`transition-opacity duration-[2000ms] delay-[2500ms] ${titleVisible ? 'opacity-100' : 'opacity-0'}`}>
                <button
                onClick={onStart}
                className="group relative px-12 py-3 bg-white/30 backdrop-blur-md border-2 border-white/70 text-white font-bold text-2xl rounded-full hover:bg-white/50 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                <span className="relative z-10 drop-shadow-sm text-[#1e3a8a]">НАЧАТЬ</span>
                </button>
            </div>
          </div>
          
           {/* Controls hint at bottom */}
           <div className={`absolute bottom-8 text-white/70 text-sm font-semibold flex gap-8 drop-shadow-md transition-opacity duration-[2000ms] delay-[3000ms] ${titleVisible ? 'opacity-100' : 'opacity-0'}`}>
                <span>A / D — ИДТИ</span>
                <span>SPACE — ПРЫГАТЬ</span>
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