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
  backendId?: string;
}

interface NotificationStoreState {
  notifications: StudentNotification[];
  backendUnreadCount: number;
  isLoading: boolean;

  fetchNotifications: (studentUuid: string, academyUuid?: string) => Promise<void>;
  fetchUnreadCount: (academyUuid?: string) => Promise<number>;
  addNotification: (data: Omit<StudentNotification, 'notificationUuid' | 'createdAt'>) => StudentNotification;
  markRead: (notificationUuid: string) => Promise<void>;
  markAllRead: (studentUuid: string, academyUuid?: string, courseUuid?: string) => Promise<void>;
  getUnreadCount: (studentUuid: string, courseUuid?: string) => number;
  getCourseNotifications: (studentUuid: string, courseUuid?: string) => StudentNotification[];
  reset: () => void;
}

function mapBackendTypeToFrontend(backendType: string): NotificationType {
  switch (backendType) {
    case 'ANNOUNCEMENT_PUBLISHED':
    case 'ANNOUNCEMENT':
      return 'announcement';
    case 'LIVE_SESSION_CREATED':
    case 'LIVE_SESSION_STARTING_SOON':
    case 'LIVE_SESSION_CANCELLED':
      return 'live_class';
    case 'DISCUSSION_REPLY':
    case 'CHAT_MENTION':
      return 'discussion';
    case 'CERTIFICATE_ISSUED':
      return 'certificate';
    case 'COURSE_ENROLLED':
    case 'COURSE_COMPLETED':
      return 'course_update';
    default:
      return 'system';
  }
}

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      notifications: [],
      backendUnreadCount: 0,
      isLoading: false,

      fetchNotifications: async (studentUuid, academyUuid) => {
        set({ isLoading: true });
        try {
          const { studentPortalService } = await import('../services/studentPortal.service');
          const rawItems = await studentPortalService.getNotifications(academyUuid);
          const mapped: StudentNotification[] = rawItems.map((item: any) => ({
            notificationUuid: String(item.id),
            backendId: String(item.id),
            studentUuid: studentUuid,
            academyUuid: academyUuid || item.academy || '',
            type: mapBackendTypeToFrontend(item.notification_type),
            title: item.title,
            message: item.message,
            action: {
              label: 'View Event',
              route: item.action_url || undefined,
            },
            createdAt: item.created_at,
            readAt: item.read_at || (item.is_read ? item.created_at : undefined),
          }));

          const localNotifications = get().notifications.filter(
            (n) => !mapped.some((m) => m.backendId === n.backendId || m.notificationUuid === n.notificationUuid)
          );

          set({
            notifications: [...mapped, ...localNotifications].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
            backendUnreadCount: mapped.filter((n) => !n.readAt).length,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      fetchUnreadCount: async (academyUuid) => {
        try {
          const { studentPortalService } = await import('../services/studentPortal.service');
          const count = await studentPortalService.getUnreadNotificationCount(academyUuid);
          set({ backendUnreadCount: count });
          return count;
        } catch {
          return get().backendUnreadCount;
        }
      },

      addNotification: (data) => {
        const newNotif: StudentNotification = {
          ...data,
          notificationUuid: `notif-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications],
          backendUnreadCount: state.backendUnreadCount + 1,
        }));

        return newNotif;
      },

      markRead: async (notificationUuid) => {
        const target = get().notifications.find((n) => n.notificationUuid === notificationUuid);
        const now = new Date().toISOString();

        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.notificationUuid === notificationUuid ? { ...n, readAt: n.readAt || now } : n
          ),
          backendUnreadCount: Math.max(0, state.backendUnreadCount - 1),
        }));

        if (target?.backendId) {
          const { studentPortalService } = await import('../services/studentPortal.service');
          await studentPortalService.markNotificationRead(target.backendId);
        }
      },

      markAllRead: async (studentUuid, academyUuid, courseUuid) => {
        const now = new Date().toISOString();
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.studentUuid === studentUuid && (!courseUuid || n.courseUuid === courseUuid)
              ? { ...n, readAt: n.readAt || now }
              : n
          ),
          backendUnreadCount: 0,
        }));

        try {
          const { studentPortalService } = await import('../services/studentPortal.service');
          await studentPortalService.markAllNotificationsRead(academyUuid);
        } catch (_) {
          // Fallback handled in local state
        }
      },

      getUnreadCount: (studentUuid, courseUuid) => {
        const localUnread = get().notifications.filter(
          (n) => n.studentUuid === studentUuid && (!courseUuid || n.courseUuid === courseUuid) && !n.readAt
        ).length;
        return Math.max(localUnread, get().backendUnreadCount);
      },

      getCourseNotifications: (studentUuid, courseUuid) => {
        return get().notifications.filter(
          (n) => n.studentUuid === studentUuid && (!courseUuid || n.courseUuid === courseUuid)
        );
      },

      reset: () => set({ notifications: [], backendUnreadCount: 0, isLoading: false }),
    }),
    {
      name: 'cubixskill:notification-store',
    }
  )
);
