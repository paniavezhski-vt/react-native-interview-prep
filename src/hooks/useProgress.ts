'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface QuizSession {
  questionIds: string[];      // Порядок вопросов в сессии
  currentIndex: number;       // Текущая позиция
  knownIds: string[];         // Отмеченные как "знаю"
  unknownIds: string[];       // Отмеченные как "не знаю"
  startedAt: number;          // Timestamp начала
  filterKey: string;          // Ключ фильтров (для определения той же сессии)
}

interface Progress {
  completedQuestions: string[];
  bookmarkedQuestions: string[];
  lastVisited: string | null;
  quizSession: QuizSession | null;
}

const defaultProgress: Progress = {
  completedQuestions: [],
  bookmarkedQuestions: [],
  lastVisited: null,
  quizSession: null,
};

export function useProgress() {
  const [progress, setProgress] = useLocalStorage<Progress>('rn-interview-progress', defaultProgress);

  const toggleCompleted = useCallback((questionId: string) => {
    setProgress((prev) => {
      const isCompleted = prev.completedQuestions.includes(questionId);
      return {
        ...prev,
        completedQuestions: isCompleted
          ? prev.completedQuestions.filter((id) => id !== questionId)
          : [...prev.completedQuestions, questionId],
      };
    });
  }, [setProgress]);

  const toggleBookmarked = useCallback((questionId: string) => {
    setProgress((prev) => {
      const isBookmarked = prev.bookmarkedQuestions.includes(questionId);
      return {
        ...prev,
        bookmarkedQuestions: isBookmarked
          ? prev.bookmarkedQuestions.filter((id) => id !== questionId)
          : [...prev.bookmarkedQuestions, questionId],
      };
    });
  }, [setProgress]);

  const setLastVisited = useCallback((questionId: string | null) => {
    setProgress((prev) => ({
      ...prev,
      lastVisited: questionId,
    }));
  }, [setProgress]);

  const isCompleted = useCallback((questionId: string) => {
    return progress.completedQuestions.includes(questionId);
  }, [progress.completedQuestions]);

  const isBookmarked = useCallback((questionId: string) => {
    return progress.bookmarkedQuestions.includes(questionId);
  }, [progress.bookmarkedQuestions]);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
  }, [setProgress]);

  const getStats = useCallback((totalQuestions: number) => {
    const completed = progress.completedQuestions.length;
    const bookmarked = progress.bookmarkedQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((completed / totalQuestions) * 100) : 0;

    return {
      completed,
      bookmarked,
      remaining: totalQuestions - completed,
      percentage,
    };
  }, [progress.completedQuestions.length, progress.bookmarkedQuestions.length]);

  // Quiz session management
  const startQuizSession = useCallback((questionIds: string[], filterKey: string) => {
    setProgress((prev) => ({
      ...prev,
      quizSession: {
        questionIds,
        currentIndex: 0,
        knownIds: [],
        unknownIds: [],
        startedAt: Date.now(),
        filterKey,
      },
    }));
  }, [setProgress]);

  const updateQuizSession = useCallback((updates: Partial<QuizSession>) => {
    setProgress((prev) => {
      if (!prev.quizSession) return prev;
      return {
        ...prev,
        quizSession: {
          ...prev.quizSession,
          ...updates,
        },
      };
    });
  }, [setProgress]);

  const markQuizKnown = useCallback((questionId: string) => {
    setProgress((prev) => {
      if (!prev.quizSession) return prev;

      const newKnownIds = prev.quizSession.knownIds.includes(questionId)
        ? prev.quizSession.knownIds
        : [...prev.quizSession.knownIds, questionId];

      const newUnknownIds = prev.quizSession.unknownIds.filter((id) => id !== questionId);

      // Также добавляем в общий список изученных
      const newCompleted = prev.completedQuestions.includes(questionId)
        ? prev.completedQuestions
        : [...prev.completedQuestions, questionId];

      return {
        ...prev,
        completedQuestions: newCompleted,
        quizSession: {
          ...prev.quizSession,
          knownIds: newKnownIds,
          unknownIds: newUnknownIds,
        },
      };
    });
  }, [setProgress]);

  const markQuizUnknown = useCallback((questionId: string) => {
    setProgress((prev) => {
      if (!prev.quizSession) return prev;

      const newUnknownIds = prev.quizSession.unknownIds.includes(questionId)
        ? prev.quizSession.unknownIds
        : [...prev.quizSession.unknownIds, questionId];

      const newKnownIds = prev.quizSession.knownIds.filter((id) => id !== questionId);

      return {
        ...prev,
        quizSession: {
          ...prev.quizSession,
          knownIds: newKnownIds,
          unknownIds: newUnknownIds,
        },
      };
    });
  }, [setProgress]);

  const endQuizSession = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      quizSession: null,
    }));
  }, [setProgress]);

  const hasActiveQuizSession = useCallback((filterKey: string) => {
    return progress.quizSession !== null && progress.quizSession.filterKey === filterKey;
  }, [progress.quizSession]);

  return {
    progress,
    toggleCompleted,
    toggleBookmarked,
    setLastVisited,
    isCompleted,
    isBookmarked,
    resetProgress,
    getStats,
    // Quiz session
    quizSession: progress.quizSession,
    startQuizSession,
    updateQuizSession,
    markQuizKnown,
    markQuizUnknown,
    endQuizSession,
    hasActiveQuizSession,
  };
}

export type { QuizSession };
