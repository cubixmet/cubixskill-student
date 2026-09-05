import type { CourseEntity, CourseModule, CourseLesson } from '../../../stores/course.store';

export interface FlattenedLesson {
  module: CourseModule;
  lesson: CourseLesson;
}

/**
 * Safely flattens curriculum modules and lessons into an array of { module, lesson } items.
 * Guards against null/undefined course, empty/invalid modules, and missing/invalid lesson arrays.
 * Preserves existing module and lesson array order.
 */
export function flattenCurriculum(course?: any): FlattenedLesson[] {
  const modules = Array.isArray(course?.modules) ? course.modules : [];

  return modules.flatMap((module: any, moduleIndex: number) => {
    const lessons = Array.isArray(module?.lessons) ? module.lessons : [];

    return lessons
      .filter(Boolean)
      .map((lesson: any, lessonIndex: number) => ({
        module: {
          ...module,
          id: String(module?.id || module?.uuid || `module-${moduleIndex}`),
          title: typeof module?.title === 'string' && module.title.trim() ? module.title : `Module ${moduleIndex + 1}`,
        },
        lesson: {
          ...lesson,
          id: String(lesson?.id || lesson?.uuid || `lesson-${moduleIndex}-${lessonIndex}`),
          title: typeof lesson?.title === 'string' && lesson.title.trim() ? lesson.title : `Lesson ${lessonIndex + 1}`,
        },
      }));
  });
}
