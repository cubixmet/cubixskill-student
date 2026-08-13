import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, BookOpen, Mail, LogIn } from 'lucide-react';
import type { AcademyEntity } from '../../stores/academy.store';

interface AcademyHeaderProps {
  academy: AcademyEntity;
}

export const AcademyHeader: React.FC<AcademyHeaderProps> = ({ academy }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseUrl = `/${academy.uuid}`;

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'Home', href: baseUrl, icon: Home },
    { label: 'Courses', href: `${baseUrl}/courses`, icon: BookOpen },
    { label: 'Contact', href: `${baseUrl}/contact`, icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 font-sans text-xs relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 min-h-[64px] flex items-center justify-between gap-2 py-2 sm:py-0">
        {/* MOBILE MENU TOGGLE BUTTON (LEFT SIDE) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          className="
            md:hidden
            w-10
            h-10
            flex
            items-center
            justify-center
            shrink-0
            bg-transparent
            border-0
            rounded-lg
            text-slate-800
            hover:bg-slate-100
            cursor-pointer
            -ml-1
          "
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* LEFT/CENTER: ACADEMY LOGO & NAME */}
        <Link to={baseUrl} className="flex items-center gap-3 flex-1 min-w-0 md:flex-initial">
          <img
            src={academy.logoUrl}
            alt={academy.name}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-slate-900 leading-tight whitespace-normal break-words">
              {academy.name}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 leading-snug line-clamp-2">
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
                className={`relative py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
                style={{
                  color: isActive ? academy.theme.primaryColor : undefined,
                }}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full animate-in fade-in"
                    style={{ backgroundColor: academy.theme.primaryColor }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: DESKTOP CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to={`${baseUrl}/login`}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs border border-slate-200 hover:bg-slate-50 text-slate-700 inline-flex items-center gap-2 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>

          <Link
            to={`${baseUrl}/register`}
            style={{ backgroundColor: academy.theme.primaryColor }}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white hover:opacity-90 transition-opacity shadow-xs inline-flex items-center"
          >
            Enroll Now
          </Link>
        </div>
      </div>

      {/* MOBILE NAVIGATION PANEL */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 w-full z-50 bg-white border-t border-slate-200 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="px-4 py-4 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === baseUrl ? pathname === baseUrl : pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: isActive ? academy.theme.primarySoft : undefined,
                    color: isActive ? academy.theme.primaryColor : '#334155',
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to={`${baseUrl}/login`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>

              <Link
                to={`${baseUrl}/register`}
                onClick={() => setMobileMenuOpen(false)}
                style={{ backgroundColor: academy.theme.primaryColor }}
                className="flex items-center justify-center w-full min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs"
              >
                Enroll
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

