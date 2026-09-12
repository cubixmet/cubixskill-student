import React, { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { AlertCircle, Building2, UserCheck } from 'lucide-react';
import { studentPortalService } from '../../../services/studentPortal.service';
import { useAuthStore } from '../../../stores/auth.store';
import { AcademyHeader } from '../../../components/layout/AcademyHeader';
import { AcademyFooter } from '../../../components/layout/AcademyFooter';
import { resolveMediaUrl } from '../../../services/apiClient';
import { ScrollToTop } from '../../../components/layout/ScrollToTop';

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

  const academyInfo = publicData?.academy || {};
  const themeConfig = publicData?.theme || {};

  const primaryColor = themeConfig.primary_color || academyInfo.theme_color || '#2563EB';

  const logoUrl = academyInfo.logo
    ? resolveMediaUrl(academyInfo.logo)
    : themeConfig.logo_url
    ? resolveMediaUrl(themeConfig.logo_url)
    : '';

  const faviconUrl = academyInfo.favicon
    ? resolveMediaUrl(academyInfo.favicon)
    : themeConfig.favicon_url
    ? resolveMediaUrl(themeConfig.favicon_url)
    : '';

  const heroImageUrl = resolveMediaUrl(publicData?.home?.hero_image_url || themeConfig.hero_image_url) || logoUrl;

  useEffect(() => {
    const rawFavicon = faviconUrl || logoUrl;
    const resolved = rawFavicon ? resolveMediaUrl(rawFavicon) : '/favicon.svg';

    // Remove existing icon links
    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach((el) => el.remove());

    const newLink = document.createElement('link');
    newLink.rel = 'icon';

    const cleanPath = resolved.split('?')[0].toLowerCase();
    if (cleanPath.endsWith('.svg')) {
      newLink.type = 'image/svg+xml';
    } else if (cleanPath.endsWith('.png')) {
      newLink.type = 'image/png';
    } else if (cleanPath.endsWith('.jpg') || cleanPath.endsWith('.jpeg')) {
      newLink.type = 'image/jpeg';
    } else if (cleanPath.endsWith('.ico')) {
      newLink.type = 'image/x-icon';
    }

    // Stable cache busting / versioning parameter
    const versionedUrl = resolved.includes('?')
      ? resolved
      : `${resolved}?v=${encodeURIComponent(publicData?.updated_at || publicData?.published_at || '1')}`;

    newLink.href = versionedUrl;
    document.getElementsByTagName('head')[0].appendChild(newLink);

    if (academyInfo.name) {
      document.title = `${academyInfo.name} | Academy Portal`;
    }
  }, [faviconUrl, logoUrl, academyInfo.name, publicData?.updated_at, publicData?.published_at]);

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

  if (isNotFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-slate-50 dark:bg-[#0B0F17]">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Academy Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          The academy code <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">{academyUuid}</code> was not found or is unavailable.
        </p>
        <Link to="/academies" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
          Browse All Academies
        </Link>
      </div>
    );
  }

  const academyEntity = {
    id: academyUuid!,
    uuid: academyUuid!,
    academyUuid: academyUuid!,
    name: academyInfo.name || 'Academy',
    tagline: themeConfig.hero_badge || 'Software Engineering Academy',
    logoUrl,
    faviconUrl,
    heroImageUrl,
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
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F17] font-sans text-xs text-slate-900 dark:text-[#F8FAFC]">
        {/* AUTHENTICATED STUDENT BANNER */}
        {isAuthenticated && (
          <div
            style={{ backgroundColor: primaryColor }}
            className="text-white py-2.5 px-4 text-xs font-medium flex flex-wrap items-center justify-between gap-2 z-50 shadow-xs"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">Signed in as <strong className="break-all">{user?.fullName || user?.email}</strong></span>
            </div>
            <Link
              to={`/student/academies/${academyUuid}`}
              style={{ color: primaryColor }}
              className="px-3.5 py-1.5 rounded-lg bg-white font-semibold text-xs hover:bg-slate-100 transition-colors shadow-2xs shrink-0"
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
