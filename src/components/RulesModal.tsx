import React from 'react';
import { 
  ShieldAlert, 
  BookOpen, 
  Award, 
  Terminal
} from 'lucide-react';

export const RulesView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Rules Hero Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-amber-400 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl text-slate-100 uppercase tracking-wider">
              HOW TO PLAY: KRABS AGAINST SECURITY
            </h2>
            <p className="font-mono text-xs text-amber-400 mt-0.5">
              Incident Response Tabletop Simulation &bull; Rules &amp; Framework Guide
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>Krabs Against Security (K.A.S.)</strong> is a cooperative cybersecurity incident response tabletop card game. One or more <strong>Defenders</strong> (SOC analysts, incident commanders, forensics investigators) work together to uncover and contain an unfolding cyber attack against the Krusty Krab corporate network before <strong>APT-Chum (Plankton)</strong> steals the legendary Krabby Patty Secret Formula.
        </p>
      </div>

      {/* The 4-Step Game Loop */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          THE CORE INCIDENT RESPONSE LOOP
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 shadow-inner">
            <span className="text-amber-400 font-display font-bold text-sm block">1. The Secret Attack Chain</span>
            <p className="text-slate-300 leading-relaxed">
              At the beginning of an incident, 4 cards are secretly dealt face-down representing the attacker&apos;s kill chain:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-red-400">Initial Compromise:</strong> Infiltration vector into the network.</li>
              <li><strong className="text-amber-400">Pivot &amp; Escalate:</strong> Lateral movement &amp; privilege theft.</li>
              <li><strong className="text-purple-400">Persistence:</strong> Hidden footholds surviving reboots.</li>
              <li><strong className="text-amber-500">C2 &amp; Exfiltration:</strong> Command beaconing and formula egress.</li>
            </ul>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 shadow-inner">
            <span className="text-sky-300 font-display font-bold text-sm block">2. Investigation &amp; d20 Checks</span>
            <p className="text-slate-300 leading-relaxed">
              Defenders deliberate and choose which phase or asset to investigate, activating an applicable <strong>Defensive Procedure</strong> (e.g. <em>Endpoint Forensics</em>, <em>Network Sniffing</em>, <em>SIEM Log Analysis</em>).
            </p>
            <p className="text-slate-300 leading-relaxed">
              The defender rolls a twenty-sided die (<strong>d20</strong>) in the dice tray, comparing the result plus active modifiers against the procedure&apos;s Difficulty Check target (typically <strong>11+</strong> for initial detection, <strong>14+ to 15+</strong> for full containment).
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 shadow-inner">
            <span className="text-emerald-400 font-display font-bold text-sm block">3. Resolution: Success vs. Failure</span>
            <p className="text-slate-300 leading-relaxed">
              <strong>Success (Roll &ge; Target):</strong> The Incident Master reveals the corresponding breach card, providing telemetry clues and allowing defenders to contain and neutralize that attack phase.
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong>Failure (Roll &lt; Target):</strong> The investigation turns up zero actionable intelligence, and a <strong>Boiler Pressure Strike (+10 PSI)</strong> is recorded on the Strike Tracker.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 shadow-inner">
            <span className="text-red-400 font-display font-bold text-sm block">4. Operational Injects &amp; Doom Clock</span>
            <p className="text-slate-300 leading-relaxed">
              Every 2 strikes (or upon rolling a <strong>Natural 1</strong>), an <strong>Operational Inject</strong> detonates! Injects simulate real-world crisis chaos: executive micromanagement, physical cable disconnection, regulatory audits, or expired SSL certificates.
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong>Win Condition:</strong> Neutralize all 4 attack phases before reaching 10 strikes.<br/>
              <strong>Defeat Condition:</strong> Accumulate 10 strikes, resulting in boiler blowout and total formula loss!
            </p>
          </div>
        </div>
      </div>

      {/* NIST & MITRE Pedagogical Alignment */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-400" />
          EDUCATIONAL FRAMEWORKS: NIST SP 800-61r2 &amp; MITRE ATT&amp;CK
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          While Krabs Against Security adopts an undersea parody setting, 100% of the game&apos;s mechanics and attack vectors are strictly mapped to authentic cybersecurity standards:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
            <span className="font-display font-bold text-amber-400 block mb-1">MITRE ATT&amp;CK</span>
            <p className="text-slate-400">
              Every attack card in Initial Compromise, Pivot &amp; Escalate, Persistence, and C2 maps to a verifiable ATT&amp;CK technique ID (e.g. T1566.001, T1059.001, T1547.001, T1071.004).
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
            <span className="font-display font-bold text-sky-400 block mb-1">NIST SP 800-61r2</span>
            <p className="text-slate-400">
              Procedures enforce the standard lifecycle: Preparation &rarr; Detection &amp; Analysis &rarr; Containment, Eradication &amp; Recovery &rarr; Post-Incident Activity.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
            <span className="font-display font-bold text-emerald-400 block mb-1">Probability Balance</span>
            <p className="text-slate-400">
              Unmodified d20 checks of 11+ yield a 50% baseline success rate. Coordinated teams with effective procedure prioritization achieve ~85% victory rates under normal conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Licensing & Legal Attribution */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-display font-bold text-lg text-emerald-400 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          LICENSING &amp; ATTRIBUTION (CC BY-SA 4.0)
        </h3>

        <div className="space-y-3 font-mono text-xs text-slate-300">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
            <span className="font-display font-bold text-white block mb-1">Attribution to Black Hills Information Security:</span>
            <p className="leading-relaxed">
              <em>Krabs Against Security</em> is an educational parody based on <strong>Backdoors &amp; Breaches</strong> created by <strong>Black Hills Information Security (BHIS)</strong> under lead designer John Strand.
            </p>
            <p className="mt-2 text-slate-400">
              Licensed under <strong>Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong>.<br />
              Original Project: <a href="https://www.blackhillsinfosec.com/projects/backdoors-and-breaches/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">https://www.blackhillsinfosec.com/projects/backdoors-and-breaches/</a>
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1 shadow-inner">
            <span className="font-display font-bold text-slate-200 block">Parody Fair Use Disclaimer:</span>
            <p>
              Krabs Against Security is an independent educational parody designed for cybersecurity training. It is not affiliated with, sponsored by, or endorsed by Nickelodeon, Paramount Global, or ViacomCBS. All character references and undersea corporate tropes represent satirical commentary protected under U.S. copyright and trademark fair-use doctrine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
