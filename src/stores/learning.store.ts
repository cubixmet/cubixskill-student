import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AssignmentSubmission {
  id: string;
  assignmentTitle: string;
  submittedAt: string;
  submissionType: 'text' | 'file';
  content: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  gradeMarks?: number;
  maxMarks: number;
  feedback?: string;
}

export interface QuizAttempt {
  id: string;
  quizTitle: string;
  attemptedAt: string;
  scorePercent: number;
  passed: boolean;
}

export interface CertificateItem {
  uuid: string;
  courseTitle: string;
  studentName: string;
  issuedAt: string;
  certificateNumber: string;
  verificationStatus: 'VERIFIED_OFFICIAL';
}

interface LearningStoreState {
  completedLessonIds: string[];
  watchPercentages: Record<string, number>;
  lastAccessedLessonUuid?: string;
  lastCompletedLessonUuid?: string;
  submissions: AssignmentSubmission[];
  quizAttempts: QuizAttempt[];
  certificates: CertificateItem[];

  markLessonComplete: (lessonId: string) => void;
  updateWatchPercentage: (lessonId: string, percent: number) => void;
  setLastAccessedLessonUuid: (lessonId: string) => void;
  addAssignmentSubmission: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  addQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'attemptedAt'>) => void;
  reset: () => void;
}

export const useLearningStore = create<LearningStoreState>()(
  persist(
    (set) => ({
      completedLessonIds: [],
      watchPercentages: {},
      lastAccessedLessonUuid: '',
      submissions: [],
      quizAttempts: [],
      certificates: [],

      markLessonComplete: (lessonId) => {
        set((state) => {
          if (state.completedLessonIds.includes(lessonId)) {
            return state;
          }
          return {
            completedLessonIds: [...state.completedLessonIds, lessonId],
            lastCompletedLessonUuid: lessonId,
          };
        });
      },

      updateWatchPercentage: (lessonId, percent) => {
        set((state) => ({
          watchPercentages: { ...state.watchPercentages, [lessonId]: percent },
        }));
      },

      setLastAccessedLessonUuid: (lessonId) => {
        set({ lastAccessedLessonUuid: lessonId });
      },

      addAssignmentSubmission: (sub) => {
        const newSub: AssignmentSubmission = {
          ...sub,
          id: `sub-${Date.now()}`,
          submittedAt: new Date().toISOString(),
          status: 'Pending Review',
        };
        set((state) => ({ submissions: [newSub, ...state.submissions] }));
      },

      addQuizAttempt: (attempt) => {
        const newAttempt: QuizAttempt = {
          ...attempt,
          id: `qa-${Date.now()}`,
          attemptedAt: new Date().toISOString(),
        };
        set((state) => ({ quizAttempts: [newAttempt, ...state.quizAttempts] }));
      },

      reset: () => {
        set({
          completedLessonIds: [],
          watchPercentages: {},
          lastAccessedLessonUuid: '',
          lastCompletedLessonUuid: '',
          submissions: [],
          quizAttempts: [],
          certificates: [],
        });
      },
    }),
    {
      name: 'cubixskill_student_learning_store_v1',
    }
  )
);
