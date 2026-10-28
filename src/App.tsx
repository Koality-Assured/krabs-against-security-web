import React, { useState } from 'react';
import cardsData from './data/cards.json';
import { CardData } from './types/card';
import { Navbar, NavTab } from './components/Navbar';
import { TabletopBoard } from './components/TabletopBoard';
import { PrintStudio } from './components/PrintStudio';
import { CardCatalog } from './components/CardCatalog';
import { RulesView } from './components/RulesModal';
import { Anchor } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('tabletop');
  const allCards: CardData[] = cardsData as CardData[];

  return (
    <div className="min-h-screen bg-ocean-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-ocean-950">
      {/* Top Fixed / Sticky Navigation */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Workspace */}
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

      {/* Undersea Maritime Footer */}
      <footer className="bg-ocean-950 border-t border-amber-500/20 py-8 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Krabs Against Security</strong> &bull; Undersea SOC Incident Response Game
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Based on <em>Backdoors &amp; Breaches</em> by BHIS (CC BY-SA 4.0)</span>
            <span>&bull;</span>
            <a 
              href="https://krabs.ketron.dev" 
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              krabs.ketron.dev
            </a>
            <span>&bull;</span>
            <span className="text-slate-500">Tier 0 Procedural Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
