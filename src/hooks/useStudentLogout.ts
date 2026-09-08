import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/auth.store';
import { useAcademyStore } from '../stores/academy.store';
import { getLastAcademy } from '../lib/navigationIntent';
import { isValidUuid } from '../utils/routeBuilder';

export function useStudentLogout() {
  const params = useParams<{ academyUuid?: string; academyId?: string }>();
  const navigate = useNavigate();

  const handleLogout = async (overrideAcademyUuid?: string) => {
    // Priority order:
    // 1. Explicit override argument passed to handleLogout
    // 2. Route param (academyUuid or academyId)
    // 3. Active academy in useAcademyStore
    // 4. Auth store student academy UUID
    // 5. Last active academy saved in localStorage
    const storeActiveUuid = useAcademyStore.getState().activeAcademyUuid;
    const authAcademyUuid = useAuthStore.getState().user?.academy?.uuid;
    const lastAcademyUuid = getLastAcademy();

    const candidateAcademyUuid =
      overrideAcademyUuid ||
      params.academyUuid ||
      params.academyId ||
      storeActiveUuid ||
      authAcademyUuid ||
      lastAcademyUuid ||
      null;

    const resolvedAcademyUuid =
      candidateAcademyUuid && isValidUuid(candidateAcademyUuid)
        ? candidateAcademyUuid
        : null;

    try {
      await useAuthStore.getState().logout();
    } catch (error) {
      console.error('Logout request encountered an error, proceeding with local cleanup:', error);
    } finally {
      if (resolvedAcademyUuid) {
        navigate(`/${resolvedAcademyUuid}/`, { replace: true });
      } else {
        navigate('/student/academies', { replace: true });
      }
    }
  };

  return { handleLogout };
}
