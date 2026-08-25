import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  initTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDOM(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: (typeof localStorage !== 'undefined' ? (localStorage.getItem('cubixskill_theme_mode') as ThemeMode) : 'system') || 'system',
  resolvedTheme: 'light',

  initTheme: () => {
    const savedMode = (typeof localStorage !== 'undefined' ? (localStorage.getItem('cubixskill_theme_mode') as ThemeMode) : 'system') || 'system';
    const resolved = savedMode === 'system' ? getSystemTheme() : savedMode;
    applyThemeToDOM(resolved);
    set({ mode: savedMode, resolvedTheme: resolved });

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (get().mode === 'system') {
          const newResolved = getSystemTheme();
          applyThemeToDOM(newResolved);
          set({ resolvedTheme: newResolved });
        }
      };
      mediaQuery.addEventListener('change', handleChange);
    }
  },

  setMode: (newMode: ThemeMode) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cubixskill_theme_mode', newMode);
    }
    const resolved = newMode === 'system' ? getSystemTheme() : newMode;
    applyThemeToDOM(resolved);
    set({ mode: newMode, resolvedTheme: resolved });
  },

  toggleMode: () => {
    const current = get().mode;
    const next: ThemeMode = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
    get().setMode(next);
  },
}));
