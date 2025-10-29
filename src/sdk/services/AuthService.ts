// sdk/services/AuthService.ts (auto-generated or manual)
import api from '@/lib/api/client';

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const loginWithFace = (imageBase64: string) =>
  api.post('/auth/face-login', { image: imageBase64 });