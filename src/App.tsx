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
    <div className="min-h-screen bg-galley-950 text-parchment-100 flex flex-col font-sans selection:bg-brass-500 selection:text-galley-950">
      {/* Top Ship's Wooden Signboard & Brass Plaque */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Galley Tabletop Workspace */}
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

      {/* Undersea Maritime Ship's Transom Footer */}
      <footer className="bg-gradient-to-t from-galley-950 via-galley-900 to-galley-950 border-t-2 border-brass-800/80 py-8 text-xs font-mono text-parchment-400 relative">
        {/* Brass Header Trim */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brass-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-brass-800/80 border border-brass-500/60 flex items-center justify-center text-brass-300 shadow-sm">
              <Anchor className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-brass-200 font-display tracking-wider">KRABS AGAINST SECURITY</strong> &bull; Undersea SOC Incident Response Game
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-parchment-300/80 flex-wrap justify-center">
            <span>Based on <em>Backdoors &amp; Breaches</em> by BHIS (CC BY-SA 4.0)</span>
            <span>&bull;</span>
            <a 
              href="https://krabs.ketron.dev" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-brass-400 hover:text-brass-200 underline decoration-brass-600 underline-offset-2 flex items-center gap-1 font-bold"
            >
              <Compass className="w-3 h-3 text-brass-400" />
              krabs.ketron.dev
            </a>
            <span>&bull;</span>
            <span className="text-brass-500/80 font-mono">Tier 0 Procedural Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
