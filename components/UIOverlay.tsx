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
      }, 500); 
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
        <div className="absolute inset-0 pointer-events-auto overflow-hidden">
          {/* Background Image */}
          <img 
            src="https://raw.githubusercontent.com/sauah666/Chemin/7de0ea9bf1514d5a19365e1e682c710eed9393d0/main.png" 
            alt="Chemin Background"
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
          />
          
          {/* Invisible Click Zone (The Sun) 
              Positioned centrally near the top. Adjust top/left percentages if image alignment differs.
          */}
          <div 
            onClick={onStart}
            className="absolute top-[10%] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full z-50 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300"
            title="Start Game"
            style={{ 
                /* Transparent hit box */
                backgroundColor: 'rgba(0,0,0,0)', 
            }}
          />
          
          {/* Fading Inscription */}
          <div className={`absolute w-full top-[45%] text-center transition-opacity duration-[3000ms] ease-in-out ${titleVisible ? 'opacity-100' : 'opacity-0'}`}>
             <p 
                className="text-4xl text-[#1e3a8a] font-script"
                style={{ 
                    textShadow: '0px 0px 15px rgba(255, 255, 255, 0.9), 1px 1px 2px rgba(0,0,0,0.2)' 
                }}
             >
                прикоснись к солнцу чтобы начать
             </p>
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