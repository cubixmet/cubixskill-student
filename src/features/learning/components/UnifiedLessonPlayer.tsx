import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  Radio,
  Image as ImageIcon,
  FileText,
  Globe,
  AlignLeft,
  ClipboardCheck,
  FileCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  AlertCircle,
  ArrowRight,
  Volume2,
} from 'lucide-react';
import type { CourseLesson, LessonType } from '../../../stores/course.store';
import type { CourseEnrollment } from '../../../stores/enrollment.store';
import { resolveLessonType, resolveLessonMedia } from '../utils/mediaResolver';
import { VideoLessonPlayer } from './renderers/VideoLessonPlayer';
import { AudioLessonPlayer } from './renderers/AudioLessonPlayer';
import { StreamLessonPlayer } from './renderers/StreamLessonPlayer';
import { ImageLessonViewer } from './renderers/ImageLessonViewer';
import { DocumentLessonViewer } from './renderers/DocumentLessonViewer';
import { EmbeddedUrlLessonViewer } from './renderers/EmbeddedUrlLessonViewer';
import { TextLessonViewer } from './renderers/TextLessonViewer';
import { TestLessonRenderer } from './renderers/TestLessonRenderer';
import { AssignmentLessonRenderer } from './renderers/AssignmentLessonRenderer';
import { useResourceStore } from '../../../stores/resource.store';
import { LessonResourceCard } from './LessonResourceCard';
import { Button } from '../../../components/ui/Button';
import { LessonStatusBadge } from '../../../components/ui/LessonStatusBadge';
import { RichTextRenderer } from '../../../components/ui/RichTextRenderer';

interface Props {
  lesson: CourseLesson;
  moduleTitle?: string;
  academyUuid: string;
  courseUuid: string;
  enrollment?: CourseEnrollment;
  isCompleted?: boolean;
  canAccess?: boolean;
  lockReason?: 'previous_lesson_required' | 'demo_restricted' | 'demo_expired';
  onMarkComplete?: () => Promise<void> | void;
  prevLessonId?: string;
  nextLessonId?: string;
  onNavigateLesson?: (lessonId: string) => void;
}

import { useCourseFeatures } from '../../../hooks/useCourseFeatures';
import { COURSE_FEATURE_KEYS } from '../../../constants/courseFeatures.constants';

export const UnifiedLessonPlayer: React.FC<Props> = ({
  lesson,
  moduleTitle = 'Module 1',
  academyUuid,
  courseUuid,
  enrollment,
  isCompleted = false,
  canAccess = true,
  lockReason,
  onMarkComplete,
  prevLessonId,
  nextLessonId,
  onNavigateLesson,
}) => {
  const navigate = useNavigate();
  const { isFeatureEnabled } = useCourseFeatures(courseUuid);
  if (!isFeatureEnabled(COURSE_FEATURE_KEYS.LESSONS)) {
    return (
      <div className="p-8 text-center text-slate-500 font-sans">
        Lessons feature is disabled for this course.
      </div>
    );
  }
  const lessonType = resolveLessonType(lesson);

  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);

  const isDemoStudent = enrollment?.accessType === 'demo';

  // Icon Resolver
  const renderTypeIcon = (type: LessonType) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
      case 'audio':
        return <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
      case 'stream':
        return <Radio className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
      case 'document':
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

  const handleCompleteAction = async () => {
    if (!onMarkComplete || isCompleting) return;
    setIsCompleting(true);
    try {
      await onMarkComplete();
      setShowCompletionAlert(true);
      setTimeout(() => setShowCompletionAlert(false), 5000);
    } finally {
      setIsCompleting(false);
    }
  };

  // Renderer Switch Dispatcher with Direct-URL Lock Protection
  const renderLessonContent = () => {
    if (!canAccess) {
      return (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xs text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
              {lockReason === 'demo_restricted'
                ? 'Lesson Restricted in Demo Mode'
                : lockReason === 'previous_lesson_required'
                ? 'Complete Previous Lessons First'
                : 'Lesson Access Locked'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              {lockReason === 'demo_restricted'
                ? 'Your temporary demo access includes initial preview lessons. Upgrade to Full Course Access to unlock this lesson.'
                : lockReason === 'previous_lesson_required'
                ? 'This academy uses sequential learning mode. You must complete the previous lessons in order to unlock this content.'
                : 'You need an active course enrollment to access this lesson content.'}
            </p>
          </div>

          <div className="pt-2">
            {lockReason === 'demo_restricted' ? (
              <Button
                size="lg"
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`)}
                leftIcon={<Sparkles className="w-4 h-4 text-amber-300 shrink-0" />}
                className="font-bold px-8 min-h-[50px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer"
              >
                Upgrade to Full Access
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`)}
                className="font-bold px-8 min-h-[50px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer"
              >
                Return to Course Overview
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (lessonType === 'assignment' && !isFeatureEnabled('assignments')) {
      return (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto font-sans">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assignments Feature Disabled</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Assignments are not enabled for this course by the instructor.</p>
        </div>
      );
    }

    if (lessonType === 'test' && !isFeatureEnabled('quizzes')) {
      return (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto font-sans">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quizzes Feature Disabled</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Quizzes are not enabled for this course by the instructor.</p>
        </div>
      );
    }

    switch (lessonType) {
      case 'video':
        return <VideoLessonPlayer lesson={lesson} />;
      case 'audio':
        return <AudioLessonPlayer lesson={lesson} />;
      case 'stream':
        return <StreamLessonPlayer lesson={lesson} />;
      case 'image':
        return <ImageLessonViewer lesson={lesson} />;
      case 'document':
        return <DocumentLessonViewer lesson={lesson} />;
      case 'url':
        return <EmbeddedUrlLessonViewer lesson={lesson} />;
      case 'text':
        return <TextLessonViewer lesson={lesson} />;
      case 'test':
        return <TestLessonRenderer lesson={lesson} onMarkComplete={handleCompleteAction} />;
      case 'assignment':
        return <AssignmentLessonRenderer lesson={lesson} />;
      default:
        return (
          <div className="p-6 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-center text-slate-500 dark:text-[#94A3B8] font-medium text-xs">
            Unsupported Lesson Type ({lessonType})
          </div>
        );
    }
  };

  return (
    <div className="space-y-5 font-sans text-xs text-left max-w-5xl mx-auto w-full box-border min-w-0">
      {/* 1. UNIFIED LESSON HEADER */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
        className="border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs space-y-2 box-border min-w-0"
      >
        <div style={{ borderColor: 'var(--border)' }} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
          <span style={{ color: 'var(--text-muted)' }} className="font-semibold text-[11px] uppercase tracking-wider truncate max-w-md block">
            {moduleTitle}
          </span>
          <div className="flex items-center gap-2">
            {isDemoStudent && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Demo Mode
              </span>
            )}
            <span
              style={{
                backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, var(--surface))',
                borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, var(--border))',
                color: 'var(--brand-primary)',
              }}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide"
            >
              {lessonType}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <h1 style={{ color: 'var(--text-primary)' }} className="text-lg sm:text-xl font-semibold tracking-tight leading-snug break-words">
              {lesson.title}
            </h1>
            <div style={{ color: 'var(--text-secondary)' }} className="flex flex-wrap items-center gap-2.5 font-medium text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium">
                {renderTypeIcon(lessonType)}
                <span className="capitalize">{lessonType} Lesson</span>
              </span>
              {lesson.duration && (
                <>
                  <span style={{ color: 'var(--border)' }}>•</span>
                  <span style={{ color: 'var(--text-muted)' }} className="inline-flex items-center gap-1 font-normal">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{lesson.duration}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {canAccess && isCompleted && (
            <LessonStatusBadge status="completed" />
          )}
        </div>
      </div>

      {/* COMPLETION ALERT */}
      {showCompletionAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 flex items-start gap-3 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="font-bold text-xs block">Lesson Marked Complete!</span>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium block">
              Your learning progress has been saved. The next eligible lesson is now unlocked.
            </span>
          </div>
        </div>
      )}

      {/* 2. LESSON MEDIA CONTENT RENDERER */}
      <div className="w-full min-w-0 max-w-full box-border">{renderLessonContent()}</div>

      {/* 3. LESSON DESCRIPTION & RESOURCES SECTION */}
      {canAccess && (
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          className="border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4 box-border min-w-0"
        >
          {lesson.description && (
            <div className="space-y-1">
              <h3 style={{ color: 'var(--text-primary)' }} className="font-bold text-xs uppercase tracking-wider">Lesson Description</h3>
              <RichTextRenderer html={lesson.description} />
            </div>
          )}

          {/* CONTEXTUAL LESSON RESOURCES */}
          {Array.isArray(lesson.resources) && lesson.resources.length > 0 && (
            <div style={{ borderColor: 'var(--border)' }} className="space-y-3 pt-4 border-t">
              <h3 style={{ color: 'var(--text-primary)' }} className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <FileText style={{ color: 'var(--brand-primary)' }} className="w-4 h-4" />
                <span>Lesson Resources &amp; Attachments ({lesson.resources.length})</span>
              </h3>
              <div className="space-y-2.5">
                {lesson.resources.map((res: any, idx: number) => (
                  <LessonResourceCard
                    key={res.resourceUuid || res.id || idx}
                    resource={res}
                    enrollment={enrollment}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. UNIFIED LESSON ACTION FOOTER */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        className="border rounded-2xl sm:rounded-3xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <button
          type="button"
          disabled={!prevLessonId}
          onClick={() => prevLessonId && onNavigateLesson && onNavigateLesson(prevLessonId)}
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
          className="w-full sm:w-auto font-semibold min-h-[44px] px-5 rounded-xl border flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer hover:opacity-90 disabled:opacity-55 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 shrink-0 stroke-current text-current" />
          <span>Previous Lesson</span>
        </button>

        {canAccess && onMarkComplete && (
          <button
            type="button"
            disabled={isCompleting || isCompleted}
            onClick={handleCompleteAction}
            style={{
              backgroundColor: isCompleted ? '#059669' : 'var(--brand-primary)',
              color: 'var(--brand-primary-foreground, #FFFFFF)',
            }}
            className="w-full sm:w-auto font-semibold min-h-[48px] px-6 rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition-all cursor-pointer hover:opacity-90 disabled:opacity-75"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 stroke-current text-current" />
            <span>{isCompleting ? 'Completing...' : isCompleted ? 'Completed' : 'Complete Lesson'}</span>
          </button>
        )}

        {nextLessonId && onNavigateLesson ? (
          <button
            type="button"
            onClick={() => onNavigateLesson(nextLessonId)}
            style={{
              backgroundColor: 'var(--brand-secondary)',
              color: 'var(--brand-secondary-foreground)',
              borderColor: 'var(--border)',
            }}
            className="w-full sm:w-auto font-semibold min-h-[44px] px-5 rounded-xl border flex items-center justify-center gap-2 text-xs shadow-xs transition-colors cursor-pointer hover:opacity-90"
          >
            <span>Next Lesson</span>
            <ChevronRight className="w-4 h-4 shrink-0 stroke-current text-current" />
          </button>
        ) : (
          <button
            type="button"
            disabled
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
            className="w-full sm:w-auto font-semibold min-h-[44px] px-5 rounded-xl border flex items-center justify-center gap-2 text-xs opacity-55 cursor-not-allowed"
          >
            <span>Next Lesson</span>
            <ChevronRight className="w-4 h-4 shrink-0 stroke-current text-current" />
          </button>
        )}
      </div>
    </div>
  );
};
