# Responsive UI changes and page inventory

Mobile form fields use 16px text to avoid focus zoom on iOS. Flexible children can shrink without forcing the whole page wider. Shared overlays render at the document body, retain scroll locks across nested dialogs, trap keyboard focus, close on Escape, and restore the opener focus.

The course sidebar and desktop navigation begin at 1024px, preserving tablet content width. Bottom navigation and floating chat controls include device safe areas. Academy and student menus lock background scrolling and close when switching to desktop navigation. The shared right drawer aligns to the right. Lesson toolbar controls wrap; calendar cards stack; settings notifications stay above bottom navigation; chat uses dynamic viewport height.

Validation: production build (tsc -b and Vite) passed. Overlay DOM interaction checks passed for nested locks, Escape, Tab/Shift+Tab and focus restoration. Focused overlay ESLint checks passed.

Browser visual validation is pending: this environment has no browser binary, and the Chromium download returned an invalid archive. Builds and DOM checks do not establish pixel layout correctness. Before merging, check 320px, 390px, 768px, 1024px and 1440px widths with long names, populated and empty lists, loading/error states, open dialogs, keyboard navigation, iOS safe areas and mobile keyboards. Certificate canvases, media controls, checkout, chat and live classroom require real browser checks with representative data.

## Page inventory

All pages below receive the shared CSS foundations. “Page adjustment” identifies files directly changed in this PR. Other pages keep their existing page layout; listing them is not a claim of completed browser testing.

| Page source | Coverage |
| --- | --- |
| `src/features/academies/pages/AcademyCoursesPage.tsx` | Shared foundations; existing page layout |
| `src/features/academies/pages/MyAcademiesPage.tsx` | Shared foundations; existing page layout |
| `src/features/academies/pages/StudentDashboardPage.tsx` | Page adjustment + shared foundations |
| `src/features/announcements/pages/AnnouncementsPage.tsx` | Shared foundations; existing page layout |
| `src/features/assignments/pages/AssignmentsPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/AcademyLoginPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/ForgotPasswordPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/LoginPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/RegisterPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/ResetPasswordPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/SetupPasswordPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/StudentRegisterPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/VerifyEmailPage.tsx` | Shared foundations; existing page layout |
| `src/features/calendar/pages/CalendarPage.tsx` | Page adjustment + shared foundations |
| `src/features/certificates/pages/CertificatesPage.tsx` | Shared foundations; existing page layout |
| `src/features/certificates/pages/PublicCertificateVerifyPage.tsx` | Shared foundations; existing page layout |
| `src/features/certificates/pages/VerifyCertificatePage.tsx` | Shared foundations; existing page layout |
| `src/features/checkout/pages/CheckoutPage.tsx` | Shared foundations; existing page layout |
| `src/features/curriculum/pages/CurriculumPage.tsx` | Shared foundations; existing page layout |
| `src/features/discussions/pages/DiscussionsPage.tsx` | Shared foundations; existing page layout |
| `src/features/downloads/pages/DownloadsPage.tsx` | Shared foundations; existing page layout |
| `src/features/learning/pages/LessonPlayerPage.tsx` | Page adjustment + shared foundations |
| `src/features/learning/pages/OverviewPage.tsx` | Shared foundations; existing page layout |
| `src/features/live-classes/pages/LiveClassesPage.tsx` | Shared foundations; existing page layout |
| `src/features/notifications/pages/NotificationsPage.tsx` | Shared foundations; existing page layout |
| `src/features/personal-chat/pages/PersonalChatPage.tsx` | Page adjustment + shared foundations |
| `src/features/profile/pages/FeesPage.tsx` | Shared foundations; existing page layout |
| `src/features/profile/pages/ProfileSettingsPage.tsx` | Page adjustment + shared foundations |
| `src/features/public-academy/pages/AcademyHomePage.tsx` | Shared foundations; existing page layout |
| `src/features/public-academy/pages/AcademyPublicCoursesPage.tsx` | Shared foundations; existing page layout |
| `src/features/public-academy/pages/CourseDetailPage.tsx` | Shared foundations; existing page layout |
| `src/features/quizzes/pages/QuizzesPage.tsx` | Shared foundations; existing page layout |
