import React, { useState } from 'react';
import { GameLevel } from './components/GameLevel';
import { UIOverlay } from './components/UIOverlay';
import { GameStatus } from './types';

function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START_SCREEN);
  const [focus, setFocus] = useState(100); // 100% Focus
  const [xp, setXp] = useState(0); // 0% XP

  // Handlers
  const handleStart = () => {
    setStatus(GameStatus.PLAYING);
  };

  const handlePause = () => {
    if (status === GameStatus.PLAYING) {
      setStatus(GameStatus.PAUSED);
    } else if (status === GameStatus.PAUSED) {
      setStatus(GameStatus.PLAYING);
    }
  };

  const handleResume = () => {
    setStatus(GameStatus.PLAYING);
  };

  const handleExit = () => {
    setStatus(GameStatus.START_SCREEN);
    setXp(0);
  };

  const handleWin = () => {
    setStatus(GameStatus.LEVEL_COMPLETE);
    setXp(25); // Gain some XP for finishing level
  };

  const handleNextLevel = () => {
    // For prototype, just restart or go to menu
    setStatus(GameStatus.START_SCREEN);
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-[1280px] aspect-video bg-black shadow-2xl rounded-lg overflow-hidden border border-slate-700">
            {/* Game Canvas Layer */}
            {(status !== GameStatus.START_SCREEN) && (
                <GameLevel 
                    status={status}
                    onPause={handlePause}
                    onWin={handleWin}
                />
            )}

            {/* UI Layer */}
            <UIOverlay 
                status={status}
                focus={focus}
                xp={xp}
                onStart={handleStart}
                onResume={handleResume}
                onExit={handleExit}
                onNextLevel={handleNextLevel}
            />
        </div>
    </div>
  );
}

export default App;
