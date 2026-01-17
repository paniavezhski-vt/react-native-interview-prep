export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  number: number;
  title: string;
  answer: string;
  difficulty: Difficulty;
  code?: string;
  language?: string;
}

export interface Section {
  id: string;
  number: number;
  title: string;
  titleEn: string;
  questionCount: number;
  subsections: Subsection[];
}

export interface Subsection {
  id: string;
  title: string;
  titleEn: string;
  questions: Question[];
}

export interface TopicData {
  title: string;
  titleEn: string;
  sections: Section[];
  totalQuestions: number;
  difficultyCount: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export type Language = 'ru' | 'en';

export interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface NodeData {
  id: string;
  label: string;
  labelEn: string;
  type: 'section' | 'subsection' | 'topic';
  difficulty?: Difficulty;
  questionCount?: number;
}
