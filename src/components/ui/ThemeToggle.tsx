import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore } from '../../stores/theme.store';

export const ThemeToggle: React.FC = () => {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <div className="inline-flex items-center bg-slate-100 dark:bg-[#172033] p-1 rounded-xl border border-slate-200/80 dark:border-[#263244]">
      <button
        type="button"
        onClick={() => setMode('light')}
        aria-label="Light theme"
        title="Light Mode"
        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
          mode === 'light'
            ? 'bg-white dark:bg-[#111827] text-[#2563EB] shadow-2xs'
            : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setMode('dark')}
        aria-label="Dark theme"
        title="Dark Mode"
        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
          mode === 'dark'
            ? 'bg-white dark:bg-[#111827] text-[#60A5FA] shadow-2xs'
            : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setMode('system')}
        aria-label="System theme"
        title="System Preference"
        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
          mode === 'system'
            ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
            : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
        }`}
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
