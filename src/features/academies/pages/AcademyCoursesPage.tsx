import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, PlayCircle, ArrowLeft, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore, type CourseEntity } from '../../../stores/course.store';
import { studentPortalService } from '../../../services/studentPortal.service';
import { Avatar } from '../../../components/ui/Avatar';

import { buildStudentCourseOverviewPath, isValidUuid } from '../../../utils/routeBuilder';

export const AcademyCoursesPage: React.FC = () => {
  const { academyUuid } = useParams<{ academyUuid: string }>();
  const navigate = useNavigate();

  const getAcademyByUuid = useAcademyStore((state) => state.getAcademyByUuid);
  const activeAcademy = useAcademyStore((state) => state.activeAcademy);
  const setActiveAcademy = useAcademyStore((state) => state.setActiveAcademy);
  const fetchAcademies = useAcademyStore((state) => state.fetchAcademies);

  const isCoursesLoading = useCourseStore((state) => state.isLoading);
  const getStudentCoursesByAcademy = useCourseStore((state) => state.getStudentCoursesByAcademy);
  const setActiveCourse = useCourseStore((state) => state.setActiveCourse);

  const [coursesList, setCoursesList] = useState<CourseEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const academy = getAcademyByUuid(academyUuid || '') || activeAcademy;

  useEffect(() => {
    fetchAcademies();
    if (isValidUuid(academyUuid)) {
      setIsLoading(true);
      studentPortalService.getStudentEnrollments().then((enrollments: any[]) => {
        const matching = (enrollments || [])
          .filter((e: any) => {
            if (e.status !== 'ACTIVE' && e.status !== 'COMPLETED' && e.status !== 'active') return false;
            const acadId = e.course?.academy?.uuid || e.course?.academy?.id || e.course?.academy_uuid || e.academy_uuid;
            return !academyUuid || String(acadId) === String(academyUuid) || e.academy_uuid === academyUuid;
          })
          .map((e: any) => {
            const crs = e.course || {};
            const realCourseUuid = String(crs.uuid || crs.id || e.course_uuid || e.course_id || '');
            if (!isValidUuid(realCourseUuid)) return null;

            return {
              id: realCourseUuid,
              uuid: realCourseUuid,
              courseUuid: realCourseUuid,
              title: crs.title || 'Enrolled Course',
              description: crs.description || '',
              thumbnail: crs.thumbnail ? (typeof crs.thumbnail === 'string' ? crs.thumbnail : crs.thumbnail.url) : '',
              level: crs.level || 'Intermediate',
              instructorName: crs.instructor?.full_name || 'Lead Instructor',
              progressPercent: e.progress_percent || 0,
              currentLessonTitle: e.current_lesson_title || 'Introduction',
              academyUuid: academyUuid || '',
            } as CourseEntity;
          })
          .filter((item): item is CourseEntity => item !== null);
        setCoursesList(matching);
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [academyUuid, fetchAcademies]);

  const filteredCourses = coursesList.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCourse = (course: CourseEntity) => {
    const targetCourseUuid = course?.uuid || course?.courseUuid || course?.id;
    if (!isValidUuid(academyUuid) || !isValidUuid(targetCourseUuid)) {
      console.error('Cannot open course overview: missing or invalid route UUID', { academyUuid, targetCourseUuid, course });
      return;
    }
    if (academy) {
      setActiveAcademy(academy);
    }
    setActiveCourse(course);
    navigate(buildStudentCourseOverviewPath(academyUuid, targetCourseUuid));
  };

  const theme = academy?.theme || { primaryColor: '#2563EB', primarySoft: '#EFF6FF' };

  if (!academy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-slate-50 dark:bg-[#0B0F17]">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">Academy Not Found</h1>
        <Link to="/student/academies" className="px-4 py-2 bg-[#2563EB] text-white rounded-xl font-semibold">
          Select Another Academy
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] font-sans text-xs text-left p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* TOP HEADER NAVIGATION */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/student/academies')}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          className="font-semibold bg-white dark:bg-[#111827] text-slate-900 dark:text-[#CBD5E1] border-slate-200 dark:border-[#263244]"
        >
          Switch Academy
        </Button>

        <div className="flex items-center gap-3">
          <Avatar src={academy.logoUrl} name={academy.name} type="academy" size="sm" />
          <div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-[#F8FAFC] block leading-tight">{academy.name}</span>
            <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-medium">Student Dashboard</span>
          </div>
        </div>
      </div>

      {/* BANNER */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight">
              My Enrolled Courses
            </h1>
            <p className="text-[13px] sm:text-sm text-slate-500 dark:text-[#94A3B8] font-normal mt-0.5">
              Select an enrolled course below to enter the interactive learning portal for <strong className="font-semibold text-slate-700 dark:text-[#CBD5E1]">{academy.name}</strong>.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Filter enrolled courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC]"
            />
          </div>
        </div>
      </Card>

      {/* LOADING SKELETON */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      )}

      {/* COURSE CARDS GRID */}
      {!isLoading && filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] p-12 rounded-3xl border border-slate-200 dark:border-[#263244] text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-[#64748B] mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">No Enrolled Courses Found</h3>
          <p className="text-slate-500 dark:text-[#94A3B8] text-xs">You do not have any active course enrollments in this academy matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filteredCourses.map((crs) => (
            <Card key={crs.id} padding="none" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] rounded-2xl overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-48 bg-slate-200 dark:bg-[#172033] overflow-hidden">
                  {crs.thumbnail ? (
                    <img src={crs.thumbnail} alt={crs.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA]">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  <Badge variant="neutral" className="absolute top-3 left-3 bg-white/90 dark:bg-[#0F172A]/90 dark:text-[#F8FAFC] backdrop-blur-xs font-semibold">
                    {crs.level}
                  </Badge>
                  {crs.progressPercent === 100 && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>

                <div className="p-5 md:p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-[#F8FAFC] leading-snug line-clamp-2">{crs.title}</h3>
                    <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block mt-1">Instructor: {crs.instructorName}</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#263244]">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                      <span>Course Progress</span>
                      <span style={{ color: theme.primaryColor }}>{crs.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#263244] h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ backgroundColor: theme.primaryColor, width: `${crs.progressPercent}%` }}
                        className="h-full rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-[#263244] space-y-1 text-xs text-slate-600 dark:text-[#CBD5E1]">
                    <span className="text-[10px] text-slate-400 dark:text-[#64748B] font-mono block uppercase">Last Lesson</span>
                    <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] block truncate">{crs.currentLessonTitle || 'Introduction'}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 pt-0 flex gap-3">
                <Button
                  onClick={() => handleSelectCourse(crs)}
                  className="flex-1 font-semibold text-white justify-center py-3 bg-[#2563EB] hover:bg-[#1D4ED8]"
                  rightIcon={<PlayCircle className="w-4 h-4" />}
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Continue Learning
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
