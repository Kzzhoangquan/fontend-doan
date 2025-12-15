// src/lib/utils/jwt.ts

/**
 * Decode JWT token without verification (to check expiration)
 */
export const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string | null | undefined): boolean => {
  if (!token) return true;
  
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    
    // Add 5 second buffer to account for clock skew
    return currentTime >= expirationTime - 5000;
  } catch (error) {
    return true;
  }
};

/**
 * Check if JWT token is valid (not expired)
 */
export const isTokenValid = (token: string | null | undefined): boolean => {
  return !isTokenExpired(token);
};

