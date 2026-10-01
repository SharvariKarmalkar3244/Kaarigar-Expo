import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import { getCurrentUser } from "../api/authApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });

  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    getCurrentUser()
      .then((data) => {
        setUser(data);
        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  const login = useCallback((data) => {

    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    setUser(data);
  }, []);

  const logout = useCallback(() => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// The context hook is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
