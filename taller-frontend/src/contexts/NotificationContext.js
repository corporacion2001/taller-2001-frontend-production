// src/contexts/NotificationContext.js
import { createContext, useContext, useCallback } from "react";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const showNotification = useCallback(
    (message, type = "success", options = {}) => {
      if (!message || typeof message !== "string") {
        console.warn("Notification message is required and must be a string");
        return;
      }
      toast(message, {
        type,
      });
    },
    []
  );

  const showSuccess = useCallback(
    (message, options = {}) => showNotification(message, "success", options),
    [showNotification]
  );

  const showError = useCallback(
    (message, options = {}) => showNotification(message, "error", options),
    [showNotification]
  );

  const showInfo = useCallback(
    (message, options = {}) => showNotification(message, "info", options),
    [showNotification]
  );

  const showWarning = useCallback(
    (message, options = {}) => showNotification(message, "warning", options),
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification debe usarse dentro de NotificationProvider"
    );
  }
  return context;
};
