import React, { useState, useMemo, useEffect } from 'react';
import { CardData, DeckType, ScenarioData } from '../types/card';
import scenariosData from '../data/scenarios.json';
import { Card } from './Card';
import { DiceRoller, BrassCornerBracket } from './DiceRoller';
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
  Gauge,
  ScrollText,
  Anchor,
  Wind
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
  // Strikes counter (0 to 10) representing boiler pressure
  const [strikes, setStrikes] = useState<number>(0);
  const [facilitatorMode, setFacilitatorMode] = useState<boolean>(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('random');
  const [showQuickRules, setShowQuickRules] = useState<boolean>(false);
  const [activeInjects, setActiveInjects] = useState<CardData[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<CardData | null>(null);
  const [activeCheckTarget, setActiveCheckTarget] = useState<number>(11);
  const [logMessages, setLogMessages] = useState<string[]>([
    "GALLEY TICKET #001: Krusty Krab SOC Incident Console initialized.",
    "BOILER STATUS: Low steam pressure (0/100 PSI). Nominal operations.",
    "THREAT TELEMETRY: Plankton Chum APT movement reported in Sector 4."
  ]);

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
    setLogMessages([
      `CAMPAIGN ORDER FILED: [${preset.id}] ${preset.title} (${preset.difficulty})`,
      `DISPATCH BRIEFING: ${preset.briefing}`,
      `GALLEY SPECIAL RULES: ${preset.special_rules}`,
      "DEFENDERS: Select investigative S.O.P. and roll d20 to inspect breach vectors."
    ]);
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
    setLogMessages([
      "TICKET: Random breach scenario armed. 4 porthole vectors face-down.",
      "DEFENDERS: Select investigative S.O.P. and roll d20 to inspect breach vectors."
    ]);
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
      addLog(`PORTHOLE SHUTTER OPENED: ${targetSlot.title} — ${targetSlot.card.title}`);
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
      addLog(`VECTOR CONTAINED: ${targetSlot.title} (${targetSlot.card.title}) secured with brass clamp!`);
      // Check win condition
      const allContained = scenario.every((s, i) => i === index ? true : s.contained);
      if (allContained) {
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#ffd166']
        });
        addLog("VICTORY! All 4 breach vectors neutralized! The Krabby Patty Formula is SECURED!");
      }
    }
  };

  // Add strike / increase boiler pressure
  const addStrike = () => {
    if (strikes >= 10) return;
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    sound.playStrikeKlaxon();
    addLog(`BOILER PRESSURE SPIKE! Current pressure: ${newStrikes * 10} PSI (${newStrikes}/10 Strikes)`);

    // Automatic inject trigger on strikes 2, 4, 6, 8
    if (newStrikes % 2 === 0 && injCards.length > 0) {
      drawInject();
    }

    if (newStrikes >= 10) {
      addLog("BOILER BLOWOUT! 100 PSI OVERPRESSURE! Plankton extracted the Secret Formula!");
    }
  };

  // Remove strike / vent steam
  const removeStrike = () => {
    if (strikes <= 0) return;
    setStrikes(prev => prev - 1);
    sound.playClick();
    addLog(`STEAM VENTED. Pressure decreased to ${(strikes - 1) * 10} PSI (${strikes - 1}/10 Strikes)`);
  };

  // Draw random inject
  const drawInject = () => {
    if (injCards.length === 0) return;
    sound.playCardFlip();
    const available = injCards.filter(inj => !activeInjects.some(a => a.id === inj.id));
    const pool = available.length > 0 ? available : injCards;
    const drawn = pool[Math.floor(Math.random() * pool.length)];

    setActiveInjects(prev => [drawn, ...prev]);
    addLog(`HAZARD INJECT DETONATED: [${drawn.title}] — ${drawn.injectEffect}`);
  };

  // Discard inject
  const dismissInject = (id: string) => {
    sound.playClick();
    setActiveInjects(prev => prev.filter(inj => inj.id !== id));
    addLog(`INJECT RESOLVED: [${id}] purged from kitchen orders.`);
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogMessages(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 40)]);
  };

  // When dice roll completes
  const handleRollComplete = (roll: number, total: number, isSuccess: boolean, margin: number) => {
    const procName = selectedProcedure ? selectedProcedure.title : "Investigation";
    if (isSuccess) {
      addLog(`ROLL SUCCESS: ${procName} rolled ${roll} (total ${total} vs DC ${activeCheckTarget}). Margin: +${margin}`);
    } else {
      addLog(`ROLL FAILED: ${procName} rolled ${roll} (total ${total} vs DC ${activeCheckTarget}). Adding 1 Boiler Strike!`);
      addStrike();
    }
  };

  // Check win/loss status
  const allNeutralized = scenario.every(s => s.contained);
  const isGameOver = strikes >= 10;

  // Pressure gauge tier
  const pressurePSI = strikes * 10;
  const isNominal = strikes <= 3;
  const isBuildup = strikes >= 4 && strikes <= 7;
  const isCritical = strikes >= 8 && strikes <= 9;
  const isBlowout = strikes >= 10;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP GALLEY SWITCHBOARD & MASTER CONTROLS */}
      {/* ========================================================================= */}
      <div className="relative bg-gradient-to-r from-galley-950 via-galley-900 to-galley-950 border-4 border-brass-700/80 rounded-3xl p-4 sm:p-5 shadow-[0_15px_30px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Brass Header Trim Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brass-400/60 to-transparent pointer-events-none" />
        <BrassCornerBracket position="tl" />
        <BrassCornerBracket position="tr" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-brass-400 animate-pulse border border-brass-900 shadow-sm" />
              <h2 className="font-display font-black text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-b from-brass-100 via-brass-300 to-brass-500 uppercase tracking-widest drop-shadow">
                KRUSTY GALLEY PREP TABLE &bull; S.O.P. CONSOLE
              </h2>
            </div>
            <p className="text-xs font-mono text-parchment-300/80 mt-1">
              Galley Incident Response Tabletop &bull; NIST SP 800-61r2 Triage Board
            </p>
          </div>

          {/* Switchboard Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Scenario Selector */}
            <div className="flex items-center gap-1.5 bg-galley-950 px-3 py-1.5 rounded-xl border-2 border-brass-700/70 shadow-inner">
              <Target className="w-3.5 h-3.5 text-brass-400" />
              <select
                value={selectedScenarioId}
                onChange={(e) => loadScenario(e.target.value)}
                className="bg-transparent text-xs font-display font-bold text-brass-200 outline-none cursor-pointer tracking-wide"
              >
                <option value="random" className="bg-galley-950 text-parchment-100">🎲 Random Incident</option>
                {(scenariosData as ScenarioData[]).map(sc => (
                  <option key={sc.id} value={sc.id} className="bg-galley-950 text-parchment-100">
                    📁 {sc.title} ({sc.difficulty})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Rules Button */}
            <button
              onClick={() => setShowQuickRules(true)}
              className="px-3 py-1.5 rounded-xl font-display text-xs font-bold bg-galley-950 text-marine-300 border-2 border-marine-600/50 hover:bg-marine-950 transition-colors flex items-center gap-1.5 shadow"
            >
              <HelpCircle className="w-3.5 h-3.5 text-marine-400" />
              Rules Placard
            </button>

            {/* Facilitator Surveillance Peephole */}
            <button
              onClick={() => setFacilitatorMode(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl font-display text-xs font-bold flex items-center gap-1.5 transition-all border-2 ${
                facilitatorMode 
                  ? 'bg-gradient-to-b from-brass-400 to-brass-600 text-galley-950 border-brass-200 shadow-[0_2px_10px_rgba(245,158,11,0.4)]' 
                  : 'bg-galley-950 text-brass-300 border-brass-700/60 hover:bg-galley-800'
              }`}
            >
              {facilitatorMode ? <Eye className="w-3.5 h-3.5 text-galley-950" /> : <EyeOff className="w-3.5 h-3.5 text-brass-400" />}
              Peephole: {facilitatorMode ? 'OPEN' : 'LOCKED'}
            </button>

            {/* Deal New Breach Crank */}
            <button
              onClick={dealNewScenario}
              className="px-3 py-1.5 rounded-xl font-display text-xs font-bold bg-gradient-to-b from-galley-700 to-galley-900 hover:from-galley-600 hover:to-galley-800 text-brass-200 border-2 border-brass-600/60 flex items-center gap-1.5 shadow active:translate-y-0.5 transition-all"
              title="Deal New Incident Scenario (Shortcut: R)"
            >
              <Shuffle className="w-3.5 h-3.5 text-brass-400" />
              Deal New Breach
            </button>

            {/* Draw Inject Button */}
            <button
              onClick={drawInject}
              className="px-3 py-1.5 rounded-xl font-display text-xs font-bold bg-gradient-to-b from-kelp-700 to-kelp-900 hover:from-kelp-600 hover:to-kelp-800 text-white border-2 border-kelp-400/80 flex items-center gap-1.5 shadow active:translate-y-0.5 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-kelp-300" />
              Draw Hazard Inject
            </button>
          </div>
        </div>
      </div>

      {/* Active Campaign Briefing Banner (if preset scenario is active) */}
      {activeScenarioMeta && (
        <div className="relative bg-gradient-to-r from-galley-900 via-galley-850 to-galley-900 border-2 border-brass-600/70 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-brass-950 text-brass-300 border border-brass-500/50 font-bold">
                {activeScenarioMeta.id}
              </span>
              <h3 className="font-display font-bold text-brass-100 text-sm sm:text-base">
                {activeScenarioMeta.title}
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                activeScenarioMeta.difficulty === 'Beginner' ? 'bg-kelp-950/80 text-kelp-300 border-kelp-500/50' :
                activeScenarioMeta.difficulty === 'Intermediate' ? 'bg-brass-950/80 text-brass-300 border-brass-500/50' :
                'bg-barnacle-950/80 text-barnacle-300 border-barnacle-500/50'
              }`}>
                {activeScenarioMeta.difficulty}
              </span>
            </div>
            <button
              onClick={() => setSelectedScenarioId('random')}
              className="text-parchment-400 hover:text-brass-300 text-xs font-mono transition-colors"
            >
              [Switch to Random]
            </button>
          </div>
          <p className="font-serif text-xs text-parchment-200/90 leading-relaxed">
            {activeScenarioMeta.briefing}
          </p>
          {activeScenarioMeta.special_rules && (
            <div className="bg-brass-950/70 border border-brass-500/40 rounded-xl px-3 py-1.5 text-xs font-mono text-brass-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-brass-400 shrink-0" />
              <span><strong>Galley Standing Orders:</strong> {activeScenarioMeta.special_rules}</span>
            </div>
          )}
        </div>
      )}

      {/* Win / Loss Banners */}
      {allNeutralized && (
        <div className="bg-gradient-to-r from-kelp-950 via-kelp-900 to-kelp-950 border-4 border-kelp-400 p-5 rounded-3xl shadow-2xl flex items-center justify-between text-kelp-100 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brass-500 border-2 border-brass-200 flex items-center justify-center text-galley-950 shadow-lg">
              <Trophy className="w-7 h-7 text-galley-950" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-brass-200 tracking-wide">
                VICTORY! THE SECRET FORMULA IS PRESERVED!
              </h3>
              <p className="font-mono text-xs text-kelp-200 mt-0.5">
                All 4 breach phases contained! Boiler held steady with {10 - strikes} strikes ({(10 - strikes) * 10} PSI) of headroom!
              </p>
            </div>
          </div>
          <button
            onClick={dealNewScenario}
            className="px-5 py-2.5 bg-gradient-to-r from-brass-400 to-brass-600 hover:from-brass-300 hover:to-brass-500 text-galley-950 font-display font-black rounded-xl text-xs uppercase tracking-wider shadow-lg"
          >
            Play Next Incident
          </button>
        </div>
      )}

      {isGameOver && (
        <div className="bg-gradient-to-r from-barnacle-950 via-barnacle-900 to-barnacle-950 border-4 border-barnacle-500 p-5 rounded-3xl shadow-2xl flex items-center justify-between text-barnacle-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-barnacle-600 border-2 border-barnacle-300 flex items-center justify-center text-white shadow-lg animate-pulse">
              <Skull className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-barnacle-200 tracking-wide">
                BOILER BLOWOUT! 100 PSI OVERPRESSURE!
              </h3>
              <p className="font-mono text-xs text-barnacle-200 mt-0.5">
                Plankton has successfully exfiltrated the Krabby Patty Secret Formula to the Chum Bucket!
              </p>
            </div>
          </div>
          <button
            onClick={dealNewScenario}
            className="px-5 py-2.5 bg-gradient-to-r from-barnacle-500 to-barnacle-700 hover:from-barnacle-400 hover:to-barnacle-600 text-white font-display font-black rounded-xl text-xs uppercase tracking-wider shadow-lg"
          >
            Reset Incident
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ANALOG MARINE BOILER PRESSURE GAUGE (STRIKE TRACKER) */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-b from-galley-900 via-galley-850 to-galley-950 border-4 border-brass-600 shadow-[0_20px_40px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.1)] overflow-hidden">
        {/* Specular Steam Glare across Gauge Bezel */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
        <BrassCornerBracket position="tl" />
        <BrassCornerBracket position="tr" />
        <BrassCornerBracket position="bl" />
        <BrassCornerBracket position="br" />

        <div className="relative z-10">
          {/* Gauge Face Header */}
          <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-brass-700/60 px-1 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-galley-950 border-2 border-brass-500/70 flex items-center justify-center text-brass-300 shadow-inner">
                <Gauge className={`w-5 h-5 ${isCritical || isBlowout ? 'text-barnacle-400 animate-pulse' : isBuildup ? 'text-brass-400' : 'text-kelp-400'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-sm sm:text-base text-brass-100 uppercase tracking-widest drop-shadow">
                    MARINE BOILER PRESSURE GAUGE // PSI x10
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                    isNominal ? 'bg-kelp-950/80 text-kelp-300 border-kelp-500/50' :
                    isBuildup ? 'bg-brass-950/80 text-brass-300 border-brass-500/50' :
                    'bg-barnacle-950/90 text-barnacle-300 border-barnacle-500/60 animate-pulse'
                  }`}>
                    {isNominal ? 'NOMINAL STEAM' : isBuildup ? 'STEAM HAZARD' : isCritical ? 'CRITICAL OVERPRESSURE' : 'BLOWOUT!'}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-parchment-300/70">
                  Boiler Gauge Dial: <span className="font-bold text-brass-300">{pressurePSI} PSI</span> &bull; Strikes: <span className="font-bold text-brass-300">{strikes}/10</span>
                </p>
              </div>
            </div>

            {/* Pressure Relief Valves (+ / - Strikes) */}
            <div className="flex items-center gap-2">
              <button
                onClick={removeStrike}
                disabled={strikes <= 0}
                className="px-2.5 py-1.5 rounded-xl bg-galley-950 hover:bg-galley-800 disabled:opacity-40 text-brass-300 font-mono text-xs font-bold border border-brass-600/60 flex items-center gap-1 shadow transition-all"
                title="Relief Steam Valve (-1 Strike)"
              >
                <Minus className="w-3.5 h-3.5 text-brass-400" />
                <span>Vent Steam</span>
              </button>
              <button
                onClick={addStrike}
                disabled={strikes >= 10}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-b from-barnacle-800 to-barnacle-950 hover:from-barnacle-700 hover:to-barnacle-900 disabled:opacity-40 text-barnacle-100 font-mono text-xs font-bold border border-barnacle-500 flex items-center gap-1 shadow transition-all"
                title="Pressure Spike (+1 Strike)"
              >
                <Plus className="w-3.5 h-3.5 text-barnacle-200" />
                <span>Spike +1</span>
              </button>
            </div>
          </div>

          {/* 10-Segment Analog Boiler Pressure Barometer Dial */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: 10 }).map((_, i) => {
              const nodePSI = (i + 1) * 10;
              const isFilled = i < strikes;
              const isAmberSegment = i >= 4 && i < 7;
              const isDangerSegment = i >= 7;

              return (
                <div
                  key={i}
                  className={`h-14 rounded-2xl border-2 flex flex-col items-center justify-between p-1.5 transition-all duration-300 relative overflow-hidden ${
                    isFilled
                      ? isDangerSegment
                        ? 'bg-gradient-to-b from-barnacle-600 via-barnacle-700 to-barnacle-900 border-barnacle-400 shadow-[0_0_12px_rgba(239,68,68,0.5)] text-white'
                        : isAmberSegment
                        ? 'bg-gradient-to-b from-brass-500 via-brass-600 to-brass-800 border-brass-300 shadow-[0_0_12px_rgba(245,158,11,0.4)] text-galley-950'
                        : 'bg-gradient-to-b from-kelp-500 via-kelp-600 to-kelp-800 border-kelp-300 shadow-[0_0_10px_rgba(16,185,129,0.4)] text-white'
                      : 'bg-galley-950/80 border-brass-800/40 text-parchment-500/50'
                  }`}
                >
                  <div className="flex justify-between w-full text-[8px] font-mono font-bold">
                    <span>#{i + 1}</span>
                    <span>{nodePSI}</span>
                  </div>

                  <div className="text-center my-auto">
                    {isFilled ? (
                      <span className="text-sm drop-shadow">{isDangerSegment ? '💥' : isAmberSegment ? '⚠️' : '♨️'}</span>
                    ) : (
                      <span className="text-[8px] font-mono opacity-40">PSI</span>
                    )}
                  </div>

                  <div className="text-[7.5px] font-mono uppercase tracking-tighter truncate w-full text-center">
                    {i === 9 ? 'BLOWOUT' : i === 3 ? 'INJECT' : `${nodePSI} PSI`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analog Pressure Gauge Scale Footer */}
          <div className="flex justify-between items-center text-[9px] font-mono text-parchment-300/80 mt-2 px-1">
            <span className="text-kelp-400 font-bold">0-30 PSI: Nominal Boiler State</span>
            <span className="text-brass-300 font-bold">40-70 PSI: Steam Buildup (Injects Triggered)</span>
            <span className="text-barnacle-400 font-bold">80-100 PSI: Critical Blowout Hazard</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TABLETOP PLAYMAT: 4 PORTHOLE CARD SLOTS */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#052922] via-[#06332a] to-[#04201b] border-4 border-galley-700 shadow-[inset_0_4px_30px_rgba(0,0,0,0.85),0_10px_30px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* 4 Brass Corner Hardware Brackets on Playmat */}
        <BrassCornerBracket position="tl" />
        <BrassCornerBracket position="tr" />
        <BrassCornerBracket position="bl" />
        <BrassCornerBracket position="br" />

        {/* Faint Nautical Chart Grid & Compass Rose in Felt */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffd166_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-kelp-800/80 px-1">
            <div className="flex items-center gap-2.5">
              <Anchor className="w-5 h-5 text-brass-400" />
              <h3 className="font-display font-black text-sm sm:text-base text-brass-100 uppercase tracking-widest drop-shadow">
                PORTHOLE BREACH VECTORS (THE ATTACK CHAIN)
              </h3>
            </div>
            <span className="text-xs font-mono text-parchment-300/70 hidden sm:inline">
              Click porthole card to open shutter &bull; Toggle brass containment latch when eradicated
            </span>
          </div>

          {/* 4 Brass Porthole Frames */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {scenario.map((slot, idx) => {
              const isCardRevealed = slot.revealed || facilitatorMode;
              return (
                <div 
                  key={idx} 
                  className={`relative flex flex-col items-center rounded-2xl border-4 p-3.5 transition-all shadow-[inset_0_3px_12px_rgba(0,0,0,0.8),0_8px_20px_rgba(0,0,0,0.6)] ${
                    slot.contained 
                      ? 'border-kelp-400/90 bg-gradient-to-b from-kelp-950/90 via-galley-950/95 to-kelp-950/90 ring-2 ring-kelp-500/40' 
                      : 'border-brass-700/80 bg-gradient-to-b from-[#091b26]/95 via-[#0c1a24]/90 to-[#061118]/95'
                  }`}
                >
                  {/* Porthole Depth Glare Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none rounded-xl" />

                  {/* Porthole Miniature Rivets */}
                  <div className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full bg-brass-300 border border-brass-900 shadow-xs pointer-events-none" />
                  <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-brass-300 border border-brass-900 shadow-xs pointer-events-none" />
                  <div className="absolute bottom-1.5 left-2 w-1.5 h-1.5 rounded-full bg-brass-300 border border-brass-900 shadow-xs pointer-events-none" />
                  <div className="absolute bottom-1.5 right-2 w-1.5 h-1.5 rounded-full bg-brass-300 border border-brass-900 shadow-xs pointer-events-none" />

                  {/* Slot Title Header */}
                  <div className="w-full flex justify-between items-center mb-2 px-1 text-xs">
                    <span className="font-display font-black text-xs uppercase tracking-wider text-brass-200 drop-shadow">
                      {slot.title}
                    </span>
                    {slot.contained && (
                      <span className="bg-kelp-600 text-white px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 shadow border border-kelp-300">
                        <ShieldCheck className="w-3 h-3" />
                        SECURED
                      </span>
                    )}
                  </div>

                  {/* Card Container with 3D Flip */}
                  <div className="relative group w-full flex justify-center py-1">
                    {slot.card ? (
                      <Card
                        card={slot.card}
                        isBack={!isCardRevealed}
                        size="md"
                        interactive={true}
                        onClick={() => toggleReveal(idx)}
                        className={slot.contained ? 'opacity-75 grayscale-[20%]' : ''}
                      />
                    ) : (
                      <div className="w-64 h-[358px] rounded-xl border-2 border-dashed border-brass-700/50 flex flex-col items-center justify-center text-parchment-400/60 font-mono text-xs gap-2">
                        <Wind className="w-8 h-8 text-brass-500/40 animate-pulse" />
                        <span>Vector unassigned</span>
                      </div>
                    )}

                    {/* Facilitator Peeking Indicator */}
                    {!slot.revealed && facilitatorMode && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-brass-400 to-brass-500 text-galley-950 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-md z-30 border border-brass-200">
                        Peephole Peek
                      </div>
                    )}
                  </div>

                  {/* Slot Control Actions: Shutter & Containment Latch */}
                  <div className="w-full flex justify-between gap-2 mt-3 pt-2.5 border-t border-brass-700/50">
                    <button
                      onClick={() => toggleReveal(idx)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-galley-900 hover:bg-galley-800 text-parchment-200 font-mono text-[11px] font-bold border border-brass-700/70 shadow transition-colors"
                    >
                      {slot.revealed ? 'Close Shutter' : 'Open Shutter'}
                    </button>
                    <button
                      onClick={() => toggleContained(idx)}
                      className={`py-1.5 px-3 rounded-xl font-mono text-[11px] font-bold border transition-all shadow ${
                        slot.contained 
                          ? 'bg-kelp-600 border-kelp-300 text-white' 
                          : 'bg-galley-950 hover:bg-kelp-950 border-kelp-500/60 text-kelp-300'
                      }`}
                    >
                      {slot.contained ? 'Neutralized' : 'Clamp Vector'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. WORKSPACE: PROCEDURES BOARD & DICE ROLLER & ORDER TICKET REEL */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Galley S.O.P. Clipboard */}
        <div className="relative rounded-3xl p-5 bg-gradient-to-b from-galley-900 via-galley-850 to-galley-950 border-4 border-brass-700/80 shadow-[0_15px_30px_rgba(0,0,0,0.9)] overflow-hidden">
          <BrassCornerBracket position="tl" />
          <BrassCornerBracket position="tr" />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-brass-700/50 px-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brass-400" />
                <h3 className="font-display font-black text-brass-100 text-sm tracking-wider uppercase drop-shadow">
                  DEFENSIVE S.O.P. CLIPBOARD
                </h3>
              </div>
              <span className="font-mono text-[10px] text-marine-300 font-semibold">Arm check</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
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
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-gradient-to-b from-marine-900 to-marine-950 border-brass-400 shadow-md ring-2 ring-brass-400/50' 
                        : 'bg-galley-950/80 border-brass-800/40 hover:border-brass-600/60'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1 mb-1">
                      <span className="font-display font-bold text-xs text-brass-100">{proc.title}</span>
                      <span className="font-mono text-[10px] bg-brass-950 text-brass-300 font-bold px-2 py-0.5 rounded border border-brass-500/50">
                        DC {primaryTarget}+
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-parchment-300/80 line-clamp-2">
                      {proc.description}
                    </p>
                    {proc.checks && proc.checks.length > 1 && (
                      <div className="mt-1 flex gap-2 text-[9px] font-mono text-marine-300">
                        <span>Secondary check: {proc.checks[1].target}+ ({proc.checks[1].description})</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Octagonal / Rounded Wooden Dice Tray */}
        <div>
          <DiceRoller
            currentTarget={activeCheckTarget}
            currentProcedureName={selectedProcedure ? selectedProcedure.title : undefined}
            onRollComplete={handleRollComplete}
          />
        </div>

        {/* Right Column: Active Hazards & Krusty Galley Order Ticket Reel */}
        <div className="space-y-5">
          {/* Active Chum Bucket Hazards */}
          <div className="relative rounded-3xl p-4 bg-gradient-to-b from-galley-900 via-galley-850 to-galley-950 border-4 border-brass-700/80 shadow-[0_15px_30px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-brass-700/50">
              <h3 className="font-display font-bold text-kelp-300 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-kelp-400" />
                ACTIVE KITCHEN HAZARDS ({activeInjects.length})
              </h3>
            </div>

            {activeInjects.length === 0 ? (
              <div className="p-3 text-center font-mono text-xs text-parchment-400/60 bg-galley-950/70 rounded-xl border border-brass-800/40">
                No active inject hazards. Galley grills running steady.
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {activeInjects.map(inj => (
                  <div key={inj.id} className="p-2.5 rounded-xl bg-kelp-950/80 border border-kelp-500/50 text-xs shadow">
                    <div className="flex justify-between items-start">
                      <span className="font-display font-bold text-kelp-200">{inj.title}</span>
                      <button
                        onClick={() => dismissInject(inj.id)}
                        className="text-[9px] font-mono bg-kelp-900 hover:bg-kelp-800 text-white px-2 py-0.5 rounded border border-kelp-400"
                      >
                        Clear Order
                      </button>
                    </div>
                    <p className="font-mono text-[10px] text-kelp-300 mt-1 font-semibold">
                      {inj.injectEffect}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* KRUSTY GALLEY ORDER TICKET REEL / CAPTAIN'S SHIP LOG */}
          {/* ========================================================================= */}
          <div className="relative bg-[#fffbeb] text-stone-900 border-2 border-stone-300 rounded-2xl p-4 shadow-[0_12px_30px_rgba(0,0,0,0.6)] font-mono text-[11px] overflow-hidden">
            {/* Ticket Machine Top Bracket / Metal Feed Bar */}
            <div className="h-2.5 bg-stone-700 rounded-t -mt-4 -mx-4 mb-2 flex items-center justify-center border-b border-stone-900 shadow-sm" />

            {/* Ticket Header */}
            <div className="border-b-2 border-dashed border-stone-400 pb-2 mb-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-stone-700">
                <span className="flex items-center gap-1">
                  <ScrollText className="w-3.5 h-3.5 text-amber-800" />
                  KRUSTY KRAB ORDER TICKET REEL
                </span>
                <button 
                  onClick={() => setLogMessages(["[00:00:00] TAPE TEAR: Galley audit reel refreshed."])} 
                  className="text-[9px] text-stone-500 hover:text-stone-900 flex items-center gap-0.5 underline"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Tear Tape
                </button>
              </div>
              <div className="text-[9px] text-stone-500 tracking-tight mt-0.5">
                TABLE: SOC-01 &bull; REG: #KRABS-402 &bull; NIST LOG
              </div>
            </div>

            {/* Ticket Tape Entries */}
            <div className="font-mono text-[10px] text-stone-800 space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
              {logMessages.map((msg, i) => (
                <div key={i} className="leading-snug border-b border-stone-200 pb-0.5">
                  {msg}
                </div>
              ))}
            </div>

            {/* Perforated Tear Bottom */}
            <div className="mt-3 pt-1 border-t-2 border-dashed border-stone-400 text-[8px] text-stone-400 text-center tracking-widest uppercase">
              - - - - - PERFORATED TEAR-OFF LINE - - - - -
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. QUICK RULES & S.O.P. MODAL */}
      {/* ========================================================================= */}
      {showQuickRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-galley-950/85 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-gradient-to-b from-galley-900 to-galley-950 border-4 border-brass-600 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <BrassCornerBracket position="tl" />
            <BrassCornerBracket position="tr" />
            <BrassCornerBracket position="bl" />
            <BrassCornerBracket position="br" />

            <div className="flex justify-between items-center border-b-2 border-brass-700/60 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brass-400" />
                <h3 className="font-display font-black text-lg text-brass-100 uppercase tracking-wider">
                  GALLEY TABLETOP QUICK S.O.P. RULES
                </h3>
              </div>
              <button
                onClick={() => setShowQuickRules(false)}
                className="p-1 rounded-lg text-parchment-400 hover:text-white hover:bg-galley-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-parchment-200">
              <div className="p-3.5 bg-galley-950 rounded-2xl border border-brass-800/60">
                <span className="text-brass-300 font-display font-bold text-sm block mb-1">
                  1. The Secret Attack Portholes (4 Slots)
                </span>
                <p className="text-parchment-300/90 leading-relaxed">
                  Four attack cards sit behind closed porthole shutters: <strong className="text-barnacle-400">1. Initial Compromise</strong>, <strong className="text-brass-400">2. Pivot &amp; Escalate</strong>, <strong className="text-purple-400">3. Persistence</strong>, and <strong className="text-yellow-500">4. C2 &amp; Exfiltration</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-galley-950 rounded-2xl border border-brass-800/60">
                <span className="text-marine-300 font-display font-bold text-sm block mb-1">
                  2. Defensive Procedures &amp; d20 Checks
                </span>
                <p className="text-parchment-300/90 leading-relaxed">
                  Select a procedure from the Galley Clipboard (Endpoint, Network, Logs, Controls) and roll the <strong>d20</strong> in the octagonal tray. Equal or higher than the Target DC opens the shutter and neutralizes the breach vector.
                </p>
              </div>

              <div className="p-3.5 bg-galley-950 rounded-2xl border border-brass-800/60">
                <span className="text-kelp-300 font-display font-bold text-sm block mb-1">
                  3. Boiler Strikes &amp; Overpressure Catastrophe
                </span>
                <p className="text-parchment-300/90 leading-relaxed">
                  Failed checks increase <strong>Boiler Pressure by +10 PSI (1 Strike)</strong>. Every 2 strikes trigger an automatic <strong>Kitchen Hazard Inject</strong>. If pressure reaches <strong>100 PSI (10 Strikes)</strong>, the boiler blows out and Plankton steals the Secret Formula!
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-brass-700/40">
              <span className="text-[10px] text-parchment-400/60 font-mono">
                Shortcuts: [F] Surveillance &bull; [R] Reset Breach &bull; [?] Rules
              </span>
              <button
                onClick={() => setShowQuickRules(false)}
                className="px-5 py-2 bg-gradient-to-r from-brass-400 to-brass-600 hover:from-brass-300 hover:to-brass-500 text-galley-950 font-display font-black rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Return to Galley Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
