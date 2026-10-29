import React from 'react';
import { 
  ShieldAlert, 
  BookOpen, 
  Award, 
  Terminal,
  Printer,
  Compass,
  Target,
  Activity,
  Clock,
  Users,
  ShieldCheck
} from 'lucide-react';

export const RulesView: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Top Facilitator Header & Print Toolbar */}
      <div className="bg-galley-950/85 border border-amber-900/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-950/70 border border-amber-600/40 flex items-center justify-center text-amber-400 shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-amber-100 uppercase tracking-wider">
              FACILITATOR&apos;S TABLETOP GUIDE &bull; PLAYER REFERENCE
            </h2>
            <p className="font-mono text-xs text-amber-200/70 mt-0.5">
              Incident Response Tabletop Simulation &bull; Krabs Against Security Standard
            </p>
          </div>
        </div>

        {/* Print Guide Button */}
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all active:translate-y-0.5"
        >
          <Printer className="w-4 h-4" />
          <span>Print Facilitator Guide</span>
        </button>
      </div>

      {/* Guide Overview & Exercise Synopsis */}
      <div className="bg-galley-950/85 border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Tabletop Simulation Framework Overview</span>
        </div>
        <h3 className="font-display font-black text-2xl sm:text-3xl text-amber-100">
          Defending the Krusty Krab: Cybersecurity Incident Response
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>Krabs Against Security (K.A.S.)</strong> is a collaborative, turn-based incident response exercise designed for security operation center (SOC) analysts, engineers, CISOs, and IT teams. Based on the open-source <em>Backdoors &amp; Breaches</em> standard by Black Hills Information Security (BHIS), players coordinate to detect, analyze, and neutralize an active intrusion orchestrated by <strong>APT-Chum (Plankton)</strong> before the Krabby Patty Secret Formula is exfiltrated or boiler pressure hits critical blowout.
        </p>

        {/* Quick Facts Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/30">
            <span className="text-amber-400 block font-bold mb-0.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Team Size
            </span>
            <span className="text-slate-200">1 to 8 Defenders</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/30">
            <span className="text-amber-400 block font-bold mb-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Duration
            </span>
            <span className="text-slate-200">45 to 60 Minutes</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/30">
            <span className="text-amber-400 block font-bold mb-0.5 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Core Engine
            </span>
            <span className="text-slate-200">d20 Checks vs DC</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/30">
            <span className="text-amber-400 block font-bold mb-0.5 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Alignment
            </span>
            <span className="text-slate-200">NIST SP 800-61r2</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STEP-BY-STEP FACILITATOR WALKTHROUGH */}
      {/* ========================================================================= */}
      <div className="bg-galley-950/85 border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex items-center gap-2 border-b border-amber-900/40 pb-3">
          <Terminal className="w-5 h-5 text-amber-400" />
          <h3 className="font-display font-black text-xl text-amber-100 uppercase tracking-wider">
            STEP-BY-STEP FACILITATOR WALKTHROUGH (45-60 MINUTES)
          </h3>
        </div>

        <div className="space-y-5 text-xs font-mono">
          {/* Phase 1 */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-900/30 space-y-2">
            <div className="flex items-center justify-between text-amber-400 font-display font-bold text-sm">
              <span>PHASE 1: BRIEFING &amp; SCENARIO ARMING (0:00 - 0:10)</span>
              <span className="text-slate-400 text-xs font-mono">10 MIN</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              1. <strong>Assign Defender Roles:</strong> For groups of 3+, designate an <em>Incident Commander</em> (coordinates strategy), <em>Lead Forensics Analyst</em> (nominates endpoint/log procedures), and <em>Communications Officer</em> (manages injects &amp; public disclosures).
            </p>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              2. <strong>Arm the 4 Attack Slots:</strong> Select a preset campaign from the scenario menu (or deal a randomized breach). The four attack cards sit face-down:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong className="text-red-400">Initial Compromise:</strong> How the perimeter was breached (e.g. Spear Phishing with Chum, Unpatched Kelp Server).</li>
              <li><strong className="text-amber-400">Pivot &amp; Escalate:</strong> Lateral movement and privilege escalation across kitchen VLANs.</li>
              <li><strong className="text-purple-400">Persistence:</strong> Covert mechanisms maintaining footholds through system restarts.</li>
              <li><strong className="text-amber-500">C2 &amp; Exfiltration:</strong> Covert outbound channels actively siphoning the Secret Formula.</li>
            </ul>
            <p className="text-slate-400 italic">
              <strong>Facilitator Peephole Tip:</strong> Press &lsquo;F&rsquo; to toggle Facilitator Peephole mode. This reveals the cards to you while keeping defenders blind!
            </p>
          </div>

          {/* Phase 2 */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-900/30 space-y-2">
            <div className="flex items-center justify-between text-sky-300 font-display font-bold text-sm">
              <span>PHASE 2: INVESTIGATION TURNS &amp; PROCEDURE CHECKS (0:10 - 0:40)</span>
              <span className="text-slate-400 text-xs font-mono">30 MIN</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              1. <strong>Deliberation &amp; S.O.P. Selection:</strong> Defenders discuss the current breach indicators and select an active <strong>Defensive Procedure</strong> from the 16 available cards (e.g., <em>Endpoint Forensics</em>, <em>Network Sniffing</em>, <em>SIEM Log Correlation</em>).
            </p>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              2. <strong>Select Check Goal:</strong> Dual-check procedures feature two distinct targets:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong className="text-sky-300">Roll for Detection (DC 11+):</strong> Success flips the shutter on the corresponding vector and reveals the attack vector to the team.</li>
              <li><strong className="text-emerald-300">Roll for Containment (DC 14+/15+):</strong> Success neutralizes the vector, applying the emerald incident seal.</li>
            </ul>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              3. <strong>Roll the d20:</strong> Defender rolls in the tray. Compare roll + modifiers against the target DC.
            </p>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              4. <strong>Adjudication:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong className="text-emerald-400">Success (&ge; Target):</strong> Vector revealed or contained! Facilitator narrates what technical evidence was uncovered.</li>
              <li><strong className="text-red-400">Failure (&lt; Target):</strong> Investigation yielded zero actionable intelligence. <strong>+1 Boiler Strike (+10 PSI)</strong> is recorded!</li>
            </ul>
          </div>

          {/* Phase 3 */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-900/30 space-y-2">
            <div className="flex items-center justify-between text-amber-400 font-display font-bold text-sm">
              <span>PHASE 3: CRISIS INJECTS &amp; BOILER PRESSURE (0:40 - 0:50)</span>
              <span className="text-slate-400 text-xs font-mono">10 MIN</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              1. <strong>Automatic Injects:</strong> Every 2 strikes incurred (Strikes 2, 4, 6, 8) or on a <strong>Natural 1</strong>, draw an <strong>Operational Inject</strong>!
            </p>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              2. <strong>Adjudicating Injects:</strong> Injects represent enterprise chaos (Health Inspector audit, ransomware note on POS receipts, corporate legal gag orders). Read the inject aloud and enforce its operational restriction until resolved.
            </p>
          </div>

          {/* Phase 4 */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-900/30 space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-display font-bold text-sm">
              <span>PHASE 4: RESOLUTION &amp; HOT-WASH DEBRIEF (0:50 - 1:00)</span>
              <span className="text-slate-400 text-xs font-mono">10 MIN</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              1. <strong>Victory Condition:</strong> Contain all 4 breach vectors before reaching 10 strikes (100 PSI). The Secret Formula is saved!
            </p>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              2. <strong>Defeat Condition:</strong> Reaching 10 strikes triggers catastrophic boiler blowout. Plankton exfiltrates the formula and the Krusty Krab is shuttered.
            </p>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              3. <strong>Hot-Wash Retrospective:</strong> Conclude by asking the team:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li>Which defensive procedures gave us the highest return on investment?</li>
              <li>Where did our internal communication break down during injects?</li>
              <li>Do we have documented procedures in our actual organization for the vectors faced today?</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE '+3 PROCEDURE IN PLACE' RULE & DOOM CLOCK ADJUDICATION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Procedure in Place Card */}
        <div className="bg-galley-950/85 border border-amber-900/40 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h4 className="font-display font-bold text-base text-amber-100 uppercase tracking-wide">
              THE &lsquo;+3 PROCEDURE IN PLACE&rsquo; RULE
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The single most impactful rule in <em>Backdoors &amp; Breaches</em> is the <strong>Procedure in Place (+3 Modifier)</strong>.
          </p>
          <div className="bg-slate-950/90 p-3.5 rounded-xl border border-amber-600/30 text-xs font-mono text-amber-200">
            <strong>Rule:</strong> If defenders can articulate that their organization maintains a written, documented Standard Operating Procedure (SOP) or playbook for the active procedure, they toggle the <strong>+3 Procedure in Place</strong> bonus on the dice tray.
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Pedagogical Impact:</strong> An unmodified d20 check against DC 11 has a 50% success probability. With a documented procedure (+3), success increases to <strong>65%</strong>. For DC 15 containment checks, the bonus increases success from 30% to <strong>45%</strong>, proving to leadership that written playbooks directly reduce breach severity.
          </p>
        </div>

        {/* 10-Strike Doom Clock */}
        <div className="bg-galley-950/85 border border-amber-900/40 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <Activity className="w-5 h-5 text-red-400" />
            <h4 className="font-display font-bold text-base text-amber-100 uppercase tracking-wide">
              THE 10-STRIKE BOILER PRESSURE CLOCK
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every failed check wastes precious response time and raises boiler pressure by <strong>+1 Strike (+10 PSI)</strong>.
          </p>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="bg-slate-950/90 p-2.5 rounded-lg border border-emerald-500/30 text-emerald-300 flex justify-between items-center">
              <span>0-30 PSI: Nominal Operation</span>
              <span className="text-[10px]">Standard Triage</span>
            </div>
            <div className="bg-slate-950/90 p-2.5 rounded-lg border border-amber-500/30 text-amber-300 flex justify-between items-center">
              <span>40-70 PSI: Hazard Escalation</span>
              <span className="text-[10px]">Inject Every 2 Strikes</span>
            </div>
            <div className="bg-slate-950/90 p-2.5 rounded-lg border border-red-500/30 text-red-300 flex justify-between items-center">
              <span>80-90 PSI: Critical Breach Imminent</span>
              <span className="text-[10px]">High Alarm</span>
            </div>
            <div className="bg-red-950/80 p-2.5 rounded-lg border border-red-500 text-red-200 flex justify-between items-center font-bold">
              <span>100 PSI: Catastrophic Blowout</span>
              <span className="text-[10px]">Defeat &bull; Formula Lost</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. THE 4 KILL-CHAIN ATTACK DECKS */}
      {/* ========================================================================= */}
      <div className="bg-galley-950/85 border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="font-display font-black text-xl text-amber-100 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          THE 4 KILL-CHAIN ATTACK DECKS (THE ADVERSARY)
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The threat model represents APT-Chum&apos;s full attack progression, rigorously aligned to MITRE ATT&amp;CK:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-red-500/40 space-y-2">
            <span className="bg-red-700 text-red-100 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
              1. Initial Compromise
            </span>
            <p className="text-slate-300 leading-relaxed">
              Infiltration vectors penetrating outer perimeter reef defenses. Includes spearphishing, unpatched edge servers, USB duckies, grease-trap physical intrusion, and npm supply-chain compromise.
            </p>
            <span className="text-red-300 text-[10px] block">ATT&amp;CK: T1566, T1190, T1200, T1195</span>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-amber-500/40 space-y-2">
            <span className="bg-amber-600 text-amber-100 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
              2. Pivot &amp; Escalate
            </span>
            <p className="text-slate-300 leading-relaxed">
              Lateral traversal across kitchen VLANs and credential theft. Includes password spraying, Pass-the-Hash, Kerberoasting, sudo token harvesting, and SSH key scavenging.
            </p>
            <span className="text-amber-300 text-[10px] block">ATT&amp;CK: T1110, T1550, T1558, T1068</span>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-purple-500/40 space-y-2">
            <span className="bg-purple-700 text-purple-100 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
              3. Persistence
            </span>
            <p className="text-slate-300 leading-relaxed">
              Hidden barnacle footholds that survive system restarts and forensic scrubs. Includes cron jobs, registry run keys, web shells in formula portals, and rogue service accounts.
            </p>
            <span className="text-purple-300 text-[10px] block">ATT&amp;CK: T1053, T1547, T1505, T1136</span>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-yellow-800/60 space-y-2">
            <span className="bg-yellow-800 text-yellow-100 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
              4. C2 &amp; Exfiltration
            </span>
            <p className="text-slate-300 leading-relaxed">
              Undersea beaconing channels and secret formula egress. Includes DNS tunneling, encrypted HTTPS web sockets, ICMP echo stealth channels, and cloud storage egress.
            </p>
            <span className="text-amber-400 text-[10px] block">ATT&amp;CK: T1071, T1572, T1567, T1041</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. THE 16 DEFENSIVE PROCEDURES REFERENCE */}
      {/* ========================================================================= */}
      <div className="bg-galley-950/85 border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="font-display font-black text-xl text-sky-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          THE 16 DEFENSIVE PROCEDURES REFERENCE
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Defenders invoke these procedural S.O.P.s during Phase 2. Each procedure has tailored d20 DC checks:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-sky-500/30 space-y-2">
            <span className="text-sky-300 font-display font-bold block text-sm">Endpoint &amp; Host</span>
            <ul className="space-y-1.5 text-slate-300">
              <li>&bull; Endpoint Forensics (DC 11+ / 14+)</li>
              <li>&bull; Antivirus &amp; EDR Deep Scrub (DC 12+)</li>
              <li>&bull; Volatile Memory Acquisition (DC 13+)</li>
              <li>&bull; Credential &amp; Key Revocation (DC 11+)</li>
            </ul>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-sky-500/30 space-y-2">
            <span className="text-sky-300 font-display font-bold block text-sm">Network &amp; Perimeter</span>
            <ul className="space-y-1.5 text-slate-300">
              <li>&bull; Network PCAP &amp; Sniffing (DC 11+ / 15+)</li>
              <li>&bull; DNS Sinkholing &amp; Null-Route (DC 11+)</li>
              <li>&bull; Firewall Rule Fortification (DC 12+)</li>
              <li>&bull; WAF &amp; Ingress Scrubbing (DC 11+)</li>
            </ul>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-sky-500/30 space-y-2">
            <span className="text-sky-300 font-display font-bold block text-sm">Log Telemetry &amp; SIEM</span>
            <ul className="space-y-1.5 text-slate-300">
              <li>&bull; SIEM Log Correlation (DC 11+ / 14+)</li>
              <li>&bull; POS Transaction Ledger Audit (DC 12+)</li>
              <li>&bull; Active Directory Auth Review (DC 11+)</li>
              <li>&bull; NetFlow Anomaly Inspection (DC 12+)</li>
            </ul>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-sky-500/30 space-y-2">
            <span className="text-sky-300 font-display font-bold block text-sm">Crisis Governance</span>
            <ul className="space-y-1.5 text-slate-300">
              <li>&bull; Backup Integrity Verification (DC 11+ / 15+)</li>
              <li>&bull; PR Shield &amp; Customer Notice (DC 11+)</li>
              <li>&bull; Corporate Legal Consultation (DC 12+)</li>
              <li>&bull; Physical Cable Disconnection (DC 10+)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. LICENSING & CC BY-SA 4.0 ATTRIBUTION */}
      {/* ========================================================================= */}
      <div className="bg-galley-950/85 border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="font-display font-bold text-lg text-emerald-400 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          STANDARDS, LICENSING &amp; ATTRIBUTION (CC BY-SA 4.0)
        </h3>

        <div className="space-y-3 font-mono text-xs text-slate-300">
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-900/30 space-y-2">
            <span className="font-display font-bold text-white block">Attribution to Black Hills Information Security:</span>
            <p className="leading-relaxed">
              <em>Krabs Against Security</em> is built directly on the game mechanics of <strong>Backdoors &amp; Breaches</strong>, created by <strong>Black Hills Information Security (BHIS)</strong> under lead designer John Strand.
            </p>
            <p className="text-slate-400">
              Licensed under <strong>Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong>.<br />
              Original Game &amp; Decks: <a href="https://www.blackhillsinfosec.com/projects/backdoors-and-breaches/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">https://www.blackhillsinfosec.com/projects/backdoors-and-breaches/</a>
            </p>
          </div>

          <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-900/30 text-slate-400 space-y-1">
            <span className="font-display font-bold text-slate-200 block">Parody Fair Use Statement:</span>
            <p>
              Krabs Against Security is an independent cybersecurity educational parody. It is not affiliated with, sponsored by, or endorsed by Nickelodeon, Paramount Global, or ViacomCBS. All nautical character references and undersea corporate tropes represent protected satirical commentary under U.S. copyright fair-use doctrine (17 U.S.C. &sect; 107).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
