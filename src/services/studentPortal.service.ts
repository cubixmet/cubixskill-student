import { apiClient, publicApiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiEndpoints';

export interface StudentEnrollmentItem {
  id: string;
  course: {
    id: string;
    title: string;
    slug?: string;
    thumbnail?: string;
    description?: string;
    academy?: {
      id: string;
      name: string;
      logo_url?: string;
      theme_color?: string;
    };
  };
  progress_percent?: number;
  lessons_completed?: number;
  total_lessons?: number;
  enrolled_at?: string;
  status?: string;
}

export interface StudentCourseOverviewResponse {
  academy: {
    id: string;
    uuid: string;
    name: string;
    logo_url?: string;
  };
  course: {
    id: string;
    uuid: string;
    title: string;
    description?: string;
    thumbnail?: string;
    level?: string;
    language?: string;
    instructor_name?: string;
    instructorName?: string;
  };
  enrollment?: {
    id?: string;
    status?: string;
    access_type?: string;
    enrolled_at?: string;
  } | null;
  progress?: {
    percentage?: number;
    completed_lessons?: number;
    total_lessons?: number;
  } | null;
  curriculum_summary?: {
    modules_count?: number;
    lessons_count?: number;
    has_content?: boolean;
  } | null;
  modules?: any[];
}

export interface AcademyData {
  id: string;
  uuid: string;
  academyUuid: string;
  name: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  aboutText: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  instructorBio: string;
  supportEmail: string;
  supportPhone: string;
  theme: {
    primaryColor: string;
    primaryHover: string;
    primarySoft: string;
    secondaryColor: string;
    accentColor: string;
  };
  enrolledCoursesCount: number;
  overallProgressPercent: number;
  lastActiveAt: string;
}

export interface StudentCourseItem {
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
  currency?: string;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  currentModuleTitle: string;
  currentLessonTitle: string;
  lastActiveAt: string;
  accessExpiryDate: string;
  modules?: any[];
  features: {
    assignments: boolean;
    quizzes: boolean;
    liveClasses: boolean;
    certificates: boolean;
    announcements: boolean;
    discussions: boolean;
  };
}

export const studentPortalService = {
  async getStudentEnrollments(): Promise<StudentEnrollmentItem[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.enrollments.studentEnrollments);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    } catch {
      return [];
    }
  },

  async getPublicAcademyWebsite(academyUuid: string): Promise<any> {
    try {
      const data = await publicApiClient.get<any>(API_ENDPOINTS.website.publicWebsite(academyUuid));
      return data;
    } catch {
      return null;
    }
  },

  async getPublicAcademyCourses(academyUuid: string): Promise<any[]> {
    try {
      const data = await publicApiClient.get<any>(API_ENDPOINTS.website.publicCourses(academyUuid));
      if (Array.isArray(data)) return data;
      if (data && Array.isArray((data as any).results)) return (data as any).results;
      return [];
    } catch {
      return [];
    }
  },

  async getAcademiesList(): Promise<AcademyData[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.enrollments.studentAcademies);
      const data = res?.data || res;
      const rawList = Array.isArray(data) ? data : data && Array.isArray(data.results) ? data.results : [];

      if (rawList.length > 0) {
        return rawList.map((item: any) => ({
          id: item.id || item.uuid,
          uuid: item.uuid || item.id,
          academyUuid: item.academy_uuid || item.uuid || item.id,
          name: item.name || 'Academy',
          tagline: item.tagline || 'Modern Learning Platform',
          logoUrl: item.logo_url || '',
          faviconUrl: item.favicon_url || '',
          heroHeadline: 'Build Skills for the Future',
          heroSubheadline: 'Explore production-ready courses',
          aboutText: '',
          instructorName: 'Academy Educator',
          instructorTitle: 'Instructor',
          instructorAvatar: '',
          instructorBio: '',
          supportEmail: 'support@cubixskill.com',
          supportPhone: '',
          theme: {
            primaryColor: item.theme_color || '#2563EB',
            primaryHover: '#1D4ED8',
            primarySoft: '#EFF6FF',
            secondaryColor: '#1E293B',
            accentColor: '#3B82F6',
          },
          enrolledCoursesCount: item.enrolled_courses_count || item.total_courses_count || 0,
          overallProgressPercent: item.overall_progress_percent || 0,
          lastActiveAt: item.last_active_at || 'Recently active',
        }));
      }
    } catch {
      // Fallback to enrollment mapping if needed
    }

    const enrollments = await this.getStudentEnrollments();
    const academyMap = new Map<string, AcademyData>();

    enrollments.forEach((item) => {
      const acad = item.course?.academy;
      if (acad && acad.id && !academyMap.has(String(acad.id))) {
        const id = String(acad.id);
        academyMap.set(id, {
          id,
          uuid: id,
          academyUuid: id,
          name: acad.name || 'Academy',
          tagline: 'Modern Learning Platform',
          logoUrl: acad.logo_url || '',
          faviconUrl: '',
          heroHeadline: 'Build Skills for the Future',
          heroSubheadline: 'Explore production-ready courses',
          aboutText: '',
          instructorName: 'Academy Educator',
          instructorTitle: 'Instructor',
          instructorAvatar: '',
          instructorBio: '',
          supportEmail: 'support@cubixskill.com',
          supportPhone: '',
          theme: {
            primaryColor: acad.theme_color || '#2563EB',
            primaryHover: '#1D4ED8',
            primarySoft: '#EFF6FF',
            secondaryColor: '#1E293B',
            accentColor: '#3B82F6',
          },
          enrolledCoursesCount: enrollments.filter((e) => String(e.course?.academy?.id) === id).length,
          overallProgressPercent: 0,
          lastActiveAt: 'Recently active',
        });
      }
    });

    return Array.from(academyMap.values());
  },

  async getCourses(): Promise<any[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.courses.list);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    } catch {
      return [];
    }
  },

  async getCourseDetail(courseUuid: string): Promise<any> {
    const res = await apiClient.get<any>(API_ENDPOINTS.courses.detail(courseUuid));
    return res?.data || res;
  },

  async getCourseModules(courseUuid: string): Promise<any[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.courses.modules, { course: courseUuid });
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    } catch {
      return [];
    }
  },

  async getStudentCertificates(): Promise<any[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.certificates.studentCertificates);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    } catch {
      return [];
    }
  },

  async getStudentLiveClasses(): Promise<any[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.liveClasses.studentLiveClasses);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    } catch {
      return [];
    }
  },

  async getNotifications(): Promise<any[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.notifications.list);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    } catch {
      return [];
    }
  },

  async getCourseOverview(academyUuid: string, courseUuid: string): Promise<StudentCourseOverviewResponse | null> {
    const res = await apiClient.get<any>(`/api/v1/enrollments/student/enrollments/academies/${academyUuid}/courses/${courseUuid}/overview/`);
    if (!res) return null;
    if (res.academy && res.course) return res;
    if (res.data && res.data.academy && res.data.course) return res.data;
    return res;
  },

  async getCourseLearnBootstrap(academyUuid: string, courseUuid: string): Promise<any> {
    const res = await apiClient.get<any>(`/api/v1/enrollments/student/enrollments/academies/${academyUuid}/courses/${courseUuid}/learn/`);
    return res?.data || res;
  },

  async getLessonDetail(academyUuid: string, courseUuid: string, lessonUuid: string): Promise<any> {
    const res = await apiClient.get<any>(`/api/v1/enrollments/student/enrollments/academies/${academyUuid}/courses/${courseUuid}/lessons/${lessonUuid}/`);
    return res?.data || res;
  },

  async markLessonComplete(academyUuid: string, courseUuid: string, lessonUuid: string): Promise<any> {
    const res = await apiClient.post<any>(`/api/v1/enrollments/student/enrollments/academies/${academyUuid}/courses/${courseUuid}/lessons/${lessonUuid}/complete/`);
    return res?.data || res;
  },
};
