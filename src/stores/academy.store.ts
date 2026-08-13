import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AcademyTheme {
  primaryColor: string;
  primaryHover: string;
  primarySoft: string;
  secondaryColor: string;
  accentColor: string;
}

export interface AcademyEntity {
  id: string;
  uuid: string;
  academyUuid: string; // compatibility key
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
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    github?: string;
  };
  theme: AcademyTheme;
  enrolledCoursesCount: number;
  overallProgressPercent: number;
  lastActiveAt: string;
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

export const MOCK_ACADEMIES: AcademyEntity[] = [
  {
    id: 'acad-101',
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Bright Academy of Technology',
    tagline: 'Master Full-Stack Engineering, Cloud Native, and React 19',
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=180',
    faviconUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=32',
    heroHeadline: 'Build Production-Grade Software with Hands-On Industry Mentorship',
    heroSubheadline: 'Join over 4,200 software engineers learning modern web architecture, cloud deployment, and system design.',
    aboutText: 'Bright Academy of Technology was founded in 2021 by Dr. Vikramaditya Rao to bridge the gap between academic computer science and modern enterprise software engineering practices.',
    instructorName: 'Dr. Vikramaditya Rao',
    instructorTitle: 'Principal Software Architect & Lead Instructor',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    instructorBio: 'Former Senior Staff Architect with 15+ years leading distributed engineering teams. Author of 3 best-selling system design guides.',
    supportEmail: 'support@brightacademy.io',
    supportPhone: '+1 (800) 555-0199',
    socialLinks: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      youtube: 'https://youtube.com',
      github: 'https://github.com',
    },
    theme: {
      primaryColor: '#2563EB',
      primaryHover: '#1D4ED8',
      primarySoft: '#EFF6FF',
      secondaryColor: '#1E293B',
      accentColor: '#3B82F6',
    },
    enrolledCoursesCount: 2,
    overallProgressPercent: 68,
    lastActiveAt: '2 hours ago',
  },
  {
    id: 'acad-102',
    uuid: '660f9511-f3ac-52e5-b827-557766551111',
    academyUuid: '660f9511-f3ac-52e5-b827-557766551111',
    name: 'CodeVerse Software Academy',
    tagline: 'Enterprise DevOps, Kubernetes, and Cloud Native Infrastructure',
    logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180',
    faviconUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=32',
    heroHeadline: 'Accelerate Your Career in Cloud Infrastructure & Kubernetes',
    heroSubheadline: 'Hands-on canary deployments, automated CI/CD pipelines, and microservices architecture.',
    aboutText: 'CodeVerse Software Academy specializes in enterprise DevOps training, preparing engineers for AWS, GCP, and Kubernetes certifications with real cluster sandboxes.',
    instructorName: 'Priya Sharma',
    instructorTitle: 'Head of Cloud DevOps & Infrastructure',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    instructorBio: 'Certified Kubernetes Administrator (CKA) with extensive background automating multi-cloud Kubernetes clusters.',
    supportEmail: 'help@codeverse.in',
    supportPhone: '+91 98765 43210',
    socialLinks: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
    },
    theme: {
      primaryColor: '#059669',
      primaryHover: '#047857',
      primarySoft: '#ECFDF5',
      secondaryColor: '#064E3B',
      accentColor: '#10B981',
    },
    enrolledCoursesCount: 1,
    overallProgressPercent: 42,
    lastActiveAt: 'Yesterday',
  },
  {
    id: 'acad-103',
    uuid: '770a0622-a4bd-63f6-c938-668877662222',
    academyUuid: '770a0622-a4bd-63f6-c938-668877662222',
    name: 'MathWorld Data Institute',
    tagline: 'Applied Machine Learning, Neural Networks & AI Engineering',
    logoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=180',
    faviconUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=32',
    heroHeadline: 'Master Machine Learning & Large Language Models',
    heroSubheadline: 'From mathematical foundations to fine-tuning state-of-the-art transformer models for production.',
    aboutText: 'MathWorld Data Institute empowers data scientists and ML engineers with rigorous mathematical frameworks and PyTorch deep learning models.',
    instructorName: 'Dr. Meera Iyer',
    instructorTitle: 'AI Research Scientist & Professor',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
    instructorBio: 'Ph.D. in Machine Learning with 20+ peer-reviewed papers on neural network optimization and hyperparameter tuning.',
    supportEmail: 'contact@mathworld.edu',
    supportPhone: '+1 (888) 444-9876',
    socialLinks: {
      linkedin: 'https://linkedin.com',
      youtube: 'https://youtube.com',
    },
    theme: {
      primaryColor: '#D97706',
      primaryHover: '#B45309',
      primarySoft: '#FFFBEB',
      secondaryColor: '#78350F',
      accentColor: '#F59E0B',
    },
    enrolledCoursesCount: 1,
    overallProgressPercent: 85,
    lastActiveAt: '3 days ago',
  },
];

export const applyAcademyThemeCss = (academy: AcademyEntity) => {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--theme-primary', academy.theme.primaryColor);
  document.documentElement.style.setProperty('--theme-primary-hover', academy.theme.primaryHover);
  document.documentElement.style.setProperty('--theme-primary-soft', academy.theme.primarySoft);
  document.documentElement.style.setProperty('--theme-secondary', academy.theme.secondaryColor);
  document.documentElement.style.setProperty('--theme-accent', academy.theme.accentColor);
  document.title = `${academy.name} | CubixSkill`;

  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = academy.faviconUrl || academy.logoUrl;
};

interface AcademyState {
  academies: AcademyEntity[];
  activeAcademyUuid: string;
  activeAcademy: AcademyEntity | null;
  getAcademyByUuid: (uuid: string) => AcademyEntity | undefined;
  setActiveAcademyUuid: (uuid: string) => void;
  setActiveAcademy: (academy: AcademyEntity | null) => void;
  loadAcademyThemeByUuid: (uuid: string) => AcademyEntity | undefined;
  clearActiveAcademy: () => void;
}

export const useAcademyStore = create<AcademyState>()(
  persist(
    (set, get) => ({
      academies: MOCK_ACADEMIES,
      activeAcademyUuid: '550e8400-e29b-41d4-a716-446655440000',
      activeAcademy: MOCK_ACADEMIES[0],

      getAcademyByUuid: (uuid) => {
        const found = get().academies.find((a) => a.uuid === uuid || a.academyUuid === uuid);
        return found;
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
      name: 'cubixskill_student_academy_store_v4',
    }
  )
);

