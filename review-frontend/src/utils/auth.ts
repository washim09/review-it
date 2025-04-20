// src/utils/auth.ts
export const saveToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const logoutUser = () => {
  localStorage.removeItem('authToken');
};