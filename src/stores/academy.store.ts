import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { studentPortalService } from '../services/studentPortal.service';

export interface AcademyTheme {
  primaryColor: string;
  primaryHover: string;
  primarySoft: string;
  primaryForeground?: string;
  secondaryColor: string;
  secondaryHover?: string;
  secondaryForeground?: string;
  accentColor: string;
}

export const FIXED_PORTAL_SURFACES = {
  pageBackground: '#F8FAFC',
  headerBackground: '#FFFFFF',
  sidebarBackground: '#FFFFFF',
  cardBackground: '#FFFFFF',
  inputBackground: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  secondaryText: '#64748B',
};

export interface AcademyEntity {
  id: string;
  uuid: string;
  academyUuid: string;
  name: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  aboutText: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  instructorBio: string;
  supportEmail: string;
  supportPhone: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    github?: string;
  };
  theme: AcademyTheme;
  features?: {
    lesson_locking?: boolean;
    student_reports?: boolean;
  };
  enrolledCoursesCount: number;
  overallProgressPercent: number;
  lastActiveAt: string;
}

export const applyAcademyThemeCss = (academy: AcademyEntity) => {
  if (typeof document === 'undefined') return;
  const primary = academy.theme?.primaryColor || '#2563EB';
  const primaryHover = academy.theme?.primaryHover || '#1D4ED8';
  const primarySoft = academy.theme?.primarySoft || '#EFF6FF';
  const primaryForeground = academy.theme?.primaryForeground || '#FFFFFF';
  const secondary = academy.theme?.secondaryColor || '#1E293B';
  const secondaryHover = academy.theme?.secondaryHover || '#334155';
  const secondaryForeground = academy.theme?.secondaryForeground || '#F8FAFC';
  const accent = academy.theme?.accentColor || '#3B82F6';

  // Legacy theme variables
  document.documentElement.style.setProperty('--theme-primary', primary);
  document.documentElement.style.setProperty('--theme-primary-hover', primaryHover);
  document.documentElement.style.setProperty('--theme-primary-soft', primarySoft);
  document.documentElement.style.setProperty('--theme-secondary', secondary);
  document.documentElement.style.setProperty('--theme-accent', accent);

  // Dynamic Website Builder semantic brand tokens
  document.documentElement.style.setProperty('--brand-primary', primary);
  document.documentElement.style.setProperty('--brand-primary-hover', primaryHover);
  document.documentElement.style.setProperty('--brand-primary-soft', primarySoft);
  document.documentElement.style.setProperty('--brand-primary-foreground', primaryForeground);

  document.documentElement.style.setProperty('--brand-secondary', secondary);
  document.documentElement.style.setProperty('--brand-secondary-hover', secondaryHover);
  document.documentElement.style.setProperty('--brand-secondary-foreground', secondaryForeground);

  document.documentElement.style.setProperty('--brand-accent', accent);

  document.title = `${academy.name} | CubixSkill Student`;

  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = academy.faviconUrl || academy.logoUrl || '/favicon.ico';
};

interface AcademyState {
  academies: AcademyEntity[];
  activeAcademyUuid: string;
  activeAcademy: AcademyEntity | null;
  isLoading: boolean;
  fetchAcademies: () => Promise<AcademyEntity[]>;
  getAcademyByUuid: (uuid: string) => AcademyEntity | undefined;
  setActiveAcademyUuid: (uuid: string) => void;
  setActiveAcademy: (academy: AcademyEntity | null) => void;
  loadAcademyThemeByUuid: (uuid: string) => AcademyEntity | undefined;
  clearActiveAcademy: () => void;
}

let academiesPromise: Promise<AcademyEntity[]> | null = null;
let lastFetchedTime = 0;

export const useAcademyStore = create<AcademyState>()(
  persist(
    (set, get) => ({
      academies: [],
      activeAcademyUuid: '',
      activeAcademy: null,
      isLoading: false,

      fetchAcademies: async (force = false) => {
        const now = Date.now();
        const currentAcademies = get().academies;
        if (!force && currentAcademies.length > 0 && now - lastFetchedTime < 30000) {
          return currentAcademies;
        }

        if (academiesPromise) {
          return academiesPromise;
        }
        set({ isLoading: true });
        academiesPromise = (async () => {
          try {
            const list = await studentPortalService.getAcademiesList();
            lastFetchedTime = Date.now();
            set({ academies: list, isLoading: false });
            if (list.length > 0 && !get().activeAcademyUuid) {
              get().setActiveAcademyUuid(list[0].uuid);
            }
            return list;
          } catch {
            set({ isLoading: false });
            return get().academies;
          } finally {
            academiesPromise = null;
          }
        })();
        return academiesPromise;
      },

      getAcademyByUuid: (uuid) => {
        return get().academies.find((a) => a.uuid === uuid || a.academyUuid === uuid || a.id === uuid);
      },

      setActiveAcademyUuid: (uuid) => {
        const found = get().getAcademyByUuid(uuid);
        if (found) {
          applyAcademyThemeCss(found);
          set({ activeAcademyUuid: uuid, activeAcademy: found });
        } else {
          set({ activeAcademyUuid: uuid });
        }
      },

      setActiveAcademy: (academy) => {
        if (academy) {
          applyAcademyThemeCss(academy);
          set({ activeAcademyUuid: academy.uuid, activeAcademy: academy });
        } else {
          set({ activeAcademy: null });
        }
      },

      loadAcademyThemeByUuid: (uuid) => {
        const found = get().getAcademyByUuid(uuid);
        if (found) {
          applyAcademyThemeCss(found);
          set({ activeAcademyUuid: uuid, activeAcademy: found });
        }
        return found;
      },

      clearActiveAcademy: () => set({ activeAcademy: null, activeAcademyUuid: '' }),
    }),
    {
      name: 'cubixskill_student_academy_store_v5',
    }
  )
);
