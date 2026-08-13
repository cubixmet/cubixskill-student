import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Inbox, ListTree, Layers } from 'lucide-react';
import { useCourseStore } from '../../../stores/course.store';
import { useAcademyStore } from '../../../stores/academy.store';
import { useAuthStore } from '../../../stores/auth.store';
import { useEnrollmentStore } from '../../../stores/enrollment.store';
import { useLearningStore } from '../../../stores/learning.store';
import { UnifiedLessonPlayer } from '../components/UnifiedLessonPlayer';
import { LessonSidebar } from '../components/LessonSidebar';
import { saveLastActiveCourse } from '../../../utils/last-active-course.utility';
import { calculateLessonAccessMap } from '../utils/unlockResolver';
import { flattenCurriculum } from '../utils/flattenCurriculum';
import {
  isDemoCourseRoute,
  getCourseWithResolvedCurriculum,
  saveDemoProgressToStorage,
  clearDemoProgressStorage,
  studentLearnDemoModules,
} from '../../../mocks/studentLearnDemo';
import { Button } from '../../../components/ui/Button';

export const LessonPlayerPage: React.FC = () => {
  const { academyUuid, courseUuid, lessonId } = useParams<{
    academyUuid?: string;
    courseUuid?: string;
    lessonId?: string;
  }>();

  const navigate = useNavigate();

  const courses = useCourseStore((state) => state.courses);
  const academies = useAcademyStore((state) => state.academies);
  const student = useAuthStore((state) => state.student);
  const getEnrollment = useEnrollmentStore((state) => state.getEnrollment);

  const completedLessonIds = useLearningStore((state) => state.completedLessonIds);
  const markLessonComplete = useLearningStore((state) => state.markLessonComplete);
  const lastAccessedLessonUuid = useLearningStore((state) => state.lastAccessedLessonUuid);
  const setLastAccessedLessonUuid = useLearningStore((state) => state.setLastAccessedLessonUuid);

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isDemo = isDemoCourseRoute(academyUuid, courseUuid);

  const course = useMemo(() => {
    if (!academyUuid || !courseUuid) return undefined;
    const rawCourse = courses.find(
      (c) => c.academyUuid === academyUuid && (c.uuid === courseUuid || c.courseUuid === courseUuid)
    );
    // If rawCourse exists, resolve curriculum. If rawCourse doesn't exist but it's demo route, construct fallback demo CourseEntity.
    if (!rawCourse && isDemo) {
      return {
        id: 'crs-1',
        uuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
        courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
        academyUuid: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Full Stack React 19 & Cloud Architecture',
        subtitle: 'Build scalable web applications with Server Actions, Hydration, and Zustand',
        description: 'Master the Next Generation of React 19 compiler optimizations and App Router architecture.',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
        instructorName: 'Dr. Vikramaditya Rao',
        level: 'Intermediate' as const,
        language: 'English',
        progressPercent: 25,
        completedLessonsCount: 2,
        totalLessonsCount: 10,
        currentModuleTitle: 'Module 1: React 19 Foundations',
        currentLessonTitle: '1.2 React 19 Compiler Mechanics',
        lastActiveAt: 'Just now',
        accessExpiryDate: '2027-12-31',
        modules: studentLearnDemoModules,
        features: {
          assignments: true,
          quizzes: true,
          liveClasses: true,
          certificates: true,
          announcements: true,
          discussions: true,
        },
      };
    }
    return getCourseWithResolvedCurriculum(rawCourse, academyUuid, courseUuid);
  }, [courses, academyUuid, courseUuid, isDemo]);

  const academy = useMemo(() => {
    if (!academyUuid) return undefined;
    return academies.find((a) => a.uuid === academyUuid);
  }, [academies, academyUuid]);

  const studentUuid = student?.uuid || 'std-production-1';
  const enrollment = useMemo(() => {
    if (!courseUuid) return undefined;
    return getEnrollment(studentUuid, courseUuid);
  }, [getEnrollment, studentUuid, courseUuid]);

  // Calculate sequential lock states for all curriculum lessons safely
  const accessMap = useMemo(() => {
    if (!course) return new Map();
    return calculateLessonAccessMap({
      course,
      enrollment,
      completedLessonIds,
      lastAccessedLessonUuid,
    });
  }, [course, enrollment, completedLessonIds, lastAccessedLessonUuid]);

  // Flatten curriculum lessons safely
  const flattenedCurriculum = useMemo(() => flattenCurriculum(course), [course]);
  const orderedLessons = useMemo(() => {
    return flattenedCurriculum.map(({ module, lesson }) => ({
      lesson,
      moduleTitle: module.title || 'Module',
    }));
  }, [flattenedCurriculum]);

  // Requirement 4 & 23: Default active lesson when no lesson UUID is in route
  const defaultLessonId = isDemo ? 'mock-react19-compiler' : orderedLessons[0]?.lesson.id || '';
  const targetLessonId = lessonId || (isDemo ? 'mock-react19-compiler' : lastAccessedLessonUuid) || defaultLessonId;

  const activeIndex = useMemo(() => {
    if (!targetLessonId || orderedLessons.length === 0) return -1;
    return orderedLessons.findIndex(
      (item) => item.lesson.id === targetLessonId || item.lesson.title.includes(targetLessonId)
    );
  }, [orderedLessons, targetLessonId]);

  const activeItem = activeIndex !== -1 ? orderedLessons[activeIndex] : orderedLessons[0];
  const activeLesson = activeItem?.lesson;
  const moduleTitle = activeItem?.moduleTitle || 'Module 1';

  const prevLessonId = activeIndex > 0 ? orderedLessons[activeIndex - 1]?.lesson.id : undefined;
  const nextLessonId =
    activeIndex !== -1 && activeIndex < orderedLessons.length - 1
      ? orderedLessons[activeIndex + 1]?.lesson.id
      : undefined;

  const accessState = activeLesson ? accessMap.get(activeLesson.id) : undefined;
  const canAccess = accessState?.canAccess ?? true;
  const lockReason = accessState?.lockReason;

  useEffect(() => {
    if (activeLesson?.id && canAccess && academyUuid && courseUuid) {
      setLastAccessedLessonUuid(activeLesson.id);
      saveLastActiveCourse(academyUuid, courseUuid);
    }
  }, [activeLesson?.id, academyUuid, courseUuid, canAccess, setLastAccessedLessonUuid]);

  const handleNavigateLesson = (newLessonId: string) => {
    if (!academyUuid || !courseUuid) return;
    saveLastActiveCourse(academyUuid, courseUuid);
    setLastAccessedLessonUuid(newLessonId);
    navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/learn/${newLessonId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkComplete = () => {
    if (activeLesson?.id) {
      markLessonComplete(activeLesson.id);
      if (isDemo) {
        saveDemoProgressToStorage({
          completedLessonIds: [...completedLessonIds, activeLesson.id],
          lastAccessedLessonId: activeLesson.id,
        });
      }
    }
  };

  const handleResetDemoProgress = () => {
    if (isDemo) {
      clearDemoProgressStorage();
      window.location.reload();
    }
  };

  // Error handling if academy or course completely missing and NOT demo
  if (!isDemo && (!academyUuid || !courseUuid || !course)) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center space-y-3 font-sans text-xs bg-white rounded-3xl border border-slate-200 shadow-2xs">
        <AlertCircle className="w-8 h-8 text-amber-500" />
        <h2 className="text-base font-semibold text-slate-900">Course Content Unavailable</h2>
        <p className="text-slate-500 font-normal">We could not locate the requested course details.</p>
        <Link
          to={academyUuid ? `/student/academies/${academyUuid}/courses` : '/student/academies'}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl"
        >
          Return to Course Catalog
        </Link>
      </div>
    );
  }

  // Guarantee NO empty state for demo route!
  if (!activeLesson || orderedLessons.length === 0) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center space-y-3 font-sans text-xs bg-white rounded-3xl border border-slate-200 shadow-2xs">
        <Inbox className="w-8 h-8 text-slate-400" />
        <h2 className="text-base font-semibold text-slate-900">Course Lessons Unavailable</h2>
        <p className="text-slate-500 font-normal text-[11px]">This course currently has no published lesson content.</p>
        <Link
          to={`/student/academies/${academyUuid}/courses/${courseUuid}/overview`}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl"
        >
          Return to Course Overview
        </Link>
      </div>
    );
  }

  const isCompleted =
    Array.isArray(completedLessonIds) &&
    (completedLessonIds.includes(activeLesson.id) ||
      completedLessonIds.includes(`les-${activeLesson.title.split(' ')[0]}`));

  return (
    <div className="pb-12 hide-scrollbar font-sans text-xs max-w-7xl mx-auto space-y-4">
      {/* MOBILE TOP BAR FOR CURRICULUM DRAWER TOGGLE */}
      <div className="flex lg:hidden items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-xs text-slate-900 truncate">
            {activeLesson.title}
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setMobileDrawerOpen(true)}
          leftIcon={<ListTree className="w-4 h-4 text-blue-600 shrink-0" />}
          className="font-semibold px-3 min-h-[38px] border-slate-200 text-slate-800 shrink-0 cursor-pointer"
        >
          Curriculum
        </Button>
      </div>

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="lg:flex lg:gap-6 lg:items-start">
        {/* MAIN LESSON PLAYER AREA */}
        <div className="flex-1 min-w-0">
          <UnifiedLessonPlayer
            lesson={activeLesson}
            moduleTitle={moduleTitle}
            academyUuid={academyUuid || '550e8400-e29b-41d4-a716-446655440000'}
            courseUuid={courseUuid || '9c78bda1-98c2-4b11-8b81-92d3db12b501'}
            enrollment={enrollment}
            isCompleted={isCompleted}
            canAccess={canAccess}
            lockReason={lockReason}
            onMarkComplete={handleMarkComplete}
            prevLessonId={prevLessonId}
            nextLessonId={nextLessonId}
            onNavigateLesson={handleNavigateLesson}
          />
        </div>

        {/* DESKTOP SIDEBAR PANEL */}
        <div className="hidden lg:block w-80 shrink-0 sticky top-6">
          <LessonSidebar
            modules={course.modules || []}
            activeLessonId={activeLesson.id}
            accessMap={accessMap}
            onSelectLesson={handleNavigateLesson}
            onResetProgress={isDemo ? handleResetDemoProgress : undefined}
          />
        </div>
      </div>

      {/* MOBILE CURRICULUM DRAWER MODAL */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end lg:hidden font-sans">
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-4 space-y-4 animate-in slide-in-from-right duration-200">
            <LessonSidebar
              modules={course.modules || []}
              activeLessonId={activeLesson.id}
              accessMap={accessMap}
              onSelectLesson={handleNavigateLesson}
              onResetProgress={isDemo ? handleResetDemoProgress : undefined}
              isMobileDrawer={true}
              onCloseDrawer={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
