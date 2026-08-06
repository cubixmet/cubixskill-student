export interface AuthStudent {
  uuid: string;
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SessionResponse {
  authenticated: boolean;
  student: AuthStudent | null;
  sessionRef?: string;
}
