import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  PlayCircle,
  Lock,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AcademyHeader } from '../../../components/layout/AcademyHeader';
import { AcademyFooter } from '../../../components/layout/AcademyFooter';
import { Button } from '../../../components/ui/Button';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore } from '../../../stores/course.store';

export const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { academyUuid, courseUuid } = useParams<{ academyUuid: string; courseUuid: string }>();
  const getAcademyByUuid = useAcademyStore((state) => state.getAcademyByUuid);
  const loadAcademyThemeByUuid = useAcademyStore((state) => state.loadAcademyThemeByUuid);
  const getCourseByUuid = useCourseStore((state) => state.getCourseByUuid);

  useEffect(() => {
    if (academyUuid) {
      loadAcademyThemeByUuid(academyUuid);
    }
  }, [academyUuid, loadAcademyThemeByUuid]);

  const academy = getAcademyByUuid(academyUuid || '');
  const course = getCourseByUuid(courseUuid || '');

  const [activeModuleId, setActiveModuleId] = useState<string | null>('mod-1');

  if (!academy || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-[#F8FAFC]">
        <h1 className="text-2xl font-bold text-slate-900">Course Not Found</h1>
        <p className="text-slate-500 font-mono text-[11px]">Requested Course UUID: {courseUuid}</p>
        <Link to={`/${academyUuid}/courses`} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">
          Back to Course Catalog
        </Link>
      </div>
    );
  }

  const handleEnrollClick = () => {
    navigate(`/${academyUuid}/register?course=${courseUuid}&intent=full`);
  };

  const handleDemoClick = () => {
    navigate(`/${academyUuid}/register?course=${courseUuid}&intent=demo`);
  };

  const primaryStyle = { backgroundColor: academy.theme.primaryColor };
  const returnToUrl = `/student/academies/${academyUuid}/courses/${courseUuid}/overview`;
  const registerWithReturnUrl = `/${academyUuid}/register?returnTo=${encodeURIComponent(returnToUrl)}&course=${courseUuid}`;

  const hasPromoVideo = Boolean(course.promoVideoUrl);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-xs text-slate-900 overflow-x-hidden">
      <AcademyHeader academy={academy} />

      <main className="flex-1 py-6 sm:py-8 px-3 sm:px-4 md:px-6 max-w-7xl mx-auto space-y-8 md:space-y-12 w-full min-w-0">
        {/* TOP HERO CONTAINER */}
        <div className="bg-white p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start w-full min-w-0">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 text-left w-full min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {course.category && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase">
                  {course.category}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-[#2563EB]">
                {course.level} Level
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                {course.language}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight break-words">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed break-words">
              {course.subtitle || course.currentModuleTitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <img
                  src={course.instructorAvatar || academy.instructorAvatar}
                  alt={course.instructorName}
                  className="w-8 h-8 rounded-full object-cover border shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-mono">Instructor</span>
                  <span className="font-bold text-slate-900 truncate block">{course.instructorName}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-amber-500 font-bold shrink-0">
                <Star className="w-4 h-4 fill-current shrink-0" />
                <span>{course.rating || 4.9}</span>
                <span className="text-slate-400 font-normal">({course.reviewsCount || 320} reviews)</span>
              </div>

              <div className="flex items-center gap-1.5 font-medium shrink-0">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{course.studentCount || 1420} Students</span>
              </div>

              <div className="flex items-center gap-1.5 font-medium shrink-0">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{course.duration || '24 Hours'}</span>
              </div>
            </div>
          </div>

          {/* CARD ACTION SIDEBAR */}
          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200/90 space-y-4 sm:space-y-5 text-left w-full min-w-0">
            {/* PROMOTIONAL VIDEO OR THUMBNAIL PREVIEW */}
            <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-900 group">
              {hasPromoVideo ? (
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={course.promoVideoThumbnail || course.thumbnail}
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={course.promoVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Course Fee</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {course.price === 0 ? 'FREE' : `${course.currency || '₹'}${course.price || 4999}`}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS (ENROLL NOW & CONDITIONAL TRY DEMO) */}
            <div className="space-y-3 w-full">
              <Button
                size="lg"
                style={{ backgroundColor: academy.theme.primaryColor }}
                className="w-full min-h-[48px] font-semibold justify-center text-white cursor-pointer shadow-xs hover:opacity-95"
                onClick={handleEnrollClick}
              >
                Enroll Now
              </Button>

              {course.demoEnabled && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleDemoClick}
                  className="
                    w-full
                    min-h-[48px]
                    font-semibold
                    justify-center
                    bg-white
                    border-slate-200
                    text-slate-800
                    cursor-pointer
                    hover:bg-slate-50
                  "
                  leftIcon={<PlayCircle className="w-4 h-4" />}
                >
                  Try Demo
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* MAIN BODY: WHAT YOU WILL LEARN & CURRICULUM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 text-left w-full min-w-0">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 w-full min-w-0">
            {/* WHAT YOU WILL LEARN */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4 w-full min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">What You Will Learn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  {course.whatYouWillLearn.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="break-words min-w-0">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CURRICULUM MODULE PREVIEW */}
            {course.modules && course.modules.length > 0 && (
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Curriculum Preview</h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {course.modules.length} Modules • {course.lessonCount || course.totalLessonsCount} Lessons
                  </span>
                </div>

                <div className="space-y-3 w-full min-w-0">
                  {course.modules.map((mod) => {
                    const isOpen = activeModuleId === mod.id;
                    return (
                      <div key={mod.id} className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden w-full min-w-0">
                        {/* 1. CURRICULUM MODULE CARD MOBILE LAYOUT */}
                        <button
                          type="button"
                          onClick={() => setActiveModuleId(isOpen ? null : mod.id)}
                          className="w-full p-3.5 sm:p-4 flex items-start justify-between gap-3 text-left font-bold text-xs sm:text-sm text-slate-900 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <BookOpen className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <span className="font-bold leading-snug break-words min-w-0">{mod.title}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* 2. LESSON ROWS */}
                        {isOpen && (
                          <div className="p-3 sm:p-4 space-y-2 bg-white border-t border-slate-100 divide-y divide-slate-100 w-full min-w-0">
                            {mod.lessons.map((les, lIdx) => (
                              <div
                                key={lIdx}
                                className="py-3 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 w-full min-w-0"
                              >
                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                  {les.isPreview || les.isDemoAccessible ? (
                                    <PlayCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                  )}
                                  <span className="text-xs text-slate-700 leading-relaxed break-words min-w-0 font-medium">
                                    {les.title}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 pl-6 sm:pl-0 shrink-0 w-full sm:w-auto">
                                  {les.isPreview || les.isDemoAccessible ? (
                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold leading-tight bg-emerald-100 text-emerald-800 whitespace-nowrap shrink-0">
                                      Demo Accessible
                                    </span>
                                  ) : (
                                    <span />
                                  )}
                                  <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                                    {les.duration}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR REQUIREMENTS & CERTIFICATE INFO */}
          <div className="space-y-6 w-full min-w-0">
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-3 w-full min-w-0">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>QR Verified Certificate</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed break-words">
                Upon completing 100% of curriculum lessons and passing evaluations, an automated QR-verifiable certificate is issued instantly under {academy.name}.
              </p>
            </div>

            {course.requirements && course.requirements.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-3 w-full min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">Requirements</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                      <span className="break-words min-w-0">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      <AcademyFooter academy={academy} />
    </div>
  );
};

