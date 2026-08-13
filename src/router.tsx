import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { AcademyLoginPage } from './features/auth/pages/AcademyLoginPage';
import { StudentRegisterPage } from './features/auth/pages/StudentRegisterPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { SetupPasswordPage } from './features/auth/pages/SetupPasswordPage';

import { AuthGuard } from './features/auth/components/AuthGuard';
import { GuestGuard } from './features/auth/components/GuestGuard';
import { AcademyEnrollmentGuard } from './features/auth/components/AcademyEnrollmentGuard';
import { CourseEnrollmentGuard } from './features/auth/components/CourseEnrollmentGuard';

import { AcademyHomePage } from './features/public-academy/pages/AcademyHomePage';
import { AcademyPublicCoursesPage } from './features/public-academy/pages/AcademyPublicCoursesPage';
import { CourseDetailPage } from './features/public-academy/pages/CourseDetailPage';
import { AcademyContactPage } from './features/public-academy/pages/AcademyContactPage';

import { MyAcademiesPage } from './features/academies/pages/MyAcademiesPage';
import { AcademyCoursesPage } from './features/academies/pages/AcademyCoursesPage';
import { StudentPortalLayout } from './components/layout/StudentPortalLayout';

import { OverviewPage } from './features/learning/pages/OverviewPage';
import { LessonPlayerPage } from './features/learning/pages/LessonPlayerPage';
import { CurriculumPage } from './features/curriculum/pages/CurriculumPage';
import { AssignmentsPage } from './features/assignments/pages/AssignmentsPage';
import { QuizzesPage } from './features/quizzes/pages/QuizzesPage';
import { LiveClassesPage } from './features/live-classes/pages/LiveClassesPage';
import { CertificatesPage } from './features/certificates/pages/CertificatesPage';
import { VerifyCertificatePage } from './features/certificates/pages/VerifyCertificatePage';
import { NotificationsPage } from './features/notifications/pages/NotificationsPage';
import { DiscussionsPage } from './features/discussions/pages/DiscussionsPage';
import { PersonalChatPage } from './features/personal-chat/pages/PersonalChatPage';
import { ProfileSettingsPage } from './features/profile/pages/ProfileSettingsPage';

import { NotFoundPage } from './features/error-pages/NotFoundPage';
import { ForbiddenPage } from './features/error-pages/ForbiddenPage';
import { UnauthorizedPage } from './features/error-pages/UnauthorizedPage';
import { ServerErrorPage } from './features/error-pages/ServerErrorPage';
import { NetworkErrorPage } from './features/error-pages/NetworkErrorPage';

import { StudentRouteErrorBoundary } from './features/error-pages/StudentRouteErrorBoundary';

export const router = createBrowserRouter([
  // DEFAULT REDIRECT TO DEFAULT PUBLIC ACADEMY
  {
    path: '/',
    element: <Navigate to="/550e8400-e29b-41d4-a716-446655440000" replace />,
  },
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <GuestGuard>
        <ForgotPasswordPage />
      </GuestGuard>
    ),
  },
  {
    path: '/setup-password',
    element: (
      <GuestGuard>
        <SetupPasswordPage />
      </GuestGuard>
    ),
  },
  {
    path: '/register',
    element: <Navigate to="/login" replace />,
  },

  // GLOBAL ACADEMY FALLBACK / MANUAL SWITCHING
  {
    path: '/student/academies',
    element: (
      <AuthGuard>
        <MyAcademiesPage />
      </AuthGuard>
    ),
  },

  // PROTECTED STUDENT PORTAL (ACADEMY-AWARE & COURSE-AWARE)
  {
    path: '/student/academies/:academyUuid',
    errorElement: <StudentRouteErrorBoundary />,
    element: (
      <AuthGuard>
        <AcademyEnrollmentGuard />
      </AuthGuard>
    ),
    children: [
      {
        path: 'courses',
        element: <AcademyCoursesPage />,
      },
      {
        path: 'courses/:courseUuid',
        errorElement: <StudentRouteErrorBoundary />,
        element: <CourseEnrollmentGuard />,
        children: [
          {
            element: <StudentPortalLayout />,
            errorElement: <StudentRouteErrorBoundary />,
            children: [
              { index: true, element: <Navigate to="overview" replace /> },
              { path: 'overview', element: <OverviewPage /> },
              { path: 'learn', element: <LessonPlayerPage /> },
              { path: 'learn/:lessonId', element: <LessonPlayerPage /> },
              { path: 'curriculum', element: <CurriculumPage /> },
              { path: 'assignments', element: <Navigate to="../overview" replace /> },
              { path: 'quizzes', element: <Navigate to="../overview" replace /> },
              { path: 'live-classes', element: <LiveClassesPage /> },
              { path: 'certificates', element: <CertificatesPage /> },
              { path: 'announcements', element: <Navigate to="../notifications" replace /> },
              { path: 'discussions', element: <DiscussionsPage /> },
              { path: 'personal-chat', element: <PersonalChatPage /> },
              { path: 'personal-chat/:conversationUuid', element: <PersonalChatPage /> },
              { path: 'downloads', element: <Navigate to="../overview" replace /> },
              { path: 'calendar', element: <Navigate to="../notifications" replace /> },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'settings', element: <ProfileSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // PUBLIC ACADEMY WEBSITE ROUTES
  {
    path: '/:academyUuid',
    element: <AcademyHomePage />,
  },
  {
    path: '/:academyUuid/courses',
    element: <AcademyPublicCoursesPage />,
  },
  {
    path: '/:academyUuid/courses/:courseUuid',
    element: <CourseDetailPage />,
  },
  {
    path: '/:academyUuid/login',
    element: (
      <GuestGuard>
        <AcademyLoginPage />
      </GuestGuard>
    ),
  },
  {
    path: '/:academyUuid/register',
    element: (
      <GuestGuard>
        <StudentRegisterPage />
      </GuestGuard>
    ),
  },
  {
    path: '/:academyUuid/contact',
    element: <AcademyContactPage />,
  },

  // UTILITY ROUTES & ERROR PAGES
  {
    path: '/verify/certificate/:certificateUuid',
    element: <VerifyCertificatePage />,
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '/401',
    element: <UnauthorizedPage />,
  },
  {
    path: '/500',
    element: <ServerErrorPage />,
  },
  {
    path: '/network-error',
    element: <NetworkErrorPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

