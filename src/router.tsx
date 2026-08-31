import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { AcademyLoginPage } from './features/auth/pages/AcademyLoginPage';
import { StudentRegisterPage } from './features/auth/pages/StudentRegisterPage';
import { VerifyEmailPage } from './features/auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { SetupPasswordPage } from './features/auth/pages/SetupPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';

import { AuthGuard } from './features/auth/components/AuthGuard';
import { GuestGuard } from './features/auth/components/GuestGuard';
import { AcademyEnrollmentGuard } from './features/auth/components/AcademyEnrollmentGuard';
import { CourseEnrollmentGuard } from './features/auth/components/CourseEnrollmentGuard';

import { PublicAcademyLayout } from './features/public-academy/layouts/PublicAcademyLayout';
import { AcademyHomePage } from './features/public-academy/pages/AcademyHomePage';
import { AcademyPublicCoursesPage } from './features/public-academy/pages/AcademyPublicCoursesPage';
import { CourseDetailPage } from './features/public-academy/pages/CourseDetailPage';
import { AcademyContactPage } from './features/public-academy/pages/AcademyContactPage';
import { CheckoutPage } from './features/checkout/pages/CheckoutPage';

import { MyAcademiesPage } from './features/academies/pages/MyAcademiesPage';
import { AcademyCoursesPage } from './features/academies/pages/AcademyCoursesPage';
import { StudentDashboardPage } from './features/academies/pages/StudentDashboardPage';
import { StudentPortalLayout } from './components/layout/StudentPortalLayout';

import { OverviewPage } from './features/learning/pages/OverviewPage';
import { LessonPlayerPage } from './features/learning/pages/LessonPlayerPage';
import { CurriculumPage } from './features/curriculum/pages/CurriculumPage';
import { LiveClassesPage } from './features/live-classes/pages/LiveClassesPage';
import { CertificatesPage } from './features/certificates/pages/CertificatesPage';
import { NotificationsPage } from './features/notifications/pages/NotificationsPage';
import { DiscussionsPage } from './features/discussions/pages/DiscussionsPage';
import { PersonalChatPage } from './features/personal-chat/pages/PersonalChatPage';
import { AnnouncementsPage } from './features/announcements/pages/AnnouncementsPage';
import { FeesPage } from './features/profile/pages/FeesPage';
import { ProfileSettingsPage } from './features/profile/pages/ProfileSettingsPage';

import { NotFoundPage } from './features/error-pages/NotFoundPage';
import { ForbiddenPage } from './features/error-pages/ForbiddenPage';
import { UnauthorizedPage } from './features/error-pages/UnauthorizedPage';
import { ServerErrorPage } from './features/error-pages/ServerErrorPage';
import { NetworkErrorPage } from './features/error-pages/NetworkErrorPage';

import { StudentRouteErrorBoundary } from './features/error-pages/StudentRouteErrorBoundary';
import { getLastAcademy } from './lib/navigationIntent';

const RootAppRedirect: React.FC = () => {
  const lastAcademy = getLastAcademy();
  if (lastAcademy) {
    return <Navigate to={`/${lastAcademy}`} replace />;
  }
  return <Navigate to="/student/academies" replace />;
};

export const router = createBrowserRouter([
  // DEFAULT ROOT REDIRECT TO LAST ACADEMY OR MY ACADEMIES
  {
    path: '/',
    element: <RootAppRedirect />,
  },
  {
    path: '/login',
    element: <RootAppRedirect />,
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
    element: <RootAppRedirect />,
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
        index: true,
        element: <StudentDashboardPage />,
      },
      {
        path: 'dashboard',
        element: <Navigate to=".." replace />,
      },
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
              { path: 'fees', element: <FeesPage /> },
              { path: 'announcements', element: <AnnouncementsPage /> },
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

  // PUBLIC ACADEMY WEBSITE & DASHBOARD ROUTER (ALL AUTH ROUTES SCOPED UNDER ACADEMY UUID)
  {
    path: '/:academyUuid',
    element: <PublicAcademyLayout />,
    children: [
      {
        index: true,
        element: <AcademyHomePage />,
      },
      {
        path: 'dashboard',
        element: (
          <Navigate to={`/student/academies/${window.location.pathname.split('/')[1]}`} replace />
        ),
      },
      {
        path: 'courses',
        element: <AcademyPublicCoursesPage />,
      },
      {
        path: 'courses/:courseUuid',
        element: <CourseDetailPage />,
      },
      {
        path: 'courses/:courseUuid/overview',
        element: (
          <Navigate to={`/student/academies/${window.location.pathname.split('/')[1]}/courses/${window.location.pathname.split('/')[3]}/overview`} replace />
        ),
      },
      {
        path: 'checkout/:courseUuid',
        element: (
          <AuthGuard>
            <CheckoutPage />
          </AuthGuard>
        ),
      },
      {
        path: 'login',
        element: (
          <GuestGuard>
            <AcademyLoginPage />
          </GuestGuard>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestGuard>
            <StudentRegisterPage />
          </GuestGuard>
        ),
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'setup-password',
        element: <SetupPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'contact',
        element: <AcademyContactPage />,
      },
    ],
  },

  // UTILITY ROUTES & ERROR PAGES
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
