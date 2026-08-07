import { create } from 'zustand';
import type { AuthStudent, LoginCredentials } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthState {
  student: AuthStudent | null;
  // Backward-compatibility accessor for existing components
  user: AuthStudent | null;
  isAuthenticated: boolean;
  isDemoSession: boolean;
  isLoading: boolean;
  authError: string | null;
  intendedRoute: string | null;

  login: (credentials: LoginCredentials) => Promise<boolean>;
  startDemoExperience: () => void;
  exitDemoSession: () => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setStudent: (student: AuthStudent | null) => void;
  setIntendedRoute: (route: string | null) => void;
  clearAuthError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  student: null,
  user: null,
  isAuthenticated: false,
  isDemoSession: false,
  isLoading: true, // starts loading until restoreSession finishes
  authError: null,
  intendedRoute: null,

  setStudent: (student) => set({ student, user: student, isDemoSession: !!student?.isDemoSession }),

  setIntendedRoute: (route) => set({ intendedRoute: route }),

  clearAuthError: () => set({ authError: null }),

  login: async (credentials) => {
    set({ isLoading: true, authError: null });
    try {
      const { student } = await authService.loginStudent(credentials);
      set({
        student,
        user: student,
        isAuthenticated: true,
        isDemoSession: false,
        isLoading: false,
        authError: null,
      });
      return true;
    } catch (err: any) {
      set({
        authError: err.message || 'The email or password is incorrect.',
        isLoading: false,
        isAuthenticated: false,
        isDemoSession: false,
        student: null,
        user: null,
      });
      return false;
    }
  },

  startDemoExperience: () => {
    set({ isLoading: true, authError: null });
    const { student } = authService.createSandboxDemoSession();
    set({
      student,
      user: student,
      isAuthenticated: true,
      isDemoSession: true,
      isLoading: false,
      authError: null,
    });
  },

  exitDemoSession: async () => {
    set({ isLoading: true });
    await authService.logoutStudent();
    set({
      student: null,
      user: null,
      isAuthenticated: false,
      isDemoSession: false,
      isLoading: false,
      authError: null,
      intendedRoute: null,
    });
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logoutStudent();
    set({
      student: null,
      user: null,
      isAuthenticated: false,
      isDemoSession: false,
      isLoading: false,
      authError: null,
      intendedRoute: null,
    });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const session = await authService.getCurrentSession();
      if (session.authenticated && session.student) {
        set({
          student: session.student,
          user: session.student,
          isAuthenticated: true,
          isDemoSession: !!session.student.isDemoSession,
          isLoading: false,
        });
      } else {
        set({
          student: null,
          user: null,
          isAuthenticated: false,
          isDemoSession: false,
          isLoading: false,
        });
      }
    } catch {
      set({
        student: null,
        user: null,
        isAuthenticated: false,
        isDemoSession: false,
        isLoading: false,
      });
    }
  },
}));
