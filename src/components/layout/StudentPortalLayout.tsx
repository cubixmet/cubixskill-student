import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  BookOpen,
  PlayCircle,
  ListTree,
  FileCheck,
  HelpCircle,
  Video,
  Award,
  Bell,
  MessageSquare,
  MessageCircle,
  Download,
  Calendar,
  Settings,
  Menu,
  ChevronRight,
  LogOut,
  User,
  ChevronDown,
  X,
} from 'lucide-react';
import { useAcademyStore, FIXED_PORTAL_SURFACES } from '../../stores/academy.store';
import { useCourseStore } from '../../stores/course.store';
import { useAuthStore } from '../../stores/auth.store';
import { useNotificationStore } from '../../stores/notification.store';
import { saveLastActiveCourse } from '../../utils/last-active-course.utility';
import { StudentResumeTracker } from '../StudentResumeTracker';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { useCourseFeatures } from '../../hooks/useCourseFeatures';
import { useStudentLogout } from '../../hooks/useStudentLogout';
import { COURSE_FEATURE_KEYS } from '../../constants/courseFeatures.constants';
import { ScrollToTop } from './ScrollToTop';

export const StudentPortalLayout: React.FC = () => {
  const { academyUuid, courseUuid } = useParams<{
    academyUuid?: string;
    courseUuid?: string;
  }>();

  const navigate = useNavigate();
  const location = useLocation();

  const academies = useAcademyStore((state) => state.academies);
  const courses = useCourseStore((state) => state.courses);
  const user = useAuthStore((state) => state.user);
  const student = useAuthStore((state) => state.student);
  const isDemoSession = useAuthStore((state) => state.isDemoSession);
  const exitDemoSession = useAuthStore((state) => state.exitDemoSession);
  const logout = useAuthStore((state) => state.logout);

  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const unreadCount = useNotificationStore((state) => state.getUnreadCount(student?.uuid || '', courseUuid));

  const academy = academies.find((a) => a.uuid === academyUuid);
  const course = courses.find((c) => c.academyUuid === academyUuid && c.uuid === courseUuid);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeNavItemRef = useRef<HTMLButtonElement>(null);

  const { handleLogout: executeStudentLogout } = useStudentLogout();

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await executeStudentLogout();
  };

  useEffect(() => {
    if (student?.uuid) {
      fetchNotifications(student.uuid, academyUuid);
    }
  }, [student?.uuid, academyUuid, fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (student?.uuid) {
        fetchUnreadCount(academyUuid);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [student?.uuid, academyUuid, fetchUnreadCount]);

  useEffect(() => {
    if (academyUuid && courseUuid) {
      saveLastActiveCourse(academyUuid, courseUuid);
    }
  }, [academyUuid, courseUuid]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { isFeatureEnabled } = useCourseFeatures(courseUuid);

  const theme = academy?.theme || {
    primaryColor: '#2563EB',
    primaryHover: '#1D4ED8',
    primarySoft: '#EFF6FF',
  };

  const baseUrl = `/student/academies/${academyUuid}/courses/${courseUuid}`;

  const navItems = [
    { label: 'My Course', path: `${baseUrl}/overview`, icon: BookOpen },
    { label: 'Continue Learning', path: `${baseUrl}/learn`, icon: PlayCircle, featureKey: COURSE_FEATURE_KEYS.LESSONS },
    { label: 'Curriculum', path: `${baseUrl}/curriculum`, icon: ListTree, featureKey: COURSE_FEATURE_KEYS.LESSONS },
    { label: 'Fees & Payments', path: `${baseUrl}/fees`, icon: FileCheck, featureKey: COURSE_FEATURE_KEYS.FEE_COLLECTION },
    { label: 'Announcements', path: `${baseUrl}/announcements`, icon: Bell, featureKey: COURSE_FEATURE_KEYS.COURSE_ANNOUNCEMENT },
    { label: 'Live Classes', path: `${baseUrl}/live-classes`, icon: Video, featureKey: COURSE_FEATURE_KEYS.LIVE_CLASS },
    { label: 'Discussions', path: `${baseUrl}/discussions`, icon: MessageSquare, featureKey: COURSE_FEATURE_KEYS.COURSE_DISCUSSION },
    { label: 'Personal Chat', path: `${baseUrl}/personal-chat`, icon: MessageCircle, featureKey: COURSE_FEATURE_KEYS.ONE_TO_ONE_SESSION },
    { label: 'Certificates', path: `${baseUrl}/certificates`, icon: Award, featureKey: COURSE_FEATURE_KEYS.COMPLETION_CERTIFICATE },
    { label: 'Profile & Settings', path: `${baseUrl}/settings`, icon: Settings },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (!item.featureKey) return true;
    return isFeatureEnabled(item.featureKey);
  });

  const isNavItemActive = (itemPath: string) => {
    const normalizedCurrent = location.pathname.replace(/\/+$/, '');
    const normalizedItem = itemPath.replace(/\/+$/, '');

    if (normalizedCurrent === normalizedItem) return true;

    if (
      normalizedItem.endsWith('/overview') &&
      (normalizedCurrent === baseUrl.replace(/\/+$/, '') || normalizedCurrent.endsWith('/overview'))
    ) {
      return true;
    }

    if (normalizedCurrent.startsWith(`${normalizedItem}/`)) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const timer = setTimeout(() => {
      if (activeNavItemRef.current) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        activeNavItemRef.current.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [mobileMenuOpen, location.pathname]);

  return (
    <div
      className="min-h-screen flex flex-col font-sans bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] text-xs hide-scrollbar"
      style={
        {
          '--theme-primary': theme.primaryColor || '#2563EB',
          '--theme-primary-hover': theme.primaryHover || '#1D4ED8',
          '--theme-primary-soft': theme.primarySoft || '#EFF6FF',
          '--theme-link': theme.primaryColor || '#2563EB',
          '--theme-progress': theme.primaryColor || '#2563EB',
          '--theme-focus': theme.primaryColor || '#2563EB',
        } as React.CSSProperties
      }
    >
      <ScrollToTop />
      <StudentResumeTracker />
      {/* ENTERPRISE DEMO MODE BANNER */}
      {isDemoSession && (
        <div className="bg-slate-900 text-white text-xs py-2.5 px-4 font-sans flex flex-wrap items-center justify-between gap-3 shadow-md z-50">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wider">
              Demo Mode
            </span>
            <span className="font-medium text-slate-200">
              Demo Mode • 5 Days Remaining. This is a sample course environment.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="http://localhost:5175/instructor-register"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              Upgrade to Unlock All Lessons
            </a>
            <button
              type="button"
              onClick={async () => {
                await exitDemoSession();
                navigate('/login', { replace: true });
              }}
              className="text-slate-400 hover:text-white underline text-xs cursor-pointer font-medium"
            >
              Exit Sandbox
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER (COMPACT 56px-60px HEIGHT) */}
      <header
        className="h-14 sm:h-[60px] bg-white dark:bg-[#111827] border-b border-slate-200/80 dark:border-[#263244] px-3 sm:px-6 sticky top-0 z-40 flex items-center justify-between shadow-2xs text-left font-sans"
      >
        {/* BRANDING BLOCK: LOGO + ACADEMY & COURSE TITLES */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <Avatar src={academy?.logoUrl} name={academy?.name || 'Academy'} type="academy" size="sm" className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
          <div className="min-w-0 flex-1 text-left">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F8FAFC] truncate block leading-tight">
              {academy?.name || 'Academy'}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] truncate block leading-tight">
              {course?.title ? (isDemoSession ? `${course.title} (DEMO)` : course.title) : 'Student Portal'}
            </span>
          </div>
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* THEME TOGGLE (DESKTOP ONLY) */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {isDemoSession && (
            <button
              type="button"
              onClick={async () => {
                await exitDemoSession();
                navigate('/login', { replace: true });
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-colors shrink-0"
            >
              Exit Demo
            </button>
          )}

          {/* SINGLE NOTIFICATION BELL (MOBILE & DESKTOP) */}
          <button
            type="button"
            onClick={() => navigate(`${baseUrl}/notifications`)}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer relative shrink-0"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5 text-slate-700 dark:text-[#CBD5E1]" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-white leading-none flex items-center justify-center shadow-xs select-none"
                style={{ backgroundColor: theme.primaryColor || '#2563EB' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>



          {/* DESKTOP PROFILE DROPDOWN MENU */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 border-l border-slate-200 dark:border-[#263244] pl-3 py-1 hover:bg-slate-50 dark:hover:bg-[#172033] rounded-xl transition-all cursor-pointer min-h-[44px]"
            >
              <Avatar src={user?.avatarUrl} name={user?.fullName || user?.email} size="xs" />
              <span className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC]">{user?.fullName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-slate-200 dark:border-[#263244] py-2 z-50 animate-in fade-in zoom-in-95 text-left font-sans text-xs">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-[#263244]">
                  <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] block truncate">{user?.fullName}</span>
                  <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] font-normal truncate block">{user?.email}</span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate(`${baseUrl}/settings`);
                    }}
                    className="w-full px-4 py-2 text-left font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                    <span>View Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate(`${baseUrl}/settings`);
                    }}
                    className="w-full px-4 py-2 text-left font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] flex items-center gap-2.5 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                    <span>Profile &amp; Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-[#263244]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT BODY */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* DESKTOP LEFT NAVIGATION SIDEBAR */}
        <aside
          className="hidden md:block w-60 bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-[#263244] p-3 space-y-1 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto hide-scrollbar text-left"
        >
          <div className="px-3 py-2 text-[10px] font-semibold uppercase text-slate-400 dark:text-[#64748B] tracking-wider">Course Navigation</div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = isNavItemActive(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="w-full h-11 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer whitespace-nowrap text-left"
                style={{
                  backgroundColor: isSelected ? (theme.primarySoft || '#EFF6FF') : undefined,
                  color: isSelected ? theme.primaryColor : undefined,
                }}
              >
                <div className="inline-flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: isSelected ? theme.primaryColor : '#64748B' }} />
                  <span className="truncate font-medium">{item.label}</span>
                </div>
                {isSelected && <ChevronRight className="w-4 h-4 shrink-0" style={{ color: theme.primaryColor }} />}
              </button>
            );
          })}
        </aside>

        {/* PAGE CONTENT CONTAINER */}
        <main className={`flex-1 overflow-y-auto hide-scrollbar ${
          location.pathname.includes('/personal-chat') || location.pathname.includes('/video-session')
            ? 'p-0 sm:p-4 md:p-6 pb-0 md:pb-6'
            : 'p-4 md:p-6 pb-[88px] md:pb-6'
        }`}>
          <Outlet />
        </main>
      </div>

      {/* 3. MOBILE BOTTOM NAV BAR FOR QUICK SWITCHING */}
      {!mobileMenuOpen && !location.pathname.includes('/personal-chat') && !location.pathname.includes('/video-session') && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#263244] px-2 py-1 font-sans text-[10px]">
          <div className="flex items-center justify-around h-12">
            <button
              type="button"
              onClick={() => navigate(`${baseUrl}/overview`)}
              className={`flex flex-col items-center justify-center gap-1 h-full min-h-[44px] cursor-pointer ${
                isNavItemActive(`${baseUrl}/overview`) ? 'text-[#2563EB] font-bold' : 'text-slate-600 dark:text-[#CBD5E1]'
              }`}
              style={{
                color: isNavItemActive(`${baseUrl}/overview`) ? theme.primaryColor : undefined,
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Overview</span>
            </button>

            {isFeatureEnabled(COURSE_FEATURE_KEYS.LESSONS) && (
              <button
                type="button"
                onClick={() => navigate(`${baseUrl}/learn`)}
                className={`flex flex-col items-center justify-center gap-1 h-full min-h-[44px] cursor-pointer ${
                  isNavItemActive(`${baseUrl}/learn`) ? 'text-[#2563EB] font-bold' : 'text-slate-600 dark:text-[#CBD5E1]'
                }`}
                style={{
                  color: isNavItemActive(`${baseUrl}/learn`) ? theme.primaryColor : undefined,
                }}
              >
                <PlayCircle className="w-4 h-4" />
                <span>Learn</span>
              </button>
            )}

            {isFeatureEnabled(COURSE_FEATURE_KEYS.LESSONS) && (
              <button
                type="button"
                onClick={() => navigate(`${baseUrl}/curriculum`)}
                className={`flex flex-col items-center justify-center gap-1 h-full min-h-[44px] cursor-pointer ${
                  isNavItemActive(`${baseUrl}/curriculum`) ? 'text-[#2563EB] font-bold' : 'text-slate-600 dark:text-[#CBD5E1]'
                }`}
                style={{
                  color: isNavItemActive(`${baseUrl}/curriculum`) ? theme.primaryColor : undefined,
                }}
              >
                <ListTree className="w-4 h-4" />
                <span>Curriculum</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`${baseUrl}/settings`)}
              className={`flex flex-col items-center justify-center gap-1 h-full min-h-[44px] cursor-pointer ${
                isNavItemActive(`${baseUrl}/settings`) ? 'text-[#2563EB] font-bold' : 'text-slate-600 dark:text-[#CBD5E1]'
              }`}
              style={{
                color: isNavItemActive(`${baseUrl}/settings`) ? theme.primaryColor : undefined,
              }}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center gap-1 h-full min-h-[44px] text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F8FAFC] cursor-pointer"
            >
              <Menu className="w-4 h-4 text-slate-700 dark:text-[#CBD5E1]" />
              <span>More</span>
            </button>
          </div>
        </nav>
      )}

      {/* 4. FULL-HEIGHT RIGHT SLIDE-OVER MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden font-sans">
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* FULL-HEIGHT RIGHT DRAWER PANEL */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-[#111827] shadow-2xl flex flex-col justify-between z-10 text-left font-sans text-xs border-l border-slate-200 dark:border-[#263244]">
            {/* DRAWER HEADER: STUDENT PROFILE DETAILS */}
            <div className="p-4 border-b border-slate-100 dark:border-[#263244] bg-slate-50/80 dark:bg-[#0F172A] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={user?.avatarUrl} name={user?.fullName || user?.email} size="md" />
                <div className="min-w-0 text-left">
                  <span className="font-bold text-xs text-slate-950 dark:text-[#F8FAFC] block truncate">{user?.fullName}</span>
                  <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] font-normal truncate block">{user?.email}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-11 h-11 rounded-xl bg-slate-200/60 dark:bg-[#172033] flex items-center justify-center text-slate-600 dark:text-[#CBD5E1] font-bold hover:bg-slate-200 dark:hover:bg-[#1E293B] cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DRAWER BODY: COURSE NAVIGATION & OPTIONS */}
            <div className="p-3 space-y-1 flex-1 overflow-y-auto text-left scroll-smooth">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 dark:text-[#64748B] tracking-wider">
                Course Navigation
              </div>

              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isSelected = isNavItemActive(item.path);

                return (
                  <button
                    key={item.path}
                    ref={isSelected ? activeNavItemRef : undefined}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className="w-full h-11 px-3 rounded-xl font-medium flex items-center justify-between transition-all cursor-pointer min-h-[44px] whitespace-nowrap text-left"
                    style={{
                      backgroundColor: isSelected ? (theme.primarySoft || '#EFF6FF') : undefined,
                      color: isSelected ? theme.primaryColor : undefined,
                    }}
                  >
                    <div className="inline-flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: isSelected ? theme.primaryColor : '#64748B' }} />
                      <span className="truncate font-medium">{item.label}</span>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 shrink-0" style={{ color: theme.primaryColor }} />}
                  </button>
                );
              })}
            </div>

            {/* DRAWER FOOTER: APPEARANCE, SETTINGS & LOGOUT */}
            <div className="p-3 border-t border-slate-100 dark:border-[#263244] bg-slate-50/50 dark:bg-[#0F172A] space-y-2 shrink-0 text-left">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#172033]">
                <span className="font-semibold text-slate-700 dark:text-[#CBD5E1]">Theme</span>
                <ThemeToggle />
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(`${baseUrl}/settings`);
                }}
                className="w-full h-11 px-3 rounded-xl font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] min-h-[44px] cursor-pointer whitespace-nowrap text-left"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-500 dark:text-[#94A3B8]" />
                  <span>Profile &amp; Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-[#64748B]" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full h-11 px-3 rounded-xl font-semibold flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 min-h-[44px] cursor-pointer whitespace-nowrap text-left"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Log Out</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING PERSONAL CHAT BUTTON (Hidden on /personal-chat route & when mobile drawer is open) */}
      {!location.pathname.includes('/personal-chat') && !mobileMenuOpen && (
        <button
          type="button"
          aria-label="Open personal chat"
          onClick={() => navigate(`${baseUrl}/personal-chat`)}
          style={{ backgroundColor: theme.primaryColor }}
          className="fixed right-5 bottom-[84px] md:bottom-[calc(30px+env(safe-area-inset-bottom))] z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-md text-white hover:opacity-90 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <MessageCircle className="h-5 w-5 shrink-0 text-white" />
        </button>
      )}
    </div>
  );
};
