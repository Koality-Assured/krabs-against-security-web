import React, { useState } from 'react';
import cardsData from './data/cards.json';
import { CardData } from './types/card';
import { Navbar, NavTab } from './components/Navbar';
import { TabletopBoard } from './components/TabletopBoard';
import { PrintStudio } from './components/PrintStudio';
import { CardCatalog } from './components/CardCatalog';
import { RulesView } from './components/RulesModal';
import { Anchor, Compass } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('tabletop');
  const allCards: CardData[] = cardsData as CardData[];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Modern High-Contrast Navbar */}
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

      {/* Clean Modern Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-800/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-sm">
              <Anchor className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-slate-200 font-display tracking-wide">KRABS AGAINST SECURITY</strong> &bull; Incident Response Tabletop Simulation
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-400 flex-wrap justify-center">
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
            <span className="text-slate-500 font-mono">Tier 0 Procedural Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
