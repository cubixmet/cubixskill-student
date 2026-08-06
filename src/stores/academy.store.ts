import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudentTheme {
  id: string;
  name: string;
  primaryColor: string;
  primaryHover: string;
  primarySoft: string;
  secondaryColor: string;
  accentColor: string;
}

export interface AcademyEntity {
  id: string;
  uuid: string;
  name: string;
  logoUrl: string;
  theme: StudentTheme;
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

export const PREBUILT_THEMES: StudentTheme[] = [
  { id: 'theme-1', name: 'Modern Blue', primaryColor: '#2563EB', primaryHover: '#1D4ED8', primarySoft: '#EFF6FF', secondaryColor: '#1D4ED8', accentColor: '#3B82F6' },
  { id: 'theme-2', name: 'Dark Emerald', primaryColor: '#059669', primaryHover: '#047857', primarySoft: '#ECFDF5', secondaryColor: '#047857', accentColor: '#10B981' },
  { id: 'theme-3', name: 'Indigo Enterprise', primaryColor: '#4F46E5', primaryHover: '#4338CA', primarySoft: '#EEF2FF', secondaryColor: '#4338CA', accentColor: '#6366F1' },
  { id: 'theme-4', name: 'Cyber Purple', primaryColor: '#7C3AED', primaryHover: '#6D28D9', primarySoft: '#F5F3FF', secondaryColor: '#6D28D9', accentColor: '#8B5CF6' },
  { id: 'theme-5', name: 'Warm Amber', primaryColor: '#D97706', primaryHover: '#B45309', primarySoft: '#FFFBEB', secondaryColor: '#B45309', accentColor: '#F59E0B' },
];

export const MOCK_ACADEMIES: AcademyEntity[] = [
  {
    id: 'acad-101',
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Bright Academy of Technology',
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120',
    theme: PREBUILT_THEMES[0],
    enrolledCoursesCount: 2,
    overallProgressPercent: 68,
    lastActiveAt: '2 hours ago',
  },
  {
    id: 'acad-102',
    uuid: '660f9511-f3ac-52e5-b827-557766551111',
    name: 'CodeVerse Software Academy',
    logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120',
    theme: PREBUILT_THEMES[1],
    enrolledCoursesCount: 1,
    overallProgressPercent: 42,
    lastActiveAt: 'Yesterday',
  },
  {
    id: 'acad-103',
    uuid: '770a0622-a4bd-63f6-c938-668877662222',
    name: 'MathWorld Data Institute',
    logoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=120',
    theme: PREBUILT_THEMES[4],
    enrolledCoursesCount: 1,
    overallProgressPercent: 85,
    lastActiveAt: '3 days ago',
  },
];

interface AcademyState {
  academies: AcademyEntity[];
  activeAcademyUuid: string;
  setActiveAcademyUuid: (uuid: string) => void;
}

export const useAcademyStore = create<AcademyState>()(
  persist(
    (set) => ({
      academies: MOCK_ACADEMIES,
      activeAcademyUuid: '550e8400-e29b-41d4-a716-446655440000',

      setActiveAcademyUuid: (uuid) => set({ activeAcademyUuid: uuid }),
    }),
    {
      name: 'cubixskill_student_academy_store_v3',
    }
  )
);
