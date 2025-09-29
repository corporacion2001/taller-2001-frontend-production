import { useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthAPI } from "../../services/auth.api";

const publicRoutes = ["/", "/login"];

export const useAuthLoader = ({ setUser, setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isCheckingAuth = useRef(false);

  const loadUser = useCallback(async () => {
    try {
      const { data } = await AuthAPI.getProfile();
      if (data?.success) {
        setUser(data.data);
        setIsAuthenticated(true);
        return true;
      }
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, [setUser, setIsAuthenticated]);

  useEffect(() => {
    const currentPath = location.pathname;
    if (publicRoutes.includes(currentPath)) return;

    const checkAuth = async () => {
      if (isCheckingAuth.current) return;
      isCheckingAuth.current = true;

      await loadUser();
      isCheckingAuth.current = false;
    };

    checkAuth();
  }, [location, loadUser]);

  // Redirigir si ya está autenticado y entra a /login
  useEffect(() => {
    if (location.pathname === "/login") {
      loadUser().then((authenticated) => {
        if (authenticated) {
          navigate("/dashboard", { replace: true });
        }
      });
    }
  }, [location, loadUser, navigate]);

  return { loadUser };
};
