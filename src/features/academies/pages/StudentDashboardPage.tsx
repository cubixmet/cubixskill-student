import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  Award,
  Video,
  PlayCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Building2,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore, type CourseEntity } from '../../../stores/course.store';
import { useAuthStore } from '../../../stores/auth.store';
import { studentPortalService } from '../../../services/studentPortal.service';

import { buildStudentCourseOverviewPath, isValidUuid } from '../../../utils/routeBuilder';

export const StudentDashboardPage: React.FC = () => {
  const { academyUuid } = useParams<{ academyUuid: string }>();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);

  const getAcademyByUuid = useAcademyStore((state) => state.getAcademyByUuid);
  const activeAcademy = useAcademyStore((state) => state.activeAcademy);
  const setActiveAcademy = useAcademyStore((state) => state.setActiveAcademy);
  const fetchAcademies = useAcademyStore((state) => state.fetchAcademies);
  const isAcademyLoading = useAcademyStore((state) => state.isLoading);

  const fetchCourses = useCourseStore((state) => state.fetchCourses);
  const isCoursesLoading = useCourseStore((state) => state.isLoading);
  const getStudentCoursesByAcademy = useCourseStore((state) => state.getStudentCoursesByAcademy);
  const setActiveCourse = useCourseStore((state) => state.setActiveCourse);

  const [certificates, setCertificates] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const academy = getAcademyByUuid(academyUuid || '') || activeAcademy;
  const enrolledCourses = getStudentCoursesByAcademy(academyUuid || '');

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      if (isAuthLoading || !isAuthenticated || !isValidUuid(academyUuid) || isDataLoaded) return;

      try {
        await fetchAcademies();
        await fetchCourses(academyUuid);

        const [certsRes, liveRes, notifRes] = await Promise.allSettled([
          studentPortalService.getStudentCertificates(),
          studentPortalService.getStudentLiveClasses(),
          studentPortalService.getNotifications(),
        ]);

        if (isMounted) {
          if (certsRes.status === 'fulfilled') setCertificates(certsRes.value || []);
          if (liveRes.status === 'fulfilled') setLiveClasses(liveRes.value || []);
          if (notifRes.status === 'fulfilled') setNotifications(notifRes.value || []);
          setIsDataLoaded(true);
        }
      } catch {
        if (isMounted) setIsDataLoaded(true);
      }
    }

    loadDashboardData();
    return () => { isMounted = false; };
  }, [academyUuid, isAuthenticated, isAuthLoading, isDataLoaded]);

  // Handle course navigation
  const handleSelectCourse = (course: CourseEntity) => {
    const targetCourseUuid = course?.uuid || course?.courseUuid || course?.id;
    if (!isValidUuid(academyUuid) || !isValidUuid(targetCourseUuid)) {
      console.error('Cannot open course overview: missing or invalid route UUID', { academyUuid, targetCourseUuid, course });
      return;
    }
    if (academy) setActiveAcademy(academy);
    setActiveCourse(course);
    navigate(buildStudentCourseOverviewPath(academyUuid, targetCourseUuid));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const theme = academy?.theme || { primaryColor: '#2563EB', primarySoft: '#EFF6FF' };
  const primaryStyle = { backgroundColor: theme.primaryColor || '#2563EB' };

  // Calculate statistics from real backend data
  const completedCoursesCount = enrolledCourses.filter((c) => c.progressPercent === 100).length;
  const activeCourse = enrolledCourses.find((c) => c.progressPercent > 0 && c.progressPercent < 100) || enrolledCourses[0];

  const filteredCourses = enrolledCourses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auth / Loading skeletons
  if (isAuthLoading || !isDataLoaded || isAcademyLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans text-xs">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // Academy not found or access unauthorized state
  if (!academy && isDataLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-slate-50 dark:bg-[#0B0F17]">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC]">Academy Access Denied</h1>
        <p className="text-slate-500 dark:text-[#94A3B8] max-w-md">
          The requested academy is unavailable or your authenticated student account is not enrolled in its courses.
        </p>
        <Link to="/student/academies" className="px-5 py-2.5 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] transition-all">
          Return to My Academies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] font-sans text-xs text-left p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. TOP HEADER BRANDING & USER BAR */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-[#263244] shadow-2xs">
        <div className="flex items-center gap-3.5 min-w-0">
          {academy?.logoUrl ? (
            <img src={academy.logoUrl} alt={academy.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-[#263244] shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] font-bold text-base flex items-center justify-center shrink-0">
              {academy?.name?.charAt(0) || 'A'}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-[#F8FAFC] leading-tight truncate">
              {academy?.name || 'Student Portal'}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal truncate mt-0.5">
              {academy?.tagline || 'Official Student Dashboard'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/academies')}
            leftIcon={<Building2 className="w-3.5 h-3.5" />}
            className="font-semibold bg-slate-50 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] border-slate-200/80 dark:border-[#263244] hover:bg-slate-100"
          >
            Switch Academy
          </Button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 text-[#2563EB] font-semibold flex items-center justify-center text-xs">
                {user?.fullName?.charAt(0) || 'S'}
              </div>
              <span className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] hidden sm:inline">
                {user?.fullName || 'Student'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-xl p-2 z-50 text-xs font-medium space-y-1">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-[#263244]">
                  <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] block truncate">{user?.fullName || 'Student'}</span>
                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal block truncate">{user?.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setProfileDropdownOpen(false); navigate('/student/academies'); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> My Academies
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. STUDENT WELCOME BANNER */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] shadow-2xs space-y-3 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] border border-blue-100 dark:border-[rgba(59,130,246,0.18)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Learning Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight">
              Welcome back, {user?.fullName || 'Student'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] font-normal max-w-2xl">
              Track your course enrollments, active lesson progress, live sessions, and accredited certificates in {academy?.name}.
            </p>
          </div>

          {activeCourse && (
            <Button
              onClick={() => handleSelectCourse(activeCourse)}
              className="font-semibold text-white px-6 py-3 rounded-xl shadow-xs self-start md:self-auto cursor-pointer"
              style={primaryStyle}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Resume Learning
            </Button>
          )}
        </div>
      </Card>

      {/* 3. METRICS SUMMARY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ENROLLED COURSES */}
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC] block leading-none">
              {enrolledCourses.length}
            </span>
            <span className="text-xs font-normal text-slate-500 dark:text-[#94A3B8] block mt-1">
              Enrolled Courses
            </span>
          </div>
        </Card>

        {/* COMPLETED COURSES */}
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC] block leading-none">
              {completedCoursesCount}
            </span>
            <span className="text-xs font-normal text-slate-500 dark:text-[#94A3B8] block mt-1">
              Completed Courses
            </span>
          </div>
        </Card>

        {/* CERTIFICATES */}
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-[rgba(245,158,11,0.12)] text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC] block leading-none">
              {certificates.length}
            </span>
            <span className="text-xs font-normal text-slate-500 dark:text-[#94A3B8] block mt-1">
              Certificates Issued
            </span>
          </div>
        </Card>

        {/* LIVE CLASSES */}
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-[rgba(147,51,234,0.12)] text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC] block leading-none">
              {liveClasses.length}
            </span>
            <span className="text-xs font-normal text-slate-500 dark:text-[#94A3B8] block mt-1">
              Upcoming Live Sessions
            </span>
          </div>
        </Card>
      </div>

      {/* 4. CONTINUE LEARNING SPOTLIGHT */}
      {activeCourse && (
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">Continue Learning</h3>
            </div>
            <span className="text-xs font-semibold" style={{ color: theme.primaryColor }}>
              {activeCourse.progressPercent}% Completed
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="relative w-full md:w-64 h-36 bg-slate-100 dark:bg-[#172033] rounded-xl overflow-hidden shrink-0">
              {activeCourse.thumbnail ? (
                <img src={activeCourse.thumbnail} alt={activeCourse.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <BookOpen className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 min-w-0 w-full text-left">
              <div>
                <Badge variant="neutral" size="sm" className="mb-1">
                  {activeCourse.level}
                </Badge>
                <h4 className="font-semibold text-base text-slate-900 dark:text-[#F8FAFC] leading-snug line-clamp-1">
                  {activeCourse.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] line-clamp-2 mt-1 font-normal">
                  {activeCourse.subtitle || activeCourse.description || 'Continue your course modules and curriculum.'}
                </p>
              </div>

              {/* PROGRESS BAR */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-[#263244] h-2 rounded-full overflow-hidden">
                  <div
                    style={{ backgroundColor: theme.primaryColor, width: `${activeCourse.progressPercent}%` }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">
                  Last Lesson: <strong className="font-semibold text-slate-700 dark:text-[#CBD5E1]">{activeCourse.currentLessonTitle || 'Introduction'}</strong>
                </span>
                <Button
                  onClick={() => handleSelectCourse(activeCourse)}
                  className="font-semibold text-white px-5 py-2 text-xs rounded-xl shadow-2xs cursor-pointer"
                  style={primaryStyle}
                  rightIcon={<PlayCircle className="w-4 h-4" />}
                >
                  Continue Course
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 5. ENROLLED COURSES SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-[#F8FAFC] tracking-tight">My Courses</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">Enrolled courses for {academy?.name}</p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search my courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-white dark:bg-[#111827] border-slate-200/80 dark:border-[#263244] text-slate-900 dark:text-[#F8FAFC]"
            />
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <Card className="p-8 text-center bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] rounded-2xl space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-[#64748B] mx-auto" />
            <h4 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">No Enrolled Courses Found</h4>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-sm mx-auto">
              You do not have any course enrollments in this academy matching your search criteria.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredCourses.map((crs) => (
              <Card
                key={crs.id}
                padding="none"
                className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-200 dark:bg-[#172033] overflow-hidden">
                    {crs.thumbnail ? (
                      <img src={crs.thumbnail} alt={crs.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA]">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}
                    <Badge variant="neutral" className="absolute top-3 left-3 bg-white/90 dark:bg-[#0F172A]/90 dark:text-[#F8FAFC] backdrop-blur-xs font-semibold">
                      {crs.level}
                    </Badge>
                    {crs.progressPercent === 100 && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="font-semibold text-base text-slate-900 dark:text-[#F8FAFC] leading-snug line-clamp-2">{crs.title}</h4>
                      <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal block mt-0.5">Instructor: {crs.instructorName}</span>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-[#263244]">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                        <span>Progress</span>
                        <span style={{ color: theme.primaryColor }}>{crs.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#263244] h-2 rounded-full overflow-hidden">
                        <div
                          style={{ backgroundColor: theme.primaryColor, width: `${crs.progressPercent}%` }}
                          className="h-full rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    onClick={() => handleSelectCourse(crs)}
                    className="w-full font-semibold text-white justify-center py-2.5 shadow-2xs cursor-pointer"
                    rightIcon={<PlayCircle className="w-4 h-4" />}
                    style={primaryStyle}
                  >
                    Open Course
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 6. UPCOMING LIVE CLASSES & ANNOUNCEMENTS DUAL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* UPCOMING LIVE CLASSES */}
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] shadow-2xs space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-2.5">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">Upcoming Live Sessions</h3>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8]">{liveClasses.length} Scheduled</span>
          </div>

          {liveClasses.length === 0 ? (
            <div className="py-6 text-center text-slate-500 dark:text-[#94A3B8] text-xs font-normal">
              No upcoming live classes scheduled.
            </div>
          ) : (
            <div className="space-y-2.5">
              {liveClasses.slice(0, 3).map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-100 dark:border-[#263244] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] block truncate">{item.title || 'Live Q&A Session'}</span>
                    <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal block">{item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString() : 'Scheduled soon'}</span>
                  </div>
                  <Button size="sm" className="text-xs font-semibold h-8 bg-purple-600 hover:bg-purple-700 text-white shrink-0">
                    Join
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* RECENT ANNOUNCEMENTS */}
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] shadow-2xs space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-2.5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">Announcements</h3>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8]">{notifications.length} Unread</span>
          </div>

          {notifications.length === 0 ? (
            <div className="py-6 text-center text-slate-500 dark:text-[#94A3B8] text-xs font-normal">
              No recent academy announcements.
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.slice(0, 3).map((notif, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-100 dark:border-[#263244] space-y-0.5">
                  <span className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] block truncate">{notif.title || notif.message}</span>
                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal block truncate">{notif.body || notif.message}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
