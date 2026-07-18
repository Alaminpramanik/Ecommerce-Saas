import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setTokens, clearTokens, getAccess } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccess()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const tokens = await api.login(username, password);
    setTokens(tokens);
    const me = await api.me();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(
    async (payload) => {
      await api.register(payload);
      return login(payload.username, payload.password);
    },
    [login]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await api.updateMe(payload);
    setUser(updated);
    return updated;
  }, []);

  const isStaff = !!user && (user.is_superuser || user.is_merchant);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isStaff,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
