import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, BookOpen, Clock, Award, FileCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useCourseStore } from '../../../stores/course.store';
import { useAcademyStore } from '../../../stores/academy.store';

export const OverviewPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501' } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();
  const courses = useCourseStore((state) => state.courses);
  const academies = useAcademyStore((state) => state.academies);

  const course = courses.find((c) => c.academyUuid === academyUuid && c.uuid === courseUuid);
  const academy = academies.find((a) => a.uuid === academyUuid);

  const theme = academy?.theme || { primaryColor: '#2563EB' };

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-5xl mx-auto">
      {/* 1. HERO COURSE OVERVIEW BANNER */}
      <Card padding="lg" className="bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 h-40 bg-slate-200 rounded-xl overflow-hidden shrink-0">
            <img src={course?.thumbnail} alt={course?.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">{course?.level}</Badge>
              <span className="text-slate-400 font-medium">•</span>
              <span className="text-slate-500 font-medium">{course?.language}</span>
            </div>

            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
              {course?.title}
            </h1>

            <span className="text-xs text-slate-500 font-normal block">
              Lead Instructor: <strong className="font-semibold text-slate-700">{course?.instructorName}</strong>
            </span>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/learn`)}
                className="font-semibold px-6"
                leftIcon={<PlayCircle className="w-4 h-4" />}
                style={{ backgroundColor: theme.primaryColor }}
              >
                Continue Learning
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/curriculum`)}
                className="font-semibold"
              >
                View Curriculum
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. PROGRESS & STATS SUMMARY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <Card padding="sm" className="bg-white border border-slate-200/80 text-center space-y-1">
          <BookOpen className="w-5 h-5 mx-auto" style={{ color: theme.primaryColor }} />
          <span className="text-lg font-bold text-slate-900 block">{course?.completedLessonsCount}/{course?.totalLessonsCount}</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase">Completed Lessons</span>
        </Card>

        <Card padding="sm" className="bg-white border border-slate-200/80 text-center space-y-1">
          <Clock className="w-5 h-5 text-indigo-600 mx-auto" />
          <span className="text-lg font-bold text-slate-900 block">14.5 Hours</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase">Learning Time</span>
        </Card>

        <Card padding="sm" className="bg-white border border-slate-200/80 text-center space-y-1">
          <FileCheck className="w-5 h-5 text-emerald-600 mx-auto" />
          <span className="text-lg font-bold text-slate-900 block">1 Pending</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase">Assignments</span>
        </Card>

        <Card padding="sm" className="bg-white border border-slate-200/80 text-center space-y-1">
          <Award className="w-5 h-5 text-amber-600 mx-auto" />
          <span className="text-lg font-bold text-slate-900 block">Eligible</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase">Certificate</span>
        </Card>
      </div>

      {/* 3. CURRENT MODULE & LESSON SPOTLIGHT */}
      <Card padding="md" className="bg-white border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Up Next in Your Course</span>
          <span className="text-xs font-semibold" style={{ color: theme.primaryColor }}>
            Resume Position: 12:45
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 block">{course?.currentModuleTitle}</span>
            <h3 className="font-semibold text-base text-slate-900">{course?.currentLessonTitle}</h3>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 80% Watched
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/learn`)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
            style={{ backgroundColor: theme.primaryColor }}
            className="font-semibold"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
};
