import type { CourseEntity, CourseModule, CourseLesson } from '../stores/course.store';

export const DEMO_ACADEMY_UUID = '550e8400-e29b-41d4-a716-446655440000';
export const DEMO_COURSE_UUID = '9c78bda1-98c2-4b11-8b81-92d3db12b501';

export const DEMO_PROGRESS_STORAGE_KEY = 'cubixskill:demo-learn-progress';

/**
 * Standard Frontend Mock Curriculum for Target Demo Course:
 * - Academy UUID: 550e8400-e29b-41d4-a716-446655440000
 * - Course UUID:  9c78bda1-98c2-4b11-8b81-92d3db12b501
 */
export const studentLearnDemoModules: CourseModule[] = [
  {
    id: 'mock-module-1',
    title: 'Module 1 — React 19 Foundations',
    lessonsCount: 5,
    duration: '1h 23m',
    lessons: [
      {
        id: 'mock-react19-introduction',
        title: 'React 19 Introduction',
        description: 'Introduction to React 19 core mental models, Server Actions, and compiler optimizations.',
        type: 'video',
        duration: '18m',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
        isDemoAccessible: true,
        isPreview: true,
      },
      {
        id: 'mock-react19-compiler',
        title: 'React 19 Compiler Mechanics',
        description: 'Deep dive into automatic memoization, AST transformations, and rendering behavior without manual useMemo or useCallback hooks.',
        type: 'video',
        duration: '26m',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
        isDemoAccessible: true,
        isPreview: true,
      },
      {
        id: 'mock-server-actions',
        title: 'Server Actions Explained',
        description: 'Reference guide and interactive notes for modern form and server action patterns.',
        type: 'text',
        duration: '12m',
        content: `
# Server Actions & Async Transitions in React 19

React 19 introduces native support for Async Transitions and Server Actions via standard HTML form elements and hooks.

## 1. Overview & Mental Model
Server Actions allow client components to invoke asynchronous server functions seamlessly without writing manual fetch API boilerplate or managing low-level request headers.

## 2. Key API Highlights
* **useActionState**: Manages pending action state and form submission results automatically.
* **useOptimistic**: Applies optimistic UI updates while server transactions execute asynchronously.
* **useFormStatus**: Reads parent form pending states without prop drilling.

\`\`\`tsx
// Example: Modern React 19 Form Submission
import { useActionState } from 'react';

async function updateProfile(prevState: any, formData: FormData) {
  const name = formData.get('name');
  return { success: true, name };
}

export function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <form action={formAction}>
      <input name="name" defaultValue="Student" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
\`\`\`

## 3. Summary
By leveraging Server Actions with Async Transitions, React 19 applications maintain responsive UI feedback, reduce bundle size, and handle form mutations cleanly.
        `,
        isDemoAccessible: true,
        isPreview: true,
      },
      {
        id: 'mock-compiler-image',
        title: 'React Compiler Architecture',
        description: 'Visual breakdown of the React 19 automatic memoization pipeline and AST transformations.',
        type: 'image',
        duration: '12m',
        mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
        isDemoAccessible: true,
        isPreview: true,
      },
      {
        id: 'mock-reference-document',
        title: 'React 19 Reference Notes',
        description: 'Comprehensive PDF reference manual for Next.js App Router & React 19 API boundaries.',
        type: 'document',
        duration: '15m',
        mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        allowDownload: true,
        isDemoAccessible: true,
        isPreview: true,
      },
    ],
  },
  {
    id: 'mock-module-2',
    title: 'Module 2 — Advanced Patterns & Practice',
    lessonsCount: 3,
    duration: '1h 20m',
    lessons: [
      {
        id: 'mock-async-transitions',
        title: 'Async State & Transitions',
        description: 'Working with async UI patterns, boundary fallback states, and non-blocking rendering.',
        type: 'video',
        duration: '25m',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
        isDemoAccessible: true,
      },
      {
        id: 'mock-knowledge-check',
        title: 'React 19 Knowledge Check',
        description: 'Test your understanding of React 19 compiler internals, Server Actions, and Async Transitions.',
        type: 'test',
        duration: '20m',
        isDemoAccessible: true,
      },
      {
        id: 'mock-build-dashboard',
        title: 'React Dashboard Project',
        description: 'Build a responsive React 19 dashboard using the patterns taught in the course.',
        type: 'assignment',
        duration: '35m',
        isDemoAccessible: true,
      },
    ],
  },
  {
    id: 'mock-module-3',
    title: 'Module 3 — Interactive Streams & Specs',
    lessonsCount: 2,
    duration: '1h 00m',
    lessons: [
      {
        id: 'mock-compiler-stream',
        title: 'Live Compiler Q&A Session',
        description: 'Interactive video stream covering community questions and edge cases.',
        type: 'stream',
        duration: '45m',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
        isDemoAccessible: true,
      },
      {
        id: 'mock-react19-url',
        title: 'React 19 Documentation & Specs',
        description: 'Official React 19 release documentation and specs resource link.',
        type: 'url',
        duration: '15m',
        mediaUrl: 'https://react.dev',
        isDemoAccessible: true,
      },
    ],
  },
];

export function isDemoCourseRoute(academyUuid?: string, courseUuid?: string): boolean {
  return (
    academyUuid === DEMO_ACADEMY_UUID &&
    (courseUuid === DEMO_COURSE_UUID || courseUuid === '9c78bda1-98c2-4b11-8b81-92d3db12b501')
  );
}

export interface StudentLearnDataResult {
  isDemo: boolean;
  modules: CourseModule[];
  defaultLessonId: string;
}

export function getStudentLearnData(params: {
  academyUuid?: string;
  courseUuid?: string;
  course?: CourseEntity | null;
}): StudentLearnDataResult {
  const { academyUuid, courseUuid, course } = params;

  if (isDemoCourseRoute(academyUuid, courseUuid)) {
    return {
      isDemo: true,
      modules: studentLearnDemoModules,
      defaultLessonId: 'mock-react19-compiler',
    };
  }

  const realModules = Array.isArray(course?.modules) ? course.modules : [];
  return {
    isDemo: false,
    modules: realModules,
    defaultLessonId: realModules[0]?.lessons?.[0]?.id || '',
  };
}

export function resolveStudentCourseCurriculum(params: {
  course?: CourseEntity | null;
  academyUuid?: string;
  courseUuid?: string;
}): CourseModule[] {
  const { course, academyUuid, courseUuid } = params;
  const realModules = Array.isArray(course?.modules) ? course.modules : [];

  if (realModules.length > 0 && !isDemoCourseRoute(academyUuid, courseUuid)) {
    return realModules;
  }

  if (isDemoCourseRoute(academyUuid, courseUuid)) {
    return studentLearnDemoModules;
  }

  return realModules;
}

export function getCourseWithResolvedCurriculum(
  course?: CourseEntity | null,
  academyUuid?: string,
  courseUuid?: string
): CourseEntity | undefined {
  if (!course) return undefined;
  const modules = resolveStudentCourseCurriculum({ course, academyUuid, courseUuid });
  return {
    ...course,
    modules,
  };
}

export function findLessonByUuid(modules: CourseModule[], lessonUuid?: string): CourseLesson | undefined {
  if (!lessonUuid || !Array.isArray(modules)) return undefined;

  for (const mod of modules) {
    if (!mod || !Array.isArray(mod.lessons)) continue;
    const found = mod.lessons.find((l) => l && (l.id === lessonUuid || l.title.includes(lessonUuid)));
    if (found) return found;
  }

  return undefined;
}

/* LocalStorage progress persistence helper */
export interface DemoProgressData {
  completedLessonIds: string[];
  lastAccessedLessonId?: string;
}

export function loadDemoProgressFromStorage(): DemoProgressData | null {
  try {
    const raw = localStorage.getItem(DEMO_PROGRESS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveDemoProgressToStorage(data: DemoProgressData) {
  try {
    localStorage.setItem(DEMO_PROGRESS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

export function clearDemoProgressStorage() {
  try {
    localStorage.removeItem(DEMO_PROGRESS_STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}
