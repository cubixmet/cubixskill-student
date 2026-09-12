import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, LogIn, UserPlus, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import type { AcademyEntity } from '../../stores/academy.store';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { setLastAcademy } from '../../lib/navigationIntent';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { useStudentLogout } from '../../hooks/useStudentLogout';

interface AcademyHeaderProps {
  academy: AcademyEntity;
}

export const AcademyHeader: React.FC<AcademyHeaderProps> = ({ academy }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const student = useAuthStore((state) => state.student);
  const { handleLogout: executeStudentLogout } = useStudentLogout();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const baseUrl = `/${academy.uuid}`;

  // Save last academy whenever header renders
  useEffect(() => {
    if (academy.uuid) {
      setLastAcademy(academy.uuid);
    }
  }, [academy.uuid]);

  // Lock background scroll when drawer is open and handle Escape key
  useEffect(() => {
    if (!mobileDrawerOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileDrawerOpen]);

  // Close drawer on route navigation
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setMobileDrawerOpen(false);
    await executeStudentLogout(academy.uuid);
  };

  const navLinks = [
    { label: 'Home', href: baseUrl, icon: Home },
    { label: 'Courses', href: `${baseUrl}/courses`, icon: BookOpen },
  ];

  if (isAuthenticated) {
    navLinks.push({
      label: 'Dashboard',
      href: `/student/academies/${academy.uuid}`,
      icon: LayoutDashboard,
    });
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#263244] font-sans text-xs relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-0">
        {/* DESKTOP LAYOUT (SINGLE ROW) */}
        <div className="hidden md:flex min-h-[64px] items-center justify-between gap-4">
          {/* LEFT / LOGO */}
          <Link to={baseUrl} className="flex items-center gap-2.5 shrink-0 max-w-xs lg:max-w-sm">
            <Avatar src={academy.logoUrl} name={academy.name} type="academy" size="md" />
            <div className="min-w-0 text-left">
              <h1 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] leading-snug line-clamp-2 break-words">
                {academy.name}
              </h1>
              {academy.tagline && (
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-tight line-clamp-1 font-normal">
                  {academy.tagline}
                </p>
              )}
            </div>
          </Link>

          {/* CENTER: DESKTOP NAV LINKS */}
          <nav className="flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const isActive = link.href === baseUrl ? pathname === baseUrl : pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#2563EB] dark:text-[#60A5FA]'
                      : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: DESKTOP CTAs + THEME TOGGLE */}
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Avatar src={student?.avatarUrl} name={student?.fullName || student?.email} size="xs" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1] truncate max-w-[120px]">
                  {student?.fullName || student?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl font-semibold text-xs border border-slate-200 dark:border-[#263244] hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to={`${baseUrl}/login`}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl font-semibold text-xs border border-slate-200 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>

                <Link
                  to={`${baseUrl}/register`}
                  style={{ backgroundColor: academy.theme?.primaryColor || '#2563EB' }}
                  className="min-h-[44px] px-4 py-2 rounded-xl font-semibold text-xs text-white hover:opacity-90 transition-opacity shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* MOBILE HEADER BAR */}
        <div className="md:hidden flex items-center justify-between min-h-[56px] py-1.5 gap-2">
          {/* BRAND LOGO + ACADEMY NAME */}
          <Link to={baseUrl} className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center">
              <Avatar src={academy.logoUrl} name={academy.name} type="academy" size="md" />
            </div>
            <div className="min-w-0 text-left">
              <h1 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] leading-tight break-words line-clamp-2">
                {academy.name}
              </h1>
              {academy.tagline && (
                <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] leading-none font-normal line-clamp-1">
                  {academy.tagline}
                </p>
              )}
            </div>
          </Link>

          {/* HAMBURGER MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#263244] flex items-center justify-center text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#1E293B] cursor-pointer shrink-0 transition-colors"
            aria-label="Open menu"
            aria-expanded={mobileDrawerOpen}
          >
            <Menu className="w-5 h-5 text-slate-800 dark:text-slate-200" />
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-OVER NAVIGATION DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          {/* OVERLAY BACKDROP CLICK CLOSES DRAWER */}
          <div className="absolute inset-0" onClick={() => setMobileDrawerOpen(false)} aria-hidden="true" />

          {/* DRAWER PANEL */}
          <div className="relative z-10 w-full max-h-[85vh] h-auto bg-white dark:bg-[#111827] rounded-t-3xl border-t border-slate-200 dark:border-[#263244] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* DRAWER HEADER (FLEX SHRINK 0) */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#263244]">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar src={academy.logoUrl} name={academy.name} type="academy" size="sm" />
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[200px]">
                  {academy.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DRAWER SCROLLABLE BODY (FLEX-1 MIN-H-0 OVERFLOW-Y-AUTO) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 font-sans">
              {/* NAVIGATION LINKS */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 block">
                  Navigation
                </span>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = link.href === baseUrl ? pathname === baseUrl : pathname === link.href || pathname.startsWith(link.href + '/');
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                        isActive
                          ? 'bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA]'
                          : 'text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <hr className="border-slate-100 dark:border-[#263244]" />

              {/* THEME SWITCHER ROW */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#172033] rounded-2xl">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Appearance Theme</span>
                <ThemeToggle />
              </div>

              <hr className="border-slate-100 dark:border-[#263244]" />

              {/* USER / AUTH ACTION SECTION */}
              <div className="space-y-2 pt-1">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-[#172033] rounded-2xl">
                      <Avatar src={student?.avatarUrl} name={student?.fullName || student?.email} size="sm" />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {student?.fullName || 'Student Account'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {student?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`${baseUrl}/login`}
                      onClick={() => setMobileDrawerOpen(false)}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs border border-slate-200 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </Link>

                    <Link
                      to={`${baseUrl}/register`}
                      onClick={() => setMobileDrawerOpen(false)}
                      style={{ backgroundColor: academy.theme?.primaryColor || '#2563EB' }}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs text-white hover:opacity-90 transition-opacity shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
