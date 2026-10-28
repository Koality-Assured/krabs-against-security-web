import React, { useState, useMemo } from 'react';
import { CardData, DeckType } from '../types/card';
import { Card } from './Card';
import { DiceRoller } from './DiceRoller';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Flame, 
  Plus, 
  Minus, 
  Shuffle, 
  AlertTriangle, 
  ShieldCheck, 
  Trophy, 
  Skull,
  BookOpen
} from 'lucide-react';

interface TabletopBoardProps {
  allCards: CardData[];
  onOpenCatalog?: () => void;
}

interface ScenarioSlot {
  deck: DeckType;
  title: string;
  card: CardData | null;
  revealed: boolean;
  contained: boolean;
}

export const TabletopBoard: React.FC<TabletopBoardProps> = ({ allCards }) => {
  // Strikes counter (0 to 10)
  const [strikes, setStrikes] = useState<number>(0);
  const [facilitatorMode, setFacilitatorMode] = useState<boolean>(false);
  const [activeInjects, setActiveInjects] = useState<CardData[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<CardData | null>(null);
  const [activeCheckTarget, setActiveCheckTarget] = useState<number>(11);
  const [logMessages, setLogMessages] = useState<string[]>([
    "Krusty Krab SOC Incident Response Console initialized.",
    "Threat level: ELEVATED. Plankton APT-Chum activity detected in sector 4."
  ]);

  // Attack decks and procedure/inject pools
  const icCards = useMemo(() => allCards.filter(c => c.deck === 'initial_compromise'), [allCards]);
  const peCards = useMemo(() => allCards.filter(c => c.deck === 'pivot_escalate'), [allCards]);
  const pCards = useMemo(() => allCards.filter(c => c.deck === 'persistence'), [allCards]);
  const c2Cards = useMemo(() => allCards.filter(c => c.deck === 'c2_exfil'), [allCards]);
  const procCards = useMemo(() => allCards.filter(c => c.deck === 'procedures'), [allCards]);
  const injCards = useMemo(() => allCards.filter(c => c.deck === 'injects'), [allCards]);

  // Scenario slots (4 face-down attack vectors)
  const [scenario, setScenario] = useState<ScenarioSlot[]>(() => {
    return [
      { deck: 'initial_compromise', title: '1. Initial Compromise', card: null, revealed: false, contained: false },
      { deck: 'pivot_escalate', title: '2. Pivot & Escalate', card: null, revealed: false, contained: false },
      { deck: 'persistence', title: '3. Persistence', card: null, revealed: false, contained: false },
      { deck: 'c2_exfil', title: '4. C2 & Exfiltration', card: null, revealed: false, contained: false },
    ];
  });

  // Deal random new scenario
  const dealNewScenario = () => {
    if (icCards.length === 0) return;

    sound.playCardFlip();
    const getRandom = (arr: CardData[]) => arr[Math.floor(Math.random() * arr.length)];

    setScenario([
      { deck: 'initial_compromise', title: '1. Initial Compromise', card: getRandom(icCards), revealed: false, contained: false },
      { deck: 'pivot_escalate', title: '2. Pivot & Escalate', card: getRandom(peCards), revealed: false, contained: false },
      { deck: 'persistence', title: '3. Persistence', card: getRandom(pCards), revealed: false, contained: false },
      { deck: 'c2_exfil', title: '4. C2 & Exfiltration', card: getRandom(c2Cards), revealed: false, contained: false },
    ]);

    setStrikes(0);
    setActiveInjects([]);
    setLogMessages([
      "New incident scenario generated. 4 breach vectors armed face-down.",
      "Defenders: Choose a defensive procedure and roll d20 to investigate."
    ]);
  };

  // Initialize on first mount if not armed
  React.useEffect(() => {
    if (scenario[0].card === null && icCards.length > 0) {
      dealNewScenario();
    }
  }, [icCards]);

  // Toggle reveal state of a card slot
  const toggleReveal = (index: number) => {
    sound.playCardFlip();
    setScenario(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], revealed: !copy[index].revealed };
      return copy;
    });

    const targetSlot = scenario[index];
    if (!targetSlot.revealed && targetSlot.card) {
      addLog(`REVEALED: ${targetSlot.title} — ${targetSlot.card.title}`);
    }
  };

  // Toggle contained state of a card slot
  const toggleContained = (index: number) => {
    sound.playClick();
    setScenario(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], contained: !copy[index].contained };
      return copy;
    });

    const targetSlot = scenario[index];
    if (!targetSlot.contained && targetSlot.card) {
      addLog(`CONTAINED: ${targetSlot.title} (${targetSlot.card.title}) neutralized!`);
      // Check win condition
      const allContained = scenario.every((s, i) => i === index ? true : s.contained);
      if (allContained) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24']
        });
        addLog("VICTORY! All 4 breach phases neutralized! The Krabby Patty Formula is SAFE!");
      }
    }
  };

  // Add strike
  const addStrike = () => {
    if (strikes >= 10) return;
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    sound.playStrikeKlaxon();
    addLog(`STRIKE ADDED! Total strikes: ${newStrikes}/10`);

    // Automatic inject trigger on strikes 2, 4, 6, 8
    if (newStrikes % 2 === 0 && injCards.length > 0) {
      drawInject();
    }

    if (newStrikes >= 10) {
      addLog("DEFEAT! Strike threshold reached (10/10). Plankton extracted the Secret Formula!");
    }
  };

  // Remove strike
  const removeStrike = () => {
    if (strikes <= 0) return;
    setStrikes(prev => prev - 1);
    sound.playClick();
    addLog(`STRIKE REMOVED. Total strikes: ${strikes - 1}/10`);
  };

  // Draw random inject
  const drawInject = () => {
    if (injCards.length === 0) return;
    sound.playCardFlip();
    const available = injCards.filter(inj => !activeInjects.some(a => a.id === inj.id));
    const pool = available.length > 0 ? available : injCards;
    const drawn = pool[Math.floor(Math.random() * pool.length)];

    setActiveInjects(prev => [drawn, ...prev]);
    addLog(`INJECT DETONATED: [${drawn.title}] — ${drawn.injectEffect}`);
  };

  // Discard inject
  const dismissInject = (id: string) => {
    sound.playClick();
    setActiveInjects(prev => prev.filter(inj => inj.id !== id));
    addLog(`Inject [${id}] resolved and cleared from active status.`);
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogMessages(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 40)]);
  };

  // When dice roll completes
  const handleRollComplete = (roll: number, total: number, isSuccess: boolean, margin: number) => {
    const procName = selectedProcedure ? selectedProcedure.title : "Investigation";
    if (isSuccess) {
      addLog(`ROLL SUCCESS: ${procName} rolled ${roll} (total ${total} vs ${activeCheckTarget}). Margin: +${margin}`);
    } else {
      addLog(`ROLL FAILED: ${procName} rolled ${roll} (total ${total} vs ${activeCheckTarget}). Adding 1 strike.`);
      addStrike();
    }
  };

  // Check win/loss status
  const allNeutralized = scenario.every(s => s.contained);
  const isGameOver = strikes >= 10;

  return (
    <div className="space-y-6">
      {/* Top Banner / Tabletop Controls */}
      <div className="bg-gradient-to-r from-ocean-900 via-ocean-800 to-ocean-900 border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="font-serif font-bold text-lg text-amber-100 tracking-wide">
              KRUSTY KRAB INCIDENT RESPONSE TABLETOP
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300 mt-0.5">
            Tabletop Simulator Mode • NIST SP 800-61r2 Active Triage Console
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Facilitator Mode Toggle */}
          <button
            onClick={() => setFacilitatorMode(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all border ${facilitatorMode ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30' : 'bg-ocean-950 text-amber-200 border-amber-500/30 hover:bg-ocean-800'}`}
          >
            {facilitatorMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Facilitator Secret View: {facilitatorMode ? 'ON' : 'OFF'}
          </button>

          {/* New Incident Scenario */}
          <button
            onClick={dealNewScenario}
            className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-ocean-700 hover:bg-ocean-600 text-white border border-ocean-500/50 flex items-center gap-1.5 shadow"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-300" />
            Deal New Breach
          </button>

          {/* Draw Inject */}
          <button
            onClick={drawInject}
            className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/50 flex items-center gap-1.5 shadow"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-emerald-300" />
            Draw Inject
          </button>
        </div>
      </div>

      {/* Win / Loss Banners */}
      {allNeutralized && (
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-2 border-emerald-400 p-4 rounded-2xl shadow-2xl flex items-center justify-between text-emerald-100 animate-bounce">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="font-serif font-bold text-lg text-emerald-200">
                VICTORY! THE SECRET FORMULA IS SECURED!
              </h3>
              <p className="font-mono text-xs text-emerald-300">
                All four attack phases identified and contained with {10 - strikes} strikes to spare!
              </p>
            </div>
          </div>
          <button
            onClick={dealNewScenario}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl font-mono text-xs"
          >
            Play Next Incident
          </button>
        </div>
      )}

      {isGameOver && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-2 border-red-500 p-4 rounded-2xl shadow-2xl flex items-center justify-between text-red-100">
          <div className="flex items-center gap-3">
            <Skull className="w-8 h-8 text-red-400 animate-pulse" />
            <div>
              <h3 className="font-serif font-bold text-lg text-red-200">
                CRUSTACEAN CATASTROPHE! 10 STRIKES REACHED!
              </h3>
              <p className="font-mono text-xs text-red-300">
                Plankton has successfully exfiltrated the Krabby Patty Secret Formula to the Chum Bucket.
              </p>
            </div>
          </div>
          <button
            onClick={dealNewScenario}
            className="px-4 py-2 bg-red-500 hover:bg-red-400 text-slate-950 font-bold rounded-xl font-mono text-xs"
          >
            Reset Incident
          </button>
        </div>
      )}

      {/* Strike Doom Clock Tracker */}
      <div className="bg-ocean-900/90 border-2 border-amber-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${strikes >= 7 ? 'text-red-500 animate-pulse' : strikes >= 4 ? 'text-amber-500' : 'text-emerald-400'}`} />
            <h3 className="font-serif font-bold text-amber-100 text-sm">
              STRIKE DOOM TRACKER: <span className="font-mono font-extrabold">{strikes} / 10</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={removeStrike}
              disabled={strikes <= 0}
              className="p-1 rounded bg-ocean-800 hover:bg-ocean-700 disabled:opacity-40 text-amber-300 font-bold"
              title="Remove strike"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={addStrike}
              disabled={strikes >= 10}
              className="p-1 rounded bg-red-800 hover:bg-red-700 disabled:opacity-40 text-red-100 font-bold"
              title="Add strike"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 10 Krabby Patty Strike Nodes */}
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: 10 }).map((_, i) => {
            const isFilled = i < strikes;
            const isDanger = i >= 7;
            return (
              <div
                key={i}
                className={`h-10 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 ${isFilled ? (isDanger ? 'bg-red-700 border-red-400 shadow-md shadow-red-500/40 text-white' : 'bg-amber-600 border-amber-300 shadow-md shadow-amber-500/30 text-white') : 'bg-ocean-950/70 border-slate-700 text-slate-500'}`}
              >
                <span className="font-mono text-xs font-bold">{i + 1}</span>
                {isFilled ? (
                  <span className="text-[10px]">🔥</span>
                ) : (
                  <span className="text-[8px] font-mono opacity-50">PATTY</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mt-2">
          <span>0 Strikes: Nominal Security</span>
          <span>4 Strikes: Plankton Inject Trigger</span>
          <span className="text-red-400 font-bold">10 Strikes: Formula Stolen</span>
        </div>
      </div>

      {/* Main Board: 4 Secret Scenario Attack Slots */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-bold text-amber-100 text-sm">
              ACTIVE BREACH SCENARIO SLOTS (THE ATTACK CHAIN)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click card to flip / reveal telemetry • Mark contained upon eradication
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenario.map((slot, idx) => {
            const isCardRevealed = slot.revealed || facilitatorMode;
            return (
              <div 
                key={idx} 
                className={`relative flex flex-col items-center bg-ocean-900/60 border-2 rounded-2xl p-3 shadow-lg transition-all ${slot.contained ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700'}`}
              >
                <div className="w-full flex justify-between items-center mb-2 px-1 text-xs font-mono">
                  <span className="font-bold text-amber-300">{slot.title}</span>
                  {slot.contained && (
                    <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      CONTAINED
                    </span>
                  )}
                </div>

                {/* Card Container with 3D Flip */}
                <div className="relative group w-full flex justify-center">
                  {slot.card ? (
                    <Card
                      card={slot.card}
                      isBack={!isCardRevealed}
                      size="md"
                      interactive={true}
                      onClick={() => toggleReveal(idx)}
                      className={slot.contained ? 'opacity-80' : ''}
                    />
                  ) : (
                    <div className="w-64 h-[358px] rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-mono text-xs">
                      No card dealt
                    </div>
                  )}

                  {/* Facilitator Peeking Indicator */}
                  {!slot.revealed && facilitatorMode && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-black px-2 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-md z-30">
                      Facilitator Peek
                    </div>
                  )}
                </div>

                {/* Slot Control Actions */}
                <div className="w-full flex justify-between gap-2 mt-3 pt-2 border-t border-slate-700/60">
                  <button
                    onClick={() => toggleReveal(idx)}
                    className="flex-1 py-1 px-2 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-200 font-mono text-[11px] font-semibold border border-slate-600"
                  >
                    {slot.revealed ? 'Hide Face' : 'Reveal Face'}
                  </button>
                  <button
                    onClick={() => toggleContained(idx)}
                    className={`py-1 px-2.5 rounded-lg font-mono text-[11px] font-bold border transition-colors ${slot.contained ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-ocean-950 hover:bg-emerald-900/60 border-emerald-600/40 text-emerald-300'}`}
                  >
                    {slot.contained ? 'Neutralized' : 'Contain'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Section: Procedures & Dice Roller & Active Injects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Defensive Procedure Selector */}
        <div className="bg-ocean-900/80 border border-slate-700 rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-serif font-bold text-amber-100 text-sm">
              AVAILABLE PROCEDURES
            </h3>
            <span className="font-mono text-[10px] text-sky-300">Click to arm die</span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {procCards.map(proc => {
              const isSelected = selectedProcedure?.id === proc.id;
              const primaryTarget = proc.checks?.[0]?.target || 11;
              return (
                <div
                  key={proc.id}
                  onClick={() => {
                    setSelectedProcedure(proc);
                    setActiveCheckTarget(primaryTarget);
                    sound.playClick();
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-sky-950 border-sky-400 shadow-md ring-1 ring-sky-400' : 'bg-ocean-950/60 border-slate-800 hover:border-sky-600/50'}`}
                >
                  <div className="flex justify-between items-start gap-1 mb-1">
                    <span className="font-serif font-bold text-xs text-sky-200">{proc.title}</span>
                    <span className="font-mono text-[10px] bg-sky-900 text-sky-200 font-bold px-1.5 py-0.2 rounded">
                      DC {primaryTarget}+
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-400 line-clamp-2">
                    {proc.description}
                  </p>
                  {proc.checks && proc.checks.length > 1 && (
                    <div className="mt-1 flex gap-2 text-[9px] font-mono text-sky-400">
                      <span>Secondary check: {proc.checks[1].target}+ ({proc.checks[1].description})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: d20 Dice Roller */}
        <div>
          <DiceRoller
            currentTarget={activeCheckTarget}
            currentProcedureName={selectedProcedure ? selectedProcedure.title : undefined}
            onRollComplete={handleRollComplete}
          />
        </div>

        {/* Right Column: Active Injects & Incident Telemetry Log */}
        <div className="space-y-4">
          {/* Active Injects Drawer */}
          <div className="bg-ocean-900/80 border border-slate-700 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-serif font-bold text-emerald-200 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-emerald-400" />
                ACTIVE OPERATIONAL INJECTS ({activeInjects.length})
              </h3>
            </div>

            {activeInjects.length === 0 ? (
              <div className="p-3 text-center font-mono text-xs text-slate-500 bg-ocean-950/60 rounded-xl border border-slate-800">
                No active injects. Ocean waters remain calm.
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {activeInjects.map(inj => (
                  <div key={inj.id} className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-serif font-bold text-emerald-200">{inj.title}</span>
                      <button
                        onClick={() => dismissInject(inj.id)}
                        className="text-[9px] font-mono bg-emerald-900 hover:bg-emerald-800 text-white px-1.5 py-0.5 rounded"
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="font-mono text-[10px] text-emerald-300 mt-1 font-semibold">
                      {inj.injectEffect}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incident Telemetry Log */}
          <div className="bg-ocean-950 border border-slate-800 rounded-2xl p-3 shadow-inner">
            <div className="flex justify-between items-center mb-1 text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-1">
              <span>INCIDENT RESPONSE AUDIT LOG</span>
              <button 
                onClick={() => setLogMessages(["Log cleared."])} 
                className="text-[9px] hover:text-amber-300 flex items-center gap-0.5"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Clear
              </button>
            </div>
            <div className="font-mono text-[10px] text-slate-300 space-y-1 max-h-[140px] overflow-y-auto pr-1">
              {logMessages.map((msg, i) => (
                <div key={i} className="leading-tight">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
