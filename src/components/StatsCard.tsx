'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  darkMode: boolean;
  onClick?: () => void;
  subtitle?: string;
  progress?: number; // 0-100
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  rose: 'from-rose-500 to-rose-600',
  purple: 'from-purple-500 to-purple-600',
};

const progressColors = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  purple: 'bg-purple-500',
};

export function StatsCard({
  icon: Icon,
  label,
  value,
  color,
  onClick,
  darkMode,
  subtitle,
  progress,
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-6 border cursor-pointer transition-all hover:scale-105 ${
        darkMode
          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
          : 'bg-white border-slate-200 hover:border-blue-300 shadow-md hover:shadow-lg'
      }`}
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4 shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
      {subtitle && (
        <div className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</div>
      )}
      {progress !== undefined && (
        <div className="mt-3">
          <div className={`h-1.5 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <div
              className={`h-full rounded-full ${progressColors[color]} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={`text-xs mt-1 text-right ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
}
