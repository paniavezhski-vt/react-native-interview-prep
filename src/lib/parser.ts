import { Question, Section, Subsection, TopicData, Difficulty } from '@/types';
import fs from 'fs/promises';

const DIFFICULTY_MAP: Record<string, Difficulty> = {
  '🟢': 'easy',
  '🟡': 'medium',
  '🔴': 'hard',
};

function parseDifficulty(text: string): Difficulty {
  for (const [emoji, level] of Object.entries(DIFFICULTY_MAP)) {
    if (text.includes(emoji)) return level;
  }
  return 'easy';
}

function extractQuestionNumber(text: string): number {
  const match = text.match(/[QВ](\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function extractCodeBlock(answer: string): { code: string; language: string } | undefined {
  const codeMatch = answer.match(/```(\w+)?\n([\s\S]*?)```/);
  if (codeMatch) {
    return {
      language: codeMatch[1] || 'typescript',
      code: codeMatch[2].trim(),
    };
  }
  return undefined;
}

function parseContent(content: string): { sections: Section[]; questions: Question[] } {
  const sections: Section[] = [];
  const allQuestions: Question[] = [];

  // Split content by main sections (##)
  const mainSections = content.split(/^##\s+/m);

  for (let sectionIndex = 0; sectionIndex < mainSections.length; sectionIndex++) {
    const sectionContent = mainSections[sectionIndex];
    if (!sectionContent.trim()) continue;

    // Skip Table of Contents
    if (sectionContent.match(/^(Содержание|Table of Contents)/i)) {
      continue;
    }

    // Extract section title and question count
    const sectionHeaderMatch = sectionContent.match(/^(\d+)\.\s+(.+?)\s*\((\d+)\s+[\w\u0400-\u04FF-]+[\s\w\u0400-\u04FF-]*\)\s*/);
    if (!sectionHeaderMatch) continue;

    const sectionNum = parseInt(sectionHeaderMatch[1]);
    const sectionTitle = sectionHeaderMatch[2].trim();
    const sectionQuestionCount = parseInt(sectionHeaderMatch[3]);

    const section: Section = {
      id: `section-${sectionNum}`,
      number: sectionNum,
      title: sectionTitle,
      titleEn: '',
      questionCount: sectionQuestionCount,
      subsections: [],
    };

    // Split section by subsections (###)
    const subsections = sectionContent.split(/^###\s+/m).slice(1); // Skip first part (section header)

    for (let subIndex = 0; subIndex < subsections.length; subIndex++) {
      const subContent = subsections[subIndex];
      if (!subContent.trim()) continue;

      // Extract subsection title (first line)
      const lines = subContent.split('\n');
      const subSectionTitle = lines[0].trim();
      const restContent = lines.slice(1).join('\n');

      const subsection: Subsection = {
        id: `subsection-${sectionIndex}-${subIndex}`,
        title: subSectionTitle,
        titleEn: '',
        questions: [],
      };

      // Extract questions from subsection content
      const questionRegex = /\*\*([QВ]\d+\.\s*[🟢🟡🔴]\s*.+?)\*\*\n\n([\s\S]+?)(?=\n\n\*\*[QВ]|$)/g;
      let questionMatch;

      while ((questionMatch = questionRegex.exec(restContent)) !== null) {
        const titleWithDifficulty = questionMatch[1];
        const answer = questionMatch[2].trim();

        const codeData = extractCodeBlock(answer);
        const answerWithoutCode = codeData
          ? answer.replace(/```(\w+)?\n[\s\S]*?```/, '[CODE]').trim()
          : answer;

        const question: Question = {
          id: `q-${allQuestions.length}`,
          number: extractQuestionNumber(titleWithDifficulty),
          title: titleWithDifficulty.replace(/[QВ]\d+\.\s*[🟢🟡🔴]\s*/, ''),
          answer: answerWithoutCode,
          difficulty: parseDifficulty(titleWithDifficulty),
          ...(codeData && { code: codeData.code, language: codeData.language }),
        };

        subsection.questions.push(question);
        allQuestions.push(question);
      }

      section.subsections.push(subsection);
    }

    // If no subsections found, try to extract questions directly from section
    if (section.subsections.length === 0) {
      const questionRegex = /\*\*([QВ]\d+\.\s*[🟢🟡🔴]\s*.+?)\*\*\n\n([\s\S]+?)(?=\n\n\*\*[QВ]|$)/g;
      let questionMatch;

      const defaultSubsection: Subsection = {
        id: `subsection-${sectionIndex}-0`,
        title: 'Questions',
        titleEn: '',
        questions: [],
      };

      while ((questionMatch = questionRegex.exec(sectionContent)) !== null) {
        const titleWithDifficulty = questionMatch[1];
        const answer = questionMatch[2].trim();

        const codeData = extractCodeBlock(answer);
        const answerWithoutCode = codeData
          ? answer.replace(/```(\w+)?\n[\s\S]*?```/, '[CODE]').trim()
          : answer;

        const question: Question = {
          id: `q-${allQuestions.length}`,
          number: extractQuestionNumber(titleWithDifficulty),
          title: titleWithDifficulty.replace(/[QВ]\d+\.\s*[🟢🟡🔴]\s*/, ''),
          answer: answerWithoutCode,
          difficulty: parseDifficulty(titleWithDifficulty),
          ...(codeData && { code: codeData.code, language: codeData.language }),
        };

        defaultSubsection.questions.push(question);
        allQuestions.push(question);
      }

      if (defaultSubsection.questions.length > 0) {
        section.subsections.push(defaultSubsection);
      }
    }

    sections.push(section);
  }

  return { sections, questions: allQuestions };
}

export async function parseMarkdownFile(
  filePath: string,
  isEn: boolean = false
): Promise<TopicData> {
  const content = await fs.readFile(filePath, 'utf-8');

  // Extract title
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : (isEn ? 'React Native Interview Prep' : 'Подготовка к собеседованию');

  const { sections, questions } = parseContent(content);

  // Count difficulties
  const difficultyCount = {
    easy: questions.filter((q) => q.difficulty === 'easy').length,
    medium: questions.filter((q) => q.difficulty === 'medium').length,
    hard: questions.filter((q) => q.difficulty === 'hard').length,
  };

  return {
    title,
    titleEn: isEn ? title : '',
    sections,
    totalQuestions: questions.length,
    difficultyCount,
  };
}

export function mapEnglishTitles(ruData: TopicData, enData: TopicData): void {
  ruData.sections.forEach((ruSection, index) => {
    if (enData.sections[index]) {
      ruSection.titleEn = enData.sections[index].title;

      ruSection.subsections.forEach((ruSub, subIndex) => {
        if (enData.sections[index]?.subsections[subIndex]) {
          ruSub.titleEn = enData.sections[index].subsections[subIndex].title;
        }
      });
    }
  });
}
