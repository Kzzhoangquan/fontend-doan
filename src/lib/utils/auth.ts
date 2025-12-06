const TOKEN_KEY = 'auth_token';
const TOKENS_KEY = 'auth_tokens'; // Used by login flow

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try auth_tokens first (used by login flow)
  const tokensJson = localStorage.getItem(TOKENS_KEY);
  if (tokensJson) {
    try {
      const tokens = JSON.parse(tokensJson);
      if (tokens.accessToken) return tokens.accessToken;
    } catch (e) {
      // Invalid JSON, ignore
    }
  }
  
  // Fallback to auth_token (simple string)
  const localToken = localStorage.getItem(TOKEN_KEY);
  if (localToken) return localToken;
  
  // Fallback to cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TOKEN_KEY && value) {
      return value;
    }
  }
  
  return null;
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