import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bell,
  Video,
  Megaphone,
  ClipboardCheck,
  ListChecks,
  MessageSquare,
  MessageCircle,
  BookOpen,
  Award,
  Clock,
  Info,
  CheckCheck,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useAuthStore } from '../../../stores/auth.store';
import { useNotificationStore, type StudentNotification, type NotificationType } from '../../../stores/notification.store';
import { resolveNotificationRoute, formatNotificationTime } from '../utils/resolveNotificationRoute';

import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Pagination } from '../../../components/ui/Pagination';

export const NotificationsPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000', courseUuid = '9c78bda1-98c2-4b11-8b81-92d3db12b501' } = useParams<{
    academyUuid: string;
    courseUuid: string;
  }>();

  const navigate = useNavigate();
  const student = useAuthStore((state) => state.student);
  const studentUuid = student?.uuid || 'std-production-1';

  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const getCourseNotifications = useNotificationStore((state) => state.getCourseNotifications);

  const notifications = getCourseNotifications(studentUuid, courseUuid);

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter((n) => !n.readAt);
    }
    return notifications;
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const totalPages = Math.ceil(filteredNotifications.length / pageSize) || 1;
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(start, start + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  const handleNotificationClick = (notification: StudentNotification) => {
    if (!notification.readAt) {
      markRead(notification.notificationUuid);
    }
    const targetRoute = resolveNotificationRoute(notification, academyUuid, courseUuid);
    navigate(targetRoute);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'live_class':
        return <Video className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-purple-600 shrink-0" />;
      case 'assignment':
        return <ClipboardCheck className="w-5 h-5 text-teal-600 shrink-0" />;
      case 'assessment':
        return <ListChecks className="w-5 h-5 text-indigo-600 shrink-0" />;
      case 'discussion':
        return <MessageSquare className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'personal_chat':
        return <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'certificate':
        return <Award className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'demo':
        return <Clock className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'course_update':
        return <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'system':
      default:
        return <Info className="w-5 h-5 text-slate-600 shrink-0" />;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 font-sans text-xs text-left max-w-4xl mx-auto pb-12">
      {/* COMPACT PAGE HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-4">
        <PageHeader
          title="Course Notifications"
          description="Centralized feed for live class updates, announcements, assignments, and course events."
          action={
            unreadCount > 0 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAllRead(studentUuid, courseUuid)}
                leftIcon={<CheckCheck className="w-4 h-4 text-slate-600 shrink-0" />}
                className="font-semibold px-3.5 min-h-[38px] border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
              >
                Mark all as read
              </Button>
            ) : undefined
          }
        />

        {/* FILTER TABS */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('unread');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'unread' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </Card>

      {/* NOTIFICATION FEED */}
      <div className="space-y-3">
        {paginatedNotifications.length > 0 ? (
          <>
            {paginatedNotifications.map((notif) => {
              const isUnread = !notif.readAt;

              return (
                <div
                  key={notif.notificationUuid}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer font-sans text-xs space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isUnread
                      ? 'bg-blue-50/60 border-blue-200/90 shadow-2xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {isUnread && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                        <h3 className={`text-xs sm:text-sm truncate ${isUnread ? 'font-semibold text-slate-950' : 'font-semibold text-slate-900'}`}>
                          {notif.title}
                        </h3>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed break-words whitespace-pre-line line-clamp-2">
                        {notif.message}
                      </p>

                      <span className="text-[11px] text-slate-400 font-medium block pt-0.5">
                        {formatNotificationTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant={isUnread ? 'primary' : 'outline'}
                      rightIcon={<ChevronRight className="w-4 h-4 shrink-0" />}
                      className="font-semibold px-4 min-h-[38px] text-xs cursor-pointer"
                    >
                      {notif.action?.label || 'View Event'}
                    </Button>
                  </div>
                </div>
              );
            })}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        ) : (
          <EmptyState
            icon={<Bell className="w-7 h-7 text-slate-400" />}
            title="You're All Caught Up!"
            description="New course updates, live class alerts, assignments, and messages will appear here."
          />
        )}
      </div>
    </div>
  );
};
