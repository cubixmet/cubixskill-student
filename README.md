# CubixSkill Student Portal

The **CubixSkill Student Portal** is a modern, multi-tenant learning management web portal built with React 19, TypeScript, Vite, and Tailwind CSS. It enables students to manage their enrollments, stream course content, track assignments, participate in discussions, attempt quizzes, and manage certificates under custom academy branding.

---

## 🌟 Key Architectural Features

- **Global Identity System:** Single sign-on / single user account across all enrolled academies.
- **Multi-Academy Support:** Dynamic academy switcher & academy-specific branded portals.
- **Dynamic Theming Engine:** Applies custom academy logo, branding assets, and predefined CSS color themes dynamically while keeping layout structure consistent.
- **Modular Student Learning Suite:** Includes Overview, Lesson Player, Curriculum, Assignments, Quizzes, Live Classes, Certificates (with public verification link generator), Announcements, Discussions, Personal Chat, Downloads, Calendar, and Settings.

---

## 📁 Project Structure

```
cubixskill-student/
├── public/                # Static assets & public brand files
├── src/
│   ├── components/        # Shared UI components & StudentPortalLayout
│   ├── features/          # Feature modules (auth, academies, learning, curriculum, assignments, etc.)
│   ├── stores/            # Zustand global state stores (auth, academy, course, learning, certificate, toast)
│   ├── App.tsx            # Main Application component
│   ├── main.tsx           # Application entrypoint
│   └── router.tsx         # React Router v7 routes & page navigation logic
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and `npm` installed.

### Installation

```bash
cd cubixskill-student
npm install
```

### Running Locally

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

---

## 📚 Application Flow & Routes

- `/login`, `/forgot-password`, `/setup-password`: Auth screens handled via guest guard.
- `/student/academies`: My Academies hub displaying user's enrolled academies.
- `/student/academies/:academyUuid/courses/:courseUuid/*`: Active academy & course student portal layout with sub-routes (`overview`, `learn`, `curriculum`, `assignments`, `quizzes`, `live-classes`, `certificates`, `announcements`, `discussions`, `personal-chat`, `downloads`, `calendar`, `settings`).
- `/verify/certificate/:certificateUuid`: Public certificate verification route.
