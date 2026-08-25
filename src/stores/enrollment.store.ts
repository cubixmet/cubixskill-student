import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CourseEnrollment {
  id: string;
  studentUuid: string;
  academyUuid: string;
  courseUuid: string;
  accessType: 'full' | 'demo';
  status: 'active' | 'expired' | 'completed';
  startedAt: string;
  expiresAt?: string;
}

interface EnrollmentStoreState {
  enrollments: CourseEnrollment[];
  getEnrollment: (studentUuid: string, courseUuid: string) => CourseEnrollment | undefined;
  getStudentEnrollments: (studentUuid: string) => CourseEnrollment[];
  createOrUpdateEnrollment: (params: {
    studentUuid: string;
    academyUuid: string;
    courseUuid: string;
    accessType: 'full' | 'demo';
    demoDurationDays?: number;
  }) => CourseEnrollment;
  upgradeToFullAccess: (studentUuid: string, courseUuid: string) => void;
  isEnrollmentExpired: (enrollment: CourseEnrollment) => boolean;
  reset: () => void;
}

export const useEnrollmentStore = create<EnrollmentStoreState>()(
  persist(
    (set, get) => ({
      enrollments: [],

      getEnrollment: (studentUuid, courseUuid) => {
        const enrollment = get().enrollments.find(
          (e) => (e.studentUuid === studentUuid || studentUuid === 'any') && e.courseUuid === courseUuid
        );

        if (enrollment && get().isEnrollmentExpired(enrollment)) {
          return { ...enrollment, status: 'expired' };
        }

        return enrollment;
      },

      getStudentEnrollments: (studentUuid) => {
        return get().enrollments.filter((e) => e.studentUuid === studentUuid);
      },

      createOrUpdateEnrollment: ({ studentUuid, academyUuid, courseUuid, accessType, demoDurationDays = 5 }) => {
        const existing = get().enrollments.find(
          (e) => e.studentUuid === studentUuid && e.courseUuid === courseUuid
        );

        const now = new Date();
        let expiresAt: string | undefined;

        if (accessType === 'demo') {
          const expDate = new Date(now.getTime() + demoDurationDays * 24 * 60 * 60 * 1000);
          expiresAt = expDate.toISOString();
        }

        if (existing) {
          const updated: CourseEnrollment = {
            ...existing,
            accessType,
            status: 'active',
            startedAt: now.toISOString(),
            expiresAt: accessType === 'demo' ? expiresAt : undefined,
          };
          set((state) => ({
            enrollments: state.enrollments.map((e) => (e.id === existing.id ? updated : e)),
          }));
          return updated;
        }

        const newEnrollment: CourseEnrollment = {
          id: `enr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentUuid,
          academyUuid,
          courseUuid,
          accessType,
          status: 'active',
          startedAt: now.toISOString(),
          expiresAt,
        };

        set((state) => ({
          enrollments: [...state.enrollments, newEnrollment],
        }));

        return newEnrollment;
      },

      upgradeToFullAccess: (studentUuid, courseUuid) => {
        set((state) => ({
          enrollments: state.enrollments.map((e) => {
            if (e.studentUuid === studentUuid && e.courseUuid === courseUuid) {
              return {
                ...e,
                accessType: 'full',
                status: 'active',
                expiresAt: undefined,
              };
            }
            return e;
          }),
        }));
      },

      isEnrollmentExpired: (enrollment) => {
        if (enrollment.accessType !== 'demo') return false;
        if (!enrollment.expiresAt) return false;
        return Date.now() > new Date(enrollment.expiresAt).getTime();
      },

      reset: () => set({ enrollments: [] }),
    }),
    {
      name: 'cubixskill_student_enrollment_store_v1',
    }
  )
);
