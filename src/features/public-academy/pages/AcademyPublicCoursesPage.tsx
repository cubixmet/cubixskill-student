import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, BookOpen, Filter, ChevronDown, ArrowRight } from 'lucide-react';
import { usePublicAcademy } from '../layouts/PublicAcademyLayout';
import { studentPortalService } from '../../../services/studentPortal.service';
import { resolveMediaUrl } from '../../../services/apiClient';
import { useAuthStore } from '../../auth/store/auth.store';
import { saveCheckoutIntent, buildLoginUrl, setLastAcademy } from '../../../lib/navigationIntent';
import { CoursePrice } from '../../../components/common/CoursePrice';
import { buildPublicCourseDetailsPath, buildStudentCourseLearnPath } from '../../../utils/routeBuilder';

interface PublicCourseCardItemProps {
  course: any;
  academyUuid: string;
  isEnrolled: boolean;
  primaryStyle: React.CSSProperties;
  onEnrollClick: (course: any) => void;
}

const PublicCourseCardItem: React.FC<PublicCourseCardItemProps> = ({
  course,
  academyUuid,
  isEnrolled,
  primaryStyle,
  onEnrollClick,
}) => {
  const navigate = useNavigate();
  const [imgFailed, setImgFailed] = useState(false);

  const targetId = String(course.uuid || course.id || course.slug || '');
  const rawThumbnail = course.thumbnail || course.thumbnail_url || course.image_url;
  const resolvedImgUrl = resolveMediaUrl(rawThumbnail);

  useEffect(() => {
    setImgFailed(false);
  }, [resolvedImgUrl]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (academyUuid && targetId) {
      navigate(buildPublicCourseDetailsPath(academyUuid, targetId));
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[12px] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between w-full min-w-0 max-w-full cursor-pointer group"
    >
      <div>
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-[#0F172A]">
          {resolvedImgUrl && !imgFailed ? (
            <img
              src={resolvedImgUrl}
              alt={course.title || 'Course'}
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA]">
              <BookOpen className="w-10 h-10" />
            </div>
          )}
          {course.category && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#0F172A]/80 text-white backdrop-blur-xs">
              {course.category}
            </span>
          )}
          {isEnrolled && (
            <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white shadow-xs">
              ✓ Already Enrolled
            </span>
          )}
        </div>

        <div className="p-4 space-y-2.5 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1]">
              {course.level || 'Masterclass'}
            </span>
            <CoursePrice course={course} size="sm" showDiscountBadge />
          </div>

          <h3 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-snug break-words group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors">
            {course.title}
          </h3>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-xs line-clamp-2 font-normal leading-relaxed">
            {course.short_description || course.description}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0">
        {isEnrolled ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEnrollClick(course);
            }}
            style={primaryStyle}
            className="w-full font-semibold text-white py-2.5 rounded-xl inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-2xs min-h-[42px] hover:opacity-95 transition-opacity"
          >
            <span className="whitespace-nowrap leading-none">Continue Learning</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (academyUuid && targetId) {
                navigate(buildPublicCourseDetailsPath(academyUuid, targetId));
              }
            }}
            style={primaryStyle}
            className="w-full font-semibold text-white py-2.5 rounded-xl inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-2xs min-h-[42px] hover:opacity-95 transition-opacity"
          >
            <span className="whitespace-nowrap leading-none">View Details</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
};

export const AcademyPublicCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { academyUuid: paramUuid } = useParams<{ academyUuid: string }>();
  const context = usePublicAcademy();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const academyUuid = context?.academyUuid || paramUuid || '';

  const [localCourses, setLocalCourses] = useState<any[]>([]);
  const [localData, setLocalData] = useState<any>(null);

  useEffect(() => {
    if (academyUuid) {
      setLastAcademy(academyUuid);
    }
  }, [academyUuid]);

  useEffect(() => {
    if (context) return;
    let isMounted = true;
    async function loadData() {
      if (!academyUuid) return;
      const courses = await studentPortalService.getPublicAcademyCourses(academyUuid);
      const website = await studentPortalService.getPublicAcademyWebsite(academyUuid);
      if (isMounted) {
        setLocalCourses(courses || []);
        setLocalData(website);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [context, academyUuid]);

  const publicCourses = context?.publicCourses || localCourses || [];
  const academyEntity = context?.academyEntity || {
    name: localData?.academy?.name || 'Academy',
    theme: { primaryColor: localData?.theme?.primary_color || '#2563EB' },
  };

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  const [userEnrollments, setUserEnrollments] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      studentPortalService.getStudentEnrollments().then((list) => {
        if (isMounted) setUserEnrollments(list || []);
      });
    } else {
      setUserEnrollments([]);
    }
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const enrolledCourseUuids = useMemo(() => {
    const set = new Set<string>();
    userEnrollments.forEach((e: any) => {
      if (e.status === 'ACTIVE' || e.status === 'COMPLETED' || e.status === 'active') {
        const id = e.course?.uuid || e.course?.id || e.course_uuid || e.course_id;
        if (id) set.add(String(id));
      }
    });
    return set;
  }, [userEnrollments]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    publicCourses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ['All', ...Array.from(set)];
  }, [publicCourses]);

  const filteredCourses = useMemo(() => {
    return publicCourses.filter((c) => {
      const matchSearch =
        (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.short_description || c.description || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchLevel = selectedLevel === 'All' || c.level === selectedLevel;
      return matchSearch && matchCat && matchLevel;
    });
  }, [publicCourses, search, selectedCategory, selectedLevel]);

  const handleEnrollClick = (course: any) => {
    const targetCourseUuid = course.uuid || course.id || course.slug;
    if (!targetCourseUuid || !academyUuid) return;

    const isEnrolled = enrolledCourseUuids.has(String(targetCourseUuid)) || enrolledCourseUuids.has(String(course.id));
    if (isEnrolled) {
      const resumeLessonId = course.resumeLessonId || course.lastLessonId || course.currentLessonId || course.resume_lesson_id || course.last_lesson_id || course.current_lesson_id || null;
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

  const primaryStyle = { backgroundColor: academyEntity.theme?.primaryColor || '#2563EB' };

  return (
    <div className="py-8 md:py-12 px-4 md:px-6 max-w-7xl mx-auto space-y-8 w-full min-w-0 font-sans text-left">
      {/* COURSES HEADER */}
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Explore Courses
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal">
          Discover courses designed to help you learn and grow under {academyEntity.name}.
        </p>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-[14px] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA]">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC]">Filter &amp; Search</span>
          </div>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
            Showing <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{filteredCourses.length}</span> of {publicCourses.length} courses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* SEARCH INPUT */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] select-none">
              Search Catalog
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400 dark:text-[#94A3B8] pointer-events-none flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search title or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#CBD5E1] dark:border-[#334155] pl-9 pr-3 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] bg-white dark:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 px-2 py-0.5 text-[10px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-[#F8FAFC] rounded bg-slate-100 dark:bg-[#263244]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* CATEGORY DROPDOWN */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] select-none">
              Category
            </label>
            <div className="relative flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3.5 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] appearance-none cursor-pointer pr-9 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 pointer-events-none text-slate-400 dark:text-[#94A3B8] flex items-center justify-center">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* SKILL LEVEL DROPDOWN */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] select-none">
              Skill Level
            </label>
            <div className="relative flex items-center">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3.5 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] appearance-none cursor-pointer pr-9 focus:outline-none"
              >
                <option value="All" className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">All Skill Levels</option>
                <option value="Beginner" className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">Beginner</option>
                <option value="Intermediate" className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">Intermediate</option>
                <option value="Advanced" className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">Advanced</option>
              </select>
              <div className="absolute right-3 pointer-events-none text-slate-400 dark:text-[#94A3B8] flex items-center justify-center">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COURSES GRID / EMPTY STATE */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] p-8 md:p-12 rounded-[14px] border border-[#E2E8F0] dark:border-[#263244] text-center space-y-2">
          <BookOpen className="w-10 h-10 text-[#64748B] dark:text-[#94A3B8] mx-auto" />
          <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No Courses Match Your Filter</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal max-w-sm mx-auto">
            {publicCourses.length === 0
              ? 'This academy has not published any public courses yet.'
              : 'Try clearing search keywords or selecting a different category filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const targetId = String(course.uuid || course.id || '');
            const isEnrolled = enrolledCourseUuids.has(targetId) || enrolledCourseUuids.has(String(course.id));

            return (
              <PublicCourseCardItem
                key={course.id || course.slug}
                course={course}
                academyUuid={academyUuid}
                isEnrolled={isEnrolled}
                primaryStyle={primaryStyle}
                onEnrollClick={handleEnrollClick}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
