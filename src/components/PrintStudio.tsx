import React, { useState, useMemo } from 'react';
import { CardData, DeckType, DECK_CONFIG } from '../types/card';
import { Card } from './Card';
import { generatePrintReadyPDF, PDFExportOptions } from '../utils/pdfGenerator';
import { exportCardsZip } from '../utils/zipExporter';
import { sound } from '../utils/audio';
import { BrassCornerBracket } from './DiceRoller';
import { 
  Printer, 
  Download, 
  FileArchive, 
  Layers, 
  Leaf, 
  Scissors, 
  CheckSquare, 
  Square,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PrintStudioProps {
  cards: CardData[];
}

export const PrintStudio: React.FC<PrintStudioProps> = ({ cards }) => {
  // Configuration State
  const [paperSize, setPaperSize] = useState<'letter' | 'a4'>('letter');
  const [layoutMode, setLayoutMode] = useState<'3x3' | 'gutter-fold'>('3x3');
  const [ecoMode, setEcoMode] = useState<boolean>(false);
  const [cropMarks, setCropMarks] = useState<boolean>(true);
  const [includeBacks, setIncludeBacks] = useState<boolean>(true);
  const [selectedDecks, setSelectedDecks] = useState<DeckType[]>([
    'initial_compromise',
    'pivot_escalate',
    'persistence',
    'c2_exfil',
    'procedures',
    'injects'
  ]);

  // Preview Navigation State
  const [currentSheetIndex, setCurrentSheetIndex] = useState<number>(0);
  const [previewFace, setPreviewFace] = useState<'front' | 'back'>('front');

  // Generating status
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<number>(0);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);

  // Filtered Cards
  const activeCards = useMemo(() => {
    return cards.filter(c => selectedDecks.includes(c.deck));
  }, [cards, selectedDecks]);

  // Sheet slicing
  const cardsPerSheet = layoutMode === '3x3' ? 9 : 3;
  const totalSheets = Math.max(1, Math.ceil(activeCards.length / cardsPerSheet));

  // Current sheet cards
  const currentSheetCards = useMemo(() => {
    const start = currentSheetIndex * cardsPerSheet;
    return activeCards.slice(start, start + cardsPerSheet);
  }, [activeCards, currentSheetIndex, cardsPerSheet]);

  // Duplex long-edge column mirrored cards for 3x3 back preview: [0,1,2] -> [2,1,0]
  const currentBackSheetCards = useMemo(() => {
    if (layoutMode !== '3x3') return currentSheetCards;

    const mirrored: CardData[] = [];
    for (let row = 0; row < 3; row++) {
      const rowCards = currentSheetCards.slice(row * 3, (row + 1) * 3);
      mirrored.push(...rowCards.reverse());
    }
    return mirrored;
  }, [currentSheetCards, layoutMode]);

  const toggleDeck = (deck: DeckType) => {
    sound.playClick();
    setSelectedDecks(prev => 
      prev.includes(deck) 
        ? prev.filter(d => d !== deck)
        : [...prev, deck]
    );
    setCurrentSheetIndex(0);
  };

  const selectAllDecks = () => {
    sound.playClick();
    setSelectedDecks(['initial_compromise', 'pivot_escalate', 'persistence', 'c2_exfil', 'procedures', 'injects']);
    setCurrentSheetIndex(0);
  };

  const deselectAllDecks = () => {
    sound.playClick();
    setSelectedDecks([]);
    setCurrentSheetIndex(0);
  };

  // Trigger PDF Generation
  const handleDownloadPDF = async () => {
    if (activeCards.length === 0) return;

    try {
      setIsGeneratingPdf(true);
      setPdfProgress(10);
      sound.playClick();

      const options: PDFExportOptions = {
        paperSize,
        layoutMode,
        ecoMode,
        cropMarks,
        includeBacks,
        selectedDecks
      };

      const pdfBlob = await generatePrintReadyPDF(cards, options, (pct) => {
        setPdfProgress(pct);
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `krabs-against-security-${paperSize}-${layoutMode}${ecoMode ? '-eco' : ''}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      sound.playDiceResult(20, true);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check browser console.");
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(0);
    }
  };

  // Trigger ZIP Export
  const handleExportZip = async () => {
    if (activeCards.length === 0) return;

    try {
      setIsExportingZip(true);
      sound.playClick();

      const zipBlob = await exportCardsZip(activeCards);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `krabs-cards-single-assets.zip`;
      link.click();
      URL.revokeObjectURL(url);

      sound.playDiceResult(20, true);
    } catch (err) {
      console.error("ZIP export failed:", err);
      alert("Failed to export ZIP.");
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="relative bg-gradient-to-r from-galley-950 via-galley-900 to-galley-950 border-4 border-brass-700/80 rounded-3xl p-5 shadow-[0_15px_30px_rgba(0,0,0,0.9)] flex flex-wrap items-center justify-between gap-4 overflow-hidden">
        <BrassCornerBracket position="tl" />
        <BrassCornerBracket position="tr" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brass-700 border border-brass-400/80 flex items-center justify-center text-galley-950 shadow-sm">
              <Printer className="w-5 h-5 text-brass-200" />
            </div>
            <h2 className="font-display font-black text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-b from-brass-100 via-brass-300 to-brass-500 uppercase tracking-widest drop-shadow">
              PRINT &amp; PLAY STUDIO
            </h2>
          </div>
          <p className="text-xs font-mono text-parchment-300/80 mt-1">
            Millimeter-Calibrated 300 DPI Vector PDF Generator &bull; Duplex Alignment Engine
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleExportZip}
            disabled={isExportingZip || activeCards.length === 0}
            className="px-3.5 py-2 rounded-xl bg-galley-950 hover:bg-galley-800 text-brass-300 font-display text-xs font-bold border-2 border-brass-700/70 flex items-center gap-2 shadow transition-all disabled:opacity-50"
          >
            <FileArchive className="w-4 h-4 text-brass-400" />
            {isExportingZip ? 'Exporting ZIP...' : 'Export Single Cards (ZIP)'}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf || activeCards.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brass-500 via-brass-400 to-brass-500 hover:from-brass-400 hover:to-brass-300 text-galley-950 font-display font-black text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.35)] active:translate-y-0.5 transition-all disabled:opacity-50 border border-brass-200"
          >
            <Download className="w-4 h-4 text-galley-950" />
            {isGeneratingPdf ? `Generating PDF (${pdfProgress}%)...` : 'Download Print-Ready PDF'}
          </button>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Paper & Layout */}
        <div className="bg-gradient-to-b from-galley-900 to-galley-950 border-2 border-brass-700/60 rounded-2xl p-4 shadow-xl">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-brass-300 font-bold mb-2">
            1. Geometry &amp; Paper
          </span>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-mono text-parchment-300 block mb-1">Paper Format:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setPaperSize('letter')}
                  className={`py-1.5 px-2 rounded-xl font-display text-xs font-bold border transition-all ${
                    paperSize === 'letter' 
                      ? 'bg-gradient-to-b from-brass-400 to-brass-600 text-galley-950 border-brass-200 shadow' 
                      : 'bg-galley-950 text-parchment-300 border-brass-800/60 hover:bg-galley-800'
                  }`}
                >
                  US Letter (8.5x11&quot;)
                </button>
                <button
                  onClick={() => setPaperSize('a4')}
                  className={`py-1.5 px-2 rounded-xl font-display text-xs font-bold border transition-all ${
                    paperSize === 'a4' 
                      ? 'bg-gradient-to-b from-brass-400 to-brass-600 text-galley-950 border-brass-200 shadow' 
                      : 'bg-galley-950 text-parchment-300 border-brass-800/60 hover:bg-galley-800'
                  }`}
                >
                  ISO A4 (210x297mm)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-parchment-300 block mb-1">Sheet Format:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { setLayoutMode('3x3'); setCurrentSheetIndex(0); }}
                  className={`py-1.5 px-2 rounded-xl font-display text-xs font-bold border transition-all ${
                    layoutMode === '3x3' 
                      ? 'bg-marine-500 text-slate-950 border-marine-300 shadow font-bold' 
                      : 'bg-galley-950 text-parchment-300 border-brass-800/60 hover:bg-galley-800'
                  }`}
                >
                  3x3 Grid (9 Cards)
                </button>
                <button
                  onClick={() => { setLayoutMode('gutter-fold'); setCurrentSheetIndex(0); }}
                  className={`py-1.5 px-2 rounded-xl font-display text-xs font-bold border transition-all ${
                    layoutMode === 'gutter-fold' 
                      ? 'bg-marine-500 text-slate-950 border-marine-300 shadow font-bold' 
                      : 'bg-galley-950 text-parchment-300 border-brass-800/60 hover:bg-galley-800'
                  }`}
                >
                  2x3 Gutter-Fold
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Duplex & Mirroring */}
        <div className="bg-gradient-to-b from-galley-900 to-galley-950 border-2 border-brass-700/60 rounded-2xl p-4 shadow-xl">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-brass-300 font-bold mb-2">
            2. Duplex Alignment
          </span>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-parchment-200">
              <input
                type="checkbox"
                checked={includeBacks}
                onChange={e => setIncludeBacks(e.target.checked)}
                className="rounded accent-brass-500 w-4 h-4"
              />
              Include Card Back Sheets
            </label>

            <div className="p-2.5 rounded-xl bg-galley-950/90 border border-brass-700/50 text-[10px] font-mono text-parchment-300 shadow-inner">
              <span className="text-brass-300 font-bold block mb-0.5">Horizontal Mirroring:</span>
              Back columns automatically invert ([C1, C2, C3] &harr; [C3, C2, C1]) for 100% long-edge registration.
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-parchment-200">
              <input
                type="checkbox"
                checked={cropMarks}
                onChange={e => setCropMarks(e.target.checked)}
                className="rounded accent-brass-500 w-4 h-4"
              />
              <Scissors className="w-3.5 h-3.5 text-brass-400" />
              Draw Crop Marks &amp; Guides
            </label>
          </div>
        </div>

        {/* 3. Ink Saver / Eco-Print Mode */}
        <div className="bg-gradient-to-b from-galley-900 to-galley-950 border-2 border-brass-700/60 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-brass-300 font-bold">
              3. Toner / Ink Economy
            </span>
            <Leaf className={`w-4 h-4 ${ecoMode ? 'text-kelp-400' : 'text-parchment-500'}`} />
          </div>

          <button
            onClick={() => { setEcoMode(prev => !prev); sound.playClick(); }}
            className={`w-full py-2 px-3 rounded-xl font-display text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
              ecoMode 
                ? 'bg-kelp-600 text-white border-kelp-300 shadow-md shadow-kelp-500/30' 
                : 'bg-galley-950 text-parchment-300 border-brass-800/60 hover:border-brass-600'
            }`}
          >
            <Leaf className="w-4 h-4" />
            Eco-Print Mode: {ecoMode ? 'ACTIVE (>75% SAVED)' : 'OFF (FULL COLOR)'}
          </button>

          <p className="text-[10px] font-mono text-parchment-400 mt-2 leading-relaxed">
            Eliminates dark background fills, converting cards to high-contrast monochrome line art for laser or inkjet printers.
          </p>
        </div>

        {/* 4. Deck Selection */}
        <div className="bg-gradient-to-b from-galley-900 to-galley-950 border-2 border-brass-700/60 rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-brass-300 font-bold">
              4. Decks ({activeCards.length} Cards)
            </span>
            <div className="flex gap-2 text-[10px] font-mono">
              <button onClick={selectAllDecks} className="text-brass-400 hover:underline">All</button>
              <button onClick={deselectAllDecks} className="text-parchment-400 hover:underline">None</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-[105px] overflow-y-auto pr-1">
            {Object.values(DECK_CONFIG).map(d => {
              const checked = selectedDecks.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDeck(d.id)}
                  className={`text-[10px] font-mono px-2 py-1 rounded-lg text-left flex items-center gap-1.5 border truncate transition-colors ${
                    checked 
                      ? 'bg-galley-800 text-parchment-100 border-brass-500/50' 
                      : 'bg-galley-950/70 text-parchment-400/60 border-brass-900/60'
                  }`}
                >
                  {checked ? <CheckSquare className="w-3 h-3 text-brass-400 shrink-0" /> : <Square className="w-3 h-3 text-parchment-500 shrink-0" />}
                  <span className="truncate">{d.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sheet Preview Arena */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-b from-galley-900 via-galley-850 to-galley-950 border-4 border-brass-700/80 shadow-2xl overflow-hidden">
        <BrassCornerBracket position="tl" />
        <BrassCornerBracket position="tr" />

        {/* Sheet Navigator Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-brass-700/50 pb-3 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-brass-400" />
            <div>
              <h3 className="font-display font-black text-brass-100 text-sm tracking-wide">
                SHEET PREVIEW: Sheet {currentSheetIndex + 1} of {totalSheets} ({paperSize.toUpperCase()}, {layoutMode.toUpperCase()})
              </h3>
              <span className="font-mono text-[10px] text-parchment-300/80">
                Displaying {currentSheetCards.length} cards on this sheet &bull; Showing {previewFace.toUpperCase()} face
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Front / Back Toggle for 3x3 */}
            {layoutMode === '3x3' && includeBacks && (
              <div className="flex rounded-xl overflow-hidden border-2 border-brass-700/70 bg-galley-950 mr-2 shadow">
                <button
                  onClick={() => { setPreviewFace('front'); sound.playClick(); }}
                  className={`px-3 py-1 font-display text-xs font-bold transition-all ${
                    previewFace === 'front' 
                      ? 'bg-gradient-to-b from-brass-400 to-brass-600 text-galley-950' 
                      : 'text-parchment-300 hover:text-white'
                  }`}
                >
                  Front Sheet
                </button>
                <button
                  onClick={() => { setPreviewFace('back'); sound.playClick(); }}
                  className={`px-3 py-1 font-display text-xs font-bold transition-all ${
                    previewFace === 'back' 
                      ? 'bg-gradient-to-b from-brass-400 to-brass-600 text-galley-950' 
                      : 'text-parchment-300 hover:text-white'
                  }`}
                >
                  Back (Mirrored)
                </button>
              </div>
            )}

            {/* Previous / Next Sheet */}
            <button
              onClick={() => { setCurrentSheetIndex(prev => Math.max(0, prev - 1)); sound.playClick(); }}
              disabled={currentSheetIndex <= 0}
              className="p-1.5 rounded-xl bg-galley-800 hover:bg-galley-700 disabled:opacity-40 text-parchment-200 border border-brass-700/60 shadow"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-bold text-brass-300 px-2">
              {currentSheetIndex + 1} / {totalSheets}
            </span>
            <button
              onClick={() => { setCurrentSheetIndex(prev => Math.min(totalSheets - 1, prev + 1)); sound.playClick(); }}
              disabled={currentSheetIndex >= totalSheets - 1}
              className="p-1.5 rounded-xl bg-galley-800 hover:bg-galley-700 disabled:opacity-40 text-parchment-200 border border-brass-700/60 shadow"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas Preview (Responsive scaling) */}
        <div className="flex justify-center overflow-x-auto py-4 relative z-10">
          <div 
            className={`relative p-6 rounded-2xl transition-all shadow-2xl border-4 ${
              ecoMode 
                ? 'bg-white border-slate-300 text-black' 
                : 'bg-galley-950 border-brass-700/60 text-parchment-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]'
            }`}
            style={{
              width: layoutMode === '3x3' ? '820px' : '600px',
              minHeight: '740px'
            }}
          >
            {/* Visual Crop Marks on corners */}
            {cropMarks && (
              <>
                <div className="absolute top-2.5 left-3 text-[10px] font-mono text-parchment-400 flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-brass-400" /> CUT GUIDE
                </div>
                <div className="absolute top-2.5 right-3 text-[10px] font-mono text-parchment-400">
                  {paperSize.toUpperCase()} // 300 DPI
                </div>
                <div className="absolute bottom-2.5 left-3 text-[9px] font-mono text-parchment-400">
                  K.A.S. PRINT STUDIO &bull; DUPLEX ALIGNED
                </div>
              </>
            )}

            {/* 3x3 Grid Layout (9 Cards) */}
            {layoutMode === '3x3' ? (
              <div className="grid grid-cols-3 gap-3.5 justify-items-center my-4">
                {(previewFace === 'front' ? currentSheetCards : currentBackSheetCards).map((card, idx) => (
                  <Card
                    key={`${card.id}-${previewFace}-${idx}`}
                    card={card}
                    isBack={previewFace === 'back'}
                    ecoMode={ecoMode}
                    size="sm"
                    className="shadow-md"
                  />
                ))}

                {/* Fill empty slots with placeholder cut boxes if last sheet has <9 cards */}
                {Array.from({ length: Math.max(0, 9 - currentSheetCards.length) }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className={`w-44 h-[246px] rounded-xl border-2 border-dashed flex items-center justify-center font-mono text-xs ${
                      ecoMode ? 'border-slate-300 text-slate-400' : 'border-brass-800/40 text-parchment-500/50'
                    }`}
                  >
                    Blank Trim Slot
                  </div>
                ))}
              </div>
            ) : (
              /* 2x3 Gutter-Fold Layout (3 Fronts on Left, 3 Backs on Right with center fold guide) */
              <div className="relative my-4">
                {/* Center Fold Line */}
                <div className="absolute inset-y-0 left-1/2 -ml-px border-l-2 border-dashed border-brass-500/70 z-10 pointer-events-none flex flex-col items-center justify-center">
                  <span className="bg-brass-500 text-galley-950 font-display text-[9px] font-black px-2 py-0.5 rounded -rotate-90 shadow">
                    FOLD &amp; GLUE SEAM
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 justify-items-center">
                  {currentSheetCards.map((card, idx) => (
                    <React.Fragment key={`gutter-${card.id}-${idx}`}>
                      {/* Left: Card Front */}
                      <Card
                        card={card}
                        isBack={false}
                        ecoMode={ecoMode}
                        size="sm"
                        className="shadow-md"
                      />
                      {/* Right: Card Back */}
                      <Card
                        card={card}
                        isBack={true}
                        ecoMode={ecoMode}
                        size="sm"
                        className="shadow-md"
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Crafting Instructions */}
        <div className="border-t-2 border-brass-700/50 pt-3 mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono text-parchment-300/80 relative z-10">
          <div className="flex items-start gap-2">
            <span className="font-bold text-brass-300">1. Paper:</span>
            <span>Print on 110lb cardstock (300 gsm) with printer scaling set to &quot;100% / Actual Size&quot;.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-brass-300">2. Duplex:</span>
            <span>For 3x3 double-sided, set printer to &quot;Flip on Long Edge&quot;. Column mirroring is automatic.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-brass-300">3. Sleeves:</span>
            <span>Finished cut cards measure standard poker size (2.5&quot; x 3.5&quot;) fitting standard card sleeves.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
