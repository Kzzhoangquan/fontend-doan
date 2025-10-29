import { useAppSelector } from '@/store/hooks';

export const useAuth = () => {
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  
  return {
    isAuthenticated,
    user,
    token,
    isLoading: false, // Có thể thêm loading state
  };
};