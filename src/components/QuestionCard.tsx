'use client';

import { motion } from 'framer-motion';
import { Check, Bookmark, BookmarkCheck } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
  isExpanded: boolean;
  darkMode: boolean;
  isCompleted?: boolean;
  isBookmarked?: boolean;
  onToggleComplete?: (id: string) => void;
  onToggleBookmark?: (id: string) => void;
  searchQuery?: string;
}

const difficultyBorders = {
  easy: 'border-emerald-500',
  medium: 'border-amber-500',
  hard: 'border-rose-500',
};

const difficultyEmoji = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
};

// Highlight search matches in text
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">{part}</mark>
      : part
  );
}

export function QuestionCard({
  question,
  onClick,
  isExpanded,
  darkMode,
  isCompleted = false,
  isBookmarked = false,
  onToggleComplete,
  onToggleBookmark,
  searchQuery = '',
}: QuestionCardProps) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isExpanded
          ? `${difficultyBorders[question.difficulty]} ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`
          : isCompleted
            ? darkMode
              ? 'border-emerald-800 bg-emerald-900/20 hover:border-emerald-700'
              : 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
            : darkMode
              ? 'border-slate-600 hover:border-slate-500'
              : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{difficultyEmoji[question.difficulty]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium mb-1 ${isCompleted ? 'line-through opacity-60' : ''}`}>
              {highlightText(question.title, searchQuery)}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Bookmark button */}
              {onToggleBookmark && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(question.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isBookmarked
                      ? 'text-amber-500 hover:bg-amber-500/20'
                      : darkMode
                        ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              )}
              {/* Complete button */}
              {onToggleComplete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(question.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isCompleted
                      ? 'text-emerald-500 hover:bg-emerald-500/20'
                      : darkMode
                        ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Check className={`w-4 h-4 ${isCompleted ? 'stroke-[3]' : ''}`} />
                </button>
              )}
            </div>
          </div>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-3 text-sm space-y-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
            >
              <p>{highlightText(question.answer, searchQuery)}</p>
              {question.code && (
                <div className="rounded-lg overflow-x-auto text-xs mt-2">
                  <SyntaxHighlighter
                    language={question.language || 'typescript'}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: '8px',
                      fontSize: '12px',
                      lineHeight: '1.5',
                    }}
                  >
                    {question.code}
                  </SyntaxHighlighter>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
