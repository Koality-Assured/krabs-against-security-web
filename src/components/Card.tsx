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
  const iconProps = { className, strokeWidth: ecoMode ? 2 : 1.75 };

  switch (iconName) {
    case 'hook':
      return <FishSymbol {...iconProps} />;
    case 'server':
      return <Server {...iconProps} />;
    case 'clam':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={ecoMode ? "2" : "1.75"} className={className}>
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
    sm: 'w-48 h-[272px] text-xs',
    md: 'w-64 h-[364px] text-xs',
    lg: 'w-80 h-[456px] text-sm',
    print: 'w-[2.5in] h-[3.5in] text-xs leading-tight select-none'
  }[size];

  // =========================================================================
  // CARD BACK RENDERING
  // =========================================================================
  if (isBack) {
    if (ecoMode) {
      return (
        <div 
          onClick={onClick}
          className={`relative ${sizeClasses} rounded-2xl border-2 border-black bg-white p-3.5 flex flex-col justify-between items-center text-black font-sans shadow-sm overflow-hidden ${className} ${interactive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        >
          {/* Subtle Eco Border Filigree */}
          <div className="absolute inset-1.5 border border-dashed border-black/40 rounded-xl pointer-events-none" />

          <div className="w-full pb-1 text-center z-10 border-b border-black">
            <span className="font-mono text-xs uppercase tracking-widest font-bold">
              KRABS AGAINST SECURITY
            </span>
          </div>

          <div className="my-auto text-center z-10 flex flex-col items-center gap-2.5">
            <div className="p-3.5 border-2 border-black rounded-full bg-slate-50">
              <Compass className="w-10 h-10 stroke-black stroke-2" />
            </div>
            <div className="font-display font-bold uppercase tracking-wider text-sm border-y-2 border-black py-1 px-4">
              {deck.name}
            </div>
            <span className="font-mono text-xs text-slate-700 font-semibold tracking-wide">
              INCIDENT RESPONSE DECK
            </span>
          </div>

          <div className="w-full z-10 border-t border-black pt-1.5 flex justify-between items-center text-xs font-mono text-slate-800">
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
        className={`relative ${sizeClasses} rounded-2xl border-2 bg-gradient-to-b ${deck.bgGradient} p-4 flex flex-col justify-between items-center text-slate-100 font-sans shadow-xl shadow-black/80 overflow-hidden ${className} ${interactive ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-200' : ''}`}
      >
        {/* Subtle, Tasteful Inner Filigree Border */}
        <div className="absolute inset-2 border border-white/15 rounded-xl pointer-events-none" />

        {/* Top Header */}
        <div className="w-full text-center z-10 border-b border-white/15 pb-2">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-300 font-bold">
            KRABS AGAINST SECURITY
          </span>
        </div>

        {/* Center Crest */}
        <div className="my-auto text-center z-10 flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-slate-950/80 border border-white/20 shadow-lg">
            <CardIcon iconName={card.iconName || deck.defaultIcon} className="w-11 h-11 text-amber-400" />
          </div>

          <div className="px-4 py-1.5 rounded-lg bg-slate-950/90 border border-white/20 shadow-md">
            <span className="font-display font-bold uppercase tracking-wider text-sm text-slate-100">
              {deck.name}
            </span>
          </div>
          <span className="font-mono text-xs text-slate-300/80 tracking-wider">
            RESTRICTED // FORMULA SECURITY
          </span>
        </div>

        {/* Bottom Bar */}
        <div className="w-full z-10 border-t border-white/15 pt-2 flex justify-between items-center text-xs font-mono text-slate-400">
          <span>BHIS CC BY-SA 4.0</span>
          <span>KRUSTY KRAB SOC</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CARD FRONT RENDERING - ECO MODE
  // =========================================================================
  if (ecoMode) {
    return (
      <div 
        onClick={onClick}
        className={`relative ${sizeClasses} rounded-2xl border-2 border-black bg-white p-3 flex flex-col justify-between text-black font-sans shadow-sm overflow-hidden ${className} ${selected ? 'ring-2 ring-black' : ''} ${interactive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      >
        {/* Header Bar */}
        <div className="border-b border-black pb-1.5 mb-1.5">
          <div className="flex justify-between items-center text-xs font-mono font-bold tracking-wider uppercase mb-1">
            <span className="px-1.5 py-0.5 border border-black rounded">{deck.shortName}</span>
            <span>{card.id}</span>
          </div>
          <h3 className="font-display font-bold text-sm leading-tight text-black line-clamp-2">
            {card.title}
          </h3>
          {card.attackId && (
            <div className="font-mono text-xs text-slate-800 font-semibold mt-0.5">
              ATT&CK: {card.attackId}
            </div>
          )}
        </div>

        {/* Center Vector Icon Box */}
        <div className="h-20 w-full border border-black rounded-lg flex items-center justify-center bg-slate-50 relative overflow-hidden my-1">
          <CardIcon iconName={card.iconName} className="w-10 h-10 text-black" ecoMode={true} />
          {card.nistPhase && (
            <div className="absolute bottom-1 right-2 text-xs font-mono font-semibold text-slate-700 uppercase">
              {card.nistPhase}
            </div>
          )}
        </div>

        {/* Mechanics & Description Box */}
        <div className="flex-1 flex flex-col justify-between text-xs leading-relaxed border border-black rounded-lg p-2 bg-white">
          <p className="font-mono text-black text-xs leading-relaxed line-clamp-4">
            {card.description}
          </p>

          {/* Checks for Procedures */}
          {card.checks && card.checks.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-dashed border-black space-y-1">
              {card.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-mono font-bold text-xs">
                  <span className="border border-black px-1.5 py-0.2 rounded text-black">{chk.target}+</span>
                  <span className="truncate">{chk.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Inject Effect */}
          {card.injectEffect && (
            <div className="mt-1.5 pt-1.5 border-t border-dashed border-black font-mono font-bold text-xs text-black">
              EFFECT: {card.injectEffect}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-1.5 mt-1 border-t border-black flex justify-between items-center text-xs font-mono text-slate-800">
          <span>K.A.S. TIER 0</span>
          <span>CC BY-SA 4.0</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CARD FRONT RENDERING - FULL SATURATION TACTILE TABLETOP CARD
  // =========================================================================
  const hasArtImage = Boolean(card.artAsset && !imageError);

  return (
    <div 
      onClick={onClick}
      style={{ borderColor: deck.borderColor }}
      className={`relative ${sizeClasses} rounded-2xl border-2 bg-gradient-to-b ${deck.bgGradient} p-3 flex flex-col justify-between text-slate-100 font-sans shadow-xl shadow-black/80 overflow-hidden ${className} ${selected ? 'ring-4 ring-amber-400 scale-[1.02]' : ''} ${interactive ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 transition-all duration-200' : ''}`}
    >
      {/* Subtle Inner Card Border */}
      <div className="absolute inset-1.5 border border-white/10 rounded-xl pointer-events-none" />

      {/* Header Bar */}
      <div className="z-10 border-b border-white/15 pb-1.5 mb-1">
        <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider mb-1">
          <span className={`px-2 py-0.5 rounded font-bold shadow-sm ${deck.badgeBg} ${deck.badgeText}`}>
            {deck.shortName}
          </span>
          <span className="font-mono text-amber-300 font-bold bg-slate-950/70 px-1.5 py-0.5 rounded border border-white/10">
            {card.id}
          </span>
        </div>
        <h3 className="font-display font-bold text-sm sm:text-base leading-tight text-white line-clamp-2">
          {card.title}
        </h3>
        {card.attackId && (
          <div className="flex items-center gap-1 font-mono text-xs text-amber-300/90 mt-1">
            <span className="bg-slate-950/80 px-1.5 py-0.5 rounded border border-white/10 font-semibold">
              MITRE {card.attackId}
            </span>
          </div>
        )}
      </div>

      {/* Procedural Art Box / Image Hydration Container */}
      <div className="relative h-24 w-full rounded-xl border border-white/15 bg-slate-950/80 overflow-hidden flex items-center justify-center my-1 shadow-inner z-10">
        {hasArtImage ? (
          <img 
            src={card.artAsset} 
            alt={card.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center relative w-full h-full">
            <div className="p-2.5 rounded-full bg-slate-900 border border-white/15 shadow-md">
              <CardIcon iconName={card.iconName} className="w-9 h-9 text-amber-400" />
            </div>
            {card.nistPhase && (
              <span className="absolute top-1.5 left-2 text-xs font-mono text-cyan-300 uppercase font-semibold">
                {card.nistPhase}
              </span>
            )}
            <span className="absolute bottom-1.5 right-2 text-xs font-mono text-slate-500">
              IR PHASE
            </span>
          </div>
        )}
      </div>

      {/* Mechanics & Description Box */}
      <div className="z-10 flex-1 flex flex-col justify-between text-xs leading-relaxed rounded-xl border border-white/10 bg-slate-950/80 p-2.5 backdrop-blur-xs shadow-inner">
        <p className="font-mono text-slate-200 text-xs leading-relaxed line-clamp-4">
          {card.description}
        </p>

        {/* Checks for Procedures */}
        {card.checks && card.checks.length > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-white/10 space-y-1">
            {card.checks.map((chk, idx) => (
              <div key={idx} className="flex items-center gap-1.5 font-mono text-xs">
                <span className="bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.5 rounded shadow-xs text-xs">
                  {chk.target}+
                </span>
                <span className="text-cyan-200 truncate">{chk.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Inject Effect Badge */}
        {card.injectEffect && (
          <div className="mt-1.5 pt-1.5 border-t border-emerald-500/30 font-mono text-xs text-emerald-300 font-semibold flex items-start gap-1.5">
            <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
              EFFECT
            </span>
            <span className="line-clamp-2 text-xs leading-snug">{card.injectEffect}</span>
          </div>
        )}

        {/* Flavor Lore Text */}
        {card.flavorText && !card.checks && !card.injectEffect && (
          <div className="mt-1 pt-1 border-t border-white/10 font-serif italic text-amber-200/80 text-xs line-clamp-2">
            {card.flavorText}
          </div>
        )}
      </div>

      {/* Card Footer Bar */}
      <div className="z-10 pt-1.5 mt-1 border-t border-white/15 flex justify-between items-center text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          K.A.S. TIER 0
        </span>
        <span>BHIS CC BY-SA 4.0</span>
      </div>
    </div>
  );
};
