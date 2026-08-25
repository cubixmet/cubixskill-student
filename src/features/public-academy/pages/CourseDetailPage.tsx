import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Users,
  PlayCircle,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Award,
  Globe,
  Star,
  Download,
  Share2,
  Lock,
  FileText,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { usePublicAcademy } from '../layouts/PublicAcademyLayout';
import { useCourseStore } from '../../../stores/course.store';
import { useAuthStore } from '../../auth/store/auth.store';
import { Button } from '../../../components/ui/Button';
import { saveCheckoutIntent, buildLoginUrl, setLastAcademy } from '../../../lib/navigationIntent';
import { studentPortalService } from '../../../services/studentPortal.service';
import { resolveMediaUrl } from '../../../services/apiClient';
import { CoursePrice } from '../../../components/common/CoursePrice';

export const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { academyUuid, courseUuid } = useParams<{ academyUuid: string; courseUuid: string }>();
  const context = usePublicAcademy();
  const academyEntity = context?.academyEntity || {
    name: 'Academy',
    theme: { primaryColor: '#2563EB' },
  };

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getCourseByUuid = useCourseStore((state) => state.getCourseByUuid);
  const fetchCourseDetail = useCourseStore((state) => state.fetchCourseDetail);

  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (academyUuid) {
      setLastAcademy(academyUuid);
    }
    if (courseUuid) {
      fetchCourseDetail(courseUuid);
    }
  }, [academyUuid, courseUuid, fetchCourseDetail]);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && courseUuid) {
      studentPortalService.getStudentEnrollments().then((list: any[]) => {
        if (!isMounted) return;
        const found = (list || []).some((e: any) => {
          if (e.status !== 'ACTIVE' && e.status !== 'COMPLETED' && e.status !== 'active') return false;
          const id = e.course?.uuid || e.course?.id || e.course_uuid || e.course_id;
          return String(id) === String(courseUuid);
        });
        setIsEnrolled(found);
      });
    }
    return () => { isMounted = false; };
  }, [isAuthenticated, courseUuid]);

  const course = getCourseByUuid(courseUuid || '');

  const handleBuyNow = () => {
    if (!courseUuid || !academyUuid) return;
    const targetCourseUuid = course?.uuid || course?.id || courseUuid;

    if (isEnrolled) {
      navigate(`/student/academies/${academyUuid}/courses/${targetCourseUuid}/overview`);
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

  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-[#F8FAFC] dark:bg-[#0B1120]">
        <div className="p-8 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl max-w-md w-full space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Course Details Loading...</h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Fetching course information and curriculum details.</p>
          <Link
            to={academyUuid ? `/${academyUuid}/courses` : '/student/academies'}
            className="inline-flex items-center justify-center h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-xl text-xs transition-colors"
          >
            Back to Course Catalog
          </Link>
        </div>
      </div>
    );
  }

  const primaryStyle = { backgroundColor: academyEntity.theme?.primaryColor || '#2563EB' };
  const coursePrice = Number(course.price || 0);
  const thumbnailUrl = course.thumbnail ? resolveMediaUrl(course.thumbnail) : '';

  const whatYouWillLearn = (course as any).outcomes || [
    'Master key fundamental concepts and principles',
    'Build production-ready projects with real-world patterns',
    'Apply best practices for software engineering and design',
    'Understand advanced topics with hands-on exercises',
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 w-full min-w-0">
        
        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <Link to={`/${academyUuid}/courses`} className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors">
            Courses
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium truncate max-w-xs">{course.title}</span>
        </nav>

        {/* TOP HERO CONTAINER */}
        <div className="bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-xs space-y-6 text-left">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {course.category && (
                <span className="px-2.5 py-1 rounded-md font-semibold bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] uppercase text-[10px]">
                  {course.category}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-md font-semibold bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] text-[10px]">
                {course.level || 'Intermediate'}
              </span>
              <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">
                Offered by <strong className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{academyEntity.name}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-snug break-words">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal leading-relaxed max-w-4xl">
              {(course as any).short_description || course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400 dark:text-[#64748B] shrink-0" />
                <span>Self-Paced Learning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400 dark:text-[#64748B] shrink-0" />
                <span>{course.modules?.length || 0} Modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400 dark:text-[#64748B] shrink-0" />
                <span>{course.language || 'English'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400 dark:text-[#64748B] shrink-0" />
                <span>Enrolled Learners</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full min-w-0">
          
          {/* MAIN CONTENT AREA (COLUMN 1 - 8 COLUMNS) */}
          <div className="lg:col-span-8 space-y-6 w-full min-w-0 text-left">
            
            {/* TABS NAVIGATION */}
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-xl p-1 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {(['overview', 'curriculum', 'instructor', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer capitalize shrink-0 ${
                    activeTab === tab
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#172033]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* WHAT YOU'LL LEARN */}
                <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
                  <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    What You'll Learn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {whatYouWillLearn.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#475569] dark:text-[#CBD5E1]">
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ABOUT THIS COURSE */}
                <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-3">
                  <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    About This Course
                  </h2>
                  <div className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed space-y-3 font-normal">
                    <p>{course.description || 'No detailed description available for this course.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CURRICULUM */}
            {activeTab === 'curriculum' && (
              <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#263244] pb-4">
                  <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Course Curriculum
                  </h2>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {course.modules?.length || 0} Modules
                  </span>
                </div>

                {(!course.modules || course.modules.length === 0) ? (
                  <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                    No curriculum modules published yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.modules.map((mod: any, idx: number) => {
                      const isOpen = activeModuleId === mod.id || activeModuleId === String(idx);
                      return (
                        <div key={mod.id || idx} className="border border-[#E2E8F0] dark:border-[#263244] rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setActiveModuleId(isOpen ? null : (mod.id || String(idx)))}
                            className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#172033] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] transition-colors cursor-pointer text-left"
                          >
                            <span className="truncate pr-2">{mod.title || `Module ${idx + 1}`}</span>
                            <ChevronDown className={`w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#2563EB] dark:text-[#60A5FA]' : ''}`} />
                          </button>

                          {isOpen && mod.lessons && (
                            <div className="p-3 space-y-1 bg-white dark:bg-[#111827] border-t border-[#E2E8F0] dark:border-[#263244]">
                              {mod.lessons.map((les: any, lIdx: number) => (
                                <div key={les.id || lIdx} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#172033] text-xs text-[#475569] dark:text-[#CBD5E1] transition-colors">
                                  <div className="flex items-center gap-2.5 truncate">
                                    <PlayCircle className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                                    <span className="truncate">{les.title}</span>
                                  </div>
                                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] shrink-0 ml-2">Video</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: INSTRUCTOR */}
            {activeTab === 'instructor' && (
              <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
                <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Lead Instructor
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-200 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] font-bold text-lg flex items-center justify-center shrink-0">
                    {(course as any).instructor?.full_name?.charAt(0) || 'I'}
                  </div>
                  <div className="space-y-1 text-xs">
                    <h3 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                      {(course as any).instructor?.full_name || 'Academy Instructor'}
                    </h3>
                    <p className="text-[#64748B] dark:text-[#94A3B8] font-medium">Senior Educator &amp; Domain Expert</p>
                    <p className="text-[#475569] dark:text-[#CBD5E1] pt-2 leading-relaxed">
                      Passionate educator committed to helping students master concepts through practical exercises and real-world examples.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
                <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Student Reviews
                </h2>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] flex items-center gap-3 text-xs">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">4.9 / 5.0 Rating</span>
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Based on student feedback in {academyEntity.name}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR ENROLLMENT CARD (COLUMN 2 - 4 COLUMNS) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 w-full min-w-0 text-left">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] dark:border-[#263244] shadow-md space-y-5">
              
              {/* THUMBNAIL */}
              {thumbnailUrl && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244]">
                  <img
                    src={thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* PRICING DISPLAY */}
              <div className="pt-1 pb-1">
                <CoursePrice course={course} size="lg" showDiscountBadge />
              </div>

              {/* ACTION BUTTON */}
              <div>
                {isEnrolled ? (
                  <Button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full font-semibold text-white py-3 rounded-xl shadow-2xs cursor-pointer justify-center min-h-[44px]"
                    style={primaryStyle}
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full font-semibold text-white py-3 rounded-xl shadow-2xs cursor-pointer justify-center min-h-[44px]"
                    style={primaryStyle}
                  >
                    {coursePrice === 0 ? 'Enroll for Free' : 'Buy Now / Enroll'}
                  </Button>
                )}
              </div>

              {/* COURSE INCLUDES */}
              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#263244] space-y-2.5 text-xs text-[#475569] dark:text-[#CBD5E1]">
                <h4 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs">This Course Includes:</h4>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                  <span>Full Lifetime Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                  <span>{course.modules?.length || 0} Learning Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                  <span>Verified Digital Certificate</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 pt-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-medium">30-Day Money-Back Guarantee</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
