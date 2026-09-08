export interface AuthStudent {
  uuid: string;
  id?: string;
  account_number?: string;
  accountNumber?: string;
  user_id?: string;
  userId?: string;
  fullName: string;
  name?: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
  role_code?: string;
  academy?: any;
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
