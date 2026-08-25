import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidUuid, buildStudentCourseOverviewPath, buildStudentCourseCurriculumPath } from '../../../utils/routeBuilder';

export type CourseTabId = 'overview' | 'curriculum' | 'live-classes' | 'discussions' | 'certificates';

interface CourseTabsProps {
  academyUuid: string;
  courseUuid: string;
  activeTab: CourseTabId;
}

export const CourseTabs: React.FC<CourseTabsProps> = ({ academyUuid, courseUuid, activeTab }) => {
  const navigate = useNavigate();

  if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) {
    return null;
  }

  const tabs: { id: CourseTabId; label: string; path: string }[] = [
    { id: 'overview', label: 'Overview', path: buildStudentCourseOverviewPath(academyUuid, courseUuid) },
    { id: 'curriculum', label: 'Curriculum', path: buildStudentCourseCurriculumPath(academyUuid, courseUuid) },
    { id: 'live-classes', label: 'Live Classes', path: `/student/academies/${academyUuid}/courses/${courseUuid}/live-classes` },
    { id: 'discussions', label: 'Discussions', path: `/student/academies/${academyUuid}/courses/${courseUuid}/discussions` },
    { id: 'certificates', label: 'Certificates', path: `/student/academies/${academyUuid}/courses/${courseUuid}/certificates` },
  ];

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-[10px] p-[5px] flex gap-1.5 overflow-x-auto whitespace-nowrap hide-scrollbar w-full">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => !isActive && navigate(tab.path)}
            style={{
              backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
              color: isActive ? 'var(--brand-primary-foreground, #FFFFFF)' : undefined,
            }}
            className={`shrink-0 px-4 py-2 min-h-[36px] font-medium text-xs rounded-[8px] transition-all cursor-pointer select-none ${
              isActive
                ? 'font-medium shadow-none hover:opacity-90'
                : 'text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
