import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CardData, DeckType, ScenarioData } from '../types/card';
import scenariosData from '../data/scenarios.json';
import { Card } from './Card';
import { DiceRoller } from './DiceRoller';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Plus, 
  Minus, 
  Shuffle, 
  AlertTriangle, 
  ShieldCheck, 
  Trophy, 
  Skull,
  BookOpen,
  HelpCircle,
  X,
  Target,
  Activity,
  ScrollText,
  Compass,
  CheckCircle2
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

type LogType = 'SYSTEM' | 'INVESTIGATION' | 'INJECT' | 'STRIKE' | 'CONTAINED';

interface LogEntry {
  id: string;
  type: LogType;
  timestamp: string;
  message: string;
}

export const TabletopBoard: React.FC<TabletopBoardProps> = ({ allCards }) => {
  // Strikes counter (0 to 10) representing boiler pressure / incident strikes
  const [strikes, setStrikes] = useState<number>(0);
  const [facilitatorMode, setFacilitatorMode] = useState<boolean>(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('random');
  const [showQuickRules, setShowQuickRules] = useState<boolean>(false);
  const [activeInjects, setActiveInjects] = useState<CardData[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<CardData | null>(null);
  const [activeCheckTarget, setActiveCheckTarget] = useState<number>(11);
  const [activeCheckLabel, setActiveCheckLabel] = useState<string>('Detection (DC 11+)');
  const [activeCheckIndex, setActiveCheckIndex] = useState<number>(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([
    {
      id: 'log-1',
      type: 'SYSTEM',
      timestamp: '00:00:01',
      message: 'Krusty Krab SOC Incident Console initialized. NIST SP 800-61r2 active.'
    },
    {
      id: 'log-2',
      type: 'SYSTEM',
      timestamp: '00:00:02',
      message: 'Threat Telemetry: APT-Chum active breach vectors detected in kitchen perimeter.'
    },
    {
      id: 'log-3',
      type: 'INVESTIGATION',
      timestamp: '00:00:03',
      message: 'Defenders: Select an investigative S.O.P. and roll d20 to inspect breach vectors.'
    }
  ]);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Attack decks and procedure/inject pools
  const icCards = useMemo(() => allCards.filter(c => c.deck === 'initial_compromise'), [allCards]);
  const peCards = useMemo(() => allCards.filter(c => c.deck === 'pivot_escalate'), [allCards]);
  const pCards = useMemo(() => allCards.filter(c => c.deck === 'persistence'), [allCards]);
  const c2Cards = useMemo(() => allCards.filter(c => c.deck === 'c2_exfil'), [allCards]);
  const procCards = useMemo(() => allCards.filter(c => c.deck === 'procedures'), [allCards]);
  const injCards = useMemo(() => allCards.filter(c => c.deck === 'injects'), [allCards]);

  const activeScenarioMeta = useMemo(() => {
    if (selectedScenarioId === 'random') return null;
    return (scenariosData as ScenarioData[]).find(s => s.id === selectedScenarioId) || null;
  }, [selectedScenarioId]);

  // Scenario slots (4 face-down attack vectors)
  const [scenario, setScenario] = useState<ScenarioSlot[]>(() => {
    return [
      { deck: 'initial_compromise', title: '1. Initial Compromise', card: null, revealed: false, contained: false },
      { deck: 'pivot_escalate', title: '2. Pivot & Escalate', card: null, revealed: false, contained: false },
      { deck: 'persistence', title: '3. Persistence', card: null, revealed: false, contained: false },
      { deck: 'c2_exfil', title: '4. C2 & Exfiltration', card: null, revealed: false, contained: false },
    ];
  });

  const addLog = (type: LogType, message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      timestamp,
      message
    };
    setLogEntries(prev => [newEntry, ...prev.slice(0, 49)]);
  };

  // Load a preset scenario or randomize
  const loadScenario = (scenarioId: string) => {
    if (scenarioId === 'random') {
      setSelectedScenarioId('random');
      dealNewScenario();
      return;
    }

    const preset = (scenariosData as ScenarioData[]).find(s => s.id === scenarioId);
    if (!preset) return;

    sound.playCardFlip();
    setSelectedScenarioId(scenarioId);

    const ic = icCards.find(c => c.id === preset.scenario_cards.initial_compromise) || icCards[0];
    const pe = peCards.find(c => c.id === preset.scenario_cards.pivot_escalate) || peCards[0];
    const p = pCards.find(c => c.id === preset.scenario_cards.persistence) || pCards[0];
    const c2 = c2Cards.find(c => c.id === preset.scenario_cards.c2_exfil) || c2Cards[0];

    setScenario([
      { deck: 'initial_compromise', title: '1. Initial Compromise', card: ic, revealed: false, contained: false },
      { deck: 'pivot_escalate', title: '2. Pivot & Escalate', card: pe, revealed: false, contained: false },
      { deck: 'persistence', title: '3. Persistence', card: p, revealed: false, contained: false },
      { deck: 'c2_exfil', title: '4. C2 & Exfiltration', card: c2, revealed: false, contained: false },
    ]);

    const initialStrikes = preset.special_rules.includes('begin with 1 strike') ? 1 : 0;
    setStrikes(initialStrikes);
    setActiveInjects([]);
    
    addLog('SYSTEM', `Campaign loaded: [${preset.id}] ${preset.title} (${preset.difficulty})`);
    addLog('SYSTEM', `Briefing: ${preset.briefing}`);
    if (preset.special_rules) {
      addLog('SYSTEM', `Standing Orders: ${preset.special_rules}`);
    }
  };

  // Deal random new scenario
  const dealNewScenario = () => {
    if (icCards.length === 0) return;

    sound.playCardFlip();
    setSelectedScenarioId('random');
    const getRandom = (arr: CardData[]) => arr[Math.floor(Math.random() * arr.length)];

    setScenario([
      { deck: 'initial_compromise', title: '1. Initial Compromise', card: getRandom(icCards), revealed: false, contained: false },
      { deck: 'pivot_escalate', title: '2. Pivot & Escalate', card: getRandom(peCards), revealed: false, contained: false },
      { deck: 'persistence', title: '3. Persistence', card: getRandom(pCards), revealed: false, contained: false },
      { deck: 'c2_exfil', title: '4. C2 & Exfiltration', card: getRandom(c2Cards), revealed: false, contained: false },
    ]);

    setStrikes(0);
    setActiveInjects([]);
    addLog('SYSTEM', 'Random breach scenario armed. 4 kill-chain attack vectors face down.');
  };

  // Initialize on first mount if not armed
  useEffect(() => {
    if (scenario[0].card === null && icCards.length > 0) {
      dealNewScenario();
    }
  }, [icCards]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        setFacilitatorMode(prev => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        dealNewScenario();
      } else if (e.key === '?') {
        setShowQuickRules(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      addLog('INVESTIGATION', `Vector shutter opened: ${targetSlot.title} — ${targetSlot.card.title}`);
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
      addLog('CONTAINED', `Vector neutralized: ${targetSlot.title} (${targetSlot.card.title}) secured!`);
      // Check win condition
      const allContained = scenario.every((s, i) => i === index ? true : s.contained);
      if (allContained) {
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#ffd166']
        });
        addLog('SYSTEM', 'VICTORY! All 4 breach vectors neutralized! The Krabby Patty Secret Formula is PRESERVED!');
      }
    }
  };

  // Add strike
  const addStrike = () => {
    if (strikes >= 10) return;
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    sound.playStrikeKlaxon();
    addLog('STRIKE', `Strike recorded! Current pressure: ${newStrikes}/10 Strikes (${newStrikes * 10} PSI).`);

    // Automatic inject trigger on strikes 2, 4, 6, 8
    if (newStrikes % 2 === 0 && injCards.length > 0) {
      drawInject();
    }

    if (newStrikes >= 10) {
      addLog('STRIKE', 'CRITICAL OVERPRESSURE! 10/10 Strikes reached. Boiler blowout! Plankton extracted the Secret Formula!');
    }
  };

  // Remove strike
  const removeStrike = () => {
    if (strikes <= 0) return;
    setStrikes(prev => prev - 1);
    sound.playClick();
    addLog('SYSTEM', `Strike cleared. Pressure relieved to ${strikes - 1}/10 Strikes (${(strikes - 1) * 10} PSI).`);
  };

  // Draw random inject
  const drawInject = () => {
    if (injCards.length === 0) return;
    sound.playCardFlip();
    const available = injCards.filter(inj => !activeInjects.some(a => a.id === inj.id));
    const pool = available.length > 0 ? available : injCards;
    const drawn = pool[Math.floor(Math.random() * pool.length)];

    setActiveInjects(prev => [drawn, ...prev]);
    addLog('INJECT', `HAZARD INJECT DETONATED: [${drawn.title}] — ${drawn.injectEffect}`);
  };

  // Dismiss inject
  const dismissInject = (id: string) => {
    sound.playClick();
    setActiveInjects(prev => prev.filter(inj => inj.id !== id));
    addLog('SYSTEM', `Inject resolved: [${id}] cleared.`);
  };

  // Select procedure and default its check target
  const handleSelectProcedure = (proc: CardData) => {
    setSelectedProcedure(proc);
    sound.playClick();
    if (proc.checks && proc.checks.length > 0) {
      setActiveCheckTarget(proc.checks[0].target);
      setActiveCheckIndex(0);
      setActiveCheckLabel(`Detection (DC ${proc.checks[0].target}+)`);
    } else {
      setActiveCheckTarget(11);
      setActiveCheckIndex(0);
      setActiveCheckLabel('Procedure Check (DC 11+)');
    }
    addLog('INVESTIGATION', `S.O.P. Armed: ${proc.title}. Select roll target.`);
  };

  // Select specific check inside armed procedure
  const handleSelectCheck = (targetDc: number, checkIndex: number, checkDesc: string, checkType: 'Detection' | 'Containment') => {
    setActiveCheckTarget(targetDc);
    setActiveCheckIndex(checkIndex);
    setActiveCheckLabel(`${checkType} (DC ${targetDc}+)`);
    sound.playClick();
    addLog('INVESTIGATION', `Armed check: Roll for ${checkType} (DC ${targetDc}+) &bull; ${checkDesc}`);
  };

  // When dice roll completes
  const handleRollComplete = (roll: number, total: number, isSuccess: boolean, margin: number) => {
    const procName = selectedProcedure ? selectedProcedure.title : "Investigation";
    if (isSuccess) {
      addLog('INVESTIGATION', `${procName} [${activeCheckLabel}] check SUCCEEDED: rolled ${roll} (total ${total} vs DC ${activeCheckTarget}, margin +${margin}).`);
    } else {
      addLog('STRIKE', `${procName} [${activeCheckLabel}] check FAILED: rolled ${roll} (total ${total} vs DC ${activeCheckTarget}). Adding 1 Strike!`);
      addStrike();
    }
  };

  // Win/Loss status
  const allNeutralized = scenario.every(s => s.contained);
  const isGameOver = strikes >= 10;

  // Pressure gauge tier
  const isNominal = strikes <= 3;
  const isBuildup = strikes >= 4 && strikes <= 7;
  const isCritical = strikes >= 8 && strikes <= 9;
  const isBlowout = strikes >= 10;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP INCIDENT RESPONSE HEADER & MASTER CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-galley-950/85 border border-amber-900/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-brass-glow" />
              <h2 className="font-display font-black text-lg sm:text-xl text-amber-100 uppercase tracking-wider">
                Incident Response Tabletop &bull; Triage Console
              </h2>
            </div>
            <p className="text-xs font-mono text-amber-200/70 mt-0.5">
              Krusty Galley Tactical Operations &bull; NIST SP 800-61r2 &amp; Backdoors &amp; Breaches Engine
            </p>
          </div>

          {/* Switchboard Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Scenario Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-600/30 shadow-inner">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedScenarioId}
                onChange={(e) => loadScenario(e.target.value)}
                className="bg-transparent text-xs font-sans font-semibold text-amber-100 outline-none cursor-pointer"
              >
                <option value="random" className="bg-slate-950 text-slate-200">Random Breach Scenario</option>
                {(scenariosData as ScenarioData[]).map(sc => (
                  <option key={sc.id} value={sc.id} className="bg-slate-950 text-slate-200">
                    {sc.title} ({sc.difficulty})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Rules Button */}
            <button
              onClick={() => setShowQuickRules(true)}
              className="px-3 py-1.5 rounded-xl font-sans text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-200 border border-slate-700 transition-colors flex items-center gap-1.5 shadow"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              Rules Placard
            </button>

            {/* Facilitator Surveillance Mode */}
            <button
              onClick={() => setFacilitatorMode(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl font-sans text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                facilitatorMode 
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20' 
                  : 'bg-slate-950 text-slate-300 border-amber-900/40 hover:bg-slate-900'
              }`}
              title="Toggle Facilitator Peek Mode (Shortcut: F)"
            >
              {facilitatorMode ? <Eye className="w-3.5 h-3.5 text-slate-950" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              Peephole: {facilitatorMode ? 'Active' : 'Locked'}
            </button>

            {/* Deal New Breach */}
            <button
              onClick={dealNewScenario}
              className="px-3 py-1.5 rounded-xl font-sans text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow active:translate-y-0.5 transition-all"
              title="Deal New Incident Scenario (Shortcut: R)"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              Deal New Breach
            </button>

            {/* Draw Inject Button */}
            <button
              onClick={drawInject}
              className="px-3 py-1.5 rounded-xl font-sans text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow active:translate-y-0.5 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Draw Inject
            </button>
          </div>
        </div>
      </div>

      {/* Active Campaign Briefing Banner (if preset scenario is active) */}
      {activeScenarioMeta && (
        <div className="bg-galley-950/85 border border-amber-900/40 rounded-2xl p-4 shadow-xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-950 text-amber-400 border border-amber-600/30 font-bold">
                {activeScenarioMeta.id}
              </span>
              <h3 className="font-display font-bold text-amber-100 text-sm sm:text-base">
                {activeScenarioMeta.title}
              </h3>
              <span className={`text-xs font-mono px-2 py-0.5 rounded font-semibold border ${
                activeScenarioMeta.difficulty === 'Beginner' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' :
                activeScenarioMeta.difficulty === 'Intermediate' ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' :
                'bg-red-950/80 text-red-300 border-red-500/40'
              }`}>
                {activeScenarioMeta.difficulty}
              </span>
            </div>
            <button
              onClick={() => setSelectedScenarioId('random')}
              className="text-amber-300/70 hover:text-amber-300 text-xs font-mono transition-colors"
            >
              [Switch to Random]
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {activeScenarioMeta.briefing}
          </p>
          {activeScenarioMeta.special_rules && (
            <div className="bg-slate-950/90 border border-amber-900/40 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Standing Orders:</strong> {activeScenarioMeta.special_rules}</span>
            </div>
          )}
        </div>
      )}

      {/* Victory / Defeat Banners */}
      {allNeutralized && (
        <div className="bg-emerald-950/70 border-2 border-emerald-500/70 p-5 rounded-3xl shadow-2xl flex items-center justify-between text-emerald-100 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-emerald-200 tracking-wide">
                VICTORY! ALL BREACH VECTORS NEUTRALIZED!
              </h3>
              <p className="font-mono text-xs text-emerald-300 mt-0.5">
                The Secret Formula is preserved with {10 - strikes} strikes remaining ({strikes}/10 Strikes incurred).
              </p>
            </div>
          </div>
          <button
            onClick={dealNewScenario}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-colors"
          >
            Play Next Incident
          </button>
        </div>
      )}

      {isGameOver && (
        <div className="bg-red-950/70 border-2 border-red-500/70 p-5 rounded-3xl shadow-2xl flex items-center justify-between text-red-100 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-lg animate-pulse">
              <Skull className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-red-200 tracking-wide">
                INCIDENT CATASTROPHE! 10/10 STRIKES REACHED!
              </h3>
              <p className="font-mono text-xs text-red-300 mt-0.5">
                APT-Chum exfiltrated the Krabby Patty Secret Formula! Boiler pressure blown!
              </p>
            </div>
          </div>
          <button
            onClick={dealNewScenario}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-slate-950 font-sans font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-colors"
          >
            Reset Incident
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. KRUSTY GALLEY 10-STRIKE TRACKER & BOILER PRESSURE DOOM CLOCK */}
      {/* ========================================================================= */}
      <div className="rounded-3xl p-5 bg-galley-950/85 border border-amber-900/40 shadow-2xl backdrop-blur-md relative">
        {/* Brass Corner Rivets */}
        <div className="absolute top-2.5 left-2.5 brass-rivet pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 brass-rivet pointer-events-none" />

        {/* Strike Meter Header */}
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-900/40 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-amber-600/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Activity className={`w-5 h-5 ${isCritical || isBlowout ? 'text-red-400 animate-pulse' : isBuildup ? 'text-amber-400' : 'text-emerald-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm sm:text-base text-amber-100 uppercase tracking-wider">
                  Boiler Pressure &bull; Strike Tracker
                </h3>
                <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                  isNominal ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' :
                  isBuildup ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' :
                  isCritical ? 'bg-red-950/90 text-red-300 border-red-500/60 animate-pulse' :
                  'bg-red-600 text-white border-red-400 animate-pulse'
                }`}>
                  {isNominal ? 'Nominal (0-3)' : isBuildup ? 'Hazard Buildup (4-7)' : isCritical ? 'Critical (8-9)' : 'Blowout (10)'}
                </span>
              </div>
              <p className="text-xs font-mono text-amber-200/70">
                Strikes: <span className="font-bold text-amber-300">{strikes} / 10</span> &bull; Pressure: <span className="font-bold text-amber-300">{strikes * 10} PSI</span>
              </p>
            </div>
          </div>

          {/* [-] and [+] Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={removeStrike}
              disabled={strikes <= 0}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-mono text-xs font-bold border border-slate-700 flex items-center gap-1 shadow transition-all"
              title="Relieve Pressure (-1 Strike)"
            >
              <Minus className="w-3.5 h-3.5 text-slate-400" />
              <span>Vent Strike</span>
            </button>
            <button
              onClick={addStrike}
              disabled={strikes >= 10}
              className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900/80 disabled:opacity-40 text-red-200 font-mono text-xs font-bold border border-red-500/50 flex items-center gap-1 shadow transition-all"
              title="Add Incident Strike (+1 Strike)"
            >
              <Plus className="w-3.5 h-3.5 text-red-300" />
              <span>Strike +1</span>
            </button>
          </div>
        </div>

        {/* 10 Clean Pips Horizontally Arranged */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: 10 }).map((_, i) => {
            const strikeNumber = i + 1;
            const isFilled = i < strikes;
            const isDangerSegment = i >= 7 && i < 9;
            const isBlowoutSegment = i === 9;

            return (
              <div
                key={i}
                className={`h-14 rounded-2xl border flex flex-col items-center justify-between p-2 transition-all duration-200 ${
                  isFilled
                    ? isBlowoutSegment
                      ? 'bg-red-600 text-white font-bold border-red-400 ring-2 ring-red-400 animate-pulse shadow-lg shadow-red-600/40'
                      : isDangerSegment
                      ? 'bg-red-500 text-white font-bold border-red-400 shadow-md shadow-red-500/30 animate-pulse'
                      : 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950/90 border-amber-900/30 text-amber-200/40'
                }`}
              >
                <div className="flex justify-between w-full text-xs font-mono font-bold">
                  <span>#{strikeNumber}</span>
                  <span>{strikeNumber * 10}</span>
                </div>

                <div className="font-mono text-xs uppercase tracking-wider font-bold">
                  {isFilled ? 'HIT' : 'OK'}
                </div>

                <div className="text-[10px] font-mono uppercase tracking-wider truncate w-full text-center">
                  {i === 9 ? 'BLOWOUT' : i === 3 ? 'INJECT' : `${strikeNumber * 10} PSI`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Gauge Scale Footer */}
        <div className="flex justify-between items-center text-xs font-mono text-amber-200/70 mt-2.5 px-1">
          <span className="text-emerald-400 font-semibold">0-30 PSI: Nominal Operation</span>
          <span className="text-amber-400 font-semibold">40-70 PSI: Threat Escalation (Injects Active)</span>
          <span className="text-red-400 font-semibold">80-100 PSI: Critical Breach Imminent</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TABLETOP PLAYMAT: 4 BREACH VECTOR SLOTS (ARMED, DETECTED, CONTAINED) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl p-5 sm:p-7 oceanic-felt brass-perimeter shadow-2xl relative">
        {/* Brass Rivets at Corners */}
        <div className="absolute top-3 left-3 brass-rivet pointer-events-none" />
        <div className="absolute top-3 right-3 brass-rivet pointer-events-none" />
        <div className="absolute bottom-3 left-3 brass-rivet pointer-events-none" />
        <div className="absolute bottom-3 right-3 brass-rivet pointer-events-none" />

        {/* Playmat Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-amber-600/30 px-2">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-black text-sm sm:text-base text-amber-100 uppercase tracking-wider">
              Breach Vector Slots &bull; The Kill Chain
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-300/80 hidden sm:inline">
            Tactile Playmat &bull; 4 Kill Chain Stages &bull; Click to Inspect
          </span>
        </div>

        {/* 4 Attack Vector Slots with Distinct Tactile Visual States */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {scenario.map((slot, idx) => {
            const isCardRevealed = slot.revealed || facilitatorMode;
            const isDetected = slot.revealed && !slot.contained;
            const isContained = slot.contained;

            return (
              <div 
                key={idx} 
                className={`relative flex flex-col items-center rounded-2xl border-2 p-4 transition-all duration-300 ${
                  isContained 
                    ? 'border-emerald-500/70 bg-emerald-950/30 shadow-xl shadow-emerald-500/10' 
                    : isDetected 
                    ? 'border-amber-500/70 bg-amber-950/25 ring-1 ring-amber-500/40 shadow-xl shadow-amber-500/10' 
                    : 'border-amber-900/40 bg-slate-950/80 hover:border-amber-700/60'
                }`}
              >
                {/* Slot Status Header Badge */}
                <div className="w-full flex justify-between items-center mb-3 px-1 text-xs">
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-amber-100 truncate pr-1">
                    {slot.title}
                  </span>

                  {/* Tactile Status Pills */}
                  {isContained ? (
                    <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1 shadow-sm shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                      CONTAINED
                    </span>
                  ) : isDetected ? (
                    <span className="bg-amber-500/30 text-amber-200 border border-amber-500/70 font-bold px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1 shadow-sm animate-pulse shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      DETECTED
                    </span>
                  ) : (
                    <span className="bg-slate-900 text-amber-300/80 border border-amber-900/40 font-semibold px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1 shrink-0">
                      <EyeOff className="w-3.5 h-3.5 text-amber-400/80" />
                      ARMED
                    </span>
                  )}
                </div>

                {/* Card Container with Stamped Seal Overlay */}
                <div className="relative group w-full flex justify-center py-1">
                  {slot.card ? (
                    <div className="relative">
                      <Card
                        card={slot.card}
                        isBack={!isCardRevealed}
                        size="md"
                        interactive={true}
                        onClick={() => toggleReveal(idx)}
                        className={isContained ? 'opacity-90 grayscale-[10%]' : ''}
                      />

                      {/* Facilitator Peeking Indicator */}
                      {!slot.revealed && facilitatorMode && (
                        <div className="absolute top-3 inset-x-3 bg-amber-500 text-slate-950 px-2 py-1 rounded-lg text-[10px] font-bold font-mono shadow-xl z-30 text-center uppercase tracking-wider animate-pulse">
                          FACILITATOR PEEPHOLE (DEFENDERS BLIND)
                        </div>
                      )}

                      {/* Tactile Contained Incident Seal Watermark */}
                      {isContained && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                          <div className="border-4 border-emerald-400 bg-emerald-950/85 text-emerald-200 px-4 py-2 rounded-2xl rotate-[-12deg] shadow-2xl flex flex-col items-center gap-0.5 backdrop-blur-xs">
                            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                            <span className="font-display font-black text-xs uppercase tracking-widest text-emerald-100">
                              INCIDENT CONTAINED
                            </span>
                            <span className="font-mono text-[9px] text-emerald-300 font-semibold">
                              KRUSTY KRAB SOC // SECURED
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-64 h-[364px] rounded-2xl border-2 border-dashed border-amber-900/40 flex flex-col items-center justify-center text-amber-300/50 font-mono text-xs gap-2">
                      <Target className="w-8 h-8 text-amber-500/40 animate-pulse" />
                      <span>Vector unassigned</span>
                    </div>
                  )}
                </div>

                {/* Slot Actions Toolbar */}
                <div className="w-full flex justify-between gap-2 mt-3.5 pt-3 border-t border-amber-900/30">
                  <button
                    onClick={() => toggleReveal(idx)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 font-mono text-xs font-semibold border border-amber-900/40 shadow transition-colors"
                  >
                    {slot.revealed ? 'Conceal Shutter' : 'Reveal Shutter'}
                  </button>
                  <button
                    onClick={() => toggleContained(idx)}
                    className={`py-1.5 px-3 rounded-xl font-mono text-xs font-bold border transition-all shadow ${
                      isContained 
                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                        : 'bg-slate-950 hover:bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    }`}
                  >
                    {isContained ? 'Contained' : 'Contain Vector'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. WORKSPACE: PROCEDURES BOARD & DICE ROLLER & INCIDENT LOG */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Defensive S.O.P. Clipboard with Dual-Check Selection */}
        <div className="rounded-3xl p-5 bg-galley-950/85 border border-amber-900/40 shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-900/40 px-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="font-display font-bold text-amber-100 text-sm tracking-wider uppercase">
                Defensive S.O.P. Procedures
              </h3>
            </div>
            <span className="font-mono text-xs text-sky-400 font-semibold">Select to Arm</span>
          </div>

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {procCards.map(proc => {
              const isSelected = selectedProcedure?.id === proc.id;

              return (
                <div
                  key={proc.id}
                  onClick={() => handleSelectProcedure(proc)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-sky-950/40 border-sky-500/70 shadow-lg ring-1 ring-sky-500/40' 
                      : 'bg-slate-950/80 border-amber-900/30 hover:border-amber-700/60'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1 mb-1">
                    <span className="font-display font-bold text-xs text-amber-100">{proc.title}</span>
                    <span className="font-mono text-[11px] bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-600/30 shrink-0">
                      DC {proc.checks?.[0]?.target || 11}+
                    </span>
                  </div>
                  <p className="font-mono text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {proc.description}
                  </p>

                  {/* Dual-Check Procedure Buttons (Selectable when armed or in card) */}
                  {proc.checks && proc.checks.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-sky-500/30 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 font-bold block">
                        Procedure Check Targets:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {proc.checks.map((chk, cIdx) => {
                          const checkType = cIdx === 0 ? 'Detection' : 'Containment';
                          const isCheckActive = isSelected && activeCheckIndex === cIdx;
                          return (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProcedure(proc);
                                handleSelectCheck(chk.target, cIdx, chk.description, checkType);
                              }}
                              className={`w-full py-1.5 px-2.5 rounded-xl border text-xs font-mono text-left flex items-center justify-between transition-all ${
                                isCheckActive
                                  ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md ring-1 ring-sky-300'
                                  : 'bg-slate-950/90 text-sky-200 border-sky-500/40 hover:bg-sky-950'
                              }`}
                            >
                              <span className="truncate">Roll for {checkType} ({chk.description})</span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ml-1.5 ${isCheckActive ? 'bg-slate-950 text-amber-300' : 'bg-sky-900 text-sky-200'}`}>
                                DC {chk.target}+
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Animated d20 Dice Tray with +3 Procedure Toggle */}
        <div>
          <DiceRoller
            currentTarget={activeCheckTarget}
            currentProcedureName={selectedProcedure ? selectedProcedure.title : undefined}
            currentCheckLabel={activeCheckLabel}
            onRollComplete={handleRollComplete}
          />
        </div>

        {/* Right Column: Active Hazards & Clean Incident Logbook */}
        <div className="space-y-5">
          {/* Active Hazards Panel */}
          <div className="rounded-3xl p-5 bg-galley-950/85 border border-amber-900/40 shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-900/40">
              <h3 className="font-display font-bold text-amber-300 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Active Hazards ({activeInjects.length})
              </h3>
            </div>

            {activeInjects.length === 0 ? (
              <div className="p-3 text-center font-mono text-xs text-amber-200/50 bg-slate-950/90 rounded-xl border border-amber-900/30">
                No active inject hazards. Operations running nominal.
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {activeInjects.map(inj => (
                  <div key={inj.id} className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs shadow">
                    <div className="flex justify-between items-start">
                      <span className="font-display font-bold text-amber-200">{inj.title}</span>
                      <button
                        onClick={() => dismissInject(inj.id)}
                        className="text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                    <p className="font-mono text-xs text-amber-300/90 mt-1 font-semibold leading-relaxed">
                      {inj.injectEffect}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incident Activity Logbook */}
          <div className="bg-slate-950/90 border border-amber-900/40 rounded-2xl p-4 font-mono text-xs text-slate-300 shadow-xl">
            {/* Log Header */}
            <div className="flex justify-between items-center border-b border-amber-900/40 pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
                <ScrollText className="w-4 h-4 text-amber-400" />
                <span>INCIDENT ACTIVITY LOG</span>
              </div>
              <button 
                onClick={() => setLogEntries([{ id: 'init', type: 'SYSTEM', timestamp: new Date().toLocaleTimeString(), message: 'Activity log refreshed.' }])} 
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                title="Clear Activity Log"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>

            {/* Log Entries */}
            <div 
              ref={logContainerRef}
              className="space-y-2 max-h-[220px] overflow-y-auto pr-1"
            >
              {logEntries.map(entry => {
                const badgeColor = {
                  SYSTEM: 'bg-sky-950 text-sky-400 border-sky-500/30',
                  INVESTIGATION: 'bg-blue-950 text-blue-400 border-blue-500/30',
                  INJECT: 'bg-amber-950 text-amber-400 border-amber-500/30',
                  STRIKE: 'bg-red-950 text-red-400 border-red-500/30',
                  CONTAINED: 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                }[entry.type];

                return (
                  <div key={entry.id} className="border-b border-white/5 pb-1.5 last:border-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-slate-500 text-[11px] font-mono">[{entry.timestamp}]</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${badgeColor}`}>
                        {entry.type}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {entry.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. QUICK RULES & S.O.P. MODAL */}
      {/* ========================================================================= */}
      {showQuickRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-galley-950 border-2 border-amber-600/40 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-amber-900/40 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-black text-lg text-amber-100 uppercase tracking-wider">
                  Quick Incident Response Rules
                </h3>
              </div>
              <button
                onClick={() => setShowQuickRules(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close Rules Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-200">
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-900/30">
                <span className="text-amber-400 font-display font-bold text-sm block mb-1">
                  1. The Secret Attack Vectors (4 Slots)
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Four attack cards sit face-down: <strong className="text-red-400">1. Initial Compromise</strong>, <strong className="text-amber-400">2. Pivot &amp; Escalate</strong>, <strong className="text-purple-400">3. Persistence</strong>, and <strong className="text-amber-500">4. C2 &amp; Exfiltration</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-900/30">
                <span className="text-sky-300 font-display font-bold text-sm block mb-1">
                  2. Defensive Procedures &amp; d20 Checks
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Select a procedure from the Defensive S.O.P. list and choose your roll check: <strong>Roll for Detection (DC 11+)</strong> or <strong>Roll for Containment (DC 15+)</strong>. If your team has a documented procedure in place, toggle the <strong>+3 Procedure in Place</strong> bonus in the dice tray!
                </p>
              </div>

              <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-900/30">
                <span className="text-emerald-400 font-display font-bold text-sm block mb-1">
                  3. Boiler Strikes &amp; Overpressure Catastrophe
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Failed checks increase <strong>Boiler Pressure by +1 Strike (+10 PSI)</strong>. Every 2 strikes trigger an automatic <strong>Hazard Inject</strong>. If pressure reaches <strong>10 Strikes (100 PSI)</strong>, the boiler blows out and Plankton steals the Secret Formula!
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-amber-900/40">
              <span className="text-xs text-amber-200/70 font-mono">
                Shortcuts: [F] Facilitator &bull; [R] Reset Breach &bull; [?] Rules
              </span>
              <button
                onClick={() => setShowQuickRules(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Return to Tabletop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
