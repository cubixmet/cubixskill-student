import React, { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { AlertCircle, Building2, UserCheck } from 'lucide-react';
import { studentPortalService } from '../../../services/studentPortal.service';
import { useAuthStore } from '../../../stores/auth.store';
import { AcademyHeader } from '../../../components/layout/AcademyHeader';
import { AcademyFooter } from '../../../components/layout/AcademyFooter';
import { resolveMediaUrl } from '../../../services/apiClient';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface PublicAcademyContextType {
  academyUuid: string;
  publicData: any;
  publicCourses: any[];
  academyEntity: any;
  isLoading: boolean;
  isNotFound: boolean;
}

const PublicAcademyContext = createContext<PublicAcademyContextType | null>(null);

export const usePublicAcademy = (): PublicAcademyContextType | null => {
  return useContext(PublicAcademyContext);
};

export const PublicAcademyLayout: React.FC = () => {
  const { academyUuid } = useParams<{ academyUuid: string }>();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const [publicData, setPublicData] = useState<any>(null);
  const [publicCourses, setPublicCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const isValidUuid = !!academyUuid && UUID_REGEX.test(academyUuid.trim());

  useEffect(() => {
    let isMounted = true;
    async function loadPublicAcademyData() {
      if (!isValidUuid) {
        setIsLoading(false);
        setIsNotFound(true);
        return;
      }

      try {
        setIsLoading(true);
        const websiteConfig = await studentPortalService.getPublicAcademyWebsite(academyUuid!);
        if (!websiteConfig && isMounted) {
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }

        const coursesList = await studentPortalService.getPublicAcademyCourses(academyUuid!);

        if (isMounted) {
          setPublicData(websiteConfig);
          setPublicCourses(coursesList || []);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsNotFound(true);
          setIsLoading(false);
        }
      }
    }

    loadPublicAcademyData();
    return () => { isMounted = false; };
  }, [academyUuid, isValidUuid]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-slate-50 dark:bg-[#0B0F17]">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] animate-pulse flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <p className="text-slate-500 dark:text-[#94A3B8] font-medium text-xs">Loading academy website...</p>
      </div>
    );
  }

  if (!isValidUuid || isNotFound || !publicData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-slate-50 dark:bg-[#0B0F17]">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">Academy Not Found</h1>
        <p className="text-slate-500 dark:text-[#94A3B8] max-w-md">
          This academy does not exist or is no longer publicly available. Please check the URL or return to login.
        </p>
        <Link to="/login" className="px-5 py-2.5 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] transition-all">
          Go to Student Login
        </Link>
      </div>
    );
  }

  const academyInfo = publicData.academy || {};
  const themeConfig = publicData.theme || {};

  const primaryColor = themeConfig.primary_color || academyInfo.theme_color || '#2563EB';

  const academyEntity = {
    id: academyUuid!,
    uuid: academyUuid!,
    academyUuid: academyUuid!,
    name: academyInfo.name || 'Academy',
    tagline: themeConfig.hero_badge || 'Software Engineering Academy',
    logoUrl: academyInfo.logo ? resolveMediaUrl(academyInfo.logo) : '',
    faviconUrl: academyInfo.favicon ? resolveMediaUrl(academyInfo.favicon) : '',
    heroHeadline: publicData.home?.hero_title || 'Master Production Software Skills',
    heroSubheadline: publicData.home?.hero_subtitle || 'Join official industry-accredited courses.',
    aboutText: '',
    instructorName: 'Academy Instructor',
    instructorTitle: 'Lead Educator',
    instructorAvatar: '',
    instructorBio: '',
    supportEmail: academyInfo.email || 'support@cubixskill.com',
    supportPhone: academyInfo.phone || '',
    theme: {
      primaryColor,
      primaryHover: '#1D4ED8',
      primarySoft: '#EFF6FF',
      secondaryColor: '#1E293B',
      accentColor: '#3B82F6',
    },
    enrolledCoursesCount: publicCourses.length,
    overallProgressPercent: 0,
    lastActiveAt: 'Recently active',
  };

  const contextValue: PublicAcademyContextType = {
    academyUuid: academyUuid!,
    publicData,
    publicCourses,
    academyEntity,
    isLoading,
    isNotFound,
  };

  return (
    <PublicAcademyContext.Provider value={contextValue}>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F17] font-sans text-xs text-slate-900 dark:text-[#F8FAFC]">
        {/* AUTHENTICATED STUDENT BANNER */}
        {isAuthenticated && (
          <div className="bg-[#2563EB] text-white py-2.5 px-4 text-xs font-medium flex flex-wrap items-center justify-between gap-2 z-50 shadow-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Signed in as <strong>{user?.fullName || user?.email}</strong></span>
            </div>
            <Link
              to={`/student/academies/${academyUuid}`}
              className="px-3.5 py-1 rounded-lg bg-white text-[#2563EB] font-semibold text-xs hover:bg-slate-100 transition-colors shadow-2xs"
            >
              Open Student Dashboard →
            </Link>
          </div>
        )}

        {/* SHARED ACADEMY HEADER */}
        <AcademyHeader academy={academyEntity} />

        {/* CHILD ROUTE CONTENT */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* SHARED ACADEMY FOOTER */}
        <AcademyFooter academy={academyEntity} />
      </div>
    </PublicAcademyContext.Provider>
  );
};
