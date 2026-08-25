export const API_ENDPOINTS = {
  auth: {
    me: '/api/v1/auth/me/',
    login: '/api/v1/auth/login/',
    logout: '/api/v1/auth/logout/',
    registerStudent: '/api/v1/auth/register/student/',
    refreshToken: '/api/v1/auth/token/refresh/',
    forgotPassword: '/api/v1/auth/password/forgot/',
    setupPassword: '/api/v1/auth/password/setup/',
    resendSetupEmail: '/api/v1/auth/password/setup/resend/',
    resendVerificationEmail: '/api/v1/auth/email/verification/resend/',
    verifyEmail: '/api/v1/auth/email/verify/',
    resetPassword: '/api/v1/auth/password/reset/',
    validateToken: '/api/v1/auth/token/validate/',
  },
  website: {
    publicWebsite: (academyUuid: string) => `/api/v1/website/public/academies/${academyUuid}/website/`,
    publicCourses: (academyUuid: string) => `/api/v1/website/public/academies/${academyUuid}/courses/`,
  },
  enrollments: {
    studentEnrollments: '/api/v1/enrollments/student/enrollments/',
    studentAcademies: '/api/v1/enrollments/student/enrollments/academies/',
  },
  courses: {
    list: '/api/v1/courses/courses/',
    detail: (courseUuid: string) => `/api/v1/courses/courses/${courseUuid}/`,
    modules: '/api/v1/courses/course-modules/',
  },
  certificates: {
    studentCertificates: '/api/v1/certificates/student/certificates/',
  },
  liveClasses: {
    studentLiveClasses: '/api/v1/live-classes/student/live-classes/',
  },
  notifications: {
    list: '/api/v1/notifications/notifications/',
  },
};
