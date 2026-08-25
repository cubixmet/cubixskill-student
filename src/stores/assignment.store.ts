import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AssignmentSubmissionMethod = 'url' | 'file' | 'text';

export interface AssignmentLessonConfig {
  assignmentUuid: string;
  lessonUuid: string;
  instructions: string;
  submissionMethods: AssignmentSubmissionMethod[];
  requiresInstructorReview: boolean;
  allowResubmission: boolean;
  dueAt?: string;
  acceptedMimeTypes?: string[];
  maxFileSizeBytes?: number;
}

export interface AssignmentSubmission {
  submissionUuid: string;
  studentUuid: string;
  academyUuid: string;
  courseUuid: string;
  lessonUuid: string;
  assignmentUuid: string;
  url?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  textResponse?: string;
  status: 'draft' | 'submitted' | 'awaiting_review' | 'approved' | 'changes_requested';
  submittedAt?: string;
  reviewedAt?: string;
  feedback?: string;
  gradeMarks?: number;
  maxMarks?: number;
}

interface AssignmentStoreState {
  submissions: Record<string, AssignmentSubmission>; // Keyed by `${studentUuid}_${lessonUuid}`

  submitAssignment: (
    submission: Omit<AssignmentSubmission, 'submissionUuid' | 'submittedAt' | 'status'>,
    requiresInstructorReview: boolean
  ) => AssignmentSubmission;

  updateSubmissionStatus: (
    submissionUuid: string,
    status: AssignmentSubmission['status'],
    feedback?: string,
    gradeMarks?: number
  ) => void;

  getSubmission: (studentUuid: string, lessonUuid: string) => AssignmentSubmission | undefined;
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentStoreState>()(
  persist(
    (set, get) => ({
      submissions: {},

      submitAssignment: (data, requiresInstructorReview) => {
        const key = `${data.studentUuid}_${data.lessonUuid}`;
        const newSubmission: AssignmentSubmission = {
          ...data,
          submissionUuid: `sub-${Date.now()}`,
          status: requiresInstructorReview ? 'awaiting_review' : 'approved',
          submittedAt: new Date().toISOString(),
        };

        set((state) => ({
          submissions: {
            ...state.submissions,
            [key]: newSubmission,
          },
        }));

        return newSubmission;
      },

      updateSubmissionStatus: (submissionUuid, status, feedback, gradeMarks) => {
        set((state) => {
          const updatedSubmissions = { ...state.submissions };
          for (const key in updatedSubmissions) {
            if (updatedSubmissions[key].submissionUuid === submissionUuid) {
              updatedSubmissions[key] = {
                ...updatedSubmissions[key],
                status,
                feedback: feedback ?? updatedSubmissions[key].feedback,
                gradeMarks: gradeMarks ?? updatedSubmissions[key].gradeMarks,
                reviewedAt: new Date().toISOString(),
              };
            }
          }
          return { submissions: updatedSubmissions };
        });
      },

      getSubmission: (studentUuid, lessonUuid) => {
        const key = `${studentUuid}_${lessonUuid}`;
        return get().submissions[key];
      },

      reset: () => set({ submissions: {} }),
    }),
    {
      name: 'cubixskill:assignment-store',
    }
  )
);
