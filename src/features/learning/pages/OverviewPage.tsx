import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PlayCircle,
  BookOpen,
  Clock,
  Award,
  FileCheck,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Video,
  Bell,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useCourseStore } from '../../../stores/course.store';
import { useAcademyStore } from '../../../stores/academy.store';
import { useAuthStore } from '../../../stores/auth.store';
import { useEnrollmentStore } from '../../../stores/enrollment.store';
import { useLiveClassStore } from '../../../stores/live-class.store';
import { resolveLiveClassStatus, formatLiveClassDate, formatLiveClassTime } from '../../live-classes/utils/liveClassResolver';
import { LiveClassCard } from '../../live-classes/components/LiveClassCard';
import { useLearningStore } from '../../../stores/learning.store';
import { saveLastActiveCourse } from '../../../utils/last-active-course.utility';
import { resolveContinueLesson } from '../utils/resolveContinueLesson';
import { flattenCurriculum } from '../utils/flattenCurriculum';
import { getCourseWithResolvedCurriculum } from '../../../mocks/demoCourseCurriculum';

export const OverviewPage: React.FC = () => {
  const { academyUuid, courseUuid } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();

  const courses = useCourseStore((state) => state.courses);
  const academies = useAcademyStore((state) => state.academies);
  const student = useAuthStore((state) => state.student);
  const getEnrollment = useEnrollmentStore((state) => state.getEnrollment);
  const upgradeToFullAccess = useEnrollmentStore((state) => state.upgradeToFullAccess);

  const completedLessonIds = useLearningStore((state) => state.completedLessonIds);
  const watchPercentages = useLearningStore((state) => state.watchPercentages);
  const lastAccessedLessonUuid = useLearningStore((state) => state.lastAccessedLessonUuid);
  const setLastAccessedLessonUuid = useLearningStore((state) => state.setLastAccessedLessonUuid);

  const course = useMemo(() => {
    if (!academyUuid || !courseUuid) return undefined;
    const rawCourse = courses.find((c) => c.academyUuid === academyUuid && (c.uuid === courseUuid || c.courseUuid === courseUuid));
    return getCourseWithResolvedCurriculum(rawCourse, academyUuid, courseUuid);
  }, [courses, academyUuid, courseUuid]);

  const academy = useMemo(() => {
    if (!academyUuid) return undefined;
    return academies.find((a) => a.uuid === academyUuid);
  }, [academies, academyUuid]);

  const theme = academy?.theme || { primaryColor: '#2563EB' };
  const studentUuid = student?.uuid || 'std-production-1';

  const enrollments = useEnrollmentStore((state) => state.enrollments);

  const enrollment = useMemo(() => {
    if (!courseUuid) return undefined;
    const found = enrollments.find(
      (e) => (e.studentUuid === studentUuid || studentUuid === 'any') && e.courseUuid === courseUuid
    );
    if (found && found.accessType === 'demo' && found.expiresAt && Date.now() > new Date(found.expiresAt).getTime()) {
      return { ...found, status: 'expired' as const };
    }
    return found;
  }, [enrollments, studentUuid, courseUuid]);

  const isDemo = enrollment?.accessType === 'demo';

  // Null-safe continue lesson resolution
  const continueResolution = useMemo(() => {
    if (!course) return null;
    return resolveContinueLesson({
      course,
      enrollment,
      completedLessonIds,
      lastAccessedLessonUuid,
    });
  }, [course, enrollment, completedLessonIds, lastAccessedLessonUuid]);

  // Resolve nearest LiveClass session for this course safely
  const liveClasses = useLiveClassStore((state) => state.liveClasses);
  const nearestLiveClass = useMemo(() => {
    if (!courseUuid) return undefined;
    const courseLiveClasses = liveClasses.filter((item) => item.courseUuid === courseUuid);
    const liveNowClass = courseLiveClasses.find((s) => resolveLiveClassStatus(s) === 'LIVE_NOW');
    const upcomingClass = courseLiveClasses
      .filter((s) => resolveLiveClassStatus(s) === 'UPCOMING')
      .sort((a, b) => new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime())[0];
    return liveNowClass || upcomingClass;
  }, [liveClasses, courseUuid]);

  // Flattened curriculum calculation
  const flattenedCurriculum = useMemo(() => flattenCurriculum(course), [course]);
  const hasModules = Array.isArray(course?.modules) && course.modules.length > 0;
  const isCurriculumEmpty = course && (course.modules?.length === 0 || flattenedCurriculum.length === 0);

  // Dynamic Progress Calculation
  const progressMetrics = useMemo(() => {
    if (!course || flattenedCurriculum.length === 0) {
      return { totalAccessibleCount: 0, completedCount: 0, remainingCount: 0, progressPercent: 0 };
    }

    const allLessons = flattenedCurriculum.map(({ lesson }) => {
      const isAccessible =
        !isDemo ||
        lesson.isDemoAccessible === true ||
        lesson.title.includes('1.1') ||
        lesson.title.includes('1.2') ||
        lesson.id === 'les-3.2';
      return { id: lesson.id, title: lesson.title, isAccessible };
    });

    const accessibleLessons = allLessons.filter((l) => l.isAccessible);
    const totalAccessibleCount = accessibleLessons.length || 1;
    const completedCount = accessibleLessons.filter(
      (l) =>
        Array.isArray(completedLessonIds) &&
        (completedLessonIds.includes(l.id) || completedLessonIds.includes(`les-${l.title.split(' ')[0]}`))
    ).length;

    const remainingCount = Math.max(0, totalAccessibleCount - completedCount);
    const progressPercent = Math.min(100, Math.round((completedCount / totalAccessibleCount) * 100));

    return { totalAccessibleCount, completedCount, remainingCount, progressPercent };
  }, [course, flattenedCurriculum, isDemo, completedLessonIds]);

  const handleContinueLearning = () => {
    if (!academyUuid || !courseUuid || !continueResolution) return;

    if (continueResolution.reason === 'demo_expired' || continueResolution.reason === 'demo_completed') {
      navigate(`/${academyUuid}/register?course=${courseUuid}&intent=full`);
      return;
    }

    if (continueResolution.lessonId) {
      saveLastActiveCourse(academyUuid, courseUuid);
      setLastAccessedLessonUuid(continueResolution.lessonId);
      navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/learn/${continueResolution.lessonId}`);
    } else {
      navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/learn`);
    }
  };

  const handleUpgradeToFull = async () => {
    if (!courseUuid) return;
    await upgradeToFullAccess(studentUuid, courseUuid);
    if (academyUuid) saveLastActiveCourse(academyUuid, courseUuid);
    window.location.reload();
  };

  // Route Param check / Missing course check
  if (!academyUuid || !courseUuid || !course) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center space-y-3 font-sans text-xs bg-white rounded-3xl border border-slate-200 shadow-2xs">
        <AlertCircle className="w-8 h-8 text-amber-500" />
        <h2 className="text-base font-bold text-slate-900">Course Content Unavailable</h2>
        <p className="text-slate-500">We could not locate the requested course details.</p>
        <Link
          to={academyUuid ? `/student/academies/${academyUuid}/courses` : '/student/academies'}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl"
        >
          Return to Course Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 font-sans text-xs text-left max-w-5xl mx-auto w-full px-1 sm:px-0">
      {/* 1. HERO COURSE HEADER BANNER */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs rounded-2xl sm:rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-stretch">
          {/* THUMBNAIL */}
          <div className="w-full md:w-64 h-44 sm:h-52 md:h-auto bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200/60 relative">
            <img
              src={course.thumbnail}
              alt={course.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            {isDemo && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500 text-slate-950 shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>Demo Access</span>
              </span>
            )}
          </div>

          {/* COURSE META DETAILS */}
          <div className="flex-1 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>{isDemo ? 'Demo Access (5-Day Trial)' : 'Full Lifetime Access'}</span>
                </span>
                <span className="text-slate-300 font-medium">•</span>
                <span className="text-slate-500 font-medium text-xs">{course.level || 'Intermediate'}</span>
                <span className="text-slate-300 font-medium">•</span>
                <span className="text-slate-500 font-medium text-xs">{course.language || 'English'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight leading-snug break-words min-w-0">
                {course.title}
              </h1>

              <p className="text-xs text-slate-500 font-normal">
                Academy: <span className="font-medium text-slate-800">{academy?.name}</span> • Lead Instructor:{' '}
                <span className="font-medium text-slate-800">{course.instructorName || 'Dr. Vikramaditya Rao'}</span>
              </p>
            </div>

            {/* MAIN ACTIONS */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <Button
                onClick={handleContinueLearning}
                disabled={!continueResolution}
                className={`w-full font-semibold justify-center text-white min-h-[48px] rounded-xl shadow-xs ${
                  !continueResolution ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                leftIcon={<PlayCircle className="w-4.5 h-4.5 text-white shrink-0" />}
                style={{ backgroundColor: theme.primaryColor }}
              >
                {isCurriculumEmpty
                  ? 'Curriculum Unavailable'
                  : continueResolution?.reason === 'demo_completed' || continueResolution?.reason === 'demo_expired'
                  ? 'Upgrade to Full Course'
                  : 'Continue Learning'}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/curriculum`)}
                leftIcon={<BookOpen className="w-4.5 h-4.5 text-slate-600 shrink-0" />}
                className="w-full font-semibold justify-center min-h-[48px] rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                View Curriculum
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* LIVE CLASS BANNER CARD */}
      {nearestLiveClass && (
        <LiveClassCard
          liveClass={nearestLiveClass}
          onJoin={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/live-classes`)}
        />
      )}

      {/* 2. DYNAMIC PROGRESS SUMMARY CARD */}
      <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Your Learning Progress</h2>
            <p className="text-xs text-slate-500 font-normal">
              {isDemo ? 'Calculated from demo-accessible course lessons' : 'Overall course completion metrics'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900" style={{ color: theme.primaryColor }}>
              {progressMetrics.progressPercent}%
            </span>
          </div>
        </div>

        {/* ACCESSIBLE PROGRESS BAR */}
        <div className="space-y-1.5">
          <div
            role="progressbar"
            aria-valuenow={progressMetrics.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-3 rounded-full bg-slate-100 overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressMetrics.progressPercent}%`, backgroundColor: theme.primaryColor }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>{progressMetrics.completedCount} of {progressMetrics.totalAccessibleCount} lessons completed</span>
            <span>{progressMetrics.remainingCount} remaining</span>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center space-y-1">
            <BookOpen className="w-4 h-4 mx-auto text-slate-600" />
            <span className="text-sm sm:text-base font-semibold text-slate-900 block leading-tight">
              {progressMetrics.completedCount} / {progressMetrics.totalAccessibleCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Completed</span>
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center space-y-1">
            <Clock className="w-4 h-4 mx-auto text-slate-600" />
            <span className="text-sm sm:text-base font-semibold text-slate-900 block leading-tight">14.5 Hours</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Learning Time</span>
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center space-y-1">
            <FileCheck className="w-4 h-4 mx-auto text-slate-600" />
            <span className="text-sm sm:text-base font-semibold text-slate-900 block leading-tight">1 Pending</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Assignments</span>
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center space-y-1">
            <Award className="w-4 h-4 mx-auto text-slate-600" />
            <span className="text-sm sm:text-base font-semibold text-slate-900 block leading-tight">
              {isDemo ? 'Requires Full' : 'Eligible'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Certificate</span>
          </div>
        </div>
      </Card>

      {/* 3. NEXT LESSON PREVIEW / SPOTLIGHT CARD */}
      <Card padding="md" className="bg-white border border-slate-200/80 space-y-4 rounded-2xl sm:rounded-3xl shadow-2xs">
        {isCurriculumEmpty ? (
          /* STATE: EMPTY CURRICULUM */
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2 text-center">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
            <span className="font-semibold text-sm sm:text-base block text-slate-900">Course content is not available yet.</span>
            <p className="text-xs text-slate-500 font-normal">
              The instructor is currently preparing curriculum modules for <span className="font-medium">{course.title}</span>. Please check back later.
            </p>
          </div>
        ) : continueResolution?.reason === 'demo_expired' ? (
          /* STATE: DEMO EXPIRED */
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <span className="font-semibold text-sm sm:text-base block">Demo Access Expired</span>
                <p className="text-xs text-amber-900 leading-relaxed font-normal">
                  Your 5-day demo period for <span className="font-medium">{course.title}</span> has ended. Upgrade to full course access to unlock all lessons and certificates.
                </p>
              </div>
            </div>
            <Button
              onClick={handleUpgradeToFull}
              style={{ backgroundColor: theme.primaryColor }}
              className="w-full sm:w-auto font-semibold justify-center text-white min-h-[44px] px-6 rounded-xl cursor-pointer"
            >
              Enroll Full Course Now
            </Button>
          </div>
        ) : continueResolution?.reason === 'demo_completed' ? (
          /* STATE: DEMO COMPLETED */
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <span className="font-semibold text-sm sm:text-base block">Demo Lessons Completed!</span>
                <p className="text-xs text-blue-900 leading-relaxed font-normal">
                  You have completed all available demo lessons in this course. Upgrade to full access to unlock the complete curriculum.
                </p>
              </div>
            </div>
            <Button
              onClick={handleUpgradeToFull}
              style={{ backgroundColor: theme.primaryColor }}
              className="w-full sm:w-auto font-semibold justify-center text-white min-h-[44px] px-6 rounded-xl cursor-pointer"
            >
              Unlock Complete Course
            </Button>
          </div>
        ) : continueResolution?.reason === 'course_completed' ? (
          /* STATE: FULL COURSE COMPLETED */
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <span className="font-semibold text-sm sm:text-base block">Course Completed!</span>
                <p className="text-xs text-emerald-900 leading-relaxed font-normal">
                  Congratulations! You have completed all lessons in <span className="font-medium">{course.title}</span>. Claim your official verified certificate below.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/certificates`)}
                style={{ backgroundColor: theme.primaryColor }}
                className="w-full sm:w-auto font-semibold justify-center text-white min-h-[44px] px-6 rounded-xl cursor-pointer"
                leftIcon={<Award className="w-4 h-4 text-white shrink-0" />}
              >
                View Certificate
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/curriculum`)}
                className="w-full sm:w-auto font-semibold justify-center min-h-[44px] px-6 rounded-xl border-slate-200 text-slate-700 cursor-pointer"
              >
                Review Curriculum
              </Button>
            </div>
          </div>
        ) : (
          /* STATE: NEXT LESSON SPOTLIGHT PREVIEW */
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
              <span className="font-medium text-[11px] text-slate-400 uppercase tracking-wider">
                Up Next in Your Course
              </span>
              <span className="text-xs font-semibold" style={{ color: theme.primaryColor }}>
                Resume Position: {continueResolution?.lessonId && watchPercentages[continueResolution.lessonId] ? `${watchPercentages[continueResolution.lessonId]}% Watched` : 'Ready to Start'}
              </span>
            </div>

            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="text-[11px] font-medium text-slate-500 block truncate">
                  {continueResolution?.moduleTitle || 'Module 1'}
                </span>
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 leading-snug break-words">
                  {continueResolution?.lessonTitle || 'Lesson Content'}
                </h3>
                <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-600 font-medium">
                  <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                    <Video className="w-4 h-4 shrink-0" />
                    <span>Video Lesson</span>
                  </span>
                  {continueResolution?.duration && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{continueResolution.duration}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleContinueLearning}
                disabled={!continueResolution}
                leftIcon={<PlayCircle className="w-4 h-4 text-white shrink-0" />}
                style={{ backgroundColor: theme.primaryColor }}
                className={`w-full sm:w-auto font-semibold justify-center min-h-[44px] px-5 rounded-xl text-white shadow-xs cursor-pointer shrink-0 ${
                  !continueResolution ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Continue Learning
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 4. RECENT ACTIVITY & NOTIFICATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="font-semibold text-xs text-slate-900">Recent Course Activity</span>
            <span className="text-[11px] font-medium text-slate-400">Live Sync</span>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate">Completed 1.3 Server Components Overview</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 shrink-0">Today</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <PlayCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate">Watched 1.2 Actions and Async State</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 shrink-0">Yesterday</span>
            </div>
          </div>
        </Card>

        <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="font-semibold text-xs text-slate-900">Course Notices &amp; Updates</span>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs flex items-start gap-2.5">
              <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-semibold text-slate-900 block">Live Q&amp;A Session Scheduled</span>
                <span className="text-[11px] text-slate-500 font-normal block">Join Dr. Rao this Thursday at 6 PM IST</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
