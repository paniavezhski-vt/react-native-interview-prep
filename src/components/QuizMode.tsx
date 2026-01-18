'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw, Check, X, Play, AlertCircle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Question, Language, Difficulty } from '@/types';
import { QuizSession } from '@/hooks/useProgress';

interface QuizModeProps {
  questions: Question[];
  language: Language;
  darkMode: boolean;
  filterKey: string; // Уникальный ключ для текущих фильтров
  // Quiz session from useProgress
  quizSession: QuizSession | null;
  onStartSession: (questionIds: string[], filterKey: string) => void;
  onUpdateSession: (updates: Partial<QuizSession>) => void;
  onMarkKnown: (questionId: string) => void;
  onMarkUnknown: (questionId: string) => void;
  onEndSession: () => void;
  onExit: () => void;
}

export function QuizMode({
  questions,
  language,
  darkMode,
  filterKey,
  quizSession,
  onStartSession,
  onUpdateSession,
  onMarkKnown,
  onMarkUnknown,
  onEndSession,
  onExit,
}: QuizModeProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  // Проверяем, есть ли активная сессия при монтировании
  useEffect(() => {
    if (quizSession && quizSession.filterKey === filterKey) {
      // Есть сохранённая сессия с теми же фильтрами — предлагаем продолжить
      setShowResumeDialog(true);
    } else if (!quizSession) {
      // Нет сессии — начинаем новую
      startNewSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startNewSession = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    onStartSession(shuffled.map((q) => q.id), filterKey);
    setShowResumeDialog(false);
    setShowAnswer(false);
  };

  const resumeSession = () => {
    setShowResumeDialog(false);
    setShowAnswer(false);
  };

  // Получаем текущие вопросы из сессии
  const sessionQuestions = useMemo(() => {
    if (!quizSession) return [];
    return quizSession.questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => q !== undefined);
  }, [quizSession, questions]);

  const currentIndex = quizSession?.currentIndex ?? 0;
  const currentQuestion = sessionQuestions[currentIndex];
  const knownIds = new Set(quizSession?.knownIds ?? []);
  const unknownIds = new Set(quizSession?.unknownIds ?? []);

  const progress = sessionQuestions.length > 0
    ? Math.round(((knownIds.size + unknownIds.size) / sessionQuestions.length) * 100)
    : 0;

  const handleNext = () => {
    setShowAnswer(false);
    if (currentIndex < sessionQuestions.length - 1) {
      onUpdateSession({ currentIndex: currentIndex + 1 });
    }
  };

  const handlePrev = () => {
    setShowAnswer(false);
    if (currentIndex > 0) {
      onUpdateSession({ currentIndex: currentIndex - 1 });
    }
  };

  const handleKnow = () => {
    if (currentQuestion) {
      onMarkKnown(currentQuestion.id);
    }
    handleNext();
  };

  const handleDontKnow = () => {
    if (currentQuestion) {
      onMarkUnknown(currentQuestion.id);
    }
    handleNext();
  };

  const handleReshuffle = () => {
    startNewSession();
  };

  const handleExit = () => {
    // Сессия остаётся сохранённой для возможности продолжить позже
    onExit();
  };

  const handleFinishAndExit = () => {
    onEndSession();
    onExit();
  };

  const difficultyEmoji: Record<Difficulty, string> = {
    easy: '🟢',
    medium: '🟡',
    hard: '🔴',
  };

  // Диалог "Продолжить или начать заново"
  if (showResumeDialog && quizSession) {
    const sessionProgress = Math.round(
      ((quizSession.knownIds.length + quizSession.unknownIds.length) / quizSession.questionIds.length) * 100
    );
    const timeAgo = getTimeAgo(quizSession.startedAt, language);

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-8 rounded-2xl border-2 text-center ${
            darkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200 shadow-lg'
          }`}
        >
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          <h2 className="text-2xl font-bold mb-2">
            {language === 'ru' ? 'Найдена незавершённая сессия' : 'Unfinished Session Found'}
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {language === 'ru'
              ? `Прогресс: ${sessionProgress}% • Начата ${timeAgo}`
              : `Progress: ${sessionProgress}% • Started ${timeAgo}`}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resumeSession}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
            >
              <Play className="w-5 h-5" />
              {language === 'ru' ? 'Продолжить' : 'Continue'}
            </button>
            <button
              onClick={startNewSession}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              {language === 'ru' ? 'Начать заново' : 'Start Over'}
            </button>
          </div>

          <button
            onClick={onExit}
            className={`mt-4 text-sm hover:underline ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            {language === 'ru' ? 'Вернуться назад' : 'Go Back'}
          </button>
        </motion.div>
      </div>
    );
  }

  if (sessionQuestions.length === 0 || !currentQuestion) {
    return (
      <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        {language === 'ru' ? 'Загрузка вопросов...' : 'Loading questions...'}
      </div>
    );
  }

  // Проверяем, завершена ли сессия
  const isSessionComplete = knownIds.size + unknownIds.size === sessionQuestions.length;

  if (isSessionComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-8 rounded-2xl border-2 text-center ${
          darkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-slate-200 shadow-lg'
        }`}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'ru' ? 'Quiz завершён!' : 'Quiz Complete!'}
        </h2>
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto my-6">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
            <div className="text-3xl font-bold text-emerald-500">{knownIds.size}</div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'ru' ? 'Знаю' : 'Known'}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-rose-900/30' : 'bg-rose-50'}`}>
            <div className="text-3xl font-bold text-rose-500">{unknownIds.size}</div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'ru' ? 'Учить' : 'To Learn'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {unknownIds.size > 0 && (
            <button
              onClick={() => {
                // Начать новую сессию только с неизвестными вопросами
                const unknownQuestions = sessionQuestions.filter((q) => unknownIds.has(q.id));
                const shuffled = [...unknownQuestions].sort(() => Math.random() - 0.5);
                onStartSession(shuffled.map((q) => q.id), filterKey + '-retry');
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              {language === 'ru' ? `Повторить ${unknownIds.size} вопросов` : `Review ${unknownIds.size} Questions`}
            </button>
          )}
          <button
            onClick={handleReshuffle}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Shuffle className="w-5 h-5" />
            {language === 'ru' ? 'Заново все' : 'Restart All'}
          </button>
          <button
            onClick={handleFinishAndExit}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
          >
            {language === 'ru' ? 'Завершить' : 'Finish'}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={handleExit}
          className={`text-sm hover:underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
        >
          ← {language === 'ru' ? 'Выйти (прогресс сохранён)' : 'Exit (progress saved)'}
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {currentIndex + 1} / {sessionQuestions.length}
          </span>
          <button
            onClick={handleReshuffle}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={language === 'ru' ? 'Начать заново' : 'Start Over'}
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-emerald-500">✓ {knownIds.size} {language === 'ru' ? 'знаю' : 'known'}</span>
          <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
            {sessionQuestions.length - knownIds.size - unknownIds.size} {language === 'ru' ? 'осталось' : 'remaining'}
          </span>
          <span className="text-rose-500">✗ {unknownIds.size} {language === 'ru' ? 'учить' : 'to learn'}</span>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className={`p-8 rounded-2xl border-2 relative ${
            darkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200 shadow-lg'
          }`}
        >
          {/* Status indicator */}
          {(knownIds.has(currentQuestion.id) || unknownIds.has(currentQuestion.id)) && (
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
              knownIds.has(currentQuestion.id)
                ? 'bg-emerald-500/20 text-emerald-500'
                : 'bg-rose-500/20 text-rose-500'
            }`}>
              {knownIds.has(currentQuestion.id)
                ? (language === 'ru' ? '✓ Знаю' : '✓ Known')
                : (language === 'ru' ? '✗ Учить' : '✗ To Learn')}
            </div>
          )}

          <div className="flex items-start gap-3 mb-6">
            <span className="text-2xl">{difficultyEmoji[currentQuestion.difficulty]}</span>
            <h3 className="text-xl font-semibold pr-20">{currentQuestion.title}</h3>
          </div>

          {/* Answer section */}
          <AnimatePresence>
            {showAnswer ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}
              >
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {currentQuestion.answer}
                </p>
                {currentQuestion.code && (
                  <div className="mt-4 rounded-lg overflow-x-auto">
                    <SyntaxHighlighter
                      language={currentQuestion.language || 'typescript'}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        borderRadius: '8px',
                        fontSize: '12px',
                        lineHeight: '1.5',
                      }}
                    >
                      {currentQuestion.code}
                    </SyntaxHighlighter>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 p-8 rounded-lg border-2 border-dashed text-center ${
                  darkMode ? 'border-slate-600 text-slate-500' : 'border-slate-300 text-slate-400'
                }`}
              >
                {language === 'ru' ? 'Нажмите "Показать ответ" чтобы увидеть решение' : 'Click "Show Answer" to reveal the solution'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-3 rounded-xl transition-all ${
              currentIndex === 0
                ? 'opacity-50 cursor-not-allowed'
                : darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === sessionQuestions.length - 1}
            className={`p-3 rounded-xl transition-all ${
              currentIndex === sessionQuestions.length - 1
                ? 'opacity-50 cursor-not-allowed'
                : darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Show/Hide Answer */}
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            showAnswer
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : darkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {showAnswer ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          {language === 'ru' ? (showAnswer ? 'Скрыть' : 'Показать ответ') : (showAnswer ? 'Hide' : 'Show Answer')}
        </button>

        {/* Know / Don't Know */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDontKnow}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              unknownIds.has(currentQuestion.id)
                ? 'bg-rose-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <X className="w-5 h-5" />
            {language === 'ru' ? 'Не знаю' : "Don't Know"}
          </button>
          <button
            onClick={handleKnow}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              knownIds.has(currentQuestion.id)
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Check className="w-5 h-5" />
            {language === 'ru' ? 'Знаю' : 'Know'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time ago
function getTimeAgo(timestamp: number, language: Language): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return language === 'ru' ? 'только что' : 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return language === 'ru' ? `${minutes} мин. назад` : `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return language === 'ru' ? `${hours} ч. назад` : `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return language === 'ru' ? `${days} дн. назад` : `${days}d ago`;
}
