import { apiClient, clearTokens } from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import type { AuthStudent, LoginCredentials, SessionResponse } from '../types/auth.types';

export function mapUserToAuthStudent(user: any): AuthStudent {
  const profileId = String(user?.student_profile?.id || user?.id || '');
  const realUserId = String(user?.id || '');
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Student';
  const email = user?.email || '';
  const phone = user?.phone || user?.student_profile?.phone || '';
  const photoUrl = user?.student_profile?.profile_photo?.url || undefined;

  return {
    id: profileId,
    uuid: profileId,
    user_id: realUserId,
    userId: realUserId,
    fullName,
    email,
    phone,
    avatar: photoUrl,
    avatarUrl: photoUrl,
    role_code: user?.role_code || 'STUDENT',
    academy: user?.academy || null,
  };
}

export interface RegisterStudentPayload {
  academy_uuid: string;
  full_name: string;
  email: string;
  phone?: string;
  agree_to_terms?: boolean;
}

export interface RegisterStudentResponse {
  success: boolean;
  status: 'EMAIL_VERIFICATION_PENDING' | 'PASSWORD_SETUP_PENDING' | 'ALREADY_ACTIVE';
  email_masked: string;
  academy_uuid: string;
  message: string;
}

export const authService = {
  registerStudent: async (payload: RegisterStudentPayload): Promise<RegisterStudentResponse> => {
    const res = await apiClient.post<any>(API_ENDPOINTS.auth.registerStudent, {
      academy_uuid: payload.academy_uuid,
      full_name: payload.full_name.trim(),
      email: payload.email.trim(),
      phone: payload.phone?.trim() || '',
      agree_to_terms: payload.agree_to_terms ?? true,
    });
    const data = res?.data || res;
    return {
      success: true,
      status: data.status || 'EMAIL_VERIFICATION_PENDING',
      email_masked: data.email_masked || payload.email,
      academy_uuid: data.academy_uuid || payload.academy_uuid,
      message: res?.message || 'Registration successful. Please verify your email.',
    };
  },

  resendVerificationEmail: async (data: { email: string; academy_uuid?: string }): Promise<string> => {
    const res = await apiClient.post<any>(API_ENDPOINTS.auth.resendVerificationEmail, {
      email: data.email.trim(),
      academy_uuid: data.academy_uuid,
    });
    return res?.message || 'If an eligible account exists, a verification email has been sent.';
  },

  verifyEmail: async (token: string): Promise<{ success: boolean; password_setup_token: string; email_masked?: string; academy_uuid?: string }> => {
    const res = await apiClient.post<any>(API_ENDPOINTS.auth.verifyEmail, { token });
    const data = res?.data || res;
    return {
      success: true,
      password_setup_token: data.password_setup_token || '',
      email_masked: data.email_masked,
      academy_uuid: data.academy_uuid,
    };
  },

  loginStudent: async (credentials: LoginCredentials & { academy_uuid?: string }): Promise<{ student: AuthStudent; sessionRef: string }> => {
    const res = await apiClient.post<any>(API_ENDPOINTS.auth.login, {
      email: credentials.email.trim(),
      password: credentials.password,
      portal: 'student',
      academy_uuid: credentials.academy_uuid,
    });

    const data = res?.data || res;
    const user = data.user || data;
    if (!user || !user.email) {
      throw new Error('Authentication failed. Invalid user response received.');
    }

    // Clear legacy tokens if any were left in browser storage
    clearTokens();

    const student = mapUserToAuthStudent(user);
    const sessionRef = `session-${Date.now()}`;

    return { student, sessionRef };
  },

  resendSetupEmail: async (data: { email: string; academy_uuid?: string }): Promise<string> => {
    const res = await apiClient.post<any>(API_ENDPOINTS.auth.resendSetupEmail, {
      email: data.email.trim(),
      academy_uuid: data.academy_uuid,
    });
    return res?.message || 'If an eligible account exists, a password setup email has been sent.';
  },

  validateToken: async (token: string): Promise<{ valid: boolean; email?: string; email_masked?: string; user_name?: string; academy_uuid?: string }> => {
    const res = await apiClient.post<any>(API_ENDPOINTS.auth.validateToken, { token });
    const data = res?.data || res;
    return {
      valid: Boolean(data?.valid ?? true),
      email: data?.email,
      email_masked: data?.email_masked,
      user_name: data?.user_name,
      academy_uuid: data?.academy_uuid,
    };
  },

  setupPassword: async (token: string, newPassword: string, confirmPassword?: string): Promise<{ student: AuthStudent }> => {
    const res = await apiClient.post<any>(API_ENDPOINTS.auth.setupPassword, {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword || newPassword,
    });
    const data = res?.data || res;
    clearTokens();
    const user = data.user || data;
    const student = mapUserToAuthStudent(user);
    return { student };
  },

  requestPasswordReset: async (email: string, academy_uuid?: string): Promise<string> => {
    const res = await apiClient.post<any>(API_ENDPOINTS.auth.forgotPassword, {
      email: email.trim(),
      academy_uuid,
    });
    return res?.message || "If an account exists for this email, we've sent a password reset link.";
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword?: string): Promise<boolean> => {
    await apiClient.post<any>(API_ENDPOINTS.auth.resetPassword, {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword || newPassword,
    });
    clearTokens();
    return true;
  },

  createSandboxDemoSession: (): { student: AuthStudent; sessionRef: string } => {
    const sessionRef = `sandbox-${Date.now()}`;
    const student: AuthStudent = {
      id: 'demo-student',
      uuid: 'demo-student',
      fullName: 'Demo Sandbox Student',
      email: 'demo@cubixskill.com',
      isDemoSession: true,
    };
    return { student, sessionRef };
  },

  logoutStudent: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (_) {
      // Ignore logout errors
    } finally {
      clearTokens();
    }
  },

  getCurrentSession: async (): Promise<SessionResponse> => {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.auth.me);
      const data = res?.data || res;
      const user = data?.user || data;
      if (user && user.email) {
        const student = mapUserToAuthStudent(user);
        return { authenticated: true, student, sessionRef: 'jwt-session' };
      }
    } catch (err) {
      clearTokens();
    }

    return { authenticated: false, student: null };
  },

  refreshSession: async (): Promise<boolean> => {
    try {
      await apiClient.post(API_ENDPOINTS.auth.refreshToken);
      return true;
    } catch {
      return false;
    }
  },
};
