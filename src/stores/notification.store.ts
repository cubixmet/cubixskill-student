import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType =
  | 'live_class'
  | 'announcement'
  | 'assignment'
  | 'assessment'
  | 'discussion'
  | 'personal_chat'
  | 'course_update'
  | 'certificate'
  | 'demo'
  | 'system';

export interface NotificationContext {
  lessonUuid?: string;
  assignmentUuid?: string;
  liveClassUuid?: string;
  discussionPostUuid?: string;
  conversationUuid?: string;
  certificateUuid?: string;
}

export interface StudentNotification {
  notificationUuid: string;
  studentUuid: string;
  academyUuid: string;
  courseUuid?: string;
  type: NotificationType;
  title: string;
  message: string;
  context?: NotificationContext;
  action?: {
    label?: string;
    route?: string;
  };
  createdAt: string;
  readAt?: string;
}

interface NotificationStoreState {
  notifications: StudentNotification[];

  addNotification: (data: Omit<StudentNotification, 'notificationUuid' | 'createdAt'>) => StudentNotification;
  markRead: (notificationUuid: string) => void;
  markAllRead: (studentUuid: string, courseUuid?: string) => void;
  getUnreadCount: (studentUuid: string, courseUuid?: string) => number;
  getCourseNotifications: (studentUuid: string, courseUuid?: string) => StudentNotification[];
}

const INITIAL_MOCK_NOTIFICATIONS: StudentNotification[] = [
  {
    notificationUuid: 'notif-501',
    studentUuid: 'std-production-1',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    type: 'live_class',
    title: 'Live Class Starting Soon',
    message: 'React 19 Compiler Architecture & State Masterclass begins in 15 minutes.',
    context: { liveClassUuid: 'live-301' },
    action: { label: 'Join Live Class' },
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
  },
  {
    notificationUuid: 'notif-502',
    studentUuid: 'std-production-1',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    type: 'personal_chat',
    title: 'New Message from Academy Support',
    message: 'Priya Sharma (Support Lead) replied regarding Lesson 1.1 Server Components.',
    context: { conversationUuid: 'conv-101' },
    action: { label: 'Open Academy Chat' },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    notificationUuid: 'notif-503',
    studentUuid: 'std-production-1',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    type: 'assignment',
    title: 'Assignment Submitted & Awaiting Review',
    message: 'Your Build Authentication API project solution was received.',
    context: { lessonUuid: 'les-3.3' },
    action: { label: 'View Assignment' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    notificationUuid: 'notif-504',
    studentUuid: 'std-production-1',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    type: 'announcement',
    title: 'Course Announcement: Schedule Update',
    message: 'Tomorrow’s distributed caching workshop has been rescheduled to Thursday at 7:00 PM.',
    action: { label: 'View Course Schedule' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    notificationUuid: 'notif-505',
    studentUuid: 'std-production-1',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    type: 'discussion',
    title: 'New Reply in Course Discussion',
    message: 'Dr. Aarav Patel replied to your post regarding useActionState optimism.',
    context: { discussionPostUuid: 'post-402' },
    action: { label: 'Open Discussion' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
];

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_MOCK_NOTIFICATIONS,

      addNotification: (data) => {
        const newNotif: StudentNotification = {
          ...data,
          notificationUuid: `notif-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));

        return newNotif;
      },

      markRead: (notificationUuid) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.notificationUuid === notificationUuid ? { ...n, readAt: new Date().toISOString() } : n
          ),
        }));
      },

      markAllRead: (studentUuid, courseUuid) => {
        const now = new Date().toISOString();
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.studentUuid === studentUuid && (!courseUuid || n.courseUuid === courseUuid)
              ? { ...n, readAt: n.readAt || now }
              : n
          ),
        }));
      },

      getUnreadCount: (studentUuid, courseUuid) => {
        return get().notifications.filter(
          (n) => n.studentUuid === studentUuid && (!courseUuid || n.courseUuid === courseUuid) && !n.readAt
        ).length;
      },

      getCourseNotifications: (studentUuid, courseUuid) => {
        return get().notifications.filter(
          (n) => n.studentUuid === studentUuid && (!courseUuid || n.courseUuid === courseUuid)
        );
      },
    }),
    {
      name: 'cubixskill:notification-store',
    }
  )
);
