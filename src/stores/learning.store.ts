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
  submissions: AssignmentSubmission[];
  quizAttempts: QuizAttempt[];
  certificates: CertificateItem[];

  markLessonComplete: (lessonId: string) => void;
  updateWatchPercentage: (lessonId: string, percent: number) => void;
  addAssignmentSubmission: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  addQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'attemptedAt'>) => void;
}

export const useLearningStore = create<LearningStoreState>()(
  persist(
    (set) => ({
      completedLessonIds: ['les-1.1', 'les-1.2', 'les-2.1', 'les-2.2', 'les-3.1'],
      watchPercentages: {
        'les-3.2': 80,
      },

      submissions: [
        {
          id: 'sub-1',
          assignmentTitle: 'Build a Reactive State Store with Zustand',
          submittedAt: '2026-08-04T10:30:00Z',
          submissionType: 'file',
          content: 'zustand_state_store.zip (2.4 MB)',
          status: 'Approved',
          gradeMarks: 95,
          maxMarks: 100,
          feedback: 'Excellent clean state architecture implementation with persist middleware.',
        },
      ],

      quizAttempts: [
        {
          id: 'qa-1',
          quizTitle: 'React 19 Server Components Architecture',
          attemptedAt: '2026-08-02T14:15:00Z',
          scorePercent: 90,
          passed: true,
        },
      ],

      certificates: [
        {
          uuid: '550e8400-e29b-41d4-a716-446655440000',
          courseTitle: 'Full Stack React 19 & Cloud Architecture',
          studentName: 'Alex Student',
          issuedAt: '2026-08-05',
          certificateNumber: 'CS-CERT-2026-98741',
          verificationStatus: 'VERIFIED_OFFICIAL',
        },
      ],

      markLessonComplete: (lessonId) => {
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds
            : [...state.completedLessonIds, lessonId],
        }));
      },

      updateWatchPercentage: (lessonId, percent) => {
        set((state) => ({
          watchPercentages: { ...state.watchPercentages, [lessonId]: percent },
        }));
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
    }),
    {
      name: 'cubixskill_student_learning_store_v1',
    }
  )
);
