import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LiveClassDeliveryType = 'external_url' | 'stream';
export type LiveClassStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface LiveClass {
  liveClassUuid: string;
  academyUuid: string;
  courseUuid: string;
  title: string;
  description?: string;
  scheduledStartAt: string;
  scheduledEndAt?: string;
  timezone?: string;
  deliveryType: LiveClassDeliveryType;
  joinUrl?: string;
  streamUrl?: string;
  recordingUrl?: string;
  status: LiveClassStatus;
  isDemoAccessible?: boolean;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface LiveClassStoreState {
  liveClasses: LiveClass[];

  addLiveClass: (session: Omit<LiveClass, 'liveClassUuid' | 'createdAt' | 'updatedAt'>) => LiveClass;
  updateLiveClass: (liveClassUuid: string, data: Partial<LiveClass>) => void;
  cancelLiveClass: (liveClassUuid: string, cancelReason?: string) => void;
  addRecording: (liveClassUuid: string, recordingUrl: string) => void;
  getCourseLiveClasses: (courseUuid: string) => LiveClass[];
}

const INITIAL_MOCK_LIVE_CLASSES: LiveClass[] = [
  {
    liveClassUuid: 'live-301',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    title: 'React 19 Compiler Deep Dive',
    description: 'Interactive deep dive into React 19 compiler internals, auto-memoization, and async state transition boundaries with live Q&A.',
    scheduledStartAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // Started 15 mins ago (LIVE NOW)
    scheduledEndAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    timezone: 'Asia/Kolkata',
    deliveryType: 'stream',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    status: 'live',
    isDemoAccessible: true,
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
  },
  {
    liveClassUuid: 'live-302',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    title: 'Distributed System Caching & RabbitMQ Event Bus Workshop',
    description: 'Learn idempotent event handling and multi-tenant message queue isolation in cloud applications.',
    scheduledStartAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
    scheduledEndAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 90).toISOString(),
    timezone: 'Asia/Kolkata',
    deliveryType: 'external_url',
    joinUrl: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
    isDemoAccessible: false,
    createdAt: '2026-08-06T12:00:00Z',
    updatedAt: '2026-08-06T12:00:00Z',
  },
  {
    liveClassUuid: 'live-300',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    title: 'Multi-Tenant Zustand Store Hydration & SSR Safety',
    description: 'Previous interactive session reviewing custom SSR hydration safety hooks.',
    scheduledStartAt: '2026-08-02T14:00:00Z',
    scheduledEndAt: '2026-08-02T15:30:00Z',
    timezone: 'Asia/Kolkata',
    deliveryType: 'stream',
    recordingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    status: 'completed',
    isDemoAccessible: true,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-02T16:00:00Z',
  },
];

export const useLiveClassStore = create<LiveClassStoreState>()(
  persist(
    (set, get) => ({
      liveClasses: INITIAL_MOCK_LIVE_CLASSES,

      addLiveClass: (data) => {
        const newClass: LiveClass = {
          ...data,
          liveClassUuid: `live-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          liveClasses: [newClass, ...state.liveClasses],
        }));

        return newClass;
      },

      updateLiveClass: (liveClassUuid, data) => {
        set((state) => ({
          liveClasses: state.liveClasses.map((item) =>
            item.liveClassUuid === liveClassUuid
              ? { ...item, ...data, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      cancelLiveClass: (liveClassUuid, cancelReason) => {
        set((state) => ({
          liveClasses: state.liveClasses.map((item) =>
            item.liveClassUuid === liveClassUuid
              ? { ...item, status: 'cancelled', cancelReason, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      addRecording: (liveClassUuid, recordingUrl) => {
        set((state) => ({
          liveClasses: state.liveClasses.map((item) =>
            item.liveClassUuid === liveClassUuid
              ? { ...item, status: 'completed', recordingUrl, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      getCourseLiveClasses: (courseUuid) => {
        return get().liveClasses.filter((item) => item.courseUuid === courseUuid);
      },
    }),
    {
      name: 'cubixskill:live-class-store',
    }
  )
);
