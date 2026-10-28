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

// Brass corner bracket hardware component
export const BrassCornerBracket: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br' }> = ({ position }) => {
  const posClasses = {
    tl: 'top-1.5 left-1.5',
    tr: 'top-1.5 right-1.5',
    bl: 'bottom-1.5 left-1.5',
    br: 'bottom-1.5 right-1.5'
  }[position];

  const rotation = {
    tl: 'rotate-0',
    tr: 'rotate-90',
    br: 'rotate-180',
    bl: '-rotate-90'
  }[position];

  return (
    <div className={`absolute ${posClasses} w-5 h-5 pointer-events-none z-20 ${rotation}`}>
      <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow">
        <path
          d="M2 2h18v4H6v14H2V2z"
          fill="url(#brassBracketGrad)"
          stroke="#451a03"
          strokeWidth="0.75"
        />
        <circle cx="4" cy="4" r="1.5" fill="#fef3c7" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="16" cy="4" r="1.2" fill="#fef3c7" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="4" cy="16" r="1.2" fill="#fef3c7" stroke="#78350f" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

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
    <div className={`relative rounded-3xl p-4 bg-gradient-to-b from-galley-800 via-galley-850 to-galley-950 border-4 border-brass-700/80 shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.1)] overflow-hidden ${className}`}>
      {/* SVG Defs for Brass Shaders */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <linearGradient id="brassBracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="d20GalleyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#082f3d" />
            <stop offset="45%" stopColor="#041e28" />
            <stop offset="100%" stopColor="#2a1b10" />
          </linearGradient>
        </defs>
      </svg>

      {/* 4 Brass Corner Reinforcement Brackets */}
      <BrassCornerBracket position="tl" />
      <BrassCornerBracket position="tr" />
      <BrassCornerBracket position="bl" />
      <BrassCornerBracket position="br" />

      {/* Tray Header Bar */}
      <div className="flex justify-between items-center border-b-2 border-brass-700/50 pb-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-brass-700/80 border border-brass-400/60 flex items-center justify-center text-galley-950 shadow-xs">
            <Dices className="w-4 h-4 text-brass-200" />
          </div>
          <h3 className="font-display font-black text-brass-100 text-sm tracking-wider uppercase drop-shadow">
            GALLEY DICE TRAY // d20
          </h3>
        </div>
        <button
          onClick={toggleAudio}
          className="p-1 rounded-lg text-brass-400/80 hover:text-brass-200 hover:bg-galley-800 transition-colors"
          title={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-barnacle-400" /> : <Volume2 className="w-4 h-4 text-kelp-400" />}
        </button>
      </div>

      {currentProcedureName && (
        <div className="mb-3 text-center text-xs font-mono text-marine-200 bg-marine-950/80 border border-marine-500/40 py-1.5 px-2.5 rounded-xl shadow-inner">
          <span className="text-parchment-300">Armed Procedure:</span> <strong className="text-brass-300 font-display">{currentProcedureName}</strong>
        </div>
      )}

      {/* Target & Modifier Mechanical Dials */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Target DC Dial */}
        <div className="bg-galley-950/90 border border-brass-700/60 rounded-xl p-2 text-center shadow-inner relative">
          <label className="block text-[9px] font-mono uppercase tracking-widest text-brass-300/90 font-bold mb-1">
            TARGET DC CHECK
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setTarget(prev => Math.max(8, prev - 1))}
              className="w-6 h-6 rounded-lg bg-galley-800 hover:bg-galley-700 border border-brass-600/40 text-brass-200 font-bold flex items-center justify-center text-xs shadow"
            >
              -
            </button>
            <span className="font-mono font-black text-base text-brass-100 w-8">{target}+</span>
            <button
              onClick={() => setTarget(prev => Math.min(20, prev + 1))}
              className="w-6 h-6 rounded-lg bg-galley-800 hover:bg-galley-700 border border-brass-600/40 text-brass-200 font-bold flex items-center justify-center text-xs shadow"
            >
              +
            </button>
          </div>
        </div>

        {/* Inject Modifier Dial */}
        <div className="bg-galley-950/90 border border-brass-700/60 rounded-xl p-2 text-center shadow-inner relative">
          <label className="block text-[9px] font-mono uppercase tracking-widest text-brass-300/90 font-bold mb-1">
            INJECT MODIFIER
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setModifier(prev => prev - 1)}
              className="w-6 h-6 rounded-lg bg-galley-800 hover:bg-galley-700 border border-brass-600/40 text-brass-200 font-bold flex items-center justify-center text-xs shadow"
            >
              -
            </button>
            <span className={`font-mono font-black text-base w-8 ${modifier > 0 ? 'text-kelp-400' : modifier < 0 ? 'text-barnacle-400' : 'text-parchment-300'}`}>
              {modifier > 0 ? `+${modifier}` : modifier}
            </span>
            <button
              onClick={() => setModifier(prev => prev + 1)}
              className="w-6 h-6 rounded-lg bg-galley-800 hover:bg-galley-700 border border-brass-600/40 text-brass-200 font-bold flex items-center justify-center text-xs shadow"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Recessed Deep Emerald / Marine Felt Rolling Arena */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#063a30] via-[#042821] to-[#021814] border-2 border-kelp-900/90 p-4 shadow-[inset_0_4px_20px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center">
        {/* Subtle Felt Texture & Compass Rose Watermark */}
        <div className="absolute inset-0 opacity-10 bg-radial from-brass-300 via-transparent to-transparent pointer-events-none" />

        <div 
          onClick={handleRoll}
          className={`relative w-28 h-28 flex items-center justify-center cursor-pointer select-none transition-all duration-300 transform ${rolling ? 'scale-110 rotate-180 animate-spin' : 'hover:scale-105 active:scale-95'}`}
        >
          {/* Hexagonal / 20-sided die polygon SVG with Nautical Brass & Marine Shading */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            <polygon 
              points="50,5 90,25 90,75 50,95 10,75 10,25" 
              fill="url(#d20GalleyGrad)" 
              stroke={isNat20 ? '#10b981' : isNat1 ? '#ef4444' : '#f59e0b'} 
              strokeWidth="3.5"
            />
            {/* Facet lines */}
            <line x1="50" y1="5" x2="50" y2="95" stroke="#f59e0b" strokeWidth="1.2" opacity="0.6" />
            <line x1="10" y1="25" x2="90" y2="75" stroke="#f59e0b" strokeWidth="1.2" opacity="0.6" />
            <line x1="10" y1="75" x2="90" y2="25" stroke="#f59e0b" strokeWidth="1.2" opacity="0.6" />
            <circle cx="50" cy="50" r="24" fill="rgba(0,0,0,0.4)" stroke="#b45309" strokeWidth="0.8" opacity="0.5" />
          </svg>

          {/* Roll Number in Center */}
          <span className={`absolute font-display font-black text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10 ${isNat20 ? 'text-kelp-400 animate-pulse' : isNat1 ? 'text-barnacle-400' : 'text-brass-100'}`}>
            {rollValue !== null ? rollValue : '20'}
          </span>
        </div>

        {/* Heavy Brass Roll Lever Button */}
        <button
          onClick={handleRoll}
          disabled={rolling}
          className="mt-3 w-full py-2.5 px-4 rounded-xl font-display font-black text-xs sm:text-sm tracking-widest uppercase bg-gradient-to-r from-brass-600 via-brass-500 to-brass-400 hover:from-brass-500 hover:to-brass-300 text-galley-950 shadow-[0_4px_15px_rgba(245,158,11,0.35)] active:translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-2 border border-brass-200"
        >
          {rolling ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-galley-950" />
              Rolling Nautical Die...
            </>
          ) : (
            <>
              <Dices className="w-4 h-4 text-galley-950" />
              Roll Incident d20
            </>
          )}
        </button>
      </div>

      {/* Outcome Banner */}
      {rollValue !== null && !rolling && (
        <div className={`mt-3 p-3 rounded-xl border text-center font-mono shadow-lg ${
          isSuccess 
            ? 'bg-kelp-950/80 border-kelp-500/60 text-kelp-200' 
            : 'bg-barnacle-950/80 border-barnacle-500/60 text-barnacle-200'
        }`}>
          <div className="flex items-center justify-center gap-1.5 font-display font-bold text-sm mb-0.5">
            {isNat20 ? (
              <>
                <Sparkles className="w-4 h-4 text-kelp-300 animate-spin" />
                <span className="tracking-wide">NATURAL 20! CRITICAL SUCCESS!</span>
              </>
            ) : isNat1 ? (
              <>
                <AlertOctagon className="w-4 h-4 text-barnacle-400 animate-bounce" />
                <span className="tracking-wide">NATURAL 1! BARNACLE BLUNDER!</span>
              </>
            ) : isSuccess ? (
              <span className="tracking-wide">PROCEDURE CHECK SUCCESSFUL!</span>
            ) : (
              <span className="tracking-wide">CHECK FAILED — BOILER STRIKE!</span>
            )}
          </div>

          <div className="text-xs text-parchment-200">
            Roll: <span className="font-bold text-white">{rollValue}</span>
            {modifier !== 0 && (
              <span> {modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`}</span>
            )}
            {' = '}
            <span className="font-bold text-white">{total}</span>
            {' vs '}
            <span className="font-bold text-brass-300">Target {target}</span>
            {' ('}
            <span className={margin >= 0 ? 'text-kelp-300 font-bold' : 'text-barnacle-300 font-bold'}>
              {margin >= 0 ? `+${margin} margin` : `${margin} margin`}
            </span>
            {')'}
          </div>
        </div>
      )}

      {/* Recent Rolls History Stamped as Brass Tokens */}
      {history.length > 0 && (
        <div className="mt-3 pt-2 border-t border-brass-700/40">
          <span className="block text-[9px] font-mono uppercase tracking-widest text-parchment-400 mb-1">
            Recent Tosses:
          </span>
          <div className="flex gap-1.5 overflow-x-auto">
            {history.map((h, i) => (
              <div 
                key={i} 
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap border ${
                  h.success 
                    ? 'bg-kelp-950/80 border-kelp-500/40 text-kelp-300' 
                    : 'bg-barnacle-950/80 border-barnacle-500/40 text-barnacle-300'
                }`}
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
