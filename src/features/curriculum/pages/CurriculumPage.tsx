import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ListTree,
  PlayCircle,
  Radio,
  Image as ImageIcon,
  FileText,
  FileCheck,
  ClipboardCheck,
  Globe,
  AlignLeft,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StudentStateCard } from '../../../components/ui/StudentStateCard';
import { LessonStatusBadge } from '../../../components/ui/LessonStatusBadge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { CourseTabs } from '../../learning/components/CourseTabs';
import { LearningProgressCard } from '../../learning/components/LearningProgressCard';
import { resolveLessonType } from '../../learning/utils/mediaResolver';
import { isValidUuid } from '../../../utils/routeBuilder';
import { StartUnitButton } from '../components/StartUnitButton';
import { useStudentCourseCurriculum } from '../../learning/hooks/useStudentCourseCurriculum';

const CurriculumSkeleton: React.FC = () => (
  <div className="space-y-6 font-sans text-xs text-left max-w-5xl mx-auto w-full px-1 sm:px-0">
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-24 rounded-md" />
      <span className="text-slate-300">/</span>
      <Skeleton className="h-4 w-48 rounded-md" />
      <span className="text-slate-300">/</span>
      <Skeleton className="h-4 w-16 rounded-md" />
    </div>

    <Skeleton className="h-11 w-full rounded-xl" />
    <Skeleton className="h-28 w-full rounded-2xl" />

    <div className="space-y-3">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  </div>
);

export const CurriculumPage: React.FC = () => {
  const { academyUuid, courseUuid } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();

  const { isLoading, error, courseTitle, modules, progress, enrollment } = useStudentCourseCurriculum(
    academyUuid,
    courseUuid
  );

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const isDemoStudent = enrollment?.access_type === 'demo';
  const isDemoExpired = isDemoStudent && enrollment?.status === 'expired';

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-[var(--brand-primary,#2563EB)] shrink-0" />;
      case 'stream':
        return <Radio className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />;
      case 'audio':
        return <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
      case 'document':
      case 'pdf':
        return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'url':
        return <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'text':
        return <AlignLeft className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />;
      case 'test':
        return <ClipboardCheck className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />;
      case 'assignment':
        return <FileCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />;
      default:
        return <PlayCircle className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />;
    }
  };

  const handleLessonClick = (lessonId: string) => {
    if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) return;
    navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/learn?lesson=${lessonId}`);
  };

  if (isLoading) {
    return <CurriculumSkeleton />;
  }

  if (error) {
    return (
      <div className="py-8 w-full min-h-[300px] flex items-center justify-center">
        <StudentStateCard
          variant="error"
          title="Curriculum Unavailable"
          description={error || 'Unable to load course content. Please try again.'}
          actionLabel="Back to Courses"
          actionPath={isValidUuid(academyUuid) ? `/student/academies/${academyUuid}` : '/student/academies'}
        />
      </div>
    );
  }

  const isCurriculumEmpty = modules.length === 0;

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-5xl mx-auto w-full px-1 sm:px-0 pb-16">
      {/* BREADCRUMB NAVIGATION */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <button
          type="button"
          onClick={() => navigate(`/student/academies/${academyUuid}`)}
          className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
        >
          Courses
        </button>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-semibold truncate max-w-xs">{courseTitle}</span>
        <span>/</span>
        <span className="text-[var(--brand-primary)] font-semibold">Curriculum</span>
      </nav>

      {/* COURSE TABS ROW */}
      <CourseTabs academyUuid={academyUuid || ''} courseUuid={courseUuid || ''} activeTab="curriculum" />

      {/* DEMO EXPIRED TOP ALERT */}
      {isDemoExpired && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 fill-amber-500" />
            <div className="min-w-0">
              <span className="font-semibold text-xs block text-[var(--text-primary)]">Demo Access Expired</span>
              <span className="text-[11px] text-[var(--text-secondary)] font-normal">
                Your demo access period has ended. Upgrade to full course access to unlock all lessons.
              </span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/${academyUuid}/checkout/${courseUuid}`)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0 cursor-pointer"
          >
            Enroll Full Course
          </Button>
        </div>
      )}

      {/* 1. PROGRESS HEADER SUMMARY CARD */}
      <LearningProgressCard
        completedLessons={progress.completed_lessons || 0}
        totalLessons={progress.total_lessons || 0}
        percentage={Math.round(Number(progress.percentage || 0))}
        subtitle={`Course Roadmap • ${courseTitle}`}
      />

      {/* 2. MODULE ACCORDIONS & LESSON LIST */}
      {isCurriculumEmpty ? (
        <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xs text-center p-8 space-y-3">
          <Inbox className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">No curriculum available</h2>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Modules and lessons for this course have not been published yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {modules.map((mod: any, modIdx: number) => {
            if (!mod) return null;
            const isOpen = expandedModules[mod.id] ?? (modIdx === 0);
            const modLessons = Array.isArray(mod.lessons) ? mod.lessons.filter(Boolean) : [];
            const modCompletedCount = modLessons.filter((les: any) => les.completed || les.is_completed).length;
            const modTotal = modLessons.length || 1;
            const modProgress = Math.round((modCompletedCount / modTotal) * 100);

            return (
              <div key={mod.id || modIdx} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xs">
                {/* MODULE HEADER ACCORDION BUTTON */}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-3 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all border-b border-[var(--border)] text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary-soft,#EFF6FF)] flex items-center justify-center shrink-0 border border-[var(--brand-primary,#2563EB)]">
                      <ListTree className="w-4 h-4 text-[var(--brand-primary,#2563EB)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] tracking-tight leading-snug break-words">
                        {mod.title || `Module ${modIdx + 1}`}
                      </h2>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                        <span>{modLessons.length} {modLessons.length === 1 ? 'Unit' : 'Units'}</span>
                        <span>•</span>
                        <span>{modProgress}% Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--brand-primary,#2563EB)] transition-all duration-300"
                          style={{ width: `${modProgress}%` }}
                        />
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                  </div>
                </button>

                {/* MODULE LESSON LIST */}
                {isOpen && (
                  <div className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                    {modLessons.map((lesson: any, lesIdx: number) => {
                      const normalizedType = resolveLessonType(lesson);
                      const isCompleted = Boolean(lesson.completed || lesson.is_completed);
                      const isLocked = lesson.unlocked === false;

                      return (
                        <div
                          key={lesson.id || lesIdx}
                          onClick={() => {
                            if (!isLocked) handleLessonClick(lesson.id);
                          }}
                          className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all text-left group ${
                            isLocked
                              ? 'opacity-60 bg-[var(--surface-secondary)]/50 cursor-not-allowed'
                              : 'hover:bg-[var(--surface-hover)] cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                              {isLocked ? (
                                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                              ) : (
                                renderTypeIcon(normalizedType)
                              )}
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`font-semibold text-xs transition-colors break-words ${
                                  isLocked
                                    ? 'text-[var(--text-muted)]'
                                    : 'text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]'
                                }`}>
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)] font-normal">
                                <span className="capitalize">{normalizedType} Lesson</span>
                                {lesson.duration_minutes && (
                                  <>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {lesson.duration_minutes} min
                                    </span>
                                  </>
                                )}
                                {isLocked && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-500 font-medium">Complete previous unit to unlock</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                            {isCompleted ? (
                              <LessonStatusBadge status="completed" />
                            ) : isLocked ? (
                              <LessonStatusBadge status="locked" />
                            ) : (
                              <StartUnitButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLessonClick(lesson.id);
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
