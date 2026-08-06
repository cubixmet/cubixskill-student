import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { SetupPasswordPage } from './features/auth/pages/SetupPasswordPage';
import { AuthGuard } from './features/auth/components/AuthGuard';
import { GuestGuard } from './features/auth/components/GuestGuard';
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
import { AnnouncementsPage } from './features/announcements/pages/AnnouncementsPage';
import { DiscussionsPage } from './features/discussions/pages/DiscussionsPage';
import { PersonalChatPage } from './features/personal-chat/pages/PersonalChatPage';
import { DownloadsPage } from './features/downloads/pages/DownloadsPage';
import { CalendarPage } from './features/calendar/pages/CalendarPage';
import { ProfileSettingsPage } from './features/profile/pages/ProfileSettingsPage';
import { NotFoundPage } from './features/error-pages/NotFoundPage';
import { ForbiddenPage } from './features/error-pages/ForbiddenPage';
import { UnauthorizedPage } from './features/error-pages/UnauthorizedPage';
import { ServerErrorPage } from './features/error-pages/ServerErrorPage';
import { NetworkErrorPage } from './features/error-pages/NetworkErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
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
  {
    path: '/student/academies',
    element: (
      <AuthGuard>
        <MyAcademiesPage />
      </AuthGuard>
    ),
  },
  {
    path: '/student/academies/:academyUuid/courses',
    element: (
      <AuthGuard>
        <AcademyCoursesPage />
      </AuthGuard>
    ),
  },
  {
    path: '/student/academies/:academyUuid/courses/:courseUuid',
    element: (
      <AuthGuard>
        <StudentPortalLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'learn', element: <LessonPlayerPage /> },
      { path: 'curriculum', element: <CurriculumPage /> },
      { path: 'assignments', element: <AssignmentsPage /> },
      { path: 'quizzes', element: <QuizzesPage /> },
      { path: 'live-classes', element: <LiveClassesPage /> },
      { path: 'certificates', element: <CertificatesPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'discussions', element: <DiscussionsPage /> },
      { path: 'personal-chat', element: <PersonalChatPage /> },
      { path: 'personal-chat/:conversationUuid', element: <PersonalChatPage /> },
      { path: 'downloads', element: <DownloadsPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'notifications', element: <AnnouncementsPage /> },
      { path: 'settings', element: <ProfileSettingsPage /> },
    ],
  },
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
