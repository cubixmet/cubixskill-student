import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StorageCategory =
  | 'course_resources'
  | 'lesson_resources'
  | 'discussion'
  | 'personal_chat'
  | 'assignment_submissions'
  | 'academy_assets';

export interface StorageObjectRecord {
  storageObjectUuid: string;
  academyUuid: string;
  category: StorageCategory;
  ownerType: 'resource' | 'discussion_post' | 'discussion_reply' | 'chat_message' | 'assignment_submission' | 'academy_asset';
  ownerUuid: string;
  storageKey: string;
  fileName: string;
  mimeType?: string;
  fileSizeBytes: number;
  status: 'active' | 'pending_delete' | 'deleted';
  createdAt: string;
  deletedAt?: string;
}

export interface AcademyStorageSummary {
  academyUuid: string;
  totalSizeBytes: number;
  storageLimitBytes?: number;
  categoryBreakdown: Record<StorageCategory, number>;
}

interface StorageAccountingStoreState {
  objects: StorageObjectRecord[];

  registerStorageUpload: (data: Omit<StorageObjectRecord, 'storageObjectUuid' | 'createdAt' | 'status'>) => StorageObjectRecord;
  deleteStorageObject: (storageObjectUuid: string) => void;
  getAcademyStorageSummary: (academyUuid: string, storageLimitBytes?: number) => AcademyStorageSummary;
  reset: () => void;
}

export const useStorageAccountingStore = create<StorageAccountingStoreState>()(
  persist(
    (set, get) => ({
      objects: [],

      registerStorageUpload: (data) => {
        const newRecord: StorageObjectRecord = {
          ...data,
          storageObjectUuid: `sob-${Date.now()}`,
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          objects: [newRecord, ...state.objects],
        }));

        return newRecord;
      },

      deleteStorageObject: (storageObjectUuid) => {
        set((state) => ({
          objects: state.objects.map((obj) =>
            obj.storageObjectUuid === storageObjectUuid
              ? { ...obj, status: 'deleted', deletedAt: new Date().toISOString() }
              : obj
          ),
        }));
      },

      getAcademyStorageSummary: (academyUuid, storageLimitBytes = 10737418240) => {
        const activeObjects = get().objects.filter(
          (obj) => obj.status === 'active' && obj.academyUuid === academyUuid
        );

        const categoryBreakdown: Record<StorageCategory, number> = {
          course_resources: 0,
          lesson_resources: 0,
          discussion: 0,
          personal_chat: 0,
          assignment_submissions: 0,
          academy_assets: 0,
        };

        let totalSizeBytes = 0;

        activeObjects.forEach((obj) => {
          categoryBreakdown[obj.category] = (categoryBreakdown[obj.category] || 0) + obj.fileSizeBytes;
          totalSizeBytes += obj.fileSizeBytes;
        });

        return {
          academyUuid,
          totalSizeBytes,
          storageLimitBytes,
          categoryBreakdown,
        };
      },

      reset: () => set({ objects: [] }),
    }),
    {
      name: 'cubixskill:storage-accounting-store',
    }
  )
);
