export type DeckType =
  | 'initial_compromise'
  | 'pivot_escalate'
  | 'persistence'
  | 'c2_exfil'
  | 'procedures'
  | 'injects';

export interface CardCheck {
  target: number;
  description: string;
  phase?: string;
}

export interface CardData {
  id: string;
  title: string;
  deck: DeckType;
  subtitle?: string;
  attackId?: string;
  nistPhase?: string;
  description: string;
  flavorText?: string;
  checks?: CardCheck[];
  injectEffect?: string;
  iconName: string;
  artAsset?: string;
}

export interface DeckMetadata {
  id: DeckType;
  name: string;
  shortName: string;
  colorHex: string;
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  accentColor: string;
  description: string;
  defaultIcon: string;
}

export const DECK_CONFIG: Record<DeckType, DeckMetadata> = {
  initial_compromise: {
    id: 'initial_compromise',
    name: 'Initial Compromise',
    shortName: 'Compromise',
    colorHex: '#dc2626',
    bgGradient: 'from-red-950/90 via-red-900/60 to-slate-900/90',
    badgeBg: 'bg-red-700',
    badgeText: 'text-red-100',
    borderColor: '#ef4444',
    accentColor: 'text-red-400',
    description: 'Attack vector breaching the outer perimeter and reef defenses.',
    defaultIcon: 'hook'
  },
  pivot_escalate: {
    id: 'pivot_escalate',
    name: 'Pivot & Escalate',
    shortName: 'Pivot',
    colorHex: '#d97706',
    bgGradient: 'from-amber-950/90 via-amber-900/60 to-slate-900/90',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-amber-100',
    borderColor: '#f59e0b',
    accentColor: 'text-amber-400',
    description: 'Lateral traversal across kitchen VLANs and credential theft.',
    defaultIcon: 'radar'
  },
  persistence: {
    id: 'persistence',
    name: 'Persistence',
    shortName: 'Persistence',
    colorHex: '#7c3aed',
    bgGradient: 'from-purple-950/90 via-purple-900/60 to-slate-900/90',
    badgeBg: 'bg-purple-700',
    badgeText: 'text-purple-100',
    borderColor: '#8b5cf6',
    accentColor: 'text-purple-400',
    description: 'Deep barnacle footholds that survive system restarts and scrubs.',
    defaultIcon: 'anchor'
  },
  c2_exfil: {
    id: 'c2_exfil',
    name: 'C2 & Exfiltration',
    shortName: 'Exfiltration',
    colorHex: '#92400e',
    bgGradient: 'from-amber-950/95 via-yellow-950/70 to-slate-900/90',
    badgeBg: 'bg-yellow-800',
    badgeText: 'text-yellow-100',
    borderColor: '#b45309',
    accentColor: 'text-amber-500',
    description: 'Undersea beaconing channels and secret formula extraction.',
    defaultIcon: 'clam'
  },
  procedures: {
    id: 'procedures',
    name: 'Defensive Procedures',
    shortName: 'Procedures',
    colorHex: '#0284c7',
    bgGradient: 'from-sky-950/90 via-sky-900/60 to-slate-900/90',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-sky-100',
    borderColor: '#0ea5e9',
    accentColor: 'text-sky-400',
    description: 'SOC investigative procedures and d20 dice checks.',
    defaultIcon: 'shield'
  },
  injects: {
    id: 'injects',
    name: 'Operational Injects',
    shortName: 'Injects',
    colorHex: '#059669',
    bgGradient: 'from-emerald-950/90 via-slate-900/70 to-slate-950/90',
    badgeBg: 'bg-emerald-700',
    badgeText: 'text-emerald-100',
    borderColor: '#10b981',
    accentColor: 'text-emerald-400',
    description: 'Maritime organizational chaos, executive meddling, and panic.',
    defaultIcon: 'skull'
  }
};

export interface ScenarioData {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  briefing: string;
  scenario_cards: {
    initial_compromise: string;
    pivot_escalate: string;
    persistence: string;
    c2_exfil: string;
  };
  recommended_injects: string[];
  special_rules: string;
}
