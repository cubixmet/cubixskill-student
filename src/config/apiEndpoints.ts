export const API_ENDPOINTS = {
  auth: {
    me: '/api/v1/auth/student/me/',
    login: '/api/v1/auth/student/login/',
    logout: '/api/v1/auth/student/logout/',
    registerStudent: '/api/v1/auth/register/student/',
    refreshToken: '/api/v1/auth/student/refresh/',
    forgotPassword: '/api/v1/auth/password/forgot/',
    setupPassword: '/api/v1/auth/password/setup/',
    resendSetupEmail: '/api/v1/auth/password/setup/resend/',
    resendVerificationEmail: '/api/v1/auth/email/verification/resend/',
    verifyEmail: '/api/v1/auth/email/verify/',
    resetPassword: '/api/v1/auth/password/reset/',
    changePassword: '/api/v1/auth/password/change/',
    validateToken: '/api/v1/auth/token/validate/',
  },
  students: {
    selfProfile: '/api/v1/students/student/profile/',
  },
  storage: {
    upload: '/api/v1/storage/upload/',
  },
  website: {
    publicWebsite: (academyUuid: string) => `/api/v1/website/public/academies/${academyUuid}/website/`,
    publicCourses: (academyUuid: string) => `/api/v1/website/public/academies/${academyUuid}/courses/`,
    publicCourseDetail: (academyIdentifier: string, courseIdentifier: string) =>
      `/api/v1/website/public/academies/${encodeURIComponent(academyIdentifier)}/courses/${encodeURIComponent(courseIdentifier)}/`,
  },
  enrollments: {
    studentEnrollments: '/api/v1/enrollments/student/enrollments/',
    studentAcademies: '/api/v1/enrollments/student/enrollments/academies/',
  },
  courses: {
    list: '/api/v1/courses/courses/',
    detail: (courseUuid: string) => `/api/v1/courses/courses/${courseUuid}/`,
    modules: (courseUuid: string) => `/api/v1/modules/courses/${courseUuid}/modules/`,
  },
  certificates: {
    studentCertificates: '/api/v1/certificates/student/certificates/',
    detail: (id: string) => `/api/v1/certificates/student/certificates/${id}/`,
    download: (id: string) => `/api/v1/certificates/student/certificates/${id}/download/`,
    verifyPublic: (verificationCode: string) => `/api/v1/certificates/certificates/verify/${encodeURIComponent(verificationCode)}/`,
    enrollmentProfileDetails: (enrollmentUuid: string) => `/api/v1/certificates/enrollments/${enrollmentUuid}/profile-details/`,
    issueOrCheck: (enrollmentUuid: string) => `/api/v1/certificates/enrollments/${enrollmentUuid}/issue-or-check/`,
  },
  liveClasses: {
    studentLiveClasses: '/api/v1/live-classes/student/live-classes/',
  },
  notifications: {
    list: '/api/v1/notifications/notifications/',
    unreadCount: '/api/v1/notifications/notifications/unread-count/',
    markRead: (id: string) => `/api/v1/notifications/notifications/${id}/read/`,
    markAllRead: '/api/v1/notifications/notifications/read-all/',
  },
};
