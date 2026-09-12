import { apiClient, publicApiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiEndpoints';
import { env } from '../config/env';
import { resolveMediaUrl } from './apiClient';

export function stringifyApiErrorValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value == null) {
    return '';
  }

  if (Array.isArray(value)) {
    return value
      .map(stringifyApiErrorValue)
      .filter(Boolean)
      .join(' ');
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    const code = stringifyApiErrorValue(obj.code);
    const detail = stringifyApiErrorValue(obj.detail);
    const message = stringifyApiErrorValue(obj.message);
    const error = stringifyApiErrorValue(obj.error);

    const description = detail || message || error;

    if (code && description) {
      return `${code}: ${description}`;
    }

    if (description) {
      return description;
    }

    if (code) {
      return code;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

export interface StudentEnrollmentItem {
  id: string;
  course: {
    id: string;
    title: string;
    price?: number | string;
    academy_id?: string;
    academy?: {
      id?: string;
      uuid?: string;
      name?: string;
      logo_url?: string;
      theme_color?: string;
    };
    slug?: string;
    thumbnail?: string;
    description?: string;
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

export interface StudentProfileMedia {
  id: string;
  url?: string;
  mime_type?: string;
  media_type?: string;
}

export interface StudentSelfProfile {
  id: string;
  user_id: string;
  student_code: string;
  full_name: string;
  display_name: string;
  email: string;
  phone: string;
  date_of_birth?: string | null;
  bio?: string;
  profile_photo?: StudentProfileMedia | null;
}

export interface CertificateProfileField {
  id?: string;
  key: string;
  label: string;
  type: string;
  required: boolean;
  editable: boolean;
  value: string | number | boolean | null;
  missing: boolean;
  sort_order?: number;
}

export interface CertificateProfileDetailsResponse {
  enrollment_id: string;
  course_id: string;
  certificate_status?: string;
  fields: CertificateProfileField[];
  missing_fields?: Array<{
    key: string;
    label: string;
  }>;
}

export const studentPortalService = {
  async getStudentProfile(): Promise<StudentSelfProfile> {
    const res = await apiClient.get<any>(API_ENDPOINTS.students.selfProfile);
    return res?.data ?? res;
  },

  async updateStudentProfile(payload: {
    full_name?: string;
    phone?: string;
    display_name?: string;
    date_of_birth?: string | null;
    bio?: string;
    profile_photo_id?: string | null;
  }): Promise<StudentSelfProfile> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.students.selfProfile, payload);
    return res?.data ?? res;
  },

  async uploadProfilePhoto(file: File): Promise<StudentProfileMedia> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<any>(API_ENDPOINTS.storage.upload, formData);
    return res?.data ?? res;
  },
  async getStudentEnrollments(): Promise<StudentEnrollmentItem[]> {
    const res = await apiClient.get<any>(API_ENDPOINTS.enrollments.studentEnrollments);
    const data = res?.data ?? res;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
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
          logoUrl: item.logo_url ? resolveMediaUrl(item.logo_url) : (item.logo ? resolveMediaUrl(item.logo) : ''),
          faviconUrl: item.favicon_url ? resolveMediaUrl(item.favicon_url) : (item.favicon ? resolveMediaUrl(item.favicon) : ''),
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
          features: item.features || { lesson_locking: true, student_reports: true },
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
          logoUrl: (acad as any).logo_url ? resolveMediaUrl((acad as any).logo_url) : ((acad as any).logo ? resolveMediaUrl((acad as any).logo) : ''),
          faviconUrl: (acad as any).favicon_url ? resolveMediaUrl((acad as any).favicon_url) : ((acad as any).favicon ? resolveMediaUrl((acad as any).favicon) : ''),
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

  async getCourses(academyUuid?: string): Promise<any[]> {
    try {
      const endpoint = academyUuid
        ? `/api/v1/enrollments/student/enrollments/academies/${encodeURIComponent(academyUuid)}/courses`
        : API_ENDPOINTS.courses.list;
      const res = await apiClient.get<any>(endpoint);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.courses)) return data.courses;
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

  async getPublicCourseDetail(academyIdentifier: string, courseIdentifier: string): Promise<any> {
    const res = await publicApiClient.get<any>(
      API_ENDPOINTS.website.publicCourseDetail(academyIdentifier, courseIdentifier)
    );
    return res?.data ?? res;
  },

  async getCourseModules(courseUuid: string): Promise<any[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.courses.modules(courseUuid));
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

  async getNotifications(academyUuid?: string): Promise<any[]> {
    try {
      const url = academyUuid
        ? `${API_ENDPOINTS.notifications.list}?academy_id=${academyUuid}`
        : API_ENDPOINTS.notifications.list;
      const res = await apiClient.get<any>(url);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    } catch {
      return [];
    }
  },

  async getUnreadNotificationCount(academyUuid?: string): Promise<number> {
    try {
      const url = academyUuid
        ? `${API_ENDPOINTS.notifications.unreadCount}?academy_id=${academyUuid}`
        : API_ENDPOINTS.notifications.unreadCount;
      const res = await apiClient.get<any>(url);
      const data = res?.data || res;
      return typeof data?.unread_count === 'number' ? data.unread_count : 0;
    } catch {
      return 0;
    }
  },

  async markNotificationRead(id: string): Promise<boolean> {
    try {
      await apiClient.post(API_ENDPOINTS.notifications.markRead(id));
      return true;
    } catch {
      return false;
    }
  },

  async markAllNotificationsRead(academyUuid?: string): Promise<number> {
    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.notifications.markAllRead, {
        academy_id: academyUuid,
      });
      const data = res?.data || res;
      return data?.updated_count ?? 0;
    } catch {
      return 0;
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

  async getCertificateProfileDetails(enrollmentUuid: string): Promise<CertificateProfileDetailsResponse> {
    const res = await apiClient.get<any>(API_ENDPOINTS.certificates.enrollmentProfileDetails(enrollmentUuid));
    return res?.data || res;
  },

  async updateCertificateProfileDetails(
    enrollmentUuid: string,
    values: Record<string, any>
  ): Promise<CertificateProfileDetailsResponse> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.certificates.enrollmentProfileDetails(enrollmentUuid), { values });
    return res?.data || res;
  },

  async issueOrCheckCertificate(enrollmentUuid: string): Promise<any> {
    const res = await apiClient.post<any>(API_ENDPOINTS.certificates.issueOrCheck(enrollmentUuid));
    return res?.data || res;
  },

  async getStudentCertificate(certificateId: string): Promise<any> {
    const res = await apiClient.get<any>(API_ENDPOINTS.certificates.detail(certificateId));
    return res?.data || res;
  },

  async getCertificatePdfBlob(certificateId: string): Promise<Blob> {
    const endpoint = API_ENDPOINTS.certificates.download(certificateId);
    const baseUrl = env.apiBaseUrl.replace(/\/+$/, '');
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    let res: Response;

    try {
      res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-Portal': 'student',
        },
      });
    } catch (error) {
      const message = stringifyApiErrorValue(error);
      throw new Error(
        message
          ? `Unable to connect to certificate service: ${message}`
          : 'Unable to connect to certificate service.'
      );
    }

    if (!res.ok) {
      let backendMessage = '';
      let errorCode = '';

      try {
        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          const body: any = await res.json();
          errorCode = body?.code || (typeof body?.detail === 'object' ? body?.detail?.code : '');
          backendMessage = stringifyApiErrorValue(body);
        } else {
          backendMessage = (await res.text()).trim();
        }
      } catch {
        // Preserve HTTP fallback
      }

      if (errorCode === 'CERTIFICATE_FONT_UNSUPPORTED' || backendMessage.includes('CERTIFICATE_FONT_UNSUPPORTED') || errorCode === 'CERTIFICATE_FONT_NOT_AVAILABLE' || backendMessage.includes('CERTIFICATE_FONT_NOT_AVAILABLE')) {
        throw new Error('Certificate document is currently unavailable because the certificate font is not PDF-compatible. Please contact the academy.');
      }

      const fallback = `Failed to fetch certificate PDF (HTTP ${res.status})`;

      throw new Error(
        backendMessage
          ? `${fallback}: ${backendMessage}`
          : fallback
      );
    }

    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/pdf')) {
      let responseMessage = '';

      try {
        if (contentType.includes('application/json')) {
          const body: unknown = await res.json();
          responseMessage = stringifyApiErrorValue(body);
        } else {
          responseMessage = (await res.text()).trim();
        }
      } catch {
        // Use fallback
      }

      throw new Error(
        responseMessage || 'Response is not a valid PDF document.'
      );
    }

    return res.blob();
  },

  async verifyPublicCertificate(verificationCode: string): Promise<any> {
    return publicApiClient.get<any>(API_ENDPOINTS.certificates.verifyPublic(verificationCode));
  },
};
