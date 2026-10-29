import React, { useState } from 'react';
import cardsData from './data/cards.json';
import { CardData } from './types/card';
import { Navbar, NavTab } from './components/Navbar';
import { TabletopBoard } from './components/TabletopBoard';
import { PrintStudio } from './components/PrintStudio';
import { CardCatalog } from './components/CardCatalog';
import { RulesView } from './components/RulesModal';
import { Anchor, Compass, Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('tabletop');
  const allCards: CardData[] = cardsData as CardData[];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 wood-plank-bg">
      {/* Modern High-Contrast Nautical Navbar */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Tabletop Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'tabletop' && (
          <TabletopBoard allCards={allCards} onOpenCatalog={() => setCurrentTab('catalog')} />
        )}

        {currentTab === 'print' && (
          <PrintStudio cards={allCards} />
        )}

        {currentTab === 'catalog' && (
          <CardCatalog cards={allCards} />
        )}

        {currentTab === 'rules' && (
          <RulesView />
        )}
      </main>

      {/* Krusty Galley Brass Footer */}
      <footer className="bg-galley-950/90 border-t border-amber-900/40 py-6 text-xs text-amber-200/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 shadow-sm">
              <Anchor className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-amber-100 font-display tracking-wide">KRABS AGAINST SECURITY</strong> &bull; Incident Response Tabletop Simulation
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs text-amber-200/70 flex-wrap justify-center">
            <span>Based on <em>Backdoors &amp; Breaches</em> by BHIS (CC BY-SA 4.0)</span>
            <span>&bull;</span>
            <a 
              href="https://krabs.ketron.dev" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline decoration-amber-500/40 underline-offset-2 flex items-center gap-1 font-semibold transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              krabs.ketron.dev
            </a>
            <span>&bull;</span>
            <span className="text-amber-300/60 font-mono flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-500" />
              Krusty Krab SOC
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
