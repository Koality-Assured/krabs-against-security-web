import React, { useState, useMemo, useEffect } from 'react';
import { CardData, DeckType, DECK_CONFIG } from '../types/card';
import { Card, CardIcon } from './Card';
import { sound } from '../utils/audio';
import { 
  Search, 
  RotateCw, 
  X, 
  ExternalLink, 
  Leaf, 
  Layers,
  Image as ImageIcon,
  LayoutGrid,
  FileSpreadsheet,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertTriangle,
  Target,
  Sparkles,
  Download
} from 'lucide-react';

export type CatalogViewMode = 'gallery' | 'deck' | 'dossier';

interface CardCatalogProps {
  cards: CardData[];
}

export const CardCatalog: React.FC<CardCatalogProps> = ({ cards }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeck, setSelectedDeck] = useState<DeckType | 'all'>('all');
  const [viewMode, setViewMode] = useState<CatalogViewMode>('gallery');
  const [flipAllBacks, setFlipAllBacks] = useState<boolean>(false);
  const [ecoMode, setEcoMode] = useState<boolean>(false);
  const [activeModalCard, setActiveModalCard] = useState<CardData | null>(null);
  const [modalViewToggle, setModalViewToggle] = useState<'artwork' | 'frame'>('artwork');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Filter cards based on deck selection and search query
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
        (card.flavorText && card.flavorText.toLowerCase().includes(q)) ||
        (card.nistPhase && card.nistPhase.toLowerCase().includes(q))
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

  // Navigate next/previous card in modal
  const currentCardIndex = useMemo(() => {
    if (!activeModalCard) return -1;
    return filteredCards.findIndex(c => c.id === activeModalCard.id);
  }, [activeModalCard, filteredCards]);

  const handleNextCard = () => {
    if (filteredCards.length === 0 || currentCardIndex === -1) return;
    const nextIdx = (currentCardIndex + 1) % filteredCards.length;
    sound.playCardFlip();
    setActiveModalCard(filteredCards[nextIdx]);
    setIsZoomed(false);
  };

  const handlePrevCard = () => {
    if (filteredCards.length === 0 || currentCardIndex === -1) return;
    const prevIdx = (currentCardIndex - 1 + filteredCards.length) % filteredCards.length;
    sound.playCardFlip();
    setActiveModalCard(filteredCards[prevIdx]);
    setIsZoomed(false);
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeModalCard) return;
      if (e.key === 'Escape') {
        setActiveModalCard(null);
      } else if (e.key === 'ArrowRight') {
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        handlePrevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalCard, currentCardIndex, filteredCards]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. CATALOG HEADER BAR & VIEW MODE SWITCHER */}
      {/* ========================================================================= */}
      <div className="bg-galley-950/80 border border-amber-900/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950/70 border border-amber-600/40 flex items-center justify-center text-amber-400 shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-amber-100 uppercase tracking-wider">
                Card Repository (80 Cards)
              </h2>
              <p className="text-xs font-mono text-amber-200/70 mt-0.5">
                Complete Incident Response Dataset &bull; CC BY-SA 4.0 Open Tabletop Standard
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex rounded-xl bg-slate-950 border border-amber-600/30 p-1 shadow-inner">
            <button
              onClick={() => { setViewMode('gallery'); sound.playClick(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'gallery'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-slate-900'
              }`}
              title="Art Gallery Mode: Prominent visual illustrations"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Art Gallery</span>
            </button>

            <button
              onClick={() => { setViewMode('deck'); sound.playClick(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'deck'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-slate-900'
              }`}
              title="Tabletop Deck Mode: Interactive tabletop cards with hover drawer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tabletop Deck</span>
            </button>

            <button
              onClick={() => { setViewMode('dossier'); sound.playClick(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'dossier'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-slate-900'
              }`}
              title="Incident Dossier Mode: Compact ledger view for facilitators"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Incident Dossier</span>
            </button>
          </div>

          {/* Flip All Cards (for Deck Mode) */}
          {viewMode === 'deck' && (
            <button
              onClick={() => { setFlipAllBacks(prev => !prev); sound.playCardFlip(); }}
              className="px-3.5 py-1.5 rounded-xl font-sans text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              {flipAllBacks ? 'Show Faces' : 'Show Backs'}
            </button>
          )}

          {/* Eco Mode Toggle */}
          <button
            onClick={() => { setEcoMode(prev => !prev); sound.playClick(); }}
            className={`px-3.5 py-1.5 rounded-xl font-sans text-xs font-semibold border flex items-center gap-1.5 shadow transition-all ${
              ecoMode 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Eco Mode: {ecoMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & DECK FILTER CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-galley-950/80 border border-amber-900/40 rounded-2xl p-4 shadow-xl space-y-3 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by card title, MITRE ATT&CK technique (e.g. T1566), card ID, mechanics, or lore..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-amber-900/40 rounded-xl py-2 pl-10 pr-10 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              aria-label="Clear Search"
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
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-900'
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
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-900'
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

      {/* Results Count Banner */}
      <div className="flex justify-between items-center text-xs font-mono text-amber-200/70 px-1">
        <span>Showing {filteredCards.length} of {cards.length} cards</span>
        <span>Click any card to open the Dual-Pane Inspection Theater</span>
      </div>

      {/* ========================================================================= */}
      {/* 3. CATALOG CONTENT - VIEW 1: ART GALLERY */}
      {/* ========================================================================= */}
      {viewMode === 'gallery' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCards.map(card => {
            const deck = DECK_CONFIG[card.deck];
            return (
              <div
                key={card.id}
                onClick={() => {
                  sound.playClick();
                  setActiveModalCard(card);
                  setIsZoomed(false);
                }}
                className="group relative rounded-2xl border-2 border-amber-900/40 hover:border-amber-500/80 bg-slate-950/90 overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >

                {/* 4:3 Art Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                  {card.artAsset ? (
                    <img
                      src={card.artAsset}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                  ) : (
                    <CardIcon iconName={card.iconName} className="w-12 h-12 text-amber-400" />
                  )}

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top Deck Badge & Card ID */}
                  <div className="absolute top-2.5 inset-x-3 flex justify-between items-center z-10 text-[11px] font-mono">
                    <span className={`px-2 py-0.5 rounded font-bold shadow-sm ${deck.badgeBg} ${deck.badgeText}`}>
                      {deck.shortName}
                    </span>
                    <span className="font-bold text-amber-300 bg-slate-950/85 px-2 py-0.5 rounded border border-amber-500/40 shadow">
                      {card.id}
                    </span>
                  </div>

                  {/* Inspection Hover Pill */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    <span className="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-sans shadow-lg flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
                      <Sparkles className="w-3.5 h-3.5" />
                      Inspect Dossier
                    </span>
                  </div>
                </div>

                {/* Card Title & Meta Plaque */}
                <div className="p-3.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-950 to-galley-950 border-t border-amber-900/30">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-100 leading-tight group-hover:text-amber-300 transition-colors line-clamp-1">
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p className="text-[11px] font-mono text-amber-200/70 mt-1 line-clamp-1">
                        {card.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-slate-400">
                    {card.checks && card.checks.length > 0 ? (
                      <span className="text-sky-300 font-bold bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                        DC {card.checks[0].target}+
                      </span>
                    ) : card.attackId ? (
                      <span className="text-amber-300 font-semibold">
                        MITRE {card.attackId}
                      </span>
                    ) : (
                      <span>{card.nistPhase || 'Standard IR'}</span>
                    )}
                    <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CATALOG CONTENT - VIEW 2: TABLETOP DECK */}
      {/* ========================================================================= */}
      {viewMode === 'deck' && (
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
                  setIsZoomed(false);
                }}
                className="shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
              />
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CATALOG CONTENT - VIEW 3: INCIDENT DOSSIER (TABULAR / LEDGER) */}
      {/* ========================================================================= */}
      {viewMode === 'dossier' && (
        <div className="bg-slate-950/90 border border-amber-900/40 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-galley-950 border-b border-amber-900/40 text-amber-300 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Card ID</th>
                  <th className="py-3 px-4">Title &amp; Subtitle</th>
                  <th className="py-3 px-4">Deck Category</th>
                  <th className="py-3 px-4">MITRE / Target</th>
                  <th className="py-3 px-4">NIST IR Phase</th>
                  <th className="py-3 px-4">Mechanics Brief</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-200">
                {filteredCards.map(card => {
                  const deck = DECK_CONFIG[card.deck];
                  return (
                    <tr 
                      key={card.id} 
                      onClick={() => {
                        sound.playClick();
                        setActiveModalCard(card);
                        setIsZoomed(false);
                      }}
                      className="hover:bg-amber-950/20 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-amber-400 whitespace-nowrap">
                        {card.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-display font-bold text-white text-xs">
                          {card.title}
                        </div>
                        {card.subtitle && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {card.subtitle}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${deck.badgeBg} ${deck.badgeText}`}>
                          {deck.shortName}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {card.checks && card.checks.length > 0 ? (
                          <span className="text-sky-300 font-bold bg-sky-950 px-2 py-0.5 rounded border border-sky-500/30">
                            DC {card.checks[0].target}+
                          </span>
                        ) : card.attackId ? (
                          <span className="text-amber-300 font-semibold bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30">
                            {card.attackId}
                          </span>
                        ) : (
                          <span className="text-slate-500">&mdash;</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300 text-[11px]">
                        {card.nistPhase || 'Incident Vector'}
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <p className="line-clamp-2 text-slate-300 text-[11px] leading-relaxed">
                          {card.description}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                            setActiveModalCard(card);
                            setIsZoomed(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold border border-amber-500/30 transition-all text-[11px]"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DUAL-PANE CARD INSPECTION THEATER MODAL */}
      {/* ========================================================================= */}
      {activeModalCard && (
        <div 
          onClick={() => setActiveModalCard(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative bg-gradient-to-b from-slate-950 to-galley-950 border-2 border-amber-600/40 rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl text-slate-100 overflow-hidden space-y-5"
          >
            {/* Modal Top Bar Navigation */}
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevCard}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1 text-xs font-mono transition-colors"
                  title="Previous Card (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <span className="text-xs font-mono text-amber-300 font-bold px-2">
                  Card {currentCardIndex + 1} of {filteredCards.length}
                </span>
                <button
                  onClick={handleNextCard}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1 text-xs font-mono transition-colors"
                  title="Next Card (Right Arrow)"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveModalCard(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
                aria-label="Close Inspection Theater"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dual Column Layout: Left Artwork Theater, Right Dossier */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* --------------------------------------------------------------- */}
              {/* LEFT COLUMN: ARTWORK & VISUAL THEATER (Cols 1-5) */}
              {/* --------------------------------------------------------------- */}
              <div className="lg:col-span-5 flex flex-col items-center space-y-3.5">
                {/* View Mode Toggle: 'Artwork' vs 'Card Frame' */}
                <div className="w-full flex justify-between items-center">
                  <div className="flex rounded-xl bg-slate-950 border border-amber-600/30 p-1 shadow-inner text-xs font-mono">
                    <button
                      onClick={() => { setModalViewToggle('artwork'); sound.playClick(); }}
                      className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                        modalViewToggle === 'artwork'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'text-amber-200/70 hover:text-white'
                      }`}
                    >
                      Uncropped Artwork
                    </button>
                    <button
                      onClick={() => { setModalViewToggle('frame'); sound.playClick(); }}
                      className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                        modalViewToggle === 'frame'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'text-amber-200/70 hover:text-white'
                      }`}
                    >
                      Card Frame
                    </button>
                  </div>

                  {modalViewToggle === 'artwork' && (
                    <button
                      onClick={() => setIsZoomed(prev => !prev)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 transition-colors"
                      title={isZoomed ? "Zoom Out" : "Zoom In (1.5x)"}
                    >
                      {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Theater Display Area */}
                <div className="w-full flex justify-center">
                  {modalViewToggle === 'artwork' ? (
                    <div className="relative w-full rounded-2xl border-2 border-amber-600/40 bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center p-2">
                      <div className={`overflow-hidden rounded-xl transition-all duration-300 ${isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'}`}>
                        {activeModalCard.artAsset ? (
                          <img
                            src={activeModalCard.artAsset}
                            alt={activeModalCard.title}
                            onClick={() => setIsZoomed(prev => !prev)}
                            className="w-full h-auto max-h-[380px] object-contain rounded-lg"
                          />
                        ) : (
                          <div className="w-64 h-64 flex flex-col items-center justify-center text-amber-400 gap-3">
                            <CardIcon iconName={activeModalCard.iconName} className="w-16 h-16" />
                            <span className="text-xs font-mono text-slate-400">Procedural Vector Asset</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 flex justify-center">
                      <Card
                        card={activeModalCard}
                        size="lg"
                        interactive={true}
                        className="shadow-2xl ring-2 ring-amber-500/30"
                      />
                    </div>
                  )}
                </div>

                {/* 300 DPI Asset Link Button */}
                {activeModalCard.artAsset && (
                  <div className="w-full flex justify-center">
                    <a
                      href={activeModalCard.artAsset}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-600/30 flex items-center justify-center gap-2 font-mono text-xs shadow-md transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Open High-Res 300 DPI File ({activeModalCard.id}.webp)</span>
                    </a>
                  </div>
                )}
              </div>

              {/* --------------------------------------------------------------- */}
              {/* RIGHT COLUMN: INCIDENT RESPONSE DOSSIER (Cols 6-12) */}
              {/* --------------------------------------------------------------- */}
              <div className="lg:col-span-7 space-y-4">
                {/* Dossier Header */}
                <div className="border-b border-amber-900/40 pb-3">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="bg-amber-500 text-slate-950 font-mono text-xs font-bold px-2 py-0.5 rounded shadow">
                      {activeModalCard.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded font-bold text-xs font-mono uppercase tracking-wider ${DECK_CONFIG[activeModalCard.deck]?.badgeBg} ${DECK_CONFIG[activeModalCard.deck]?.badgeText}`}>
                      {DECK_CONFIG[activeModalCard.deck]?.name}
                    </span>
                    {activeModalCard.nistPhase && (
                      <span className="bg-slate-900 text-cyan-300 border border-cyan-500/30 font-mono text-xs px-2.5 py-0.5 rounded shadow">
                        NIST: {activeModalCard.nistPhase}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-black text-xl sm:text-2xl text-amber-100 tracking-wide">
                    {activeModalCard.title}
                  </h3>

                  {activeModalCard.subtitle && (
                    <p className="font-mono text-xs text-amber-200/80 mt-1">
                      {activeModalCard.subtitle}
                    </p>
                  )}
                </div>

                {/* MITRE ATT&CK Technique Live Link */}
                {activeModalCard.attackId && (
                  <div className="bg-slate-950/80 border border-amber-600/30 rounded-2xl p-3 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span className="font-mono text-xs text-slate-300 font-semibold">
                        MITRE ATT&amp;CK Technique:
                      </span>
                      <span className="font-mono text-xs text-amber-300 font-bold">
                        {activeModalCard.attackId}
                      </span>
                    </div>
                    <a
                      href={`https://attack.mitre.org/techniques/${activeModalCard.attackId.replace('.', '/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-mono text-xs font-bold rounded-lg border border-amber-500/40 flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>attack.mitre.org</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Incident Mechanics Educational Breakdown */}
                <div className="bg-slate-950/90 border border-amber-900/40 rounded-2xl p-4 shadow-inner space-y-1.5">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Incident Mechanics &amp; Threat Telemetry
                  </h4>
                  <p className="font-mono text-xs leading-relaxed text-slate-200">
                    {activeModalCard.description}
                  </p>
                </div>

                {/* Defensive Checks Matrix */}
                {activeModalCard.checks && activeModalCard.checks.length > 0 && (
                  <div className="bg-sky-950/40 border border-sky-500/40 rounded-2xl p-4 shadow-inner space-y-2.5">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-sky-300 font-bold flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-sky-400" />
                      Defensive Procedure Checks (d20 Matrix)
                    </h4>
                    <div className="space-y-2">
                      {activeModalCard.checks.map((chk, i) => (
                        <div key={i} className="flex items-start gap-2.5 font-mono text-xs bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/20">
                          <span className="bg-sky-500 text-slate-950 font-bold px-2 py-0.5 rounded shadow text-xs shrink-0">
                            DC {chk.target}+
                          </span>
                          <div>
                            <span className="text-sky-200 font-semibold">{chk.description}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              {i === 0 ? 'Primary Investigation / Detection Target' : 'Secondary Containment / Remediation Target'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operational Inject Effect */}
                {activeModalCard.injectEffect && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 shadow-inner space-y-1.5">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-emerald-400" />
                      Operational Inject Consequence
                    </h4>
                    <p className="font-mono text-xs font-semibold text-emerald-100 leading-relaxed">
                      {activeModalCard.injectEffect}
                    </p>
                  </div>
                )}

                {/* Undersea Satirical Lore */}
                {activeModalCard.flavorText && (
                  <div className="p-3.5 bg-amber-950/20 border-l-4 border-amber-500 rounded-r-xl">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold block mb-1">
                      Undersea Satirical Lore:
                    </span>
                    <blockquote className="font-serif italic text-amber-100/90 text-sm leading-relaxed">
                      &ldquo;{activeModalCard.flavorText}&rdquo;
                    </blockquote>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="pt-2 flex justify-between items-center text-xs font-mono text-slate-400 border-t border-amber-900/30">
                  <span>Press [ESC] or click outside to dismiss</span>
                  <button
                    onClick={() => setActiveModalCard(null)}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-colors"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
