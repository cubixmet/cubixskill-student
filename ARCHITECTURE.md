# CubixSkill Student Portal — Architecture & Technical Specification

## 1. Overview & Architectural Goals

The **CubixSkill Student Portal** is designed as a scalable, multi-tenant student interface built around a **Global Student Account** model.

### Key Goals:
1. **Single Global Identity:** Students maintain one global account (single email & password) across all academies on the platform.
2. **Academy-Isolated Learning Context:** After authenticating globally, students select an academy from their dashboard. The application dynamically adopts that academy's branding, theme, and context while preserving layout consistency.
3. **Scalability & Reusability:** A unified codebase manages routing, state stores, asset deliveries, and branded student portal modules seamlessly.

---

## 2. User Journey & Navigation Flow

```
+------------------+     +-------------------+     +------------------+     +------------------+     +-----------------+
|  Public Website  | --> | Register / Login  | --> |   My Academies   | --> | Select Academy   | --> | Branded Student |
|  (Academy Slug)  |     | (Global Account)  |     |  Dashboard Hub   |     |  & Active Course |     | Portal Modules  |
+------------------+     +-------------------+     +------------------+     +------------------+     +-----------------+
```

1. **Public Website Navigation:** Visitors browse courses on an academy’s public website (identified by unique slug/ID), register/login, and purchase courses.
2. **Global Authentication:** Sign-in uses global credentials handled via [`AuthGuard`](src/features/auth/components/AuthGuard.tsx) and [`GuestGuard`](src/features/auth/components/GuestGuard.tsx).
3. **My Academies Hub:** Post-login, [`MyAcademiesPage`](src/features/academies/pages/MyAcademiesPage.tsx) displays all enrolled academies with logo, name, enrolled course count, and custom theme previews.
4. **Academy Portal Access:** Selecting an academy initializes the branded environment and routes the student directly into their courses at `/student/academies/:academyUuid/courses/:courseUuid`.

---

## 3. Student Portal Modules Overview

The portal implements 12 core functional modules accessible via [`StudentPortalLayout`](src/components/layout/StudentPortalLayout.tsx):

| Module | Route / Subpath | Description & Core Functions |
| :--- | :--- | :--- |
| **Overview** | `overview` | Course progress summary, upcoming deadlines, recent announcements, quick-continue card. |
| **Continue Learning** | `learn` | Interactive lesson player with video playback, text contents, progress tracking, and navigation. |
| **Curriculum** | `curriculum` | Full course outline, module/chapter list, downloadable attachments, completion status. |
| **Assignments** | `assignments` | List of homework assignments, submission status, grade feedback, file uploader. |
| **Quizzes** | `quizzes` | Multiple-choice quizzes, timed assessments, score breakdowns, retake rules. |
| **Live Classes** | `live-classes` | Upcoming live session schedules, Zoom/Google Meet links, recorded session archives. |
| **Certificates** | `certificates` | Issued completion certificates, previewer, PDF download, public verification link generator. |
| **Announcements** | `announcements` | Academy-wide broadcast notices, course updates, pinned messages. |
| **Discussions** | `discussions` | Course peer forum, Q&A threads, upvoting, instructor responses. |
| **Personal Chat** | `personal-chat` | Direct 1-on-1 messaging with instructors or course mentors. |
| **Downloads** | `downloads` | Consolidated repository of course PDFs, resource files, source code zips. |
| **Calendar & Notifications** | `calendar`, `notifications` | Event scheduling, assignment due date alerts, system notifications. |
| **Profile & Settings** | `settings` | Account profile details, password updates, notification preferences, session management. |

---

## 4. Dynamic Branding & Theming Engine

The platform maintains layout structure while dynamically swapping branding properties stored in [`academy.store.ts`](src/stores/academy.store.ts):

- **Logo & Favicon:** Custom academy brand assets injected dynamically into headers, sidebars, and document head.
- **Academy Name:** Rendered across navigation bars, footers, and email templates.
- **Predefined CSS Theme Palettes:** Injects active theme CSS variables into the root DOM element.

---

## 5. Technology Stack & State Stores

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 + Vanilla CSS Design System
- **Routing:** `react-router-dom` v7 ([`router.tsx`](src/router.tsx))
- **State Stores (`src/stores/`):**
  - [`auth.store.ts`](src/stores/auth.store.ts) — Authentication & Token management
  - [`academy.store.ts`](src/stores/academy.store.ts) — Enrolled academies & branding state
  - [`course.store.ts`](src/stores/course.store.ts) — Enrolled courses & active selection
  - [`learning.store.ts`](src/stores/learning.store.ts) — Progress tracking & active lesson player state
  - [`certificate.store.ts`](src/stores/certificate.store.ts) — Verification & PDF generation
