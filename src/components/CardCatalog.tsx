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
      <div className="bg-gradient-to-r from-ocean-900 via-ocean-800 to-ocean-900 border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif font-bold text-lg text-amber-100 tracking-wide">
              CANONICAL 80-CARD REPOSITORY
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300 mt-0.5">
            Full Deck Catalog • CC BY-SA 4.0 Educational Incident Response Dataset
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Flip All Cards */}
          <button
            onClick={() => { setFlipAllBacks(prev => !prev); sound.playCardFlip(); }}
            className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-ocean-950 text-slate-200 border border-slate-700 hover:border-slate-500 flex items-center gap-1.5 shadow"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            {flipAllBacks ? 'Show Card Faces' : 'Show Card Backs'}
          </button>

          {/* Eco Mode Toggle */}
          <button
            onClick={() => { setEcoMode(prev => !prev); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border flex items-center gap-1.5 shadow transition-all ${ecoMode ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-ocean-950 text-slate-300 border-slate-700'}`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Eco View: {ecoMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-ocean-900/80 border border-slate-700 rounded-2xl p-4 shadow-lg space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by card name, MITRE ATT&CK technique (e.g. T1566), ID, or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-ocean-950 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
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
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setSelectedDeck('all'); sound.playClick(); }}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${selectedDeck === 'all' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm' : 'bg-ocean-950/70 text-slate-300 border-slate-800 hover:bg-ocean-800'}`}
          >
            All Decks ({deckCounts.all || 0})
          </button>

          {Object.values(DECK_CONFIG).map(deck => {
            const isSelected = selectedDeck === deck.id;
            return (
              <button
                key={deck.id}
                onClick={() => { setSelectedDeck(deck.id); sound.playClick(); }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${isSelected ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm' : 'bg-ocean-950/70 text-slate-300 border-slate-800 hover:bg-ocean-800'}`}
              >
                <span 
                  className="w-2 h-2 rounded-full" 
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
        <span>Click any card to inspect full mechanics and lore</span>
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
              className="shadow-xl transform group-hover:scale-[1.03] transition-all duration-200"
            />
          </div>
        ))}
      </div>

      {/* Card Inspection Modal */}
      {activeModalCard && (
        <div 
          onClick={() => setActiveModalCard(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-ocean-900 border-2 border-amber-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 space-y-4"
          >
            <button
              onClick={() => setActiveModalCard(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-ocean-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-500 text-slate-950 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  {activeModalCard.id}
                </span>
                <span className="font-mono text-xs text-amber-300 uppercase">
                  {DECK_CONFIG[activeModalCard.deck]?.name}
                </span>
              </div>
              <h3 className="font-serif font-black text-xl text-white">
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
                  className="bg-ocean-950 hover:bg-ocean-800 text-sky-300 border border-sky-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>MITRE ATT&amp;CK: {activeModalCard.attackId}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {activeModalCard.nistPhase && (
                <span className="bg-ocean-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                  NIST: {activeModalCard.nistPhase}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="bg-ocean-950/80 border border-slate-700 rounded-xl p-3">
              <h4 className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                INCIDENT SCENARIO MECHANICS
              </h4>
              <p className="font-mono text-xs leading-relaxed text-slate-200">
                {activeModalCard.description}
              </p>
            </div>

            {/* Checks / Injects */}
            {activeModalCard.checks && activeModalCard.checks.length > 0 && (
              <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-3">
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-sky-300 mb-1">
                  DEFENSIVE PROCEDURE CHECKS (d20)
                </h4>
                <div className="space-y-1">
                  {activeModalCard.checks.map((chk, i) => (
                    <div key={i} className="flex items-center gap-2 font-mono text-xs">
                      <span className="bg-sky-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                        {chk.target}+
                      </span>
                      <span className="text-sky-100">{chk.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModalCard.injectEffect && (
              <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl p-3">
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-emerald-300 mb-1">
                  OPERATIONAL INJECT EFFECT
                </h4>
                <p className="font-mono text-xs font-bold text-emerald-200">
                  {activeModalCard.injectEffect}
                </p>
              </div>
            )}

            {/* Flavor Lore */}
            {activeModalCard.flavorText && (
              <div className="font-serif italic text-amber-200/90 text-xs border-l-2 border-amber-400 pl-3 py-1">
                {activeModalCard.flavorText}
              </div>
            )}

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalCard(null)}
                className="px-4 py-1.5 bg-ocean-800 hover:bg-ocean-700 text-slate-200 font-mono text-xs font-bold rounded-xl"
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
