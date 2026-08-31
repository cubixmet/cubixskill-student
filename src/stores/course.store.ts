import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { studentPortalService } from '../services/studentPortal.service';

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
  type?: LessonType;
  description?: string;
  content?: string;
  mediaUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  mimeType?: string;
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
  };
}

export function mapBackendCourseToEntity(item: any): CourseEntity {
  const courseId = String(item.id || item.uuid || '');
  const acadId = String(item.academy?.id || item.academy_id || item.academy || '');
  const pricingObj = getCoursePricing(item);

  return {
    id: courseId,
    uuid: courseId,
    courseUuid: courseId,
    academyUuid: acadId,
    title: item.title || 'Course',
    subtitle: item.subtitle || '',
    description: item.description || '',
    thumbnail: item.thumbnail_url || item.thumbnail?.url || item.thumbnail || '',
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
    progressPercent: Number(item.progress_percent) || 0,
    completedLessonsCount: Number(item.completed_lessons_count) || 0,
    totalLessonsCount: Number(item.total_lessons) || 0,
    currentModuleTitle: item.current_module_title || 'Module 1',
    currentLessonTitle: item.current_lesson_title || 'Introduction',
    lastActiveAt: 'Recently',
    accessExpiryDate: 'Lifetime Access',
    whatYouWillLearn: item.what_you_will_learn || [],
    requirements: item.requirements || [],
    modules: item.modules || [],
    features: {
      assignments: item.features?.assignments ?? item.features?.LESSONS ?? true,
      quizzes: item.features?.quizzes ?? item.features?.LESSONS ?? true,
      liveClasses: item.features?.liveClasses ?? item.features?.live_classes ?? item.features?.LIVE_CLASS ?? true,
      certificates: item.features?.certificates ?? item.features?.COMPLETION_CERTIFICATE ?? true,
      announcements: item.features?.announcements ?? item.features?.COURSE_ANNOUNCEMENT ?? true,
      discussions: item.features?.discussions ?? item.features?.COURSE_DISCUSSION ?? true,
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
  getCoursesByAcademy: (academyUuid: string) => CourseEntity[];
  getStudentCoursesByAcademy: (academyUuid: string) => CourseEntity[];
  getCourseByUuid: (courseUuid: string) => CourseEntity | undefined;
  setActiveCourseUuid: (uuid: string) => void;
  setActiveCourse: (course: CourseEntity | null) => void;
}

let coursesPromise: Promise<CourseEntity[]> | null = null;

export const useCourseStore = create<CourseStoreState>()(
  persist(
    (set, get) => ({
      courses: [],
      activeCourseUuid: '',
      activeCourse: null,
      isLoading: false,

      fetchCourses: async (academyUuid?: string) => {
        if (coursesPromise) {
          return coursesPromise;
        }
        set({ isLoading: true });
        coursesPromise = (async () => {
          try {
            const list = await studentPortalService.getCourses();
            const mapped = list.map(mapBackendCourseToEntity);
            set({ courses: mapped, isLoading: false });
            return mapped;
          } catch {
            set({ isLoading: false });
            return get().courses;
          } finally {
            coursesPromise = null;
          }
        })();
        return coursesPromise;
      },

      fetchCourseDetail: async (courseUuid: string) => {
        try {
          const data = await studentPortalService.getCourseDetail(courseUuid);
          if (data) {
            const mapped = mapBackendCourseToEntity(data);
            const currentModules = await studentPortalService.getCourseModules(courseUuid);
            if (currentModules && currentModules.length > 0) {
              mapped.modules = currentModules.map((m: any) => ({
                id: String(m.id),
                title: m.title || 'Module',
                lessonsCount: m.lessons?.length || m.lessons_count || 0,
                duration: m.duration || '',
                lessons: (m.lessons || []).map((l: any) => ({
                  id: String(l.id),
                  title: l.title || 'Lesson',
                  duration: l.duration_minutes ? `${l.duration_minutes} min` : '5 min',
                  type: (l.lesson_type || 'video').toLowerCase() as any,
                  description: l.description || '',
                  mediaUrl: l.external_url || l.media_file?.url || '',
                  thumbnailUrl: l.thumbnail?.url || '',
                  isUnlocked: true,
                })),
              }));
            }

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
