import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { 
  Dices, 
  Sparkles, 
  AlertOctagon, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckSquare, 
  Square,
  ShieldCheck,
  Target
} from 'lucide-react';

interface DiceRollerProps {
  currentTarget?: number;
  currentProcedureName?: string;
  currentCheckLabel?: string;
  onRollComplete?: (roll: number, total: number, isSuccess: boolean, margin: number) => void;
  className?: string;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  currentTarget = 11,
  currentProcedureName,
  currentCheckLabel,
  onRollComplete,
  className = ''
}) => {
  const [target, setTarget] = useState<number>(currentTarget);
  const [manualModifier, setManualModifier] = useState<number>(0);
  const [procedureInPlace, setProcedureInPlace] = useState<boolean>(false);
  const [rolling, setRolling] = useState<boolean>(false);
  const [rollValue, setRollValue] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{ 
    roll: number; 
    mod: number; 
    hasProcedureBonus: boolean; 
    total: number; 
    target: number; 
    success: boolean 
  }>>([]);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());

  // Update target when prop changes
  useEffect(() => {
    if (currentTarget) {
      setTarget(currentTarget);
    }
  }, [currentTarget]);

  // Total modifier = manual adjustments + (+3 for Procedure in Place)
  const totalModifier = manualModifier + (procedureInPlace ? 3 : 0);

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

        const total = finalRoll + totalModifier;
        const isSuccess = finalRoll === 20 ? true : (finalRoll === 1 ? false : total >= target);
        const margin = total - target;

        // Audio and visual fanfare
        sound.playDiceResult(finalRoll, isSuccess);

        if (finalRoll === 20) {
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#10b981', '#38bdf8', '#ffd166']
          });
        }

        setHistory(prev => [{
          roll: finalRoll,
          mod: totalModifier,
          hasProcedureBonus: procedureInPlace,
          total,
          target,
          success: isSuccess
        }, ...prev.slice(0, 4)]);

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

  const total = rollValue !== null ? rollValue + totalModifier : null;
  const isNat20 = rollValue === 20;
  const isNat1 = rollValue === 1;
  const isSuccess = rollValue !== null ? (isNat20 ? true : (isNat1 ? false : (total !== null && total >= target))) : null;
  const margin = (total !== null && target !== null) ? total - target : 0;

  return (
    <div className={`relative rounded-3xl p-5 bg-galley-950/85 border border-amber-900/40 shadow-2xl backdrop-blur-md ${className}`}>
      {/* Brass Corner Rivets */}
      <div className="absolute top-2.5 left-2.5 brass-rivet pointer-events-none" />
      <div className="absolute top-2.5 right-2.5 brass-rivet pointer-events-none" />

      {/* Tray Header Bar */}
      <div className="flex justify-between items-center border-b border-amber-900/40 pb-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-950/70 border border-amber-600/40 flex items-center justify-center text-amber-400 shadow-md">
            <Dices className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-amber-100 text-sm tracking-wide uppercase">
              d20 Investigation Tray
            </h3>
            <span className="font-mono text-xs text-amber-200/70">Backdoors &amp; Breaches Engine</span>
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

      {/* Active Armed S.O.P. & Check Phase Banner */}
      {currentProcedureName && (
        <div className="mb-3.5 text-center text-xs font-mono text-sky-200 bg-sky-950/40 border border-sky-500/30 py-2 px-3 rounded-xl shadow-inner">
          <div className="flex items-center justify-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300">Armed S.O.P.:</span>
            <strong className="text-amber-300 font-display ml-1">{currentProcedureName}</strong>
          </div>
          {currentCheckLabel && (
            <div className="text-[11px] text-sky-300 font-semibold mt-0.5">
              Roll Goal: {currentCheckLabel}
            </div>
          )}
        </div>
      )}

      {/* Target & Modifier Controls */}
      <div className="grid grid-cols-2 gap-3 mb-3.5">
        {/* Target DC Dial */}
        <div className="bg-slate-950/90 border border-amber-900/40 rounded-xl p-2.5 text-center shadow-inner">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-amber-300/80 font-bold mb-1.5">
            Target DC
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => { setTarget(prev => Math.max(5, prev - 1)); sound.playClick(); }}
              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs transition-colors"
              aria-label="Decrease Target DC"
            >
              -
            </button>
            <span className="font-mono font-bold text-base text-amber-300 w-10 text-center">{target}+</span>
            <button
              onClick={() => { setTarget(prev => Math.min(25, prev + 1)); sound.playClick(); }}
              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs transition-colors"
              aria-label="Increase Target DC"
            >
              +
            </button>
          </div>
        </div>

        {/* Modifier Dial */}
        <div className="bg-slate-950/90 border border-amber-900/40 rounded-xl p-2.5 text-center shadow-inner">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-amber-300/80 font-bold mb-1.5">
            Modifier Total
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => { setManualModifier(prev => prev - 1); sound.playClick(); }}
              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs transition-colors"
              aria-label="Decrease Manual Modifier"
            >
              -
            </button>
            <span className={`font-mono font-bold text-base w-10 text-center ${totalModifier > 0 ? 'text-emerald-400' : totalModifier < 0 ? 'text-red-400' : 'text-slate-300'}`}>
              {totalModifier > 0 ? `+${totalModifier}` : totalModifier}
            </span>
            <button
              onClick={() => { setManualModifier(prev => prev + 1); sound.playClick(); }}
              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs transition-colors"
              aria-label="Increase Manual Modifier"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* ONE-CLICK TOGGLE: +3 PROCEDURE IN PLACE (Official B&B Rule) */}
      <div className="mb-3.5">
        <button
          type="button"
          onClick={() => {
            setProcedureInPlace(prev => !prev);
            sound.playClick();
          }}
          className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between font-mono text-xs transition-all shadow-sm ${
            procedureInPlace
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-amber-500/10'
              : 'bg-slate-950/80 hover:bg-slate-900 border-amber-900/30 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {procedureInPlace ? (
              <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <span className="text-left font-sans font-semibold">
              +3 Procedure in Place
            </span>
          </div>

          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
            procedureInPlace 
              ? 'bg-amber-500 text-slate-950' 
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}>
            {procedureInPlace ? 'ACTIVE (+3)' : 'OFF (+0)'}
          </span>
        </button>
        {procedureInPlace && (
          <div className="mt-1 text-[10px] font-mono text-amber-300/80 flex items-center gap-1 px-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Documented S.O.P. Rule: +3 bonus applied to investigation check.</span>
          </div>
        )}
      </div>

      {/* Recessed Die Arena with Brass & Oceanic Styling */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#051119] to-slate-950 border border-amber-600/30 p-5 shadow-inner flex flex-col items-center justify-center">
        <div 
          onClick={handleRoll}
          className={`relative w-28 h-28 flex items-center justify-center cursor-pointer select-none transition-all duration-300 transform ${rolling ? 'scale-110 rotate-180 animate-spin' : 'hover:scale-105 active:scale-95'}`}
          title="Click to roll d20"
        >
          {/* Crisp geometric d20 die */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <polygon 
              points="50,5 90,25 90,75 50,95 10,75 10,25" 
              fill="#091823" 
              stroke={isNat20 ? '#10b981' : isNat1 ? '#ef4444' : '#f59e0b'} 
              strokeWidth="3.5"
            />
            {/* Geometric facet lines */}
            <line x1="50" y1="5" x2="50" y2="95" stroke="#254254" strokeWidth="1.5" />
            <line x1="10" y1="25" x2="90" y2="75" stroke="#254254" strokeWidth="1.5" />
            <line x1="10" y1="75" x2="90" y2="25" stroke="#254254" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="22" fill="#040e16" stroke={isNat20 ? '#10b981' : isNat1 ? '#ef4444' : '#d97706'} strokeWidth="1.5" />
          </svg>

          {/* Roll Number in Center */}
          <span className={`absolute font-display font-black text-3xl z-10 ${isNat20 ? 'text-emerald-400 animate-pulse' : isNat1 ? 'text-red-400' : 'text-amber-100'}`}>
            {rollValue !== null ? rollValue : '20'}
          </span>
        </div>

        {/* Roll Button */}
        <button
          onClick={handleRoll}
          disabled={rolling}
          className="mt-4 w-full py-3 px-4 rounded-xl font-sans font-bold text-sm tracking-wide uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 active:translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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
            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-100' 
            : 'bg-red-950/70 border-red-500/50 text-red-100'
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
            {totalModifier !== 0 && (
              <span> {totalModifier > 0 ? `+ ${totalModifier}` : `- ${Math.abs(totalModifier)}`}</span>
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

      {/* Recent Rolls History */}
      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-900/40">
          <span className="block text-[11px] font-mono uppercase tracking-wider text-amber-300/80 mb-1.5">
            Recent Investigation Rolls:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
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
                {h.hasProcedureBonus && <span className="text-[10px] text-amber-300 ml-1">(+3 SOP)</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
