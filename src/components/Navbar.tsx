import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { 
  ShieldAlert, 
  Printer, 
  Layers, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Github,
  Anchor
} from 'lucide-react';

export type NavTab = 'tabletop' | 'print' | 'catalog' | 'rules';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleNav = (tab: NavTab) => {
    sound.playClick();
    onSelectTab(tab);
  };

  return (
    <header className="sticky top-0 z-50 bg-galley-950/90 backdrop-blur-md border-b border-amber-900/40 shadow-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
        {/* Brand Plaque */}
        <div 
          onClick={() => handleNav('tabletop')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Emblem: Modern Nautical Shield */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-950/80 to-galley-950 border border-amber-600/40 flex items-center justify-center text-amber-400 shadow-md group-hover:border-amber-400 group-hover:text-amber-300 transition-all">
            <Anchor className="w-5 h-5 transition-transform group-hover:scale-105" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-base sm:text-lg tracking-wider text-amber-100 uppercase group-hover:text-amber-400 transition-colors">
                KRABS AGAINST SECURITY
              </span>
              <span className="hidden sm:inline-block bg-amber-950/80 text-amber-300 border border-amber-600/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-sm">
                INCIDENT RESPONSE
              </span>
            </div>
            <p className="hidden md:block text-xs font-mono text-amber-200/70">
              Cybersecurity Incident Response Tabletop &bull; Based on Backdoors &amp; Breaches
            </p>
          </div>
        </div>

        {/* Navigation Tabs: Sleek Modern Pills */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handleNav('tabletop')}
            className={`px-3 py-1.5 rounded-full font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentTab === 'tabletop' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                : 'text-amber-200/80 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tabletop Board</span>
            <span className="md:hidden">Board</span>
          </button>

          <button
            onClick={() => handleNav('print')}
            className={`px-3 py-1.5 rounded-full font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentTab === 'print' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                : 'text-amber-200/80 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Print &amp; Play</span>
            <span className="md:hidden">Print</span>
          </button>

          <button
            onClick={() => handleNav('catalog')}
            className={`px-3 py-1.5 rounded-full font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentTab === 'catalog' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                : 'text-amber-200/80 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">All 80 Cards</span>
            <span className="md:hidden">Cards</span>
          </button>

          <button
            onClick={() => handleNav('rules')}
            className={`px-3 py-1.5 rounded-full font-sans text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentTab === 'rules' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                : 'text-amber-200/80 hover:text-white hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rules &amp; S.O.P.</span>
            <span className="md:hidden">Rules</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className="w-8 h-8 rounded-full bg-slate-900 border border-amber-900/40 hover:border-amber-600/40 text-amber-200/80 hover:text-white transition-colors flex items-center justify-center shadow-sm ml-1"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* External GitHub Link */}
          <a
            href="https://github.com/Koality-Assured/krabs-against-security-web"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-slate-900 border border-amber-900/40 hover:border-amber-600/40 text-amber-200/80 hover:text-white transition-colors flex items-center justify-center shadow-sm"
            title="View Source on GitHub"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </header>
  );
};
