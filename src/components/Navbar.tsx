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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-galley-950 via-galley-900 to-galley-950 border-b-4 border-brass-800/90 shadow-2xl backdrop-blur-md relative">
      {/* Brass Edge Trim & Specular Highlight */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brass-400/40 to-transparent pointer-events-none" />
      <div className="absolute -bottom-1 inset-x-0 h-0.5 bg-black/60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Plaque: Engraved Ship's Brass Nameplate */}
        <div 
          onClick={() => handleNav('tabletop')} 
          className="relative px-3 py-1.5 rounded-xl bg-gradient-to-b from-galley-900/90 via-galley-850 to-galley-950 border-2 border-brass-600/70 shadow-lg flex items-center gap-3 cursor-pointer group transition-transform hover:scale-[1.01]"
        >
          {/* Decorative Corner Brass Rivets */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-brass-300 border border-brass-900 shadow-xs" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brass-300 border border-brass-900 shadow-xs" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-brass-300 border border-brass-900 shadow-xs" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-brass-300 border border-brass-900 shadow-xs" />

          {/* Emblem: Brass Anchor & Patty Sigil */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-barnacle-800 via-brass-700 to-galley-900 p-0.5 shadow-md border border-brass-400/80 flex items-center justify-center transform group-hover:rotate-3 transition-transform">
            <div className="w-full h-full rounded-[6px] bg-gradient-to-b from-galley-900 to-black flex items-center justify-center relative overflow-hidden">
              <Anchor className="w-5 h-5 text-brass-300 drop-shadow" />
              <div className="absolute inset-0 bg-radial from-brass-400/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-base sm:text-lg md:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-brass-100 via-brass-300 to-brass-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
                KRABS AGAINST SECURITY
              </span>
              <span className="bg-brass-950/80 text-brass-300 border border-brass-500/50 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-widest shadow-inner">
                GALLEY SOC
              </span>
            </div>
            <p className="hidden sm:block text-[10px] font-mono text-parchment-300/70">
              Krusty Krab Incident Response Tabletop &bull; Based on Backdoors &amp; Breaches
            </p>
          </div>
        </div>

        {/* Navigation Tabs: Brass Ship Tokens */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => handleNav('tabletop')}
            className={`px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'tabletop' 
                ? 'bg-gradient-to-b from-brass-300 via-brass-500 to-brass-600 text-galley-950 shadow-[0_2px_10px_rgba(245,158,11,0.35)] border border-brass-200' 
                : 'text-parchment-200 hover:text-brass-100 hover:bg-galley-800/80 border border-brass-800/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Galley Tabletop</span>
            <span className="md:hidden">Play</span>
          </button>

          <button
            onClick={() => handleNav('print')}
            className={`px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'print' 
                ? 'bg-gradient-to-b from-brass-300 via-brass-500 to-brass-600 text-galley-950 shadow-[0_2px_10px_rgba(245,158,11,0.35)] border border-brass-200' 
                : 'text-parchment-200 hover:text-brass-100 hover:bg-galley-800/80 border border-brass-800/40'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Print &amp; Play</span>
            <span className="md:hidden">Print</span>
          </button>

          <button
            onClick={() => handleNav('catalog')}
            className={`px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'catalog' 
                ? 'bg-gradient-to-b from-brass-300 via-brass-500 to-brass-600 text-galley-950 shadow-[0_2px_10px_rgba(245,158,11,0.35)] border border-brass-200' 
                : 'text-parchment-200 hover:text-brass-100 hover:bg-galley-800/80 border border-brass-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">All 80 Cards</span>
            <span className="md:hidden">Cards</span>
          </button>

          <button
            onClick={() => handleNav('rules')}
            className={`px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'rules' 
                ? 'bg-gradient-to-b from-brass-300 via-brass-500 to-brass-600 text-galley-950 shadow-[0_2px_10px_rgba(245,158,11,0.35)] border border-brass-200' 
                : 'text-parchment-200 hover:text-brass-100 hover:bg-galley-800/80 border border-brass-800/40'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rules &amp; S.O.P.</span>
            <span className="md:hidden">Rules</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-xl bg-galley-900 border border-brass-700/60 hover:border-brass-400 text-parchment-300 hover:text-brass-200 transition-colors flex items-center justify-center shadow-inner ml-1"
            title={isMuted ? "Unmute Nautical Audio" : "Mute Nautical Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-barnacle-500" /> : <Volume2 className="w-4 h-4 text-kelp-400" />}
          </button>

          {/* External GitHub Link */}
          <a
            href="https://github.com/Koality-Assured/krabs-against-security-web"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl bg-galley-900 border border-brass-700/60 hover:border-brass-400 text-parchment-300 hover:text-brass-200 transition-colors flex items-center justify-center shadow-inner"
            title="View Source on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </header>
  );
};
