import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, BookOpen, Mail, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import type { AcademyEntity } from '../../stores/academy.store';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { authService } from '../../features/auth/services/auth.service';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const student = useAuthStore((state) => state.student);
  const { handleLogout: executeStudentLogout } = useStudentLogout();

  const baseUrl = `/${academy.uuid}`;

  // Save last academy whenever header renders
  useEffect(() => {
    if (academy.uuid) {
      setLastAcademy(academy.uuid);
    }
  }, [academy.uuid]);

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await executeStudentLogout(academy.uuid);
  };

  const navLinks = [
    { label: 'Home', href: baseUrl, icon: Home },
    { label: 'Courses', href: `${baseUrl}/courses`, icon: BookOpen },
    { label: 'Contact', href: `${baseUrl}/contact`, icon: Mail },
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 min-h-[64px] flex items-center justify-between gap-3 py-2 sm:py-0">
        {/* LEFT / LOGO */}
        <Link to={baseUrl} className="flex items-center gap-3 flex-1 min-w-0 md:flex-initial">
          <Avatar src={academy.logoUrl} name={academy.name} type="academy" size="md" />
          <div className="flex-1 min-w-0 text-left">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] leading-tight whitespace-normal break-words">
              {academy.name}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-[#94A3B8] leading-snug line-clamp-1 font-normal">
              {academy.tagline}
            </p>
          </div>
        </Link>

        {/* CENTER: DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = link.href === baseUrl ? pathname === baseUrl : pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
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
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Avatar src={student?.avatarUrl} name={student?.fullName || student?.email} size="xs" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1]">
                {student?.fullName || student?.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl font-semibold text-xs border border-slate-200 dark:border-[#263244] hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to={`${baseUrl}/login`}
                className="px-3.5 py-2 rounded-xl font-semibold text-xs border border-slate-200 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>

              <Link
                to={`${baseUrl}/register`}
                style={{ backgroundColor: academy.theme?.primaryColor || '#2563EB' }}
                className="px-4 py-2 rounded-xl font-semibold text-xs text-white hover:opacity-90 transition-opacity shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>

        {/* MOBILE RIGHT SIDE: THEME TOGGLE + MENU BUTTON */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            className="w-10 h-10 flex items-center justify-center shrink-0 bg-transparent border border-slate-200 dark:border-[#263244] rounded-xl text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION PANEL */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 w-full z-50 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#263244] shadow-xl text-left animate-in slide-in-from-top-2 duration-200">
          <nav className="px-4 py-4 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === baseUrl ? pathname === baseUrl : pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA]'
                      : 'text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-100 dark:border-[#263244] space-y-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout ({student?.fullName || student?.email})</span>
                </button>
              ) : (
                <>
                  <Link
                    to={`${baseUrl}/login`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#263244] text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>

                  <Link
                    to={`${baseUrl}/register`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ backgroundColor: academy.theme?.primaryColor || '#2563EB' }}
                    className="flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-2xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
