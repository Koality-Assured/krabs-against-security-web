import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { 
  ShieldAlert, 
  Printer, 
  Layers, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Github 
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
    <header className="sticky top-0 z-50 bg-ocean-950/90 backdrop-blur-md border-b-2 border-amber-500/30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => handleNav('tabletop')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-amber-700 p-0.5 shadow-lg border border-amber-400/50 flex items-center justify-center transform group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-yellow-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-lg sm:text-xl tracking-wider text-amber-100 uppercase group-hover:text-amber-300 transition-colors drop-shadow">
                KRABS AGAINST SECURITY
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-tight">
                SOC v1.0
              </span>
            </div>
            <p className="hidden sm:block text-[10px] font-mono text-slate-400">
              Cybersecurity Incident Response Tabletop &bull; Based on Backdoors &amp; Breaches
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handleNav('tabletop')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${currentTab === 'tabletop' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-300 hover:text-white hover:bg-ocean-900/60'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tabletop Board</span>
            <span className="md:hidden">Play</span>
          </button>

          <button
            onClick={() => handleNav('print')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${currentTab === 'print' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-300 hover:text-white hover:bg-ocean-900/60'}`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Print &amp; Play</span>
            <span className="md:hidden">Print</span>
          </button>

          <button
            onClick={() => handleNav('catalog')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${currentTab === 'catalog' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-300 hover:text-white hover:bg-ocean-900/60'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">All 80 Cards</span>
            <span className="md:hidden">Cards</span>
          </button>

          <button
            onClick={() => handleNav('rules')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${currentTab === 'rules' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-300 hover:text-white hover:bg-ocean-900/60'}`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rules &amp; License</span>
            <span className="md:hidden">Rules</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-ocean-900 transition-colors ml-1"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* External GitHub Link */}
          <a
            href="https://github.com/Koality-Assured/krabs-against-security-web"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-ocean-900 transition-colors"
            title="View on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </header>
  );
};
