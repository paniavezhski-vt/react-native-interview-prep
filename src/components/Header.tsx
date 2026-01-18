'use client';

import { Moon, Sun, Globe, BookOpen } from 'lucide-react';
import { Language } from '@/types';

interface HeaderProps {
  language: Language;
  darkMode: boolean;
  onLanguageChange: (lang: Language) => void;
  onDarkModeToggle: () => void;
}

export function Header({ language, darkMode, onLanguageChange, onDarkModeToggle }: HeaderProps) {
  return (
    <header className={`border-b backdrop-blur-sm sticky top-0 z-50 ${darkMode ? 'border-slate-700/50 bg-slate-900/80' : 'border-slate-200 bg-white/80 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">
              {language === 'ru' ? 'React Native Интервью' : 'React Native Interview Prep'}
            </h1>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {language === 'ru' ? 'Издание 2026' : '2026 Edition'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(language === 'ru' ? 'en' : 'ru')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{language === 'ru' ? 'EN' : 'RU'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onDarkModeToggle}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
