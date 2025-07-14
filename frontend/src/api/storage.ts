export const add = (key: string, value: string): boolean => {
  localStorage.setItem(key, value);
  return true;
};

export const get = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
