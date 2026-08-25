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
  reset: () => void;
}

export const useResourceStore = create<ResourceStoreState>()(
  persist(
    (set, get) => ({
      resources: [],

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

      reset: () => set({ resources: [] }),
    }),
    {
      name: 'cubixskill:resource-store',
    }
  )
);
