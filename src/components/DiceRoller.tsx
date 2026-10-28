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

    // Rapid tumble shuffle animation
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
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#10b981', '#38bdf8', '#ffd166']
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
    <div className={`relative rounded-3xl p-5 bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-sm ${className}`}>
      {/* Tray Header Bar */}
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-sm">
            <Dices className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-100 text-sm tracking-wide uppercase">
              d20 Investigation Tray
            </h3>
            <span className="font-mono text-xs text-slate-400">Tactical Dice Roller</span>
          </div>
        </div>
        <button
          onClick={toggleAudio}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {currentProcedureName && (
        <div className="mb-4 text-center text-xs font-mono text-sky-200 bg-sky-950/40 border border-sky-500/30 py-2 px-3 rounded-xl shadow-inner">
          <span className="text-slate-400">Armed S.O.P.:</span> <strong className="text-amber-300 font-display ml-1">{currentProcedureName}</strong>
        </div>
      )}

      {/* Target & Modifier Dials */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Target DC Dial */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-center shadow-inner">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
            Target DC
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setTarget(prev => Math.max(5, prev - 1))}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs transition-colors"
              aria-label="Decrease Target DC"
            >
              -
            </button>
            <span className="font-mono font-bold text-base text-amber-300 w-10 text-center">{target}+</span>
            <button
              onClick={() => setTarget(prev => Math.min(25, prev + 1))}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs transition-colors"
              aria-label="Increase Target DC"
            >
              +
            </button>
          </div>
        </div>

        {/* Modifier Dial */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-center shadow-inner">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
            Roll Modifier
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setModifier(prev => prev - 1)}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs transition-colors"
              aria-label="Decrease Modifier"
            >
              -
            </button>
            <span className={`font-mono font-bold text-base w-10 text-center ${modifier > 0 ? 'text-emerald-400' : modifier < 0 ? 'text-red-400' : 'text-slate-300'}`}>
              {modifier > 0 ? `+${modifier}` : modifier}
            </span>
            <button
              onClick={() => setModifier(prev => prev + 1)}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs transition-colors"
              aria-label="Increase Modifier"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Recessed Die Arena */}
      <div className="relative rounded-2xl bg-slate-950/90 border border-slate-800/80 p-5 shadow-inner flex flex-col items-center justify-center">
        <div 
          onClick={handleRoll}
          className={`relative w-28 h-28 flex items-center justify-center cursor-pointer select-none transition-all duration-300 transform ${rolling ? 'scale-110 rotate-180 animate-spin' : 'hover:scale-105 active:scale-95'}`}
          title="Click to roll d20"
        >
          {/* Crisp modern geometric d20 die */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <polygon 
              points="50,5 90,25 90,75 50,95 10,75 10,25" 
              fill="#09131f" 
              stroke={isNat20 ? '#10b981' : isNat1 ? '#ef4444' : '#f59e0b'} 
              strokeWidth="3"
            />
            {/* Geometric facet lines */}
            <line x1="50" y1="5" x2="50" y2="95" stroke="#334155" strokeWidth="1.5" />
            <line x1="10" y1="25" x2="90" y2="75" stroke="#334155" strokeWidth="1.5" />
            <line x1="10" y1="75" x2="90" y2="25" stroke="#334155" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="22" fill="#020617" stroke={isNat20 ? '#10b981' : isNat1 ? '#ef4444' : '#475569'} strokeWidth="1" />
          </svg>

          {/* Roll Number in Center */}
          <span className={`absolute font-display font-black text-3xl z-10 ${isNat20 ? 'text-emerald-400 animate-pulse' : isNat1 ? 'text-red-400' : 'text-slate-100'}`}>
            {rollValue !== null ? rollValue : '20'}
          </span>
        </div>

        {/* Bold Modern Roll Button */}
        <button
          onClick={handleRoll}
          disabled={rolling}
          className="mt-4 w-full py-3 px-4 rounded-xl font-sans font-bold text-sm tracking-wide uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {rolling ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-slate-950" />
              Rolling d20...
            </>
          ) : (
            <>
              <Dices className="w-4 h-4 text-slate-950" />
              Roll Incident d20
            </>
          )}
        </button>
      </div>

      {/* Outcome Banner */}
      {rollValue !== null && !rolling && (
        <div className={`mt-3 p-3.5 rounded-xl border text-center font-mono shadow-md ${
          isSuccess 
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' 
            : 'bg-red-950/60 border-red-500/40 text-red-200'
        }`}>
          <div className="flex items-center justify-center gap-1.5 font-sans font-bold text-sm mb-1">
            {isNat20 ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="tracking-wide">NATURAL 20! CRITICAL SUCCESS!</span>
              </>
            ) : isNat1 ? (
              <>
                <AlertOctagon className="w-4 h-4 text-red-400 animate-bounce" />
                <span className="tracking-wide">NATURAL 1! CRITICAL FAILURE!</span>
              </>
            ) : isSuccess ? (
              <span className="tracking-wide text-emerald-300">PROCEDURE CHECK SUCCESSFUL!</span>
            ) : (
              <span className="tracking-wide text-red-300">CHECK FAILED — STRIKE ADDED!</span>
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
            <span className={margin >= 0 ? 'text-emerald-300 font-bold' : 'text-red-300 font-bold'}>
              {margin >= 0 ? `+${margin} margin` : `${margin} margin`}
            </span>
            {')'}
          </div>
        </div>
      )}

      {/* Recent Rolls History Stamped as Clean Pills */}
      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <span className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
            Recent Rolls:
          </span>
          <div className="flex gap-2 overflow-x-auto">
            {history.map((h, i) => (
              <div 
                key={i} 
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap border ${
                  h.success 
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                    : 'bg-red-950/60 border-red-500/40 text-red-300'
                }`}
              >
                {h.total} vs DC {h.target}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
