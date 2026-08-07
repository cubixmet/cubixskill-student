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

export const StudentPortalLayout: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501' } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();
  const location = useLocation();

  const academies = useAcademyStore((state) => state.academies);
  const courses = useCourseStore((state) => state.courses);
  const user = useAuthStore((state) => state.user);
  const isDemoSession = useAuthStore((state) => state.isDemoSession);
  const exitDemoSession = useAuthStore((state) => state.exitDemoSession);
  const logout = useAuthStore((state) => state.logout);

  const academy = academies.find((a) => a.uuid === academyUuid);
  const course = courses.find((c) => c.academyUuid === academyUuid && c.uuid === courseUuid);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const theme = academy?.theme || {
    primaryColor: '#2563EB',
    primaryHover: '#1D4ED8',
    primarySoft: '#EFF6FF',
  };

  const baseUrl = `/student/academies/${academyUuid}/courses/${courseUuid}`;

  const navItems = [
    { label: 'My Course', path: `${baseUrl}/overview`, icon: BookOpen },
    { label: 'Continue Learning', path: `${baseUrl}/learn`, icon: PlayCircle },
    { label: 'Curriculum', path: `${baseUrl}/curriculum`, icon: ListTree },
    { label: 'Assignments', path: `${baseUrl}/assignments`, icon: FileCheck, featureKey: 'assignments' },
    { label: 'Quizzes', path: `${baseUrl}/quizzes`, icon: HelpCircle, featureKey: 'quizzes' },
    { label: 'Live Classes', path: `${baseUrl}/live-classes`, icon: Video, featureKey: 'liveClasses' },
    { label: 'Certificates', path: `${baseUrl}/certificates`, icon: Award, featureKey: 'certificates' },
    { label: 'Announcements', path: `${baseUrl}/announcements`, icon: Bell, featureKey: 'announcements' },
    { label: 'Discussions', path: `${baseUrl}/discussions`, icon: MessageSquare, featureKey: 'discussions' },
    { label: 'Personal Chat', path: `${baseUrl}/personal-chat`, icon: MessageCircle },
    { label: 'Downloads', path: `${baseUrl}/downloads`, icon: Download },
    { label: 'Calendar', path: `${baseUrl}/calendar`, icon: Calendar },
    { label: 'Notifications', path: `${baseUrl}/notifications`, icon: Bell },
    { label: 'Profile & Settings', path: `${baseUrl}/settings`, icon: Settings },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (!item.featureKey) return true;
    return course?.features?.[item.featureKey as keyof typeof course.features] !== false;
  });

  return (
    <div
      className="min-h-screen flex flex-col font-sans bg-[#F8FAFC] text-[#0F172A] text-xs hide-scrollbar"
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
        style={{ backgroundColor: FIXED_PORTAL_SURFACES.headerBackground }}
        className="h-14 sm:h-[60px] border-b border-slate-200/80 px-3 sm:px-6 sticky top-0 z-40 flex items-center justify-between shadow-2xs"
      >
        {/* DESKTOP LEFT BRANDING */}
        <div className="hidden md:flex items-center gap-3">
          <img src={academy?.logoUrl} alt="Logo" className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-2xs" />
          <div>
            <span className="font-semibold text-xs text-slate-900 block leading-tight">
              {academy?.name || 'Academy'}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold truncate max-w-xs block">
              {course?.title ? (isDemoSession ? `${course.title} (DEMO)` : course.title) : 'Selected Course'}
            </span>
          </div>
        </div>

        {/* MOBILE HEADER: [Academy Logo + Name (minmax(0,1fr))] [Notification (44px)] */}
        <div className="grid md:hidden grid-cols-[minmax(0,1fr)_44px] items-center gap-2.5 w-full h-full">
          {/* 1. BRANDING BLOCK (LOGO + ACADEMY NAME & SUBTITLE) */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={academy?.logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'}
              alt={academy?.name || 'Academy Logo'}
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[13px] font-semibold text-slate-950 truncate block leading-tight">
                {academy?.name || 'CodeVerse Software Academy'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-normal text-slate-500 truncate block">
                {course?.title ? (isDemoSession ? `${course.title} (DEMO)` : course.title) : 'Node.js Microservices & Event-Driven Systems'}
              </span>
            </div>
          </div>

          {/* 2. NOTIFICATION BUTTON */}
          <button
            type="button"
            onClick={() => navigate(`${baseUrl}/notifications`)}
            className="w-11 h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer relative min-h-[44px] min-w-[44px]"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: theme.primaryColor }}
            />
          </button>
        </div>

        {/* DESKTOP RIGHT PROFILE & NOTIFICATIONS */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${baseUrl}/notifications`)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-[#64748B]" />
            <span
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: theme.primaryColor }}
            />
          </button>

          {/* COMPACT PROFILE DROPDOWN MENU */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 border-l border-slate-200 pl-3 py-1 hover:bg-slate-50 rounded-xl transition-all cursor-pointer min-h-[44px]"
            >
              <img src={user?.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs" />
              <span className="font-semibold text-xs text-slate-900">{user?.fullName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 text-left font-sans text-xs">
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-900 block truncate">{user?.fullName}</span>
                  <span className="text-[11px] text-slate-400 font-normal truncate block">{user?.email}</span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate(`${baseUrl}/settings`);
                    }}
                    className="w-full px-4 py-2 text-left font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#64748B]" />
                    <span>View Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate(`${baseUrl}/notifications`);
                    }}
                    className="w-full px-4 py-2 text-left font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-[#64748B]" />
                    <span>Notifications</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate(`${baseUrl}/settings`);
                    }}
                    className="w-full px-4 py-2 text-left font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#64748B]" />
                    <span>Profile &amp; Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
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
          style={{ backgroundColor: FIXED_PORTAL_SURFACES.sidebarBackground }}
          className="hidden md:block w-60 border-r border-slate-200/80 p-3 space-y-1 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto hide-scrollbar"
        >
          <div className="px-3 py-2 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Course Navigation</div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = location.pathname === item.path || (item.path.endsWith('/overview') && location.pathname === baseUrl);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'shadow-2xs'
                    : 'text-[#475569] hover:bg-slate-100 hover:text-slate-900'
                }`}
                style={{
                  backgroundColor: isSelected ? (theme.primarySoft || '#EFF6FF') : undefined,
                  color: isSelected ? theme.primaryColor : undefined,
                }}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className="w-4 h-4 shrink-0"
                    style={{ color: isSelected ? theme.primaryColor : '#64748B' }}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <ChevronRight
                  className="w-3.5 h-3.5"
                  style={{ color: isSelected ? theme.primaryColor : '#CBD5E1' }}
                />
              </button>
            );
          })}
        </aside>

        {/* ROUTE CONTENT PAGE AREA */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-[88px] md:pb-6 hide-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-[env(safe-area-inset-bottom)] shadow-lg font-sans text-[10px] font-semibold">
        <div className="grid h-16 grid-cols-5 items-center">
          <button
            type="button"
            onClick={() => navigate(`${baseUrl}/overview`)}
            className="flex flex-col items-center justify-center gap-1 h-full min-h-[44px] cursor-pointer"
            style={{
              color: (location.pathname.endsWith('/overview') || location.pathname === baseUrl) ? theme.primaryColor : '#64748B',
            }}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Course</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`${baseUrl}/learn`)}
            className="flex flex-col items-center justify-center gap-1 h-full min-h-[44px] cursor-pointer"
            style={{
              color: location.pathname.endsWith('/learn') ? theme.primaryColor : '#64748B',
            }}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Learn</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`${baseUrl}/live-classes`)}
            className="flex flex-col items-center justify-center gap-1 h-full min-h-[44px] cursor-pointer"
            style={{
              color: location.pathname.endsWith('/live-classes') ? theme.primaryColor : '#64748B',
            }}
          >
            <Video className="w-4 h-4" />
            <span>Live</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`${baseUrl}/settings`)}
            className="flex flex-col items-center justify-center gap-1 h-full min-h-[44px] cursor-pointer"
            style={{
              color: location.pathname.endsWith('/settings') ? theme.primaryColor : '#64748B',
            }}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 h-full min-h-[44px] text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <Menu className="w-4 h-4 text-slate-700" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* 4. FULL-HEIGHT RIGHT SLIDE-OVER MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden font-sans">
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* FULL-HEIGHT RIGHT DRAWER PANEL */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col justify-between z-10 text-left font-sans text-xs overflow-y-auto hide-scrollbar">
            {/* DRAWER HEADER: STUDENT PROFILE DETAILS */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-950 block truncate">{user?.fullName || 'Alex Student'}</span>
                  <span className="text-[11px] text-slate-400 font-normal truncate block">{user?.email || 'alex.student@cubixskill.com'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-200/60 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DRAWER BODY: COURSE NAVIGATION & OPTIONS */}
            <div className="p-3 space-y-1 flex-1 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Course Navigation
              </div>

              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isSelected = location.pathname === item.path || (item.path.endsWith('/overview') && location.pathname === baseUrl);

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className="w-full h-11 px-3 rounded-xl font-semibold flex items-center justify-between transition-all cursor-pointer min-h-[44px] whitespace-nowrap"
                    style={{
                      backgroundColor: isSelected ? (theme.primarySoft || '#EFF6FF') : undefined,
                      color: isSelected ? theme.primaryColor : '#1E293B',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: isSelected ? theme.primaryColor : '#64748B' }} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" style={{ color: isSelected ? theme.primaryColor : '#CBD5E1' }} />
                  </button>
                );
              })}
            </div>

            {/* DRAWER FOOTER: PROFILE, SETTINGS & LOGOUT */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(`${baseUrl}/settings`);
                }}
                className="w-full h-11 px-3 rounded-xl font-semibold flex items-center justify-between hover:bg-slate-100 text-slate-700 min-h-[44px] cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Profile &amp; Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full h-11 px-3 rounded-xl font-semibold flex items-center justify-between hover:bg-rose-50 text-rose-600 min-h-[44px] cursor-pointer whitespace-nowrap"
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
    </div>
  );
};
