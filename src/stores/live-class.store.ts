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
  reset: () => void;
}

export const useLiveClassStore = create<LiveClassStoreState>()(
  persist(
    (set, get) => ({
      liveClasses: [],

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

      reset: () => set({ liveClasses: [] }),
    }),
    {
      name: 'cubixskill:live-class-store',
    }
  )
);
