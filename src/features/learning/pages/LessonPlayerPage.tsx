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
import { resolveMediaUrl } from '../../../services/apiClient';
import { calculateLessonAccessMap } from '../utils/unlockResolver';
import { CongratulationsModal } from '../../certificates/components/CongratulationsModal';
import { useCourseStore } from '../../../stores/course.store';

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
        const rawResources = res?.resources || detailObj?.resources || [];
        const normalizedResources = Array.isArray(rawResources)
          ? rawResources.map((r: any, idx: number) => ({
              resourceUuid: String(r.id || r.resourceUuid || `res-${idx}`),
              academyUuid: academyUuid || '',
              courseUuid: courseUuid || '',
              lessonUuid: selectedLessonSummary.id,
              scope: 'lesson' as const,
              title: r.title || 'Resource Attachment',
              fileName: r.fileName || r.file_name || r.title || 'Attachment',
              fileUrl: resolveMediaUrl(r.url || r.file_url || r.fileUrl),
              mimeType: r.mimeType || r.mime_type || 'application/pdf',
              fileSize: r.fileSize || r.file_size || r.size_bytes || 0,
              allowView: r.allowView ?? r.allow_view ?? true,
              allowDownload: r.allowDownload ?? r.allow_download ?? true,
              status: 'active' as const,
              createdAt: r.created_at || new Date().toISOString(),
              updatedAt: r.updated_at || new Date().toISOString(),
            }))
          : [];

        setSelectedLessonDetail({
          ...detailObj,
          resources: normalizedResources,
        });
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

  const [congratulationsModal, setCongratulationsModal] = useState<{
    isOpen: boolean;
    courseTitle: string;
    certificateStatus?: string;
    missingFields?: any[];
    certificate?: any;
  }>({ isOpen: false, courseTitle: '' });

  const handleMarkComplete = async () => {
    const targetId = selectedLessonSummary?.id;
    if (!academyUuid || !courseUuid || !targetId || isCompleting) return;

    setIsCompleting(true);
    try {
      const res = await studentPortalService.markLessonComplete(academyUuid, courseUuid, targetId);
      if (res && (res.success || res.course_progress_percent !== undefined)) {
        await refetch();
        useCourseStore.getState().fetchCourses(academyUuid);
        setSelectedLessonSummary((prev: any) => (prev ? { ...prev, completed: true, is_completed: true } : prev));
        setSelectedLessonDetail((prev: any) => (prev ? { ...prev, completed: true, is_completed: true } : prev));

        if (res.course_just_completed || (res.course_completed && res.certificate_status)) {
          setCongratulationsModal({
            isOpen: true,
            courseTitle: res.course_title || selectedLessonSummary?.course_title || 'Course',
            certificateStatus: res.certificate_status || (res.certificate ? 'ISSUED' : 'NOT_ELIGIBLE'),
            missingFields: res.missing_fields || [],
            certificate: res.certificate || null,
          });
        }

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

  const activeLessonObj = selectedLessonDetail || selectedLessonSummary || null;

  if (!activeLessonObj) {
    return (
      <div className="py-8 w-full min-h-[300px] flex items-center justify-center">
        <StudentStateCard
          variant="empty"
          title="No Lesson Available"
          description="This course does not currently have an accessible lesson."
          actionLabel="Back to Course Overview"
          actionPath={`/student/academies/${academyUuid}/courses/${courseUuid}/overview`}
        />
      </div>
    );
  }

  const courseLessonObj = {
    ...activeLessonObj,
    id: String(activeLessonObj?.id || activeLessonObj?.uuid || ''),
    uuid: String(activeLessonObj?.uuid || activeLessonObj?.id || ''),
    title: activeLessonObj?.title || selectedLessonSummary?.title || 'Untitled Lesson',
    description: activeLessonObj?.description || activeLessonObj?.content || selectedLessonSummary?.description || '',
    content: activeLessonObj?.content || activeLessonObj?.description || '',
    lesson_type: activeLessonObj?.lesson_type || selectedLessonSummary?.lesson_type || 'VIDEO',
    type: resolveLessonType(activeLessonObj || {}),
    duration: activeLessonObj?.duration_minutes ? `${activeLessonObj.duration_minutes} min` : undefined,
    durationMinutes: Number(activeLessonObj?.duration_minutes || 0),

    stream_url:
      activeLessonObj?.stream_url ||
      activeLessonObj?.primary_media?.stream_url ||
      null,

    video_url:
      activeLessonObj?.video_url ||
      activeLessonObj?.primary_media?.video_url ||
      null,

    media_url:
      activeLessonObj?.media_url ||
      null,

    original_url:
      activeLessonObj?.original_url ||
      activeLessonObj?.primary_media?.original_url ||
      null,

    external_url:
      activeLessonObj?.external_url ||
      null,

    processing_mode:
      activeLessonObj?.processing_mode ||
      activeLessonObj?.primary_media?.processing_mode ||
      null,

    processing_status:
      activeLessonObj?.processing_status ||
      activeLessonObj?.primary_media?.processing_status ||
      null,

    primary_media:
      activeLessonObj?.primary_media || null,

    media_files:
      Array.isArray(activeLessonObj?.media_files)
        ? activeLessonObj.media_files
        : [],

    mediaUrl:
      activeLessonObj?.stream_url ||
      activeLessonObj?.video_url ||
      activeLessonObj?.media_url ||
      activeLessonObj?.external_url ||
      '',
    streamUrl: activeLessonObj?.stream_url || activeLessonObj?.primary_media?.stream_url || '',
    videoUrl: activeLessonObj?.video_url || activeLessonObj?.primary_media?.video_url || '',
    externalUrl: activeLessonObj?.external_url || '',
    allowDownload: activeLessonObj?.allow_download ?? true,
    quiz: activeLessonObj?.quiz || null,
    assignment: activeLessonObj?.assignment || null,
    resources: Array.isArray(activeLessonObj?.resources) ? activeLessonObj.resources : [],
  };

  const isCurrentLessonCompleted = Boolean(activeLessonObj.completed || activeLessonObj.is_completed);

  // Compute unlock access map for sidebar safely
  const courseStoreModules: any[] = (Array.isArray(modules) ? modules : []).map((m) => {
    const lessons = Array.isArray(m?.lessons) ? m.lessons : [];
    return {
      id: String(m?.id || m?.uuid || ''),
      uuid: String(m?.uuid || m?.id || ''),
      title: typeof m?.title === 'string' && m.title.trim() ? m.title : 'Untitled Module',
      duration: '',
      lessonsCount: lessons.length,
      lessons: lessons.map((l: any, index: number) => ({
        id: String(l?.id || l?.uuid || `lesson-${index}`),
        uuid: String(l?.uuid || l?.id || `lesson-${index}`),
        title: typeof l?.title === 'string' && l.title.trim() ? l.title : `Lesson ${index + 1}`,
        duration: l?.duration_minutes ? `${l.duration_minutes} min` : '',
        type: resolveLessonType(l || {}),
        isUnlocked: l?.unlocked !== false,
        unlocked: l?.unlocked !== false,
        completed: Boolean(l?.completed || l?.is_completed),
        lock_reason: l?.lock_reason || null,
        required_lesson: l?.required_lesson || null,
      })),
    };
  });

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

      <CongratulationsModal
        isOpen={congratulationsModal.isOpen}
        onClose={() => setCongratulationsModal((prev) => ({ ...prev, isOpen: false }))}
        courseTitle={congratulationsModal.courseTitle}
        certificateStatus={congratulationsModal.certificateStatus}
        missingFields={congratulationsModal.missingFields}
        certificate={congratulationsModal.certificate}
        onViewCertificate={() => {
          setCongratulationsModal((prev) => ({ ...prev, isOpen: false }));
          if (academyUuid && courseUuid) {
            navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/certificates`);
          }
        }}
        onDownloadCertificate={async () => {
          const certId = congratulationsModal.certificate?.id;
          setCongratulationsModal((prev) => ({ ...prev, isOpen: false }));
          if (certId) {
            try {
              const blob = await studentPortalService.getCertificatePdfBlob(certId);
              const fileName = `Certificate_${congratulationsModal.certificate?.certificate_number || certId}.pdf`;
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(url), 10000);
            } catch {
              if (academyUuid && courseUuid) {
                navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/certificates`);
              }
            }
          } else if (academyUuid && courseUuid) {
            navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/certificates`);
          }
        }}
        onCompleteProfile={() => {
          setCongratulationsModal((prev) => ({ ...prev, isOpen: false }));
          if (academyUuid && courseUuid) {
            navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/settings#certificate-details`);
          }
        }}
      />

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
