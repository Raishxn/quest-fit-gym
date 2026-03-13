import { create } from 'zustand';
import type { ThemeId } from '@/types';

interface ThemeStore {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: (localStorage.getItem('qf-theme') as ThemeId) || 'dark-red',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('qf-theme', theme);
    set({ theme });
  },
}));
