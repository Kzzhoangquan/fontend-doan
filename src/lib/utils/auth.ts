const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  // Lưu vào localStorage
  localStorage.setItem(TOKEN_KEY, token);
  
  // Lưu vào cookie với max-age 7 ngày (604800 seconds)
  // SameSite=Lax cho phép cookie được gửi khi navigate
  document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  // Set expires trong quá khứ để xóa cookie
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
};