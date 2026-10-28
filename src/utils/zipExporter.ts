import JSZip from 'jszip';
import { CardData } from '../types/card';

export async function exportCardsZip(cards: CardData[], onProgress?: (pct: number) => void): Promise<Blob> {
  const zip = new JSZip();

  // Create subfolders by deck
  const decksFolder = zip.folder("cards");
  const metaFolder = zip.folder("metadata");

  // Add full card database JSON
  metaFolder?.file("cards.json", JSON.stringify(cards, null, 2));

  // Add individual SVG card files
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const deckSub = decksFolder?.folder(card.deck);

    // Generate standalone printable SVG card
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050" width="750" height="1050">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a192f"/>
      <stop offset="100%" stop-color="#020c1b"/>
    </linearGradient>
  </defs>
  <rect width="750" height="1050" fill="url(#bg)" rx="30"/>
  <rect x="20" y="20" width="710" height="1010" fill="none" stroke="#f59e0b" stroke-width="8" rx="20"/>
  
  <text x="50" y="90" font-family="monospace" font-size="28" font-weight="bold" fill="#f59e0b">${card.deck.toUpperCase()}</text>
  <text x="700" y="90" text-anchor="end" font-family="monospace" font-size="28" font-weight="bold" fill="#fef08a">${card.id}</text>
  
  <text x="50" y="160" font-family="serif" font-size="44" font-weight="bold" fill="#ffffff">${escapeXml(card.title)}</text>
  ${card.attackId ? `<text x="50" y="210" font-family="monospace" font-size="26" fill="#38bdf8">MITRE ATT&amp;CK: ${card.attackId}</text>` : ''}
  
  <rect x="50" y="240" width="650" height="300" fill="#0f172a" stroke="#f59e0b" stroke-width="4" rx="10"/>
  <text x="375" y="400" text-anchor="middle" font-family="monospace" font-size="34" fill="#f59e0b">[ ${card.iconName.toUpperCase()} // ${card.nistPhase || 'TRIAGE'} ]</text>
  
  <rect x="50" y="570" width="650" height="360" fill="#030712" stroke="#334155" stroke-width="2" rx="10"/>
  <text x="80" y="630" font-family="monospace" font-size="26" fill="#e2e8f0">${escapeXml(card.description)}</text>
  ${card.injectEffect ? `<text x="80" y="800" font-family="monospace" font-size="26" font-weight="bold" fill="#34d399">EFFECT: ${escapeXml(card.injectEffect)}</text>` : ''}
  
  <text x="50" y="980" font-family="monospace" font-size="22" fill="#94a3b8">KRABS AGAINST SECURITY • BHIS CC BY-SA 4.0</text>
</svg>`;

    deckSub?.file(`${card.id}.svg`, svgContent);

    if (onProgress) {
      onProgress(Math.round(((i + 1) / cards.length) * 100));
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
