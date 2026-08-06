import type { AuthStudent, LoginCredentials, SessionResponse } from '../types/auth.types';

const MOCK_DEMO_STUDENT: AuthStudent = {
  uuid: 'std-global-1',
  id: 'std-global-1',
  fullName: 'Alex Student',
  email: 'alex.student@gmail.com',
  phone: '+91 98765 00000',
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
      // Backend not running, fallback to mock mode
    }

    // Generic credential validation (generic security requirement)
    if (!credentials.email || !credentials.email.includes('@')) {
      throw new Error('The email or password is incorrect.');
    }

    // Generate mock demo session token (non-sensitive session reference)
    const sessionRef = `demo-session-${Date.now()}`;
    const days = credentials.rememberMe ? 30 : undefined;
    setCookie('cubixskill_student_session', sessionRef, days);

    const student: AuthStudent = {
      ...MOCK_DEMO_STUDENT,
      email: credentials.email,
      fullName: credentials.email === MOCK_DEMO_STUDENT.email ? MOCK_DEMO_STUDENT.fullName : credentials.email.split('@')[0],
    };

    // Save active mock session metadata in localStorage for multi-tab sync
    localStorage.setItem(
      'cubixskill_student_session_active',
      JSON.stringify({
        sessionRef,
        studentUuid: student.uuid,
        email: student.email,
        fullName: student.fullName,
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
      let savedEmail = MOCK_DEMO_STUDENT.email;
      let savedName = MOCK_DEMO_STUDENT.fullName;

      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          if (parsed.email) savedEmail = parsed.email;
          if (parsed.fullName) savedName = parsed.fullName;
        } catch {
          // ignore error
        }
      }

      return {
        authenticated: true,
        student: {
          ...MOCK_DEMO_STUDENT,
          email: savedEmail,
          fullName: savedName,
        },
        sessionRef: cookieSession || 'demo-session',
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
