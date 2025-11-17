// src/lib/api/storage.ts
export const storage = {
  getTokens: (): { accessToken: string; refreshToken: string } | null => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem('auth_tokens');
    return item ? JSON.parse(item) : null;
  },

  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  },

  removeTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
  },

  getUser: () => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem('auth_user');
    return item ? JSON.parse(item) : null;
  },

  setUser: (user: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_user', JSON.stringify(user));
  },
};