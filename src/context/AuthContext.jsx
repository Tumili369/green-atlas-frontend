import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('ga_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (data) => {
    setUser(data);
    localStorage.setItem('ga_user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ga_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);