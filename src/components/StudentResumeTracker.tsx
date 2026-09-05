import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { saveStudentResumePath } from '../utils/studentResume';

export const StudentResumeTracker: React.FC = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user.id || user.uuid;
      if (userId && location.pathname) {
        saveStudentResumePath(userId, location.pathname);
      }
    }
  }, [isAuthenticated, user, location.pathname]);

  return null;
};
