import React, { useState } from 'react';
import {
  CheckCircle2,
  PlayCircle,
  Circle,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  RotateCcw,
  ListTree,
  X,
  Radio,
  Image as ImageIcon,
  FileText,
  Globe,
  AlignLeft,
  ClipboardCheck,
  FileCheck,
} from 'lucide-react';
import type { CourseModule, CourseLesson, LessonType } from '../../../stores/course.store';
import type { LessonAccessState } from '../utils/unlockResolver';
import { resolveLessonType } from '../utils/mediaResolver';

interface Props {
  modules: CourseModule[];
  activeLessonId: string;
  accessMap?: Map<string, LessonAccessState>;
  onSelectLesson: (lessonId: string) => void;
  onResetProgress?: () => void;
  isMobileDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export const LessonSidebar: React.FC<Props> = ({
  modules,
  activeLessonId,
  accessMap,
  onSelectLesson,
  onResetProgress,
  isMobileDrawer = false,
  onCloseDrawer,
}) => {
  // Find which module contains active lesson
  const initialActiveModId = (() => {
    for (const mod of modules) {
      if (mod.lessons.some((l) => l.id === activeLessonId)) {
        return mod.id;
      }
    }
    return modules[0]?.id || '';
  })();

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [initialActiveModId]: true,
  });

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  // Progress Calculation
  const allLessons = modules.flatMap((m) => m.lessons);
  const totalCount = allLessons.length || 1;
  const completedCount = allLessons.filter((l) => accessMap?.get(l.id)?.status === 'completed').length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const renderTypeIcon = (type: LessonType) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case 'stream':
        return <Radio className="w-3.5 h-3.5 text-red-600 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'url':
        return <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'text':
        return <AlignLeft className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
      case 'test':
        return <ClipboardCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />;
      case 'assignment':
        return <FileCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />;
      default:
        return <PlayCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl sm:rounded-3xl p-4 shadow-2xs space-y-4 font-sans text-xs text-left max-w-sm w-full">
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-[#F8FAFC]">
          <ListTree className="w-4 h-4 text-blue-600 dark:text-[#60A5FA]" />
          <span className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] tracking-tight truncate">
            Course Curriculum
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onResetProgress && (
            <button
              type="button"
              onClick={onResetProgress}
              title="Reset Demo Progress"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {isMobileDrawer && onCloseDrawer && (
            <button
              type="button"
              onClick={onCloseDrawer}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* OVERALL PROGRESS SUMMARY */}
      <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#334155]">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1]">
          <span>Overall Course Progress</span>
          <span className="text-blue-600 dark:text-[#60A5FA] font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#263244] overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-medium block text-right">
          {completedCount} of {totalCount} units completed
        </span>
      </div>

      {/* MODULE ACCORDION LIST */}
      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 hide-scrollbar">
        {modules.map((mod, modIdx) => {
          const isOpen = expandedModules[mod.id] ?? false;
          const modCompleted = mod.lessons.filter((l) => accessMap?.get(l.id)?.status === 'completed').length;
          const modTotal = mod.lessons.length || 1;

          return (
            <div key={mod.id} className="border border-slate-200/80 dark:border-[#334155] rounded-xl overflow-hidden bg-slate-50/50 dark:bg-[#0F172A]">
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className="w-full p-2.5 flex items-center justify-between gap-2 bg-slate-100/70 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] truncate block">
                    {mod.title}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-normal block">
                    {modCompleted}/{mod.lessons.length} Completed • {mod.duration}
                  </span>
                </div>
                <div className="text-slate-400 dark:text-[#94A3B8] shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="divide-y divide-slate-100 dark:divide-[#263244] bg-white dark:bg-[#0F172A]">
                  {mod.lessons.map((les, lesIdx) => {
                    const access = accessMap?.get(les.id);
                    const isSelected = les.id === activeLessonId;
                    const status = access?.status || 'unlocked';
                    const canAccess = access?.canAccess ?? true;
                    const type = resolveLessonType(les);

                    return (
                      <button
                        key={les.id}
                        type="button"
                        onClick={() => {
                          if (canAccess) {
                            onSelectLesson(les.id);
                            if (isMobileDrawer && onCloseDrawer) onCloseDrawer();
                          }
                        }}
                        disabled={!canAccess}
                        className={`w-full p-2.5 flex items-start gap-2.5 transition-colors text-left cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-600/10 border-l-4 border-l-blue-600 text-blue-950 dark:text-[#F8FAFC] font-semibold'
                            : status === 'completed'
                            ? 'hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-800 dark:text-[#CBD5E1]'
                            : canAccess
                            ? 'hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-800 dark:text-[#CBD5E1]'
                            : 'opacity-50 bg-slate-50/50 dark:bg-[#0B1120] cursor-not-allowed text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {/* STATUS ICON */}
                        <div className="mt-0.5 shrink-0">
                          {status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : isSelected ? (
                            <PlayCircle className="w-4 h-4 text-blue-600 dark:text-[#60A5FA] animate-pulse" />
                          ) : canAccess ? (
                            <Circle className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                          )}
                        </div>

                        {/* LESSON DETAILS */}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <span className={`text-xs block leading-snug break-words ${isSelected ? 'font-semibold text-blue-950 dark:text-[#F8FAFC]' : 'font-medium text-slate-800 dark:text-[#CBD5E1]'}`}>
                            {les.title}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-[#94A3B8] font-normal">
                            <span className="inline-flex items-center gap-1 capitalize">
                              {renderTypeIcon(type)}
                              <span>{type}</span>
                            </span>
                            {les.duration && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-0.5">
                                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                                  <span>{les.duration}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
