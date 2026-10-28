import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Dices, Sparkles, AlertOctagon, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface DiceRollerProps {
  currentTarget?: number;
  currentProcedureName?: string;
  onRollComplete?: (roll: number, total: number, isSuccess: boolean, margin: number) => void;
  className?: string;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  currentTarget = 11,
  currentProcedureName,
  onRollComplete,
  className = ''
}) => {
  const [target, setTarget] = useState<number>(currentTarget);
  const [modifier, setModifier] = useState<number>(0);
  const [rolling, setRolling] = useState<boolean>(false);
  const [rollValue, setRollValue] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{ roll: number; mod: number; total: number; target: number; success: boolean }>>([]);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());

  // Update target when prop changes
  React.useEffect(() => {
    if (currentTarget) {
      setTarget(currentTarget);
    }
  }, [currentTarget]);

  const handleRoll = () => {
    if (rolling) return;

    setRolling(true);
    sound.playDiceRoll();

    // Rapid shuffle animation
    let count = 0;
    const interval = setInterval(() => {
      setRollValue(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count > 12) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 20) + 1;
        setRollValue(finalRoll);
        setRolling(false);

        const total = finalRoll + modifier;
        const isSuccess = finalRoll === 20 ? true : (finalRoll === 1 ? false : total >= target);
        const margin = total - target;

        // Audio and visual fanfare
        sound.playDiceResult(finalRoll, isSuccess);

        if (finalRoll === 20) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899']
          });
        }

        setHistory(prev => [{ roll: finalRoll, mod: modifier, total, target, success: isSuccess }, ...prev.slice(0, 4)]);

        if (onRollComplete) {
          onRollComplete(finalRoll, total, isSuccess, margin);
        }
      }
    }, 60);
  };

  const toggleAudio = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const total = rollValue !== null ? rollValue + modifier : null;
  const isNat20 = rollValue === 20;
  const isNat1 = rollValue === 1;
  const isSuccess = rollValue !== null ? (isNat20 ? true : (isNat1 ? false : (total !== null && total >= target))) : null;
  const margin = (total !== null && target !== null) ? total - target : 0;

  return (
    <div className={`bg-gradient-to-b from-ocean-900 to-ocean-950 border-2 border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center border-b border-amber-500/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif font-bold text-amber-100 text-sm tracking-wide">
            CRUSTACEAN d20 ROLLER
          </h3>
        </div>
        <button
          onClick={toggleAudio}
          className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-ocean-800/60 transition-colors"
          title={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {currentProcedureName && (
        <div className="mb-2 text-center text-xs font-mono text-sky-300 bg-sky-950/60 border border-sky-600/30 py-1 px-2 rounded-lg">
          Targeting: <span className="font-bold text-white">{currentProcedureName}</span>
        </div>
      )}

      {/* Target & Modifier Controls */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-ocean-950/80 border border-amber-500/30 rounded-xl p-2 text-center">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-amber-300/80 mb-1">
            Target Check (DC)
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setTarget(prev => Math.max(8, prev - 1))}
              className="w-6 h-6 rounded bg-ocean-800 hover:bg-ocean-700 text-amber-200 font-bold flex items-center justify-center text-xs"
            >
              -
            </button>
            <span className="font-mono font-bold text-base text-amber-100 w-8">{target}+</span>
            <button
              onClick={() => setTarget(prev => Math.min(20, prev + 1))}
              className="w-6 h-6 rounded bg-ocean-800 hover:bg-ocean-700 text-amber-200 font-bold flex items-center justify-center text-xs"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-ocean-950/80 border border-amber-500/30 rounded-xl p-2 text-center">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-amber-300/80 mb-1">
            Inject Modifier
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setModifier(prev => prev - 1)}
              className="w-6 h-6 rounded bg-ocean-800 hover:bg-ocean-700 text-amber-200 font-bold flex items-center justify-center text-xs"
            >
              -
            </button>
            <span className={`font-mono font-bold text-base w-8 ${modifier > 0 ? 'text-emerald-400' : modifier < 0 ? 'text-red-400' : 'text-slate-300'}`}>
              {modifier > 0 ? `+${modifier}` : modifier}
            </span>
            <button
              onClick={() => setModifier(prev => prev + 1)}
              className="w-6 h-6 rounded bg-ocean-800 hover:bg-ocean-700 text-amber-200 font-bold flex items-center justify-center text-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Main Dice Arena */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <div 
          onClick={handleRoll}
          className={`relative w-28 h-28 flex items-center justify-center cursor-pointer select-none transition-all duration-300 transform ${rolling ? 'scale-110 rotate-180 animate-spin' : 'hover:scale-105 active:scale-95'}`}
        >
          {/* Hexagonal / 20-sided die polygon SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="d20Grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
            {/* Outer d20 Polygon */}
            <polygon 
              points="50,5 90,25 90,75 50,95 10,75 10,25" 
              fill="url(#d20Grad)" 
              stroke={isNat20 ? '#10b981' : isNat1 ? '#ef4444' : '#f59e0b'} 
              strokeWidth="3"
            />
            {/* Facet lines */}
            <line x1="50" y1="5" x2="50" y2="95" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
            <line x1="10" y1="25" x2="90" y2="75" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
            <line x1="10" y1="75" x2="90" y2="25" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
          </svg>

          {/* Roll Number in Center */}
          <span className={`absolute font-mono font-extrabold text-3xl drop-shadow-md z-10 ${isNat20 ? 'text-emerald-400 animate-pulse' : isNat1 ? 'text-red-400' : 'text-amber-100'}`}>
            {rollValue !== null ? rollValue : '20'}
          </span>
        </div>

        {/* Roll Button */}
        <button
          onClick={handleRoll}
          disabled={rolling}
          className="mt-3 w-full py-2 px-4 rounded-xl font-serif font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 active:translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {rolling ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              Rolling d20...
            </>
          ) : (
            <>
              <Dices className="w-4 h-4" />
              Roll Incident Die
            </>
          )}
        </button>
      </div>

      {/* Outcome Banner */}
      {rollValue !== null && !rolling && (
        <div className={`mt-3 p-2.5 rounded-xl border text-center font-mono ${isSuccess ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200' : 'bg-red-950/70 border-red-500/50 text-red-200'}`}>
          <div className="flex items-center justify-center gap-1.5 font-bold text-sm mb-0.5">
            {isNat20 ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>NATURAL 20! CRITICAL SUCCESS!</span>
              </>
            ) : isNat1 ? (
              <>
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <span>NATURAL 1! BARNACLE BLUNDER!</span>
              </>
            ) : isSuccess ? (
              <span>PROCEDURE SUCCESSFUL!</span>
            ) : (
              <span>CHECK FAILED — ADD 1 STRIKE!</span>
            )}
          </div>

          <div className="text-xs text-slate-300">
            Roll: <span className="font-bold text-white">{rollValue}</span>
            {modifier !== 0 && (
              <span> {modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`}</span>
            )}
            {' = '}
            <span className="font-bold text-white">{total}</span>
            {' vs '}
            <span className="font-bold text-amber-300">Target {target}</span>
            {' ('}
            <span className={margin >= 0 ? 'text-emerald-300' : 'text-red-300'}>
              {margin >= 0 ? `+${margin} margin` : `${margin} margin`}
            </span>
            {')'}
          </div>
        </div>
      )}

      {/* History Log */}
      {history.length > 0 && (
        <div className="mt-3 pt-2 border-t border-amber-500/20">
          <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Recent Rolls:</span>
          <div className="flex gap-1.5 overflow-x-auto">
            {history.map((h, i) => (
              <div 
                key={i} 
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap border ${h.success ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' : 'bg-red-950/80 border-red-500/30 text-red-300'}`}
              >
                {h.total} (vs {h.target})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
