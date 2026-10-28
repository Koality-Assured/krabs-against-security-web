import React, { useState, useMemo } from 'react';
import { CardData, DeckType, DECK_CONFIG } from '../types/card';
import { Card } from './Card';
import { generatePrintReadyPDF, PDFExportOptions } from '../utils/pdfGenerator';
import { exportCardsZip } from '../utils/zipExporter';
import { sound } from '../utils/audio';
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
  const [currentSheetIndex, setCurrentSheetIndex] = useState<number>(0);
  const [previewFace, setPreviewFace] = useState<'front' | 'back'>('front');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<number>(0);

  // Filter cards by selected decks
  const activeCards = useMemo(() => {
    return cards.filter(c => selectedDecks.includes(c.deck));
  }, [cards, selectedDecks]);

  // Group cards into sheets
  const cardsPerSheet = layoutMode === '3x3' ? 9 : 3;
  const sheets = useMemo(() => {
    const list: CardData[][] = [];
    for (let i = 0; i < activeCards.length; i += cardsPerSheet) {
      list.push(activeCards.slice(i, i + cardsPerSheet));
    }
    return list;
  }, [activeCards, cardsPerSheet]);

  const totalSheets = Math.max(1, sheets.length);
  const currentSheetCards = sheets[currentSheetIndex] || [];

  // Duplex mirrored back columns for 3x3 layout
  // Column 1 <-> Column 3 mirror: [0,1,2, 3,4,5, 6,7,8] -> [2,1,0, 5,4,3, 8,7,6]
  const currentBackSheetCards = useMemo(() => {
    if (layoutMode !== '3x3' || currentSheetCards.length === 0) return currentSheetCards;
    const mirrored: CardData[] = [];
    for (let row = 0; row < 3; row++) {
      const r0 = currentSheetCards[row * 3 + 0];
      const r1 = currentSheetCards[row * 3 + 1];
      const r2 = currentSheetCards[row * 3 + 2];
      if (r2) mirrored.push(r2);
      if (r1) mirrored.push(r1);
      if (r0) mirrored.push(r0);
    }
    return mirrored;
  }, [currentSheetCards, layoutMode]);

  // Toggle a single deck
  const toggleDeck = (deckId: DeckType) => {
    sound.playClick();
    setSelectedDecks(prev => 
      prev.includes(deckId) 
        ? prev.filter(d => d !== deckId) 
        : [...prev, deckId]
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

  // Generate & Download PDF via pdf-lib
  const handleDownloadPDF = async () => {
    if (activeCards.length === 0) {
      alert("Please select at least one deck to print.");
      return;
    }

    try {
      sound.playClick();
      setIsGeneratingPdf(true);
      setPdfProgress(10);

      const options: PDFExportOptions = {
        paperSize,
        layoutMode,
        ecoMode,
        cropMarks,
        includeBacks,
        selectedDecks
      };

      const pdfBlob = await generatePrintReadyPDF(activeCards, options, (p: number) => {
        setPdfProgress(p);
      });

      // Trigger client-side browser download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `krabs-against-security-${paperSize}-${layoutMode}-${ecoMode ? 'eco' : 'color'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check browser console.");
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(0);
    }
  };

  // Export all cards as high-res ZIP
  const handleExportZip = async () => {
    if (activeCards.length === 0) return;
    try {
      sound.playClick();
      setIsExportingZip(true);
      const zipBlob = await exportCardsZip(activeCards);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `krabs-against-security-cards.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shadow-sm">
              <Printer className="w-5 h-5" />
            </div>
            <h2 className="font-display font-black text-lg sm:text-xl text-slate-100 uppercase tracking-wider">
              Print &amp; Play Studio
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Millimeter-Calibrated 300 DPI Vector PDF Generator &bull; Duplex Alignment Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportZip}
            disabled={isExportingZip || activeCards.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-semibold border border-slate-700 flex items-center gap-2 shadow transition-all disabled:opacity-50"
          >
            <FileArchive className="w-4 h-4 text-amber-400" />
            {isExportingZip ? 'Exporting ZIP...' : 'Export Cards (ZIP)'}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf || activeCards.length === 0}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-amber-500/20 active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-950" />
            {isGeneratingPdf ? `Generating PDF (${pdfProgress}%)...` : 'Download Print-Ready PDF'}
          </button>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Paper & Layout */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="block font-mono text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
            1. Paper &amp; Layout
          </span>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Paper Format:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setPaperSize('letter')}
                  className={`py-1.5 px-2 rounded-xl font-sans text-xs font-semibold border transition-all ${
                    paperSize === 'letter' 
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow' 
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  US Letter (8.5x11&quot;)
                </button>
                <button
                  onClick={() => setPaperSize('a4')}
                  className={`py-1.5 px-2 rounded-xl font-sans text-xs font-semibold border transition-all ${
                    paperSize === 'a4' 
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow' 
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  ISO A4 (210x297mm)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Sheet Format:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { setLayoutMode('3x3'); setCurrentSheetIndex(0); }}
                  className={`py-1.5 px-2 rounded-xl font-sans text-xs font-semibold border transition-all ${
                    layoutMode === '3x3' 
                      ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow' 
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  3x3 Grid (9 Cards)
                </button>
                <button
                  onClick={() => { setLayoutMode('gutter-fold'); setCurrentSheetIndex(0); }}
                  className={`py-1.5 px-2 rounded-xl font-sans text-xs font-semibold border transition-all ${
                    layoutMode === 'gutter-fold' 
                      ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow' 
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  2x3 Gutter-Fold
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Duplex & Mirroring */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="block font-mono text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
            2. Duplex Alignment
          </span>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-200">
              <input
                type="checkbox"
                checked={includeBacks}
                onChange={e => setIncludeBacks(e.target.checked)}
                className="rounded accent-amber-500 w-4 h-4"
              />
              Include Card Back Sheets
            </label>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 shadow-inner">
              <span className="text-amber-400 font-bold block mb-0.5">Horizontal Mirroring:</span>
              Back columns automatically invert ([C1, C2, C3] &harr; [C3, C2, C1]) for 100% long-edge registration.
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-200">
              <input
                type="checkbox"
                checked={cropMarks}
                onChange={e => setCropMarks(e.target.checked)}
                className="rounded accent-amber-500 w-4 h-4"
              />
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              Draw Crop Marks &amp; Guides
            </label>
          </div>
        </div>

        {/* 3. Ink Saver / Eco-Print Mode */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">
              3. Toner / Ink Economy
            </span>
            <Leaf className={`w-4 h-4 ${ecoMode ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>

          <button
            onClick={() => { setEcoMode(prev => !prev); sound.playClick(); }}
            className={`w-full py-2 px-3 rounded-xl font-sans text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
              ecoMode 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/30' 
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Leaf className="w-4 h-4" />
            Eco Mode: {ecoMode ? 'ACTIVE (>75% SAVED)' : 'OFF (FULL COLOR)'}
          </button>

          <p className="text-xs font-mono text-slate-400 mt-2 leading-relaxed">
            Eliminates dark background fills, converting cards to high-contrast monochrome line art for laser or inkjet printers.
          </p>
        </div>

        {/* 4. Deck Selection */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">
              4. Decks ({activeCards.length} Cards)
            </span>
            <div className="flex gap-2 text-xs font-mono">
              <button onClick={selectAllDecks} className="text-amber-400 hover:underline">All</button>
              <button onClick={deselectAllDecks} className="text-slate-400 hover:underline">None</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-[110px] overflow-y-auto pr-1">
            {Object.values(DECK_CONFIG).map(d => {
              const checked = selectedDecks.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDeck(d.id)}
                  className={`text-xs font-mono px-2 py-1 rounded-lg text-left flex items-center gap-1.5 border truncate transition-colors ${
                    checked 
                      ? 'bg-slate-800 text-slate-100 border-amber-500/40' 
                      : 'bg-slate-950/70 text-slate-400 border-slate-800'
                  }`}
                >
                  {checked ? <CheckSquare className="w-3 h-3 text-amber-400 shrink-0" /> : <Square className="w-3 h-3 text-slate-600 shrink-0" />}
                  <span className="truncate">{d.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sheet Preview Arena */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-sm">
        {/* Sheet Navigator Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display font-bold text-slate-100 text-sm tracking-wide">
                SHEET PREVIEW: Sheet {currentSheetIndex + 1} of {totalSheets} ({paperSize.toUpperCase()}, {layoutMode.toUpperCase()})
              </h3>
              <span className="font-mono text-xs text-slate-400">
                Displaying {currentSheetCards.length} cards on this sheet &bull; Showing {previewFace.toUpperCase()} face
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Front / Back Toggle for 3x3 */}
            {layoutMode === '3x3' && includeBacks && (
              <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-slate-950 mr-2 shadow">
                <button
                  onClick={() => { setPreviewFace('front'); sound.playClick(); }}
                  className={`px-3 py-1 font-sans text-xs font-semibold transition-all ${
                    previewFace === 'front' 
                      ? 'bg-amber-500 text-slate-950 font-bold' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Front Sheet
                </button>
                <button
                  onClick={() => { setPreviewFace('back'); sound.playClick(); }}
                  className={`px-3 py-1 font-sans text-xs font-semibold transition-all ${
                    previewFace === 'back' 
                      ? 'bg-amber-500 text-slate-950 font-bold' 
                      : 'text-slate-300 hover:text-white'
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
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 shadow"
              aria-label="Previous Sheet"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-bold text-amber-400 px-2">
              {currentSheetIndex + 1} / {totalSheets}
            </span>
            <button
              onClick={() => { setCurrentSheetIndex(prev => Math.min(totalSheets - 1, prev + 1)); sound.playClick(); }}
              disabled={currentSheetIndex >= totalSheets - 1}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 shadow"
              aria-label="Next Sheet"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas Preview */}
        <div className="flex justify-center overflow-x-auto py-4">
          <div 
            className={`relative p-6 rounded-2xl transition-all shadow-2xl border-2 ${
              ecoMode 
                ? 'bg-white border-slate-300 text-black' 
                : 'bg-slate-950 border-slate-800 text-slate-100 shadow-inner'
            }`}
            style={{
              width: layoutMode === '3x3' ? '820px' : '600px',
              minHeight: '740px'
            }}
          >
            {/* Visual Crop Marks on corners */}
            {cropMarks && (
              <>
                <div className="absolute top-2.5 left-3 text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-amber-400" /> CUT GUIDE
                </div>
                <div className="absolute top-2.5 right-3 text-xs font-mono text-slate-400">
                  {paperSize.toUpperCase()} // 300 DPI
                </div>
                <div className="absolute bottom-2.5 left-3 text-xs font-mono text-slate-400">
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
                    className={`w-48 h-[272px] rounded-xl border-2 border-dashed flex items-center justify-center font-mono text-xs ${
                      ecoMode ? 'border-slate-300 text-slate-400' : 'border-slate-800 text-slate-600'
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
                <div className="absolute inset-y-0 left-1/2 -ml-px border-l-2 border-dashed border-amber-500/70 z-10 pointer-events-none flex flex-col items-center justify-center">
                  <span className="bg-amber-500 text-slate-950 font-display text-xs font-bold px-2 py-0.5 rounded -rotate-90 shadow">
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
        <div className="border-t border-slate-800 pt-3 mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-start gap-2">
            <span className="font-bold text-amber-400">1. Paper:</span>
            <span>Print on 110lb cardstock (300 gsm) with printer scaling set to &quot;100% / Actual Size&quot;.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-amber-400">2. Duplex:</span>
            <span>For 3x3 double-sided, set printer to &quot;Flip on Long Edge&quot;. Column mirroring is automatic.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-amber-400">3. Sleeves:</span>
            <span>Finished cut cards measure standard poker size (2.5&quot; x 3.5&quot;) fitting standard card sleeves.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
