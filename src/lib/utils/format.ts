export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

export const formatUserName = (username: string | null | undefined): string => {
  if (!username) return '';
  // Capitalize first letter and return
  return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
};