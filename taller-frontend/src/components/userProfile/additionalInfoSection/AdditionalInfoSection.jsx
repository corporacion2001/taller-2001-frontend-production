import React from "react";
import { FiCreditCard } from "react-icons/fi";
import { SectionCard } from "../../ui/sectionCard/SectionCard";
import { FormRow } from "../../ui/formRow/FormRow";
import FormField from "../formField/FormField";
import styles from "./additionalInfoSection.module.css";
import { format, parseISO, isValid } from "date-fns";

const formatDateSafe = (dateString) => {
  try {
    if (!dateString) return "No especificado";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "dd/MM/yyyy") : dateString;
  } catch (error) {
    return dateString || "No especificado";
  }
};

const AdditionalInfoSection = ({
  user,
  isEditing,
  formData,
  errors,
  onInputChange,
  isAdmin,
}) => {
  const handleIdChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // solo números
    onInputChange({
      target: {
        name: "identification",
        value: rawValue,
      },
    });
  };

  const displayDate = isEditing
    ? formData.start_date
    : formatDateSafe(user?.start_date);

  return (
    <SectionCard title="Información Adicional" icon={FiCreditCard}>
      <FormRow>
        {isAdmin && (
          <FormField
            label="Cédula"
            name="identification"
            value={
              isEditing ? formData.identification : user?.identification || ""
            }
            error={errors.identification}
            editing={isEditing}
            onChange={handleIdChange}
            required={true}
            placeholder="Ej: 123456789"
            minLength={9}
            maxLength={12}
          />
        )}

        {isAdmin && (
          <FormField
            label="Fecha de Inicio"
            name="start_date"
            type={isEditing ? "date" : "text"}
            value={displayDate}
            error={errors.start_date}
            editing={isEditing}
            onChange={onInputChange}
            disabled={!isEditing}
            placeholder={isEditing ? "Seleccione fecha" : ""}
          />
        )}

        {/* Mostrar taller solo para no administradores */}
        {!isAdmin && (
          <div className={styles.formGroup}>
            <label>Taller</label>
            <div className={styles.infoContainer}>
              {user?.workshop ? (
                <span className={styles.workshopValue}>
                  {user.workshop.name}
                </span>
              ) : (
                <span className={styles.emptyValue}>No asignado</span>
              )}
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Roles</label>
          <div className={styles.rolesContainer}>
            {user?.roles?.length > 0 ? (
              user.roles.map((role) => (
                <span key={role} className={styles.roleBadge}>
                  {role}
                </span>
              ))
            ) : (
              <span className={styles.emptyValue}>No especificado</span>
            )}
          </div>
        </div>
      </FormRow>
    </SectionCard>
  );
};

export default AdditionalInfoSection;
