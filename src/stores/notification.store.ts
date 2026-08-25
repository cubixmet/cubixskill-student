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
  reset: () => void;
}

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      notifications: [],

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

      reset: () => set({ notifications: [] }),
    }),
    {
      name: 'cubixskill:notification-store',
    }
  )
);
