export interface LastActiveCourseData {
  academyUuid: string;
  courseUuid: string;
  lastAccessedAt: string;
}

const STORAGE_KEY = 'cubixskill:last-active-course';

export function saveLastActiveCourse(academyUuid: string, courseUuid: string): void {
  if (typeof window === 'undefined') return;
  try {
    const data: LastActiveCourseData = {
      academyUuid,
      courseUuid,
      lastAccessedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save last active course preference:', err);
  }
}

export function getLastActiveCourse(): LastActiveCourseData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.academyUuid && parsed.courseUuid) {
      return parsed as LastActiveCourseData;
    }
  } catch (err) {
    console.error('Failed to read last active course preference:', err);
  }
  return null;
}

export function clearLastActiveCoursePreference(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear last active course preference:', err);
  }
}
