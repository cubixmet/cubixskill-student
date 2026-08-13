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
}

const INITIAL_MOCK_STORAGE_OBJECTS: StorageObjectRecord[] = [
  {
    storageObjectUuid: 'sob-101',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    category: 'course_resources',
    ownerType: 'resource',
    ownerUuid: 'res-101',
    storageKey: 'resources/React_19_Architecture_Cheatsheet.pdf',
    fileName: 'React_19_Architecture_Cheatsheet.pdf',
    mimeType: 'application/pdf',
    fileSizeBytes: 2516582, // ~2.4 MB
    status: 'active',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    storageObjectUuid: 'sob-102',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    category: 'lesson_resources',
    ownerType: 'resource',
    ownerUuid: 'res-102',
    storageKey: 'resources/react19_compiler_starter.zip',
    fileName: 'react19_compiler_starter.zip',
    mimeType: 'application/zip',
    fileSizeBytes: 9123456, // ~8.7 MB
    status: 'active',
    createdAt: '2026-08-02T12:00:00Z',
  },
  {
    storageObjectUuid: 'sob-103',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    category: 'discussion',
    ownerType: 'discussion_post',
    ownerUuid: 'post-402',
    storageKey: 'discussions/useActionState_diagram.png',
    fileName: 'useActionState_diagram.png',
    mimeType: 'image/png',
    fileSizeBytes: 552960, // ~540 KB
    status: 'active',
    createdAt: '2026-08-09T14:30:00Z',
  },
  {
    storageObjectUuid: 'sob-104',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    category: 'assignment_submissions',
    ownerType: 'assignment_submission',
    ownerUuid: 'sub-201',
    storageKey: 'submissions/zustand_state_store.zip',
    fileName: 'zustand_state_store.zip',
    mimeType: 'application/zip',
    fileSizeBytes: 4194304, // ~4 MB
    status: 'active',
    createdAt: '2026-08-10T14:20:00Z',
  },
];

export const useStorageAccountingStore = create<StorageAccountingStoreState>()(
  persist(
    (set, get) => ({
      objects: INITIAL_MOCK_STORAGE_OBJECTS,

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
    }),
    {
      name: 'cubixskill:storage-accounting-store',
    }
  )
);
