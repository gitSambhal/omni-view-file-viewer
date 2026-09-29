/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Dynamic Modern Accent Theme Engine
 */

import { useState, useEffect, useCallback } from 'react';

export type AccentColor = 'indigo' | 'emerald' | 'violet' | 'amber' | 'cyan' | 'rose';

export interface AccentOption {
  id: AccentColor;
  label: string;
  lightHex: string;
  darkHex: string;
  previewClass: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    id: 'indigo',
    label: 'Electric Indigo',
    lightHex: '#4F46E5',
    darkHex: '#6366F1',
    previewClass: 'bg-indigo-500'
  },
  {
    id: 'violet',
    label: 'Electric Violet',
    lightHex: '#7C3AED',
    darkHex: '#8B5CF6',
    previewClass: 'bg-violet-500'
  },
  {
    id: 'emerald',
    label: 'Cyber Emerald',
    lightHex: '#059669',
    darkHex: '#10B981',
    previewClass: 'bg-emerald-500'
  },
  {
    id: 'cyan',
    label: 'Ocean Cyan',
    lightHex: '#0284C7',
    darkHex: '#38BDF8',
    previewClass: 'bg-cyan-500'
  },
  {
    id: 'amber',
    label: 'Sunset Amber',
    lightHex: '#D97706',
    darkHex: '#F59E0B',
    previewClass: 'bg-amber-500'
  },
  {
    id: 'rose',
    label: 'Neon Rose',
    lightHex: '#E11D48',
    darkHex: '#F43F5E',
    previewClass: 'bg-rose-500'
  }
];

export function useAccentColor() {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('omniview_accent_color');
    if (saved && ACCENT_OPTIONS.some(opt => opt.id === saved)) {
      return saved as AccentColor;
    }
    return 'indigo';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accent);
    localStorage.setItem('omniview_accent_color', accent);
  }, [accent]);

  const setAccent = useCallback((newAccent: AccentColor) => {
    setAccentState(newAccent);
  }, []);

  return {
    accent,
    setAccent,
    accentOptions: ACCENT_OPTIONS,
    activeOption: ACCENT_OPTIONS.find(opt => opt.id === accent) || ACCENT_OPTIONS[0]
  };
}
