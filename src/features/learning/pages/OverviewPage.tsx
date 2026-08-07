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
    <div className="space-y-5 sm:space-y-6 font-sans text-xs text-left max-w-5xl mx-auto w-full px-1 sm:px-0">
      {/* 1. HERO COURSE OVERVIEW BANNER */}
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs rounded-2xl sm:rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-stretch">
          {/* COURSE THUMBNAIL (FULL-WIDTH ON MOBILE, 16px RADIUS) */}
          <div className="w-full md:w-64 h-44 sm:h-52 md:h-auto bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200/60">
            <img
              src={course?.thumbnail}
              alt={course?.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* COURSE DETAILS CONTENT */}
          <div className="flex-1 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info" size="sm" className="font-bold text-[11px] rounded-lg">
                  {course?.level || 'Advanced'}
                </Badge>
                <span className="text-slate-300 font-bold">•</span>
                <span className="text-slate-500 font-semibold text-[11px]">{course?.language || 'English'}</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                {course?.title}
              </h1>

              <p className="text-xs text-slate-500 font-normal">
                Lead Instructor:{' '}
                <strong className="font-semibold text-slate-800">{course?.instructorName || 'Aarav Patel'}</strong>
              </p>
            </div>

            {/* BUTTONS (FULL-WIDTH ON MOBILE, EQUAL HEIGHT, ACCENT COLOR) */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <Button
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/learn`)}
                className="w-full font-semibold justify-center text-white min-h-[46px] rounded-xl shadow-xs cursor-pointer"
                leftIcon={<PlayCircle className="w-4 h-4 text-white" />}
                style={{ backgroundColor: theme.primaryColor }}
              >
                Continue Learning
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/curriculum`)}
                className="w-full font-semibold justify-center min-h-[46px] rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                View Curriculum
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. STATISTICS CARDS (2 x 2 GRID ON MOBILE, EQUAL HEIGHT) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card padding="sm" className="bg-white border border-slate-200/80 text-center space-y-1.5 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[96px] shadow-2xs">
          <BookOpen className="w-5 h-5 mx-auto" style={{ color: theme.primaryColor }} />
          <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">
            {course?.completedLessonsCount || 8}/{course?.totalLessonsCount || 19}
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Completed Lessons</span>
        </Card>

        <Card padding="sm" className="bg-white border border-slate-200/80 text-center space-y-1.5 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[96px] shadow-2xs">
          <Clock className="w-5 h-5 mx-auto" style={{ color: theme.primaryColor }} />
          <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">14.5 Hours</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Learning Time</span>
        </Card>

        <Card padding="sm" className="bg-white border border-slate-200/80 text-center space-y-1.5 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[96px] shadow-2xs">
          <FileCheck className="w-5 h-5 mx-auto" style={{ color: theme.primaryColor }} />
          <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">1 Pending</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assignments</span>
        </Card>

        <Card padding="sm" className="bg-white border border-slate-200/80 text-center space-y-1.5 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[96px] shadow-2xs">
          <Award className="w-5 h-5 mx-auto" style={{ color: theme.primaryColor }} />
          <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">Eligible</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Certificate</span>
        </Card>
      </div>

      {/* 3. COURSE INFORMATION & RESUME POSITION SPOTLIGHT */}
      <Card padding="md" className="bg-white border border-slate-200/80 space-y-3.5 rounded-2xl sm:rounded-3xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
          <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">Up Next in Your Course</span>
          <span className="text-xs font-bold" style={{ color: theme.primaryColor }}>
            Resume Position: 12:45
          </span>
        </div>

        <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">
              {course?.currentModuleTitle || 'Module 2: RabbitMQ & Kafka Message Bus'}
            </span>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {course?.currentLessonTitle || '2.3 Idempotent Event Handlers'}
            </h3>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 pt-0.5">
              <CheckCircle2 className="w-4 h-4" /> 80% Watched
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/learn`)}
            rightIcon={<ChevronRight className="w-4 h-4 text-white" />}
            style={{ backgroundColor: theme.primaryColor }}
            className="w-full sm:w-auto font-semibold justify-center min-h-[42px] px-5 rounded-xl text-white shadow-xs cursor-pointer shrink-0"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
};
