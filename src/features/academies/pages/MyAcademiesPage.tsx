import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Clock, LogOut } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useAcademyStore } from '../../../stores/academy.store';
import { useAuthStore } from '../../../stores/auth.store';

export const MyAcademiesPage: React.FC = () => {
  const navigate = useNavigate();
  const academies = useAcademyStore((state) => state.academies);
  const setActiveAcademyUuid = useAcademyStore((state) => state.setActiveAcademyUuid);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleEnterAcademy = (uuid: string) => {
    setActiveAcademyUuid(uuid);
    navigate(`/student/academies/${uuid}/courses`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-xs text-left p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">My Academies</h1>
              <Badge variant="info" size="sm">Global Student Account</Badge>
            </div>
            <p className="text-[13px] sm:text-sm text-slate-500 font-normal mt-1">
              Welcome back, <strong className="font-semibold text-slate-700">{user?.fullName}</strong>! Choose an academy to continue your learning journey.
            </p>
          </div>

          <div className="flex items-center gap-3 font-medium text-slate-600 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-medium">Single Account Access</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-semibold"
            >
              Log Out
            </Button>
          </div>
        </div>

        {/* ACADEMY CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {academies.map((acad) => (
            <Card key={acad.id} padding="md" className="bg-white border border-slate-200/80 hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between shadow-2xs hover:shadow-xs">
              <div className="space-y-3">
                <div>
                  <img src={acad.logoUrl} alt={acad.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200/80 shadow-2xs" />
                </div>

                <div>
                  <h3 className="font-semibold text-base sm:text-[18px] text-slate-900 leading-snug">{acad.name}</h3>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between font-medium text-slate-700 text-xs">
                    <span>Overall Progress</span>
                    <span className="font-semibold" style={{ color: acad.theme.primaryColor }}>{acad.overallProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ backgroundColor: acad.theme.primaryColor, width: `${acad.overallProgressPercent}%` }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-normal">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{acad.enrolledCoursesCount} Enrolled Courses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{acad.lastActiveAt}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleEnterAcademy(acad.uuid)}
                className="w-full mt-2 font-semibold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                style={{ backgroundColor: acad.theme.primaryColor }}
              >
                Enter Academy
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
