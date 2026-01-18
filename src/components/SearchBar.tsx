'use client';

import { Search, X } from 'lucide-react';
import { Language } from '@/types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  darkMode: boolean;
  placeholder?: string;
}

export function SearchBar({ value, onChange, language, darkMode, placeholder }: SearchBarProps) {
  const defaultPlaceholder = language === 'ru'
    ? 'Поиск по вопросам...'
    : 'Search questions...';

  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || defaultPlaceholder}
        className={`w-full pl-10 pr-10 py-3 rounded-xl border transition-all ${
          darkMode
            ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 shadow-sm'
        } outline-none`}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
            darkMode
              ? 'hover:bg-slate-700 text-slate-400'
              : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
