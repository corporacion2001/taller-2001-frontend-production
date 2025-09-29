import { useState } from "react";
import { AuthAPI } from "../../services/auth.api";

export const useAuthActions = ({ setUser, setIsAuthenticated }) => {
  const [actionLoading, setActionLoading] = useState(false);

  const executeWithLoading = async (action) => {
    setActionLoading(true);
    try {
      return await action();
    } catch (error) {
      // Mensajes controlados por tipo de error
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      // Mapeo de errores seguros para mostrar al usuario
      const safeMessages = {
        401: "Credenciales inválidas.",
        403: message || "Tu cuenta no tiene acceso.",
        404: "Recurso no encontrado.",
        422: "Datos inválidos. Revisa el formulario.",
        500: "Error del servidor. Intenta más tarde.",
      };

      const finalMessage =
        safeMessages[status] || "Error inesperado. Intenta nuevamente.";

      throw new Error(finalMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const login = async (credentials) => {
    return executeWithLoading(async () => {
      const { data } = await AuthAPI.login(credentials);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    });
  };

 const register = async (userData) => {
    return executeWithLoading(async () => {
      try {
        const { data } = await AuthAPI.register(userData);
        return data; 
      } catch (error) {
        if (error.response?.data) {
          return error.response.data;
        }
        throw error;
      }
    });
  };


  const logout = async () => {
    return executeWithLoading(async () => {
      await AuthAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      return true;
    });
  };

  const updateProfile = async (profileData) => {
    return executeWithLoading(async () => {
      const { data } = await AuthAPI.updateProfile(profileData);
      return data;
    });
  };

  return {
    actionLoading,
    login,
    register,
    logout,
    updateProfile,
  };
};
