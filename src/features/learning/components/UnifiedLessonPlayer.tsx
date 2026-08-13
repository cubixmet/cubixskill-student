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
} from 'lucide-react';
import type { CourseLesson, LessonType } from '../../../stores/course.store';
import type { CourseEnrollment } from '../../../stores/enrollment.store';
import { resolveLessonType, resolveLessonMedia } from '../utils/mediaResolver';
import { VideoLessonPlayer } from './renderers/VideoLessonPlayer';
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

interface Props {
  lesson: CourseLesson;
  moduleTitle?: string;
  academyUuid: string;
  courseUuid: string;
  enrollment?: CourseEnrollment;
  isCompleted?: boolean;
  canAccess?: boolean;
  lockReason?: 'previous_lesson_required' | 'demo_restricted' | 'demo_expired';
  onMarkComplete?: () => void;
  prevLessonId?: string;
  nextLessonId?: string;
  onNavigateLesson?: (lessonId: string) => void;
}

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
  const lessonType = resolveLessonType(lesson);
  const media = resolveLessonMedia(lesson);

  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);

  const isDemoStudent = enrollment?.accessType === 'demo';
  const isExpired = isDemoStudent && enrollment?.status === 'expired';

  // Icon Resolver
  const renderTypeIcon = (type: LessonType) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'stream':
        return <Radio className="w-4 h-4 text-red-600 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-indigo-600 shrink-0" />;
      case 'document':
        return <FileText className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'url':
        return <Globe className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'text':
        return <AlignLeft className="w-4 h-4 text-purple-600 shrink-0" />;
      case 'test':
        return <ClipboardCheck className="w-4 h-4 text-orange-600 shrink-0" />;
      case 'assignment':
        return <FileCheck className="w-4 h-4 text-teal-600 shrink-0" />;
      default:
        return <PlayCircle className="w-4 h-4 text-slate-600 shrink-0" />;
    }
  };

  const handleCompleteAction = () => {
    if (isCompleted || isCompleting || !onMarkComplete) return;
    setIsCompleting(true);
    setTimeout(() => {
      onMarkComplete();
      setIsCompleting(false);
      setShowCompletionAlert(true);
    }, 400);
  };

  // Renderer Switch Dispatcher with Direct-URL Lock Protection
  const renderLessonContent = () => {
    if (!canAccess) {
      const isPrevRequired = lockReason === 'previous_lesson_required';
      const isRestricted = lockReason === 'demo_restricted';

      return (
        <div className="p-8 sm:p-12 rounded-2xl border border-amber-200 bg-amber-50/70 text-center space-y-4 font-sans shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-extrabold text-base text-slate-900">
              {isExpired
                ? 'Demo Access Expired'
                : isPrevRequired
                ? 'Lesson Locked — Previous Lesson Required'
                : 'Full Course Access Required'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isExpired
                ? 'Your 5-day demo period has ended. Upgrade to full enrollment to unlock all course modules.'
                : isPrevRequired
                ? 'Complete the previous required lesson in the curriculum before unlocking this lesson.'
                : 'This lesson is included in full course enrollment. Upgrade your student access to continue learning.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isRestricted || isExpired ? (
              <Button
                size="md"
                onClick={() => navigate(`/${academyUuid}/register?course=${courseUuid}&intent=full`)}
                leftIcon={<Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />}
                className="font-semibold px-6 min-h-[46px] bg-blue-600 text-white rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
              >
                Upgrade to Full Access
              </Button>
            ) : (
              <Button
                size="md"
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`)}
                className="font-semibold px-6 min-h-[46px] bg-blue-600 text-white rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
              >
                Return to Course Overview
              </Button>
            )}
          </div>
        </div>
      );
    }

    switch (lessonType) {
      case 'video':
        return <VideoLessonPlayer lesson={lesson} />;
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
        return <TestLessonRenderer lesson={lesson} />;
      case 'assignment':
        return <AssignmentLessonRenderer lesson={lesson} />;
      default:
        return (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 font-medium text-xs">
            Unsupported Lesson Type ({lessonType})
          </div>
        );
    }
  };

  return (
    <div className="space-y-5 font-sans text-xs text-left max-w-5xl mx-auto w-full">
      {/* 1. UNIFIED LESSON HEADER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <span className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider truncate max-w-md block">
            {moduleTitle}
          </span>
          <div className="flex items-center gap-2">
            {isDemoStudent && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Demo Mode
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase tracking-wide">
              {lessonType}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight leading-snug break-words">
              {lesson.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 text-slate-500 font-medium text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                {renderTypeIcon(lessonType)}
                <span className="capitalize">{lessonType} Lesson</span>
              </span>
              {lesson.duration && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-slate-500 font-normal">
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
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="font-bold text-xs block">Lesson Marked Complete!</span>
            <span className="text-[11px] text-emerald-800 font-medium block">
              Your learning progress has been saved. The next eligible lesson is now unlocked.
            </span>
          </div>
        </div>
      )}

      {/* 2. LESSON MEDIA CONTENT RENDERER */}
      <div className="w-full">{renderLessonContent()}</div>

      {/* 3. LESSON DESCRIPTION & RESOURCES SECTION */}
      {canAccess && (
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
          {lesson.description && (
            <div className="space-y-1">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Lesson Description</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-line">
                {lesson.description}
              </p>
            </div>
          )}

          {/* CONTEXTUAL LESSON RESOURCES */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Lesson Attachments &amp; Resources</h3>
            {useResourceStore.getState().getLessonResources(lesson.id).length > 0 ? (
              <div className="space-y-2">
                {useResourceStore.getState().getLessonResources(lesson.id).map((res) => (
                  <LessonResourceCard key={res.resourceUuid} resource={res} enrollment={enrollment} />
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs font-medium">No additional downloadable resource files attached to this unit.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. UNIFIED LESSON ACTION FOOTER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          size="md"
          variant="outline"
          disabled={!prevLessonId}
          onClick={() => prevLessonId && onNavigateLesson && onNavigateLesson(prevLessonId)}
          leftIcon={<ChevronLeft className="w-4 h-4 shrink-0" />}
          className="w-full sm:w-auto font-semibold min-h-[44px] px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-40"
        >
          Previous Lesson
        </Button>

        {canAccess && onMarkComplete && (
          <Button
            size="md"
            disabled={isCompleting || isCompleted}
            onClick={handleCompleteAction}
            leftIcon={<CheckCircle2 className={`w-4 h-4 shrink-0 ${isCompleted ? 'text-emerald-500' : 'text-white'}`} />}
            className={`w-full sm:w-auto font-semibold min-h-[48px] px-6 rounded-xl text-white shadow-xs cursor-pointer ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-600 cursor-default'
                : isCompleting
                ? 'bg-blue-500 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isCompleting ? 'Completing...' : isCompleted ? 'Completed' : 'Complete Lesson'}
          </Button>
        )}

        {nextLessonId && onNavigateLesson ? (
          <Button
            size="md"
            onClick={() => onNavigateLesson(nextLessonId)}
            rightIcon={<ChevronRight className="w-4 h-4 shrink-0" />}
            className="w-full sm:w-auto font-semibold min-h-[44px] px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
          >
            Next Lesson
          </Button>
        ) : (
          <Button
            size="md"
            variant="outline"
            disabled
            rightIcon={<ChevronRight className="w-4 h-4 shrink-0" />}
            className="w-full sm:w-auto font-semibold min-h-[44px] px-5 rounded-xl border-slate-200 text-slate-700 opacity-40"
          >
            Next Lesson
          </Button>
        )}
      </div>
    </div>
  );
};
