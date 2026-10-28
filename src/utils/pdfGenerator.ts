import { PDFDocument, rgb, StandardFonts, RGB } from 'pdf-lib';
import { CardData, DeckType } from '../types/card';

export interface PDFExportOptions {
  paperSize: 'letter' | 'a4';
  layoutMode: '3x3' | 'gutter-fold';
  ecoMode: boolean;
  cropMarks: boolean;
  includeBacks: boolean;
  selectedDecks: DeckType[];
}

// Convert hex color to pdf-lib RGB
function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return rgb(r, g, b);
}

// Map deck types to colors
const DECK_COLORS: Record<DeckType, string> = {
  initial_compromise: '#dc2626',
  pivot_escalate: '#d97706',
  persistence: '#7c3aed',
  c2_exfil: '#92400e',
  procedures: '#0284c7',
  injects: '#059669'
};

// Word wrapping utility for PDF text
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine.length === 0 ? '' : ' ') + word;
    } else {
      if (currentLine.length > 0) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}

export async function generatePrintReadyPDF(
  cards: CardData[],
  options: PDFExportOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  // Load fonts
  const fontTitle = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontBody = await pdfDoc.embedFont(StandardFonts.Courier);
  const fontHeader = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Filter cards by selected decks
  const cardsToPrint = cards.filter(c => options.selectedDecks.includes(c.deck));

  // Points (1 pt = 1/72 in)
  // Standard Poker size: 2.5 x 3.5 inches = 180 x 252 points
  const cardW = 180;
  const cardH = 252;

  // Paper Dimensions in points
  const pageW = options.paperSize === 'letter' ? 8.5 * 72 : 595.28; // 612 pt vs 595.28 pt (A4)
  const pageH = options.paperSize === 'letter' ? 11.0 * 72 : 841.89; // 792 pt vs 841.89 pt (A4)

  if (options.layoutMode === '3x3') {
    // 3 columns x 3 rows = 9 cards per page
    const cols = 3;
    const rows = 3;
    const gridW = cols * cardW; // 540 pt
    const gridH = rows * cardH; // 756 pt
    const marginX = (pageW - gridW) / 2;
    const marginY = (pageH - gridH) / 2;

    const cardsPerPage = 9;
    const totalSheets = Math.ceil(cardsToPrint.length / cardsPerPage);

    for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
      const sheetCards = cardsToPrint.slice(sheetIdx * cardsPerPage, (sheetIdx + 1) * cardsPerPage);

      // FRONT PAGE
      const frontPage = pdfDoc.addPage([pageW, pageH]);

      // Draw Crop Marks on Front
      if (options.cropMarks) {
        drawCropMarks(frontPage, marginX, marginY, cols, rows, cardW, cardH);
      }

      // Draw Front Cards
      for (let i = 0; i < sheetCards.length; i++) {
        const card = sheetCards[i];
        const col = i % cols;
        const row = Math.floor(i / cols);

        // PDF coordinates start at bottom-left
        const x = marginX + col * cardW;
        const y = pageH - marginY - (row + 1) * cardH;

        drawCardFace(frontPage, card, x, y, cardW, cardH, options.ecoMode, {
          fontTitle,
          fontBody,
          fontHeader,
          fontRegular
        });
      }

      // BACK PAGE (Optional long-edge duplex column mirrored)
      if (options.includeBacks) {
        const backPage = pdfDoc.addPage([pageW, pageH]);

        if (options.cropMarks) {
          drawCropMarks(backPage, marginX, marginY, cols, rows, cardW, cardH);
        }

        for (let i = 0; i < sheetCards.length; i++) {
          const card = sheetCards[i];
          const origCol = i % cols;
          const origRow = Math.floor(i / cols);

          // Horizontal Column Reversal: [C1, C2, C3] -> [C3, C2, C1]
          const mirroredCol = (cols - 1) - origCol;
          const x = marginX + mirroredCol * cardW;
          const y = pageH - marginY - (origRow + 1) * cardH;

          drawCardBack(backPage, card, x, y, cardW, cardH, options.ecoMode, {
            fontTitle,
            fontBody,
            fontHeader,
            fontRegular
          });
        }
      }

      if (onProgress) {
        onProgress(Math.round(((sheetIdx + 1) / totalSheets) * 100));
      }
    }
  } else {
    // 2x3 Gutter-Fold Layout (3 rows of [Front | Back] adjacent)
    const cols = 2; // Col 0: Front, Col 1: Back
    const rows = 3;
    const gridW = cols * cardW; // 360 pt
    const gridH = rows * cardH; // 756 pt
    const marginX = (pageW - gridW) / 2;
    const marginY = (pageH - gridH) / 2;

    const cardsPerPage = 3; // 3 cards per sheet (front + back side-by-side)
    const totalSheets = Math.ceil(cardsToPrint.length / cardsPerPage);

    for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
      const sheetCards = cardsToPrint.slice(sheetIdx * cardsPerPage, (sheetIdx + 1) * cardsPerPage);
      const page = pdfDoc.addPage([pageW, pageH]);

      if (options.cropMarks) {
        drawCropMarks(page, marginX, marginY, cols, rows, cardW, cardH);
        // Draw center fold line
        page.drawLine({
          start: { x: marginX + cardW, y: marginY - 10 },
          end: { x: marginX + cardW, y: pageH - marginY + 10 },
          thickness: 0.5,
          color: rgb(0.5, 0.5, 0.5),
          dashArray: [4, 4]
        });
      }

      for (let i = 0; i < sheetCards.length; i++) {
        const card = sheetCards[i];
        const row = i;

        // Front Card on Left
        const xFront = marginX;
        const y = pageH - marginY - (row + 1) * cardH;
        drawCardFace(page, card, xFront, y, cardW, cardH, options.ecoMode, {
          fontTitle,
          fontBody,
          fontHeader,
          fontRegular
        });

        // Back Card on Right
        const xBack = marginX + cardW;
        drawCardBack(page, card, xBack, y, cardW, cardH, options.ecoMode, {
          fontTitle,
          fontBody,
          fontHeader,
          fontRegular
        });
      }

      if (onProgress) {
        onProgress(Math.round(((sheetIdx + 1) / totalSheets) * 100));
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}

// Draw crop marks extending outwards from grid
function drawCropMarks(
  page: any,
  marginX: number,
  marginY: number,
  cols: number,
  rows: number,
  cardW: number,
  cardH: number
) {
  const markLen = 12;
  const stroke = 0.5;
  const markColor = rgb(0.2, 0.2, 0.2);

  for (let c = 0; c <= cols; c++) {
    const x = marginX + c * cardW;
    // Top marks
    page.drawLine({
      start: { x, y: page.getHeight() - marginY },
      end: { x, y: page.getHeight() - marginY + markLen },
      thickness: stroke,
      color: markColor
    });
    // Bottom marks
    page.drawLine({
      start: { x, y: marginY },
      end: { x, y: marginY - markLen },
      thickness: stroke,
      color: markColor
    });
  }

  for (let r = 0; r <= rows; r++) {
    const y = marginY + r * cardH;
    // Left marks
    page.drawLine({
      start: { x: marginX, y },
      end: { x: marginX - markLen, y },
      thickness: stroke,
      color: markColor
    });
    // Right marks
    page.drawLine({
      start: { x: marginX + cols * cardW, y },
      end: { x: marginX + cols * cardW + markLen, y },
      thickness: stroke,
      color: markColor
    });
  }
}

// Draw front card face
function drawCardFace(
  page: any,
  card: CardData,
  x: number,
  y: number,
  w: number,
  h: number,
  ecoMode: boolean,
  fonts: any
) {
  const deckColorHex = DECK_COLORS[card.deck] || '#dc2626';
  const deckRgb = hexToRgb(deckColorHex);

  // Background
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: ecoMode ? rgb(1, 1, 1) : rgb(0.05, 0.08, 0.14)
  });

  // Border
  page.drawRectangle({
    x: x + 2,
    y: y + 2,
    width: w - 4,
    height: h - 4,
    borderColor: ecoMode ? rgb(0, 0, 0) : deckRgb,
    borderWidth: 2,
    color: ecoMode ? rgb(1, 1, 1) : rgb(0.08, 0.12, 0.2)
  });

  // Inner decorative frame
  page.drawRectangle({
    x: x + 6,
    y: y + 6,
    width: w - 12,
    height: h - 12,
    borderColor: ecoMode ? rgb(0.8, 0.8, 0.8) : rgb(0.9, 0.7, 0.2),
    borderWidth: 0.5
  });

  // 4 Corner Rivets
  const rivetOffset = 5;
  const rivetRadius = 1.5;
  const rivetColor = ecoMode ? rgb(0, 0, 0) : rgb(0.95, 0.75, 0.2);
  [[x + rivetOffset, y + rivetOffset],
   [x + w - rivetOffset, y + rivetOffset],
   [x + rivetOffset, y + h - rivetOffset],
   [x + w - rivetOffset, y + h - rivetOffset]].forEach(([rx, ry]) => {
    page.drawCircle({
      x: rx,
      y: ry,
      size: rivetRadius,
      color: rivetColor
    });
  });

  // Header Bar (Deck Name + ID)
  page.drawText(card.deck.replace('_', ' ').toUpperCase(), {
    x: x + 10,
    y: y + h - 18,
    size: 7,
    font: fonts.fontHeader,
    color: ecoMode ? rgb(0, 0, 0) : deckRgb
  });

  page.drawText(card.id, {
    x: x + w - 38,
    y: y + h - 18,
    size: 7,
    font: fonts.fontBody,
    color: ecoMode ? rgb(0, 0, 0) : rgb(0.9, 0.8, 0.4)
  });

  // Card Title
  const titleLines = wrapText(card.title, 26);
  let curY = y + h - 30;
  for (const line of titleLines.slice(0, 2)) {
    page.drawText(line, {
      x: x + 10,
      y: curY,
      size: 9,
      font: fonts.fontTitle,
      color: ecoMode ? rgb(0, 0, 0) : rgb(1, 1, 1)
    });
    curY -= 11;
  }

  // ATT&CK or Subtitle
  if (card.attackId) {
    page.drawText(`MITRE ATT&CK: ${card.attackId}`, {
      x: x + 10,
      y: curY,
      size: 6.5,
      font: fonts.fontBody,
      color: ecoMode ? rgb(0.3, 0.3, 0.3) : rgb(0.95, 0.75, 0.2)
    });
    curY -= 9;
  } else if (card.subtitle) {
    page.drawText(card.subtitle.slice(0, 32), {
      x: x + 10,
      y: curY,
      size: 6,
      font: fonts.fontRegular,
      color: ecoMode ? rgb(0.3, 0.3, 0.3) : rgb(0.6, 0.8, 1.0)
    });
    curY -= 9;
  }

  // Center Art Box
  const artBoxH = 45;
  const artBoxY = curY - artBoxH - 2;
  page.drawRectangle({
    x: x + 10,
    y: artBoxY,
    width: w - 20,
    height: artBoxH,
    borderColor: ecoMode ? rgb(0, 0, 0) : rgb(0.4, 0.5, 0.6),
    borderWidth: 0.75,
    color: ecoMode ? rgb(0.97, 0.97, 0.97) : rgb(0.04, 0.06, 0.1)
  });

  // Art Glyph text label inside box
  page.drawText(`[ ${card.iconName.toUpperCase()} // ${card.nistPhase || 'TRIAGE'} ]`, {
    x: x + 18,
    y: artBoxY + artBoxH / 2 - 3,
    size: 7,
    font: fonts.fontBody,
    color: ecoMode ? rgb(0.2, 0.2, 0.2) : rgb(0.9, 0.7, 0.2)
  });

  // Description / Mechanics Box
  const descBoxY = y + 26;
  const descBoxH = artBoxY - descBoxY - 4;
  page.drawRectangle({
    x: x + 10,
    y: descBoxY,
    width: w - 20,
    height: descBoxH,
    borderColor: ecoMode ? rgb(0.8, 0.8, 0.8) : rgb(0.2, 0.3, 0.4),
    borderWidth: 0.5,
    color: ecoMode ? rgb(1, 1, 1) : rgb(0.03, 0.05, 0.08)
  });

  const descLines = wrapText(card.description, 36);
  let textY = descBoxY + descBoxH - 9;
  for (const line of descLines.slice(0, 4)) {
    page.drawText(line, {
      x: x + 13,
      y: textY,
      size: 6.5,
      font: fonts.fontBody,
      color: ecoMode ? rgb(0, 0, 0) : rgb(0.9, 0.9, 0.9)
    });
    textY -= 8;
  }

  // Checks or Injects
  if (card.checks && card.checks.length > 0) {
    for (const chk of card.checks.slice(0, 2)) {
      page.drawText(`CHECK: ${chk.target}+ -> ${chk.description.slice(0, 26)}`, {
        x: x + 13,
        y: textY,
        size: 6,
        font: fonts.fontHeader,
        color: ecoMode ? rgb(0, 0, 0) : rgb(0.3, 0.8, 1.0)
      });
      textY -= 7.5;
    }
  } else if (card.injectEffect) {
    page.drawText(`EFFECT: ${card.injectEffect.slice(0, 32)}`, {
      x: x + 13,
      y: textY,
      size: 6,
      font: fonts.fontHeader,
      color: ecoMode ? rgb(0, 0, 0) : rgb(0.2, 0.9, 0.5)
    });
  }

  // Footer Attribution
  page.drawText("KRABS AGAINST SECURITY", {
    x: x + 10,
    y: y + 10,
    size: 5.5,
    font: fonts.fontBody,
    color: ecoMode ? rgb(0.4, 0.4, 0.4) : rgb(0.6, 0.6, 0.6)
  });

  page.drawText("CC BY-SA 4.0", {
    x: x + w - 46,
    y: y + 10,
    size: 5.5,
    font: fonts.fontBody,
    color: ecoMode ? rgb(0.4, 0.4, 0.4) : rgb(0.6, 0.6, 0.6)
  });
}

// Draw card back
function drawCardBack(
  page: any,
  card: CardData,
  x: number,
  y: number,
  w: number,
  h: number,
  ecoMode: boolean,
  fonts: any
) {
  const deckColorHex = DECK_COLORS[card.deck] || '#dc2626';
  const deckRgb = hexToRgb(deckColorHex);

  // Background
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: ecoMode ? rgb(1, 1, 1) : rgb(0.04, 0.06, 0.1)
  });

  // Border
  page.drawRectangle({
    x: x + 2,
    y: y + 2,
    width: w - 4,
    height: h - 4,
    borderColor: ecoMode ? rgb(0, 0, 0) : deckRgb,
    borderWidth: 2,
    color: ecoMode ? rgb(1, 1, 1) : rgb(0.07, 0.1, 0.18)
  });

  // Corner Rivets
  const rivetOffset = 5;
  const rivetRadius = 1.5;
  const rivetColor = ecoMode ? rgb(0, 0, 0) : rgb(0.95, 0.75, 0.2);
  [[x + rivetOffset, y + rivetOffset],
   [x + w - rivetOffset, y + rivetOffset],
   [x + rivetOffset, y + h - rivetOffset],
   [x + w - rivetOffset, y + h - rivetOffset]].forEach(([rx, ry]) => {
    page.drawCircle({
      x: rx,
      y: ry,
      size: rivetRadius,
      color: rivetColor
    });
  });

  // Center Compass / Emblem Box
  const emblemSize = 70;
  const emblemX = x + (w - emblemSize) / 2;
  const emblemY = y + (h - emblemSize) / 2;

  page.drawRectangle({
    x: emblemX,
    y: emblemY,
    width: emblemSize,
    height: emblemSize,
    borderColor: ecoMode ? rgb(0, 0, 0) : rgb(0.9, 0.7, 0.2),
    borderWidth: 1,
    color: ecoMode ? rgb(1, 1, 1) : rgb(0.02, 0.04, 0.08)
  });

  page.drawText("K.A.S.", {
    x: emblemX + 18,
    y: emblemY + emblemSize / 2 + 6,
    size: 14,
    font: fonts.fontTitle,
    color: ecoMode ? rgb(0, 0, 0) : rgb(0.95, 0.75, 0.2)
  });

  page.drawText("SOC DEFENSE", {
    x: emblemX + 11,
    y: emblemY + emblemSize / 2 - 8,
    size: 6,
    font: fonts.fontBody,
    color: ecoMode ? rgb(0.3, 0.3, 0.3) : rgb(0.7, 0.8, 0.9)
  });

  // Deck Name on Back
  page.drawText(card.deck.replace('_', ' ').toUpperCase(), {
    x: x + (w - 90) / 2,
    y: emblemY - 20,
    size: 8,
    font: fonts.fontHeader,
    color: ecoMode ? rgb(0, 0, 0) : deckRgb
  });

  page.drawText("SECRET FORMULA CLASSIFIED", {
    x: x + (w - 110) / 2,
    y: emblemY - 32,
    size: 5.5,
    font: fonts.fontBody,
    color: ecoMode ? rgb(0.4, 0.4, 0.4) : rgb(0.6, 0.6, 0.6)
  });

  // Top and Bottom Branding
  page.drawText("KRABS AGAINST SECURITY", {
    x: x + 24,
    y: y + h - 22,
    size: 7,
    font: fonts.fontTitle,
    color: ecoMode ? rgb(0, 0, 0) : rgb(1, 1, 1)
  });

  page.drawText("BHIS BACKDOORS & BREACHES CC BY-SA 4.0", {
    x: x + 16,
    y: y + 14,
    size: 5,
    font: fonts.fontBody,
    color: ecoMode ? rgb(0.4, 0.4, 0.4) : rgb(0.5, 0.5, 0.5)
  });
}
