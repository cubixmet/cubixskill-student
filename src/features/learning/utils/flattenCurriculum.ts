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
export function flattenCurriculum(course?: CourseEntity | null): FlattenedLesson[] {
  if (!course || !Array.isArray(course.modules)) {
    return [];
  }

  return course.modules.flatMap((module) => {
    if (!module || !Array.isArray(module.lessons)) {
      return [];
    }

    return module.lessons
      .filter((lesson): lesson is CourseLesson => Boolean(lesson && lesson.id))
      .map((lesson) => ({
        module,
        lesson,
      }));
  });
}
