import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, PlayCircle, ArrowLeft } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore } from '../../../stores/course.store';

export const AcademyCoursesPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ academyUuid: string }>();
  const navigate = useNavigate();

  const academies = useAcademyStore((state) => state.academies);
  const courses = useCourseStore((state) => state.courses);
  const setActiveCourseUuid = useCourseStore((state) => state.setActiveCourseUuid);

  const academy = academies.find((a) => a.uuid === academyUuid);
  const academyCourses = courses.filter((c) => c.academyUuid === academyUuid);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = academyCourses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCourse = (courseUuid: string) => {
    setActiveCourseUuid(courseUuid);
    navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`);
  };

  const theme = academy?.theme || { primaryColor: '#2563EB' };

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
          Back to Academies
        </Button>

        <div className="flex items-center gap-2">
          <img src={academy?.logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
          <span className="font-semibold text-xs text-slate-900">{academy?.name}</span>
        </div>
      </div>

      {/* BANNER */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Select a Course</h1>
            <p className="text-[13px] sm:text-sm text-slate-500 font-normal mt-0.5">
              Enrolled courses for <strong className="font-semibold text-slate-700">{academy?.name}</strong>. Choose a course to open its dedicated student portal.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>
      </Card>

      {/* COURSE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filteredCourses.map((crs) => (
          <Card key={crs.id} padding="none" className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-44 bg-slate-200 overflow-hidden">
                <img src={crs.thumbnail} alt={crs.title} className="w-full h-full object-cover" />
                <Badge variant="neutral" className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs font-semibold">
                  {crs.level}
                </Badge>
              </div>

              <div className="p-4 md:p-6 space-y-3">
                <h3 className="font-semibold text-base sm:text-[18px] text-slate-900 leading-snug">{crs.title}</h3>
                <span className="text-xs text-slate-500 font-normal block">Instructor: {crs.instructorName}</span>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>Course Completion</span>
                    <span className="font-semibold" style={{ color: theme.primaryColor }}>{crs.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ backgroundColor: theme.primaryColor, width: `${crs.progressPercent}%` }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-normal pt-1">
                  <div>Lessons: {crs.completedLessonsCount}/{crs.totalLessonsCount}</div>
                  <div>Expiry: {crs.accessExpiryDate}</div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 pt-0">
              <Button
                onClick={() => handleSelectCourse(crs.uuid)}
                className="w-full font-semibold"
                rightIcon={<PlayCircle className="w-4 h-4" />}
                style={{ backgroundColor: theme.primaryColor }}
              >
                Continue Course
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
