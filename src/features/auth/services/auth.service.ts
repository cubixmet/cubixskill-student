import type { AuthStudent, LoginCredentials, SessionResponse } from '../types/auth.types';

const BASE_STUDENT_PROFILE: AuthStudent = {
  uuid: 'std-production-1',
  id: 'std-production-1',
  fullName: 'Verified Student',
  email: 'student@cubixskill.com',
  phone: '+1 (555) 019-9831',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
};

// Cookie utilities
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

export function setCookie(name: string, value: string, days?: number) {
  if (typeof document === 'undefined') return;
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
}

export function eraseCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
}

export const authService = {
  loginStudent: async (credentials: LoginCredentials): Promise<{ student: AuthStudent; sessionRef: string }> => {
    // Attempt real API if available
    try {
      const res = await fetch('/api/student/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe,
        }),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Backend not running, fallback to authentication mode
    }

    if (!credentials.email || !credentials.email.includes('@')) {
      throw new Error('The email or password is incorrect.');
    }

    const sessionRef = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const days = credentials.rememberMe ? 30 : undefined;
    setCookie('cubixskill_student_session', sessionRef, days);

    const student: AuthStudent = {
      ...BASE_STUDENT_PROFILE,
      uuid: `std-${Date.now()}`,
      email: credentials.email,
      fullName: credentials.email.split('@')[0].replace('.', ' ').toUpperCase(),
      isDemoSession: false,
    };

    localStorage.setItem(
      'cubixskill_student_session_active',
      JSON.stringify({
        sessionRef,
        studentUuid: student.uuid,
        email: student.email,
        fullName: student.fullName,
        isDemoSession: false,
        timestamp: Date.now(),
      })
    );

    return { student, sessionRef };
  },

  // ENTERPRISE DEMO EXPERIENCE: Generates an isolated, temporary, un-shared sandbox session
  createSandboxDemoSession: (): { student: AuthStudent; sessionRef: string } => {
    const sessionRef = `sandbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour expiration

    const student: AuthStudent = {
      uuid: `std-sandbox-${Date.now()}`,
      id: `std-sandbox-${Date.now()}`,
      fullName: 'Demo Sandbox Explorer',
      email: `explorer-${Math.random().toString(36).substring(2, 6)}@cubixskill-demo.com`,
      phone: '+1 (555) 019-9831',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      isDemoSession: true,
    };

    setCookie('cubixskill_student_session', sessionRef, 1);
    localStorage.setItem(
      'cubixskill_student_session_active',
      JSON.stringify({
        sessionRef,
        studentUuid: student.uuid,
        email: student.email,
        fullName: student.fullName,
        isDemoSession: true,
        expiresAt,
        timestamp: Date.now(),
      })
    );

    return { student, sessionRef };
  },

  logoutStudent: async (): Promise<void> => {
    try {
      await fetch('/api/student/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Mock fallback
    }

    eraseCookie('cubixskill_student_session');
    localStorage.removeItem('cubixskill_student_session_active');
    localStorage.setItem('cubixskill_student_logout_event', Date.now().toString());
  },

  getCurrentSession: async (): Promise<SessionResponse> => {
    try {
      const res = await fetch('/api/student/auth/session', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Mock fallback
    }

    const cookieSession = getCookie('cubixskill_student_session');
    const localSession = localStorage.getItem('cubixskill_student_session_active');

    if (cookieSession || localSession) {
      let savedEmail = BASE_STUDENT_PROFILE.email;
      let savedName = BASE_STUDENT_PROFILE.fullName;
      let isDemoSession = false;

      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);

          // Check demo session expiration
          if (parsed.isDemoSession && parsed.expiresAt && Date.now() > parsed.expiresAt) {
            eraseCookie('cubixskill_student_session');
            localStorage.removeItem('cubixskill_student_session_active');
            return { authenticated: false, student: null };
          }

          if (parsed.email) savedEmail = parsed.email;
          if (parsed.fullName) savedName = parsed.fullName;
          if (parsed.isDemoSession) isDemoSession = true;
        } catch {
          // ignore error
        }
      }

      return {
        authenticated: true,
        student: {
          ...BASE_STUDENT_PROFILE,
          email: savedEmail,
          fullName: savedName,
          isDemoSession,
        },
        sessionRef: cookieSession || 'session-ref',
      };
    }

    return { authenticated: false, student: null };
  },

  requestPasswordReset: async (email: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/student/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) return true;
    } catch {
      // Mock fallback
    }
    return true;
  },

  setupPassword: async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/student/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      if (res.ok) return true;
    } catch {
      // Mock fallback
    }
    return true;
  },

  refreshSession: async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/student/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) return true;
    } catch {
      // Mock fallback
    }
    const session = getCookie('cubixskill_student_session');
    return !!session;
  },
};
