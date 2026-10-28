import React, { useState, useMemo } from 'react';
import { CardData, DeckType, DECK_CONFIG } from '../types/card';
import { Card } from './Card';
import { sound } from '../utils/audio';
import { 
  Search, 
  RotateCw, 
  X, 
  ExternalLink, 
  Leaf, 
  Layers
} from 'lucide-react';

interface CardCatalogProps {
  cards: CardData[];
}

export const CardCatalog: React.FC<CardCatalogProps> = ({ cards }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeck, setSelectedDeck] = useState<DeckType | 'all'>('all');
  const [flipAllBacks, setFlipAllBacks] = useState<boolean>(false);
  const [ecoMode, setEcoMode] = useState<boolean>(false);
  const [activeModalCard, setActiveModalCard] = useState<CardData | null>(null);

  // Filter cards
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesDeck = selectedDeck === 'all' || card.deck === selectedDeck;
      if (!matchesDeck) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        card.title.toLowerCase().includes(q) ||
        card.id.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        (card.attackId && card.attackId.toLowerCase().includes(q)) ||
        (card.subtitle && card.subtitle.toLowerCase().includes(q)) ||
        (card.flavorText && card.flavorText.toLowerCase().includes(q))
      );
    });
  }, [cards, selectedDeck, searchQuery]);

  const deckCounts = useMemo(() => {
    const counts: Record<string, number> = { all: cards.length };
    cards.forEach(c => {
      counts[c.deck] = (counts[c.deck] || 0) + 1;
    });
    return counts;
  }, [cards]);

  return (
    <div className="space-y-6">
      {/* Catalog Header Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="font-display font-black text-lg sm:text-xl text-slate-100 uppercase tracking-wider">
              Card Repository (80 Cards)
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Complete Incident Response Dataset &bull; CC BY-SA 4.0 Open Tabletop Standard
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Flip All Cards */}
          <button
            onClick={() => { setFlipAllBacks(prev => !prev); sound.playCardFlip(); }}
            className="px-3.5 py-2 rounded-xl font-sans text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            {flipAllBacks ? 'Show Card Faces' : 'Show Card Backs'}
          </button>

          {/* Eco Mode Toggle */}
          <button
            onClick={() => { setEcoMode(prev => !prev); sound.playClick(); }}
            className={`px-3.5 py-2 rounded-xl font-sans text-xs font-semibold border flex items-center gap-1.5 shadow transition-all ${
              ecoMode 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Eco Mode: {ecoMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by card name, MITRE ATT&CK technique (e.g. T1566), ID, or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Deck Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedDeck('all'); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold border transition-all ${
              selectedDeck === 'all' 
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20' 
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            All Decks ({deckCounts.all || 0})
          </button>

          {Object.values(DECK_CONFIG).map(deck => {
            const isSelected = selectedDeck === deck.id;
            return (
              <button
                key={deck.id}
                onClick={() => { setSelectedDeck(deck.id); sound.playClick(); }}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold border transition-all flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20' 
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-black/40" 
                  style={{ backgroundColor: deck.colorHex }}
                />
                {deck.name} ({deckCounts[deck.id] || 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-xs font-mono text-slate-400 px-1">
        <span>Showing {filteredCards.length} of {cards.length} cards</span>
        <span>Click any card to inspect full mechanics and attack details</span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {filteredCards.map(card => (
          <div key={card.id} className="relative group">
            <Card
              card={card}
              isBack={flipAllBacks}
              ecoMode={ecoMode}
              size="md"
              interactive={true}
              onClick={() => {
                sound.playClick();
                setActiveModalCard(card);
              }}
              className="shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
            />
          </div>
        ))}
      </div>

      {/* Card Inspection Modal */}
      {activeModalCard && (
        <div 
          onClick={() => setActiveModalCard(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-slate-100 space-y-4 overflow-hidden"
          >
            <button
              onClick={() => setActiveModalCard(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors z-30"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-amber-500 text-slate-950 font-mono text-xs font-bold px-2 py-0.5 rounded shadow">
                  {activeModalCard.id}
                </span>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-wider font-semibold">
                  {DECK_CONFIG[activeModalCard.deck]?.name}
                </span>
              </div>
              <h3 className="font-display font-black text-xl text-white tracking-wide">
                {activeModalCard.title}
              </h3>
            </div>

            {/* MITRE ATT&CK & NIST phase */}
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {activeModalCard.attackId && (
                <a
                  href={`https://attack.mitre.org/techniques/${activeModalCard.attackId.replace('.', '/')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-950 hover:bg-slate-800 text-sky-400 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow"
                >
                  <span>MITRE ATT&amp;CK: {activeModalCard.attackId}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {activeModalCard.nistPhase && (
                <span className="bg-slate-950 text-emerald-400 border border-slate-800 px-3 py-1.5 rounded-xl shadow">
                  NIST: {activeModalCard.nistPhase}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-inner">
              <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                Incident Mechanics
              </h4>
              <p className="font-mono text-xs leading-relaxed text-slate-200">
                {activeModalCard.description}
              </p>
            </div>

            {/* Checks / Injects */}
            {activeModalCard.checks && activeModalCard.checks.length > 0 && (
              <div className="bg-sky-950/40 border border-sky-500/30 rounded-2xl p-4 shadow-inner">
                <h4 className="font-mono text-xs uppercase tracking-wider text-sky-300 font-bold mb-1.5">
                  Defensive Procedure Checks (d20)
                </h4>
                <div className="space-y-2">
                  {activeModalCard.checks.map((chk, i) => (
                    <div key={i} className="flex items-center gap-2 font-mono text-xs">
                      <span className="bg-sky-500 text-slate-950 font-bold px-2 py-0.5 rounded shadow text-xs">
                        DC {chk.target}+
                      </span>
                      <span className="text-sky-100">{chk.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModalCard.injectEffect && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 shadow-inner">
                <h4 className="font-mono text-xs uppercase tracking-wider text-emerald-300 font-bold mb-1.5">
                  Operational Inject Effect
                </h4>
                <p className="font-mono text-xs font-semibold text-emerald-200">
                  {activeModalCard.injectEffect}
                </p>
              </div>
            )}

            {/* Flavor Lore */}
            {activeModalCard.flavorText && (
              <div className="font-serif italic text-slate-300 text-xs border-l-2 border-amber-500/60 pl-3 py-1">
                &ldquo;{activeModalCard.flavorText}&rdquo;
              </div>
            )}

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalCard(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-colors"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
