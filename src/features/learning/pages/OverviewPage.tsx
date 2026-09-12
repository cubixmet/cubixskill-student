import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PlayCircle,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StudentStateCard } from '../../../components/ui/StudentStateCard';
import { studentPortalService, type StudentCourseOverviewResponse } from '../../../services/studentPortal.service';
import { resolveMediaUrl } from '../../../services/apiClient';
import { CourseTabs } from '../components/CourseTabs';
import { LearningProgressCard } from '../components/LearningProgressCard';

import { buildStudentCourseLearnPath, buildStudentCourseCurriculumPath, isValidUuid } from '../../../utils/routeBuilder';
import { useCourseFeatures } from '../../../hooks/useCourseFeatures';
import { COURSE_FEATURE_KEYS } from '../../../constants/courseFeatures.constants';

const OverviewSkeleton: React.FC = () => (
  <div className="space-y-6 font-sans text-xs text-left max-w-5xl mx-auto w-full px-1 sm:px-0">
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-24 rounded-md" />
      <span className="text-slate-300">/</span>
      <Skeleton className="h-4 w-48 rounded-md" />
      <span className="text-slate-300">/</span>
      <Skeleton className="h-4 w-16 rounded-md" />
    </div>

    <Skeleton className="h-11 w-full rounded-xl" />

    <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs rounded-2xl p-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        <Skeleton className="w-full md:w-64 h-48 sm:h-52 rounded-xl shrink-0" />
        <div className="flex-1 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-[#263244] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </Card>

    <Skeleton className="h-28 w-full rounded-2xl" />
    <Skeleton className="h-56 w-full rounded-2xl" />
  </div>
);

export const OverviewPage: React.FC = () => {
  const { academyUuid, courseUuid } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();
  const { isFeatureEnabled } = useCourseFeatures(courseUuid);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<StudentCourseOverviewResponse | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) {
      setError('Invalid course link.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const loadOverview = async () => {
      try {
        const data = await studentPortalService.getCourseOverview(academyUuid!, courseUuid!);
        if (isMounted) {
          if (data) {
            setOverviewData(data);
          } else {
            setError('Could not locate course overview details.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          const msg = err?.message || err?.detail || 'Unable to load course overview.';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, [academyUuid, courseUuid, reloadToken]);

  // Safely extract properties with defaults matching real API schema
  const rawData: any = (overviewData as any)?.data || overviewData;

  const course = rawData?.course || null;
  const academy = rawData?.academy || null;
  const enrollment = rawData?.enrollment || null;
  const progress = rawData?.progress || null;

  const courseTitle = String(course?.title || 'Course Overview');
  const courseDescription = typeof course?.description === 'string' ? course.description : '';
  const courseLevel = String(course?.level || 'Intermediate');
  const courseLanguage = String(course?.language || 'English');
  const instructorName = String(course?.instructor_name || course?.instructorName || 'Senior Educator');
  const thumbnailPath = course?.thumbnail || course?.thumbnail_url || '';

  const percentageNum = Math.min(100, Math.max(0, Math.round(Number(progress?.percentage ?? 0))));
  const completedLessonsNum = Math.max(0, Math.round(Number(progress?.completed_lessons ?? 0)));
  const totalLessonsNum = Math.max(0, Math.round(Number(progress?.total_lessons ?? 0)));
  const accessType = String(enrollment?.access_type || 'full');
  const academyName = String(academy?.name || 'Academy');

  const handleStartOrContinue = () => {
    if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) return;
    navigate(buildStudentCourseLearnPath(academyUuid, courseUuid));
  };

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (error || !rawData || !course) {
    return (
      <div className="py-8 w-full min-h-[300px] flex items-center justify-center font-sans text-xs">
        <StudentStateCard
          variant="error"
          title="Course Content Unavailable"
          description={error || "We could not locate the requested course details."}
          actionLabel="Try Again"
          onAction={() => setReloadToken((prev) => prev + 1)}
          secondaryActionLabel="Back to My Courses"
          secondaryActionPath={isValidUuid(academyUuid) ? `/student/academies/${academyUuid}` : '/student/academies'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-xs text-left max-w-5xl mx-auto w-full px-0 box-border min-w-0">
      {/* 1. BREADCRUMB NAVIGATION */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#64748B] dark:text-[#94A3B8] max-w-full min-w-0 overflow-hidden leading-normal">
        <Link to={`/student/academies/${academyUuid}`} className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors shrink-0 font-medium whitespace-nowrap">
          Courses
        </Link>
        <span className="shrink-0 text-slate-300 dark:text-[#334155]">/</span>
        <span className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold truncate max-w-[130px] sm:max-w-xs md:max-w-md min-w-0" title={courseTitle}>
          {courseTitle}
        </span>
        <span className="shrink-0 text-slate-300 dark:text-[#334155]">/</span>
        <span className="text-[#2563EB] dark:text-[#60A5FA] font-semibold shrink-0 whitespace-nowrap">Overview</span>
      </nav>

      {/* 2. COURSE TABS ROW */}
      <CourseTabs academyUuid={academyUuid || ''} courseUuid={courseUuid || ''} activeTab="overview" />

      {/* 3. HERO COURSE HEADER BANNER */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] shadow-2xs rounded-2xl p-4 sm:p-6 space-y-4 min-w-0 max-w-full overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 items-stretch min-w-0">
          {/* THUMBNAIL */}
          {thumbnailPath && resolveMediaUrl(thumbnailPath) ? (
            <div className="w-full md:w-64 h-48 sm:h-52 md:h-auto bg-slate-100 dark:bg-[#0F172A] rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-[#263244] relative aspect-video md:aspect-auto flex items-center justify-center max-w-full">
              <img
                src={resolveMediaUrl(thumbnailPath)}
                alt={courseTitle}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {accessType === 'demo' && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-400 text-slate-950 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Demo Access</span>
                </span>
              )}
            </div>
          ) : null}

          {/* COURSE META DETAILS */}
          <div className="flex-1 space-y-3 flex flex-col justify-between min-w-0">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-700 dark:text-[#6EE7B7] border border-emerald-200 dark:border-emerald-900/50 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-[#6EE7B7]" />
                  <span>{accessType === 'demo' ? 'Demo Access' : 'Full Lifetime Access'}</span>
                </span>
                <span className="text-slate-200 dark:text-[#334155] font-medium shrink-0">•</span>
                <span className="text-slate-500 dark:text-[#94A3B8] font-medium text-xs shrink-0">{courseLevel}</span>
                <span className="text-slate-200 dark:text-[#334155] font-medium shrink-0">•</span>
                <span className="text-slate-500 dark:text-[#94A3B8] font-medium text-xs shrink-0">{courseLanguage}</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-snug break-words min-w-0">
                {courseTitle}
              </h1>

              <p className="text-xs text-slate-600 dark:text-[#CBD5E1] font-normal leading-relaxed break-words min-w-0">
                Academy: <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{academyName}</span> • Lead Instructor:{' '}
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{instructorName}</span>
              </p>
            </div>

            {/* MAIN ACTIONS */}
            {isFeatureEnabled(COURSE_FEATURE_KEYS.LESSONS) && (
              <div className="pt-3 border-t border-slate-100 dark:border-[#263244] grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                <Button
                  onClick={handleStartOrContinue}
                  className="w-full font-semibold justify-center text-white min-h-[44px] rounded-xl shadow-2xs cursor-pointer bg-[#2563EB] hover:bg-[#1D4ED8]"
                  leftIcon={<PlayCircle className="w-4 h-4 text-white shrink-0" />}
                >
                  {percentageNum > 0 && percentageNum < 100
                    ? 'Continue Learning'
                    : percentageNum === 100
                    ? 'Review Course'
                    : 'Start Course'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate(buildStudentCourseCurriculumPath(academyUuid, courseUuid))}
                  leftIcon={<BookOpen className="w-4 h-4 text-slate-700 dark:text-[#CBD5E1] shrink-0" />}
                  className="w-full font-semibold justify-center min-h-[44px] rounded-xl border-slate-300 dark:border-[#334155] bg-white dark:bg-[#172033] text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] shadow-2xs cursor-pointer"
                >
                  View Curriculum
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 4. DYNAMIC PROGRESS SUMMARY CARD */}
      {isFeatureEnabled(COURSE_FEATURE_KEYS.LESSONS) && (
        <LearningProgressCard
          completedLessons={completedLessonsNum}
          totalLessons={totalLessonsNum}
          percentage={percentageNum}
        />
      )}

      {/* 5. ABOUT THIS COURSE & WHAT YOU'LL LEARN */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs space-y-6 text-left">
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            About This Course
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal leading-[1.65]">
            {courseDescription || 'Master software design patterns, architecture, and production-ready implementation with hands-on exercises.'}
          </p>
        </div>

        {/* WHAT YOU WILL LEARN */}
        <div className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
          <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            What You'll Learn
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Master key fundamental concepts and principles',
              'Build production-ready projects with real-world patterns',
              'Apply best practices for software engineering and design',
              'Understand advanced topics with hands-on exercises',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244]">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
                <span className="text-xs font-normal text-[#475569] dark:text-[#CBD5E1] leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* REQUIREMENTS */}
        <div className="space-y-2 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
          <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Course Requirements
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#475569] dark:text-[#CBD5E1]">
            <li>Basic understanding of programming fundamentals and web applications.</li>
            <li>A computer with internet access and a code editor installed.</li>
          </ul>
        </div>
      </Card>

      {/* 6. INSTRUCTOR SUMMARY CARD */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs space-y-4 text-left min-w-0">
        <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
          Course Instructor
        </h2>
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-200 dark:border-[rgba(59,130,246,0.2)] text-[#2563EB] dark:text-[#60A5FA] font-bold text-base flex items-center justify-center shrink-0">
            {instructorName.charAt(0)}
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC] break-words">
              {instructorName}
            </h3>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium block">Domain Expert &amp; Lead Instructor</span>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] font-normal leading-relaxed pt-1 break-words">
              Passionate educator committed to helping students master concepts through practical exercises and real-world examples.
            </p>
          </div>
        </div>
      </Card>

      {/* 7. RECENT ACTIVITY & NOTIFICATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-2.5">
            <span className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Recent Course Activity</span>
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#64748B]">Live Sync</span>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] flex items-center justify-between text-xs border border-[#E2E8F0] dark:border-[#263244]">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#6EE7B7] shrink-0" />
                <span className="font-medium text-[#0F172A] dark:text-[#CBD5E1] truncate">Completed 1.3 Core Concepts Overview</span>
              </div>
              <span className="text-[10px] font-medium text-[#64748B] dark:text-[#64748B] shrink-0">Today</span>
            </div>
          </div>
        </Card>

        <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-2.5">
            <span className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Course Notices &amp; Updates</span>
            <Bell className="w-4 h-4 text-[#64748B] dark:text-[#64748B]" />
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-[rgba(37,99,235,0.12)] border border-blue-100 dark:border-[rgba(59,130,246,0.2)] text-xs flex items-start gap-2.5">
            <Bell className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">Live Q&amp;A Session Scheduled</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal block">Join instructor Q&amp;A this Thursday</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
