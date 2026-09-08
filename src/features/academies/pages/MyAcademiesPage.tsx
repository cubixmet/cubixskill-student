import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Clock, LogOut, Building2, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useAcademyStore } from '../../../stores/academy.store';
import { useAuthStore } from '../../../stores/auth.store';
import { resolveMediaUrl } from '../../../services/apiClient';
import { Avatar } from '../../../components/ui/Avatar';
import { useStudentLogout } from '../../../hooks/useStudentLogout';

export const MyAcademiesPage: React.FC = () => {
  const navigate = useNavigate();
  const academies = useAcademyStore((state) => state.academies);
  const isLoading = useAcademyStore((state) => state.isLoading);
  const fetchAcademies = useAcademyStore((state) => state.fetchAcademies);
  const setActiveAcademyUuid = useAcademyStore((state) => state.setActiveAcademyUuid);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    fetchAcademies();
  }, [fetchAcademies]);

  const handleEnterAcademy = (uuid: string) => {
    setActiveAcademyUuid(uuid);
    navigate(`/${uuid}`);
  };

  const { handleLogout: executeStudentLogout } = useStudentLogout();

  const handleLogout = async () => {
    await executeStudentLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] font-sans text-xs text-left p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-4 md:p-6 rounded-2xl border border-slate-200/80 dark:border-[#263244] shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight">
                My Academies
              </h1>
              <Badge variant="info" size="sm">Global Student Account</Badge>
            </div>
            <p className="text-[13px] sm:text-sm text-slate-500 dark:text-[#94A3B8] font-normal mt-1">
              Welcome back, <strong className="font-semibold text-slate-700 dark:text-[#E2E8F0]">{user?.fullName || 'Student'}</strong>! Choose an academy to continue learning.
            </p>
          </div>

          <div className="flex items-center gap-3 font-medium text-slate-600 dark:text-[#CBD5E1] text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#172033] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-[#263244]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-medium">Single Account Access</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 font-semibold"
            >
              Log Out
            </Button>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        )}

        {/* EMPTY ACADEMIES STATE */}
        {!isLoading && academies.length === 0 && (
          <Card className="p-8 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 dark:text-[#64748B] mx-auto" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">No Academies Linked Yet</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-md mx-auto">
              Your global student account is active. Once an instructor enrolls you in an academy or course, it will appear here.
            </p>
          </Card>
        )}

        {/* ACADEMY CARDS GRID */}
        {!isLoading && academies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {academies.map((acad) => {
              const logo = acad.logoUrl ? resolveMediaUrl(acad.logoUrl) : '';
              return (
                <Card
                  key={acad.id || acad.uuid}
                  padding="md"
                  className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] hover:border-[#2563EB] dark:hover:border-[#3B82F6] transition-all space-y-4 flex flex-col justify-between shadow-2xs hover:shadow-xs text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={acad.logoUrl} name={acad.name} type="academy" size="lg" />
                      <div>
                        <h3 className="font-semibold text-base sm:text-[18px] text-slate-900 dark:text-[#F8FAFC] leading-snug">
                          {acad.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">
                          {acad.enrolledCoursesCount} {acad.enrolledCoursesCount === 1 ? 'Course' : 'Courses'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] line-clamp-2">
                      {acad.tagline}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] font-normal pt-2 border-t border-slate-100 dark:border-[#263244]">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{acad.enrolledCoursesCount} Enrolled</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{acad.lastActiveAt}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleEnterAcademy(acad.uuid || acad.id)}
                    aria-label={`Open ${acad.name}`}
                    className="w-full mt-2 font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] justify-center"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    style={{ backgroundColor: acad.theme?.primaryColor || '#2563EB' }}
                  >
                    Open Academy
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
