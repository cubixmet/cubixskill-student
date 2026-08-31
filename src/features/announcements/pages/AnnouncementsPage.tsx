import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pin, Bell } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { apiClient } from '../../../services/apiClient';

export const AnnouncementsPage: React.FC = () => {
  const { courseUuid } = useParams<{ courseUuid: string }>();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchAnnouncements = async () => {
      try {
        const params: Record<string, any> = { thread_type: 'ANNOUNCEMENT' };
        if (courseUuid) params.course_id = courseUuid;
        const res: any = await apiClient.get('/api/v1/discussions/discussions/', { params });
        const data = res?.data || res;
        const items = Array.isArray(data) ? data : data?.results || [];
        if (isMounted) {
          setAnnouncements(items);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load course announcements.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAnnouncements();

    return () => {
      isMounted = false;
    };
  }, [courseUuid]);

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto w-full">
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs rounded-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight">
          Course Announcements
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal mt-1">
          Official updates, announcements, and news from your instructor.
        </p>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} padding="md" className="space-y-3 bg-white border border-slate-200">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card padding="lg" className="text-center text-rose-600 font-semibold bg-white border border-rose-200">
            {error}
          </Card>
        ) : announcements.length > 0 ? (
          announcements.map((item) => (
            <Card key={item.id} padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] space-y-3 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-2">
                <div className="flex items-center gap-2">
                  {item.is_pinned && (
                    <Badge variant="warning" size="sm" className="flex items-center gap-1">
                      <Pin className="w-3 h-3" /> PINNED
                    </Badge>
                  )}
                  <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">{item.title}</h3>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-[#64748B]">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-slate-600 dark:text-[#CBD5E1] leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            </Card>
          ))
        ) : (
          <div className="p-8 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-2 text-slate-500 dark:text-[#94A3B8]">
            <Bell className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC]">No announcements yet.</p>
            <p className="text-[11px]">Check back later for updates from your instructor.</p>
          </div>
        )}
      </div>
    </div>
  );
};
