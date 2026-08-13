import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LessonType =
  | 'video'
  | 'stream'
  | 'image'
  | 'document'
  | 'url'
  | 'text'
  | 'test'
  | 'assignment';

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  type?: LessonType;
  description?: string;
  content?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  isPreview?: boolean;
  isDemoAccessible?: boolean;
  isUnlocked?: boolean;
  allowDownload?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessonsCount: number;
  duration: string;
  lessons: CourseLesson[];
}

export interface CourseEntity {
  id: string;
  uuid: string;
  courseUuid: string; // compatibility key
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
  duration?: string;
  lessonCount?: number;
  studentCount?: number;
  rating?: number;
  reviewsCount?: number;
  isFeatured?: boolean;
  demoEnabled?: boolean;
  demoDurationDays?: number;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  currentModuleTitle: string;
  currentLessonTitle: string;
  lastActiveAt: string;
  accessExpiryDate: string;
  promoVideoUrl?: string;
  promoVideoThumbnail?: string;
  whatYouWillLearn?: string[];
  requirements?: string[];
  modules?: CourseModule[];
  faq?: { question: string; answer: string }[];
  features: {
    assignments: boolean;
    quizzes: boolean;
    liveClasses: boolean;
    certificates: boolean;
    announcements: boolean;
    discussions: boolean;
    personalChat?: boolean;
  };
}

export const MOCK_COURSES: CourseEntity[] = [
  {
    id: 'crs-1',
    uuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    courseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Full Stack React 19 & Cloud Architecture',
    subtitle: 'Build scalable web applications with Server Actions, Hydration, and Zustand',
    description: 'Master the Next Generation of React 19 compiler optimizations, App Router architecture, and production cloud infrastructure.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    instructorName: 'Dr. Vikramaditya Rao',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    category: 'Web Development',
    level: 'Intermediate',
    language: 'English',
    price: 4999,
    currency: '₹',
    duration: '24 Hours',
    lessonCount: 12,
    studentCount: 1420,
    rating: 4.9,
    reviewsCount: 320,
    isFeatured: true,
    demoEnabled: true,
    demoDurationDays: 5,
    progressPercent: 35,
    completedLessonsCount: 4,
    totalLessonsCount: 12,
    currentModuleTitle: 'Module 1: React 19 Foundations',
    currentLessonTitle: '1.4 React Compiler Architecture',
    lastActiveAt: '10 minutes ago',
    accessExpiryDate: '2027-12-31',
    promoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    promoVideoThumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    whatYouWillLearn: [
      'Master React 19 Compiler, Server Actions, and Async Transitions',
      'Architect Zustand persistent stores with SSR hydration safety',
      'Deploy containerized React apps to AWS ECS & Vercel Edge',
      'Implement real-time 1-on-1 personal chat & WebSockets',
    ],
    requirements: ['Solid understanding of JavaScript ES6+', 'Basic experience with React or Node.js'],
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1 — React 19 Foundations',
        lessonsCount: 4,
        duration: '2h 15m',
        lessons: [
          {
            id: 'les-1.1',
            title: '1.1 React 19 Introduction',
            duration: '25m',
            type: 'video',
            mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            description: 'Introduction to React 19 core mental models, Server Actions, and compiler optimizations.',
            isPreview: true,
            isDemoAccessible: true,
          },
          {
            id: 'les-1.2',
            title: '1.2 Actions and Async State',
            duration: '35m',
            type: 'video',
            mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            description: 'Deep dive into useActionState, useOptimistic, and async state transition boundaries in React 19.',
            isPreview: true,
            isDemoAccessible: true,
          },
          {
            id: 'les-1.3',
            title: '1.3 Server Components Overview',
            duration: '20m',
            type: 'document',
            mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            description: 'Understanding React Server Components (RSC) boundary rules and serialization constraints.',
            allowDownload: true,
            isPreview: true,
            isDemoAccessible: true,
          },
          {
            id: 'les-1.4',
            title: '1.4 React Compiler Architecture',
            duration: '28m',
            type: 'image',
            mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
            description: 'Visual breakdown of the React 19 automatic memoization pipeline and AST transformations.',
            isPreview: true,
            isDemoAccessible: true,
          },
        ],
      },
      {
        id: 'mod-2',
        title: 'Module 2 — Full Stack Architecture',
        lessonsCount: 4,
        duration: '3h 40m',
        lessons: [
          {
            id: 'les-2.1',
            title: '2.1 API Design Fundamentals',
            duration: '30m',
            type: 'text',
            content: 'RESTful API principles, GraphQL integration, and Type-Safe contract definition guidelines.',
            description: 'Comprehensive guide to building resilient microservice API contracts.',
            isDemoAccessible: false,
          },
          {
            id: 'les-2.2',
            title: '2.2 Authentication Architecture',
            duration: '45m',
            type: 'video',
            mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            description: 'JWT token rotation, OAuth2 flow integration, and secure cookie storage strategies.',
            isDemoAccessible: false,
          },
          {
            id: 'les-2.3',
            title: '2.3 Authentication Project',
            duration: '60m',
            type: 'assignment',
            description: 'Implement a full-stack authentication module with refresh tokens and RBAC middleware.',
            isDemoAccessible: false,
          },
          {
            id: 'les-2.4',
            title: '2.4 Module Assessment',
            duration: '30m',
            type: 'test',
            description: 'Test your understanding of full-stack architecture, API contracts, and security boundaries.',
            isDemoAccessible: false,
          },
        ],
      },
      {
        id: 'mod-3',
        title: 'Module 3 — Cloud Deployment',
        lessonsCount: 4,
        duration: '4h 10m',
        lessons: [
          {
            id: 'les-3.1',
            title: '3.1 Cloud Architecture Overview',
            duration: '40m',
            type: 'document',
            mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            description: 'High-level cloud topology, multi-region failover, and serverless compute nodes.',
            allowDownload: true,
            isDemoAccessible: false,
          },
          {
            id: 'les-3.2',
            title: '3.2 Container Deployment',
            duration: '50m',
            type: 'video',
            mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            description: 'Packaging React 19 apps into multi-stage Docker containers for AWS ECS.',
            isDemoAccessible: false,
          },
          {
            id: 'les-3.3',
            title: '3.3 Production Deployment',
            duration: '45m',
            type: 'url',
            mediaUrl: 'https://react.dev',
            description: 'Live interactive production deployment pipeline on Edge nodes.',
            isDemoAccessible: false,
          },
          {
            id: 'les-3.4',
            title: '3.4 Final Architecture Project',
            duration: '90m',
            type: 'assignment',
            description: 'Capstone project: Deploy a fully microservice-backed React 19 application to production.',
            isDemoAccessible: false,
          },
        ],
      },
    ],
    faq: [
      { question: 'Is this course updated for React 19 final release?', answer: 'Yes! All code samples use React 19 stable APIs.' },
      { question: 'Do I receive a certificate upon completion?', answer: 'Yes, an automated QR-verifiable certificate is issued.' },
    ],
    features: {
      assignments: true,
      quizzes: true,
      liveClasses: true,
      certificates: true,
      announcements: true,
      discussions: true,
    },
  },
  {
    id: 'crs-2',
    uuid: '8b67ac90-87b1-3a00-7a70-81c2ca01a400',
    courseUuid: '8b67ac90-87b1-3a00-7a70-81c2ca01a400',
    academyUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Enterprise DevOps & Kubernetes Deployment',
    subtitle: 'Automated CI/CD pipelines, Canary Releases, and Helm Charts',
    description: 'Learn enterprise Kubernetes orchestration from scratch. Deploy multi-region clusters with zero-downtime canary strategies.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    instructorName: 'Dr. Vikramaditya Rao',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    category: 'DevOps & Cloud',
    level: 'Advanced',
    language: 'English',
    price: 7999,
    currency: '₹',
    duration: '32 Hours',
    lessonCount: 20,
    studentCount: 980,
    rating: 4.8,
    reviewsCount: 210,
    isFeatured: true,
    demoEnabled: false,
    progressPercent: 45,
    completedLessonsCount: 9,
    totalLessonsCount: 20,
    currentModuleTitle: 'Module 2: Helm Charts & CI/CD Pipelines',
    currentLessonTitle: '2.1 Automated Canary Deployments',
    lastActiveAt: 'Yesterday',
    accessExpiryDate: '2026-10-15',
    promoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    promoVideoThumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    whatYouWillLearn: [
      'Provision multi-master Kubernetes clusters with Terraform & Ansible',
      'Configure Helm charts for complex microservice architectures',
    ],
    requirements: ['Linux command line proficiency', 'Basic Docker container knowledge'],
    modules: [],
    faq: [],
    features: {
      assignments: true,
      quizzes: true,
      liveClasses: true,
      certificates: true,
      announcements: true,
      discussions: true,
    },
  },
  {
    id: 'crs-3',
    uuid: '7a569b8f-76a0-29ff-696f-70b1b9009300',
    courseUuid: '7a569b8f-76a0-29ff-696f-70b1b9009300',
    academyUuid: '660f9511-f3ac-52e5-b827-557766551111',
    title: 'Node.js Microservices & Event-Driven Systems',
    subtitle: 'Build resilient message buses with RabbitMQ, Kafka, and Redis',
    description: 'Design distributed microservice backends that handle millions of events seamlessly.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
    instructorName: 'Priya Sharma',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    category: 'Backend Development',
    level: 'Advanced',
    language: 'English',
    price: 3999,
    currency: '₹',
    duration: '20 Hours',
    lessonCount: 19,
    studentCount: 850,
    rating: 4.9,
    reviewsCount: 185,
    isFeatured: true,
    demoEnabled: false,
    progressPercent: 42,
    completedLessonsCount: 8,
    totalLessonsCount: 19,
    currentModuleTitle: 'Module 2: RabbitMQ & Kafka Message Bus',
    currentLessonTitle: '2.3 Idempotent Event Handlers',
    lastActiveAt: 'Yesterday',
    accessExpiryDate: '2027-05-20',
    promoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    promoVideoThumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
    whatYouWillLearn: ['Implement Event-Driven Architecture using Apache Kafka'],
    requirements: ['Node.js & Express fundamentals'],
    modules: [],
    faq: [],
    features: {
      assignments: true,
      quizzes: true,
      liveClasses: true,
      certificates: true,
      announcements: true,
      discussions: true,
    },
  },
  {
    id: 'crs-4',
    uuid: '6f458a7e-659f-18ee-585e-6f90a8ff8200',
    courseUuid: '6f458a7e-659f-18ee-585e-6f90a8ff8200',
    academyUuid: '770a0622-a4bd-63f6-c938-668877662222',
    title: 'Applied Machine Learning & Neural Networks',
    subtitle: 'From mathematical gradient descent to fine-tuning LLMs',
    description: 'A comprehensive deep dive into PyTorch, computer vision, natural language processing, and LLM fine-tuning.',
    thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600',
    instructorName: 'Dr. Meera Iyer',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120',
    category: 'Artificial Intelligence',
    level: 'Intermediate',
    language: 'English',
    price: 5999,
    currency: '₹',
    duration: '28 Hours',
    lessonCount: 20,
    studentCount: 1650,
    rating: 5.0,
    reviewsCount: 410,
    isFeatured: true,
    demoEnabled: false,
    progressPercent: 85,
    completedLessonsCount: 17,
    totalLessonsCount: 20,
    currentModuleTitle: 'Module 4: Model Evaluation & Fine-Tuning',
    currentLessonTitle: '4.2 Hyperparameter Tuning with Ray Tune',
    lastActiveAt: '3 days ago',
    accessExpiryDate: '2028-01-01',
    whatYouWillLearn: ['Build Custom PyTorch Tensors and Neural Networks'],
    requirements: ['Python 3.10+ programming'],
    modules: [],
    faq: [],
    features: {
      assignments: true,
      quizzes: true,
      liveClasses: true,
      certificates: true,
      announcements: true,
      discussions: true,
    },
  },
];

interface CourseStoreState {
  courses: CourseEntity[];
  activeCourseUuid: string;
  activeCourse: CourseEntity | null;
  getCoursesByAcademy: (academyUuid: string) => CourseEntity[];
  getStudentCoursesByAcademy: (academyUuid: string) => CourseEntity[];
  getCourseByUuid: (courseUuid: string) => CourseEntity | undefined;
  setActiveCourseUuid: (uuid: string) => void;
  setActiveCourse: (course: CourseEntity | null) => void;
}

export const useCourseStore = create<CourseStoreState>()(
  persist(
    (set, get) => ({
      courses: MOCK_COURSES,
      activeCourseUuid: '9c78bda1-98c2-4b11-8b81-92d3db12b501',
      activeCourse: MOCK_COURSES[0],

      getCoursesByAcademy: (academyUuid) => {
        return get().courses.filter((c) => c.academyUuid === academyUuid);
      },

      getStudentCoursesByAcademy: (academyUuid) => {
        return get().courses.filter((c) => c.academyUuid === academyUuid);
      },

      getCourseByUuid: (courseUuid) => {
        return get().courses.find((c) => c.uuid === courseUuid || c.courseUuid === courseUuid);
      },

      setActiveCourseUuid: (uuid) => {
        const found = get().getCourseByUuid(uuid);
        set({ activeCourseUuid: uuid, activeCourse: found || null });
      },

      setActiveCourse: (course) => {
        set({ activeCourse: course, activeCourseUuid: course ? course.uuid : '' });
      },
    }),
    {
      name: 'cubixskill_student_course_store_v3',
    }
  )
);

