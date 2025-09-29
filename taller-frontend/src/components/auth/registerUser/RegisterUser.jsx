import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useRegisterForm } from "./useRegisterForm";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { useNotification } from "../../../contexts/NotificationContext"; // Importa el contexto
import styles from "./registerUser.module.css";
import PersonalInfoSection from "./personalInfoSection/PersonalInfoSection";
import ContactInfoSection from "./contactInfoSection/ContactInfoSection";
import SecuritySection from "./securitySection/SecuritySection";
import AdditionalInfoSection from "./additionalInfoSection/AdditionalInfoSection";
import SmallSpinner from "../../ui/spinner/LoadingSpinner";
const RegisterUser = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification(); // Usa el contexto

  const {
    formData,
    errors,
    loading,
    success,
    availableRoles,
    loadingRoles,
    availableWorkshops,
    loadingWorkshops,
    handleChange,
    handleSubmit,
  } = useRegisterForm();

  const notificationShown = useRef(false);

  // Verificar permisos
  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes("Administrador")) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  // Mostrar notificación de éxito
  useEffect(() => {
    if (success && !notificationShown.current) {
      showSuccess("Usuario registrado exitosamente");
      notificationShown.current = true;
      navigate("/dashboard/user-management");
    }
  }, [success, navigate]);

  // Mostrar error general
  useEffect(() => {
    if (errors.general && !notificationShown.current) {
      showError(errors.general);
      notificationShown.current = true;
    }
  }, [errors.general]);

  return (
    <div className={styles.registerContainer}>
      <button
        onClick={() => navigate("/dashboard/user-management")}
        className={styles.backButton}
        disabled={loading}
      >
        <FiArrowLeft /> Volver
      </button>

      <h1 className={styles.title}>Registrar Nuevo Usuario</h1>

      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <PersonalInfoSection
          formData={formData}
          errors={errors}
          loading={loading}
          handleChange={handleChange}
        />

        <ContactInfoSection
          formData={formData}
          errors={errors}
          loading={loading}
          handleChange={handleChange}
        />

        <SecuritySection
          formData={formData}
          errors={errors}
          loading={loading}
          handleChange={handleChange}
        />

        <AdditionalInfoSection
          formData={formData}
          errors={errors}
          loading={loading}
          loadingRoles={loadingRoles}
          availableRoles={availableRoles}
          availableWorkshops={availableWorkshops}
          loadingWorkshops={loadingWorkshops}
          handleChange={handleChange}
        />

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate("/dashboard/user-management")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading || loadingRoles}
            aria-busy={loading}
          >
            {loading ? (
                <SmallSpinner></SmallSpinner>
            ,"Registrando..."
            ) : (
              <>
                <FiSave /> Registrar Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterUser;
