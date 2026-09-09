import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { studentPortalService } from '../services/studentPortal.service';
import { resolveMediaUrl } from '../services/apiClient';

export type LessonType =
  | 'video'
  | 'audio'
  | 'stream'
  | 'image'
  | 'document'
  | 'url'
  | 'text'
  | 'test'
  | 'assignment';

export interface CourseLesson {
  id: string;
  title: string;
  duration?: string;
  durationMinutes?: number;
  durationSeconds?: number | null;
  previewDurationSeconds?: number;
  preview_duration_seconds?: number;
  type?: LessonType;
  lessonType?: string;
  description?: string;
  content?: string;
  mediaUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  video_url?: string | null;
  videoUrl?: string | null;
  stream_url?: string;
  streamUrl?: string;
  original_url?: string;
  processing_mode?: 'hls' | 'direct' | string;
  processing_status?:
    | 'QUEUED'
    | 'PENDING'
    | 'PROCESSING'
    | 'READY'
    | 'FAILED'
    | string;
  primary_media?: any | null;
  media_files?: any[];
  mimeType?: string;
  is_demo?: boolean;
  is_preview?: boolean;
  preview_available?: boolean;
  public_locked?: boolean;
  public_access_state?: 'PREVIEW' | 'PREVIEW_PROCESSING' | 'LOCKED';
  isPreview?: boolean;
  isDemoAccessible?: boolean;
  isUnlocked?: boolean;
  allowDownload?: boolean;
  resources?: any[];
  quiz?: any;
  assignment?: any;
}

export interface CourseModule {
  id: string;
  title: string;
  lessonsCount: number;
  duration: string;
  lessons: CourseLesson[];
}

export function mapBackendLessonToEntity(l: any): CourseLesson {
  const isDemo = Boolean(l.is_demo === true || l.is_preview === true || l.preview_available === true);
  const publicAccessState: 'PREVIEW' | 'PREVIEW_PROCESSING' | 'LOCKED' =
    l.public_access_state || (isDemo ? (l.is_processing ? 'PREVIEW_PROCESSING' : 'PREVIEW') : 'LOCKED');
  const publicLocked = typeof l.public_locked === 'boolean' ? l.public_locked : publicAccessState === 'LOCKED';

  const primaryMedia =
    l.primary_media ||
    l.primaryMedia ||
    null;

  const mediaFiles =
    l.media_files ||
    l.mediaFiles ||
    [];

  const streamUrl =
    String(
      l.stream_url ||
      l.streamUrl ||
      primaryMedia?.stream_url ||
      ''
    );

  const processingMode =
    String(
      l.processing_mode ||
      l.processingMode ||
      primaryMedia?.processing_mode ||
      (streamUrl ? 'hls' : 'direct')
    ).toLowerCase();

  const processingStatus =
    String(
      l.processing_status ||
      l.processingStatus ||
      primaryMedia?.processing_status ||
      'READY'
    ).toUpperCase();

  const originalUrl =
    String(
      l.original_url ||
      l.originalUrl ||
      primaryMedia?.url ||
      l.external_url ||
      ''
    );

  const resolvedMediaUrl =
    processingMode === 'hls' && streamUrl
      ? streamUrl
      : (
          l.video_url ||
          l.videoUrl ||
          originalUrl ||
          l.external_url ||
          ''
        );

  return {
    id: String(l.id),
    title: l.title || 'Lesson',
    duration: l.duration_minutes ? `${l.duration_minutes} min` : (l.duration || ''),
    durationMinutes: l.duration_minutes ?? 0,
    durationSeconds: l.duration_seconds ?? null,
    previewDurationSeconds: l.preview_duration_seconds ?? 0,
    preview_duration_seconds: l.preview_duration_seconds ?? 0,
    type: (l.lesson_type || l.type || 'video').toLowerCase() as any,
    lessonType: (l.lesson_type || l.type || 'VIDEO').toUpperCase(),
    description: l.description || '',
    mediaUrl: resolvedMediaUrl,
    externalUrl: l.external_url || '',
    thumbnailUrl: l.thumbnail_url || l.thumbnail?.url || '',
    thumbnail_url: l.thumbnail_url || l.thumbnail?.url || '',
    video_url: l.video_url || l.videoUrl || null,
    stream_url: streamUrl,
    original_url: originalUrl,
    processing_mode: processingMode,
    processing_status: processingStatus,
    primary_media: primaryMedia,
    media_files: mediaFiles,
    is_demo: isDemo,
    is_preview: Boolean(l.is_preview ?? isDemo),
    preview_available: Boolean(l.preview_available ?? isDemo),
    public_locked: publicLocked,
    public_access_state: publicAccessState,
    isPreview: isDemo,
    isDemoAccessible: isDemo,
    isUnlocked: publicAccessState !== 'LOCKED',
    allowDownload: Boolean(l.allow_download ?? l.allowDownload),
    resources: l.resources || [],
    quiz: l.quiz || null,
    assignment: l.assignment || null,
  };
}

export function mapBackendModuleToEntity(m: any): CourseModule {
  const rawLessons = Array.isArray(m.lessons) ? m.lessons : [];
  const lessons = rawLessons.map(mapBackendLessonToEntity);
  return {
    id: String(m.id || m.uuid || ''),
    title: m.title || 'Module',
    lessonsCount: m.lessons_count ?? m.lessonsCount ?? lessons.length,
    duration: m.duration || '',
    lessons,
  };
}

export interface CoursePricing {
  regularPrice: number;
  salePrice?: number;
  effectivePrice: number;
  saleDiscount: number;
  isOnSale: boolean;
  isFree: boolean;
  currency: string;
}

export function getCoursePricing(course: any): CoursePricing {
  if (!course) {
    return {
      regularPrice: 0,
      effectivePrice: 0,
      saleDiscount: 0,
      isOnSale: false,
      isFree: true,
      currency: 'INR',
    };
  }

  // 1. If backend returned normalized `pricing` dict:
  if (course.pricing && typeof course.pricing === 'object') {
    const reg = Number(course.pricing.regular_price ?? course.pricing.regularPrice ?? course.price ?? 0);
    const saleRaw = course.pricing.sale_price ?? course.pricing.salePrice;
    const sale = saleRaw != null ? Number(saleRaw) : undefined;
    const eff = Number(course.pricing.effective_price ?? course.pricing.effectivePrice ?? (sale !== undefined ? sale : reg));
    const free = Boolean(course.pricing.is_free ?? course.pricing.isFree ?? course.is_free ?? (eff === 0));
    const onSale = Boolean(course.pricing.is_on_sale ?? course.pricing.isOnSale ?? (!free && sale !== undefined && sale >= 0 && sale < reg));
    const saleDisc = Number(course.pricing.sale_discount ?? (onSale ? Math.max(0, reg - eff) : 0));
    const curr = course.pricing.currency || course.currency || 'INR';

    return {
      regularPrice: reg,
      salePrice: onSale ? sale : undefined,
      effectivePrice: free ? 0 : eff,
      saleDiscount: saleDisc,
      isOnSale: onSale,
      isFree: free,
      currency: curr,
    };
  }

  // 2. Fallback for raw objects:
  const reg = Number(course.regularPrice ?? course.price ?? 0);
  const rawSale = course.salePrice ?? course.sale_price;
  const sale = rawSale !== undefined && rawSale !== null ? Number(rawSale) : undefined;
  const free = Boolean(course.isFree ?? course.is_free ?? (reg === 0));

  const isOnSale = !free && sale !== undefined && sale >= 0 && sale < reg;
  const eff = free ? 0 : (isOnSale && sale !== undefined ? sale : reg);
  const saleDisc = isOnSale && sale !== undefined ? Math.max(0, reg - sale) : 0;
  const curr = course.currency || 'INR';

  return {
    regularPrice: reg,
    salePrice: isOnSale ? sale : undefined,
    effectivePrice: eff,
    saleDiscount: saleDisc,
    isOnSale,
    isFree: free,
    currency: curr,
  };
}

export interface CourseEntity {
  id: string;
  uuid: string;
  courseUuid: string;
  academyUuid: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail: string;
  instructorName: string;
  instructorAvatar?: string;
  category?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  price?: number;
  salePrice?: number;
  effectivePrice?: number;
  isFree?: boolean;
  isOnSale?: boolean;
  pricing?: CoursePricing;
  currency?: string;
  duration?: string;
  lessonCount?: number;
  studentCount?: number;
  rating?: number;
  reviewsCount?: number;
  isFeatured?: boolean;
  demoEnabled?: boolean;
  demoDurationDays?: number;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  currentModuleTitle: string;
  currentLessonTitle: string;
  lastActiveAt: string;
  accessExpiryDate: string;
  promoVideoUrl?: string;
  promoVideoThumbnail?: string;
  whatYouWillLearn?: string[];
  requirements?: string[];
  modules?: CourseModule[];
  faq?: { question: string; answer: string }[];
  features: {
    assignments: boolean;
    quizzes: boolean;
    liveClasses: boolean;
    certificates: boolean;
    announcements: boolean;
    discussions: boolean;
    personalChat?: boolean;
    lessonLockingReport?: boolean;
  };
}

export function mapBackendCourseToEntity(item: any): CourseEntity {
  const courseId = String(item.id || item.uuid || '');
  const acadId = String(item.academy_uuid || item.academy?.id || item.academy_id || item.academy || '');
  const pricingObj = getCoursePricing(item);

  const rawModules = Array.isArray(item.modules || item.curriculum || item.course_modules)
    ? item.modules || item.curriculum || item.course_modules
    : [];
  const modules = rawModules.map(mapBackendModuleToEntity);

  const isLockingReportEnabled = Boolean(
    item.features?.lesson_locking_report_enabled ??
    item.features?.lesson_locking_report?.enabled ??
    item.features?.LESSON_LOCKING_REPORT?.enabled ??
    item.features?.lesson_locking_enabled ??
    item.features?.student_report_enabled ??
    false
  );

  return {
    id: courseId,
    uuid: courseId,
    courseUuid: courseId,
    academyUuid: acadId,
    title: item.title || 'Course',
    subtitle: item.subtitle || '',
    description: item.description || '',
    thumbnail: resolveMediaUrl(
      item.thumbnail_url ||
      item.thumbnail?.url ||
      item.thumbnail?.file_url ||
      item.thumbnail?.relative_path ||
      (typeof item.thumbnail === 'string' ? item.thumbnail : '')
    ),
    promoVideoUrl: resolveMediaUrl(
      item.promo_video_url ||
      item.promo_video?.url ||
      item.promo_video?.file_url ||
      item.promo_video?.relative_path ||
      (typeof item.promo_video === 'string' ? item.promo_video : '')
    ),
    instructorName: item.instructor_name || item.instructor?.full_name || 'Instructor',
    instructorAvatar: item.instructor_avatar || item.instructor?.profile_photo || '',
    category: typeof item.category === 'object' ? item.category?.name : item.category || 'General',
    level: item.level || 'Beginner',
    language: item.language || 'English',
    price: pricingObj.regularPrice,
    salePrice: pricingObj.salePrice,
    effectivePrice: pricingObj.effectivePrice,
    isFree: pricingObj.isFree,
    isOnSale: pricingObj.isOnSale,
    pricing: pricingObj,
    currency: pricingObj.currency,
    duration: item.duration || 'Flexible',
    lessonCount: item.lesson_count || item.total_lessons || 0,
    studentCount: item.student_count || 0,
    rating: 5.0,
    reviewsCount: 0,
    isFeatured: Boolean(item.is_featured),
    demoEnabled: Boolean(item.demo_enabled),
    demoDurationDays: item.demo_duration_days || 0,
    progressPercent: Math.min(100, Math.max(0, Math.round(Number(item.progress_percentage ?? item.progress_percent ?? item.progressPercent ?? 0)))),
    completedLessonsCount: Number(item.completed_lessons ?? item.completed_lessons_count ?? item.completedLessonsCount ?? 0),
    totalLessonsCount: Number(item.total_lessons ?? item.total_lessons_count ?? item.totalLessonsCount ?? 0),
    currentModuleTitle: item.current_module_title || 'Module 1',
    currentLessonTitle: item.current_lesson_title || 'Introduction',
    lastActiveAt: 'Recently',
    accessExpiryDate: 'Lifetime Access',
    whatYouWillLearn: item.what_you_will_learn || [],
    requirements: item.requirements || [],
    modules,
    features: {
      assignments: item.features?.assignments ?? item.features?.LESSONS ?? true,
      quizzes: item.features?.quizzes ?? item.features?.LESSONS ?? true,
      liveClasses: item.features?.liveClasses ?? item.features?.live_classes ?? item.features?.LIVE_CLASS ?? true,
      certificates: item.features?.certificates ?? item.features?.COMPLETION_CERTIFICATE ?? true,
      announcements: item.features?.announcements ?? item.features?.COURSE_ANNOUNCEMENT ?? true,
      discussions: item.features?.discussions ?? item.features?.COURSE_DISCUSSION ?? true,
      lessonLockingReport: isLockingReportEnabled,
    },
  };
}

interface CourseStoreState {
  courses: CourseEntity[];
  activeCourseUuid: string;
  activeCourse: CourseEntity | null;
  isLoading: boolean;
  fetchCourses: (academyUuid?: string) => Promise<CourseEntity[]>;
  fetchCourseDetail: (courseUuid: string) => Promise<CourseEntity | null>;
  fetchPublicCourseDetail: (academyIdentifier: string, courseIdentifier: string) => Promise<CourseEntity | null>;
  getCoursesByAcademy: (academyUuid: string) => CourseEntity[];
  getStudentCoursesByAcademy: (academyUuid: string) => CourseEntity[];
  getCourseByUuid: (courseUuid: string) => CourseEntity | undefined;
  setActiveCourseUuid: (uuid: string) => void;
  setActiveCourse: (course: CourseEntity | null) => void;
}

const coursesInFlightMap = new Map<string, Promise<CourseEntity[]>>();

export const useCourseStore = create<CourseStoreState>()(
  persist(
    (set, get) => ({
      courses: [],
      activeCourseUuid: '',
      activeCourse: null,
      isLoading: false,

      fetchCourses: async (academyUuid?: string) => {
        const cacheKey = academyUuid || 'all';
        if (coursesInFlightMap.has(cacheKey)) {
          return coursesInFlightMap.get(cacheKey)!;
        }

        set({ isLoading: true });

        const fetchPromise = (async () => {
          try {
            const list = await studentPortalService.getCourses(academyUuid);
            const mapped = list.map(mapBackendCourseToEntity);
            set({ courses: mapped, isLoading: false });
            return mapped;
          } catch {
            set({ isLoading: false });
            return get().courses;
          } finally {
            coursesInFlightMap.delete(cacheKey);
          }
        })();

        coursesInFlightMap.set(cacheKey, fetchPromise);
        return fetchPromise;
      },

      fetchCourseDetail: async (courseUuid: string) => {
        try {
          const data = await studentPortalService.getCourseDetail(courseUuid);
          if (data) {
            const mapped = mapBackendCourseToEntity(data);
            set((state) => {
              const existingIdx = state.courses.findIndex((c) => c.uuid === courseUuid);
              let updatedCourses = [...state.courses];
              if (existingIdx >= 0) {
                updatedCourses[existingIdx] = mapped;
              } else {
                updatedCourses.push(mapped);
              }
              return {
                courses: updatedCourses,
                activeCourse: mapped,
                activeCourseUuid: courseUuid,
              };
            });
            return mapped;
          }
        } catch {
          // Failure loading detail
        }
        return get().getCourseByUuid(courseUuid) || null;
      },

      fetchPublicCourseDetail: async (academyIdentifier: string, courseIdentifier: string) => {
        try {
          const data = await studentPortalService.getPublicCourseDetail(academyIdentifier, courseIdentifier);
          if (!data) {
            return null;
          }
          const mapped = mapBackendCourseToEntity(data);
          set((state) => {
            const existingIdx = state.courses.findIndex(
              (c) =>
                c.uuid === courseIdentifier ||
                c.id === courseIdentifier ||
                c.uuid === mapped.uuid ||
                c.id === mapped.id
            );
            const updatedCourses = [...state.courses];
            if (existingIdx >= 0) {
              updatedCourses[existingIdx] = mapped;
            } else {
              updatedCourses.push(mapped);
            }
            return {
              courses: updatedCourses,
              activeCourse: mapped,
              activeCourseUuid: mapped.uuid || mapped.id || courseIdentifier,
            };
          });
          return mapped;
        } catch (error) {
          console.error('Failed to load public course detail:', error);
          return null;
        }
      },

      getCoursesByAcademy: (academyUuid) => {
        return get().courses.filter((c) => !academyUuid || c.academyUuid === academyUuid || !c.academyUuid);
      },

      getStudentCoursesByAcademy: (academyUuid) => {
        return get().courses.filter((c) => !academyUuid || c.academyUuid === academyUuid || !c.academyUuid);
      },

      getCourseByUuid: (courseUuid) => {
        return get().courses.find((c) => c.uuid === courseUuid || c.courseUuid === courseUuid || c.id === courseUuid);
      },

      setActiveCourseUuid: (uuid) => {
        const found = get().getCourseByUuid(uuid);
        set({ activeCourseUuid: uuid, activeCourse: found || null });
      },

      setActiveCourse: (course) => {
        set({ activeCourse: course, activeCourseUuid: course ? course.uuid : '' });
      },
    }),
    {
      name: 'cubixskill_student_course_store_v4',
    }
  )
);
