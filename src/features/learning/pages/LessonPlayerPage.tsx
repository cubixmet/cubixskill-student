import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layers, ListTree, Lock } from 'lucide-react';
import { studentPortalService } from '../../../services/studentPortal.service';
import { UnifiedLessonPlayer } from '../components/UnifiedLessonPlayer';
import { LessonSidebar } from '../components/LessonSidebar';
import { Button } from '../../../components/ui/Button';
import { StudentStateCard } from '../../../components/ui/StudentStateCard';
import { resolveLessonType } from '../utils/mediaResolver';
import { useStudentCourseCurriculum } from '../hooks/useStudentCourseCurriculum';
import { calculateLessonAccessMap } from '../utils/unlockResolver';

export const LessonPlayerPage: React.FC = () => {
  const { academyUuid, courseUuid, lessonId: paramLessonId } = useParams<{
    academyUuid?: string;
    courseUuid?: string;
    lessonId?: string;
  }>();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { isLoading, error, modules, allLessons, enrollment, progress, refetch } =
    useStudentCourseCurriculum(academyUuid, courseUuid);

  const [selectedLessonSummary, setSelectedLessonSummary] = useState<any>(null);
  const [selectedLessonDetail, setSelectedLessonDetail] = useState<any>(null);
  const [lessonLockError, setLessonLockError] = useState<{ isLocked: boolean; message?: string; requiredLesson?: any } | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const queryLessonId = searchParams.get('lesson') || paramLessonId;

  // Determine active summary lesson from URL query/params or default to first uncompleted lesson
  useEffect(() => {
    if (allLessons.length === 0) return;

    let target = allLessons.find(
      (l) => String(l.id) === String(queryLessonId) || String(l.uuid) === String(queryLessonId)
    );
    if (!target) {
      target = allLessons.find((l) => !l.completed && !l.is_completed && l.unlocked !== false) || allLessons[0];
    }
    setSelectedLessonSummary(target);
    setLessonLockError(null);
  }, [queryLessonId, allLessons]);

  // Fetch Full Selected Lesson Detail on selection change
  useEffect(() => {
    if (!academyUuid || !courseUuid || !selectedLessonSummary?.id) return;
    let isMounted = true;

    setIsLoadingDetail(true);
    setSelectedLessonDetail(null);
    setLessonLockError(null);

    // If summary already indicates locked by backend
    if (selectedLessonSummary.unlocked === false) {
      setLessonLockError({
        isLocked: true,
        message: 'Complete the previous lesson to unlock this lesson.',
        requiredLesson: selectedLessonSummary.required_lesson,
      });
      setIsLoadingDetail(false);
      return;
    }

    studentPortalService
      .getLessonDetail(academyUuid, courseUuid, selectedLessonSummary.id)
      .then((res) => {
        if (!isMounted) return;
        const detailObj = res?.lesson || res;
        setSelectedLessonDetail(detailObj);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        if (err?.code === 'LESSON_LOCKED' || err?.response?.data?.code === 'LESSON_LOCKED' || err?.status === 403) {
          const errData = err?.response?.data || err;
          setLessonLockError({
            isLocked: true,
            message: errData?.detail || 'Complete the previous lesson to unlock this lesson.',
            requiredLesson: errData?.required_lesson || selectedLessonSummary?.required_lesson,
          });
        } else {
          console.warn('Using summary lesson info:', err);
          setSelectedLessonDetail(selectedLessonSummary);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingDetail(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [academyUuid, courseUuid, selectedLessonSummary?.id]);

  const activeIndex = selectedLessonSummary
    ? allLessons.findIndex((l) => String(l.id) === String(selectedLessonSummary.id))
    : -1;
  const prevLessonId = activeIndex > 0 ? allLessons[activeIndex - 1]?.id : undefined;
  const nextLessonId = activeIndex !== -1 && activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1]?.id : undefined;

  const handleNavigateLesson = (newLessonId: string) => {
    if (!academyUuid || !courseUuid) return;
    const target = allLessons.find((l) => String(l.id) === String(newLessonId));
    if (target) {
      setSelectedLessonSummary(target);
    }
    navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/learn?lesson=${newLessonId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkComplete = async () => {
    const targetId = selectedLessonSummary?.id;
    if (!academyUuid || !courseUuid || !targetId || isCompleting) return;

    setIsCompleting(true);
    try {
      const res = await studentPortalService.markLessonComplete(academyUuid, courseUuid, targetId);
      if (res && (res.success || res.course_progress_percent !== undefined)) {
        await refetch();
        setSelectedLessonSummary((prev: any) => (prev ? { ...prev, completed: true, is_completed: true } : prev));
        setSelectedLessonDetail((prev: any) => (prev ? { ...prev, completed: true, is_completed: true } : prev));
        if (res.next_lesson?.id) {
          handleNavigateLesson(res.next_lesson.id);
        }
      }
    } catch (_) {
      // Error handling
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 w-full min-h-[300px] flex items-center justify-center font-sans text-xs">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-3 border-[var(--brand-primary,#2563EB)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--text-muted)] font-medium">Loading Course Player...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 w-full min-h-[300px] flex items-center justify-center">
        <StudentStateCard
          variant="error"
          title="Unable to Load Course Player"
          description={error || 'We could not load course details right now.'}
          actionLabel="Back to Course Overview"
          actionPath={
            academyUuid && courseUuid
              ? `/student/academies/${academyUuid}/courses/${courseUuid}/overview`
              : '/student/academies'
          }
        />
      </div>
    );
  }

  if (allLessons.length === 0 || !selectedLessonSummary) {
    return (
      <div className="py-8 w-full min-h-[300px] flex items-center justify-center">
        <StudentStateCard
          variant="empty"
          title="Course Content Not Published Yet"
          description="This course does not currently contain published lessons."
          actionLabel="Back to Course Overview"
          actionPath={`/student/academies/${academyUuid}/courses/${courseUuid}/overview`}
        />
      </div>
    );
  }

  const activeLessonObj = selectedLessonDetail || selectedLessonSummary;

  const courseLessonObj = {
    id: activeLessonObj.id || activeLessonObj.uuid,
    uuid: activeLessonObj.uuid || activeLessonObj.id,
    title: activeLessonObj.title || selectedLessonSummary.title,
    description: activeLessonObj.description || activeLessonObj.content || selectedLessonSummary.description || '',
    content: activeLessonObj.content || activeLessonObj.description,
    lesson_type: activeLessonObj.lesson_type || selectedLessonSummary.lesson_type,
    type: resolveLessonType(activeLessonObj),
    duration: activeLessonObj.duration_minutes ? `${activeLessonObj.duration_minutes} min` : undefined,
    durationMinutes: activeLessonObj.duration_minutes || 0,
    mediaUrl: activeLessonObj.media_url || activeLessonObj.external_url || '',
    externalUrl: activeLessonObj.external_url || '',
    allowDownload: activeLessonObj.allow_download ?? true,
    quiz: activeLessonObj.quiz,
    assignment: activeLessonObj.assignment,
    resources: activeLessonObj.resources || [],
  };

  const isCurrentLessonCompleted = Boolean(activeLessonObj.completed || activeLessonObj.is_completed);

  // Compute unlock access map for sidebar
  const courseStoreModules: any[] = modules.map((m) => ({
    id: m.id,
    title: m.title,
    duration: '',
    lessonsCount: m.lessons.length,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      duration: l.duration_minutes ? `${l.duration_minutes} min` : '',
      type: resolveLessonType(l),
      isUnlocked: l.unlocked ?? true,
      unlocked: l.unlocked ?? true,
      completed: Boolean(l.completed || l.is_completed),
      lock_reason: l.lock_reason,
      required_lesson: l.required_lesson,
    })),
  }));

  const accessMap = calculateLessonAccessMap({
    course: { modules: courseStoreModules } as any,
    enrollment,
  });

  const isSelectedLocked = lessonLockError?.isLocked || selectedLessonSummary?.unlocked === false;

  return (
    <div className="pb-12 hide-scrollbar font-sans text-xs max-w-7xl mx-auto space-y-4 text-left">
      {/* MOBILE TOP BAR FOR CURRICULUM DRAWER TOGGLE */}
      <div className="flex lg:hidden items-center justify-between p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-[var(--brand-primary,#2563EB)] shrink-0" />
          <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
            {selectedLessonSummary.title}
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setMobileDrawerOpen(true)}
          leftIcon={<ListTree className="w-4 h-4 text-[var(--brand-primary,#2563EB)] shrink-0" />}
          className="font-semibold px-3 min-h-[38px] border-[var(--border)] text-[var(--text-primary)] shrink-0 cursor-pointer"
        >
          Curriculum
        </Button>
      </div>

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="lg:flex lg:gap-6 lg:items-start">
        {/* MAIN LESSON PLAYER AREA */}
        <div className="flex-1 min-w-0 space-y-4">
          {isLoadingDetail ? (
            <div className="w-full aspect-video rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-[var(--brand-primary,#2563EB)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--text-muted)] font-medium text-xs">Loading unit details...</p>
            </div>
          ) : isSelectedLocked ? (
            <div className="w-full aspect-video rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h2 className="text-base font-bold text-[var(--text-primary)]">Lesson Locked</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {lessonLockError?.message || 'Complete the previous lesson to unlock this lesson.'}
                </p>
                {lessonLockError?.requiredLesson && (
                  <p className="text-xs font-semibold text-[var(--brand-primary,#2563EB)] pt-1">
                    Prerequisite: "{lessonLockError.requiredLesson.title}"
                  </p>
                )}
              </div>
              {lessonLockError?.requiredLesson?.id && (
                <Button
                  size="sm"
                  onClick={() => handleNavigateLesson(lessonLockError.requiredLesson.id)}
                  className="bg-[var(--brand-primary,#2563EB)] text-white hover:bg-[var(--brand-primary-hover)] font-semibold cursor-pointer"
                >
                  Go to Required Lesson
                </Button>
              )}
            </div>
          ) : (
            <UnifiedLessonPlayer
              lesson={courseLessonObj as any}
              moduleTitle={selectedLessonSummary.moduleTitle}
              academyUuid={academyUuid!}
              courseUuid={courseUuid!}
              enrollment={enrollment}
              isCompleted={isCurrentLessonCompleted}
              canAccess={true}
              onMarkComplete={handleMarkComplete}
              prevLessonId={prevLessonId}
              nextLessonId={nextLessonId}
              onNavigateLesson={handleNavigateLesson}
            />
          )}
        </div>

        {/* DESKTOP CURRICULUM SIDEBAR */}
        <div className="hidden lg:block w-80 shrink-0 sticky top-20">
          <LessonSidebar
            modules={courseStoreModules}
            activeLessonId={String(selectedLessonSummary.id)}
            accessMap={accessMap}
            onSelectLesson={handleNavigateLesson}
          />
        </div>
      </div>

      {/* MOBILE CURRICULUM DRAWER MODAL */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-xs lg:hidden flex justify-end">
          <div className="w-full max-w-xs h-full bg-[var(--surface)] p-4 overflow-y-auto shadow-2xl">
            <LessonSidebar
              modules={courseStoreModules}
              activeLessonId={String(selectedLessonSummary.id)}
              accessMap={accessMap}
              onSelectLesson={handleNavigateLesson}
              isMobileDrawer={true}
              onCloseDrawer={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
