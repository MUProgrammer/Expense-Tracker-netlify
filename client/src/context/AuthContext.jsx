import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // page reload par token se user wapas load karo
  useEffect(() => {
    if (!getToken()) return;
    api.get('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  // token expire ho jaye to auto logout
  useEffect(() => {
    window.addEventListener('kharcha:unauthorized', logout);
    return () => window.removeEventListener('kharcha:unauthorized', logout);
  }, [logout]);

  const login = async (email, password) => {
    const d = await api.post('/auth/login', { email, password });
    setToken(d.token);
    setUser(d.user);
  };

  const register = async (name, email, password) => {
    const d = await api.post('/auth/register', { name, email, password });
    setToken(d.token);
    setUser(d.user);
  };

  const setTheme = async (theme) => {
    setUser((u) => ({ ...u, theme }));
    try {
      await api.patch('/auth/theme', { theme });
    } catch {
      /* theme save fail ho jaye to bhi UI chalta rahe */
    }
  };

  const updateProfile = async (name, email) => {
    const d = await api.patch('/auth/profile', { name, email });
    setUser(d.user);
  };

  const changePassword = (currentPassword, newPassword) =>
    api.patch('/auth/password', { currentPassword, newPassword });

  const deleteAccount = async (password) => {
    await api.del('/auth/me', { password });
    logout();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setTheme, updateProfile, changePassword, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}
