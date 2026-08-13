import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LessonStatusBadge } from '../../../components/ui/LessonStatusBadge';
import { useLearningStore } from '../../../stores/learning.store';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore, type CourseLesson, type LessonType } from '../../../stores/course.store';
import { useAuthStore } from '../../../stores/auth.store';
import { useEnrollmentStore } from '../../../stores/enrollment.store';
import { calculateLessonAccessMap, type LessonAccessState } from '../../learning/utils/unlockResolver';
import { resolveLessonPreview } from '../../learning/utils/previewResolver';
import { saveLastActiveCourse } from '../../../utils/last-active-course.utility';
import { flattenCurriculum } from '../../learning/utils/flattenCurriculum';
import { getCourseWithResolvedCurriculum } from '../../../mocks/demoCourseCurriculum';

export const CurriculumPage: React.FC = () => {
  const { academyUuid, courseUuid } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();
  const completedLessonIds = useLearningStore((state) => state.completedLessonIds);
  const lastAccessedLessonUuid = useLearningStore((state) => state.lastAccessedLessonUuid);
  const setLastAccessedLessonUuid = useLearningStore((state) => state.setLastAccessedLessonUuid);

  const academies = useAcademyStore((state) => state.academies);
  const courses = useCourseStore((state) => state.courses);
  const student = useAuthStore((state) => state.student);
  const getEnrollment = useEnrollmentStore((state) => state.getEnrollment);

  const academy = useMemo(() => {
    if (!academyUuid) return undefined;
    return academies.find((a) => a.uuid === academyUuid);
  }, [academies, academyUuid]);

  const course = useMemo(() => {
    if (!academyUuid || !courseUuid) return undefined;
    const rawCourse = courses.find((c) => c.academyUuid === academyUuid && (c.uuid === courseUuid || c.courseUuid === courseUuid));
    return getCourseWithResolvedCurriculum(rawCourse, academyUuid, courseUuid);
  }, [courses, academyUuid, courseUuid]);

  const studentUuid = student?.uuid || 'std-production-1';
  const enrollment = useMemo(() => {
    if (!courseUuid) return undefined;
    return getEnrollment(studentUuid, courseUuid);
  }, [getEnrollment, studentUuid, courseUuid]);

  const isDemoStudent = enrollment?.accessType === 'demo';
  const isDemoExpired = isDemoStudent && enrollment?.status === 'expired';

  const theme = academy?.theme || { primaryColor: '#2563EB', primaryHover: '#1D4ED8', primarySoft: '#EFF6FF' };

  // 1. Calculate Unified Access Map safely
  const accessMap = useMemo(() => {
    if (!course) return new Map<string, LessonAccessState>();
    return calculateLessonAccessMap({
      course,
      enrollment,
      completedLessonIds,
      lastAccessedLessonUuid,
    });
  }, [course, enrollment, completedLessonIds, lastAccessedLessonUuid]);

  // 2. Identify Active Module for Auto-Expansion safely
  const activeModuleId = useMemo(() => {
    if (!course || !Array.isArray(course.modules) || course.modules.length === 0) return 'mod-1';
    for (const mod of course.modules) {
      if (!mod || !Array.isArray(mod.lessons)) continue;
      const hasActive = mod.lessons.some(
        (les) => les && (les.id === lastAccessedLessonUuid || accessMap.get(les.id)?.status === 'in_progress' || accessMap.get(les.id)?.status === 'unlocked')
      );
      if (hasActive) return mod.id;
    }
    return course.modules[0]?.id || 'mod-1';
  }, [course, lastAccessedLessonUuid, accessMap]);

  // 3. Expansion State (Auto-expand active module by default)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [activeModuleId]: true,
  });

  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  // 4. Progress Summary Calculation safely using flattenCurriculum
  const flattenedCurriculum = useMemo(() => flattenCurriculum(course), [course]);
  const isCurriculumEmpty = course && (course.modules?.length === 0 || flattenedCurriculum.length === 0);

  const accessibleLessons = useMemo(() => {
    return flattenedCurriculum
      .map(({ lesson }) => lesson)
      .filter((les) => {
        const access = accessMap.get(les.id);
        return access ? access.lockReason !== 'demo_restricted' && access.lockReason !== 'demo_expired' : true;
      });
  }, [flattenedCurriculum, accessMap]);

  const totalAccessibleCount = accessibleLessons.length || 1;
  const completedCount = accessibleLessons.filter((les) => {
    const access = accessMap.get(les.id);
    return access?.status === 'completed';
  }).length;

  const progressPercent = flattenedCurriculum.length === 0 ? 0 : Math.min(100, Math.round((completedCount / totalAccessibleCount) * 100));

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

  const handleLessonClick = (les: CourseLesson) => {
    if (!academyUuid || !courseUuid) return;
    const access = accessMap.get(les.id);
    if (!access || !access.canAccess) {
      if (access?.lockReason === 'demo_expired') {
        setLockedNotice('Your demo access period has expired. Upgrade to full course enrollment to continue.');
      } else if (access?.lockReason === 'demo_restricted') {
        setLockedNotice('This lesson is available with full course enrollment.');
      } else {
        setLockedNotice('Complete the previous required lesson in sequence before unlocking this lesson.');
      }
      setTimeout(() => setLockedNotice(null), 4000);
      return;
    }

    setLastAccessedLessonUuid(les.id);
    saveLastActiveCourse(academyUuid, courseUuid);
    navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/learn/${les.id}`);
  };

  if (!academyUuid || !courseUuid || !course) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center space-y-3 font-sans text-xs bg-white rounded-3xl border border-slate-200 shadow-2xs">
        <AlertCircle className="w-8 h-8 text-amber-500" />
        <h2 className="text-base font-bold text-slate-900">Curriculum Content Unavailable</h2>
        <p className="text-slate-500 font-mono text-[11px]">Requested Course: {courseUuid || 'None'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 font-sans text-xs text-left max-w-5xl mx-auto hide-scrollbar pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-12">
      {/* DEMO EXPIRED TOP ALERT */}
      {isDemoExpired && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 fill-amber-500" />
            <div className="min-w-0">
              <span className="font-bold text-xs block">Demo Access Expired</span>
              <span className="text-[11px] text-amber-800 font-medium">
                Your 5-day demo period has ended. Upgrade to full course access to unlock all lessons.
              </span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/${academyUuid}/register?course=${courseUuid}&intent=full`)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0 cursor-pointer"
          >
            Enroll Full Course
          </Button>
        </div>
      )}

      {/* LOCKED NOTICE TOAST */}
      {lockedNotice && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-start gap-2.5 shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top duration-200">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold text-slate-100 flex-1 leading-snug">{lockedNotice}</span>
        </div>
      )}

      {/* 1. PROGRESS HEADER SUMMARY CARD */}
      <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Course Roadmap</span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{course.title}</h1>
          </div>
          <Badge variant={isDemoStudent ? 'warning' : 'success'} size="sm" className="font-bold text-[11px] rounded-lg self-start sm:self-center">
            {isDemoStudent ? 'Demo Access Scope' : 'Full Lifetime Access'}
          </Badge>
        </div>

        {/* ACCESSIBLE PROGRESS BAR */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Overall Course Progress</span>
            <span style={{ color: theme.primaryColor }}>{progressPercent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%`, backgroundColor: theme.primaryColor }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>{completedCount} of {totalAccessibleCount} lessons completed</span>
            <span>{Math.max(0, totalAccessibleCount - completedCount)} remaining</span>
          </div>
        </div>
      </Card>

      {/* 2. MODULE ACCORDIONS & VISUAL LESSON CARDS OR EMPTY STATE */}
      {isCurriculumEmpty ? (
        <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs text-center p-8 space-y-3">
          <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Course content is not available yet</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Modules and lessons for this course are currently being published by the academy. Please check back soon.
          </p>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {course.modules?.map((mod, modIdx) => {
            if (!mod) return null;
            const isOpen = expandedModules[mod.id] ?? false;
            const modLessons = Array.isArray(mod.lessons) ? mod.lessons.filter(Boolean) : [];
            const modCompletedCount = modLessons.filter((les) => accessMap.get(les.id)?.status === 'completed').length;
            const modTotal = modLessons.length || 1;
            const modProgress = Math.round((modCompletedCount / modTotal) * 100);

            return (
              <div key={mod.id || modIdx} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                {/* MODULE HEADER ACCORDION BUTTON */}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-3 bg-slate-50/90 hover:bg-slate-100/90 transition-all border-b border-slate-200/80 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl theme-soft flex items-center justify-center shrink-0 border border-slate-200/60">
                      <ListTree className="w-4 h-4" style={{ color: theme.primaryColor }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight leading-snug break-words">
                        {mod.title || `Module ${modIdx + 1}`}
                      </h2>
                      <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                        {modCompletedCount} of {modLessons.length} Completed • {modProgress}% Progress
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 flex items-center justify-center shrink-0 text-slate-400">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* MODULE LESSON ROWS */}
                {isOpen && (
                  <div className="divide-y divide-slate-100">
                    {modLessons.map((les, lesIdx) => {
                      if (!les) return null;
                      const access = accessMap.get(les.id);
                      const canAccess = access?.canAccess ?? true;
                      const status = access?.status || 'unlocked';
                      const isLocked = !canAccess;

                      const preview = resolveLessonPreview(les);

                      return (
                        <div
                          key={les.id || lesIdx}
                          onClick={() => handleLessonClick(les)}
                          className={`p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 transition-colors cursor-pointer ${
                            status === 'in_progress'
                              ? 'bg-blue-50/40 border-l-4 border-l-blue-600'
                              : isLocked
                              ? 'bg-slate-50/50 hover:bg-slate-50'
                              : 'hover:bg-slate-50/80 bg-white'
                          }`}
                        >
                          {/* THUMBNAIL PREVIEW & TITLE DETAILS */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* LIGHTWEIGHT THUMBNAIL PREVIEW */}
                            <div className="w-20 sm:w-24 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200 relative group">
                              <img
                                src={preview.thumbnailUrl}
                                alt=""
                                loading="lazy"
                                className={`w-full h-full object-cover transition-opacity ${
                                  isLocked ? 'opacity-40 grayscale' : 'opacity-90 group-hover:opacity-100'
                                }`}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
                                {isLocked ? (
                                  <Lock className="w-4 h-4 text-white drop-shadow-xs" />
                                ) : (
                                  renderTypeIcon(preview.type)
                                )}
                              </div>
                            </div>

                            {/* LESSON META INFO */}
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                  Lesson {modIdx + 1}.{lesIdx + 1}
                                </span>
                                {status === 'in_progress' && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800">
                                    Current Unit
                                  </span>
                                )}
                              </div>

                              <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug break-words">
                                {les.title || 'Untitled Lesson'}
                              </h3>

                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium pt-0.5">
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                  {renderTypeIcon(preview.type)}
                                  <span>{preview.label}</span>
                                </span>
                                {les.duration && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{les.duration}</span>
                                    </span>
                                  </>
                                )}
                                {preview.allowDownload && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                                      <Download className="w-3 h-3" />
                                      <span>Asset</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* STATUS BADGE & ACTION BUTTON */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            {status === 'completed' ? (
                              <LessonStatusBadge status="completed" />
                            ) : status === 'in_progress' ? (
                              <Button
                                size="sm"
                                className="w-full sm:w-auto font-semibold px-4 min-h-[40px] bg-blue-600 text-white rounded-xl shadow-xs cursor-pointer"
                                leftIcon={<PlayCircle className="w-4 h-4 text-white shrink-0" />}
                              >
                                Continue
                              </Button>
                            ) : isLocked ? (
                              <LessonStatusBadge status="locked" />
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full sm:w-auto font-semibold px-4 min-h-[40px] border-slate-200 text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer"
                              >
                                Start Unit
                              </Button>
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
