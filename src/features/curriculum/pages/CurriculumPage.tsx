import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ListTree,
  PlayCircle,
  Headphones,
  FileText,
  FileCheck,
  HelpCircle,
  Radio,
  Download,
  Code,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Filter,
  Eye,
  Clock,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { useLearningStore } from '../../../stores/learning.store';
import { useAcademyStore } from '../../../stores/academy.store';

export type ActivityType =
  | 'video'
  | 'audio'
  | 'pdf'
  | 'assignment'
  | 'quiz'
  | 'live'
  | 'download'
  | 'project';

export interface CurriculumLessonItem {
  id: string;
  title: string;
  type: ActivityType;
  metaText: string;
  status: 'Completed' | 'In Progress' | 'Not Started' | 'Locked' | 'Live Now' | 'Upcoming' | 'Submitted' | 'Passed';
  progressPercent?: number;
  isLocked?: boolean;
  lockRule?: string;
  actionText: string;
  targetPath?: string;
  isCurrent?: boolean;
}

export interface CurriculumModuleItem {
  id: string;
  title: string;
  lessons: CurriculumLessonItem[];
}

export const CurriculumPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501' } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();
  const completedLessonIds = useLearningStore((state) => state.completedLessonIds);
  const academies = useAcademyStore((state) => state.academies);

  const academy = academies.find((a) => a.uuid === academyUuid);
  const theme = academy?.theme || { primaryColor: '#2563EB', primaryHover: '#1D4ED8', primarySoft: '#EFF6FF' };

  const baseUrl = `/student/academies/${academyUuid}/courses/${courseUuid}`;

  // Interactive states
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-1': true,
    'mod-2': false,
    'mod-3': false,
  });
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<'all' | ActivityType>('all');
  const [previewLesson, setPreviewLesson] = useState<CurriculumLessonItem | null>(null);

  // Curriculum Data Structure
  const curriculumModules: CurriculumModuleItem[] = [
    {
      id: 'mod-1',
      title: 'Module 1: React 19 Foundations & Compiler Paradigm',
      lessons: [
        {
          id: 'les-1.1',
          title: '1.1 React 19 Core Architecture & Compiler Transformations',
          type: 'video',
          metaText: 'Duration: 14:30',
          status: completedLessonIds.includes('les-1.1') ? 'Completed' : 'Completed',
          progressPercent: 100,
          actionText: 'Watch Again',
          targetPath: `${baseUrl}/learn`,
        },
        {
          id: 'les-1.2',
          title: '1.2 Audio Masterclass: React Server Components Mental Model',
          type: 'audio',
          metaText: 'Audio • 18:20 mins',
          status: completedLessonIds.includes('les-1.2') ? 'Completed' : 'In Progress',
          progressPercent: 65,
          isCurrent: true,
          actionText: 'Listen',
          targetPath: `${baseUrl}/learn`,
        },
        {
          id: 'les-1.3',
          title: '1.3 Comprehensive Reference Guide & Architecture Slides',
          type: 'pdf',
          metaText: 'PDF Guide • 24 Pages',
          status: 'Completed',
          progressPercent: 100,
          actionText: 'Read PDF',
          targetPath: `${baseUrl}/downloads`,
        },
        {
          id: 'les-1.4',
          title: '1.4 Knowledge Assessment: React 19 Compiler Objectives',
          type: 'quiz',
          metaText: '10 Questions • Passing: 80%',
          status: 'Passed',
          progressPercent: 100,
          actionText: 'View Score',
          targetPath: `${baseUrl}/quizzes`,
        },
      ],
    },
    {
      id: 'mod-2',
      title: 'Module 2: Enterprise State Management & Persistence',
      lessons: [
        {
          id: 'les-2.1',
          title: '2.1 Zustand Store Architecture & TypeScript Strictness',
          type: 'video',
          metaText: 'Duration: 16:45',
          status: 'In Progress',
          progressPercent: 40,
          actionText: 'Resume Video',
          targetPath: `${baseUrl}/learn`,
        },
        {
          id: 'les-2.2',
          title: '2.2 Project Submission: Build a Persistent Local Store',
          type: 'assignment',
          metaText: 'Due Aug 12 • Max Marks: 100',
          status: 'Submitted',
          actionText: 'View Submission',
          targetPath: `${baseUrl}/assignments`,
        },
        {
          id: 'les-2.3',
          title: '2.3 Downloads: Starter Repositories & Zustand Boilerplate',
          type: 'download',
          metaText: 'ZIP Archive • 4.8 MB',
          status: 'Completed',
          actionText: 'Download',
          targetPath: `${baseUrl}/downloads`,
        },
        {
          id: 'les-2.4',
          title: '2.4 Milestone Quiz: State Persistence & Hydration',
          type: 'quiz',
          metaText: '15 Questions • Passing: 85%',
          status: 'Locked',
          isLocked: true,
          lockRule: 'Complete Lesson 2.2 Project Submission first',
          actionText: 'Locked',
          targetPath: `${baseUrl}/quizzes`,
        },
      ],
    },
    {
      id: 'mod-3',
      title: 'Module 3: Live Masterclasses & Advanced Server Actions',
      lessons: [
        {
          id: 'les-3.1',
          title: '3.1 Interactive Live Stream: Optimistic Actions Workshop',
          type: 'live',
          metaText: 'Live Stream • Today @ 6:00 PM',
          status: 'Live Now',
          actionText: 'Join Live',
          targetPath: `${baseUrl}/live-classes`,
        },
        {
          id: 'les-3.2',
          title: '3.2 Capstone Coding Exercise: Zero-Latency Form Action Sync',
          type: 'project',
          metaText: 'Capstone Submission • Due Aug 20',
          status: 'Locked',
          isLocked: true,
          lockRule: 'Attend 3.1 Live Stream or watch recording to unlock',
          actionText: 'Locked',
          targetPath: `${baseUrl}/assignments`,
        },
      ],
    },
  ];

  // Calculate statistics
  const allLessons = useMemo(() => curriculumModules.flatMap((m) => m.lessons), []);
  const completedLessons = useMemo(() => allLessons.filter((l) => l.status === 'Completed' || l.status === 'Passed'), [allLessons]);
  const overallProgress = Math.round((completedLessons.length / allLessons.length) * 100);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-5 h-5 shrink-0" style={{ color: theme.primaryColor }} />;
      case 'audio':
        return <Headphones className="w-5 h-5 shrink-0 text-indigo-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 shrink-0 text-amber-600" />;
      case 'assignment':
        return <FileCheck className="w-5 h-5 shrink-0 text-rose-600" />;
      case 'quiz':
        return <HelpCircle className="w-5 h-5 shrink-0 text-purple-600" />;
      case 'live':
        return <Radio className="w-5 h-5 shrink-0 text-rose-500 animate-pulse" />;
      case 'download':
        return <Download className="w-5 h-5 shrink-0 text-emerald-600" />;
      case 'project':
        return <Code className="w-5 h-5 shrink-0 text-cyan-600" />;
    }
  };

  const getStatusBadge = (lesson: CurriculumLessonItem) => {
    if (lesson.isLocked) {
      return (
        <Badge variant="neutral" size="sm" className="gap-1 bg-slate-100 text-slate-500 whitespace-nowrap h-7 rounded-full px-2.5 text-[11px] font-medium">
          <Lock className="w-3 h-3" /> Locked
        </Badge>
      );
    }
    switch (lesson.status) {
      case 'Completed':
      case 'Passed':
        return (
          <Badge variant="success" size="sm" className="gap-1 whitespace-nowrap h-7 rounded-full px-2.5 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
          </Badge>
        );
      case 'In Progress':
        return (
          <Badge variant="warning" size="sm" className="gap-1 whitespace-nowrap h-7 rounded-full px-2.5 text-[11px] font-medium">
            <Clock className="w-3 h-3" /> {lesson.progressPercent}%
          </Badge>
        );
      case 'Live Now':
        return (
          <Badge variant="error" size="sm" className="gap-1 animate-pulse whitespace-nowrap h-7 rounded-full px-2.5 text-[11px] font-medium">
            <Radio className="w-3 h-3" /> Live
          </Badge>
        );
      case 'Submitted':
        return (
          <Badge variant="info" size="sm" className="whitespace-nowrap h-7 rounded-full px-2.5 text-[11px] font-medium">
            Submitted
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm" className="whitespace-nowrap h-7 rounded-full px-2.5 text-[11px] font-medium">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs text-left max-w-5xl mx-auto hide-scrollbar pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-12">
      {/* 1. COMPACT PAGE HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-[22px] font-semibold text-slate-900 tracking-tight leading-tight">
              Course Curriculum
            </h1>
            <span className="text-xs text-slate-500 font-normal block mt-0.5">
              {completedLessons.length} of {allLessons.length} Activities Complete ({overallProgress}%)
            </span>
          </div>

          <Badge variant="info" size="md" className="font-semibold h-[28px] rounded-full px-3">
            {overallProgress}% Complete
          </Badge>
        </div>

        {/* PROGRESS METRIC BAR */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 theme-bg"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </Card>

      {/* 2. ACTIVITY TYPE FILTER CHIPS */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'video', label: 'Videos' },
              { id: 'audio', label: 'Audio' },
              { id: 'pdf', label: 'PDFs' },
              { id: 'assignment', label: 'Assignments' },
              { id: 'quiz', label: 'Quizzes' },
              { id: 'live', label: 'Live' },
              { id: 'download', label: 'Downloads' },
            ] as const
          ).map((filter) => {
            const isSelected = selectedActivityFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedActivityFilter(filter.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected ? 'theme-soft theme-text theme-border border shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. MODULE CARDS & COMPACT LESSON CARDS */}
      <div className="space-y-3.5">
        {curriculumModules.map((mod) => {
          const isExpanded = expandedModules[mod.id] ?? false;

          const filteredLessons = mod.lessons.filter((les) => {
            if (selectedActivityFilter === 'all') return true;
            return les.type === selectedActivityFilter;
          });

          if (filteredLessons.length === 0 && selectedActivityFilter !== 'all') return null;

          const completedCount = mod.lessons.filter((l) => l.status === 'Completed' || l.status === 'Passed').length;
          const moduleProgress = Math.round((completedCount / mod.lessons.length) * 100);

          return (
            <div key={mod.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden mb-3.5 shadow-2xs">
              {/* MODULE HEADER GRID: 40px icon | 1fr title & progress | 32px chevron */}
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className="w-full px-4 py-3.5 grid grid-cols-[40px_minmax(0,1fr)_32px] items-center gap-3 bg-slate-50/90 hover:bg-slate-100/90 transition-all border-b border-slate-200/80 text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-[10px] theme-soft flex items-center justify-center shrink-0">
                  <ListTree className="w-4 h-4" style={{ color: theme.primaryColor }} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-[15px] text-slate-900 leading-[1.3] line-clamp-2">{mod.title}</h3>
                  <span className="text-xs font-normal text-[#64748B] block mt-0.5">
                    {completedCount} of {mod.lessons.length} Activities Complete • {moduleProgress}% Progress
                  </span>
                </div>

                <div className="w-8 h-8 flex items-center justify-center shrink-0 ml-auto">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* LESSON SECTIONS INSIDE MODULE */}
              {isExpanded && (
                <div className="divide-y divide-slate-200/80">
                  {filteredLessons.map((les) => (
                    <div
                      key={les.id}
                      className={`p-4 bg-white transition-all ${
                        les.isCurrent
                          ? 'border-l-[3px] theme-soft'
                          : les.isLocked
                          ? 'bg-slate-50/40'
                          : 'hover:bg-slate-50/60'
                      }`}
                      style={{
                        borderLeftColor: les.isCurrent ? theme.primaryColor : undefined,
                      }}
                    >
                      {/* LESSON HEADER GRID: 48px Icon | 1fr Title & Metadata */}
                      <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-3.5 items-start">
                        <div className="w-12 h-12 rounded-xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center shrink-0 flex-none">
                          {getActivityIcon(les.type)}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-semibold text-[15px] text-slate-900 leading-[1.35] break-words overflow-wrap-anywhere">
                            {les.title}
                          </h4>
                          <span className="text-xs md:text-[13px] font-normal text-[#64748B] block mt-1">
                            {les.metaText}
                          </span>
                          {les.lockRule && (
                            <span className="text-xs text-amber-600 font-normal block mt-1">
                              Complete previous lesson to unlock.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* COMPACT & BALANCED ACTION ROW: Status Badge | Eye Button (36x36) | Primary Action Button (36px height) */}
                      <div className="flex items-center justify-between gap-2 w-full border-t border-slate-200/80 pt-2.5 mt-2.5">
                        <div className="flex items-center shrink-0">
                          {getStatusBadge(les)}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewLesson(les)}
                            className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-[var(--theme-primary-soft,#EFF6FF)] flex items-center justify-center transition-all cursor-pointer shrink-0"
                            aria-label="Preview Activity"
                            title="Preview Activity"
                          >
                            <Eye className="w-4 h-4 text-slate-500" />
                          </button>

                          <Button
                            size="sm"
                            disabled={les.isLocked}
                            onClick={() => les.targetPath && navigate(les.targetPath)}
                            className={`h-9 px-3 rounded-lg text-xs font-semibold cursor-pointer truncate ${
                              !les.isLocked ? 'theme-bg' : ''
                            }`}
                          >
                            {les.actionText}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. LESSON PREVIEW & UNLOCK RULE MODAL */}
      <Modal
        isOpen={Boolean(previewLesson)}
        onClose={() => setPreviewLesson(null)}
        title={previewLesson?.title || 'Activity Details'}
        subtitle={previewLesson?.metaText}
        maxWidth="md"
      >
        {previewLesson && (
          <div className="space-y-4 font-sans text-xs text-left">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                {getActivityIcon(previewLesson.type)}
                <span className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">{previewLesson.type} Activity</span>
              </div>
              {getStatusBadge(previewLesson)}
            </div>

            {previewLesson.isLocked && previewLesson.lockRule && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                  <Lock className="w-4 h-4" />
                  <span>Lock Requirement</span>
                </div>
                <p className="text-xs font-normal">{previewLesson.lockRule}</p>
              </div>
            )}

            <div className="space-y-2">
              <span className="font-semibold text-slate-900 block">Activity Overview</span>
              <p className="text-slate-600 font-normal leading-relaxed">
                This learning module covers essential concepts with structured exercises, instant score tracking, and automated progress recording toward your course certificate.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setPreviewLesson(null)} className="font-semibold">
                Close
              </Button>
              {!previewLesson.isLocked && previewLesson.targetPath && (
                <Button
                  size="sm"
                  onClick={() => {
                    setPreviewLesson(null);
                    navigate(previewLesson.targetPath!);
                  }}
                  className="font-semibold theme-bg"
                >
                  Open Activity
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
