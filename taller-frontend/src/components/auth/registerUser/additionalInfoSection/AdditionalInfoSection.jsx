import React, { useEffect } from "react";
import { FiCalendar } from "react-icons/fi";
import styles from "../registerUser.module.css";
import FormInput from "../../../ui/formInput/FormInput";
import ChipSelect from "../../../ui/chipSelect/ChipSelect";

const AdditionalInfoSection = ({
  formData,
  errors,
  loading,
  loadingRoles,
  availableRoles,
  availableWorkshops,
  loadingWorkshops,
  handleChange,
}) => {
  const normalizeRoles = (roles) => {
    if (!roles) return [];
    if (Array.isArray(roles)) {
      return roles.map((role) => role?.id || role);
    }
    return [];
  };

  const currentRoleIds = normalizeRoles(formData.roles);
  const safeAvailableRoles = Array.isArray(availableRoles) ? availableRoles : [];
  const adminRole = safeAvailableRoles.find((r) => r.name === "Administrador");
  const isAdminSelected = adminRole && currentRoleIds.includes(adminRole.id);

  // Si selecciona Administrador, limpiar taller automáticamente
  useEffect(() => {
    if (isAdminSelected && formData.workshop_id) {
      handleChange({
        target: {
          name: "workshop_id",
          value: "",
        },
      });
    }
  }, [isAdminSelected, formData.workshop_id, handleChange]);

  const handleRolesChange = (selectedIds) => {
    const newSelectedIds = Array.isArray(selectedIds) ? selectedIds : [];
    const wasAdminSelected = currentRoleIds.includes(adminRole?.id);
    const isNowAdminSelected = newSelectedIds.includes(adminRole?.id);

    if (isNowAdminSelected && !wasAdminSelected) {
      handleChange({
        target: {
          name: "roles",
          value: [adminRole.id],
        },
      });
      return;
    }

    if (wasAdminSelected && !isNowAdminSelected) {
      handleChange({
        target: {
          name: "roles",
          value: newSelectedIds,
        },
      });
      return;
    }

    if (wasAdminSelected && newSelectedIds.length > 1) {
      return;
    }

    handleChange({
      target: {
        name: "roles",
        value: newSelectedIds,
      },
    });
  };

  if (loadingRoles) {
    return (
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>
          <FiCalendar /> Información Adicional
        </h2>
        <div className={styles.loadingMessage}>Cargando roles...</div>
      </div>
    );
  }

  if (!loadingRoles && availableRoles.length === 0) {
    return (
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>
          <FiCalendar /> Información Adicional
        </h2>
        <div className={styles.errorMessage}>
          No se pudieron cargar los roles. Intente recargar la página.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>
        <FiCalendar /> Información Adicional
      </h2>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="roles">Roles *</label>
          <ChipSelect
            options={safeAvailableRoles.map((role) => ({
              value: role.id,
              label: role.name,
            }))}
            selected={currentRoleIds}
            onChange={handleRolesChange}
            disabled={loading}
            isAdminSelected={isAdminSelected}
            error={!!errors.roles}
            placeholder="Selecciona roles..."
          />
          {errors.roles && (
            <span className={styles.errorMessage} role="alert">
              {errors.roles}
            </span>
          )}
        </div>

        {/* Renderizar el campo de taller solo si no es administrador */}
        {!isAdminSelected && (
          <div className={styles.formGroup}>
            <label htmlFor="workshop_id">Taller *</label>
            <select
              id="workshop_id"
              name="workshop_id"
              value={formData.workshop_id || ""}
              onChange={handleChange}
              disabled={loading || loadingWorkshops}
              className={errors.workshop_id ? styles.errorInput : ""}
            >
              <option value="">Seleccione un taller...</option>
              {availableWorkshops?.map((workshop) => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.name}
                </option>
              ))}
            </select>
            {errors.workshop_id && (
              <span className={styles.errorMessage} role="alert">
                {errors.workshop_id}
              </span>
            )}
          </div>
        )}

        <FormInput
          id="start_date"
          label="Fecha de Inicio"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default AdditionalInfoSection;