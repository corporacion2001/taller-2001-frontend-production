import { createContext, useContext, useState, useEffect } from "react";
import { useAuthActions } from "./auth/AuthActions";
import { useAuthLoader } from "./auth/AuthLoader";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { loadUser } = useAuthLoader({
    setUser,
    setIsAuthenticated,
  });

  const {
    actionLoading,
    login,
    register,
    logout,
    updateProfile,
  } = useAuthActions({ setUser, setIsAuthenticated });

  useEffect(() => {
    loadUser().finally(() => setInitialLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        initialLoading,
        actionLoading,
        login,
        register,
        logout,
        updateProfile,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
