import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Hls from 'hls.js';
import {
  Clock,
  BookOpen,
  Users,
  PlayCircle,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Award,
  Globe,
  Star,
  Lock,
  AlertCircle,
  ArrowRight,
  X,
  FileText,
  HelpCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { usePublicAcademy } from '../layouts/PublicAcademyLayout';
import { useCourseStore } from '../../../stores/course.store';
import { useAuthStore } from '../../auth/store/auth.store';
import { Button } from '../../../components/ui/Button';
import { resolveVideoSource } from '../../learning/utils/videoResolver';
import { saveCheckoutIntent, buildLoginUrl, setLastAcademy } from '../../../lib/navigationIntent';
import { studentPortalService } from '../../../services/studentPortal.service';
import { resolveMediaUrl, apiClient } from '../../../services/apiClient';
import { CoursePrice } from '../../../components/common/CoursePrice';
import { buildStudentCourseOverviewPath, buildStudentCourseLearnPath, buildPublicAcademyCoursesPath } from '../../../utils/routeBuilder';

export const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { academyUuid, courseUuid } = useParams<{ academyUuid: string; courseUuid: string }>();
  const context = usePublicAcademy();
  const academyEntity = context?.academyEntity || {
    name: 'Academy',
    theme: { primaryColor: '#2563EB' },
  };

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authUser = useAuthStore((state) => state.user);
  const getCourseByUuid = useCourseStore((state) => state.getCourseByUuid);
  const fetchCourseDetail = useCourseStore((state) => state.fetchCourseDetail);

  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [demoPreviewLesson, setDemoPreviewLesson] = useState<any | null>(null);
  const [lockedNoticeLessonId, setLockedNoticeLessonId] = useState<string | null>(null);
  const [isSubmittingDemoLead, setIsSubmittingDemoLead] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const course = getCourseByUuid(courseUuid || '');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTriggerDemoLead = async (targetLesson?: any) => {
    if (!courseUuid || !academyUuid || isSubmittingDemoLead) return;
    const targetCourseUuid = course?.id || course?.uuid || courseUuid;

    if (!isAuthenticated) {
      const lesId = targetLesson ? (targetLesson.id || targetLesson.uuid) : '';
      const demoReturnUrl = lesId
        ? `/${academyUuid}/courses/${targetCourseUuid}?demoLesson=${lesId}`
        : `/${academyUuid}/courses/${targetCourseUuid}?demo=1`;
      navigate(buildLoginUrl(academyUuid, demoReturnUrl));
      return;
    }

    setIsSubmittingDemoLead(true);
    try {
      await apiClient.post('/api/v1/demo-leads/demo-leads/', {
        academy_id: academyUuid,
        course_id: targetCourseUuid,
        message: targetLesson ? `Requested demo for lesson: ${targetLesson.title}` : '',
      });
      showToast('Demo request submitted. Our team will contact you shortly.');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit demo request.');
    } finally {
      setIsSubmittingDemoLead(false);
    }
  };

  // Automatically submit Demo Lead if returning after successful login with demo intent
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hasDemoIntent = searchParams.get('demo') === '1';
    const demoLessonId = searchParams.get('demoLesson');

    if ((hasDemoIntent || demoLessonId) && isAuthenticated && course) {
      let targetLesson = null;
      if (demoLessonId) {
        const modules = (course as any)?.curriculum || course?.modules || [];
        for (const mod of modules) {
          const found = (mod.lessons || []).find((l: any) => String(l.id || l.uuid) === String(demoLessonId));
          if (found) {
            targetLesson = found;
            break;
          }
        }
      }

      // Clean up URL parameters after processing intent
      navigate(location.pathname, { replace: true });

      // Automatically post Demo Lead
      handleTriggerDemoLead(targetLesson);
    }
  }, [location.search, isAuthenticated, course]);

  const handleBuyNow = () => {
    if (!courseUuid || !academyUuid) return;
    const targetCourseUuid = course?.uuid || course?.id || courseUuid;

    if (isEnrolled) {
      const resumeLessonId = (course as any)?.resumeLessonId || (course as any)?.lastLessonId || (course as any)?.currentLessonId || (course as any)?.resume_lesson_id || (course as any)?.last_lesson_id || (course as any)?.current_lesson_id || null;
      navigate(buildStudentCourseLearnPath(academyUuid, targetCourseUuid, resumeLessonId));
      return;
    }

    const checkoutPath = `/${academyUuid}/checkout/${targetCourseUuid}`;

    if (isAuthenticated) {
      navigate(checkoutPath);
    } else {
      saveCheckoutIntent({ academyUuid, courseUuid: targetCourseUuid });
      navigate(buildLoginUrl(academyUuid, checkoutPath));
    }
  };

  if (isLoadingDetail && !course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-[#F8FAFC] dark:bg-[#0B1120]">
        <div className="p-8 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl max-w-md w-full space-y-4 shadow-xs">
          <BookOpen className="w-10 h-10 text-[#2563EB] animate-pulse mx-auto" />
          <h1 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Loading Course Details...</h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Fetching course information and curriculum details.</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-[#F8FAFC] dark:bg-[#0B1120]">
        <div className="p-8 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl max-w-md w-full space-y-4 shadow-xs">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Course Not Found</h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">The requested course is unavailable or may have been removed.</p>
          <Link
            to={buildPublicAcademyCoursesPath(academyUuid)}
            className="inline-flex items-center justify-center h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-xl text-xs transition-colors"
          >
            Back to Course Catalog
          </Link>
        </div>
      </div>
    );
  }

  const primaryStyle = { backgroundColor: academyEntity.theme?.primaryColor || '#2563EB' };
  const coursePrice = Number(course.price || 0);

  const promoVideoRaw = (course as any).promoVideoUrl || (course as any).promo_video_url || (course as any).promo_video?.url || (course as any).promo_video;
  const promoVideoUrl = promoVideoRaw ? resolveMediaUrl(promoVideoRaw) : '';
  const rawThumb = course.thumbnail || (course as any).thumbnail_url;
  const thumbnailUrl = rawThumb ? resolveMediaUrl(rawThumb) : '';

  const whatYouWillLearn = (course as any).outcomes || [
    'Master key fundamental concepts and principles',
    'Build production-ready projects with real-world patterns',
    'Apply best practices for software engineering and design',
    'Understand advanced topics with hands-on exercises',
  ];

  const modulesList = (course as any).curriculum || course.modules || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 w-full min-w-0">
        
        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <Link to={buildPublicAcademyCoursesPath(academyUuid)} className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors">
            Courses
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium truncate max-w-xs">{course.title}</span>
        </nav>

        {/* TOP HERO CONTAINER */}
        <div className="bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-xs space-y-6 text-left">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {course.category && (
                <span className="px-2.5 py-1 rounded-md font-semibold bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] uppercase text-[10px]">
                  {course.category}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-md font-semibold bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] text-[10px]">
                {course.level || 'Intermediate'}
              </span>
              <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">
                Offered by <strong className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{academyEntity.name}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-snug break-words">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal leading-relaxed max-w-4xl">
              {(course as any).short_description || course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400 dark:text-[#64748B] shrink-0" />
                <span>Self-Paced Learning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400 dark:text-[#64748B] shrink-0" />
                <span>{modulesList.length} Modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400 dark:text-[#64748B] shrink-0" />
                <span>{course.language || 'English'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400 dark:text-[#64748B] shrink-0" />
                <span>Enrolled Learners</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full min-w-0">
          
          {/* MAIN CONTENT AREA (COLUMN 1 - 8 COLUMNS) */}
          <div className="lg:col-span-8 space-y-6 w-full min-w-0 text-left">
            
            {/* PROMO VIDEO SECTION */}
            {promoVideoUrl ? (
              <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                    <span>Course Promo Video</span>
                  </h2>
                  <span className="text-[11px] text-[#2563EB] dark:text-[#60A5FA] font-medium bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/50">
                    Official Course Preview
                  </span>
                </div>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                  <video
                    src={promoVideoUrl}
                    controls
                    poster={thumbnailUrl || undefined}
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            ) : thumbnailUrl && !imgFailed ? (
              <div className="bg-white dark:bg-[#111827] p-3 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-xs">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244]">
                  <img
                    src={thumbnailUrl}
                    alt={course.title}
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : null}

            {/* TABS NAVIGATION */}
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-xl p-1 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {(['overview', 'curriculum', 'instructor', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer capitalize shrink-0 ${
                    activeTab === tab
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#172033]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* WHAT YOU'LL LEARN */}
                <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
                  <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    What You'll Learn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {whatYouWillLearn.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#475569] dark:text-[#CBD5E1]">
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ABOUT THIS COURSE */}
                <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-3">
                  <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    About This Course
                  </h2>
                  <div className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed space-y-3 font-normal">
                    <p>{course.description || 'No detailed description available for this course.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CURRICULUM */}
            {activeTab === 'curriculum' && (
              <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#263244] pb-4">
                  <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Course Curriculum Preview
                  </h2>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {modulesList.length} Modules
                  </span>
                </div>

                {modulesList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                    No curriculum modules published yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modulesList.map((mod: any, idx: number) => {
                      const modId = String(mod.id || idx);
                      const isOpen = activeModuleId === modId || activeModuleId === String(idx);
                      const lessons = mod.lessons || [];

                      return (
                        <div key={modId} className="border border-[#E2E8F0] dark:border-[#263244] rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setActiveModuleId(isOpen ? null : modId)}
                            className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#172033] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] transition-colors cursor-pointer text-left"
                          >
                            <span className="truncate pr-2">{mod.title || `Module ${idx + 1}`}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal">
                                {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#2563EB] dark:text-[#60A5FA]' : ''}`} />
                            </div>
                          </button>

                          {isOpen && (
                            <div className="p-3 space-y-1.5 bg-white dark:bg-[#111827] border-t border-[#E2E8F0] dark:border-[#263244]">
                              {lessons.length === 0 ? (
                                <div className="p-4 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                                  No lessons published in this module yet.
                                </div>
                              ) : (
                                 lessons.map((les: any, lIdx: number) => {
                                  const lesId = String(les.id || lIdx);
                                  const isDemoLesson = Boolean(
                                    les.is_demo === true ||
                                    les.is_preview === true ||
                                    les.preview_available === true ||
                                    les.isPreview === true ||
                                    les.isDemo === true ||
                                    les.isDemoAccessible === true ||
                                    les.locked === false
                                  );

                                  const publicAccessState: 'PREVIEW' | 'PREVIEW_PROCESSING' | 'LOCKED' =
                                    les.public_access_state ||
                                    (isDemoLesson
                                      ? les.is_processing || les.processing_mode === 'processing'
                                        ? 'PREVIEW_PROCESSING'
                                        : 'PREVIEW'
                                      : 'LOCKED');

                                  const isLocked = publicAccessState === 'LOCKED';
                                  const isProcessing = publicAccessState === 'PREVIEW_PROCESSING';
                                  const showNotice = lockedNoticeLessonId === lesId;

                                  const rawThumb = les.thumbnail_url || les.thumbnailUrl || les.thumbnail;
                                  const resolvedThumb = rawThumb ? resolveMediaUrl(rawThumb) : '';

                                  let LessonIcon = PlayCircle;
                                  const typeLower = (les.lesson_type || les.type || '').toLowerCase();
                                  if (typeLower === 'document' || typeLower === 'pdf' || typeLower === 'text') {
                                    LessonIcon = FileText;
                                  } else if (typeLower === 'quiz' || typeLower === 'test') {
                                    LessonIcon = HelpCircle;
                                  }

                                  const seqLabel = `Lesson ${idx + 1}.${lIdx + 1}`;
                                  const typeLabel = (les.lesson_type || 'Video').toUpperCase();

                                  return (
                                    <div key={lesId} className="space-y-1.5">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-[#1E293B] bg-white dark:bg-[#111827] text-xs text-[#475569] dark:text-[#CBD5E1] transition-all gap-3 shadow-2xs">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                          {/* LESSON THUMBNAIL BOX */}
                                          <div className="relative w-20 sm:w-28 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-[#263244] flex items-center justify-center">
                                            {resolvedThumb ? (
                                              <img
                                                src={resolvedThumb}
                                                alt={les.title}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-[#172033] text-slate-400">
                                                <LessonIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                              </div>
                                            )}

                                            {/* THUMBNAIL OVERLAY */}
                                            {isLocked ? (
                                              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-0.5 pointer-events-none">
                                                <Lock className="w-4 h-4 text-amber-400" />
                                                <span className="text-[9px] tracking-wide uppercase">Locked</span>
                                              </div>
                                            ) : isProcessing ? (
                                              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-0.5 pointer-events-none">
                                                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                                <span className="text-[8px] tracking-wide uppercase text-blue-300">Preparing</span>
                                              </div>
                                            ) : (
                                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#2563EB] text-white shadow-xs">
                                                DEMO
                                              </span>
                                            )}
                                          </div>

                                          {/* LESSON METADATA & TITLE */}
                                          <div className="space-y-0.5 min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] flex-wrap">
                                              <span>{seqLabel}</span>
                                              <span>•</span>
                                              <span>{typeLabel}</span>
                                              {les.duration_minutes ? (
                                                <>
                                                  <span>•</span>
                                                  <span>{les.duration_minutes} mins</span>
                                                </>
                                              ) : null}
                                            </div>
                                            <h4 className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate leading-snug">
                                              {les.title}
                                            </h4>
                                          </div>
                                        </div>

                                        {/* RIGHT ACTION BUTTON */}
                                        <div className="flex items-center justify-end shrink-0 sm:ml-2">
                                          {isProcessing ? (
                                            <div className="px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5">
                                              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                              <span>Preparing</span>
                                            </div>
                                          ) : !isLocked ? (
                                            <button
                                              type="button"
                                              onClick={() => setDemoPreviewLesson(les)}
                                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors shadow-2xs min-h-[34px] cursor-pointer"
                                            >
                                              <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                                              <span className="leading-none">Preview</span>
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => setLockedNoticeLessonId(showNotice ? null : lesId)}
                                              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#263244] bg-slate-50 dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-600 dark:text-[#CBD5E1] text-xs font-semibold transition-colors min-h-[34px] cursor-pointer"
                                            >
                                              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                              <span className="leading-none">Locked</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* LOCKED LESSON PROMPT NOTICE */}
                                      {showNotice && (
                                        <div className="ml-2 sm:ml-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                                          <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                            <span>Enroll in this course to access this lesson and all course materials.</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={handleBuyNow}
                                            style={primaryStyle}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0 cursor-pointer shadow-2xs hover:opacity-95 transition-opacity"
                                          >
                                            Enroll Now
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: INSTRUCTOR */}
            {activeTab === 'instructor' && (
              <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
                <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Lead Instructor
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-200 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] font-bold text-lg flex items-center justify-center shrink-0">
                    {(course as any).instructor?.full_name?.charAt(0) || 'I'}
                  </div>
                  <div className="space-y-1 text-xs">
                    <h3 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                      {(course as any).instructor?.full_name || 'Academy Instructor'}
                    </h3>
                    <p className="text-[#64748B] dark:text-[#94A3B8] font-medium">Senior Educator &amp; Domain Expert</p>
                    <p className="text-[#475569] dark:text-[#CBD5E1] pt-2 leading-relaxed">
                      Passionate educator committed to helping students master concepts through practical exercises and real-world examples.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
                <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Student Reviews
                </h2>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] flex items-center gap-3 text-xs">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">4.9 / 5.0 Rating</span>
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Based on student feedback in {academyEntity.name}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR ENROLLMENT CARD (COLUMN 2 - 4 COLUMNS) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 w-full min-w-0 text-left">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] dark:border-[#263244] shadow-md space-y-5">
              
              {/* PRICING DISPLAY */}
              <div className="pt-1 pb-1">
                <CoursePrice course={course} size="lg" showDiscountBadge />
              </div>

              {/* ACTION BUTTON */}
              <div className="space-y-2.5">
                {isEnrolled ? (
                  <Button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold text-white py-3 rounded-xl shadow-2xs cursor-pointer min-h-[44px]"
                    style={primaryStyle}
                  >
                    <span className="leading-none">Continue Learning</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={handleBuyNow}
                      className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold text-white py-3 rounded-xl shadow-2xs cursor-pointer min-h-[44px]"
                      style={primaryStyle}
                    >
                      <span className="leading-none">{coursePrice === 0 ? 'Enroll for Free' : 'Enroll in Course'}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Button>
                  </>
                )}
              </div>

              {/* COURSE INCLUDES */}
              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#263244] space-y-2.5 text-xs text-[#475569] dark:text-[#CBD5E1]">
                <h4 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs">This Course Includes:</h4>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                  <span>Full Lifetime Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                  <span>{modulesList.length} Learning Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                  <span>Verified Digital Certificate</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 pt-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-medium">30-Day Money-Back Guarantee</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DEMO LESSON PREVIEW MODAL */}
      {demoPreviewLesson && (
        <DemoPreviewModal
          lesson={demoPreviewLesson}
          onClose={() => setDemoPreviewLesson(null)}
          onEnroll={() => {
            setDemoPreviewLesson(null);
            handleBuyNow();
          }}
          primaryStyle={primaryStyle}
        />
      )}
    </div>
  );
};

// --- DEMO PREVIEW MODAL WITH REAL HLS PLAYBACK & PREVIEW LIMIT ENFORCEMENT ---
const DemoPreviewModal: React.FC<{
  lesson: any;
  onClose: () => void;
  onEnroll: () => void;
  primaryStyle: React.CSSProperties;
}> = ({ lesson, onClose, onEnroll, primaryStyle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPreviewEnded, setIsPreviewEnded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const processingMode = (lesson.processing_mode || lesson.primary_media?.processing_mode || '').toLowerCase();
  const processingStatus = (lesson.processing_status || lesson.primary_media?.processing_status || 'READY').toUpperCase();

  const videoSource = resolveVideoSource(lesson);
  const src = videoSource?.url || '';
  const isHls = videoSource?.kind === 'hls' || src.includes('.m3u8');

  const rawActualSecs = Number(lesson.duration_seconds) || (lesson.duration_minutes ? lesson.duration_minutes * 60 : 0);
  const previewLimitSecs = Number(lesson.preview_duration_seconds) ||
    (rawActualSecs > 0 ? (rawActualSecs > 300 ? 300 : Math.floor(rawActualSecs / 2)) : 300);

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    if (m === 0) return `${s}s`;
    if (s === 0) return `${m}m`;
    return `${m}m ${s}s`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || processingStatus === 'FAILED' || ['QUEUED', 'PENDING', 'PROCESSING'].includes(processingStatus)) return;

    setVideoError(null);

    if (isHls) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari / iOS)
        video.src = src;
      } else if (Hls.isSupported()) {
        // HLS.js for Chrome, Firefox, Edge
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          autoStartLoad: true,
          enableWorker: true,
        });
        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error('[HLS Preview Fatal Error]', data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('[HLS Preview] Network error encountered, attempting recovery...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('[HLS Preview] Media error encountered, attempting recovery...');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setVideoError('Unable to play HLS preview stream.');
                break;
            }
          }
        });

        return () => {
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
        };
      } else {
        setVideoError('HLS streaming is not supported in this browser.');
      }
    } else {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        try {
          video.pause();
          video.removeAttribute('src');
          video.load();
        } catch (_) {}
      }
    };
  }, [src, isHls, lesson.id, processingStatus]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoEl = e.currentTarget;
    if (previewLimitSecs > 0 && videoEl.currentTime >= previewLimitSecs) {
      videoEl.pause();
      videoEl.currentTime = previewLimitSecs;
      setIsPreviewEnded(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl text-left">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#263244]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-[#2563EB] dark:bg-blue-900/40 dark:text-blue-300 uppercase">
              Public Preview ({formatSecs(previewLimitSecs)})
            </span>
            <h3 className="font-semibold text-sm sm:text-base text-[#0F172A] dark:text-[#F8FAFC]">
              {lesson.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
          {processingMode === 'hls' && ['QUEUED', 'PENDING', 'PROCESSING'].includes(processingStatus) ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 space-y-3 p-6 text-center">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <h4 className="font-semibold text-xs text-slate-200">Preview is being prepared...</h4>
              <p className="text-[11px] text-slate-400 max-w-sm">
                The video stream is currently processing on the server. Please check back shortly.
              </p>
            </div>
          ) : processingStatus === 'FAILED' ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 space-y-3 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <h4 className="font-semibold text-xs text-slate-200">Video Processing Failed</h4>
              <p className="text-[11px] text-slate-400 max-w-sm">
                Video processing for this preview failed. Please contact support.
              </p>
            </div>
          ) : videoError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 space-y-3 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <h4 className="font-semibold text-xs text-slate-200">Unable to Play Video</h4>
              <p className="text-[11px] text-slate-400 max-w-sm">{videoError}</p>
            </div>
          ) : src ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              onTimeUpdate={handleTimeUpdate}
              poster={lesson.thumbnailUrl}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 space-y-2 p-6 text-center">
              <PlayCircle className="w-12 h-12 text-[#2563EB]" />
              <p className="text-xs">{lesson.description || 'Preview content ready for viewing.'}</p>
            </div>
          )}

          {/* PREVIEW END OVERLAY */}
          {isPreviewEnded && (
            <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-base font-bold text-white">Public Preview Ended</h4>
                <p className="text-xs text-slate-300">
                  You’ve reached the limit for this preview clip ({formatSecs(previewLimitSecs)}). Enroll in this course to continue watching the complete lesson.
                </p>
              </div>
              <Button
                type="button"
                onClick={onEnroll}
                style={primaryStyle}
                className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold text-white px-6 py-2.5 rounded-xl shadow-lg cursor-pointer hover:opacity-95"
              >
                <span className="leading-none">Enroll in Course</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {isPreviewEnded ? 'Enroll to unlock all modules & full video duration.' : `Preview limited to first ${formatSecs(previewLimitSecs)}.`}
          </span>
          <Button
            type="button"
            onClick={onEnroll}
            style={primaryStyle}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs text-white font-semibold px-5 py-2 rounded-xl cursor-pointer shadow-2xs"
          >
            <span className="leading-none">Enroll in Course</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
};
