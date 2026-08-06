import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CourseEntity {
  id: string;
  uuid: string;
  academyUuid: string;
  title: string;
  thumbnail: string;
  instructorName: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  currentModuleTitle: string;
  currentLessonTitle: string;
  lastActiveAt: string;
  accessExpiryDate: string;
  features: {
    assignments: boolean;
    quizzes: boolean;
    liveClasses: boolean;
    certificates: boolean;
    announcements: boolean;
    discussions: boolean;
    personalChat?: boolean;
  };
}

export const MOCK_COURSES: CourseEntity[] = [
  {
    id: 'crs-1',
    uuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Full Stack React 19 & Cloud Architecture',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    instructorName: 'Dr. Vikramaditya Rao',
    level: 'Intermediate',
    language: 'English',
    progressPercent: 72,
    completedLessonsCount: 18,
    totalLessonsCount: 25,
    currentModuleTitle: 'Module 3: Server Actions & State Hydration',
    currentLessonTitle: '3.2 Optimistic UI Updates & Zustand Sync',
    lastActiveAt: '2 hours ago',
    accessExpiryDate: '2027-12-31',
    features: {
      assignments: true,
      quizzes: true,
      liveClasses: true,
      certificates: true,
      announcements: true,
      discussions: true,
    },
  },
  {
    id: 'crs-2',
    uuid: '8b67ac90-87b1-3a00-7a70-81c2ca01a400',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Enterprise DevOps & Kubernetes Deployment',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    instructorName: 'Priya Sharma',
    level: 'Advanced',
    language: 'English',
    progressPercent: 45,
    completedLessonsCount: 9,
    totalLessonsCount: 20,
    currentModuleTitle: 'Module 2: Helm Charts & CI/CD Pipelines',
    currentLessonTitle: '2.1 Automated Canary Deployments',
    lastActiveAt: 'Yesterday',
    accessExpiryDate: '2026-10-15',
    features: {
      assignments: true,
      quizzes: true,
      liveClasses: true,
      certificates: true,
      announcements: true,
      discussions: true,
    },
  },
  {
    id: 'crs-3',
    uuid: '7a569b8f-76a0-29ff-696f-70b1b9009300',
    academyUuid: '660f9511-f3ac-52e5-b827-557766551111',
    title: 'Node.js Microservices & Event-Driven Systems',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
    instructorName: 'Aarav Patel',
    level: 'Advanced',
    language: 'English',
    progressPercent: 42,
    completedLessonsCount: 8,
    totalLessonsCount: 19,
    currentModuleTitle: 'Module 2: RabbitMQ & Kafka Message Bus',
    currentLessonTitle: '2.3 Idempotent Event Handlers',
    lastActiveAt: 'Yesterday',
    accessExpiryDate: '2027-05-20',
    features: {
      assignments: true,
      quizzes: true,
      liveClasses: true,
      certificates: true,
      announcements: true,
      discussions: true,
    },
  },
  {
    id: 'crs-4',
    uuid: '6f458a7e-659f-18ee-585e-6f90a8ff8200',
    academyUuid: '770a0622-a4bd-63f6-c938-668877662222',
    title: 'Applied Machine Learning & Neural Networks',
    thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600',
    instructorName: 'Dr. Meera Iyer',
    level: 'Intermediate',
    language: 'English',
    progressPercent: 85,
    completedLessonsCount: 17,
    totalLessonsCount: 20,
    currentModuleTitle: 'Module 4: Model Evaluation & Fine-Tuning',
    currentLessonTitle: '4.2 Hyperparameter Tuning with Ray Tune',
    lastActiveAt: '3 days ago',
    accessExpiryDate: '2028-01-01',
    features: {
      assignments: true,
      quizzes: true,
      liveClasses: true,
      certificates: true,
      announcements: true,
      discussions: true,
    },
  },
];

interface CourseStoreState {
  courses: CourseEntity[];
  activeCourseUuid: string;
  setActiveCourseUuid: (uuid: string) => void;
}

export const useCourseStore = create<CourseStoreState>()(
  persist(
    (set) => ({
      courses: MOCK_COURSES,
      activeCourseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',

      setActiveCourseUuid: (uuid) => set({ activeCourseUuid: uuid }),
    }),
    {
      name: 'cubixskill_student_course_store_v2',
    }
  )
);
