import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, PlayCircle, ArrowLeft, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore, type CourseEntity } from '../../../stores/course.store';

export const AcademyCoursesPage: React.FC = () => {
  const { academyUuid } = useParams<{ academyUuid: string }>();
  const navigate = useNavigate();

  const getAcademyByUuid = useAcademyStore((state) => state.getAcademyByUuid);
  const activeAcademy = useAcademyStore((state) => state.activeAcademy);
  const setActiveAcademy = useAcademyStore((state) => state.setActiveAcademy);
  const getStudentCoursesByAcademy = useCourseStore((state) => state.getStudentCoursesByAcademy);
  const setActiveCourse = useCourseStore((state) => state.setActiveCourse);

  const academy = getAcademyByUuid(academyUuid || '') || activeAcademy;
  const enrolledCourses = getStudentCoursesByAcademy(academyUuid || '');

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = enrolledCourses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCourse = (course: CourseEntity) => {
    if (academy) {
      setActiveAcademy(academy);
    }
    setActiveCourse(course);
    navigate(`/student/academies/${academyUuid}/courses/${course.uuid}/overview`);
  };

  const theme = academy?.theme || { primaryColor: '#2563EB', primarySoft: '#EFF6FF' };

  if (!academy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-[#F8FAFC]">
        <h1 className="text-2xl font-bold text-slate-900">Academy Not Found</h1>
        <Link to="/student/academies" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">
          Select Another Academy
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-xs text-left p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* TOP HEADER NAVIGATION */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/student/academies')}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          className="font-semibold"
        >
          Switch Academy
        </Button>

        <div className="flex items-center gap-3">
          <img src={academy.logoUrl} alt={academy.name} className="w-8 h-8 rounded-xl object-cover border border-slate-200" />
          <div>
            <span className="font-extrabold text-sm text-slate-900 block leading-tight">{academy.name}</span>
            <span className="text-[10px] text-slate-500 font-medium">Student Dashboard</span>
          </div>
        </div>
      </div>

      {/* BANNER */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
              My Enrolled Courses
            </h1>
            <p className="text-[13px] sm:text-sm text-slate-500 font-normal mt-0.5">
              Select an enrolled course below to enter the interactive learning portal for <strong className="font-semibold text-slate-700">{academy.name}</strong>.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Filter enrolled courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>
      </Card>

      {/* COURSE CARDS GRID */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Enrolled Courses Found</h3>
          <p className="text-slate-500 text-xs">You do not have any active course enrollments in this academy matching your search.</p>
          <Link to={`/${academyUuid}/courses`}>
            <Button size="md" style={{ backgroundColor: theme.primaryColor }} className="text-white font-semibold mt-2">
              Browse Public Catalog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filteredCourses.map((crs) => (
            <Card key={crs.id} padding="none" className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-48 bg-slate-200 overflow-hidden">
                  <img src={crs.thumbnail} alt={crs.title} className="w-full h-full object-cover" />
                  <Badge variant="neutral" className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs font-semibold">
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
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug line-clamp-2">{crs.title}</h3>
                    <span className="text-xs text-slate-500 font-medium block mt-1">Instructor: {crs.instructorName}</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Course Progress</span>
                      <span style={{ color: theme.primaryColor }}>{crs.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ backgroundColor: theme.primaryColor, width: `${crs.progressPercent}%` }}
                        className="h-full rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Last Accessed Lesson</span>
                    <span className="font-semibold text-slate-900 block truncate">{crs.currentLessonTitle}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {crs.completedLessonsCount} / {crs.totalLessonsCount} Lessons
                    </span>
                    <span>Access Expiry: {crs.accessExpiryDate}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 pt-0 flex gap-3">
                <Button
                  onClick={() => handleSelectCourse(crs)}
                  className="flex-1 font-semibold text-white justify-center py-3"
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
