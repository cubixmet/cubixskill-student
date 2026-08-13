import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PasswordSetupToken {
  token: string;
  studentUuid: string;
  email: string;
  fullName: string;
  phone?: string;
  academyUuid: string;
  courseUuid?: string;
  intent?: 'demo' | 'full';
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

interface PasswordTokenStoreState {
  tokens: PasswordSetupToken[];
  createToken: (params: {
    studentUuid?: string;
    email: string;
    fullName: string;
    phone?: string;
    academyUuid: string;
    courseUuid?: string;
    intent?: 'demo' | 'full';
  }) => PasswordSetupToken;
  getToken: (token: string) => PasswordSetupToken | undefined;
  markTokenUsed: (token: string) => void;
  isValidToken: (token: string) => boolean;
}

export const usePasswordTokenStore = create<PasswordTokenStoreState>()(
  persist(
    (set, get) => ({
      tokens: [],

      createToken: ({ studentUuid, email, fullName, phone, academyUuid, courseUuid, intent }) => {
        const rawToken = `pst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours validity

        const newToken: PasswordSetupToken = {
          token: rawToken,
          studentUuid: studentUuid || `std-${Date.now()}`,
          email,
          fullName,
          phone,
          academyUuid,
          courseUuid,
          intent,
          expiresAt,
          isUsed: false,
          createdAt: now.toISOString(),
        };

        set((state) => ({
          tokens: [...state.tokens, newToken],
        }));

        return newToken;
      },

      getToken: (token) => {
        return get().tokens.find((t) => t.token === token);
      },

      markTokenUsed: (token) => {
        set((state) => ({
          tokens: state.tokens.map((t) => (t.token === token ? { ...t, isUsed: true } : t)),
        }));
      },

      isValidToken: (token) => {
        const found = get().getToken(token);
        if (!found) return false;
        if (found.isUsed) return false;
        if (new Date().getTime() > new Date(found.expiresAt).getTime()) return false;
        return true;
      },
    }),
    {
      name: 'cubixskill_password_setup_tokens_v1',
    }
  )
);
