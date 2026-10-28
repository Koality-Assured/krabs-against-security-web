import React, { useState, useMemo } from 'react';
import { CardData, DeckType, DECK_CONFIG } from '../types/card';
import { Card } from './Card';
import { sound } from '../utils/audio';
import { BrassCornerBracket } from './DiceRoller';
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
      <div className="relative bg-gradient-to-r from-galley-950 via-galley-900 to-galley-950 border-4 border-brass-700/80 rounded-3xl p-5 shadow-[0_15px_30px_rgba(0,0,0,0.9)] flex flex-wrap items-center justify-between gap-4 overflow-hidden">
        <BrassCornerBracket position="tl" />
        <BrassCornerBracket position="tr" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brass-700 border border-brass-400/80 flex items-center justify-center text-galley-950 shadow-sm">
              <Layers className="w-5 h-5 text-brass-200" />
            </div>
            <h2 className="font-display font-black text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-b from-brass-100 via-brass-300 to-brass-500 uppercase tracking-widest drop-shadow">
              CANONICAL 80-CARD REPOSITORY
            </h2>
          </div>
          <p className="text-xs font-mono text-parchment-300/80 mt-1">
            Galley S.O.P. Card Catalog &bull; CC BY-SA 4.0 Educational Incident Response Dataset
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {/* Flip All Cards */}
          <button
            onClick={() => { setFlipAllBacks(prev => !prev); sound.playCardFlip(); }}
            className="px-3.5 py-2 rounded-xl font-display text-xs font-bold bg-galley-950 text-brass-200 border-2 border-brass-700/70 hover:border-brass-500 flex items-center gap-1.5 shadow transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-brass-400" />
            {flipAllBacks ? 'Show Card Faces' : 'Show Card Backs'}
          </button>

          {/* Eco Mode Toggle */}
          <button
            onClick={() => { setEcoMode(prev => !prev); sound.playClick(); }}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-bold border-2 flex items-center gap-1.5 shadow transition-all ${
              ecoMode 
                ? 'bg-kelp-600 text-white border-kelp-300' 
                : 'bg-galley-950 text-parchment-300 border-brass-700/70 hover:border-brass-500'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-kelp-400" />
            Eco-Ink View: {ecoMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gradient-to-b from-galley-900 to-galley-950 border-2 border-brass-700/60 rounded-2xl p-4 shadow-xl space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-brass-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by card name, MITRE ATT&CK technique (e.g. T1566), ID, or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-galley-950 border border-brass-700/60 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-parchment-100 placeholder-parchment-500/50 focus:outline-none focus:border-brass-400 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-parchment-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Deck Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setSelectedDeck('all'); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold border transition-all ${
              selectedDeck === 'all' 
                ? 'bg-gradient-to-b from-brass-400 to-brass-600 text-galley-950 border-brass-200 shadow-md' 
                : 'bg-galley-950/80 text-parchment-300 border-brass-800/60 hover:bg-galley-800'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold border transition-all flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-gradient-to-b from-brass-400 to-brass-600 text-galley-950 border-brass-200 shadow-md' 
                    : 'bg-galley-950/80 text-parchment-300 border-brass-800/60 hover:bg-galley-800'
                }`}
              >
                <span 
                  className="w-2 h-2 rounded-full border border-black/40" 
                  style={{ backgroundColor: deck.colorHex }}
                />
                {deck.name} ({deckCounts[deck.id] || 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-xs font-mono text-parchment-400/80 px-1">
        <span>Showing {filteredCards.length} of {cards.length} cards</span>
        <span>Click any card to inspect full mechanics and galley lore</span>
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
              className="shadow-2xl shadow-black/80 transform group-hover:scale-[1.03] transition-all duration-200"
            />
          </div>
        ))}
      </div>

      {/* Card Inspection Modal */}
      {activeModalCard && (
        <div 
          onClick={() => setActiveModalCard(null)}
          className="fixed inset-0 z-50 bg-galley-950/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative bg-gradient-to-b from-galley-900 via-galley-850 to-galley-950 border-4 border-brass-600 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-parchment-100 space-y-4 overflow-hidden"
          >
            <BrassCornerBracket position="tl" />
            <BrassCornerBracket position="tr" />
            <BrassCornerBracket position="bl" />
            <BrassCornerBracket position="br" />

            <button
              onClick={() => setActiveModalCard(null)}
              className="absolute top-4 right-4 text-parchment-400 hover:text-white p-1 rounded-lg hover:bg-galley-800 transition-colors z-30"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-brass-500 text-galley-950 font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  {activeModalCard.id}
                </span>
                <span className="font-mono text-xs text-brass-300 uppercase tracking-wider font-semibold">
                  {DECK_CONFIG[activeModalCard.deck]?.name}
                </span>
              </div>
              <h3 className="font-display font-black text-xl text-brass-100 tracking-wide">
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
                  className="bg-galley-950 hover:bg-galley-800 text-marine-300 border border-marine-500/50 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-colors shadow"
                >
                  <span>MITRE ATT&amp;CK: {activeModalCard.attackId}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {activeModalCard.nistPhase && (
                <span className="bg-galley-950 text-kelp-300 border border-kelp-500/50 px-2.5 py-1 rounded-xl shadow">
                  NIST: {activeModalCard.nistPhase}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="bg-galley-950/90 border border-brass-800/60 rounded-2xl p-3.5 shadow-inner">
              <h4 className="font-mono text-[10px] uppercase tracking-wider text-brass-400 font-bold mb-1">
                INCIDENT SCENARIO MECHANICS
              </h4>
              <p className="font-mono text-xs leading-relaxed text-parchment-200">
                {activeModalCard.description}
              </p>
            </div>

            {/* Checks / Injects */}
            {activeModalCard.checks && activeModalCard.checks.length > 0 && (
              <div className="bg-marine-950/60 border border-marine-500/40 rounded-2xl p-3.5 shadow-inner">
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-marine-300 font-bold mb-1">
                  DEFENSIVE PROCEDURE CHECKS (d20)
                </h4>
                <div className="space-y-1.5">
                  {activeModalCard.checks.map((chk, i) => (
                    <div key={i} className="flex items-center gap-2 font-mono text-xs">
                      <span className="bg-marine-500 text-slate-950 font-bold px-1.5 py-0.5 rounded shadow text-[10px]">
                        {chk.target}+
                      </span>
                      <span className="text-marine-100">{chk.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModalCard.injectEffect && (
              <div className="bg-kelp-950/60 border border-kelp-500/40 rounded-2xl p-3.5 shadow-inner">
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-kelp-300 font-bold mb-1">
                  OPERATIONAL INJECT EFFECT
                </h4>
                <p className="font-mono text-xs font-bold text-kelp-200">
                  {activeModalCard.injectEffect}
                </p>
              </div>
            )}

            {/* Flavor Lore */}
            {activeModalCard.flavorText && (
              <div className="font-serif italic text-brass-200/90 text-xs border-l-2 border-brass-400 pl-3 py-1">
                &ldquo;{activeModalCard.flavorText}&rdquo;
              </div>
            )}

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalCard(null)}
                className="px-5 py-2 bg-gradient-to-r from-brass-500 to-brass-600 hover:from-brass-400 hover:to-brass-500 text-galley-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow transition-colors"
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
