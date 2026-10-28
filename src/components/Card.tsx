import React, { useState } from 'react';
import { CardData, DECK_CONFIG } from '../types/card';
import { 
  Anchor, 
  FishSymbol, 
  Radar, 
  Shield, 
  Skull, 
  Terminal, 
  Server, 
  Key, 
  Lock, 
  Database, 
  Zap, 
  AlertTriangle, 
  FileText, 
  Wifi, 
  Bug,
  Compass,
  CheckCircle2
} from 'lucide-react';

interface CardProps {
  card: CardData;
  isBack?: boolean;
  ecoMode?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'print';
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

// Procedural vector icon resolver
export const CardIcon: React.FC<{ iconName: string; className?: string; ecoMode?: boolean }> = ({ 
  iconName, 
  className = "w-10 h-10",
  ecoMode = false 
}) => {
  const iconProps = { className, strokeWidth: ecoMode ? 1.75 : 1.5 };

  switch (iconName) {
    case 'hook':
      return <FishSymbol {...iconProps} />;
    case 'server':
      return <Server {...iconProps} />;
    case 'clam':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={ecoMode ? "1.75" : "1.5"} className={className}>
          <path d="M12 2C6.5 2 2 6.5 2 12c0 4 2.5 7.5 6 9l4 1 4-1c3.5-1.5 6-5 6-9 0-5.5-4.5-10-10-10z" />
          <path d="M12 2v20" />
          <path d="M7 6c2 4 3 10 3 15" />
          <path d="M17 6c-2 4-3 10-3 15" />
          <circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case 'radar':
      return <Radar {...iconProps} />;
    case 'bug':
      return <Bug {...iconProps} />;
    case 'key':
      return <Key {...iconProps} />;
    case 'file-text':
      return <FileText {...iconProps} />;
    case 'wifi':
      return <Wifi {...iconProps} />;
    case 'database':
      return <Database {...iconProps} />;
    case 'alert-triangle':
      return <AlertTriangle {...iconProps} />;
    case 'terminal':
      return <Terminal {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    case 'lock':
      return <Lock {...iconProps} />;
    case 'anchor':
      return <Anchor {...iconProps} />;
    case 'skull':
      return <Skull {...iconProps} />;
    case 'shield':
      return <Shield {...iconProps} />;
    default:
      return <Compass {...iconProps} />;
  }
};

// Brass corner rivets
const Rivet: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br'; ecoMode?: boolean }> = ({ position, ecoMode }) => {
  const posClasses = {
    tl: 'top-1.5 left-1.5',
    tr: 'top-1.5 right-1.5',
    bl: 'bottom-1.5 left-1.5',
    br: 'bottom-1.5 right-1.5'
  }[position];

  if (ecoMode) {
    return (
      <div className={`absolute ${posClasses} w-2 h-2 rounded-full border border-black z-20 pointer-events-none`} />
    );
  }

  return (
    <div className={`absolute ${posClasses} w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 shadow-sm border border-amber-900/60 z-20 pointer-events-none flex items-center justify-center`}>
      <div className="w-1 h-1 rounded-full bg-amber-950/50" />
    </div>
  );
};

export const Card: React.FC<CardProps> = ({
  card,
  isBack = false,
  ecoMode = false,
  size = 'md',
  interactive = false,
  selected = false,
  onClick,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const deck = DECK_CONFIG[card.deck] || DECK_CONFIG.initial_compromise;

  // Scale classes based on standard poker aspect ratio (2.5in x 3.5in => 5:7 ratio)
  const sizeClasses = {
    sm: 'w-44 h-[246px] text-xs',
    md: 'w-64 h-[358px] text-xs',
    lg: 'w-80 h-[448px] text-sm',
    print: 'w-[2.5in] h-[3.5in] text-[10px] leading-tight select-none'
  }[size];

  // CARD BACK RENDERING
  if (isBack) {
    if (ecoMode) {
      return (
        <div 
          onClick={onClick}
          className={`relative ${sizeClasses} rounded-xl border-2 border-black bg-white p-3 flex flex-col justify-between items-center text-black font-serif shadow-sm overflow-hidden ${className} ${interactive ? 'cursor-pointer hover:shadow-md' : ''}`}
        >
          <Rivet position="tl" ecoMode={true} />
          <Rivet position="tr" ecoMode={true} />
          <Rivet position="bl" ecoMode={true} />
          <Rivet position="br" ecoMode={true} />

          <div className="w-full border-b border-black pb-1 text-center">
            <span className="font-mono text-[9px] uppercase tracking-widest font-bold">KRABS AGAINST SECURITY</span>
          </div>

          <div className="my-auto text-center flex flex-col items-center gap-2">
            <div className="p-3 border-2 border-black rounded-full">
              <Compass className="w-10 h-10 stroke-black stroke-[1.5]" />
            </div>
            <div className="font-bold uppercase tracking-wider text-sm border-y border-black py-0.5 px-3">
              {deck.name}
            </div>
            <span className="font-mono text-[8px] text-slate-600">DECK SPECIFICATION // CLASSIFIED</span>
          </div>

          <div className="w-full border-t border-black pt-1 flex justify-between items-center text-[7px] font-mono">
            <span>BHIS CC BY-SA 4.0</span>
            <span>KRUSTY KRAB SOC</span>
          </div>
        </div>
      );
    }

    return (
      <div 
        onClick={onClick}
        style={{ borderColor: deck.borderColor }}
        className={`relative ${sizeClasses} rounded-xl border-4 bg-gradient-to-b ${deck.bgGradient} p-3 flex flex-col justify-between items-center text-slate-100 font-serif shadow-xl overflow-hidden ${className} ${interactive ? 'cursor-pointer hover:scale-[1.02] transition-transform duration-200' : ''}`}
      >
        <Rivet position="tl" />
        <Rivet position="tr" />
        <Rivet position="bl" />
        <Rivet position="br" />

        {/* Outer Nautical Corner Trim */}
        <div className="absolute inset-1.5 border border-amber-500/30 rounded-lg pointer-events-none" />

        {/* Top Header */}
        <div className="w-full text-center z-10 border-b border-white/20 pb-1.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-amber-300 font-bold drop-shadow">
            KRABS AGAINST SECURITY
          </span>
        </div>

        {/* Center Crest */}
        <div className="my-auto text-center z-10 flex flex-col items-center gap-2">
          <div className="relative p-4 rounded-full bg-slate-950/70 border-2 border-amber-500/60 shadow-inner">
            <CardIcon iconName={card.iconName || deck.defaultIcon} className="w-12 h-12 text-amber-400" />
            <div className="absolute -inset-1 rounded-full border border-amber-400/20 animate-pulse" />
          </div>

          <div className="px-3 py-1 rounded bg-black/60 border border-amber-500/40 shadow">
            <span className="font-serif font-bold uppercase tracking-wider text-xs text-amber-200">
              {deck.name}
            </span>
          </div>
          <span className="font-mono text-[8px] text-slate-400">RESTRICTED // FORMULA SECURITY</span>
        </div>

        {/* Bottom Bar */}
        <div className="w-full z-10 border-t border-white/20 pt-1.5 flex justify-between items-center text-[7px] font-mono text-slate-400">
          <span>BHIS CC BY-SA 4.0</span>
          <span>KRUSTY KRAB SOC</span>
        </div>
      </div>
    );
  }

  // CARD FRONT RENDERING - ECO MODE
  if (ecoMode) {
    return (
      <div 
        onClick={onClick}
        className={`relative ${sizeClasses} rounded-xl border-2 border-black bg-white p-2.5 flex flex-col justify-between text-black font-sans shadow-sm overflow-hidden ${className} ${selected ? 'ring-2 ring-black' : ''} ${interactive ? 'cursor-pointer hover:bg-slate-50' : ''}`}
      >
        <Rivet position="tl" ecoMode={true} />
        <Rivet position="tr" ecoMode={true} />
        <Rivet position="bl" ecoMode={true} />
        <Rivet position="br" ecoMode={true} />

        {/* Header Bar */}
        <div className="border-b border-black pb-1 mb-1">
          <div className="flex justify-between items-center text-[8px] font-mono font-bold tracking-wider uppercase mb-0.5">
            <span className="px-1 border border-black rounded">{deck.shortName}</span>
            <span>{card.id}</span>
          </div>
          <h3 className="font-serif font-bold text-xs leading-tight text-black line-clamp-2">
            {card.title}
          </h3>
          {card.attackId && (
            <div className="font-mono text-[8px] text-slate-700 font-semibold mt-0.5">
              ATT&CK: {card.attackId}
            </div>
          )}
        </div>

        {/* Center Art / Icon Fallback Box */}
        <div className="h-20 w-full border border-black rounded flex items-center justify-center bg-slate-50 relative overflow-hidden my-1">
          <CardIcon iconName={card.iconName} className="w-10 h-10 text-black" ecoMode={true} />
          <div className="absolute bottom-0.5 right-1 text-[7px] font-mono text-slate-500">
            {card.nistPhase || 'IR PHASE'}
          </div>
        </div>

        {/* Mechanics & Description Box */}
        <div className="flex-1 flex flex-col justify-between text-[9px] leading-snug border border-black/80 rounded p-1.5 bg-white">
          <p className="font-mono text-black font-normal line-clamp-4">
            {card.description}
          </p>

          {/* Checks for Procedures */}
          {card.checks && card.checks.length > 0 && (
            <div className="mt-1 pt-1 border-t border-dashed border-black">
              {card.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center gap-1 font-mono font-bold text-[8.5px]">
                  <span className="border border-black px-1 rounded text-black">{chk.target}+</span>
                  <span className="truncate">{chk.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Inject Effect */}
          {card.injectEffect && (
            <div className="mt-1 pt-1 border-t border-dashed border-black font-mono font-bold text-[8.5px] text-black">
              EFFECT: {card.injectEffect}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-1 mt-1 border-t border-black flex justify-between items-center text-[7px] font-mono text-slate-700">
          <span>K.A.S. TIER 0</span>
          <span>CC BY-SA 4.0</span>
        </div>
      </div>
    );
  }

  // CARD FRONT RENDERING - FULL SATURATION TIER 0 PROCEDURAL
  const hasArtImage = Boolean(card.artAsset && !imageError);

  return (
    <div 
      onClick={onClick}
      style={{ borderColor: deck.borderColor }}
      className={`relative ${sizeClasses} rounded-xl border-4 bg-gradient-to-b ${deck.bgGradient} p-2.5 flex flex-col justify-between text-slate-100 font-sans shadow-xl overflow-hidden ${className} ${selected ? 'ring-4 ring-amber-400 scale-[1.02]' : ''} ${interactive ? 'cursor-pointer hover:scale-[1.02] transition-transform duration-200' : ''}`}
    >
      <Rivet position="tl" />
      <Rivet position="tr" />
      <Rivet position="bl" />
      <Rivet position="br" />

      {/* Decorative Inner Border */}
      <div className="absolute inset-1 border border-white/10 rounded-lg pointer-events-none" />

      {/* Header Bar */}
      <div className="z-10 border-b border-white/20 pb-1 mb-1">
        <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-wider mb-0.5">
          <span className={`px-1.5 py-0.2 rounded font-bold shadow-sm ${deck.badgeBg} ${deck.badgeText}`}>
            {deck.shortName}
          </span>
          <span className="font-mono text-amber-300 font-bold bg-black/40 px-1 rounded">
            {card.id}
          </span>
        </div>
        <h3 className="font-serif font-bold text-xs sm:text-sm leading-tight text-amber-100 drop-shadow line-clamp-2">
          {card.title}
        </h3>
        {card.attackId && (
          <div className="flex items-center gap-1 font-mono text-[8px] text-amber-300/90 mt-0.5">
            <span className="bg-slate-900/80 px-1 py-0.2 rounded border border-amber-500/30">
              MITRE {card.attackId}
            </span>
          </div>
        )}
      </div>

      {/* Procedural Art Box / Image Hydration Container */}
      <div className="relative h-24 w-full rounded-md border border-amber-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-hidden flex items-center justify-center my-1 shadow-inner z-10">
        {hasArtImage ? (
          <img 
            src={card.artAsset} 
            alt={card.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center relative w-full h-full">
            {/* Soft Radial Vignette Background */}
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-black/70 pointer-events-none" />
            <div className="p-2 rounded-full bg-slate-900/80 border border-amber-500/30 shadow-md">
              <CardIcon iconName={card.iconName} className="w-10 h-10 text-amber-400" />
            </div>
            {/* Subtle Nautical Coordinate Watermark */}
            <span className="absolute bottom-1 right-1.5 text-[7px] font-mono text-slate-500 tracking-tighter">
              LAT 11°58&apos;N LON 165°23&apos;E
            </span>
            {card.nistPhase && (
              <span className="absolute top-1 left-1.5 text-[7px] font-mono text-sky-400/80 tracking-tighter uppercase">
                {card.nistPhase}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mechanics & Terminal Description Box */}
      <div className="z-10 flex-1 flex flex-col justify-between text-[9px] leading-snug rounded-md border border-white/10 bg-slate-950/75 p-2 backdrop-blur-xs shadow-inner">
        <p className="font-mono text-slate-200 line-clamp-4">
          {card.description}
        </p>

        {/* Checks for Procedures */}
        {card.checks && card.checks.length > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-white/10 space-y-1">
            {card.checks.map((chk, idx) => (
              <div key={idx} className="flex items-center gap-1.5 font-mono text-[9px]">
                <span className="bg-sky-500 text-slate-950 font-bold px-1 rounded shadow-xs text-[8.5px]">
                  {chk.target}+
                </span>
                <span className="text-sky-200 truncate">{chk.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Inject Effect Badge */}
        {card.injectEffect && (
          <div className="mt-1.5 pt-1.5 border-t border-emerald-500/30 font-mono text-[9px] text-emerald-300 font-semibold flex items-start gap-1">
            <span className="bg-emerald-600/80 text-white px-1 rounded text-[8px]">EFFECT</span>
            <span className="line-clamp-2">{card.injectEffect}</span>
          </div>
        )}

        {/* Flavor Lore Text */}
        {card.flavorText && !card.checks && !card.injectEffect && (
          <div className="mt-1 pt-1 border-t border-white/5 font-serif italic text-amber-200/80 text-[8.5px] line-clamp-2">
            {card.flavorText}
          </div>
        )}
      </div>

      {/* Card Footer Bar */}
      <div className="z-10 pt-1 mt-1 border-t border-white/20 flex justify-between items-center text-[7px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5 text-amber-400" />
          K.A.S. TIER 0
        </span>
        <span>BHIS CC BY-SA 4.0</span>
      </div>
    </div>
  );
};
