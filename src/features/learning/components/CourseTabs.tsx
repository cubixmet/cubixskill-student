import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidUuid, buildStudentCourseOverviewPath, buildStudentCourseCurriculumPath } from '../../../utils/routeBuilder';
import { useCourseFeatures } from '../../../hooks/useCourseFeatures';
import { COURSE_FEATURE_KEYS } from '../../../constants/courseFeatures.constants';

export type CourseTabId = 'overview' | 'curriculum' | 'fees' | 'announcements' | 'live-classes' | 'discussions' | 'certificates' | 'personal-chat' | 'one-to-one';

interface CourseTabsProps {
  academyUuid: string;
  courseUuid: string;
  activeTab: CourseTabId;
}

export const CourseTabs: React.FC<CourseTabsProps> = ({ academyUuid, courseUuid, activeTab }) => {
  const navigate = useNavigate();
  const { isFeatureEnabled } = useCourseFeatures(courseUuid);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      activeTabRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) {
    return null;
  }

  const allTabs: { id: CourseTabId; label: string; path: string; featureKey?: string }[] = [
    { id: 'overview', label: 'Overview', path: buildStudentCourseOverviewPath(academyUuid, courseUuid) },
    { id: 'curriculum', label: 'Curriculum', path: buildStudentCourseCurriculumPath(academyUuid, courseUuid), featureKey: COURSE_FEATURE_KEYS.LESSONS },
    { id: 'fees', label: 'Fees', path: `/student/academies/${academyUuid}/courses/${courseUuid}/fees`, featureKey: COURSE_FEATURE_KEYS.FEE_COLLECTION },
    { id: 'announcements', label: 'Announcements', path: `/student/academies/${academyUuid}/courses/${courseUuid}/announcements`, featureKey: COURSE_FEATURE_KEYS.COURSE_ANNOUNCEMENT },
    { id: 'live-classes', label: 'Live Classes', path: `/student/academies/${academyUuid}/courses/${courseUuid}/live-classes`, featureKey: COURSE_FEATURE_KEYS.LIVE_CLASS },
    { id: 'discussions', label: 'Discussions', path: `/student/academies/${academyUuid}/courses/${courseUuid}/discussions`, featureKey: COURSE_FEATURE_KEYS.COURSE_DISCUSSION },
    { id: 'certificates', label: 'Certificates', path: `/student/academies/${academyUuid}/courses/${courseUuid}/certificates`, featureKey: COURSE_FEATURE_KEYS.COMPLETION_CERTIFICATE },
    { id: 'personal-chat', label: 'Personal Chat', path: `/student/academies/${academyUuid}/courses/${courseUuid}/personal-chat`, featureKey: COURSE_FEATURE_KEYS.ONE_TO_ONE_SESSION },
  ];

  const visibleTabs = allTabs.filter((tab) => {
    if (!tab.featureKey) return true;
    return isFeatureEnabled(tab.featureKey);
  });

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] rounded-xl p-1 sm:p-1.5 flex flex-row items-center gap-1 sm:gap-1.5 overflow-x-auto whitespace-nowrap hide-scrollbar w-full max-w-full touch-pan-x shrink-0 box-border"
    >
      {visibleTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={isActive ? activeTabRef : undefined}
            type="button"
            onClick={() => !isActive && navigate(tab.path)}
            style={{
              backgroundColor: isActive ? 'var(--brand-primary, #2563EB)' : 'transparent',
              color: isActive ? 'var(--brand-primary-foreground, #FFFFFF)' : undefined,
            }}
            className={`shrink-0 min-h-[44px] px-3.5 sm:px-4 py-2.5 font-semibold text-xs rounded-lg transition-all cursor-pointer select-none whitespace-nowrap flex items-center justify-center ${
              isActive
                ? 'shadow-xs hover:opacity-90'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
