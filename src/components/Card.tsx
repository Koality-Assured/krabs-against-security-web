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
  ChevronUp,
  ChevronDown,
  Target
} from 'lucide-react';

export interface CardProps {
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
  const [isExpanded, setIsExpanded] = useState(false);
  const deck = DECK_CONFIG[card.deck] || DECK_CONFIG.initial_compromise;

  // Poker card aspect ratio (5:7 ratio)
  const sizeClasses = {
    sm: 'w-48 h-[272px] text-xs',
    md: 'w-64 h-[364px] text-xs',
    lg: 'w-80 h-[456px] text-sm',
    print: 'w-[2.5in] h-[3.5in] text-xs leading-tight select-none'
  }[size];

  // =========================================================================
  // 1. CARD BACK RENDERING (Standard & Eco)
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
        {/* Brass Inner Filigree Border */}
        <div className="absolute inset-2 border border-amber-400/25 rounded-xl pointer-events-none" />

        {/* Top Header */}
        <div className="w-full text-center z-10 border-b border-white/15 pb-2">
          <span className="font-mono text-xs uppercase tracking-widest text-amber-200/90 font-bold">
            KRABS AGAINST SECURITY
          </span>
        </div>

        {/* Center Crest */}
        <div className="my-auto text-center z-10 flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-slate-950/80 border border-amber-500/40 shadow-xl shadow-black/80">
            <CardIcon iconName={card.iconName || deck.defaultIcon} className="w-11 h-11 text-amber-400" />
          </div>

          <div className="px-4 py-1.5 rounded-lg bg-slate-950/90 border border-amber-500/30 shadow-md">
            <span className="font-display font-bold uppercase tracking-wider text-sm text-slate-100">
              {deck.name}
            </span>
          </div>
          <span className="font-mono text-xs text-amber-300/80 tracking-wider">
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
  // 2. CARD FRONT RENDERING - ECO MODE (High Ink Efficiency)
  // =========================================================================
  if (ecoMode) {
    return (
      <div 
        onClick={onClick}
        className={`relative ${sizeClasses} rounded-2xl border-2 border-black bg-white p-3 flex flex-col justify-between text-black font-sans shadow-sm overflow-hidden ${className} ${selected ? 'ring-2 ring-black' : ''} ${interactive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      >
        {/* Header Bar */}
        <div className="border-b border-black pb-1 mb-1">
          <div className="flex justify-between items-center text-xs font-mono font-bold tracking-wider uppercase mb-0.5">
            <span className="px-1.5 py-0.2 border border-black rounded">{deck.shortName}</span>
            <span>{card.id}</span>
          </div>
          <h3 className="font-display font-bold text-xs sm:text-sm leading-tight text-black line-clamp-1">
            {card.title}
          </h3>
          {card.attackId && (
            <div className="font-mono text-[10px] text-slate-800 font-semibold">
              ATT&amp;CK: {card.attackId}
            </div>
          )}
        </div>

        {/* Center Vector Icon Box */}
        <div className="h-20 w-full border border-black rounded-lg flex items-center justify-center bg-slate-50 relative overflow-hidden my-1">
          <CardIcon iconName={card.iconName} className="w-10 h-10 text-black" ecoMode={true} />
          {card.nistPhase && (
            <div className="absolute bottom-1 right-2 text-[10px] font-mono font-semibold text-slate-700 uppercase">
              {card.nistPhase}
            </div>
          )}
        </div>

        {/* Mechanics & Description Box */}
        <div className="flex-1 flex flex-col justify-between text-xs leading-relaxed border border-black rounded-lg p-2 bg-white">
          <p className="font-mono text-black text-[11px] leading-relaxed line-clamp-4">
            {card.description}
          </p>

          {/* Checks for Procedures */}
          {card.checks && card.checks.length > 0 && (
            <div className="mt-1 pt-1 border-t border-dashed border-black space-y-0.5">
              {card.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-mono font-bold text-[11px]">
                  <span className="border border-black px-1.5 py-0.2 rounded text-black">{chk.target}+</span>
                  <span className="truncate">{chk.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Inject Effect */}
          {card.injectEffect && (
            <div className="mt-1 pt-1 border-t border-dashed border-black font-mono font-bold text-[11px] text-black">
              EFFECT: {card.injectEffect}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-1 mt-1 border-t border-black flex justify-between items-center text-[10px] font-mono text-slate-800">
          <span>K.A.S. TIER 0</span>
          <span>CC BY-SA 4.0</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. CARD FRONT RENDERING - PRINT MODE (Static Physical Layout)
  // =========================================================================
  if (size === 'print') {
    const hasArtImage = Boolean(card.artAsset && !imageError);
    return (
      <div 
        style={{ borderColor: deck.borderColor }}
        className={`relative ${sizeClasses} rounded-xl border-2 bg-slate-950 p-2 flex flex-col justify-between text-slate-100 font-sans overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="border-b border-white/20 pb-1">
          <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider mb-0.5">
            <span className={`px-1.5 py-0.2 rounded font-bold ${deck.badgeBg} ${deck.badgeText}`}>
              {deck.shortName}
            </span>
            <span className="font-mono text-amber-300 font-bold">
              {card.id}
            </span>
          </div>
          <h3 className="font-display font-bold text-[11px] leading-tight text-white line-clamp-1">
            {card.title}
          </h3>
          {card.attackId && (
            <div className="text-[9px] font-mono text-amber-300">
              MITRE {card.attackId}
            </div>
          )}
        </div>

        {/* Artwork (~48% of card) */}
        <div className="relative h-[115px] w-full rounded-lg border border-white/15 bg-slate-900 overflow-hidden flex items-center justify-center my-1 shadow-inner">
          {hasArtImage ? (
            <img 
              src={card.artAsset} 
              alt={card.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <CardIcon iconName={card.iconName} className="w-10 h-10 text-amber-400" />
          )}
        </div>

        {/* Mechanics Box */}
        <div className="flex-1 flex flex-col justify-between rounded-lg border border-white/10 bg-slate-900/90 p-1.5 text-[9px]">
          <p className="font-mono text-slate-200 leading-tight line-clamp-3">
            {card.description}
          </p>

          {card.checks && card.checks.length > 0 && (
            <div className="mt-1 pt-1 border-t border-white/10 space-y-0.5">
              {card.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center gap-1 font-mono text-[9px]">
                  <span className="bg-sky-500 text-slate-950 font-bold px-1 rounded">
                    {chk.target}+
                  </span>
                  <span className="text-sky-200 truncate">{chk.description}</span>
                </div>
              ))}
            </div>
          )}

          {card.injectEffect && (
            <div className="mt-1 pt-1 border-t border-emerald-500/30 font-mono text-[9px] text-emerald-300 font-semibold truncate">
              EFFECT: {card.injectEffect}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-1 border-t border-white/10 flex justify-between items-center text-[8px] font-mono text-slate-400">
          <span>K.A.S. // BHIS CC BY-SA 4.0</span>
          <span>{card.nistPhase || 'KRUSTY KRAB SOC'}</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. CARD FRONT RENDERING - ART-FORWARD INTERACTIVE TABLETOP CARD
  // =========================================================================
  const hasArtImage = Boolean(card.artAsset && !imageError);
  const primaryCheck = card.checks?.[0];

  return (
    <div 
      onClick={onClick}
      style={{ borderColor: deck.borderColor }}
      className={`group relative ${sizeClasses} rounded-2xl border-2 bg-gradient-to-b ${deck.bgGradient} p-2.5 flex flex-col justify-between text-slate-100 font-sans shadow-xl shadow-black/80 overflow-hidden ${className} ${selected ? 'ring-4 ring-amber-400 scale-[1.02]' : ''} ${interactive ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-200' : ''}`}
    >
      {/* Brass Inner Filigree Border */}
      <div className="absolute inset-1.5 border border-amber-400/20 rounded-xl pointer-events-none z-10" />

      {/* Clean Top Header Bar */}
      <div className="z-10 border-b border-white/15 pb-1.5 mb-1 shrink-0">
        <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider mb-1">
          <span className={`px-2 py-0.5 rounded font-bold shadow-sm text-[11px] ${deck.badgeBg} ${deck.badgeText}`}>
            {deck.shortName}
          </span>
          <span className="font-mono text-amber-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30 text-[11px] shadow-sm">
            {card.id}
          </span>
        </div>
        <h3 className="font-display font-bold text-xs sm:text-sm leading-tight text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
          {card.title}
        </h3>
      </div>

      {/* Prominent Illustration Container (~55-60% Card Height) */}
      <div className="relative flex-1 w-full rounded-xl border border-amber-500/25 bg-slate-950/90 overflow-hidden flex items-center justify-center my-0.5 shadow-inner z-0">
        {hasArtImage ? (
          <img 
            src={card.artAsset} 
            alt={card.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center relative w-full h-full p-3 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="p-3 rounded-full bg-slate-950 border border-amber-500/40 shadow-lg shadow-black/80">
              <CardIcon iconName={card.iconName} className="w-10 h-10 text-amber-400" />
            </div>
            {card.nistPhase && (
              <span className="mt-2 text-[10px] font-mono text-cyan-300 uppercase font-semibold">
                {card.nistPhase}
              </span>
            )}
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              KRUSTY KRAB INCIDENT ASSET
            </span>
          </div>
        )}

        {/* Resting Artwork Overlay Badge (Top-Right or Bottom-Right subtle pill) */}
        {card.attackId && (
          <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-xs border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-semibold shadow-md">
            MITRE {card.attackId}
          </div>
        )}
      </div>

      {/* Resting Lower Plaque: Visible when drawer is closed */}
      <div className="z-10 pt-1.5 shrink-0 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 truncate pr-1">
          {primaryCheck ? (
            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
              <Target className="w-3 h-3 text-sky-400" />
              DC {primaryCheck.target}+ {card.checks && card.checks.length > 1 ? `(${card.checks.length} Checks)` : 'Check'}
            </span>
          ) : card.injectEffect ? (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-emerald-400" />
              INJECT EFFECT
            </span>
          ) : card.subtitle ? (
            <span className="text-amber-200/80 text-[10px] font-medium truncate">
              {card.subtitle}
            </span>
          ) : (
            <span className="text-slate-400 text-[10px]">
              {card.nistPhase || 'Incident Vector'}
            </span>
          )}
        </div>

        {/* Subtle Accessible Expand Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          aria-expanded={isExpanded}
          aria-label="Toggle card details drawer"
          className="p-1 rounded-lg bg-slate-950/80 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 transition-all flex items-center gap-0.5 text-[10px] shadow-sm shrink-0"
        >
          <span className="sr-only">Details</span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Hover/Focus Details Drawer: Smooth slide-up frosted glass drawer */}
      <div 
        className={`absolute inset-x-0 bottom-0 z-20 bg-slate-950/95 backdrop-blur-md border-t-2 border-amber-500/50 rounded-b-2xl p-3 text-slate-100 shadow-2xl transition-transform duration-300 ease-out flex flex-col justify-between ${
          isExpanded ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0'
        }`}
        style={{ maxHeight: '85%' }}
      >
        {/* Drawer Drag/Header Handle */}
        <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-1.5">
          <div className="truncate pr-1">
            <span className="text-amber-300 font-display font-bold text-xs truncate block">
              {card.title}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {card.subtitle || (card.attackId ? `MITRE ${card.attackId}` : deck.name)}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Collapse drawer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Content inside Drawer */}
        <div className="overflow-y-auto space-y-2 pr-1 text-xs">
          {/* Incident Mechanics */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-0.5">
              Incident Mechanics:
            </h4>
            <p className="font-mono text-slate-200 text-[11px] leading-relaxed">
              {card.description}
            </p>
          </div>

          {/* Defensive Checks Matrix */}
          {card.checks && card.checks.length > 0 && (
            <div className="pt-1.5 border-t border-white/10 space-y-1">
              <h5 className="font-mono text-[10px] uppercase tracking-wider text-sky-300 font-bold">
                Procedure Rolls (d20):
              </h5>
              {card.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="bg-sky-500 text-slate-950 font-bold px-1.5 py-0.2 rounded shadow-xs shrink-0">
                    DC {chk.target}+
                  </span>
                  <span className="text-sky-200 truncate">{chk.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Operational Inject Effect */}
          {card.injectEffect && (
            <div className="pt-1.5 border-t border-emerald-500/30">
              <h5 className="font-mono text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-emerald-400" />
                Operational Inject Effect:
              </h5>
              <p className="font-mono text-emerald-200 text-[11px] leading-snug font-medium">
                {card.injectEffect}
              </p>
            </div>
          )}

          {/* Undersea Satirical Lore */}
          {card.flavorText && (
            <div className="pt-1 border-t border-white/10 font-serif italic text-amber-200/90 text-[10px] leading-snug border-l-2 border-amber-500/50 pl-2">
              &ldquo;{card.flavorText}&rdquo;
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="pt-1.5 mt-1 border-t border-white/10 flex justify-between items-center text-[9px] font-mono text-slate-400">
          <span className="text-amber-400 font-bold">K.A.S. TIER 0</span>
          <span>BHIS CC BY-SA 4.0</span>
        </div>
      </div>
    </div>
  );
};
