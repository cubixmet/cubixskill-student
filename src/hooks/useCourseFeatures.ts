import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { studentPortalService } from '../services/studentPortal.service';
import { COURSE_FEATURE_KEYS } from '../constants/courseFeatures.constants';

const featuresCache = new Map<string, Record<string, boolean>>();

export function useCourseFeatures(explicitCourseUuid?: string | null) {
  const { academyUuid: routeAcademyUuid, courseUuid: routeCourseUuid } = useParams<{ academyUuid?: string; courseUuid?: string }>();
  
  const courseUuid = explicitCourseUuid || routeCourseUuid || null;
  const validCourseId = courseUuid && courseUuid.trim() ? courseUuid.trim() : null;

  const [features, setFeatures] = useState<Record<string, boolean>>(() => {
    return validCourseId ? featuresCache.get(validCourseId) || {} : {};
  });
  const [isLoading, setIsLoading] = useState<boolean>(!validCourseId || !featuresCache.has(validCourseId!));

  const fetchFeatures = useCallback(async () => {
    if (!validCourseId || !routeAcademyUuid) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const overview = await studentPortalService.getCourseOverview(routeAcademyUuid, validCourseId);
      const rawData: any = (overview as any)?.data || overview;
      const courseFeatures = rawData?.course?.features || {};
      featuresCache.set(validCourseId, courseFeatures);
      setFeatures(courseFeatures);
    } catch {
      // Keep previous cache if available
    } finally {
      setIsLoading(false);
    }
  }, [validCourseId, routeAcademyUuid]);

  useEffect(() => {
    if (validCourseId) {
      if (featuresCache.has(validCourseId)) {
        setFeatures(featuresCache.get(validCourseId)!);
        setIsLoading(false);
      } else {
        fetchFeatures();
      }
    }
  }, [validCourseId, fetchFeatures]);

  const isFeatureEnabled = useCallback(
    (featureKey: string): boolean => {
      if (!validCourseId) return false;
      if (isLoading && !featuresCache.has(validCourseId)) return false;

      const inputKey = featureKey.trim().toUpperCase();

      // Normalize key aliases
      let canonicalCode = inputKey;
      if (['LESSONS', 'CURRICULUM', 'LEARN'].includes(inputKey)) canonicalCode = COURSE_FEATURE_KEYS.LESSONS;
      else if (['FEE_COLLECTION', 'FEES', 'PAYMENTS'].includes(inputKey)) canonicalCode = COURSE_FEATURE_KEYS.FEE_COLLECTION;
      else if (['COURSE_ANNOUNCEMENT', 'ANNOUNCEMENTS', 'NOTIFICATION', 'NOTIFICATIONS'].includes(inputKey)) canonicalCode = COURSE_FEATURE_KEYS.COURSE_ANNOUNCEMENT;
      else if (['LIVE_CLASS', 'LIVE_SESSIONS', 'LIVECLASSES', 'LIVE_CLASSES', 'LIVE_CLASSROOM'].includes(inputKey)) canonicalCode = COURSE_FEATURE_KEYS.LIVE_CLASS;
      else if (['EMAIL_DELIVERY', 'EMAIL', 'EMAILS'].includes(inputKey)) canonicalCode = COURSE_FEATURE_KEYS.EMAIL_DELIVERY;
      else if (['COMPLETION_CERTIFICATE', 'CERTIFICATES', 'CERTIFICATE'].includes(inputKey)) canonicalCode = COURSE_FEATURE_KEYS.COMPLETION_CERTIFICATE;
      else if (['COURSE_DISCUSSION', 'DISCUSSIONS', 'FORUM', 'DISCUSSION'].includes(inputKey)) canonicalCode = COURSE_FEATURE_KEYS.COURSE_DISCUSSION;
      else if (['ONE_TO_ONE_SESSION', 'ONE_TO_ONE', 'PERSONAL_CHAT', 'PRIVATE_SESSION'].includes(inputKey)) canonicalCode = COURSE_FEATURE_KEYS.ONE_TO_ONE_SESSION;
      else if (['LESSON_LOCKING', 'LESSON_LOCK', 'SEQUENTIAL_LOCKING'].includes(inputKey)) canonicalCode = COURSE_FEATURE_KEYS.LESSON_LOCKING;

      for (const [k, v] of Object.entries(features)) {
        if (k.trim().toUpperCase() === canonicalCode) {
          return Boolean(v);
        }
      }
      return false;
    },
    [validCourseId, isLoading, features]
  );

  return {
    features,
    isLoading,
    isFeatureEnabled,
    refetch: fetchFeatures,
  };
}
