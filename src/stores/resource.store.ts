import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ResourceScope = 'academy' | 'course' | 'module' | 'lesson';

export interface CourseResource {
  resourceUuid: string;
  academyUuid: string;
  courseUuid?: string;
  moduleUuid?: string;
  lessonUuid?: string;
  scope: ResourceScope;
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize: number; // Size in bytes
  allowView: boolean;
  allowDownload: boolean;
  isDemoAccessible?: boolean;
  status: 'active' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

interface ResourceStoreState {
  resources: CourseResource[];

  addResource: (resource: Omit<CourseResource, 'resourceUuid' | 'createdAt' | 'updatedAt' | 'status'>) => CourseResource;
  updateResourcePermissions: (resourceUuid: string, allowView: boolean, allowDownload: boolean) => void;
  deleteResource: (resourceUuid: string) => void;
  getLessonResources: (lessonId: string) => CourseResource[];
  getCourseResources: (courseUuid: string) => CourseResource[];
  getTotalStorageUsage: (academyUuid?: string) => number;
}

const INITIAL_MOCK_RESOURCES: CourseResource[] = [
  {
    resourceUuid: 'res-101',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    lessonUuid: 'les-1.1',
    scope: 'lesson',
    title: 'React 19 Architecture Cheatsheet',
    fileName: 'React_19_Architecture_Cheatsheet.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    mimeType: 'application/pdf',
    fileSize: 2516582, // ~2.4 MB
    allowView: true,
    allowDownload: false, // View Only
    isDemoAccessible: true,
    status: 'active',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    resourceUuid: 'res-102',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    lessonUuid: 'les-1.1',
    scope: 'lesson',
    title: 'Compiler Mechanics Starter Code Examples',
    fileName: 'react19_compiler_starter.zip',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mimeType: 'application/zip',
    fileSize: 9123456, // ~8.7 MB
    allowView: true,
    allowDownload: true, // View + Download
    isDemoAccessible: true,
    status: 'active',
    createdAt: '2026-08-02T12:00:00Z',
    updatedAt: '2026-08-02T12:00:00Z',
  },
  {
    resourceUuid: 'res-103',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    lessonUuid: 'les-1.2',
    scope: 'lesson',
    title: 'useActionState Async Transition Diagram',
    fileName: 'useActionState_diagram.png',
    fileUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    mimeType: 'image/png',
    fileSize: 552960, // ~540 KB
    allowView: true,
    status: 'active',
    createdAt: '2026-08-03T14:30:00Z',
    updatedAt: '2026-08-03T14:30:00Z',
  },
  {
    resourceUuid: 'mock-resource-1',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    lessonUuid: 'mock-react19-compiler',
    scope: 'lesson',
    title: 'React Compiler Notes.pdf',
    fileName: 'React_Compiler_Notes.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    mimeType: 'application/pdf',
    fileSize: 2457600, // ~2.4 MB
    allowView: true,
    allowDownload: true, // View + Download
    isDemoAccessible: true,
    status: 'active',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    resourceUuid: 'mock-resource-2',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    lessonUuid: 'mock-react19-compiler',
    scope: 'lesson',
    title: 'Compiler Architecture Diagram.png',
    fileName: 'Compiler_Architecture_Diagram.png',
    fileUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    mimeType: 'image/png',
    fileSize: 552960, // ~540 KB
    allowView: true,
    allowDownload: false, // View Only
    isDemoAccessible: true,
    status: 'active',
    createdAt: '2026-08-02T12:00:00Z',
    updatedAt: '2026-08-02T12:00:00Z',
  },
];

export const useResourceStore = create<ResourceStoreState>()(
  persist(
    (set, get) => ({
      resources: INITIAL_MOCK_RESOURCES,

      addResource: (data) => {
        const newResource: CourseResource = {
          ...data,
          resourceUuid: `res-${Date.now()}`,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          resources: [newResource, ...state.resources],
        }));

        return newResource;
      },

      updateResourcePermissions: (resourceUuid, allowView, allowDownload) => {
        set((state) => ({
          resources: state.resources.map((res) =>
            res.resourceUuid === resourceUuid
              ? {
                  ...res,
                  allowView,
                  allowDownload,
                  updatedAt: new Date().toISOString(),
                }
              : res
          ),
        }));
      },

      deleteResource: (resourceUuid) => {
        set((state) => ({
          resources: state.resources.map((res) =>
            res.resourceUuid === resourceUuid
              ? { ...res, status: 'deleted', updatedAt: new Date().toISOString() }
              : res
          ),
        }));
      },

      getLessonResources: (lessonId) => {
        if (!lessonId) return [];
        return get().resources.filter(
          (res) => res.status === 'active' && (res.lessonUuid === lessonId || (res.lessonUuid && lessonId.includes(res.lessonUuid)))
        );
      },

      getCourseResources: (courseUuid) => {
        if (!courseUuid) return [];
        return get().resources.filter((res) => res.status === 'active' && res.courseUuid === courseUuid);
      },

      getTotalStorageUsage: (academyUuid) => {
        return get()
          .resources.filter((res) => res.status === 'active' && (!academyUuid || res.academyUuid === academyUuid))
          .reduce((total, res) => total + (res.fileSize || 0), 0);
      },
    }),
    {
      name: 'cubixskill:resource-store',
    }
  )
);
