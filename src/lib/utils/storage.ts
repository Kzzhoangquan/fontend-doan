// src/lib/utils/storage.ts
export const loadState = (key: string) => {
  if (typeof window === 'undefined') return undefined;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : undefined;
  } catch {
    return undefined;
  }
};

export const saveState = (key: string, state: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {}
};

export const removeState = (key: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {}
};