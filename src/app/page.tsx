'use client';

import { useEffect, useState, useCallback } from 'react';
import { Moon, Sun, Globe, BookOpen, Target, TrendingUp, Zap } from 'lucide-react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Language, TopicData, Section, Question, Difficulty } from '@/types';

const difficultyBorders = {
  easy: 'border-emerald-500',
  medium: 'border-amber-500',
  hard: 'border-rose-500',
};

// Color schemes for sections - vibrant gradients for better readability
const sectionColorSchemes = [
  { bg: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', border: '#8b5cf6', name: 'purple' },  // Purple
  { bg: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', border: '#3b82f6', name: 'blue' },    // Blue
  { bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', border: '#10b981', name: 'green' },   // Green
  { bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', border: '#f59e0b', name: 'amber' },   // Amber
  { bg: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', border: '#ec4899', name: 'pink' },    // Pink
  { bg: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', border: '#06b6d4', name: 'cyan' },    // Cyan
  { bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', border: '#ef4444', name: 'red' },     // Red
  { bg: 'linear-gradient(135deg, #84cc16 0%, #a3e635 100%)', border: '#84cc16', name: 'lime' },    // Lime
];

// Helper function to get all questions from sections with optional difficulty filter
function getAllFilteredQuestions(sections: Section[], difficultyFilter: Difficulty | 'all'): Question[] {
  const allQuestions: Question[] = [];
  sections.forEach(section => {
    section.subsections.forEach(subsection => {
      subsection.questions.forEach(question => {
        if (difficultyFilter === 'all' || question.difficulty === difficultyFilter) {
          allQuestions.push(question);
        }
      });
    });
  });
  return allQuestions;
}

// Helper function to count filtered questions
function getFilteredQuestionsCount(
  sections: Section[],
  sectionFilter: string,
  difficultyFilter: Difficulty | 'all'
): number {
  let count = 0;
  const filteredSections = sectionFilter === 'all'
    ? sections
    : sections.filter(s => s.id === sectionFilter);

  filteredSections.forEach(section => {
    section.subsections.forEach(subsection => {
      subsection.questions.forEach(question => {
        if (difficultyFilter === 'all' || question.difficulty === difficultyFilter) {
          count++;
        }
      });
    });
  });
  return count;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('ru');
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState<{ ru: TopicData; en: TopicData } | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [view, setView] = useState<'dashboard' | 'graph' | 'questions'>('dashboard');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!data) return;

      const currentData = language === 'ru' ? data.ru : data.en;

      // Find the section that contains this node
      const section = currentData.sections.find((s) =>
        s.id === node.id || s.subsections.some((sub) => sub.id === node.id)
      );

      if (section) {
        setSelectedSection(section);
        setSectionFilter(section.id);
        setDifficultyFilter('all');
        setView('questions');
      }
    },
    [data, language]
  );

  useEffect(() => {
    if (data) {
      const currentData = language === 'ru' ? data.ru : data.en;
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      // Use larger center point and radius for bigger graph
      const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 800;
      const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 500;

      // Create section nodes with more spacing
      currentData.sections.forEach((section, index) => {
        const angle = (index / currentData.sections.length) * Math.PI * 2;
        const radius = 800;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Get color scheme for this section (cycle through available colors)
        const colorScheme = sectionColorSchemes[index % sectionColorSchemes.length];

        newNodes.push({
          id: section.id,
          type: 'default',
          position: { x, y },
          data: {
            label: (
              <div className="text-center text-white">
                <div className="font-bold text-base leading-tight">{section.title}</div>
                <div className="text-sm opacity-90 mt-1">{section.questionCount} Q</div>
              </div>
            ),
          },
          style: {
            background: colorScheme.bg,
            border: `3px solid ${colorScheme.border}`,
            borderRadius: '16px',
            padding: '16px',
            width: 200,
            boxShadow: `0 8px 24px ${colorScheme.border}40`,
            cursor: 'pointer',
          },
        });

        // Create subsection nodes with more spacing
        section.subsections.forEach((sub, subIndex) => {
          const subAngle = angle + (subIndex - section.subsections.length / 2) * 0.6;
          const subRadius = radius + 350;
          const subX = centerX + Math.cos(subAngle) * subRadius;
          const subY = centerY + Math.sin(subAngle) * subRadius;

          // Lighter version of parent color for subsections
          newNodes.push({
            id: sub.id,
            type: 'default',
            position: { x: subX, y: subY },
            data: {
              label: (
                <div className="text-center text-white">
                  <div className="text-sm font-semibold leading-tight">{sub.title}</div>
                  <div className="text-sm opacity-90 mt-1">{sub.questions.length} Q</div>
                </div>
              ),
            },
            style: {
              background: `linear-gradient(135deg, ${colorScheme.border}dd 0%, ${colorScheme.border}aa 100%)`,
              border: `2px solid ${colorScheme.border}`,
              borderRadius: '12px',
              padding: '12px',
              width: 150,
              boxShadow: `0 4px 12px ${colorScheme.border}30`,
              cursor: 'pointer',
            },
          });

          // Connect subsection to section
          newEdges.push({
            id: `${section.id}-${sub.id}`,
            source: section.id,
            target: sub.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: colorScheme.border, strokeWidth: 3 },
          });
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [data, language, darkMode, setNodes, setEdges]);

  if (!data) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>{language === 'ru' ? 'Загрузка материалов...' : 'Loading interview prep...'}</p>
        </div>
      </div>
    );
  }

  // After the early return, we know data is not null
  const currentData: TopicData = language === 'ru' ? data.ru : data.en;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800'}`}>
      {/* Header */}
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
            {/* Language Toggle - shows the OPPOSITE language */}
            <button
              onClick={() => {
                const newLang = language === 'ru' ? 'en' : 'ru';
                setLanguage(newLang);
                setSelectedSection(null);
                setSelectedQuestion(null);
                setSectionFilter('all');
                setDifficultyFilter('all');
                setView('dashboard');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{language === 'ru' ? 'EN' : 'RU'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* View Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {(['dashboard', 'graph', 'questions'] as const).map((v) => {
            const labels = language === 'ru'
              ? { dashboard: 'Обзор', graph: 'Схема', questions: 'Вопросы' }
              : { dashboard: 'Dashboard', graph: 'Graph', questions: 'Questions' };
            return (
              <button
                key={v}
                onClick={() => {
                  if (v === 'questions') {
                    setSelectedSection(null);
                    setSectionFilter('all');
                    setDifficultyFilter('all');
                  }
                  setView(v);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  view === v
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : darkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
                }`}
              >
                {labels[v]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard View - keep in container */}
      {view !== 'graph' && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                  icon={Target}
                  label={language === 'ru' ? 'Всего вопросов' : 'Total Questions'}
                  value={currentData.totalQuestions}
                  color="blue"
                  darkMode={darkMode}
                  onClick={() => {
                    setDifficultyFilter('all');
                    setSelectedSection(null);
                    setView('questions');
                  }}
                />
                <StatsCard
                  icon={Zap}
                  label={language === 'ru' ? 'Лёгкие' : 'Easy'}
                  value={currentData.difficultyCount.easy}
                  color="emerald"
                  darkMode={darkMode}
                  onClick={() => {
                    setDifficultyFilter('easy');
                    setSelectedSection(null);
                    setView('questions');
                  }}
                />
                <StatsCard
                  icon={TrendingUp}
                  label={language === 'ru' ? 'Средние' : 'Medium'}
                  value={currentData.difficultyCount.medium}
                  color="amber"
                  darkMode={darkMode}
                  onClick={() => {
                    setDifficultyFilter('medium');
                    setSelectedSection(null);
                    setView('questions');
                  }}
                />
                <StatsCard
                  icon={BookOpen}
                  label={language === 'ru' ? 'Сложные' : 'Hard'}
                  value={currentData.difficultyCount.hard}
                  color="rose"
                  darkMode={darkMode}
                  onClick={() => {
                    setDifficultyFilter('hard');
                    setSelectedSection(null);
                    setView('questions');
                  }}
                />
              </div>

              {/* Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentData.sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedSection(section);
                      setSectionFilter(section.id);
                      setDifficultyFilter('all');
                      setView('questions');
                    }}
                    className={`p-6 rounded-xl border cursor-pointer transition-all hover:scale-105 ${
                      darkMode
                        ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500'
                        : 'bg-white border-slate-200 hover:border-blue-400 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-500">0{section.number}</span>
                      <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{section.questionCount} Q</span>
                    </div>
                    <h3 className="font-semibold mb-2">{section.title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {language === 'ru'
                        ? `${section.subsections.length} подраздел${section.subsections.length === 1 ? '' : section.subsections.length > 1 && section.subsections.length < 5 ? 'а' : 'ов'}`
                        : `${section.subsections.length} subsection${section.subsections.length === 1 ? '' : 's'}`}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Questions View */}
          {view === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Back button and filters */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <button
                    onClick={() => {
                      setSelectedSection(null);
                      setSectionFilter('all');
                      setDifficultyFilter('all');
                      setView('dashboard');
                    }}
                    className={`text-sm hover:underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    ← {language === 'ru' ? 'На главную' : 'Back to Dashboard'}
                  </button>

                  {/* Difficulty Filter */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {language === 'ru' ? 'Сложность:' : 'Difficulty:'}
                    </span>
                    {(['all', 'easy', 'medium', 'hard'] as const).map((level) => {
                      const isActive = difficultyFilter === level;
                      const labels = language === 'ru'
                        ? { all: 'Все', easy: '🟢 Легко', medium: '🟡 Средне', hard: '🔴 Сложно' }
                        : { all: 'All', easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' };
                      return (
                        <button
                          key={level}
                          onClick={() => setDifficultyFilter(level)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md'
                              : darkMode
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {labels[level]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Filter (when viewing all questions) */}
                {!selectedSection && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {language === 'ru' ? 'Категория:' : 'Category:'}
                    </span>
                    <button
                      onClick={() => setSectionFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        sectionFilter === 'all'
                          ? 'bg-purple-600 text-white shadow-md'
                          : darkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {language === 'ru' ? 'Все категории' : 'All Categories'}
                    </button>
                    {currentData.sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setSectionFilter(section.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          sectionFilter === section.id
                            ? 'bg-purple-600 text-white shadow-md'
                            : darkMode
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {section.number}. {section.title.length > 20 ? section.title.slice(0, 20) + '...' : section.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold">
                {selectedSection ? (
                  selectedSection.title
                ) : sectionFilter !== 'all' ? (
                  currentData.sections.find(s => s.id === sectionFilter)?.title
                ) : difficultyFilter === 'all' ? (
                  language === 'ru' ? 'Все вопросы' : 'All Questions'
                ) : (
                  language === 'ru'
                    ? (difficultyFilter === 'easy' ? 'Лёгкие вопросы' : difficultyFilter === 'medium' ? 'Средние вопросы' : 'Сложные вопросы')
                    : `${difficultyFilter.charAt(0).toUpperCase() + difficultyFilter.slice(1)} Questions`
                )}
                <span className="text-slate-400 text-lg ml-2">
                  ({getFilteredQuestionsCount(
                    selectedSection ? [selectedSection] : currentData.sections,
                    sectionFilter !== 'all' && !selectedSection ? sectionFilter : 'all',
                    difficultyFilter
                  )} {language === 'ru' ? 'вопросов' : 'questions'})
                </span>
              </h2>

              {/* Questions */}
              <div className="space-y-4">
                {(selectedSection
                  ? [selectedSection]
                  : currentData.sections
                ).map((section) => {
                  // Apply section filter
                  if (!selectedSection && sectionFilter !== 'all' && section.id !== sectionFilter) {
                    return null;
                  }

                  const sectionQuestions = getAllFilteredQuestions([section], difficultyFilter);
                  if (sectionQuestions.length === 0) return null;

                  return (
                    <div key={section.id} className={`rounded-xl p-6 border ${
                      darkMode
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-white border-slate-200 shadow-md'
                    }`}>
                      <h3 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {section.number}. {section.title}
                        <span className={`text-sm ml-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>({sectionQuestions.length} {language === 'ru' ? 'вопросов' : 'questions'})</span>
                      </h3>
                      <div className="space-y-3">
                        {section.subsections.map((subsection) => {
                          const subsectionQuestions = subsection.questions.filter(
                            q => difficultyFilter === 'all' || q.difficulty === difficultyFilter
                          );
                          if (subsectionQuestions.length === 0) return null;

                          return (
                            <div key={subsection.id} className="mb-4 last:mb-0">
                              <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{subsection.title}</h4>
                              <div className="space-y-2">
                                {subsectionQuestions.map((question) => (
                                  <QuestionCard
                                    key={question.id}
                                    question={question}
                                    onClick={() => setSelectedQuestion(question)}
                                    isExpanded={selectedQuestion?.id === question.id}
                                    darkMode={darkMode}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {(selectedSection
                ? getAllFilteredQuestions([selectedSection], difficultyFilter)
                : getAllFilteredQuestions(
                    sectionFilter !== 'all' ? currentData.sections.filter(s => s.id === sectionFilter) : currentData.sections,
                    difficultyFilter
                  )
              ).length === 0 && (
                <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {language === 'ru'
                    ? 'Вопросы не найдены по текущим фильтрам'
                    : 'No questions found with the current filters'}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* Graph View - Full Width */}
      {view === 'graph' && (
        <motion.div
          key="graph"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[85vh] px-4"
        >
          <div className={`h-full w-full rounded-xl overflow-hidden border ${darkMode ? 'border-slate-700' : 'border-slate-300 shadow-lg'}`}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
              minZoom={0.15}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
              className={darkMode ? 'dark' : ''}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={2} color={darkMode ? '#6366f1' : '#94a3b8'} />
              <Controls className={darkMode ? '!bg-slate-800/90 !border-slate-700' : '!bg-white/90 !border-slate-300'} />
              <MiniMap
                nodeColor="#8b5cf6"
                className={darkMode ? '!bg-slate-800/90 !border-slate-700' : '!bg-white/90 !border-slate-300'}
                maskColor={darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.1)'}
              />
            </ReactFlow>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatsCard({
  icon: Icon,
  label,
  value,
  color,
  onClick,
  darkMode,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
  darkMode: boolean;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-6 border cursor-pointer transition-all hover:scale-105 ${
        darkMode
          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
          : 'bg-white border-slate-200 hover:border-blue-300 shadow-md hover:shadow-lg'
      }`}
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4 shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
    </div>
  );
}

function QuestionCard({
  question,
  onClick,
  isExpanded,
  darkMode,
}: {
  question: Question;
  onClick: () => void;
  isExpanded: boolean;
  darkMode: boolean;
}) {
  const difficultyEmoji = {
    easy: '🟢',
    medium: '🟡',
    hard: '🔴',
  };

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isExpanded
          ? `${difficultyBorders[question.difficulty]} ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`
          : darkMode
            ? 'border-slate-600 hover:border-slate-500'
            : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{difficultyEmoji[question.difficulty]}</span>
        <div className="flex-1">
          <h4 className="font-medium mb-1">{question.title}</h4>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-3 text-sm space-y-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
            >
              <p>{question.answer}</p>
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
