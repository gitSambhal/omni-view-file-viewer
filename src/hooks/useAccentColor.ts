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
    label: 'Docs Blue',
    lightHex: '#1A73E8',
    darkHex: '#8AB4F8',
    previewClass: 'bg-[#1A73E8]'
  },
  {
    id: 'emerald',
    label: 'Sheets Green',
    lightHex: '#188038',
    darkHex: '#81C995',
    previewClass: 'bg-[#188038]'
  },
  {
    id: 'amber',
    label: 'Slides Amber',
    lightHex: '#F29900',
    darkHex: '#FDD663',
    previewClass: 'bg-[#F29900]'
  },
  {
    id: 'violet',
    label: 'Forms Purple',
    lightHex: '#7248B9',
    darkHex: '#C58AF9',
    previewClass: 'bg-[#7248B9]'
  },
  {
    id: 'cyan',
    label: 'Keep Teal',
    lightHex: '#007B83',
    darkHex: '#78D9EC',
    previewClass: 'bg-[#007B83]'
  },
  {
    id: 'rose',
    label: 'Gmail Coral',
    lightHex: '#D93025',
    darkHex: '#F28B82',
    previewClass: 'bg-[#D93025]'
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
