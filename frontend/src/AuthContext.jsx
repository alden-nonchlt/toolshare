import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('toolshare_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  function signIn(token, nextUser) {
    localStorage.setItem('toolshare_token', token);
    localStorage.setItem('toolshare_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }
  function signOut() {
    localStorage.removeItem('toolshare_token');
    localStorage.removeItem('toolshare_user');
    setUser(null);
  }
  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user && localStorage.getItem('toolshare_token')), signIn, signOut }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
