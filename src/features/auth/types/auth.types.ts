export interface AuthStudent {
  uuid: string;
  id?: string;
  fullName: string;
  name?: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
  isDemoSession?: boolean;
  demoCourseUuid?: string;
  demoCourseTitle?: string;
  demoStartDate?: string;
  demoExpiryDate?: string;
  demoDaysRemaining?: number;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
  academyUuid?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  student: AuthStudent | null;
  sessionRef?: string;
}
